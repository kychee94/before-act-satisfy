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
    records: [Array, Object],
})

const headers = [
  {
    title: '#',
    key: 'counter',
    sortable: false,
  },
  {
    title: t('Ref No'),
    key: 'ref_no',
  },
  {
    title: t('Username'),
    key: 'username',
  },
  {
    title: t('Result'),
    key: 'result',
  },
  {
    title: t('Remark'),
    key: 'remark',
  },
  {
    title: t('Datetime'),
    key: 'inserted_date',
  },
]

// State
const search = ref('')
const status = ref()
const category = ref()
const itemsPerPage = ref(20)
const page = ref(1)
const startDate = ref()
const endDate = ref()
const sortBy = ref()
const orderBy = ref()
const dateRange = ref([])
const datePicker = ref()

const res = ref(JSON.parse(JSON.stringify(props.records)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/transaction/checkin?type=getData', {
      params: {
        q: search.value || null,
        status: status?.value ?? null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
        startDate: startDate.value || null,
        endDate: endDate.value || null,
      },
    })

    res.value = response.data.records

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

watch([() => startDate.value, () => endDate.value], ([newStart, newEnd]) => {
  // if (newStart && newEnd) {
    page.value = 1
    fetchData()
  // }
})

// Computed properties
const records = computed(() => Array.isArray(res.value?.data?.data) ? res.value.data.data : [])
const totalRecords = computed(() => res.value?.totalRecords ?? 0)

const handleDateRangeChange = (data) => {
  startDate.value = data.startDate;
  endDate.value = data.endDate;
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
                <div class="basis-full sm:basis-auto sm:w-[300px]">
                  <CustomDateRange
                    v-model="dateRange"
                    ref="datePicker"
                    @change="handleDateRangeChange"
                    label="Select Date Range"
                  />
                </div>
              </div>
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
              :items-per-page-options="[5, 10, 25, 50, 100]"
              @update:options="updateOptions"
            >
            <template #item.counter="{ index }">
              {{ (page - 1) * itemsPerPage + index + 1 }}
            </template>
            <template #item.username="{ item }">
              <div class="d-flex flex-column">
                <span class="text-primary font-weight-medium">{{ item.username }}</span>
              </div>
            </template>
            <template #item.result="{ item }">
              <div class="d-flex flex-column">
                <span class="text-uppercase">{{ item.result }}</span>
              </div>
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
