<script setup>
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'

const { t } = useI18n()

const props = defineProps({
    start: String,
    end: String,
})

const products = ref([])

// Fetch data
const fetchData = async () => {
  try {
    var response = await axios.get('/admin/dashboard/top-products')

    // Update statistics dynamically
    const data = response.data

    products.value = data

  } catch (error) {
    console.error('Axios error:', error)
    console.error('Response:', error.response?.data)
  }
}

// Fetch Data upon date change
watch([() => props.start, () => props.end], ([newStart, newEnd]) => {
    fetchData()
})

// Load data on mount
onMounted(fetchData)

</script>

<template>
  <VCard
    :title="t('Top 10 Products')"
  >
    <VCardText>
      <VList class="card-list">
        <VListItem
          v-for="product in products"
          :key="product.sku"
        >
          <template #prepend>
            <VAvatar
              size="46"
              rounded
              class="me-1"
              :image="product.image"
            />
          </template>

          <VListItemTitle class="font-weight-medium me-4">
            {{ product.name }}
          </VListItemTitle>
          <VListItemSubtitle class="me-4">
            #{{ product.sku }}
          </VListItemSubtitle>

          <template #append>
            <div class="d-flex align-center">
              <span class="text-body-1">{{ product.qty }}</span>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 16px;
}
</style>
