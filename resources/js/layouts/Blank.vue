<script setup>
const { injectSkinClasses } = useSkins()
import { usePage } from '@inertiajs/vue3'
import { Head, Link } from '@inertiajs/vue3'
import { useLoadingStore } from '@layouts/stores/loading'
const loadingStore = useLoadingStore()

// ℹ️ This will inject classes in body tag for accurate styling
injectSkinClasses()

// SECTION: Loading Indicator
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

const snackbar = ref({
  show: false,
  message: '',
  timeout: 4000,
})

const showFlash = () => {
  const flash = usePage().props.flash
  if (flash?.msgClass) {
    snackbar.value = {
      show: true,
      message: flash.msg,
      color: flash.msgClass,
      timeout: 4000,
    }
  }
}

const closeSnackbar = () => {
  snackbar.value.show = false
}

watch(() => usePage().props.flash, showFlash, { immediate: true, deep: true })

// !SECTION
</script>

<template>
  <AppLoadingIndicator ref="refLoadingIndicator" />
  <div class="layout-wrapper layout-blank">
      <div>
          <slot name="logo" />
      </div>
      <slot />
  </div>
  <v-overlay 
    :model-value="loadingStore.isLoading" 
    class="d-flex align-center justify-center"
    persistent>
    <v-progress-circular indeterminate color="primary" size="64" />
  </v-overlay>

  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    vertical
  >
    {{ snackbar.message }}

    <template #actions>
      <VBtn
        color="#FFF"
        variant="text"
        @click="closeSnackbar"
      >
        {{$t('Close')}}
      </VBtn>
    </template>
  </VSnackbar>
</template>

<style>
.layout-wrapper.layout-blank {
  flex-direction: column;
}
</style>
