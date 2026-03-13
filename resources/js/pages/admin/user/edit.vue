<script setup>
import { usePage, router } from '@inertiajs/vue3'
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
import General from '@/pages/admin/user/general.vue'
import Access from '@/pages/admin/user/access.vue'

const page = usePage()
const { languages } = usePage().props
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const loadingStore = useLoadingStore()

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const modalContent = ref('')

const props = defineProps({
    pageTitle: String,
    tab: String,
    user: [Array, Object],
    roles: [Array, Object],
    statuses: [Array, Object],
    funcs: [Array, Object],
    accesses: [Array, Object],
})

const formRef = ref()
const form = useForm({
  uuid: props.user.uuid,
  first_name: props.user.user_first_name || null,
  last_name: props.user.user_last_name || null,
  gender: props.user.user_gender || null,
  phone: props.user.user_phone || null,
  email: props.user.user_email || null,
  dob: props.user.user_dob || null,
  role: props.user.user_role || null,
  status: parseInt(props.user.user_status) || 0,
  username: props.user.user_first_name || null,
  password: null,
  password_confirmation: null,
  access: props.user.access || {}
})

const onSubmit = (formRef, formInstance) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route('admin.user.update'), {
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
  { title: t('General'), icon: 'mdi-information-outline', tab: 'general' },
  { title: t('Access'), icon: 'mdi-security', tab: 'access' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'general')

// Switch SPA-style tabs
const switchTab = tab => {
  activeTab.value = tab

  router.get(
    route('admin.user.edit', { uuid: props.user.uuid }),
    { tab },
    { preserveScroll: true, preserveState: true }
  )
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
      <div class="d-flex flex-wrap justify-start justify-sm-space-between gap-y-4 gap-x-6 mb-6">
        <div class="d-flex flex-column justify-center">
          <h4 class="text-h4 font-weight-medium">
            {{props.pageTitle}}
          </h4>
        </div>
      </div>

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
                :user="user"
                :roles="roles"
                :statuses="statuses"
                :form="form"
                />
            </VWindowItem>

            <VWindowItem value="access">
              <Access
                :form="form"
                :pageTitle="pageTitle"
                :user="user"
                :accesses="accesses"
                :funcs="funcs"
                />
            </VWindowItem>
          </VWindow>
        </VCol>
      </VRow>

      <div class="d-flex justify-end gap-x-4">
        <VBtn
          type="button"
          color="primary"
          variant="text"
          class="mt-4"
          @click="$inertia.visit('/admin/user/')"
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
