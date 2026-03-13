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
const positions = ref([
                        {
                          'key': 'bottom-right',
                          'value': t('Bottom Right')
                        },
                        {
                          'key': 'bottom-left',
                          'value': t('Bottom Left')
                        },
                        {
                          'key': 'top-right',
                          'value': t('Top Right')
                        },
                        {
                          'key': 'top-left',
                          'value': t('Top Left')
                        }
                      ])

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    designInfo: [Array, Object],
    positions: [Array, Object],
})

const headers = computed(() => [
  {
    title: t('Name'),
    key: 'name',
  },
  {
    title: t('Icon'),
    key: 'image',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Offset'),
    key: 'offset',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Position'),
    key: 'position',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Link'),
    key: 'link',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Status'),
    key: 'enable',
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

const res = Array.isArray(props.designInfo) ? ref(JSON.parse(JSON.stringify(props.designInfo))) : []

// Computed properties
const records = ref(Array.isArray(res.value) ? res.value.map(item => ({
        ...item,
        uuid: crypto.randomUUID(),
        imageUrl: item.image
      })) : [])

// Add new row
const addFab = async () => {
  records.value.push({
    uuid: crypto.randomUUID(),
    name: '',
    image: '',
    imageUrl: '',
    offsetX: '',
    offsetY: '',
    position: '',
    link: '',
    enable: '',
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
const saveFab = async () => {
  loadingStore.start();

  try {
    const formData = new FormData()
    
    // Append each record with its data
    records.value.forEach((record, index) => {
      formData.append(`records[${index}][name]`, record.name || '')
      formData.append(`records[${index}][offsetX]`, record.offsetX || '')
      formData.append(`records[${index}][offsetY]`, record.offsetY || '')
      formData.append(`records[${index}][position]`, record.position || 0)
      formData.append(`records[${index}][link]`, record.link || '')
      formData.append(`records[${index}][enable]`, record.enable || '')
      formData.append(`records[${index}][imageUrl]`, record.imageUrl)

      // Append the actual file if it exists
      if (record.image instanceof File) {
        formData.append(`records[${index}][image]`, record.image)
      }
    })

    var response = await axios.post('/admin/setting/design/update/fab', formData, {
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
              @click="addFab"
            >
              {{$t('Add')}}
            </VBtn>
            <VBtn
              prepend-icon="tabler-device-floppy"
              color="success"
              @click="saveFab"
            >
              {{$t('Save')}}
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
                v-for="(fab, index) in records"
                :key="fab.uuid"
                >
                <td>
                  <AppTextField
                    v-model="fab.name"
                    variant="outlined"
                    density="compact"
                    width="100"
                  />
                </td>
                <td class="text-center">
                  <VImg
                    v-if="fab.imageUrl"
                    :src="fab.imageUrl"
                    class="cursor-pointer rounded m-auto"
                    width="100"
                    height="100"
                    @click="openLightbox(fab.imageUrl)"
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
                    v-model="fab.offsetX"
                    label="X:"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="centered-input mb-3"
                    width="120"
                  />
                  <AppTextField
                    v-model="fab.offsetY"
                    label="Y:"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="centered-input mb-3"
                    width="120"
                  />
                </td>
                <td>
                  <AppSelect
                    v-model="fab.position"
                    :items="positions"
                    item-title="value"
                    item-value="key"
                    :placeholder="$t('Position')"
                  />
                </td>
                <td>
                  <AppTextField
                    v-model="fab.link"
                    variant="outlined"
                    density="compact"
                    class="mt-3"
                    width="200"
                  />
                </td>
                <td class="text-center">
                  <VSwitch
                    v-model="fab.enable"
                    density="compact"
                    class="ms-6"
                  />
                </td>
                <td>
                  <VBtn icon="mdi-delete" color="error" variant="text" @click="deleteItem(fab.uuid)" />
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
