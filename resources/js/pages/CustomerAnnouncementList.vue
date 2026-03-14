<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

const showDialog = ref(false)
const modalContent = ref('')
const modalTitle = ref('')

const headers = [
  {
    title: '#',
    key: 'counter',
    sortable: false,
  },
  {
    title: 'Announcement',
    key: 'title',
  },
  {
    title: 'Date',
    key: 'inserted_date',
  },
  {
    title: 'Read',
    key: 'read',
    sortable: false,
  },
  {
    title: 'Action',
    key: 'action',
    sortable: false,
  },
]

const props = defineProps({
    announcements: [Array, Object],
})

// State
const search = ref('')
const category = ref()
const itemsPerPage = ref(20)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

const res = ref([])

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/announcement', {
      params: {
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        sortBy: sortBy.value || null,
        orderBy: orderBy.value || null,
      },
    })

    res.value = response.data.announcements

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

// View Announcement
const viewItem = async uuid => {
  try {
    const response = await axios.get('/announcement/details/'+uuid)
    modalTitle.value = response.data.title
    modalContent.value = response.data.content
    showDialog.value = true
  } catch (error) {
    console.error('Error fetching info:', error)
  }
}

// Computed properties
const records = computed(() => Array.isArray(res.value?.data?.data) ? res.value.data.data : [])
const totalRecords = computed(() => res.value?.totalRecords ?? 0)

// On read announcement update table
watch(showDialog, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    fetchData()
  }
})
</script>

<template>
    <div>
        <div class="p-6 lg:p-8 bg-white border-b border-gray-200">
            <VDataTableServer
              v-model:items-per-page="itemsPerPage"
              v-model:page="page"
              :items="records"
              :items-length="totalRecords"
              :headers="headers"
              class="text-no-wrap bg-white text-black"
              return-object
              item-value="uuid"
              :items-per-page-options="[5, 10, 25, 50, 100]"
              @update:options="updateOptions"
            >
            <template #item.counter="{ index }">
              {{ (page - 1) * itemsPerPage + index + 1 }}
            </template>
            <template #item.read="{ item }">
                <VIcon v-if="!item.read">mdi-email</VIcon>
                <VIcon v-else>mdi-email-open</VIcon>
            </template>
            <template #item.action="{ item }">
                <VBtn
                      v-bind="props"
                      color="#7367F0"
                      class="mx-1"
                      rounded
                      :style="{ '--v-theme-overlay-multiplier': 0 }"
                      @click="viewItem(item.uuid)"
                    >
                    View
                </VBtn>

                <VDialog 
                    v-model="showDialog" 
                    max-width="500"
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
                            icon="mdi-close"
                          />
                        </VBtn>
                      </VToolbar>
                      <VCardText>
                        {{modalContent}}
                      </VCardText>
                    </VCard>
              </VDialog>
            </template>
          </VDataTableServer>
        </div>
    </div>
</template>

<style lang="scss">

</style>

