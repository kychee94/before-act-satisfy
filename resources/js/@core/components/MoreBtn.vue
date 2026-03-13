<script setup>
const props = defineProps({
  menuList: {
    type: Array,
    required: false,
  },
  itemProps: {
    type: Boolean,
    required: false,
  },
  iconSize: {
    type: String,
    required: false,
  },
  class: {
    type: String,
    required: false,
    default: 'text-disabled',
  },
})
</script>

<template>
  <v-btn 
  :class="props.class"
  icon
  >
    <v-icon
      :size="iconSize"
      icon="tabler-dots-vertical"
    />

    <v-menu
      v-if="props.menuList"
      activator="parent"
    >
      <v-list
        :items="props.menuList"
        :item-props="props.itemProps"
      />
    </v-menu>
  </v-btn>
</template>
