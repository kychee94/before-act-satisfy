<script setup>
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'

const { t } = useI18n()

const props = defineProps({
    start: String,
    end: String,
})

const headingColor = 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))'
const labelColor = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'

const orderChartSeries = ref([])
const orderTotal = ref(0)

const orderChartConfig = ref({
  labels: [],
  colors: [],
  stroke: { width: 0 },
  dataLabels: {
    enabled: false,
    formatter(val) {
      return `${ Number.parseInt(val) }`
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    offsetY: 10,
    markers: {
      width: 8,
      height: 8,
      offsetX: -3,
    },
    itemMargin: {
      horizontal: 15,
      vertical: 5,
    },
    fontSize: '13px',
    fontWeight: 400,
    labels: {
      colors: headingColor,
      useSeriesColors: false,
    },
  },
  tooltip: { theme: false },
  grid: { padding: { top: 15 } },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          value: {
            fontSize: '24px',
            color: headingColor,
            fontWeight: 500,
            offsetY: -20,
            formatter(val) {
              return `${ Number.parseInt(val) }`
            },
          },
          name: { offsetY: 20 },
          total: {
            show: true,
            fontSize: '0.9375rem',
            fontWeight: 400,
            label: t('Total'),
            color: labelColor,
            formatter() {
              return `${ Number.parseInt(orderTotal.value) }`
            },
          },
        },
      },
    },
  },
  responsive: [{
    breakpoint: 420,
    options: { chart: { height: 400 } },
  }],
})

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/dashboard/order-status', {
      params: {
        dateFrom: props.start ?? null,
        dateTo: props.end ?? null,
      },
    })

    // Update statistics dynamically
    const data = response.data

    orderChartSeries.value = data.orders
    orderTotal.value = data.total
    
    orderChartConfig.value = {
      ...orderChartConfig.value,
      colors: data.colors,
      labels: data.labels.map(label => t(label)),
    }

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
  <VCard>
    <VCardItem :title="t('Order Status')">
    </VCardItem>
    <VCardText>
      <VueApexCharts
        type="donut"
        height="400"
        :options="orderChartConfig"
        :series="orderChartSeries"
      />
    </VCardText>
  </VCard>
</template>
