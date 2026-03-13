<script setup>
import { usePage, Link, useForm, router } from '@inertiajs/vue3'
import { useLoadingStore } from '@layouts/stores/loading'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: String,
  loading: Boolean,
})

const emit = defineEmits(['update:modelValue', 'confirm'])

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <VDialog 
    :model-value="modelValue"
    :max-width="400"
    persistent
    >
    <VCard>
      <VCardTitle 
        class="text-lg font-semibold text-center text-white bg-custom"
        >
        {{t('Confirm Purchase?')}}
      </VCardTitle>

      <VCardText
        align="center"
       >
        {{message}}
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="close">
          {{t('Cancel')}}
        </VBtn>
        <VBtn 
          type="button"
          color="custom"
          variant="flat"
          :loading="loading"
          @click="confirm"
          >
          {{t('Confirm')}}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>