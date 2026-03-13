<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm, router } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'
import { useLoadingStore } from '@layouts/stores/loading'

const page = usePage()
const { languages } = usePage().props
const { t, locale } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const loadingStore = useLoadingStore()

const errors = ref({
  username: undefined,
  name: undefined,
  password: undefined,
  password_confirmation: undefined,
})

const showDialog = ref(false)
const modalContent = ref('')
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const props = defineProps({
    pageTitle: String,
    tab: String,
    agent: [Array, Object],
    errors: [Array, Object],
    statuses: [Array, Object],
    types: [Array, Object],
})

const typesWithLocalizedNames = computed(() => {
  return props.types.map(type => ({
    ...type,
    localized_name: JSON.parse(type?.type_name_locale)?.[locale.value] || JSON.parse(type?.type_name_locale)?.en
  }))
})

const formRef = ref()
const balformRef = ref()
const form = useForm({
  uuid: props.agent.uuid,
  username: props.agent.username,
  name: props.agent.agent_name,
  status: props.agent.agent_status,
  password: '',
  password_confirmation: '',
})
const balForm = useForm({
  uuid: props.agent.uuid,
  type: null,
  amount: 0,
  remark: null,
})

const onSubmit = (formRef, formInstance, route) => {
  formInstance.transform(data => ({
    ...formInstance.data(),
  })).post(route, {
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
  { title: t('Balance'), icon: 'tabler-coin', tab: 'balance' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'general')

// Switch SPA-style tabs
const switchTab = tab => {
  activeTab.value = tab

  router.get(
    route('admin.agent.edit', {uuid: form.uuid}),
    { tab },
    { preserveScroll: true, preserveState: true }
  )
}

</script>

<template>
  <Head :title="props.pageTitle"/>
  <DefaultLayoutWithVerticalNav>
      <div>
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
                <VForm
                    ref="formRef"
                    method="post"
                    @submit.prevent="onSubmit(formRef, form, route('admin.agent.update'))"
                  >
                  <VCard
                      :title="$t('General')"
                      class="mb-3"
                    >
                    <VCardText>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              v-model="form.username"
                              :error-messages="form.errors.username"
                              :label="$t('Username')"
                              :rules="[requiredValidator]"
                            />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              v-model="form.name"
                              :error-messages="form.errors.name"
                              :label="$t('Name')"
                              :rules="[requiredValidator]"
                            />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                              v-model="props.agent.agent_token"
                              :label="$t('Token')"
                              readonly
                            />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                                v-model="form.password"
                                :label="$t('Password')"
                                placeholder="············"
                                :type="isPasswordVisible ? 'text' : 'password'"
                                autocomplete="password"
                                :error-messages="form.errors.password"
                                :append-inner-icon="isPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                                hide-details="auto"
                              />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                                v-model="form.password_confirmation"
                                :label="$t('Confirm Password')"
                                placeholder="············"
                                :rules="[confirmedValidator(form.password_confirmation, form.password)]"
                                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                                autocomplete="password"
                                :error-messages="form.errors.password_confirmation"
                                :append-inner-icon="isConfirmPasswordVisible ? 'tabler:eye_off' : 'tabler:eye'"
                                @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                                hide-details="auto"
                              />
                          </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
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
                              :rules="[requiredValidator]"
                            />
                          </div>
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                  <div class="d-flex justify-end gap-x-4">
                    <VBtn
                      type="button"
                      color="primary"
                      variant="text"
                      class="mt-4"
                      @click="$inertia.visit('/admin/agent')"
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
              </VWindowItem>

              <VWindowItem value="balance">
                <VForm
                    ref="balformRef"
                    method="post"
                    @submit.prevent="onSubmit(balformRef, balForm, route('admin.agent.update.balance'))"
                    >
                  <VCard
                    :title="$t('Balance')"
                    >
                    <VCardText>
                      <VRow>
                        <VCol cols="12">
                          <AppTextField
                            v-model="props.agent.agent_balance"
                            :label="$t('Balance')"
                            readonly
                          />
                        </VCol>
                      </VRow>
                      <VRow>
                        <VCol cols="12">
                          <AppSelect
                            v-model="balForm.type"
                            :items="typesWithLocalizedNames"
                            item-title="localized_name"
                            item-value="type_code"
                            :placeholder="$t('Type')"
                            :label="$t('Type')"
                            :rules="[requiredValidator]"
                          />
                        </VCol>
                      </VRow>
                      <VRow>
                        <VCol cols="12">
                          <AppTextField
                            v-model="balForm.amount"
                            :label="$t('Amount')"
                            :rules="[requiredValidator]"
                          />
                        </VCol>
                      </VRow>
                      <VRow>
                        <VCol cols="12">
                          <AppTextarea
                            v-model="balForm.remark"
                            :label="$t('Remark')"
                            color="primary"
                            variant="outlined"
                          />
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                  <div class="d-flex justify-end gap-x-4">
                    <VBtn
                      type="button"
                      color="primary"
                      variant="text"
                      class="mt-4"
                      @click="$inertia.visit('/admin/agent')"
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
              </VWindowItem>
            </VWindow>
          </VCol>
        </VRow>
      </div>
  </DefaultLayoutWithVerticalNav>
</template>

<style>
  .v-text-field__prefix {
    opacity: 1;
  }
</style>