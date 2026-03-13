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
    countries: [Array, Object], 
    member: [Array, Object],
    errors: [Array, Object],
    statuses: [Array, Object],
    agents: [Array, Object],
    types: [Array, Object],
    games: [Array, Object]
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
  uuid: props.member.uuid,
  username: props.member.username,
  agent: props.member.member_agent_id,
  member_phone: props.member.member_phone,
  member_country: props.member.member_country,
  name: props.member.member_name,
  status: props.member.member_status,
  password: '',
  password_confirmation: '',
})
const balForm = useForm({
  uuid: props.member.uuid,
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

const currentRegex = computed(() => {
    const country = props.countries.find(c => c.iso === form.member_country)
    return country ? new RegExp(country.phone_regex) : null
})

const phoneValidator = value => {
    if (currentRegex.value && !currentRegex.value.test(value)) {
      return t(`Invalid phone number for %s`, {'type': form.member_country})
    }
    return true
}

// Tabs list
const tabs = [
  { title: t('General'), icon: 'mdi-cube-unfolded', tab: 'general' },
  { title: t('Balance'), icon: 'tabler-coin', tab: 'balance' },
  { title: t('Game'), icon: 'tabler-device-gamepad-2', tab: 'game' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'general')

// Switch SPA-style tabs
const switchTab = tab => {
  activeTab.value = tab

  router.get(
    route('admin.member.edit', {uuid: form.uuid}),
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
                    @submit.prevent="onSubmit(formRef, form, route('admin.member.update'))"
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
                            <AppSelect
                              v-model="form.agent"
                              :items="props.agents"
                              item-title="username"
                              item-value="id"
                              :placeholder="$t('Agent')"
                              :label="$t('Agent')"
                              :rules="[requiredValidator]"
                              clearable
                            />
                          </VCol>
                      </VRow>
                      <VRow>
                          <VCol cols="12">
                            <AppTextField
                                v-model="form.member_phone"
                                :error-messages="form.errors.phone"
                                :rules="[phoneValidator]"
                                :label="$t('Phone')"
                              >
                              <template #prepend>
                                <VSelect
                                  v-model="form.member_country"
                                  :items="props.countries"
                                  item-title="iso"
                                  item-value="iso"
                                  density="comfortable"
                                  hide-details
                                  style="max-width: 120px; min-width: 80px;"
                                  class="country-select"
                                  clearable
                                >
                                  <template #selection="{ item }">
                                    <span class="text-sm">{{ item.raw.phonecode }}</span>
                                  </template>
                                  <template #item="{ item, props: itemProps }">
                                    <VListItem v-bind="itemProps">
                                      <VListItemTitle>(+{{ item.raw.phonecode }})</VListItemTitle>
                                    </VListItem>
                                  </template>
                                </VSelect>
                              </template>
                            </AppTextField>
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
                      @click="$inertia.visit('/admin/member')"
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
                    @submit.prevent="onSubmit(balformRef, balForm, route('admin.member.update.balance'))"
                    >
                  <VCard
                    :title="$t('Balance')"
                    >
                    <VCardText>
                      <VRow>
                        <VCol cols="12">
                          <AppTextField
                            v-model="props.member.balance"
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
                      @click="$inertia.visit('/admin/member')"
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

              <VWindowItem value="game">
                <VCard
                  :title="$t('Game')"
                  >
                  <VCardText>
                    <VTable class="text-no-wrap border">
                      <thead class="bg-primary h-[40px]">
                        <tr>
                          <th class="border text-center">
                            {{$t('Type')}}
                          </th>
                          <th class="border text-center">
                            {{$t('Daily Count')}}
                          </th>
                          <th class="border text-center">
                            {{$t('Purchased Count')}}
                          </th>
                          <th class="border text-center">
                            {{$t('Last Played')}}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(game, index) in props.games" :key="index">
                          <td>{{game.name}}</td>
                          <td class="text-center">{{game.count}}</td>
                          <td class="text-center">{{game.purchase}}</td>
                          <td class="text-center">{{game.last_used_at}}</td>
                        </tr>
                      </tbody>
                    </VTable>
                  </VCardText>
                </VCard>
                <div class="d-flex justify-end gap-x-4">
                  <VBtn
                    type="button"
                    color="primary"
                    variant="text"
                    class="mt-4"
                    @click="$inertia.visit('/admin/member')"
                    >
                    <VIcon start>
                      mdi-arrow-left
                    </VIcon>
                    {{$t('Back')}}
                  </VBtn>
                </div>
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