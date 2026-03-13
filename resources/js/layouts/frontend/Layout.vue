<script setup>
// import navItems from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'
import { usePage, Link, useForm, router } from '@inertiajs/vue3'
import { useLoadingStore } from '@layouts/stores/loading'
import { useSnackbarStore  } from '@layouts/stores/snackbar'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import LoginDialog from '@/layouts/components/Dialogs/LoginDialog.vue'
import FloatingFab from '@/layouts/components/FloatingFab.vue'
import Profile from '@/layouts/frontend/Profile.vue'
import Slideshow from '@/pages/slideshow.vue'
const loadingStore = useLoadingStore()
const snackbarStore = useSnackbarStore()
import { initConfigStore } from '@core/stores/config'
import { useI18n } from 'vue-i18n'

const ability = useAbility()

const { t } = useI18n()


const appName = import.meta.env.VITE_APP_NAME;

initConfigStore()

const { languages, layoutInfo } = usePage().props

const userInfo = computed(() => usePage().props.userInfo)
const fabInfo = computed(() => usePage().props?.fabInfo ?? [])

const cartCount = computed(() => userInfo.value?.cartCount || 0)

const props = defineProps({
  showSlideshow: {
    type: Boolean,
    default: false
  },
  slideshows: {
    type: [Array, Object],
  },
})

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

const loginDialog = ref(false)

const logout = async () => {
  // const rememberMe = ref(false)
  const form = useForm({});
  form.post(route('logout'));

  // Remove "accessToken" from cookie
  useCookie('accessToken').value = null

  // Remove "userAbilities" from cookie
  useCookie('userAbilityRules').value = null

  // Reset ability to initial ability
  ability.update([])
}

// Cart
const handleCartClick = () => {
    if(!userInfo.value){
        loginDialog.value = true
    }else{
        router.visit(route('checkout'))
    }
}

// Components
import LangBar from '@/layouts/frontend/LangBar.vue'
import Footer from '@/layouts/components/Footer.vue'

// @layouts plugin
import { HorizontalNavLayout } from '@layouts'
</script>

<template>
  <HorizontalNavLayout :nav-items="[]">
    <!-- 👉 navbar -->
    <template #navbar>
        <Link
          href="/"
          class="app-logo app-title-wrapper"
        >
          <VImg :src="layoutInfo.logo" alt="Logo" v-if="layoutInfo.logo" width="50"/>
        </Link>
        <VSpacer />

        <VBtn
          v-if="!userInfo"
          id="login-btn"
          class="ms-n3 me-2"
          color="white"
          variant="outlined"
          rounded
          @click="loginDialog=true"
        >
          {{$t('Login')}}
        </VBtn>

        <LangBar
          v-if="themeConfig.app.i18n.enable && languages?.length"
          :languages="languages"
        />

        <button
            v-if="userInfo"
            type="button"
            @click.stop="handleCartClick"
            class="relative flex items-center justify-center w-[44px] h-[44px] rounded-full"
            >
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 w-[25px] h-[25px] bg-red-600 text-white text-xs rounded-full flex items-center justify-center z-10"
            >
              {{ cartCount }}
            </span>
            <VAvatar 
                id="cart"
                class="mx-2"
                color="white"
                variant="flat"
              >
                <VIcon>tabler-shopping-cart</VIcon>
            </VAvatar>
        </button>

        <Profile 
          v-if="userInfo"
          />
        
        <!-- <NavbarThemeSwitcher /> -->
        <!-- <UserProfile /> -->
    </template>

    <!-- 👉 slideshow -->
    <template #slideshow class="hidden md:block">
      <div>
        <Slideshow 
          v-if="props.showSlideshow"
          :slideshows="props.slideshows"
        />
      </div>
    </template>

    <VOverlay 
      :model-value="loadingStore.isLoading" 
      class="d-flex align-center justify-center"
      persistent>
      <v-progress-circular indeterminate color="custom" size="64" />
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

    <!-- 👉 Floating Icons -->
    <FloatingFab 
      v-for="(fab, index) in fabInfo"
      :key="index"
      v-bind="fab"
    />

    <!-- 👉 Pages -->
    <slot />

    <LoginDialog
      v-model="loginDialog"
    />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </HorizontalNavLayout>
</template>
