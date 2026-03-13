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
  agent: undefined,
  phone: undefined,
  password: undefined,
  password_confirmation: undefined,
})

const showDialog = ref(false)
const modalContent = ref('')
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const props = defineProps({
    pageTitle: String,
    countries: [Array, Object], 
    agents: [Array, Object],
    errors: [Array, Object],
    statuses: [Array, Object],
})

const formRef = ref()
const form = useForm({
  username: '',
  name: '',
  agent: '',
  member_phone: '',
  member_country: null,
  status: null,
  password: '',
  password_confirmation: '',
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route('admin.member.store'), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
      }
  });
}

const currentRegex = computed(() => {
    const country = props.countries.find(c => c.iso === form.member_country)
    return country ? new RegExp(country.phone_regex) : null
})

const phoneValidator = value => {
    if (currentRegex.value && !currentRegex.value.test(value)) {
      return t(`Invalid phone number for %s`, {'type': form.member_country})
    }
    return true
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
                      <AppSelect
                        v-model="form.agent"
                        :items="props.agents"
                        item-title="username"
                        item-value="uuid"
                        :placeholder="$t('Agent')"
                        :label="$t('Agent')"
                        :rules="[requiredValidator]"
                        clearable
                      />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12">
                      <AppTextField
                          v-model="form.member_phone"
                          :error-messages="form.errors.phone"
                          :rules="[phoneValidator]"
                          :label="$t('Phone')"
                        >
                        <template #prepend>
                          <VSelect
                            v-model="form.member_country"
                            :items="props.countries"
                            item-title="iso"
                            item-value="iso"
                            density="comfortable"
                            hide-details
                            style="max-width: 120px; min-width: 80px;"
                            class="country-select"
                            clearable
                          >
                            <template #selection="{ item }">
                              <span class="text-sm">{{ item.raw.phonecode }}</span>
                            </template>
                            <template #item="{ item, props: itemProps }">
                              <VListItem v-bind="itemProps">
                                <VListItemTitle>(+{{ item.raw.phonecode }})</VListItemTitle>
                              </VListItem>
                            </template>
                          </VSelect>
                        </template>
                      </AppTextField>
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
          @click="$inertia.visit('/admin/member')"
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