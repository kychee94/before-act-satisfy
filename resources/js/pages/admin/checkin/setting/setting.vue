<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const selected = ref([])
const modalContent = ref('')
const imageInputs = ref([])

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    checkin: [Array, Object]
})

// Setting Form
const formRef = ref()
const checkin_form = useForm({
  enable: props.checkin?.enable || false,
  days: props.checkin?.days || null,
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post('/admin/checkin/update/setting', {
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
    <VCard
        class="mb-6"
        :title="$t('Setting')"
      >
      <VCardText>
        <VForm
          ref="checkinFormRef"
          @submit.prevent="onSubmit(formRef, checkin_form)"
          >
          <VRow>
            <VCol cols="12">
              <div class="d-flex align-center">
                <label class="v-label mb-1 text-body-1">{{$t('Enable')}}</label>
                <VSwitch
                  v-model="checkin_form.enable"
                  density="compact"
                  class="ms-6"
                />
              </div>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="checkin_form.days"
                :label="t('Days')"
                variant="outlined"
                density="compact"
              />
            </VCol>
            <VBtn
              block
              type="submit"
              color="primary"
              :class="['mt-4', { 'opacity-25': checkin_form.processing }]"
              :disabled="checkin_form.processing"
            >
             {{$t('Submit')}}
            </VBtn>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
</template>

<style scoped lang="scss">
@use "@core-scss/template/pages/misc.scss";

.centered-input :deep(input) {
  text-align: center;
}
</style>
