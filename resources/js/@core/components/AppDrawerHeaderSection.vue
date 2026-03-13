<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['cancel'])
</script>

<template>
  <div class="pa-6 d-flex align-center">
    <h5 class="text-h5">
      {{ props.title }}
    </h5>
    <VSpacer />

    <slot name="beforeClose" />

    <VBtn
      size="small"
      @click="$emit('cancel', $event)"
    >
      <VIcon
        size="24"
        icon="tabler-x"
      />
    </VBtn>
  </div>
</template>
