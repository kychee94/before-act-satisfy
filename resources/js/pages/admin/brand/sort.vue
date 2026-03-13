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
import NestedSortable from '@/components/NestedSortable.vue'

const { t } = useI18n()
const drag = ref(false);

const loadingStore = useLoadingStore()

const formRef = ref()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    brands: [Array, Object],
})

const brands = ref(props?.brands ? props?.brands : [])
const form = useForm({
  brand: brands.value
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post('/admin/brand/sort/update', {
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
      <VCard>
        <VCardTitle>{{props.pageTitle}}</VCardTitle>
        <VCardText>
          <VCardItem class="px-0">
            <NestedSortable :model-value="form.brand" :maxDepth="0"/>
          </VCardItem>
        </VCardText>
        <VForm
            ref="formRef"
            method="post"
            @submit.prevent="onSubmit(formRef, form)"
          >
            <div class="d-flex justify-end gap-x-4 p-7">
              <VBtn
                type="button"
                color="primary"
                variant="text"
                class="mt-4"
                @click="$inertia.visit('/admin/brand')"
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
      </VCard>
  </DefaultLayoutWithVerticalNav>
</template>

<style scoped>
.draggable-item {
  padding: 10px;
  margin: 5px 0;
  background: linear-gradient(to bottom,  #ffffff 0%,#f6f6f6 47%,#ededed 100%);
  border-color: #D4D4D4 #D4D4D4 #BCBCBC;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  cursor: move;
  color: #5E6278;
}
</style>
