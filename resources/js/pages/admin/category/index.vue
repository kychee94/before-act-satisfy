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
import { USER_STATUS } from '@/utils/statusCodes'
import TiptapEditor from '@/components/CustomTiptapEditor.vue'
import Category from '@/pages/admin/product/category.vue'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const selected = ref([])
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    categories: [Array, Object],
    statuses: [Array, Object],
})

const headers = [
  {
    title: t('Category'),
    key: 'uuid',
  },
  {
    title: t('Image'),
    key: 'image',
    sortable: false,
  },
  {
    title: t('Status'),
    key: 'status',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Action'),
    key: 'action',
    sortable: false,
  },
]

// State
const search = ref('')
const status = ref()
const category = ref()
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const isDrawerOpen = ref(false)
const refresh = ref(0)
const editItem = ref('')

const res = ref(JSON.parse(JSON.stringify(props.categories)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/category?type=getData', {
      params: {
        q: search.value || null,
        status: status?.value ?? null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data.categories

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

watch(status, () => {
  page.value = 1
  fetchData()
})

watch(refresh, fetchData, { immediate: true })

const handleRefresh = () => {
  refresh.value++ // trigger refresh
}

const addCategory = () => {
  isDrawerOpen.value = !isDrawerOpen.value
  editItem.value = ''
}

const editCategory = (uuid) => {
  isDrawerOpen.value = true
  editItem.value = uuid
}

// Computed properties
const records = computed(() => Array.isArray(res.value?.data?.data) ? res.value.data.data : [])
const totalRecords = computed(() => res.value?.totalRecords ?? 0)

// Bulk Action
const confirmBulkAction = () => {
  Swal.fire({
    text: t('Delete Selected'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('Confirm'),
    cancelButtonText: t('Cancel'),
    customClass: {
      confirmButton: "v-btn v-btn--elevated v-theme--light bg-error v-btn--density-default v-btn--size-default v-btn--variant-elevated",
      cancelButton: "v-btn v-theme--light bg-primary v-btn--density-default v-btn--size-default v-btn--variant-flat"
    }
  }).then(result => {
    if (result.isConfirmed) {
      performBulkAction();
    }
  });
};

const performBulkAction = async () => {
  const ids = selected.value.map(item => item.uuid);

  loadingStore.start();

  try {
    var response = await axios.post('/admin/category/delete', {
        uuids: ids,
    })

  } catch (error) {
    Swal.fire({
      text: error.response?.data?.message || t('Something went wrong'),
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

  fetchData()
}

// Actions
const deleteItem = async uuid => {
  loadingStore.start();

  try {
    var response = await axios.post('/admin/category/delete', {
        uuids: [uuid],
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
              <div class="flex flex-wrap gap-1 w-full">
                <div class="w-[200px] sm:w-[250px] flex-shrink-0">
                  <AppTextField
                    v-model="search"
                    :placeholder="t('Search')"
                  />
                </div>
                <div class="basis-full sm:basis-auto sm:w-[200px]">
                  <AppSelect
                    v-model="status"
                    :items="[{ key: '', value: $t('Select All') }, ...props.statuses]"
                    item-title="value"
                    item-value="key"
                    :placeholder="$t('Status')"
                  />
                </div>
              </div>
            </template>
            <template #append>
              <VBtn
                v-if="selected.length"
                prepend-icon="tabler-trash"
                color="error"
                class="ms-2"
                @click="confirmBulkAction"
              >
                {{ $t('Delete Selected') }}
              </VBtn>
              <div v-else>
                <Link
                    :href="route('admin.category.sort')"
                    class="me-2"
                  >
                  <VBtn
                    prepend-icon="tabler-sort-ascending"
                    color="success"
                  >
                    {{$t('Sort Category')}}
                  </VBtn>
                </Link>
                <VBtn
                  prepend-icon="tabler-plus"
                  @click="addCategory"
                >
                  {{$t('Add Category')}}
                </VBtn>
              </div>
            </template>
          </VCardItem>
          
          <VDivider />

          <VDataTableServer
              v-model:model-value="selected"
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              :items="records"
              :items-length="totalRecords"
              :headers="headers"
              class="text-no-wrap"
              show-select
              return-object
              item-value="uuid"
              :items-per-page-options="[5, 10, 25, 50, 100]"
              @update:options="updateOptions"
            >
            <template #item.uuid="{ item }">
              <div class="d-flex flex-column">
                <span class="text-primary font-weight-medium">{{ item.name }}</span>
                <span class="text-caption text-grey-darken-1">{{ item.email }}</span>
              </div>
            </template>
            <template #item.image="{ item }">
              <VImg 
                v-if="item.image"
                :src="item.image"
                style="margin: auto"
                width="100%"
                max-width="200"
                aspect-ratio="1"
                class="cursor-pointer rounded"
                @click="openLightbox(item.image)"
              />
            </template>
            <template #item.status="{ item }">
              <VChip
                :color="CATEGORY_STATUS.color(item.status)"
                label
                size="x-small"
              >
                {{ CATEGORY_STATUS.label(item.status) }}
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
                      @click="editCategory(item.uuid)"
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
      <Category 
        v-model:is-drawer-open="isDrawerOpen" 
        @refresh="handleRefresh"
        :edit="editItem"
        :categories="categories"
      />
    </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
