<!-- ❗Errors in the form are set on line 60 -->
<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@adminThemeConfig'
import { Head, Link, useForm } from '@inertiajs/vue3';
import BlankLayout from '@/layouts/Blank.vue'
import DefaultLayout from '@/layouts/Default.vue'
import LoginLogo from '@/components/LoginLogo.vue'

const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

// define which layout to use
definePage({
    layout: 'BlankLayout'
});

const isPasswordVisible = ref(false)
const isFocused = ref(false)

// const route = useRoute()
const router = useRouter()
const ability = useAbility()

const refVForm = ref()

// const rememberMe = ref(false)
const form = useForm({
    username: '',
    password: '',
});

const login = async () => {
  form.transform(data => ({
      ...data,
  })).post(route('admin.login.post'), {
      onFinish: () => {
          if (form.hasErrors) {
            // form.password = '' // clear password manually
            form.reset('password')
          // }else{
              // const { accessToken, userData, userAbilityRules } = res

              // useCookie('userAbilityRules').value = userAbilityRules
              // ability.update(userAbilityRules)
              // useCookie('userData').value = userData
              // useCookie('accessToken').value = accessToken
          }
        }
  });

  // try {
  //   const res = await $api('/auth/login', {
  //     method: 'POST',
  //     body: {
  //       email: credentials.value.email,
  //       password: credentials.value.password,
  //     },
  //     onResponseError({ response }) {
  //       errors.value = response._data.errors
  //     },
  //   })

  //   const { accessToken, userData, userAbilityRules } = res

  //   useCookie('userAbilityRules').value = userAbilityRules
  //   ability.update(userAbilityRules)
  //   useCookie('userData').value = userData
  //   useCookie('accessToken').value = accessToken
  //   await nextTick(() => {
  //     router.replace(route.query.to ? String(route.query.to) : '/')
  //   })
  // } catch (err) {
  //   console.error(err)
  // }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}
</script>

<template>
    <Head title="Login"/>

    <BlankLayout>
        <template #logo>
          <LoginLogo :nodes="themeConfig.app.logo" :title="themeConfig.app.title"/>
        </template>

        <VRow
            no-gutters
            class="auth-wrapper bg-surface"
          >
            <VCol
              md="8"
              class="d-none d-md-flex"
            >
              <div class="position-relative bg-background w-100 me-0">
                <div
                  class="d-flex align-center justify-center w-100 h-100"
                  style="padding-inline: 6.25rem;"
                >
                  <VImg
                    max-width="613"
                    :src="authThemeImg"
                    class="auth-illustration mt-16 mb-2"
                  />
                </div>

                <img
                  class="auth-footer-mask"
                  :src="authThemeMask"
                  alt="auth-footer-mask"
                  height="280"
                  width="100"
                >
              </div>
            </VCol>

            <VCol
              cols="12"
              md="4"
              class="auth-card-v2 d-flex align-center justify-center"
            >
              <VCard
                flat
                :max-width="500"
                class="mt-12 mt-sm-0 pa-4"
              >
                <VCardText>
                  <h4 class="text-h4 mb-1">
                    Welcome to <span class="text-capitalize"> {{ themeConfig.app.title }} </span>! 👋🏻
                  </h4>
                  <p class="mb-0">
                    Please sign-in to your account and start the adventure
                  </p>
                </VCardText>
                <VCardText>
                  <VForm
                    ref="refVForm"
                    @submit.prevent="onSubmit"
                  >
                    <VRow>
                      <!-- email -->
                      <VCol cols="12">
                        <AppTextField
                          v-model="form.username"
                          label="Username"
                          placeholder="username"
                          type="text"
                          autofocus
                          :rules="[requiredValidator]"
                          :error-messages="form.errors.username"
                          hide-details="auto"
                          @focus="isFocused = true"
                          @blur="isFocused = false"
                          :class="{ 'text-primary': isFocused }"
                        />
                      </VCol>

                      <!-- password -->
                      <VCol cols="12">
                        <AppTextField
                          v-model="form.password"
                          label="Password"
                          placeholder="············"
                          :rules="[requiredValidator]"
                          :type="isPasswordVisible ? 'text' : 'password'"
                          autocomplete="password"
                          :error-messages="form.errors.password"
                          :append-inner-icon="isPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                          @click:append-inner="isPasswordVisible = !isPasswordVisible"
                          hide-details="auto"
                          @focus="isFocused = true"
                          @blur="isFocused = false"
                          :class="{ 'text-primary': isFocused }"
                        />

                        <!-- <div class="d-flex align-center flex-wrap justify-space-between my-6">
                          <VCheckbox
                            v-model="rememberMe"
                            label="Remember me"
                          />
                          <Link
                            class="text-primary ms-2 mb-1"
                          >
                            Forgot Password?
                          </Link>
                        </div> -->

                        <VBtn
                          block
                          type="submit"
                          color="primary"
                          :class="['mt-4', { 'opacity-25': form.processing }]"
                          :disabled="form.processing"
                        >
                         {{$t('login')}}
                        </VBtn>
                      </VCol>
                    </VRow>
                  </VForm>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
    </BlankLayout>
</template>

<style lang="scss">
@use "@core-scss/template/pages/page-auth";
</style>
