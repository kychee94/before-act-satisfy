<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'
import TiptapEditor from '@/components/CustomTiptapEditor.vue'
import Category from '@/pages/admin/product/category.vue'
import { onMounted } from 'vue'

const activeTab = ref('general')

const page = usePage()
const { languages } = usePage().props
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const loadingStore = useLoadingStore()

const showDialog = ref(false)
const modalContent = ref('')

const props = defineProps({
  pageTitle: String,
  tags: [Array, Object],
  categories: [Array, Object],
  product: Object,
  variant_items: Array,
})

const imageInput = ref()
const dropzone_images = ref(props.product.images || [])
const addQty = ref(0)
const isAddProductDrawerOpen = ref(false)

const formRef = ref()
const form = useForm({
  uuid: props.product.uuid,
  product_sku: props.product.product_sku || null,
  product_name: props.product.product_name || null,
  product_url_title: props.product.product_url_title || null,
  product_seo_title: props.product.product_seo_title || null,
  product_seo_keyword: props.product.product_seo_keyword || null,
  product_seo_description: props.product.product_seo_description || null,
  product_description: props.product.product_description || '',
  product_description2: props.product.product_description2 || '',
  product_qty: props.product.product_qty || 0,
  stock_in: addQty,
  product_price: props.product.product_price || 0,
  product_retail_price: props.product.product_retail_price || 0,
  product_discount: props.product.product_discount || 0,
  image: props.product?.product_featured_image,
  imageInput: props.product?.product_featured_image,
  dropzone_images: dropzone_images,
  product_tag: props.product.tag || null,
  product_category: props.product.category || null,
  product_featured: Boolean(props.product.product_featured) || 0,
  product_sold: 0,
  product_status: Boolean(props.product.product_status) || 0,
  variants: [],
})

const {
  local,
  changeImage,
  removeImage,
} = imageUploads(form)

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...data,
    variant_items: variantCombinations.value
  })).post(route('admin.product.update'), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
      }
  });
}

const updateDiscount = () => {
  const price = parseFloat(form.product_price)
  const retail = parseFloat(form.product_retail_price)
  if (retail && retail !== 0) {
    form.product_discount = ((1 - price / retail) * 100).toFixed(2)
  }
}

const updatePrice = () => {
  const retail = parseFloat(form.product_retail_price)
  const discount = parseFloat(form.product_discount)
  if (retail && discount != null) {
    form.product_price = (retail * (1 - discount / 100)).toFixed(2)
  }
}

onMounted(() => {
  if (!props.product.variants) return

  form.variants = props.product.variants.map(v => ({
    id: v.id,
    name: v.name,
    options: v.options.map(o => ({
      id: o.id,
      name: o.name,
      image: null,
      image_url: o.image_url,   
      preview: o.image_url,
    })),
  }))
})


// Remove option image (both preview and file) when "Remove" is clicked
const removeOptionImage = (gIndex, oIndex) => {
  const opt = form.variants[gIndex].options[oIndex]

  // clear new uploaded file
  opt.image = null

  // clear preview
  opt.preview = null

  // mark old DB image for deletion
  opt.image_url = null

  // optional: add flag for backend
  opt.remove_image = true
}

// Add variant groups and options
const addVariant = () => {
  form.variants.push({
    name: '',
    options: [
      {
        name: '',
        stock: 0,
        stock_in: 0,
        price: 0,
        image: null,
        preview: null,
      },
    ],
  })
}

// Remove variant group
const removeVariant = index => {
  form.variants.splice(index, 1)
}

// Add option within variant group
const addOption = gIndex => {
  form.variants[gIndex].options.push({
    name: '',
    stock: 0,
    stock_in: 0,
    price: 0,
    image: null,
    preview: null,
  })
}

// Remove option within variant group
const removeOption = (gIndex, oIndex) => {
  form.variants[gIndex].options.splice(oIndex, 1)
}

// Handle option image change
const onOptionImageChange = (e, gIndex, oIndex) => {
  const file = e.target.files[0]
  if (!file) return

  const opt = form.variants[gIndex].options[oIndex]
  opt.image = file
  opt.preview = URL.createObjectURL(file)
}

const selectedOptions = ref({})
const selectedVariant = ref(null)

