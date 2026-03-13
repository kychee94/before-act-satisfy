<script setup>
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'

const { t } = useI18n()

const props = defineProps({
    start: String,
    end: String,
})

// Define statistics data
const statistics = ref([
  {
    title: ['Members', 'Total', 'New'],
    stats: '',
    icon: 'tabler-users',
    color: 'info',
    key: 'members'
  },
  {
    title: ['Orders', 'Total', 'New'],
    stats: '',
    icon: 'tabler-chart-pie-2',
    color: 'primary',
    key: 'orders'
  },
  {
    title: ['Products'],
    stats: '',
    icon: 'tabler-shopping-cart',
    color: 'error',
    key: 'products'
  },
])

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/dashboard/statistics', {
      params: {
        dateFrom: props.start ?? null,
        dateTo: props.end ?? null,
      },
    })

    // Update statistics dynamically
    const data = response.data

    statistics.value.forEach(stat => {
      if (data.hasOwnProperty(stat.key)) {
        if(Object.hasOwn(data, `new_${stat.key}`)){
          stat.stats = `${data[stat.key]} (${data[`new_`+stat.key]})` || 0
        }else{
          stat.stats = `${data[stat.key]}` || 0
        }
      }
    })

  } catch (error) {
    console.error('Axios error:', error)
    console.error('Response:', error.response?.data)
  }
}

// Fetch Data upon date change
watch([() => props.start, () => props.end], ([newStart, newEnd]) => {
    fetchData()
})

// Load data on mount
onMounted(fetchData)

</script>

<template>
  <VCard :title="t('Statistics')">

    <VCardText>
      <VRow>
        <VCol
          v-for="item in statistics"
          :key="item.key"
          cols="6"
          md="4"
        >
          <div class="d-flex align-center gap-4 mt-md-9 mt-0">
            <VAvatar
              :color="item.color"
              variant="tonal"
              rounded
              size="40"
            >
              <VIcon :icon="item.icon" />
            </VAvatar>

            <div class="d-flex flex-column">
              <h5 class="text-h5">
                {{ item.stats }}
              </h5>
              <div class="text-lg">{{ t(item.title[0]) }}</div>
              <div class="text-sm text-muted"> {{ item.title[1] ? t(item.title[1]) : '' }}{{ item.title[2] ? ` (${t(item.title[2])})` : '' }} </div>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
