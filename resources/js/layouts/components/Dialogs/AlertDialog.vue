<script setup>
import { usePage, Link, useForm, router } from '@inertiajs/vue3'
import { useLoadingStore } from '@layouts/stores/loading'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: String
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
    >
    <VCard>
      <VCardText
        align="center"
        >
        {{message}}
      </VCardText>
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn 
          type="button"
          color="custom"
          class="w-full"
          variant="flat"
          @click="closeDialog"
          >
          OK
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>