const selectOption = (groupName, optionName) => {
  selectedOptions.value[groupName] = optionName
  findVariant()
}

const findVariant = () => {
  const values = Object.values(selectedOptions.value)

  if (values.length !== props.product.variants.length) {
    selectedVariant.value = null
    return
  }

  const match = props.variant_items.find(v =>
    v.options.every((opt, i) => opt === values[i])
  )

  selectedVariant.value = match ?? null
}

const variantCombinations = ref([])

const generateCombinations = () => {

  const groups = form.variants

  if (!groups.length) {
    variantCombinations.value = []
    return
  }

  const optionArrays = groups.map(g =>
    g.options.map(o => o.name)
  )

  if (optionArrays.some(arr => !arr.length)) {
    variantCombinations.value = []
    return
  }

  const cartesian = optionArrays.reduce(
    (a, b) => a.flatMap(d => b.map(e => [...d, e])),
    [[]]
  )

  const oldRows = [...variantCombinations.value]

  variantCombinations.value = cartesian.map((combo, index) => {

    // ✅ match by INDEX instead of option text
    const oldRow = oldRows[index]

    if (oldRow) {

      const shouldAutoUpdateSku = !oldRow.isManualSku

      return {
        ...oldRow,
        options: combo,
        sku: shouldAutoUpdateSku
          ? generateSku(form.product_sku, combo)
          : oldRow.sku,
      }
    }

    // first load from DB
    const dbRow = props.variant_items?.[index]

    if (dbRow) {
      return {
        options: combo,
        price: Number(dbRow.price),
        stock: Number(dbRow.stock),
        stock_in: 0,
        sku: dbRow.sku ?? generateSku(form.product_sku, combo),
        status: Boolean(dbRow.status),
        isManualSku: false,
      }
    }

    // brand new
    return {
      options: combo,
      price: 0,
      stock: 0,
      stock_in: 0,
      sku: generateSku(form.product_sku, combo),
      status: true,
      isManualSku: false,
    }

  })

}

watch(
  () => form.variants,
  generateCombinations,
  { deep: true, immediate: true }
)

// Generate SKU
const slugify = value => {
  return value
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')     // change space to -
    .replace(/-+/g, '-')       // remove duplicate -
}

const generateSku = (baseSku, options) => {
  if (!baseSku) return ''

  const cleanBase = slugify(baseSku)

  const cleanOptions = options.map(o => slugify(o))

  return [cleanBase, ...cleanOptions].join('-')
}

// Auto detect main SKU changes and update variant SKUs
watch(() => form.product_sku, () => {

  variantCombinations.value.forEach(row => {

    if (!row.isManualSku) {
      row.sku = generateSku(form.product_sku, row.options)
    }

  })

})

// Detect whether there is variant
const hasVariants = computed(() => {
  return variantCombinations.value.length > 0
})

// Calculate total stock based on variants or simple product
const currentStock = computed(() => {

  if (hasVariants.value) {
    return variantCombinations.value.reduce((total, row) => {
      return total + Number(row.stock || 0)
    }, 0)
  }

  return Number(form.product_qty || 0) + Number(form.stock_in || 0)
})
</script>

