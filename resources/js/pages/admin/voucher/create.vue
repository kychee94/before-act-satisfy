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
import Category from '@/pages/admin/product/category.vue'

const page = usePage()
const { languages } = usePage().props
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const loadingStore = useLoadingStore()

const showDialog = ref(false)
const modalContent = ref('')

const props = defineProps({
    pageTitle: String,
    statuses: [Array, Object],
    types: [Array, Object],
})

const formRef = ref()
const form = useForm({
  voucher_name: '',
  voucher_code: '',
  start_date: '',
  end_date: '',
  description: null,
  voucher_type: null,
  discount_rate: '',
  min_spend: '',
  max_claim: '',
  reusable: false,
  all_member: false,
  status: null,
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...data,
  })).post(route('admin.voucher.store'), {
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
                        v-model="form.voucher_name"
                        :label="$t('Voucher Name')"
                        :rules="[requiredValidator]"
                      />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12">
                      <AppTextField
                        v-model="form.voucher_code"
                        :label="$t('Voucher Code')"
                        :rules="[requiredValidator]"
                      />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12">
                      <AppDateTimePicker
                        v-model="form.start_date"
                        :placeholder="$t('Start date')"
                        :label="$t('Start Date')"
                        :rules="[requiredValidator]"
                        :config="{
                          enableTime: true,
                          dateFormat: 'Y-m-d H:i',
                        }"
                      />
                    </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12">
                      <AppDateTimePicker
                        v-model="form.end_date"
                        :placeholder="$t('End date')"
                        :label="$t('End Date')"
                        :rules="[requiredValidator]"
                        :config="{
                          enableTime: true,
                          dateFormat: 'Y-m-d H:i',
                        }"
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
                        :label="$t('Status')"
                      />
                    </div>
                  </VCol>
                  <VCol cols="12">
                    <div class="d-flex align-center">
                      <VSwitch
                        v-model="form.reusable"
                        density="compact"
                        class="me-6"
                        :label="t('Reusable')"
                      />
                    </div>
                  </VCol>
                  <VCol cols="12">
                    <div class="d-flex align-center">
                      <VSwitch
                        v-model="form.all_member"
                        density="compact"
                        class="me-6"
                        :label="t('For All')"
                      />
                    </div>
                  </VCol>
                  <VCol cols="12">
                    <AppTextField
                      v-model.number="form.min_spend"
                      type="number"
                      step="0.01"
                      :label="$t('Min Spend')"
                      :suffix="$t('points')"
                    />
                  </VCol>
                  <VCol cols="12">
                    <div class="d-flex align-center">
                      <AppSelect
                        v-model="form.voucher_type"
                        :items="props.types"
                        item-title="value"
                        item-value="key"
                        :placeholder="$t('Type')"
                        :label="$t('Type')"
                      />
                    </div>
                  </VCol>
                  <VCol cols="12"
                    v-if="form.voucher_type"
                    >
                    <AppTextField
                      v-model.number="form.discount_rate"
                      type="number"
                      step="0.01"
                      :label="$t('Discount')"
                      :suffix="form.voucher_type == 'PERCENTAGE' ? '%' : $t('points')"
                    />
                  </VCol>
                  <VCol cols="12"
                    v-if="form.voucher_type == 'PERCENTAGE'"
                    >
                    <AppTextField
                      v-model.number="form.max_claim"
                      type="number"
                      step="0.01"
                      :label="$t('Max Claimable Amount')"
                      :suffix="$t('points')"
                    />
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VCard
                :title="t('Description')"
              >
              <VCardText>
                <VCol cols="12">
                  <label class="v-label mb-1 text-body-1">
                    {{$t('Description')}}
                  </label>
                  <TiptapEditor v-model="form.voucher_description"/>
                </VCol>
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
          @click="$inertia.visit('/admin/voucher')"
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