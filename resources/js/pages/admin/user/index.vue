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

const { t } = useI18n()

const loadingStore = useLoadingStore()

const selected = ref([])
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    pages: [Array, Object],
    roles: [Array, Object],
    statuses: [Array, Object],
})

const headers = [
  {
    title: t('Admin'),
    key: 'uuid',
  },
  {
    title: t('Role'),
    key: 'role',
  },
  {
    title: t('Login Code'),
    key: 'code',
  },
  {
    title: t('Last Login'),
    key: 'last_login',
  },
  {
    title: t('Status'),
    key: 'status',
  },
  {
    title: t('Joined Date'),
    key: 'joined_date',
  },
  {
    title: t('Action'),
    key: 'action',
    sortable: false,
  },
]

// State
const search = ref('')
const role = ref()
const status = ref()
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const res = ref(JSON.parse(JSON.stringify(props.pages)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/user?type=getData', {
      params: {
        q: search.value || null,
        role: role?.value ?? null,
        status: status?.value ?? null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data.pages

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

watch(role, () => {
  page.value = 1
  fetchData()
})

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
    var response = await axios.post('/admin/user/delete', {
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
    var response = await axios.post('/admin/user/delete', {
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

</script>

<template>
    <Head :title="props.pageTitle"/>
    <DefaultLayoutWithVerticalNav>
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
                    v-model="role"
                    :items="[{ id: '', name: $t('Select All') }, ...props.roles]"
                    item-title="name"
                    item-value="id"
                    :placeholder="$t('Role')"
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
                @click="$inertia.visit('/admin/user/create')"
              >
                {{$t('Add Admin')}}
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
            <template #item.uuid="{ item }">
              <div class="d-flex flex-column">
                <span class="text-primary font-weight-medium">{{ item.name }}</span>
                <span class="text-caption text-grey-darken-1">{{ item.email }}</span>
              </div>
            </template>
            <template #item.role="{ item }">
              <VChip
                color="default"
                label
                size="x-small"
              >
                {{ item.role_name }}
              </VChip>
            </template>
            <template #item.status="{ item }">
              <VChip
                :color="USER_STATUS.color(item.status)"
                label
                size="x-small"
              >
                {{ USER_STATUS.label(item.status) }}
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
                      @click="$inertia.visit('/admin/user/edit/'+ item.uuid)"
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
