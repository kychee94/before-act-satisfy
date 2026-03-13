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

const page = usePage()
const { languages } = usePage().props
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const loadingStore = useLoadingStore()

const errors = ref({
  username: undefined,
  name: undefined,
  password: undefined,
  password_confirmation: undefined,
})

const showDialog = ref(false)
const modalContent = ref('')
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const props = defineProps({
    pageTitle: String,
    errors: [Array, Object],
    statuses: [Array, Object],
})

const formRef = ref()
const form = useForm({
  username: '',
  name: '',
  status: null,
  password: '',
  password_confirmation: '',
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route('admin.agent.store'), {
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
                class="mb-3"
              >
              <VCardText>
                <VRow>
                    <VCol cols="12">
                      <AppTextField
                        v-model="form.username"
                        :error-messages="form.errors.username"
                        :label="$t('Username')"
                        :rules="[requiredValidator]"
                      />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12">
                      <AppTextField
                        v-model="form.name"
                        :error-messages="form.errors.name"
                        :label="$t('Name')"
                        :rules="[requiredValidator]"
                      />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12">
                      <AppTextField
                          v-model="form.password"
                          :label="$t('Password')"
                          placeholder="············"
                          :type="isPasswordVisible ? 'text' : 'password'"
                          autocomplete="password"
                          :error-messages="form.errors.password"
                          :append-inner-icon="isPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                          @click:append-inner="isPasswordVisible = !isPasswordVisible"
                          hide-details="auto"
                        />
                    </VCol>
                </VRow>
                <VRow>
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
                :title="$t('Properties')"
              >
              <VCardText>
                <VRow>
                  <VCol cols="12">
                    <div class="d-flex align-center">
                      <AppSelect
                        v-model="form.status"
                        :items="props.statuses"
                        item-title="value"
                        item-value="key"
                        :placeholder="$t('Status')"
                        :rules="[requiredValidator]"
                      />
                    </div>
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
          @click="$inertia.visit('/admin/agent')"
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

<style>
  .v-text-field__prefix {
    opacity: 1;
  }
</style>