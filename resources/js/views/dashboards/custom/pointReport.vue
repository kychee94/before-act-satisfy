<script setup>
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'
import VueApexCharts from 'vue3-apexcharts'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'

const { t } = useI18n()

const props = defineProps({
    start: String,
    end: String,
})

const vuetifyTheme = useTheme()

const chartData = ref({
  categories: [],
  min: 0,
  max: 0,
})

// Store raw data from server
const rawSeriesData = ref([])

// Translate series names reactively
const series = computed(() => ({
  bar: rawSeriesData.value.map(item => ({
    name: t(item.name), // Translate 'Earning' -> translated string
    data: item.data,
  })),
}))

// chart setting
const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables
  const labelColor = `rgba(${ hexToRgb(currentTheme['surface-bright']) },${ variableTheme['disabled-opacity'] })`
  const legendColor = `rgba(${ hexToRgb(currentTheme['on-background']) },${ variableTheme['high-emphasis-opacity'] })`
  const borderColor = `rgba(${ hexToRgb(String(variableTheme['border-color'])) },${ variableTheme['border-opacity'] })`
  
  return {
    bar: {
      chart: {
        parentHeightOffset: 0,
        stacked: true,
        type: 'bar',
        toolbar: { show: false },
      },
      tooltip: { enabled: true },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '40%',
          borderRadius: 8,
          borderRadiusApplication: 'around',
          borderRadiusWhenStacked: 'all',
        },
      },
      colors: [
        'rgba(var(--v-theme-primary),1)',
        'rgba(var(--v-theme-warning),1)',
      ],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 6,
        lineCap: 'round',
        colors: [currentTheme.surface],
      },
      legend: {
        show: true,
        horizontalAlign: 'right',
        position: 'top',
        fontFamily: 'Public Sans',
        fontSize: '13px',
        markers: {
          height: 12,
          width: 12,
          radius: 12,
          offsetX: -3,
          offsetY: 2,
        },
        labels: { colors: legendColor },
        itemMargin: { horizontal: 5 },
      },
      grid: {
        show: false,
        padding: {
          bottom: -8,
          top: 20,
        },
      },
      xaxis: {
        categories: chartData.value.categories, // date replace here
        labels: {
          style: {
            fontSize: '13px',
            colors: labelColor,
            fontFamily: 'Public Sans',
          },
        },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: {
        labels: {
          offsetX: -16,
          style: {
            fontSize: '13px',
            colors: labelColor,
            fontFamily: 'Public Sans',
          },
        },
        min: chartData.value.min, // min data replace here
        max: chartData.value.max, // max data replace here
        tickAmount: chartData.value.tickAmount, // tickAmount data replace here
      },
      responsive: [
        {
          breakpoint: 1700,
          options: { plotOptions: { bar: { columnWidth: '43%' } } },
        },
        {
          breakpoint: 1526,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '52%',
                borderRadius: 8,
              },
            },
          },
        },
        {
          breakpoint: 1359,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '60%',
                borderRadius: 8,
              },
            },
          },
        },
        {
          breakpoint: 1280,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '40%',
                borderRadius: 10,
              },
            },
          },
        },
        {
          breakpoint: 1025,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '40%',
                borderRadius: 8,
              },
            },
            chart: { height: 390 },
          },
        },
        {
          breakpoint: 991,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '40%',
                borderRadius: 8,
              },
            },
          },
        },
        {
          breakpoint: 850,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '50%',
                borderRadius: 8,
              },
            },
          },
        },
        {
          breakpoint: 776,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '50%',
                borderRadius: 6,
              },
            },
          },
        },
        {
          breakpoint: 731,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '70%',
                borderRadius: 8,
              },
            },
          },
        },
        {
          breakpoint: 599,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '50%',
                borderRadius: 8,
              },
            },
          },
        },
        {
          breakpoint: 500,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '55%',
                borderRadius: 6,
              },
            },
          },
        },
        {
          breakpoint: 449,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '65%',
                borderRadius: 6,
              },
            },
            chart: { height: 360 },
            xaxis: { labels: { offsetY: -5 } },
          },
        },
        {
          breakpoint: 394,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '80%',
                borderRadius: 6,
              },
            },
          },
        },
      ],
      states: {
        hover: { filter: { type: 'none' } },
        active: { filter: { type: 'none' } },
      },
    },
    line: {
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
        type: 'line',
      },
      stroke: {
        curve: 'smooth',
        dashArray: [
          5,
          0,
        ],
        width: [
          1,
          2,
        ],
      },
      legend: { show: false },
      colors: [
        borderColor,
        currentTheme.primary,
      ],
      grid: {
        show: false,
        borderColor,
        padding: {
          top: -30,
          bottom: -15,
          left: 25,
        },
      },
      markers: { size: 0 },
      xaxis: {
        labels: { show: false },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: { show: false },
      tooltip: { enabled: false },
    },
  }
})

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/dashboard/point-report', {
      params: {
        dateFrom: props.start ?? null,
        dateTo: props.end ?? null,
      },
    })

    // Update statistics dynamically
    const data = response.data

    rawSeriesData.value = data.bar
    chartData.value.categories = data.categories
    chartData.value.min = data.yaxis?.min
    chartData.value.max = data.yaxis?.max
    chartData.value.tickAmount = data.yaxis?.tickAmount

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
  <VCard class="revenue-report">
    <VRow no-gutters>
      <VCol
        cols="12"
        :class="$vuetify.display.smAndUp ? 'border-e' : 'border-b'"
      >
        <VCardText>
          <h6 class="text-h5 mb-sm-n8">
            {{t('Point Report')}}
          </h6>

          <VueApexCharts
            v-if="chartOptions"
            :options="chartOptions.bar"
            :series="series.bar"
            height="365"
          />

          <VProgressCircular
            v-else
            indeterminate
          />

        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss">
.revenue-report {
  .apexcharts-legend {
    gap: 1rem;
  }

  @media (max-width: 599px) {
    .apexcharts-legend.apx-legend-position-top.apexcharts-align-right {
      justify-content: flex-start;
      padding: 0;
    }
  }
}
</style>
