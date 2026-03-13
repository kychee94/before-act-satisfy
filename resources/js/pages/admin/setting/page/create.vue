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
    templates: [Array, Object]
})

const page_title = {}
const page_description = {}
const page_seo_title = {}
const page_seo_keyword = {}
const page_seo_description = {}
const iconInput = ref()
const imageInput = {
  'pc': {},
  'mobile': {}
}

languages.forEach(lang => {
  imageInput.pc[lang.lang_code] = ''
  imageInput.mobile[lang.lang_code] = ''
  page_title[lang.lang_code] = ''
  page_description[lang.lang_code] = ''
  page_seo_title[lang.lang_code] = ''
  page_seo_keyword[lang.lang_code] = ''
  page_seo_description[lang.lang_code] = ''
})

const activeTab = ref(languages[0].lang_code)
const formRef = ref()
const form = useForm({
  page_title: page_title,
  page_url_title: '',
  page_link: '',
  page_template: 'Default',
  page_seo_title: page_seo_title,
  page_seo_keyword: page_seo_keyword,
  page_seo_description: page_seo_description,
  page_description: page_description,
  icon: iconInput,
  iconInput: iconInput,
  image: imageInput,
  imageInput: imageInput,
  page_status: 0,
  page_menu: 0,
  page_login: 0
})

const {
  local,
  changeImage,
  removeImage,
  changeImageWithLayoutWithLanguage,
  removeImageWithLayoutWithLanguage
} = imageUploads(form)

const defaultTemplates = [
      { template_name: 'Default' },
      { template_name: 'Redirect' },
    ]

const templates = computed(() => [
    ...defaultTemplates,
    ...(Array.isArray(props.templates)
      ? props.templates
      : props.templates
      ? [props.templates]
      : []),
  ])


