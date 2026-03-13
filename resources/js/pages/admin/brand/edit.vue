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
    brand: [Array, Object]
})

const imageInput = ref()
const addQty = ref(0)

const formRef = ref()
const form = useForm({
  uuid: props.brand.uuid,
  brand_name: props.brand.brand_name || null,
  image: props.brand?.brand_image,
  imageInput: props.brand?.brand_image,
  brand_status: Boolean(props.brand.brand_status) || 0,
})

const {
  local,
  changeImage,
  removeImage,
} = imageUploads(form)

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route('admin.brand.update'), {
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
                        v-model="form.brand_name"
                        :label="$t('Brand Name')"
                        :rules="[requiredValidator]"
                      />
                    </VCol>
                </VRow>
                <VRow>
                  <VCol cols="12">
                    <label class="v-label mb-1 text-body-1">
                      {{$t('Image')}}
                      <VTooltip text="200 x 500 Pixels" location="bottom">
                        <template #activator="{ props }">
                          <VIcon
                            v-bind="props"
                            class="ms-2"
                            size="small"
                            icon="mdi-information-slab-circle-outline" 
                          />
                        </template>
                      </VTooltip>
                    </label>
                    <div class="d-flex flex-wrap gap-4">
                      <VBtn
                        color="primary"
                        size="small"
                        @click="imageInput?.click()"
                      >
                        <VIcon
                          icon="tabler-cloud-upload"
                          class="d-sm-none"
                        />
                        <span class="d-none d-sm-block">{{$t('Upload')}}</span>
                      </VBtn>

                      <input
                        ref="imageInput"
                        type="file"
                        name="image"
                        accept=".jpeg,.png,.jpg,GIF"
                        hidden
                        @change="e => changeImage(e, 'image')"
                      >

                      <input
                          type="hidden"
                          name="imageInput"
                          v-model="form.image"
                          hide-details
                        >
                      <VBtn
                        v-if="local.image"
                        type="button"
                        size="small"
                        color="error"
                        variant="tonal"
                        @click="() => removeImage('image')"
                      >
                        <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                        <VIcon
                          icon="tabler-trash"
                          class="d-sm-none"
                        />
                      </VBtn>
                    </div>
                    <VAvatar
                        v-if="local.image"
                        rounded
                        size="100"
                        class="mt-3"
                        :image="local.image"
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
                      <VSwitch
                        v-model="form.brand_status"
                        density="compact"
                        class="me-6"
                        :label="t('Status')"
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
  </DefaultLayoutWithVerticalNav>
</template>

<style>
  .v-text-field__prefix {
    opacity: 1;
  }
</style>