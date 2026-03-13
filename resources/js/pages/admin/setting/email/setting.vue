<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const showDialog = ref(false)
const modalContent = ref('')

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    emailInfo: [Array, Object]
})

const headers = [
  // {
  //   title: '',
  //   key: 'data-table-select',
  //   color: 'primary'
  // },
  {
    title: t('Recipient'),
    key: 'recipient',
  },
  {
    title: t('Subject'),
    key: 'subject',
  },
  {
    title: 'IP',
    key: 'ip',
  },
  {
    title: t('Sent Date'),
    key: 'sent_date',
  },
  {
    title: t('Action'),
    key: 'action',
    sortable: false,
  },
]

const stmpPorts = [
  { value: '25', label: '25 (Default SMTP Port)' },
  { value: '465', label: '465 (Use for SSL/GMAIL)' },
  { value: '587', label: '587 (Use for TLS/STARTTLS/GMAIL)' },
  { value: '', label: 'Custom Port: (Use Box)' },
]

const ssls = [
  { value: 'none', label: 'None' },
  { value: 'ssl', label: 'SSL' },
  { value: 'tls', label: 'TLS' },
]

const ports = [
  { value: '110', label: '110 (Default POP Port)' },
  { value: '995', label: '995 (Use for SSL/GMAIL)' },
  { value: '', label: 'Custom Port: (Use Box)' },
]

// Setting Form
const settingForm = ref()
const connectionForm = ref()
const form = useForm({
  email_to: props.emailInfo?.email_to || '',
  email_smtp_server_address: props.emailInfo?.email_smtp_server_address || '',
  email_smtp_port: props.emailInfo?.email_smtp_port || '25',
  email_smtp_custom_port: props.emailInfo?.email_smtp_custom_port || '',
  email_smtp_username: props.emailInfo?.email_smtp_username || '',
  email_smtp_password: props.emailInfo?.email_smtp_password || '',
  email_ssl_tls: props.emailInfo?.email_ssl_tls || 'none',
})

const form2 = useForm({})

const onSubmit = () => {
  settingForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      form.transform(data => ({
        ...data,
      })).post(route('admin.setting.email.update'), {
          onStart: () => {
            loadingStore.start()
          },
          onFinish: () => {
            loadingStore.stop()
          }
      });
  })
}

const testConnection = () => {
  connectionForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      form2.transform(data => ({
        ...data,
      })).post(route('admin.setting.email.test'), {
          onStart: () => {
            loadingStore.start()
          },
          onFinish: () => {
            loadingStore.stop()
          }
      });
  })
}

</script>

<template>
  <Head :title="$t('Email')"/>
  <VRow>
  <VCol>
    <VCard
        class="mb-6"
        :title="$t('Setting')"
      >
      <VCardText>
        <VForm
          ref="settingForm"
          @submit.prevent="onSubmit"
          >
          <VRow>
            <VCol cols="12">
              <AppTextField
                name="email_to"
                v-model="form.email_to"
                :label="`${$t('Email')} (${$t('To')})`"
              />
              <div class="text-base text-emphasis pb-2">
                {{$t('Add Comma for multiple emails')}}
              </div>
            </VCol>
            <VCol cols="12">
              <AppTextField
                name="email_smtp_server_address"
                v-model="form.email_smtp_server_address"
                :label="$t('SMTP Server Address')"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="form.email_smtp_port"
                name="email_smtp_port"
                :items="stmpPorts"
                :label="$t('SMTP Port')"
                item-title="label"
                item-value="value"
              />
            </VCol>
            <VCol 
              v-if="form.email_smtp_port === ''"
              cols="12">
              <AppTextField
                v-model="form.email_smtp_custom_port"
                name="email_smtp_custom_port"
                :label="$t('Enter custom SMTP Port')"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                name="email_smtp_username"
                v-model="form.email_smtp_username"
                :label="$t('SMTP Username')"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                name="email_smtp_password"
                v-model="form.email_smtp_password"
                :label="$t('SMTP Password')"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="form.email_ssl_tls"
                name="email_ssl_tls"
                :items="ssls"
                label="SSL or TLS?"
                item-title="label"
                item-value="value"
              />
            </VCol>
            <VBtn
              block
              type="submit"
              color="primary"
              :class="['mt-4', { 'opacity-25': form.processing }]"
              :disabled="form.processing"
            >
             {{$t('Submit')}}
            </VBtn>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VCol>
  <VCol>
    <VCard
        class="mb-6"
        :title="$t('Test Connection')"
      >
        <VCardText>
          <VForm
            ref="connectionForm"
            @submit.prevent="testConnection"
          >
            <p>{{$t('Once you\'ve saved your settings, click the link below to test your connection.')}}</p>
            <div class="text-center">
              <VBtn
                type="submit"
                color="success"
                :class="['mt-4', { 'opacity-25': form2.processing }]"
                :disabled="form2.processing"
              >
               {{$t('Test Send')}}
              </VBtn>
            </div>
          </VForm>
        </VCardText>
    </VCard>
  </VCol>
</VRow>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
