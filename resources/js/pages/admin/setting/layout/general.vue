<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { Head, Link, useForm } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n'
import { imageUploads } from '@/composables/imageUploads'
import TiptapEditor from '@/components/CustomTiptapEditor.vue'

const { t } = useI18n()
const { languages } = usePage().props

const props = defineProps({
    form: Object,
    pageTitle: String,
    layoutInfo: [Array, Object],
})

const logoInput = ref()
const faviconInput = ref()
const popupImage = ref()
const {
  local,
  changeImage,
  removeImage
} = imageUploads(props.form)

const popupRadioContent = [
  {
    title: t('Image'),
    icon: {
      icon: 'mdi-file-image',
      size: '28',
    },
    value: 'image',
  },
  {
    title: t('Text'),
    icon: {
      icon: 'mdi-format-text',
      size: '28',
    },
    value: 'text',
  },
]

</script>

<template>
    <Head :title="$t('Layout')"/>
    <VCard
        class="mb-6"
        :title="$t('General')"
      >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex align-center">
              <label class="v-label mb-1 text-body-1">{{$t('Under Construction')}}</label>
              <VSwitch
                v-model="props.form.under_construction"
                density="compact"
                class="ms-6"
              />
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VCard
        class="mb-6"
        :title="$t('Logo')"
      >
      <VCardText>
        <VRow>
          <VCol md="6" cols="12">
            <label class="v-label mb-1 text-body-1">{{$t('Logo')}}</label>
            <div class="d-flex flex-wrap gap-4">
              <VBtn
                color="primary"
                size="small"
                @click="logoInput?.click()"
              >
                <VIcon
                  icon="tabler-cloud-upload"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">{{$t('Upload')}}</span>
              </VBtn>

              <input
                ref="logoInput"
                type="file"
                name="logo"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @change="e => changeImage(e, 'logo')"
              >

              <input
                type="hidden"
                name="logoInput"
                v-model="props.form.logo"
                hide-details
              >

              <VBtn
                v-if="local.logo"
                type="button"
                size="small"
                color="error"
                variant="tonal"
                @click="() => removeImage('logo')"
              >
                <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                <VIcon
                  icon="tabler-trash"
                  class="d-sm-none"
                />
              </VBtn>
            </div>
            <p class="text-body-1 mb-0">
              {{$t('Allowed JPG, GIF or PNG. Max size of %s', {size: '1MB'})}}
            </p>
            <VAvatar
                v-if="local.logo"
                rounded
                size="100"
                :image="local.logo"
              />
          </VCol>
          <VCol md="6" cols="12">
            <label class="v-label mb-1 text-body-1">{{$t('Favicon')}}</label>
            <div class="d-flex flex-wrap gap-4">
              <VBtn
                color="primary"
                size="small"
                @click="faviconInput?.click()"
              >
                <VIcon
                  icon="tabler-cloud-upload"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">{{$t('Upload')}}</span>
              </VBtn>

              <input
                ref="faviconInput"
                type="file"
                name="favicon"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @change="e => changeImage(e, 'favicon')"
              >

              <input
                type="hidden"
                name="faviconInput"
                v-model="props.form.favicon"
                hide-details
              >

              <VBtn
                v-if="local.favicon"
                type="button"
                size="small"
                color="error"
                variant="tonal"
                @click="() => removeImage('favicon')"
              >
                <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                <VIcon
                  icon="tabler-trash"
                  class="d-sm-none"
                />
              </VBtn>
            </div>
            <p class="text-body-1 mb-0">
              {{$t('Allowed JPG, GIF or PNG. Max size of %s', {size: '1MB'})}}
            </p>
            <VAvatar
                v-if="local.favicon"
                rounded
                size="100"
                :image="local.favicon"
              />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VCard
        class="mb-6"
        :title="$t('Popup')"
      >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex align-center">
              <label class="v-label mb-1 text-body-1">{{$t('Enable %s',{'name': $t('Popup')})}}</label>
              <VSwitch
                v-model="props.form.popup_enable"
                density="compact"
                class="ms-6"
              />
            </div>
          </VCol>
          <VCol cols="12">
            <div class="d-flex align-center">
              <CustomRadiosWithIcon
                v-model:selected-radio="props.form.popup_type"
                :radio-content="popupRadioContent"
                :grid-column="{ cols: '12', sm: '6' }"
              />
            </div>
          </VCol>
          <VCol 
            v-if="props.form.popup_type == 'image'"
            cols="12"
            >
            <label class="v-label mb-1 text-body-1">{{$t('Image')}}</label>
            <div class="d-flex flex-wrap gap-4">
              <VBtn
                color="primary"
                size="small"
                @click="popupImage?.click()"
              >
                <VIcon
                  icon="tabler-cloud-upload"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">{{$t('Upload')}}</span>
              </VBtn>

              <input
                ref="popupImage"
                type="file"
                name="popup_image"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @change="e => changeImage(e, 'popup_image')"
              >
              
              <input
                type="hidden"
                name="popupImage"
                v-model="props.form.popup_image"
                hide-details
              >

              <VBtn
                v-if="local.popup_image"
                type="button"
                size="small"
                color="error"
                variant="tonal"
                @click="() => removeImage('popup_image')"
              >
                <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                <VIcon
                  icon="tabler-trash"
                  class="d-sm-none"
                />
              </VBtn>
            </div>
            <p class="text-body-1 mb-0">
              {{$t('Allowed JPG, GIF or PNG. Max size of %s', {size: '1MB'})}}
            </p>
            <VAvatar
                v-if="local.popup_image"
                rounded
                size="100"
                :image="local.popup_image"
              />
          </VCol>
          <VCol
              v-if="props.form.popup_type == 'text'"
              v-for="lang in languages"
              :key="lang.lang_code"
              cols="12"
            >
            <label class="v-label mb-1 text-body-1">
              {{$t('Description')}} ({{ lang.lang_native_name }})
            </label>

            <TiptapEditor v-model="props.form.popup_description[lang.lang_code]" :name="`popup_description[${lang.lang_code}]`"/>

          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VCard
        class="mb-6"
        :title="$t('Footer')"
      >
      <VCardText>
        <VRow>
          <VCol cols=12>
            <AppTextField
              name="footer_text"
              v-model="props.form.footer_text"
              :label="$t('Text')"
            />
          </VCol>
          <VCol
              v-for="lang in languages"
              :key="lang.lang_code"
              cols="12"
            >
            <label class="v-label mb-1 text-body-1">
              {{$t('Description')}} ({{ lang.lang_native_name }})
            </label>

            <TiptapEditor v-model="props.form.footer_description[lang.lang_code]" />

          </VCol>
        </VRow>
      </VCardText>
    </VCard>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
