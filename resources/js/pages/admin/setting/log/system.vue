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
import { formatDate } from '/src/helper/date.js'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const showDialog = ref(false)
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    logs: [Array, Object]
})

const headers = [
  {
    title: t('User'),
    key: 'user',
  },
  {
    title: t('Function'),
    key: 'func',
  },
  {
    title: t('File'),
    key: 'file',
  },
  {
    title: t('Date'),
    key: 'created_at',
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

const res = ref(JSON.parse(JSON.stringify(props.logs)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/setting/log?type=getData', {
      params: {
        q: search.value || null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data.logs

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
const viewItem = async id => {
  try {
    const response = await axios.get('/admin/setting/log/info/'+id)
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
            <template #item.created_at="{ item }">
                {{ formatDate(item.created_at, 'Y-m-d H:i:s')}}
            </template>
            <template #item.action="{ item }">
              <VTooltip 
                :text="$t('View')" 
                location="bottom"
                >
                <template #activator="{ props }">
                  <VBtn
                      v-bind="props"
                      color="success"
                      class="mx-1"
                      icon
                      @click="viewItem(item.id)"
                    >
                    <VIcon>tabler-eye</VIcon>
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
                          <td>{{$t('User')}}</td>
                          <td>{{modalContent?.user}}</td>
                        </tr>
                        <tr>
                          <td>{{$t('Function')}}</td>
                          <td>{{modalContent?.func}}</td>
                        </tr>
                        <tr>
                          <td>{{$t('File')}}</td>
                          <td>{{modalContent?.file}}</td>
                        </tr>
                        <tr>
                          <td>{{$t('Comment')}}</td>
                          <td>{{modalContent?.comment}}</td>
                        </tr>
                        <tr>
                          <td>{{$t('Date')}}</td>
                          <td>{{formatDate(modalContent?.created_at, "Y-m-d H:i:s")}}</td>
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
