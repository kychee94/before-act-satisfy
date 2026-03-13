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
import { SLIDESHOW_STATUS } from '@/utils/statusCodes'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const showDialog = ref(false)
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    slideshows: [Array, Object]
})

const headers = [
  {
    title: '#',
    key: 'counter',
    sortable: false,
  },
  {
    title: t('Image'),
    key: 'image',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Image')+' ('+t('Mobile')+')',
    key: 'image_mobile',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Title'),
    key: 'title',
  },
  {
    title: t('Status'),
    key: 'status',
  },
  {
    title: t('Action'),
    key: 'action',
    sortable: false,
  },
]

// State
const search = ref('')
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const res = ref(JSON.parse(JSON.stringify(props.slideshows)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/setting/slideshow?type=getData', {
      params: {
        q: search.value || null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data.slideshows

  } catch (error) {
    console.error('Axios error:', error)
    console.error('Response:', error.response?.data)
  }
}

// Load data on mount
onMounted(fetchData)

// Sorting handler
const updateOptions = options => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
  itemsPerPage.value = options.itemsPerPage
  fetchData()
}

// Search
watch(search, debounce(() => {
  page.value = 1
  fetchData()
}, 500))

// Computed properties
const records = computed(() => Array.isArray(res.value?.data?.data) ? res.value.data.data : [])
const totalRecords = computed(() => res.value?.totalRecords ?? 0)

// Actions
const deleteItem = async uuid => {
  loadingStore.start();

  try {
    var response = await axios.post('/admin/setting/slideshow/delete', {
        uuid: uuid,
    })

    fetchData()
  } catch (error) {
    Swal.fire({
      text: error.response?.data || t('Something went wrong'),
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: "v-btn v-theme--light bg-info v-btn--density-default v-btn--size-default v-btn--variant-flat",
      }
    });

  } finally {
    loadingStore.stop()
  }
}

const getImageUrl = (image, mode) => {
  let parsed
  try {
    parsed = typeof image === 'string' ? JSON.parse(image) : image
  } catch (e) {
    parsed = {}
  }
  return parsed?.[mode]?.en || ''
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
    <Head :title="props.pageTitle"/>
    <DefaultLayoutWithVerticalNav>

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

      <VCard>
        <VCardTitle>{{props.pageTitle}}</VCardTitle>
        <VCardText>
          <VCardItem class="px-0 d-flex flex-wrap justify-space-between gap-4">
            <template #prepend>
              <div class="w-[200px] sm:w-[250px]">
                <AppTextField
                  v-model="search"
                  :placeholder="t('Search')"
                />
              </div>
            </template>
            <template #append>
              <VBtn
                prepend-icon="tabler-plus"
                @click="$inertia.visit('/admin/setting/slideshow/create')"
              >
                {{$t('Add Slideshow')}}
              </VBtn>
            </template>
          </VCardItem>
          
          <VDivider />

          <VDataTableServer
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              :items="records"
              :items-length="totalRecords"
              :headers="headers"
              class="text-no-wrap"
              return-object
              item-value="uuid"
              :items-per-page-options="[5, 10, 25, 50, 100]"
              @update:options="updateOptions"
            >
            <template #item.counter="{ index }">
              {{ (page - 1) * itemsPerPage + index + 1 }}
            </template>
            <template #item.image="{ item }">
              <VImg 
                v-if="item.image"
                :src="getImageUrl(item.image, 'pc')"
                style="margin: auto"
                width="50%"
                max-width="200"
                aspect-ratio="1"
                class="cursor-pointer rounded"
                @click="openLightbox(getImageUrl(item.image, 'pc'))"
              />
            </template>
            <template #item.image_mobile="{ item }">
              <VImg 
                v-if="item.image"
                :src="getImageUrl(item.image, 'mobile')"
                style="margin: auto"
                width="50%"
                max-width="200"
                aspect-ratio="1"
                class="cursor-pointer rounded"
                @click="openLightbox(getImageUrl(item.image, 'mobile'))"
              />
            </template>
            <template #item.status="{ item }">
              <VChip
                :color="SLIDESHOW_STATUS.color(item.status)"
                label
                size="x-small"
              >
                {{ SLIDESHOW_STATUS.label(item.status) }}
              </VChip>
            </template>
            <template #item.action="{ item }">
              <VTooltip :text="$t('View')" location="bottom">
                <template #activator="{ props }">
                  <VBtn
                      v-bind="props"
                      color="success"
                      class="mx-1"
                      icon
                      @click="$inertia.visit('/admin/setting/slideshow/edit/'+ item.uuid)"
                    >
                    <VIcon>tabler-eye</VIcon>
                  </VBtn>
                </template>
              </VTooltip>
              <VTooltip :text="$t('Delete')" location="bottom">
                <template #activator="{ props }">
                  <VBtn
                      v-bind="props"
                      color="error"
                      class="mx-1"
                      icon
                      @click="deleteItem(item.uuid)"
                    >
                    <VIcon>tabler-trash</VIcon>
                  </VBtn>
                </template>
              </VTooltip>
            </template>

            <template #bottom>
              <TablePagination
                v-model:page="page"
                v-model:items-per-page="itemsPerPage"
                :total-items="totalRecords"
              />
            </template>
          </VDataTableServer>
        </VCardText>
      </VCard>
    </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
