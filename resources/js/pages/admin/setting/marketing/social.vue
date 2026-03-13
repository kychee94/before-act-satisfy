<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { Head, Link, useForm } from '@inertiajs/vue3';
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'
import { imageUploads } from '@/composables/imageUploads'

const { t } = useI18n()

const loadingStore = useLoadingStore()

const props = defineProps({
    socialInfo: [Array, Object],
})

// Setting Form
const socialFormRef = ref()
const refInputEl = ref()
const social_form = useForm({
  fbURL: props.socialInfo?.fbURL || null,
  whatsappURL: props.socialInfo?.whatsappURL || null,
  wechatID: props.socialInfo?.wechatID || null,
  telegramURL: props.socialInfo?.telegramURL || null,
  youtubeURL: props.socialInfo?.youtubeURL || null,
  instagramURL: props.socialInfo?.instagramURL || null,
  tiktokURL: props.socialInfo?.tiktokURL || null,
  apkURL: props.socialInfo?.apkURL || null,
  wechatQR: props.socialInfo?.wechatQR || null,
  wechatQRInput: props.socialInfo?.wechatQR || null,
})

const {
  local: social_local,
  changeImage,
  removeImage,
  refs
} = imageUploads(social_form)

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
        :title="$t('%s Info',{'type': 'Social'})"
      >
        <VCardText>
          <VForm
            ref="socialFormRef"
            @submit.prevent="onSubmit(socialFormRef, social_form, 'social')"
            >
            <VRow>
              <VCol cols="12">
                <VTextField
                  name="fbURL"
                  v-model="social_form.fbURL"
                  label="Facebook"
                  variant="outlined"
                  prepend-icon="mdi-facebook"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  name="whatsappURL"
                  v-model="social_form.whatsappURL"
                  label="Whatsapp"
                  prepend-icon="mdi-whatsapp"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  name="wechatID"
                  v-model="social_form.wechatID"
                  label="WeChat ID"
                  prepend-icon="mdi-wechat"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  name="telegramURL"
                  v-model="social_form.telegramURL"
                  label="Telegram"
                  prepend-icon="tabler:telegram"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  name="youtubeURL"
                  v-model="social_form.youtubeURL"
                  label="YouTube"
                  prepend-icon="mdi-youtube"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  name="instagramURL"
                  v-model="social_form.instagramURL"
                  label="Instagram"
                  prepend-icon="mdi-instagram"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  name="tiktokURL"
                  v-model="social_form.tiktokURL"
                  label="TikTok"
                  prepend-icon="tabler:tiktok"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  name="apkURL"
                  v-model="social_form.apkURL"
                  label="APK"
                  prepend-icon="mdi-android"
                />
              </VCol>
              <VCol cols="12">
                <div class="d-flex">
                  <VIcon
                    icon="mdi-qrcode"
                    size="small"
                    />
                  <div class="d-flex flex-wrap gap-4 ms-4">
                    <VBtn
                      color="primary"
                      size="small"
                      @click="refInputEl?.click()"
                      label="Wechat QR"
                    >
                      <VIcon
                        icon="tabler-cloud-upload"
                        class="d-sm-none"
                      />
                      <span class="d-none d-sm-block">{{$t('Upload')}}</span>
                    </VBtn>

                    <input
                      ref="refInputEl"
                      type="file"
                      name="wechatQR"
                      accept=".jpeg,.png,.jpg,GIF"
                      hidden
                      @change="e => changeImage(e, 'wechatQR')"
                    >
                    <input
                      type="hidden"
                      name="wechatQRInput"
                      v-model="social_form.wechatQR"
                      hide-details
                    >

                    <VBtn
                      v-if="social_local.wechatQR"
                      type="button"
                      size="small"
                      color="error"
                      variant="tonal"
                      @click="() => removeImage('wechatQR')"
                    >
                      <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                      <VIcon
                        icon="tabler-trash"
                        class="d-sm-none"
                      />
                    </VBtn>
                  </div>
                </div>
                <p class="text-body-1 mb-0 ms-8">
                  {{$t('Allowed JPG, GIF or PNG. Max size of %s', {size: '1MB'})}}
                </p>
                <VAvatar
                    v-if="social_local.wechatQR"
                    rounded
                    size="100"
                    class="ms-8"
                    :image="social_local.wechatQR"
                    prepend-icon="mdi-qrcode"
                  />
              </VCol>
              <VBtn
                block
                type="submit"
                color="primary"
                :class="['mt-4', { 'opacity-25': social_form.processing }]"
                :disabled="social_form.processing"
              >
               {{$t('Submit')}}
              </VBtn>
            </VRow>
          </VForm>
        </VCardText>
    </VCard>
</template>

<style>
  .mdi-facebook::before{
    color: #1877f2;
  }
  .mdi-whatsapp:before{
    color: #25D366;
  }
  .mdi-wechat:before{
    color: #7BB32E;
  }
  .mdi-youtube:before{
    color: #FF0000;
  }
  .mdi-instagram:before{
    color: #E1306C;
  }
  .tabler-icon-brand-telegram{
    color: #0088CC !important;
  }
  .mdi-android::before{
    color: #3DDC84;
  }
</style>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
