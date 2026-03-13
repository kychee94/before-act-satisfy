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
    title: t('Username'),
    key: 'username',
  },
  {
    title: t('Count'),
    key: 'checkin_count',
  },
  {
    title: t('Dates'),
    key: 'checkin_dates',
  },
]

// State
const months = computed(() => [
    { value: 1, label: t('January') },
    { value: 2, label: t('February') },
    { value: 3, label: t('March') },
    { value: 4, label: t('April') },
    { value: 5, label: t('May') },
    { value: 6, label: t('June') },
    { value: 7, label: t('July') },
    { value: 8, label: t('August') },
    { value: 9, label: t('September') },
    { value: 10, label: t('October') },
    { value: 11, label: t('November') },
    { value: 12, label: t('December') },
  ])
const currentYear = ref(new Date().getFullYear())
const years = [currentYear.value -2, currentYear.value -1, currentYear.value ]
const search = ref('')
const status = ref()
const category = ref()
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const month = ref(new Date().getMonth() + 1)
const year = ref(currentYear)

const res = ref(JSON.parse(JSON.stringify(props.records)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/checkin/member?type=getData', {
      params: {
        q: search.value || null,
        month: month.value || null,
        year: year.value || null,
        status: status?.value ?? null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
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
watch([search, month, year], debounce(() => {
  page.value = 1
  fetchData()
}, 500))

// Computed properties
const records = computed(() => Array.isArray(res.value?.data?.data) ? res.value.data.data : [])
const totalRecords = computed(() => res.value?.totalRecords ?? 0)

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
                <div class="w-[200px] sm:w-[250px] flex-shrink-0">
                  <AppSelect
                    v-model="month"
                    :items="months"
                    item-title="label"
                    item-value="value"
                    :placeholder="$t('Month')"
                  />
                </div>
                <div class="w-[200px] sm:w-[250px] flex-shrink-0">
                  <AppSelect
                    v-model="year"
                    :items="years"
                    item-title="value"
                    item-value="key"
                    :placeholder="$t('Year')"
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
