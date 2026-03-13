<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'
import TiptapEditor from '@/components/CustomTiptapEditor.vue'

const page = usePage()
const { languages } = usePage().props
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const loadingStore = useLoadingStore()

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const modalContent = ref('')

const errors = ref({
  email: undefined,
  username: undefined,
  password: undefined,
  password_confirmation: undefined,
})

const props = defineProps({
    pageTitle: String,
    roles: [Array, Object],
    statuses: [Array, Object],
})

const activeTab = ref(languages[0].lang_code)
const formRef = ref()
const form = useForm({
  first_name: null,
  last_name: null,
  gender: null,
  phone: null,
  email: null,
  dob: null,
  role: null,
  status: null,
  username: null,
  password: null,
  password_confirmation: null,
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route('admin.user.store'), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
      }
  });
}

</script>

<template>
  <Head :title="props.pageTitle"/>
  <DefaultLayoutWithVerticalNav>
    <VForm
        ref="formRef"
        method="post"
        @submit.prevent="onSubmit(formRef, form)"
      >
      <div>
        <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
          <div class="d-flex flex-column justify-center">
            <h4 class="text-h4 font-weight-medium">
              {{props.pageTitle}}
            </h4>
          </div>
        </div>

        <VRow>
          <VCol md="8" cols="12">
            <VCard
                :title="$t('General')"
              >
              <VCardText>
                <VRow>
                  <VCol>
                    <AppTextField
                      v-model="form.first_name"
                      :label="$t('First Name')"
                    />
                  </VCol>
                  <VCol>
                    <AppTextField
                      v-model="form.last_name"
                      :label="$t('Last Name')"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol>
                    <AppTextField
                      v-model="form.email"
                      type="email"
                      :label="$t('Email')"
                      :rules="[emailValidator]"
                      :error-messages="errors.email"
                    />
                  </VCol>
                  <VCol>
                    <AppTextField
                      v-model="form.phone"
                      :label="$t('Phone')"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol>
                    <AppSelect
                      v-model="form.gender"
                      :items="[
                                { value: 'M', title: t('Male') },
                                { value: 'F', title: t('Female') }
                              ]"
                      :placeholder="$t('Gender')"
                      :label="$t('Gender')"
                    />
                  </VCol>
                  <VCol>
                    <AppDateTimePicker
                      v-model="form.dob"
                      :placeholder="$t('Select date')"
                      :label="$t('Date of Birth')"
                    />
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
            <VCard
                :title="$t('Account')"
                class="mt-3"
              >
              <VCardText>
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      v-model="form.username"
                      :label="$t('Username')"
                      :rules="[requiredValidator]"
                      :error-messages="form.errors.username"
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                        v-model="form.password"
                        :label="$t('Password')"
                        placeholder="············"
                        :rules="[requiredValidator]"
                        :type="isPasswordVisible ? 'text' : 'password'"
                        autocomplete="password"
                        :error-messages="form.errors.password"
                        :append-inner-icon="isPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                        @click:append-inner="isPasswordVisible = !isPasswordVisible"
                        hide-details="auto"
                      />
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                        v-model="form.password_confirmation"
                        :label="$t('Confirm Password')"
                        placeholder="············"
                        :rules="[confirmedValidator(form.password_confirmation, form.password)]"
                        :type="isConfirmPasswordVisible ? 'text' : 'password'"
                        autocomplete="password"
                        :error-messages="form.errors.password_confirmation"
                        :append-inner-icon="isConfirmPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                        @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                        hide-details="auto"
                      />
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </VCol>

          <VCol md="4" cols="12">
            <VCard
                :title="$t('Accesses')"
              >
              <VCardText>
                <VRow>
                  <VCol cols="12">
                    <AppSelect
                      v-model="form.role"
                      :items="props.roles"
                      item-title="name"
                      item-value="id"
                      :placeholder="$t('Role')"
                      :rules="[requiredValidator]"
                    />
                  </VCol>
                  <VCol cols="12">
                    <AppSelect
                      v-model="form.status"
                      :items="props.statuses"
                      item-title="value"
                      item-value="key"
                      :placeholder="$t('Status')"
                      :rules="[requiredValidator]"
                    />
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>

      <div class="d-flex justify-end gap-x-4">
        <VBtn
          type="button"
          color="primary"
          variant="text"
          class="mt-4"
          @click="$inertia.visit('/admin/user/')"
          >
          <VIcon start>
            mdi-arrow-left
          </VIcon>
          {{$t('Back')}}
        </VBtn>
        <VBtn
          type="submit"
          color="primary"
          :class="['mt-4', { 'opacity-25': form.processing }]"
          :disabled="form.processing"
          >
          {{$t('Submit')}}
        </VBtn>
      </div>
    </VForm>
  </DefaultLayoutWithVerticalNav>
</template>
