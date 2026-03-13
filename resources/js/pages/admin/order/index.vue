<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm, router} from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import CustomDateRange from '@/components/CustomDateRange.vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'
import { ORDER_STATUS } from '@/utils/statusCodes'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const selected = ref([])
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    orders: [Array, Object],
    statuses: [Array, Object],
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
    title: t('Date'),
    key: 'inserted_date',
  },
  {
    title: t('Name')+' ('+t('Phone')+')',
    key: 'name',
  },
  {
    title: t('Amount'),
    key: 'amount',
  },
  {
    title: t('Payment Method'),
    key: 'payment_method',
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
const startDate = ref()
const endDate = ref()
const sortBy = ref()
const orderBy = ref()
const dateRange = ref([])
const datePicker = ref()

const res = ref(JSON.parse(JSON.stringify(props.orders)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/order?type=getData', {
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

    res.value = response.data.orders

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
                <div class="basis-full sm:basis-auto sm:w-[200px]">
                  <AppSelect
                    v-model="status"
                    :items="[{ key: '', value: $t('Select All') }, ...props.statuses]"
                    item-title="value"
                    item-value="key"
                    :placeholder="$t('Status')"
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
              item-value="uuid"
              :items-per-page-options="[5, 10, 25, 50, 100]"
              @update:options="updateOptions"
            >
            <template #item.counter="{ index }">
              {{ (page - 1) * itemsPerPage + index + 1 }}
            </template>
            <template #item.name="{ item }">
              <div class="d-flex flex-column">
                <span class="text-primary">{{ item.name }}</span>
                <span>{{ item.phone }}</span>
              </div>
            </template>
            <template #item.amount="{ item }">
              <div class="d-flex flex-column">
                <span class="text-center">{{ $formatNumber(item.amount) }}</span>
              </div>
            </template>
            <template #item.payment_method="{ item }">
              <div class="d-flex flex-column">
                <span class="text-center text-uppercase">{{ item.payment_method }}</span>
              </div>
            </template>
            <template #item.status="{ item }">
              <VChip
                :color="ORDER_STATUS.color(item.status)"
                label
                size="x-small"
              >
                {{ ORDER_STATUS.label(item.status) }}
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
                      @click="$inertia.visit('/admin/order/edit/'+ item.uuid)"
                    >
                    <VIcon>tabler-eye</VIcon>
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
