<script setup>
import navItems from '@/navigation/vertical'
import { themeConfig } from '@adminThemeConfig'
import { usePage } from '@inertiajs/vue3'
import { useLoadingStore } from '@layouts/stores/loading'
import { useSnackbarStore  } from '@layouts/stores/snackbar'
import ScrollToTop from '@core/components/ScrollToTop.vue'
const loadingStore = useLoadingStore()
const snackbarStore = useSnackbarStore()
import { initConfigStore } from '@core/stores/admin/config'

initConfigStore()

const { languages } = usePage().props

watch(
  () => usePage().props.flash,
  flash => {
    if (flash?.msgClass) {
      snackbarStore.trigger({
        message: flash.msg,
        color: flash.msgClass,
      })
    }
  },
  { immediate: true, deep: true }
)

// const langConfig = languages.map(lang => ({
//                     label: lang.lang_name,
//                     i18nLang: lang.lang_code,
//                     isRTL: true,
//                   }))
// Components
import Footer from '@/layouts/components/Footer.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'
import NavSearchBar from '@/layouts/components/NavSearchBar.vue'
import NavbarShortcuts from '@/layouts/components/NavbarShortcuts.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <VBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          variant="text"
          icon="tabler-menu-2"
          @click="toggleVerticalOverlayNavActive(true)"
        >
        </VBtn>

        <NavSearchBar class="ms-lg-n3" />

        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && languages?.length"
          :languages="languages"
        />
        <NavbarThemeSwitcher />
        <!-- <NavbarShortcuts /> -->
        <!-- <NavBarNotifications class="me-1" /> -->
        <UserProfile />
      </div>
    </template>

    <VOverlay 
      :model-value="loadingStore.isLoading" 
      class="d-flex align-center justify-center"
      persistent>
      <v-progress-circular indeterminate color="primary" size="64" />
    </VOverlay>

    <VSnackbar
      v-model="snackbarStore.show"
      :color="snackbarStore.color"
      :timeout="snackbarStore.timeout"
      multi-line
      vertical
    >
      <div v-html="snackbarStore.message"></div>

      <template #actions>
        <VBtn
          color="#FFF"
          variant="text"
          @click="snackbarStore.close"
        >
          {{$t('Close')}}
        </VBtn>
      </template>
    </VSnackbar>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
    
  </VerticalNavLayout>
</template>
