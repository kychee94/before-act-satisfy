<script setup>
import { usePage, Link, useForm  } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { useLoadingStore } from '@layouts/stores/loading'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import TiptapEditor from '@/components/CustomTiptapEditor.vue'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  edit: {
    type: String,
  },
})

const emit = defineEmits(['update:isDrawerOpen', 'refresh'])

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}

const loadingStore = useLoadingStore()

const refVForm = ref()
const imageInput = ref()
const form = useForm({
  uuid: '',
  category_name: '',
  category_url_title: '',
  category_seo_title: '',
  category_seo_keyword: '',
  category_seo_description: '',
  category_description: '',
  category_parent: '',
  image: imageInput,
  imageInput: imageInput,
  category_status: 0
})
const href = ref()

watch(props, (val) => {
  if(val.isDrawerOpen !== false && val.edit != ''){
    getData()
    href.value = route('admin.category.update')
  }else{
    refVForm.value?.reset()
    form.category_description = ''
    removeImage('image')
    href.value = route('admin.category.store')
  }
})

const res = ref()
const getData = async () => {
  try {
    var response = await axios.get('/admin/category/info/'+props.edit)

    form.uuid = response.data?.result?.uuid
    form.category_name = response.data?.result?.category_name
    form.category_url_title = response.data?.result?.category_url_title
    form.category_seo_title = response.data?.result?.category_seo_title
    form.category_seo_keyword = response.data?.result?.category_seo_keyword
    form.category_seo_description = response.data?.result?.category_seo_description
    form.category_description = response.data?.result?.category_description
    form.category_parent = response.data?.result?.category_parent
    form.category_status = Boolean(response.data?.result?.category_status) || 0
    form.image = response.data?.result?.category_image
    form.imageInput = response.data?.result?.category_image

    // initialize image from imageUoloads local
    local.value = structuredClone(JSON.parse(JSON.stringify(form)))
  } catch (error) {
    console.error('Axios error:', error)
    console.error('Response:', error.response?.data)
  }
}

const {
  local,
  changeImage,
  removeImage,
} = imageUploads(form)

const resetForm = () => {
  emit('update:isDrawerOpen', false)
  refVForm.value?.reset()
}

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(href.value, {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
        resetForm();

        // Emit refresh event
        emit('refresh', true)
      }
  });
}

</script>

<template>
  <VNavigationDrawer
    :model-value="props.isDrawerOpen"
    temporary
    location="end"
    width="370"
    border="none"
    class="category-navigation-drawer scrollable-content"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Header -->
    <AppDrawerHeaderSection
      :title="props.edit != '' ? $t('Edit Category') : $t('Add Category')"
      @cancel="$emit('update:isDrawerOpen', false)"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit(refVForm, form)"
          >
            <VRow>
              <VCol cols="12">
                <VSwitch
                  v-model="form.category_status"
                  density="compact"
                  class="me-6"
                  :label="$t('Status')"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.category_name"
                  :label="$t('Name')"
                  :rules="[requiredValidator]"
                  :placeholder="$t('Name')"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  prefix="{URL DOMAIN}/category/"
                  v-model="form.category_url_title"
                  :label="$t('Slug')"
                  :placeholder="$t('Auto Generate')"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.category_seo_title"
                  :label="$t('SEO Title')"
                  :placeholder="$t('SEO Title')"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.category_seo_keyword"
                  :label="$t('SEO Keyword')"
                  :placeholder="$t('SEO Keyword')"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.category_seo_description"
                  :label="$t('SEO Description')"
                  :placeholder="$t('SEO Description')"
                />
              </VCol>

              <VCol cols="12">
                <label class="v-label mb-1 text-body-1">
                  {{$t('Image')}}
                  <VTooltip text="200 x 200 Pixels" location="bottom">
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
                <p class="text-body-2 text-high-emphasis mb-1">
                  {{$t('Description')}}
                </p>
                <TiptapEditor v-model="form.category_description"/>
              </VCol>

              <VCol cols="12">
                <div class="d-flex justify-end">
                  <VBtn
                      type="submit"
                      color="primary"
                    >
                    {{props.edit ? $t('Save') : $t('Add')}}
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<style lang="scss">
.category-navigation-drawer {
  .ProseMirror {
    min-block-size: 9vh !important;

    p {
      margin-block-end: 0;
    }

    p.is-editor-empty:first-child::before {
      block-size: 0;
      color: #adb5bd;
      content: attr(data-placeholder);
      float: inline-start;
      pointer-events: none;
    }

    &-focused {
      outline: none;
    }

    ul,
    ol {
      padding-inline: 1.125rem;
    }
  }

  .is-active {
    border-color: rgba(var(--v-theme-primary), var(--v-border-opacity)) !important;
    background-color: rgba(var(--v-theme-primary), var(--v-activated-opacity));
    color: rgb(var(--v-theme-primary));
  }
}
</style>
