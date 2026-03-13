<script setup>
import { usePage, router } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'

const { t } = useI18n()
const { languages } = usePage().props

const isOldPasswordVisible = ref(false)
const isCurrentPasswordVisible = ref(false)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const modalContent = ref('')
const changeUsername = ref(false)
const changePassword = ref(false)

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const loadingStore = useLoadingStore()

const errors = ref({
  username: undefined,
  opassword: undefined,
  password: undefined,
  password_confirmation: undefined,
})

const props = defineProps({
    pageTitle: String,
    user: [Array, Object],
    errors: [Array, Object],
})

const form = useForm({
  username: '',
  password: '',
})

const pass_form = useForm({
  opassword: '',
  password: '',
  password_confirmation: '',
})

const updateUsername = () => {
  form.transform(data => ({
    ...form.data(),
  })).post(route('admin.user.profile.update', {'type': 'username'}), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
        form.password = ''
        changeUsername.value = false
      },
  });
}

const resetPassword = () => {
  pass_form.transform(data => ({
    ...pass_form.data(),
  })).post(route('admin.user.profile.update', {'type': 'password'}), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
        pass_form.opassword = ''
        pass_form.password = ''
        pass_form.password_confirmation = ''
        changePassword.value = false
      }
  });
}

</script>

<template>
  <Head :title="props.pageTitle"/>

  <DefaultLayoutWithVerticalNav>
    <VCard>
      <VCardText>
        <VForm
            ref="formRef"
            method="post"
            @submit.prevent="onSubmit(formRef, form)"
          >
          <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
            <div class="d-flex flex-column justify-center">
              <h4 class="text-h4 font-weight-medium">
                {{props.pageTitle}}
              </h4>
            </div>
          </div>
          <VRow
            v-if="changeUsername == false"
            >
            <VCol cols="12">
              <VCardItem>
                <div class="p-5 d-flex flex-column flex-md-row">
                  <div class="flex-grow-1">
                    <h3 class="text-lg">{{$t('Username')}}</h3>
                    <span>{{props.user.username}}</span>
                  </div>
                  <VBtn
                      class="mt-4 mt-md-0 ms-md-auto"
                      @click="changeUsername = true"
                      width="200"
                    >
                    {{$t('Change Username')}}
                  </VBtn>
                </div>
              </VCardItem>
            </VCol>
          </VRow>
          <VRow
            v-else
            class="my-3"
            >
              <VCol md="6" cols="12">
                <AppTextField
                  v-model="form.username"
                  :error-messages="form.errors.username"
                  :label="$t('Enter New Username')"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol md="6" cols="12">
                <AppTextField 
                  v-model="form.password"
                  :label="$t('Password')"
                  placeholder="············"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :error-messages="form.errors.password"
                  :append-inner-icon="isCurrentPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                  @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                  hide-details="auto"
                />
              </VCol>
              <VCol 
                  cols="12"
                  align="end"
                >
                <VBtn
                    class="mt-md-0 ms-md-auto"
                    color="primary"
                    @click="updateUsername()"
                  >
                  {{$t('Update')}}
                </VBtn>
                <VBtn
                    class="mt-md-0 ms-md-auto"
                    variant="text"
                    @click="changeUsername = false"
                  >
                  {{$t('Cancel')}}
                </VBtn>
              </VCol>
          </VRow>
          <VDivider />
          <VRow
            v-if="changePassword == false"
            >
            <VCol cols="12">
              <VCardItem>
                <div class="p-5 d-flex flex-column flex-md-row">
                  <div class="flex-grow-1">
                    <h3 class="text-lg">{{$t('Password')}}</h3>
                    <span>********</span>
                  </div>
                  <VBtn
                      class="mt-4 mt-md-0 ms-md-auto"
                      @click="changePassword = true"
                      width="200"
                    >
                    {{$t('Reset Password')}}
                  </VBtn>
                </div>
              </VCardItem>
            </VCol>
          </VRow>
          
          <VRow
            v-else
            class="my-3"
            >
              <VCol md="4" cols="12">
                <AppTextField
                    v-model="pass_form.opassword"
                    :label="$t('Old Password')"
                    placeholder="············"
                    :type="isOldPasswordVisible ? 'text' : 'password'"
                    autocomplete="password"
                    :error-messages="pass_form.errors.opassword"
                    :rules="[requiredValidator]"
                    :append-inner-icon="isOldPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                    @click:append-inner="isOldPasswordVisible = !isOldPasswordVisible"
                    hide-details="auto"
                  />
              </VCol>
              <VCol md="4" cols="12">
                <AppTextField
                    v-model="pass_form.password"
                    :label="$t('Password')"
                    placeholder="············"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    autocomplete="password"
                    :error-messages="pass_form.errors.password"
                    :rules="[requiredValidator]"
                    :append-inner-icon="isPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    hide-details="auto"
                  />
              </VCol>
              <VCol md="4" cols="12">
                <AppTextField
                    v-model="pass_form.password_confirmation"
                    :label="$t('Confirm Password')"
                    placeholder="············"
                    :rules="[confirmedValidator(pass_form.password_confirmation, pass_form.password)]"
                    :type="isConfirmPasswordVisible ? 'text' : 'password'"
                    autocomplete="password"
                    :error-messages="pass_form.errors.password_confirmation"
                    :append-inner-icon="isConfirmPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                    @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                    hide-details="auto"
                  />
              </VCol>
              <VCol 
                  cols="12"
                  align="end"
                >
                <VBtn
                    class="mt-md-0 ms-md-auto"
                    color="primary"
                    @click="resetPassword()"
                  >
                  {{$t('Update')}}
                </VBtn>
                <VBtn
                    class="mt-md-0 ms-md-auto"
                    variant="text"
                    @click="changePassword = false"
                  >
                  {{$t('Cancel')}}
                </VBtn>
              </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
