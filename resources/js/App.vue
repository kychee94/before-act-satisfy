<script setup>
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import {
  initConfigStore,
  useConfigStore,
} from '@core/stores/frontend/config'
import { hexToRgb } from '@core/utils/colorConverter'
import { usePage } from '@inertiajs/vue3'
import { useNotificationStore } from '@/stores/admin/notification'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
const notificationStore = useNotificationStore()
notificationStore.init()
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
