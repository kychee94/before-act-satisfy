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
    emailInfo: [Array, Object]
})

const headers = [
  // {
  //   title: '',
  //   key: 'data-table-select',
  //   color: 'primary'
  // },
  {
    title: t('Recipient'),
    key: 'recipient',
  },
  {
    title: t('Subject'),
    key: 'subject',
  },
  {
    title: 'IP',
    key: 'ip',
  },
  {
    title: t('Sent Date'),
    key: 'sent_date',
  },
  {
    title: t('Action'),
    key: 'action',
    sortable: false,
  },
]

// State
const currentTab = ref('item-1')
const selected = ref([])
const search = ref('')
const itemsPerPage = ref(null)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()
const res = ref()

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/setting/email/getData', {
      params: {
        q: search.value || null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data

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

// Bulk Action
const confirmBulkAction = (action) => {
  const actionLabel = action === 'delete'
    ? t('Delete Selected')
    : t('Resend Selected');

  Swal.fire({
    text: actionLabel,
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
      performBulkAction(action);
    }
  });
};

const performBulkAction = async (action) => {
  const ids = selected.value.map(item => item.uuid);

  loadingStore.start();

  try {
    var response = await axios.post('/admin/setting/email/'+action, {
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
    var response = await axios.post('/admin/setting/email/delete', {
        uuids: [uuid],
    })

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

  fetchData()
}

const resendItem = async uuid => {
  loadingStore.start();

  try {
    var response = await axios.post('/admin/setting/email/resend', {
        uuids: [uuid],
    })

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

const viewItem = async (uuid) => {
  try {
    const response = await axios.get('/admin/setting/email/info/'+uuid)
    modalContent.value = response.data.result
    showDialog.value = true
  } catch (error) {
    console.error('Error fetching info:', error)
  }
}

</script>

<template>
  <Head :title="$t('Email')"/>
  <VCard>
    <VCardText>
      <VCardItem 
          v-if="selected.length"
          class="d-flex flex-wrap justify-space-between pb-0 float-right"
        >
        <div class="mb-3">
          <VBtn
            color="error"
            class="me-2"
            @click="confirmBulkAction('delete')"
          >
            {{ $t('Delete Selected') }}
          </VBtn>

          <VBtn
            color="primary"
            @click="confirmBulkAction('resend')"
          >
            {{ $t('Resend Selected') }}
          </VBtn>
        </div>
      </VCardItem>
      <VCardItem class="px-0 d-flex flex-wrap justify-space-between gap-4">
        
        <VCardTitle>{{$t('Email')}}</VCardTitle>

        <template #append>
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
        <template #item.action="{ item }">
          <VBtn
            icon
          >
            <VIcon>tabler-dots-vertical</VIcon>
            <VMenu activator="parent">
              <VList>
                <VListItem
                  value="view"
                  @click="viewItem(item.uuid)"
                  icon
                >
                  <VIcon>tabler-eye</VIcon>
                  {{$t('View')}}
                </VListItem>
                <VListItem
                  value="resend"
                  @click="resendItem(item.uuid)"
                  icon
                >
                  <VIcon>tabler-mail-forward</VIcon>
                  {{$t('Resend')}}
                </VListItem>
                <VListItem
                  value="delete"
                  @click="deleteItem(item.uuid)"
                  icon
                >
                  <VIcon>tabler-trash</VIcon>
                  {{$t('Delete')}}
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>

          <VDialog 
            v-model="showDialog" 
            max-width="500"
            fullscreen
            :scrim="false"
            >
            <VCard>
              <VToolbar color="primary">
                <VToolbarTitle>{{t('Info', {name: t('Email Error')})}}</VToolbarTitle>
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
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="modalContent.error_date"
                      :label="$t('Error Date')"
                      readonly
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model="modalContent.error_email_to"
                      :label="$t('Recipient')"
                      readonly
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model="modalContent.error_subject"
                      :label="$t('Subject')"
                      readonly
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model="modalContent.error_body"
                      :label="$t('Body')"
                      readonly
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model="modalContent.error_ipaddress"
                      label="IP"
                      readonly
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model="modalContent.error_message"
                      :label="$t('Error Message')"
                      readonly
                    />
                  </VCol>
                </VRow>
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
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
