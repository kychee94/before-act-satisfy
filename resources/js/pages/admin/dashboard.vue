<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@adminThemeConfig'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayout from '@/layouts/Default.vue'
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import CustomDateRange from '@/components/CustomDateRange.vue'
import { useI18n } from 'vue-i18n'

// import Statistics from '@/views/dashboards/custom/statistics.vue'
// import PointReport from '@/views/dashboards/custom/pointReport.vue'
// import TopProducts from '@/views/dashboards/custom/topProducts.vue'
// import OrderStatus from '@/views/dashboards/custom/orderStatus.vue'

const { t } = useI18n()

definePage({
    name: "Dashboard",
    layout: 'DefaultLayoutWithVerticalNav',
})

const dateRange = ref([])
const datePicker = ref()
const startDate = ref()
const endDate = ref()

const handleDateRangeChange = (data) => {
  startDate.value = data.startDate;
  endDate.value = data.endDate;
}

</script>

<template>
    <Head :title="t('Dashboard')"/>

    <DefaultLayoutWithVerticalNav>
      <!-- <template #logo>
        <LoginLogo :nodes="themeConfig.app.logo" :title="themeConfig.app.title"/>
      </template> -->

      <VCard class="mb-3 bg-transparent shadow-none">
        <VCardText class="sm:float-right p-0">
            <div class="basis-full sm:basis-auto w-[300px]">
              <CustomDateRange
                v-model="dateRange"
                ref="datePicker"
                @change="handleDateRangeChange"
                :label="t('Select Date Range')"
              />
            </div>
        </VCardText>
      </VCard>

      <!-- 
      <VRow class="match-height">
        <VCol
          cols="12"
          lg="6"
          >
          <Statistics class="h-100" :start="startDate" :end="endDate"/>
        </VCol>

        <VCol
          cols="12"
          lg="6"
          >
          <PointReport
            :start="startDate"
            :end="endDate"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
          lg="4"
          >
          <TopProducts :start="startDate" :end="endDate"/>
        </VCol>

        <VCol
          cols="12"
          sm="6"
          lg="8"
          >
          <OrderStatus :start="startDate" :end="endDate"/>
        </VCol>
      </VRow> 
      -->
    </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
@use "@core-scss/template/libs/apex-chart.scss";
</style>
