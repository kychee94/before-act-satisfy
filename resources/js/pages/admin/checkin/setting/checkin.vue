<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const selected = ref([])
const modalContent = ref('')
const imageInputs = ref([])

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    checkins: [Array, Object],
    types: [Array, Object],
})

const headers = computed(() => [
  {
    title: t('Days'),
    key: 'days',
  },
  {
    title: t('Reward'),
    key: 'reward',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Type'),
    key: 'type',
    align: 'center',
    sortable: false,
  },
  {
    title: t('Action'),
    key: 'action',
    sortable: false,
  }
]);

// State
const search = ref('')
const itemsPerPage = ref(20)
const page = ref(1)
const refresh = ref(0)

const res = ref(JSON.parse(JSON.stringify(props.checkins)))

// Computed properties
const records = ref(Array.isArray(res.value?.data?.data) ? res.value.data.data : [])
const totalRecords = computed(() => res.value?.totalRecords ?? 0)

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/checkin/setting?type=getData', {
      params: {
        q: search.value || null,
        status: status?.value ?? null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
      },
    })

    res.value = response.data.checkins

  } catch (error) {
    console.error('Axios error:', error)
    console.error('Response:', error.response?.data)
  }
}

// Load data on mount
onMounted(fetchData)

// Add new row
const addcheckin = async () => {
  records.value.push({
    uuid: crypto.randomUUID(),
    days: '',
    reward: '',
    type: '',
    point: ''
  })

  await nextTick() // wait for DOM render
}

// Edit or delete as before
const deleteItem = uuid => {
  records.value = records.value.filter(r => r.uuid !== uuid)
}

// Save to database
const savecheckin = async () => {
  loadingStore.start();

  try {
    const formData = new FormData()
    
    // Append each record with its data
    records.value.forEach((record, index) => {
      formData.append(`records[${index}][uuid]`, record.uuid || '')
      formData.append(`records[${index}][days]`, record.days || '')
      formData.append(`records[${index}][reward]`, record.reward || '')
      formData.append(`records[${index}][type]`, record.type || '')
      formData.append(`records[${index}][point]`, record.point || '')
    })

    var response = await axios.post('/admin/checkin/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    Swal.fire({
      text: t('Success'),
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: "v-btn v-theme--light bg-info v-btn--density-default v-btn--size-default v-btn--variant-flat",
      }
    });

    fetchData()
  } catch (error) {
    Swal.fire({
      html: error.response?.data?.message || t('Something went wrong'),
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
    <VCard>
      <VCardText>
        <VCardItem class="px-0 d-flex flex-wrap justify-space-between gap-4">
          <template #append>
            <VBtn
              prepend-icon="tabler-plus"
              class="me-2"
              @click="addcheckin"
            >
              {{$t('Add %s',{'name': $t('Checkin')} )}}
            </VBtn>
            <VBtn
              prepend-icon="tabler-device-floppy"
              color="success"
              @click="savecheckin"
            >
              {{$t('Save %s',{'name': $t('Checkin')} )}}
            </VBtn>
          </template>
        </VCardItem>
        
        <VDivider />

          <VTable 
              fixed-header
              class="text-no-wrap"
            >
            <thead>
              <tr>
                <th
                  v-for="item in headers"
                  :key="item.key"
                  :class="item.align === 'center' ? 'text-center' : ''"
                  >
                  {{item.title}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(checkin, index) in records"
                :key="checkin.uuid"
                >
                <td>
                  <AppTextField
                    v-model="checkin.days"
                    :label="t('Days')"
                    type="number"
                    variant="outlined"
                    density="compact"
                    min="0"
                    class="centered-input my-3"
                  />
                </td>
                <td>
                  <AppTextField
                    v-model="checkin.reward"
                    :label="t('Reward')"
                    variant="outlined"
                    density="compact"
                    class="my-3 w-full"
                  />
                </td>
                <td>
                  <AppSelect
                    v-model="checkin.type"
                    :items="props.types"
                    item-title="value"
                    item-value="key"
                    class="my-3"
                    :placeholder="$t('Type')"
                  />

                  <AppTextField
                    v-if="checkin.type == 'POINT'"
                    v-model="checkin.point"
                    variant="outlined"
                    :label="t('Points')"
                    density="compact"
                    class="my-3"
                  />
                </td>
                <td>
                  <VBtn icon="mdi-delete" color="error" variant="text" @click="deleteItem(checkin.uuid)" />
                </td>
              </tr>
            </tbody>
          </VTable>
      </VCardText>
    </VCard>
</template>

<style scoped lang="scss">
@use "@core-scss/template/pages/misc.scss";

.centered-input :deep(input) {
  text-align: center;
}
</style>
