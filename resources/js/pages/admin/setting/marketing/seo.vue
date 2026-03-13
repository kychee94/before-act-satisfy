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
    seoInfo: [Array, Object],
})

// Setting Form
const seoFormRef = ref()
const seo_form = useForm({
  metaTitle: props.seoInfo?.metaTitle || null,
  metaDescription: props.seoInfo?.metaDescription || null,
  metaKeywords: props.seoInfo?.metaKeywords || null,
})

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
</script>

<template>
    <Head :title="$t('Marketing')"/>
    <VCard
        class="mb-6"
        :title="$t('%s Info',{'type': 'SEO'})"
      >
      <VCardText>
        <VForm
          ref="seoFormRef"
          @submit.prevent="onSubmit(seoFormRef, seo_form, 'seo')"
          >
          <VRow>
            <VCol cols="12">
              <AppTextField
                name="metaTitle"
                v-model="seo_form.metaTitle"
                :label="$t('Meta Title')"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                name="metaDescription"
                v-model="seo_form.metaDescription"
                :label="$t('Meta Tag Description')"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                name="metaKeywords"
                v-model="seo_form.metaKeywords"
                :label="$t('Meta Keywords')"
              />
            </VCol>
            <VBtn
              block
              type="submit"
              color="primary"
              :class="['mt-4', { 'opacity-25': seo_form.processing }]"
              :disabled="seo_form.processing"
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
