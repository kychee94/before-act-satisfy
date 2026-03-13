<script setup>
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import General from '@/pages/admin/setting/layout/general.vue'
import Notice from '@/pages/admin/setting/layout/notice.vue'
import Company from '@/pages/admin/setting/layout/company.vue'
import { usePage, router } from '@inertiajs/vue3'
import { Head, Link, useForm } from '@inertiajs/vue3';
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'

const page = usePage()
const { languages } = usePage().props
const { t } = useI18n()

const loadingStore = useLoadingStore()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    tab: String,
    pageTitle: String,
    layoutInfo: [Array, Object],
})

const popupDescription = {}
const footerDescription = {}
const homeNotice = {}
const generalNotice = {}
languages.forEach(lang => {
  popupDescription[lang.lang_code] =
    props.layoutInfo?.popup_description?.[lang.lang_code] || ''

  footerDescription[lang.lang_code] =
    props.layoutInfo?.footer_description?.[lang.lang_code] || ''

  homeNotice[lang.lang_code] =
    props.layoutInfo?.home_notice?.[lang.lang_code] || ''

  generalNotice[lang.lang_code] =
    props.layoutInfo?.general_notice?.[lang.lang_code] || ''
})

// Form
const formRef = ref()
const form = useForm({
  under_construction: props.layoutInfo?.under_construction || false,
  logo: props.layoutInfo?.logo,
  logoInput: props.layoutInfo?.logo || null,
  favicon: props.layoutInfo?.favicon,
  faviconInput: props.layoutInfo?.favicon || null,
  popup_enable: props.layoutInfo?.popup_enable || false,
  popup_type: props.layoutInfo?.popup_type || 'image',
  popup_image: props.layoutInfo?.popup_image,
  popup_imageInput: props.layoutInfo?.popup_image || null,
  popup_description: popupDescription,
  footer_text: props.layoutInfo?.footer_text,
  footer_description: footerDescription,
  home_notice_enable: props.layoutInfo?.home_notice_enable || false,
  home_notice: homeNotice,
  general_notice_enable: props.layoutInfo?.general_notice_enable || false,
  general_notice: generalNotice,
  comp_email: props.layoutInfo?.comp_email,
  comp_hotline: props.layoutInfo?.comp_hotline
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route('admin.setting.layout.update'), {
      forceFormData: true,
      onStart: () => {
        loadingStore.start()
      },
      onFinish: () => {
        loadingStore.stop()
      }
  });
}

// Tabs list
const tabs = [
  { title: t('General'), icon: 'mdi-cube-unfolded', tab: 'general' },
  { title: t('Notice'), icon: 'mdi-message-alert', tab: 'notice' },
  { title: t('Company'), icon: 'mdi-home-floor-1', tab: 'company' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'general')

// Switch SPA-style tabs
const switchTab = tab => {
  activeTab.value = tab

  router.get(
    route('admin.setting.layout.index'),
    { tab },
    { preserveScroll: true, preserveState: true }
  )
}
</script>

<template>
  <Head :title="$t('Layout')"/>

  <DefaultLayoutWithVerticalNav>
    <VForm
        ref="formRef"
        method="post"
        @submit.prevent="onSubmit(formRef, form)"
      >
      <VRow>
        <VCol
          cols="12"
          md="3"
          >
          <VTabs
            v-model="activeTab"
            direction="vertical"
            class="v-tabs-pill disable-tab-transition"
            >
            <VTab
              v-for="item in tabs"
              :key="item.tab"
              :value="item.tab"
              @click="() => switchTab(item.tab)"
            >
              <VIcon
                size="20"
                start
                :icon="item.icon"
              />
              {{ item.title }}
            </VTab>
          </VTabs>
        </VCol>

        <VCol
            cols="12"
            md="9"
          >
          <VWindow
            v-model="activeTab"
            class="disable-tab-transition"
            :touch="false"
          >
            <VWindowItem value="general">
              <General
                  :pageTitle="pageTitle"
                  :layoutInfo="layoutInfo"
                  :form="form"
                />
            </VWindowItem>

            <VWindowItem value="notice">
              <Notice
                  :pageTitle="pageTitle"
                  :layoutInfo="layoutInfo"
                  :form="form"
                />
            </VWindowItem>

            <VWindowItem value="company">
              <Company
                  :pageTitle="pageTitle"
                  :layoutInfo="layoutInfo"
                  :form="form"
                />
            </VWindowItem>
          </VWindow>
        </VCol>
      </VRow>

      <div class="d-flex justify-end gap-x-4">
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

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
