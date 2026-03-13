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

const showDialog = ref(false)
const modalContent = ref('')

const props = defineProps({
    gaInfo: [Array, Object],
})

// Setting Form
const gaFormRef = ref()
const ga_form = useForm({
  wt: props.gaInfo?.wt || null,
  ga: props.gaInfo?.ga || null,
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
        :title="$t('%s Info',{'type': 'Google Analytics'})"
      >
        <VCardText>
          <VForm
            ref="gaFormRef"
            @submit.prevent="onSubmit(gaFormRef, ga_form, 'ga')"
            >
            <VRow>
              <VCol cols="12">
                <AppTextarea
                  v-model="ga_form.wt"
                  name="wt"
                  :label="$t('Webmaster Tool Meta')"
                  auto-grow
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="ga_form.ga"
                  name="ga"
                  :label="$t('Google Analytics')"
                  auto-grow
                />
              </VCol>
              <VBtn
                block
                type="submit"
                color="primary"
                :class="['mt-4', { 'opacity-25': ga_form.processing }]"
                :disabled="ga_form.processing"
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