<template>
  <Head :title="props.pageTitle"/>
  <DefaultLayoutWithVerticalNav>
    <VForm
        ref="formRef"
        method="post"
        @submit.prevent="onSubmit(formRef, form)"
      >

        <VTabs v-model="activeTab" class="mb-6">
          <VTab value="general">{{ t('General Information') }}</VTab>
          <VTab value="variants">{{ t('Variants') }}</VTab>
        </VTabs>

        <VWindow v-model="activeTab">

          <!-- ================= STEP 1 ================= -->
          <VWindowItem value="general">
              <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
                <div class="d-flex flex-column justify-center">
                  <h4 class="text-h4 font-weight-medium">
                    {{props.pageTitle}}
                  </h4>
                </div>
              </div>

              <VRow>
                <VCol md="8" cols="12">
                  <VCard
                      :title="$t('General')"
                      class="mb-3"
                    >
                    <VCardText>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              v-model="form.product_sku"
                              :label="$t('Product SKU')"
                              :rules="[requiredValidator]"
                            />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              v-model="form.product_name"
                              :label="$t('Product Name')"
                              :rules="[requiredValidator]"
                            />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              prefix="{URL DOMAIN}/product/"
                              v-model="form.product_url_title"
                              :label="$t('Product URL Title')"
                              :placeholder="$t('Auto Generate')"
                            />
                          </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                  <VCard
                      title="SEO"
                    >
                    <VCardText>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              v-model="form.product_seo_title"
                              :label="$t('SEO Title')"
                            />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              v-model="form.product_seo_keyword"
                              :label="$t('SEO Keyword')"
                            />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              v-model="form.product_seo_description"
                              :label="$t('SEO Description')"
                            />
                          </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </VCol>

                <VCol md="4" cols="12">
                  <VCard
                      :title="$t('Properties')"
                    >
                    <VCardText>
                      <VRow>
                        <VCol cols="12">
                          <div class="d-flex align-center">
                            <VSwitch
                              v-model="form.product_status"
                              density="compact"
                              class="me-6"
                              :label="t('Status')"
                            />
                          </div>
                        </VCol>
                        <VCol cols="12">
                          <div class="d-flex align-center">
                            <VSwitch
                              v-model="form.product_featured"
                              density="compact"
                              class="me-6"
                              :label="t('Featured')"
                            />
                          </div>
                        </VCol>
                        <VCol cols="12">
                          <div class="d-flex align-center">
                            <AppSelect
                              v-model="form.product_tag"
                              :items="props.tags"
                              item-title="value"
                              item-value="key"
                              :label="$t('Tag')"
                              :placeholder="$t('Select Tag')"
                              multiple
                              clearable
                              clear-icon="tabler-x"
                            >
                              <template #selection="{ item }">
                                <VChip>
                                  <span>{{ item.value }}</span>
                                </VChip>
                              </template>
                            </AppSelect>
                          </div>
                        </VCol>
                        <VCol cols="12">
                          <VLabel class="d-flex">
                            <div class="d-flex text-sm justify-space-between w-100">
                              <div class="text-high-emphasis">
                                {{$t('Category')}}
                              </div>
                            </div>
                          </VLabel>

                          <div class="d-flex gap-x-4">
                            <AppSelect
                              v-model="form.product_category"
                              :items="props.categories"
                              item-title="category_name"
                              item-value="id"
                              :placeholder="$t('Select Category')"
                              multiple
                              clearable
                              clear-icon="tabler-x"
                            >
                              <template #selection="{ item }">
                                <VChip>
                                  <span>{{ item.title }}</span>
                                </VChip>
                              </template>
                            </AppSelect>
                            <VBtn
                              rounded
                              icon="tabler-plus"
                              variant="tonal"
                              @click="isAddProductDrawerOpen = !isAddProductDrawerOpen"
                            />
                          </div>
                        </VCol>
                        <VCol cols="12">
                          <AppTextField
                            v-model.number="form.product_price"
                            type="number"
                            step="0.01"
                            :label="$t('Price')"
                            :rules="[requiredValidator]"
                            @blur="updateDiscount"
                          />
                        </VCol>
                        <VCol cols="12">
                          <AppTextField
                            v-model.number="form.product_retail_price"
                            type="number"
                            step="0.01"
                            :label="$t('Retail Price')"
                            :rules="[requiredValidator]"
                            @blur="updateDiscount"
                          />
                        </VCol>
                        <VCol cols="12">
                          <AppTextField
                            v-model.number="form.product_discount"
                            type="number"
                            step="0.01"
                            :label="$t('Discount')"
                            suffix="%"
                            @blur="updatePrice"
                          />
                        </VCol>
                        <VCol cols="12">
                          <AppTextField
                            v-model.number="form.stock_in"
                            type="number"
                            :label="$t('Stock in')"
                            :rules="[integerValidator]"
                            :disabled="hasVariants"
                          />
                          <div class="text-base text-emphasis pb-2">
                            {{$t('Current Stock Qty')}}:
                            <span class="font-bold">{{ currentStock }}</span>
                          </div>
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12">
                  <VCard
                      :title="t('Image')"
                    >
                    <VCardText>
                      <VRow>
                        <VCol cols="12">
                          <label class="v-label mb-1 text-body-1">
                            {{$t('Featured')}}
                            <VTooltip text="200 x 500 Pixels" location="bottom">
                              <template #activator="{ props }">
                                <VIcon
                                  v-bind="props"
                                  class="ms-2"
                                  size="small"
                                  icon="mdi-information-slab-circle-outline" 
                                />
                              </template>
                            </VTooltip>
                          </label>
                          <div class="d-flex flex-wrap gap-4">
                            <VBtn
                              color="primary"
                              size="small"
                              @click="imageInput?.click()"
                            >
                              <VIcon
                                icon="tabler-cloud-upload"
                                class="d-sm-none"
                              />
                              <span class="d-none d-sm-block">{{$t('Upload')}}</span>
                            </VBtn>

                            <input
                              ref="imageInput"
                              type="file"
                              name="image"
                              accept=".jpeg,.png,.jpg,GIF"
                              hidden
                              @change="e => changeImage(e, 'image')"
                            >

                            <input
                                type="hidden"
                                name="imageInput"
                                v-model="form.image"
                                hide-details
                              >
                            <VBtn
                              v-if="local.image"
                              type="button"
                              size="small"
                              color="error"
                              variant="tonal"
                              @click="() => removeImage('image')"
                            >
                              <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                              <VIcon
                                icon="tabler-trash"
                                class="d-sm-none"
                              />
                            </VBtn>
                          </div>
                          <VAvatar
                              v-if="local.image"
                              rounded
                              size="100"
                              class="mt-3"
                              :image="local.image"
                            />
                        </VCol>
                        <VCol cols="12">
                          <DropZone 
                            v-model:files="form.dropzone_images"
                            :images="dropzone_images"
                            type="product"
                          />
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
              <VRow>
                <VCol cols="12">
                  <VCard
                      :title="t('Description')"
                    >
                    <VCardText>
                      <VCol cols="12">
                        <label class="v-label mb-1 text-body-1">
                          {{$t('Description')}}
                        </label>
                        <TiptapEditor v-model="form.product_description"/>
                      </VCol>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VWindowItem>

            <!-- ================= STEP 2 ================= -->
            <VWindowItem value="variants">
              <VRow>
                <VCol cols="12">

                  <VCard :title="t('Variants')">
                    <VCardText>

                      <div v-if="!form.variants.length" class="text-medium-emphasis mb-4">
                        {{ t('No variants added. Click "Add Variant" to start.') }}
                      </div>

                      <div
                        v-for="(group, gIndex) in form.variants"
                        :key="gIndex"
                        class="variant-group pa-3 border"
                      >

                        <!-- HEADER -->
                        <div class="d-flex align-center mb-3">
                          <AppTextField
                            v-model="group.name"
                            :label="t('Variant Name')"
                            style="max-width:260px"
                          />

                          <VSpacer />

                          <VBtn
                            size="small"
                            color="error"
                            variant="tonal"
                            @click="removeVariant(gIndex)"
                          >
                            {{ t('Remove') }}
                          </VBtn>
                        </div>

                        <!-- COLUMN LABEL -->
                        <div class="grid grid-cols-[1fr_100px_40px] gap-3 mb-2 text-body-2 font-weight-medium text-medium-emphasis">
                          <div>{{ t('Option') }}</div>
                          <div>{{ t('Image') }}</div>
                          <div></div>
                        </div>

                        <!-- OPTIONS -->
                        <div
                          v-for="(opt, oIndex) in group.options"
                          :key="oIndex"
                          class="grid grid-cols-[1fr_100px_40px] gap-3 items-center mb-2"                  
                        >
                          <AppTextField v-model="opt.name" />
                          <!-- IMAGE -->
                          <div class="flex flex-col items-center">
                            <div
                              class="w-[72px] h-[72px] border border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
                              @click="$refs[`optImg${gIndex}${oIndex}`][0].click()"
                            >
                              <img v-if="opt.preview" :src="opt.preview" class="w-full h-full object-cover" />

                              <div v-else class="flex flex-col items-center text-xs text-medium-emphasis">
                                <VIcon icon="tabler-camera-plus" size="16" />
                                <span>{{ t('Upload') }}</span>
                              </div>
                            </div>

                            <VBtn
                              v-if="opt.preview"
                              size="x-small"
                              color="error"
                              variant="text"
                              class="mt-1"
                              @click="removeOptionImage(gIndex, oIndex)"
                            >
                              {{t('Remove')}}
                            </VBtn>

                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              :ref="`optImg${gIndex}${oIndex}`"
                              @change="e => onOptionImageChange(e, gIndex, oIndex)"
                            />
                          </div>

                          <VBtn
                            icon="tabler-x"
                            variant="text"
                            color="error"
                            @click="removeOption(gIndex, oIndex)"
                          />
                        </div>

                        <VBtn
                          type="button"
                          size="small"
                          variant="outlined"
                          prepend-icon="tabler-plus"
                          @click="addOption(gIndex)"
                        >
                          {{ t('Add Option') }}
                        </VBtn>

                      </div>

                      <VBtn
                        type="button"
                        block
                        color="primary"
                        variant="tonal"
                        prepend-icon="tabler-plus"
                        class="mt-4"
                        @click="addVariant"
                      >
                        {{ t('Add Variant') }}
                      </VBtn>

                    </VCardText>
                  </VCard>
                </VCol>

                <VCol cols="12" v-if="variantCombinations.length">
                  <VCard :title="t('Variant Pricing & Stock')">
                    <VCardText>
                      <div class="w-full overflow-x-auto">

                      <div
                        class="grid gap-3 mb-2 text-body-2 font-weight-medium text-medium-emphasis "                    
                        :style="{
                          gridTemplateColumns: `
                            repeat(${form.variants.length}, minmax(130px, 1fr))
                            minmax(150px, 1fr)
                            minmax(120px, 1fr)
                            minmax(120px, 1fr)
                            100px
                          `
                        }"
                      >
                        <div v-for="g in form.variants">{{ g.name }}</div>
                        <div>{{ t('SKU') }}</div>
                        <div>{{ t('Price') }}</div>
                        <div>{{ t('Stock in') }}</div>
                        <div>{{ t('Status') }}</div>
                        <div></div>
                      </div>

                      <div
                        v-for="(row, index) in variantCombinations"
                        :key="index"
                        class="grid gap-4 items-start py-3"
                        :style="{
                          gridTemplateColumns: `
                            repeat(${form.variants.length}, minmax(120px, 1fr))
                            minmax(150px, 1fr)
                            minmax(120px, 1fr)
                            minmax(120px, 1fr)
                            90px
                          `
                        }"
                      >
                        <div v-for="opt in row.options">{{ opt }}</div>

                        <!-- SKU -->
                        <AppTextField
                          v-model="row.sku"
                          :placeholder="t('SKU')"
                          @input="row.isManualSku = true"
                        />

                        <!-- PRICE -->
                        <AppTextField
                          v-model.number="row.price"
                          type="number"
                        />

                        <!-- STOCK IN -->
                        <div class="d-flex flex-column" style="min-width:120px;">

                          <AppTextField
                            v-model.number="row.stock_in"
                            type="number"
                            density="comfortable"
                            hide-details
                          />

                          <span class="mt-2 text-grey-darken-1" style="font-size: 11px;">
                            {{$t('Current Stock Qty')}}:
                            <strong
                              :class="{
                                'text-success': (row.stock + (row.stock_in || 0)) > 0,
                                'text-error': (row.stock + (row.stock_in || 0)) <= 0
                              }"
                            >
                              {{ Number(row.stock) + Number(row.stock_in || 0) }}
                            </strong>
                          </span>

                        </div>

                        <!-- Status -->
                        <VSwitch
                          v-model="row.status"
                          inset
                          color="success"
                          hide-details
                        />
                      </div>

                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VWindowItem>
        </VWindow>

        <div class="d-flex justify-end gap-3 mt-6">
          <VBtn
            type="button"
            color="primary"
            variant="text"
            class="mt-4"
            @click="$inertia.visit('/admin/product')"
            >
            <VIcon start>
              mdi-arrow-left
            </VIcon>
            {{$t('Back')}}
          </VBtn>

          <VBtn
            type="submit"
            color="primary"
            :class="['mt-4', { 'opacity-25': form.processing }]"
            :disabled="form.processing"
            >
            {{$t('Submit')}}
          </VBtn>

        </div>
      </VForm>
    <Category v-model:is-drawer-open="isAddProductDrawerOpen"/>
  </DefaultLayoutWithVerticalNav>
</template>

<style>
  .v-text-field__prefix {
    opacity: 1;
  }
</style>