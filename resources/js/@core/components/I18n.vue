<script setup>
import { router } from '@inertiajs/vue3'
import { useLocaleStore } from '@layouts/stores/locale'
import axios from 'axios'

const props = defineProps({
  languages: {
    type: Array,
    required: true,
  },
  location: {
    type: null,
    required: false,
    default: 'bottom end',
  },
})

const { locale } = useI18n({ useScope: 'global' })
const localeStore = useLocaleStore()

// Sync i18n.locale with Pinia on startup
onMounted(() => {
  locale.value = localeStore.current
})

watch(() => localeStore.current, (newLang) => {
  locale.value = newLang
  document.documentElement.setAttribute('lang', newLang)
})

const switchLanguage = async (lang) => {
  // Update Vue frontend locale
  localeStore.setLocale(lang)

  router.post('/admin/set-locale', { locale: lang }, {
    preserveState: false, // This ensures fresh data
  })

  // Post to backend to update locale in session
  // try {
  //   await axios.post('/admin/set-locale', { locale: lang })
  // } catch (error) {
  //   console.error('Locale switch failed:', error)
  // }
}
</script>

<template>
  <VBtn
    variant="text"
    icon
  >
    <VIcon>tabler-language</VIcon>
    <VMenu
      activator="parent"
      :location="props.location"
      offset="12px"
      :width="175"
    >
      <VList
        :selected="[locale]"
        color="primary"
      >
        <VListItem
          v-for="lang in props.languages"
          :key="lang.lang_code"
          :value="lang.lang_code"
          @click="switchLanguage(lang.lang_code)"
        >
          <template #prepend>
            <VAvatar size="22">
              <VImg 
                  :src="lang.lang_icon" 
                />
            </VAvatar>
          </template>
          <VListItemTitle>
            {{ lang.lang_native_name }}
          </VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
    </VBtn>
</template>
