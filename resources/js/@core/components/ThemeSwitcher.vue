<script setup>
import { useConfigStore } from '@core/stores/config'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  themes: {
    type: Array,
    required: true,
  },
})

const configStore = useConfigStore()
const selectedItem = ref([configStore.theme])

// Update icon if theme is changed from other sources
watch(() => configStore.theme, () => {
  selectedItem.value = [configStore.theme]
}, { deep: true })

</script>

<template>
  <!-- Theme switch button -->
  <v-btn
    variant="text"
    color="rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity))"
    icon
  >
    <v-icon>{{props.themes.find(t => t.name === configStore.theme)?.icon}}</v-icon>
    <!-- Tooltip -->
    <v-tooltip
      activator="parent"
      open-delay="1000"
      scroll-strategy="close"
    >
      <span class="text-capitalize">{{ configStore.theme }}</span>
    </v-tooltip>

    <!-- Theme menu -->
    <v-menu
      activator="parent"
      offset="12"
      :width="180"
      content-class="theme-menu"
    >
      <v-list
        v-model:selected="selectedItem"
        mandatory
      >
        <v-list-item
          v-for="{ name, icon } in props.themes"
          :key="name"
          :value="name"
          @click="() => configStore.theme = name"
          color="primary"
          :prepend-icon="icon"
        >
          <v-list-item-title class="text-capitalize">
            {{ t(name) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-btn>
</template>

