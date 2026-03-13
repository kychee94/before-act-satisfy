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

const { t } = useI18n()

const loadingStore = useLoadingStore()

const showDialog = ref(false)
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    ips: [Array, Object]
})

const headers = [
  {
    title: 'IP',
    key: 'fail_ipaddress',
  },
  {
    title: t('Failed Count'),
    key: 'fail_count',
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

const res = ref(JSON.parse(JSON.stringify(props.ips)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/setting/ip_blocked?type=getData', {
      params: {
        q: search.value || null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data.ips

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
const unblockItem = async ip => {
  loadingStore.start();

  try {
    var response = await axios.post('/admin/setting/ip_blocked/unblock', {
        ip: ip,
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

const viewItem = async ip => {
  try {
    const response = await axios.get('/admin/setting/ip_blocked/info/'+ip)
    modalContent.value = response.data.result
    showDialog.value = true
  } catch (error) {
    console.error('Error fetching info:', error)
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
              <div class="w-[200px] sm:w-[250px]">
                <AppTextField
                  v-model="search"
                  :placeholder="t('Search')"
                />
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
            <template #item.fail_count="{ item }">
              <VChip
                label
                size="x-small"
              >
                {{ $t('Time Left:')+' '+item.fail_count }}
              </VChip>
            </template>
            <template #item.status="{ item }">
              <VChip
                :color="item.fail_count > 0 ? 'primary' : 'error'"
                label
                size="x-small"
              >
                {{ item.fail_count > 0 ? $t('Opened') : $t('Blocked') }}
              </VChip>
            </template>
            <template #item.action="{ item }">
              <VTooltip 
                v-if="item.fail_count > 0"
                :text="$t('View')" 
                location="bottom"
                >
                <template #activator="{ props }">
                  <VBtn
                      v-bind="props"
                      color="success"
                      class="mx-1"
                      icon
                      @click="viewItem(item.fail_ipaddress)"
                    >
                    <VIcon>tabler-eye</VIcon>
                  </VBtn>
                </template>
              </VTooltip>
              <VTooltip 
                v-if="item.fail_count <= 0"
                :text="$t('Unblock')" 
                location="bottom"
                >
                <template #activator="{ props }">
                  <VBtn
                      v-bind="props"
                      color="error"
                      class="mx-1"
                      icon
                      @click="unblockItem(item.fail_ipaddress)"
                    >
                    <VIcon>mdi-lock-open-variant-outline</VIcon>
                  </VBtn>
                </template>
              </VTooltip>

              <VDialog 
                v-model="showDialog" 
                max-width="500"
                fullscreen
                :scrim="false"
                >
                <VCard>
                  <VToolbar color="primary">
                    <VToolbarTitle>{{t('Info', {name: 'IP'})}}</VToolbarTitle>
                    <VBtn
                      icon
                      variant="plain"
                      @click="showDialog = false"
                    >
                      <VIcon
                        color="white"
                        icon="tabler-x"
                      />
                    </VBtn>
                  </VToolbar>
                  <VCardText>
                    <VTable>
                      <tbody>
                        <tr>
                          <td>{{$t('Country')}}</td>
                          <td>{{modalContent?.country}}</td>
                        </tr>
                        <tr>
                          <td>{{$t('Region')}}</td>
                          <td>{{modalContent?.region}}</td>
                        </tr>
                        <tr>
                          <td>{{$t('City')}}</td>
                          <td>{{modalContent?.city}}</td>
                        </tr>
                        <tr>
                          <td>{{$t('ZIP')}}</td>
                          <td>{{modalContent?.zip}}</td>
                        </tr>
                      </tbody>
                    </VTable>
                  </VCardText>
                </VCard>
              </VDialog>
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
