<script setup>
import { useConfigStore } from '@core/stores/admin/config'
import { AppContentLayoutNav } from '@layouts/enums'
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@layouts/utils'
import { defineAsyncComponent, ref, watch } from 'vue'

// Async components for layouts
const DefaultLayoutWithHorizontalNav = defineAsyncComponent(() => import('@/layouts/components/DefaultLayoutWithHorizontalNav.vue'))
const DefaultLayoutWithVerticalNav = defineAsyncComponent(() => import('@/layouts/components/DefaultLayoutWithVerticalNav.vue'))

// Store + utilities
const configStore = useConfigStore()
switchToVerticalNavOnLtOverlayNavBreakpoint()

const { layoutAttrs, injectSkinClasses } = useSkins()
injectSkinClasses()

// Loading indicator logic
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref(null)

watch([
  isFallbackStateActive,
  refLoadingIndicator,
], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
</script>

<template>
  <v-app>
    <component
      v-bind="layoutAttrs"
      :is="configStore.appContentLayoutNav === AppContentLayoutNav.Vertical ? DefaultLayoutWithVerticalNav : DefaultLayoutWithHorizontalNav"
    >
      <AppLoadingIndicator ref="refLoadingIndicator" />

      <!-- Inertia renders the current page via default slot -->
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <slot />
      </Suspense>
    </component>
  </v-app>
</template>

<style lang="scss">
@use "@layouts/styles/default-layout";
</style>
