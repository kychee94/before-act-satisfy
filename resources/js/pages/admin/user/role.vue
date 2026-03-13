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
const modalTitle = ref('')
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    roles: [Array, Object],
    funcs: [Array, Object],
    accesses: [Array, Object],
})

const headers = [
  {
    title: '#',
    key: 'counter',
    sortable: false,
  },
  {
    title: t('Role'),
    key: 'name',
  },
  {
    title: t('Action'),
    key: 'action',
    sortable: false,
    align: 'center'
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

const res = ref(JSON.parse(JSON.stringify(props.roles)))

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/role?type=getData', {
      params: {
        q: search.value || null,
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data.roles

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

const formRef = ref()
const action = ref('store')
const form = useForm({
  name: '',
  access: {},
  id: null
})

// Actions
const viewItem = async id => {
  try {
    const response = await axios.get('/admin/role/info/'+id)
    modalTitle.value = t('View Role')

    form.name = response.data.name
    form.access = response.data.result
    form.id = id
    action.value = 'update'
    showDialog.value = true 
  } catch (error) {
    console.error('Error fetching info:', error)
  }
}

const addItem = () => {
  modalTitle.value = t('Add Role')
  action.value = 'store'
  form.id = ''
  form.name = ''
  form.access = {}
  showDialog.value = true
}

const onSubmit = () => {
  form.transform(data => ({
    ...form.data(),
  })).post(route('admin.role.'+ action.value), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
        showDialog.value = false
        fetchData()
      }
  });
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
              </div>
            </template>
            <template #append>
              <VBtn
                prepend-icon="tabler-plus"
                @click="addItem()"
              >
                {{$t('Add Role')}}
              </VBtn>
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
            <template #item.action="{ item }">
              <VTooltip :text="$t('View')" location="bottom">
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
                <VForm
                    ref="formRef"
                    method="post"
                    @submit.prevent="onSubmit"
                  >
                  <VCard>
                    <VToolbar color="primary">
                      <VToolbarTitle>{{modalTitle}}</VToolbarTitle>
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
                      <AppTextField
                        v-model="form.name"
                        :label="$t('Name')"
                        class="mb-7"
                        :rules="[requiredValidator]"
                      />
                      <VTable class="text-no-wrap mb-6 border rounded">
                        <thead>
                          <tr>
                            <th scope="col">
                              {{$t('Functions')}}
                            </th>
                            <th scope="col">
                              {{$t('Access Level')}}
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr
                            v-for="func in props.funcs"
                            :key="func.key"
                          >
                            <td
                              width="400px"
                              class="text-high-emphasis"
                            >
                              {{ func.function }}
                            </td>
                            <td>
                              <AppSelect
                                v-model="form.access[func.key]"
                                :items="props.accesses"
                                item-title="value"
                                item-value="key"
                                :placeholder="$t('Access Level')"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </VTable>
                      <div class="d-flex justify-end gap-x-4">
                        <VBtn
                          type="submit"
                          color="primary"
                          :class="['mt-4', { 'opacity-25': form.processing }]"
                          :disabled="form.processing"
                          >
                          {{$t('Submit')}}
                        </VBtn>
                      </div>
                    </VCardText>
                  </VCard>
                </VForm>
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
