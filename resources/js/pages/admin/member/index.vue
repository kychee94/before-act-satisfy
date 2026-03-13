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
import { MEMBER_STATUS } from '@/utils/statusCodes'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const selected = ref([])
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    members: [Array, Object],
    statuses: [Array, Object]
})

const headers = [
  {
    title: `${t('Member')} (${t('Phone')})`,
    key: 'username',
  },
  {
    title: t('Registration Date'),
    key: 'inserted_date',
  },
  {
    title: t('Agent'),
    key: 'agent',
  },
  {
    title: t('Last Login'),
    key: 'last_login',
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
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const res = ref(JSON.parse(JSON.stringify(props.members)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/member?type=getData', {
      params: {
        q: search.value || null,
        status: status?.value ?? null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data.members

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
    var response = await axios.post('/admin/member/delete', {
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
    var response = await axios.post('/admin/member/delete', {
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
                color="error"
                class="ms-2"
                @click="confirmBulkAction"
              >
                {{ $t('Delete Selected') }}
              </VBtn>
              <VBtn
                v-else
                prepend-icon="tabler-plus"
                @click="$inertia.visit('/admin/member/create')"
              >
                {{$t('Add Member')}}
              </VBtn>
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
            <template #item.username="{ item }">
              <div class="d-flex flex-column">
                <span class="text-primary font-weight-medium">{{ item.username }}</span>
                <span class="text-caption text-grey-darken-1">{{ item.phone }}</span>
              </div>
            </template>
            <template #item.agent="{ item }">
              <div class="d-flex flex-column">
                <span class="font-weight-medium">{{ item.agent ?? 'N/A' }}</span>
              </div>
            </template>
            <template #item.status="{ item }">
              <VChip
                :color="MEMBER_STATUS.color(item.status)"
                label
                size="x-small"
              >
                {{ MEMBER_STATUS.label(item.status) }}
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
                      @click="$inertia.visit('/admin/member/edit/'+ item.uuid)"
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