const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route('admin.setting.page.store'), {
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
              >
              <VCardText>
                <VRow
                    v-for="lang in languages"
                    :key="lang.lang_code"
                  >
                    <VCol cols="12">
                      <AppTextField
                        v-model="form.page_title[lang.lang_code]"
                        :label="`${t('Page Title')} (${lang.lang_name})`"
                        :rules="[requiredValidator]"
                      />
                    </VCol>
                </VRow>
                <VRow>
                  <VCol cols="12">
                    <AppTextField
                      :prefix="$t('Domain')"
                      v-model="form.page_url_title"
                      :rules="[requiredValidator]"
                      label="URL"
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol cols="12">
                    <AppSelect
                      v-model="form.page_template"
                      :items="templates"
                      item-title="template_name"
                      item-value="template_name"
                      :label="$t('Page Template')"
                    />
                  </VCol>
                </VRow>
                <VRow
                  v-if="form.page_template == 'Redirect'"
                  >
                  <VCol cols="12">
                    <AppTextField
                      v-model="form.page_link"
                      placeholder="https://google.com"
                      :label="$t('Redirect Link')"
                      :rules="form.page_template === 'Redirect' ? [requiredValidator] : []"
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
                    <label class="v-label mb-1 text-body-1">
                      {{$t('Icon')}}
                      <VTooltip text="200 x 200 Pixels" location="bottom">
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
                        @click="iconInput?.click()"
                      >
                        <VIcon
                          icon="tabler-cloud-upload"
                          class="d-sm-none"
                        />
                        <span class="d-none d-sm-block">{{$t('Upload')}}</span>
                      </VBtn>

                      <input
                        ref="iconInput"
                        type="file"
                        name="icon"
                        accept=".jpeg,.png,.jpg,GIF"
                        hidden
                        @change="e => changeImage(e, 'icon')"
                      >

                      <input
                          type="hidden"
                          name="iconInput"
                          v-model="form.icon"
                          hide-details
                        >

                      <VBtn
                        v-if="local.icon"
                        type="button"
                        size="small"
                        color="error"
                        variant="tonal"
                        @click="() => removeImage('icon')"
                      >
                        <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                        <VIcon
                          icon="tabler-trash"
                          class="d-sm-none"
                        />
                      </VBtn>
                    </div>
                    <VAvatar
                        v-if="local.icon"
                        rounded
                        size="100"
                        class="mt-3"
                        :image="local.icon"
                      />
                  </VCol>

                  <VCol cols="12">
                    <div class="d-flex align-center">
                      <VSwitch
                        v-model="form.page_status"
                        density="compact"
                        class="me-6"
                        :label="t('Status')"
                      />
                    </div>
                  </VCol>
                  <VCol cols="12">
                    <div class="d-flex align-center">
                      <VSwitch
                        v-model="form.page_menu"
                        density="compact"
                        class="me-6"
                        :label="t('Show in Menu')"
                      />
                    </div>
                  </VCol>
                  <VCol cols="12">
                    <div class="d-flex align-center">
                      <VSwitch
                        v-model="form.page_login"
                        density="compact"
                        class="me-6"
                        :label="t('Login Required?')"
                      />
                    </div>
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VCard
                :title="t('Locale')"
              >
              <VCardText>
                <VRow>
                  <VCol
                    cols="12"
                    md="4"
                  >
                    <div class="pe-3">
                      <VTabs
                        v-model="activeTab"
                        direction="vertical"
                        color="primary"
                        class="v-tabs-pill"
                      >
                        <VTab
                          v-for="lang in languages"
                          :key="lang.lang_code"
                        >
                          <VImg
                            :src="`/images/svg/flags/${lang.lang_svg}.svg`"
                            :alt="lang.lang_native_name"
                            width="20px"
                            rounded
                            class="me-2"
                          />
                          <div class="text-truncate font-weight-medium text-start">
                            {{ lang.lang_native_name }}
                          </div>
                        </VTab>
                      </VTabs>
                    </div>
                  </VCol>

                  <VDivider :vertical="!$vuetify.display.smAndDown" />

                  <VCol
                      cols="12"
                      md="8"
                    >
                    <VWindow
                        v-model="activeTab"
                        class="w-100"
                        :touch="false"
                      >
                      <VWindowItem 
                          v-for="lang in languages"
                          :value="lang.lang_code"
                        >
                        <VRow>
                          <VCol md="6" cols="12">
                            <label class="v-label mb-1 text-body-1">
                              {{$t('Banner')}} ({{$t('PC')}})
                              <VTooltip text="1920 x 750 Pixels" location="bottom">
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
                                @click="$refs[`pc_${lang.lang_code}`]?.[0]?.click()"
                              >
                                <VIcon
                                  icon="tabler-cloud-upload"
                                  class="d-sm-none"
                                />
                                <span class="d-none d-sm-block">{{$t('Upload')}}</span>
                              </VBtn>

                              <input
                                :ref="`pc_${lang.lang_code}`"
                                type="file"
                                :name="`image[pc][${lang.lang_code}]`"
                                accept=".jpeg,.png,.jpg,GIF"
                                hidden
                                @change="e => changeImageWithLayoutWithLanguage(e, `image`, 'pc', lang.lang_code)"
                              >

                              <input
                                  type="hidden"
                                  :name="`imageInput[pc][${lang.lang_code}]`"
                                  v-model="form.image.pc[lang.lang_code]"
                                  hide-details
                                >

                              <VBtn
                                v-if="local.image['pc'][lang.lang_code]"
                                type="button"
                                size="small"
                                color="error"
                                variant="tonal"
                                @click="() => removeImageWithLayoutWithLanguage(`image`, 'pc', lang.lang_code)"
                              >
                                <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                                <VIcon
                                  icon="tabler-trash"
                                  class="d-sm-none"
                                />
                              </VBtn>
                            </div>
                            <VAvatar
                                v-if="local.image.pc[lang.lang_code]"
                                rounded
                                size="100"
                                class="mt-3"
                                :image="local.image.pc[lang.lang_code]"
                              />
                          </VCol>
                          <VCol md="6" cols="12">
                            <label class="v-label mb-1 text-body-1">
                              {{$t('Banner')}} ({{$t('Mobile')}})
                              <VTooltip text="1920 x 750 Pixels" location="bottom">
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
                                @click="$refs[`mobile_${lang.lang_code}`]?.[0]?.click()"
                              >
                                <VIcon
                                  icon="tabler-cloud-upload"
                                  class="d-sm-none"
                                />
                                <span class="d-none d-sm-block">{{$t('Upload')}}</span>
                              </VBtn>

                              <input
                                :ref="`mobile_${lang.lang_code}`"
                                type="file"
                                :name="`image[mobile][${lang.lang_code}]`"
                                accept=".jpeg,.png,.jpg,GIF"
                                hidden
                                @change="e => changeImageWithLayoutWithLanguage(e, `image`, 'mobile', lang.lang_code)"
                              >

                              <input
                                  type="hidden"
                                  :name="`imageInput[mobile][${lang.lang_code}]`"
                                  v-model="form.image.mobile[lang.lang_code]"
                                  hide-details
                                >

                              <VBtn
                                v-if="local.image['mobile'][lang.lang_code]"
                                type="button"
                                size="small"
                                color="error"
                                variant="tonal"
                                @click="() => removeImageWithLayoutWithLanguage(`image`, 'mobile', lang.lang_code)"
                              >
                                <span class="d-none d-sm-block">{{$t('Remove')}}</span>
                                <VIcon
                                  icon="tabler-trash"
                                  class="d-sm-none"
                                />
                              </VBtn>
                            </div>
                            <VAvatar
                                v-if="local.image['mobile'][lang.lang_code]"
                                rounded
                                size="100"
                                class="mt-3"
                                :image="local.image['mobile'][lang.lang_code]"
                              />
                          </VCol>

                          <VCol cols="12">
                            <AppTextField 
                              v-model="form.page_seo_title[lang.lang_code]"
                              :label="t('SEO Title')"
                            />
                          </VCol>
                          <VCol cols="12">
                            <AppTextField 
                              v-model="form.page_seo_keyword[lang.lang_code]"
                              :label="t('SEO Keyword')"
                            />
                          </VCol>
                          <VCol cols="12">
                            <AppTextField 
                              v-model="form.page_seo_description[lang.lang_code]"
                              :label="t('SEO Description')"
                            />
                          </VCol>
                          <VCol cols="12">
                            <label class="v-label mb-1 text-body-1">
                              {{$t('Description')}}
                            </label>
                            <TiptapEditor v-model="form.page_description[lang.lang_code]"/>
                          </VCol>
                        </VRow>
                      </VWindowItem>
                    </VWindow>
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
          @click="$inertia.visit('/admin/setting/page')"
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
