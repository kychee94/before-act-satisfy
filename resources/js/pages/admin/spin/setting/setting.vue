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
    spin: [Array, Object]
})

const selections = ref([
  { draws: null, points: null },
  { draws: null, points: null },
  { draws: null, points: null },
])

// Setting Form
const formRef = ref()
const spin_form = useForm({
  enable: props.spin?.enable || false,
  daily: props.spin?.daily || null,
  cost: props.spin?.cost || null,
  selection: props.spin?.selection || selections.value,
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post('/admin/spin/update/setting', {
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
          ref="spinFormRef"
          @submit.prevent="onSubmit(formRef, spin_form)"
          >
          <VRow>
            <VCol cols="12">
              <div class="d-flex align-center">
                <label class="v-label mb-1 text-body-1">{{$t('Enable')}}</label>
                <VSwitch
                  v-model="spin_form.enable"
                  density="compact"
                  class="ms-6"
                />
              </div>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" md="4">
              <AppTextField
                v-model="spin_form.daily"
                :label="t('Daily Free %s',{'name': $t('Spin')})"
                variant="outlined"
                density="compact"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" md="4">
              <AppTextField
                v-model="spin_form.cost"
                :label="t('Credit')"
                variant="outlined"
                density="compact"
                :suffix="t('Per Turn')"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTable class="text-no-wrap border">
                <thead class="bg-primary h-[40px]">
                  <tr>
                    <th class="border text-center">
                      {{$t('Draws')}}
                    </th>
                    <th class="border text-center">
                      {{$t('Total Points')}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(selection, index) in spin_form.selection" :key="index">
                    <td>
                      <AppTextField
                        v-model="spin_form.selection[index].draws"
                        type="number"
                        :placeholder="t('Draws')"
                      />
                    </td>
                    <td>
                      <AppTextField
                        v-model="spin_form.selection[index].points"
                        type="number"
                        :placeholder="t('Points')"
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCol>
          </VRow>

          <VBtn
              block
              type="submit"
              color="primary"
              :class="['mt-4', { 'opacity-25': spin_form.processing }]"
              :disabled="spin_form.processing"
            >
           {{$t('Submit')}}
          </VBtn>
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
