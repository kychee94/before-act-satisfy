<script setup>
import { usePage, Link, useForm, router } from '@inertiajs/vue3'
import { useLoadingStore } from '@layouts/stores/loading'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', false])

const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog 
    :model-value="modelValue"
    :max-width="400"
    @update:model-value="closeDialog"
    hide-overlay 
    persistent>
    <VCard class="flex flex-col items-center justify-center p-6">
      <VProgressCircular indeterminate color="orange-500" size="50"></VProgressCircular>
      <span class="mt-4 text-gray-700 font-medium">{{t('Processing...')}}</span>
    </VCard>
  </VDialog>
</template>