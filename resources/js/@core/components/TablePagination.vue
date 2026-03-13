<script setup>
const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  color: {
    type: String
  },
})

const emit = defineEmits(['update:page', 'update:itemsPerPage'])

const updatePage = value => {
  emit('update:page', value)
}

const updateItemPerPage = value => {
  emit('update:itemsPerPage', value)
}
</script>

<template>
  <div>
    <VDivider />

    <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 px-6 py-3">
      <div class="d-flex align-center gap-2">
        <span class="text-sm">{{$t('Items per page')}}:</span>
        <v-select
          :items="[5, 10, 25, 50, 100]"
          :model-value="itemsPerPage"
          @update:model-value="updateItemPerPage"
          density="compact"
          :color="props.color"
          hide-details
          style="max-width: 100px"
        />
      </div>

      <p class="text-disabled mb-0">
        {{ paginationMeta({ page, itemsPerPage }, totalItems) }}
      </p>

      <VPagination
        :model-value="page"
        :color="props.color"
        :active-color="props.color"
        :length="Math.ceil(totalItems / itemsPerPage)"
        :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.ceil(totalItems / itemsPerPage), 5)"
        @update:model-value="updatePage"
      />
    </div>
  </div>
</template>
