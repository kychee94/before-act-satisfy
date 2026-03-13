<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const selected = ref([])
const modalContent = ref('')
const imageInputs = ref([])

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    chests: [Array, Object],
    types: [Array, Object],
})

const headers = computed(() => [
  {
    title: t('Name'),
    key: 'uuid',
  },
  {
    title: t('Image'),
    key: 'image',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Frequency'),
    key: 'frequency',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Type'),
    key: 'type',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Action'),
    key: 'action',
    sortable: false,
  }
]);

// State
const search = ref('')
const itemsPerPage = ref(20)
const page = ref(1)
const refresh = ref(0)

const res = ref(JSON.parse(JSON.stringify(props.chests)))

// Computed properties
const records = ref(Array.isArray(res.value?.data?.data) ? res.value.data.data : [])
const totalRecords = computed(() => res.value?.totalRecords ?? 0)

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/chest?type=getData', {
      params: {
        q: search.value || null,
        status: status?.value ?? null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
      },
    })

    res.value = response.data.chests

  } catch (error) {
    console.error('Axios error:', error)
    console.error('Response:', error.response?.data)
  }
}

// Load data on mount
onMounted(fetchData)

// Add new row
const addChest = async () => {
  records.value.push({
    uuid: crypto.randomUUID(),
    name: '',
    image: '',
    imageUrl: '',
    type: '',
    point: '',
    frequency: 0,
    percentage: 0
  })

  await nextTick() // wait for DOM render
}

// Image uploads
const setImageInputRef = (el, index) => {
  if (el) imageInputs.value[index] = el
}

const triggerUpload = (index) => {
  imageInputs.value[index]?.click()
}

// Handle file selection + preview
const onImageSelect = (event, index) => {
  const file = event.target.files[0]
  if (!file) return

  // Update image in row
  records.value[index].image = file
  records.value[index].imageUrl = URL.createObjectURL(file)
}

// Edit or delete as before
const deleteItem = uuid => {
  records.value = records.value.filter(r => r.uuid !== uuid)
}

// Save to database
const saveChest = async () => {
  loadingStore.start();

  try {
    const formData = new FormData()
    
    // Append each record with its data
    records.value.forEach((record, index) => {
      formData.append(`records[${index}][uuid]`, record.uuid || '')
      formData.append(`records[${index}][name]`, record.name || '')
      formData.append(`records[${index}][type]`, record.type || '')
      formData.append(`records[${index}][point]`, record.point || '')
      formData.append(`records[${index}][frequency]`, record.frequency || 0)
      formData.append(`records[${index}][percentage]`, record.percentage || 0)

      // Append the actual file if it exists
      if (record.image instanceof File) {
        formData.append(`records[${index}][image]`, record.image)
      }
    })

    var response = await axios.post('/admin/chest/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    Swal.fire({
      text: t('Success'),
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: "v-btn v-theme--light bg-info v-btn--density-default v-btn--size-default v-btn--variant-flat",
      }
    });

    fetchData()

    // keep preview but remove actual file to prevent resubmission
    records.value.forEach(record => {
      if (record.image instanceof File) {
        // save the preview url first
        record.imageUrl = record.imageUrl || URL.createObjectURL(record.image)
        record.image = null  // remove File
      }
    })
  } catch (error) {
    Swal.fire({
      html: error.response?.data?.message || t('Something went wrong'),
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: "v-btn v-theme--light bg-info v-btn--density-default v-btn--size-default v-btn--variant-flat",
      }
    });
  } finally {
    loadingStore.stop()
    selected.value = []
  }
}

// Lightbox state
const lightboxImage = ref('')
const lightbox = ref(false)

const openLightbox = (src) => {
  lightboxImage.value = src
  lightbox.value = true
}

</script>

<template>
    <VDialog v-model="lightbox" max-width="800">
      <VCard class="pa-0 position-relative">
        <!-- The image -->
        <VImg :src="lightboxImage" class="w-100" aspect-ratio="16/9" />

        <!-- Close icon floating absolutely -->
        <VBtn
          icon="mdi-close-circle-outline"
          size="large"
          variant="text"
          class="position-absolute top-0 end-0 ma-2"
          @click="lightbox = false"
        />
      </VCard>
    </VDialog>

    <Head :title="props.pageTitle"/>
    <VCard>
      <VCardText>
        <VCardItem class="px-0 d-flex flex-wrap justify-space-between gap-4">
          <template #append>
            <VBtn
              prepend-icon="tabler-plus"
              class="me-2"
              @click="addChest"
            >
              {{$t('Add %s',{'name': $t('Chest')} )}}
            </VBtn>
            <VBtn
              prepend-icon="tabler-device-floppy"
              color="success"
              @click="saveChest"
            >
              {{$t('Save %s',{'name': $t('Chest')} )}}
            </VBtn>
          </template>
        </VCardItem>
        
        <VDivider />

          <VTable 
              fixed-header
              class="text-no-wrap"
            >
            <thead>
              <tr>
                <th
                  v-for="item in headers"
                  :key="item.key"
                  :class="item.align === 'center' ? 'text-center' : ''"
                  >
                  {{item.title}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(chest, index) in records"
                :key="chest.uuid"
                >
                <td>
                  <AppTextField
                    v-model="chest.name"
                    variant="outlined"
                    density="compact"
                    width="100"
                  />
                </td>
                <td class="text-center">
                  <VImg
                    v-if="chest.imageUrl"
                    :src="chest.imageUrl"
                    class="cursor-pointer rounded m-auto"
                    width="100"
                    height="100"
                    @click="openLightbox(chest.imageUrl)"
                  />
                  <input
                    type="file"
                    :ref="el => setImageInputRef(el, index)"
                    class="hidden"
                    accept="image/*"
                    @change="onImageSelect($event, index)"
                  />
                  <VBtn
                    prepend-icon="tabler-upload"
                    class="my-2"
                    size="small"
                    variant="outlined"
                    @click="triggerUpload(index)"
                  >
                    {{$t('Upload')}}
                  </VBtn>
                </td>
                <td>
                  <AppTextField
                    v-model="chest.frequency"
                    :label="t('Frequency')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    min="0"
                    class="centered-input mb-3"
                  />
                  <AppTextField
                    v-model="chest.percentage"
                    :label="t('Percentage')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    min="0"
                    max="100"
                    suffix="%"
                    step="0.01"
                    class="centered-input mb-3"
                  />
                </td>
                <td>
                  <AppSelect
                    v-model="chest.type"
                    :items="props.types"
                    item-title="value"
                    item-value="key"
                    :placeholder="$t('Type')"
                  />

                  <AppTextField
                    v-if="chest.type == 'POINT'"
                    v-model="chest.point"
                    variant="outlined"
                    :label="t('Points')"
                    density="compact"
                    class="mt-3"
                  />
                </td>
                <td>
                  <VBtn icon="mdi-delete" color="error" variant="text" @click="deleteItem(chest.uuid)" />
                </td>
              </tr>
            </tbody>
          </VTable>
      </VCardText>
    </VCard>
</template>

<style scoped lang="scss">
@use "@core-scss/template/pages/misc.scss";

.centered-input :deep(input) {
  text-align: center;
}
</style>
