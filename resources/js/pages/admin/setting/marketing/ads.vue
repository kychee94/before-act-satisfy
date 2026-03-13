<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { Head, Link, useForm } from '@inertiajs/vue3';
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const props = defineProps({
    domains: Object,
})

// Setting Form
const adsFormRef = ref()
const selectedDomain = ref()
const ads_form = useForm({
  domain_id: null,
  pixel_id: null,
  access_token: null,
  ads_pixel: null,
})
const domain = ref(null)

const onSubmit = (formRef, formInstance, element) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post('/admin/setting/marketing/update/'+element, {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
      }
  });
}

// on change update value
watch(() => domain.value, (newVal) => {
  ads_form.domain_id = newVal?.id || ''
  ads_form.access_token = newVal?.access_token || ''
  ads_form.pixel_id = newVal?.pixel_id || ''
  ads_form.ads_pixel = newVal?.ads_pixel || ''
})

</script>

<template>
    <Head :title="$t('Marketing')"/>
    <VCard
        class="mb-6"
        :title="$t('%s Info',{'type': 'Ads Pixel'})"
      >
      <VCardText>
        <VForm
          ref="adsFormRef"
          @submit.prevent="onSubmit(adsFormRef, ads_form, 'ads')"
          >
          <VRow>
            <VCol cols="12">
              <AppSelect
                name="domain_id"
                v-model="domain"
                :items="domains"
                item-title="domain"
                item-value="id"
                :label="$t('Domain')"
                :placeholder="$t('Select %s', {'type': 'Domain'})"
                return-object
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                name="pixel_id"
                v-model="ads_form.pixel_id"
                :label="$t('Pixel ID')"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                name="access_token"
                v-model="ads_form.access_token"
                :label="$t('Access Token')"
              />
            </VCol>
            <VCol cols="12">
              <AppTextarea
                name="ads_pixel"
                v-model="ads_form.ads_pixel"
                :label="$t('Ads Pixel')"
                auto-grow
              />
            </VCol>
            <VBtn
              block
              type="submit"
              color="primary"
              :class="['mt-4', { 'opacity-25': ads_form.processing }]"
              :disabled="ads_form.processing"
            >
             {{$t('Submit')}}
            </VBtn>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
