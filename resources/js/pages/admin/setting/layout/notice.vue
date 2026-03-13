<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { Head, Link, useForm } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n'
import { useLoadingStore } from '@layouts/stores/loading'

const { t } = useI18n()
const { languages } = usePage().props

const props = defineProps({
    form: Object,
    pageTitle: String,
    layoutInfo: [Array, Object],
})
</script>

<template>
    <Head :title="$t('Layout')"/>
    <VCard
        class="mb-6"
        :title="$t('Home Notice')"
      >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex align-center">
              <label class="v-label mb-1 text-body-1">{{$t('Enable %s',{'name': $t('Home Notice')})}}</label>
              <VSwitch
                v-model="props.form.home_notice_enable"
                density="compact"
                class="ms-6"
              />
            </div>
          </VCol>
          <VCol 
              v-for="lang in languages"
              :key="lang.lang_code"
              cols="12"
            >
            <div class="d-flex align-center">
              <AppTextField
                :name="`home_notice[${lang.lang_code}]`"
                v-model="props.form.home_notice[lang.lang_code]"
                :label="`${$t('Home Notice')} (${lang.lang_native_name})`"
              />
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VCard
        class="mb-6"
        :title="$t('General Notice')"
      >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex align-center">
              <label class="v-label mb-1 text-body-1">{{$t('Enable %s',{'name': $t('General Notice')})}}</label>
              <VSwitch
                v-model="props.form.general_notice_enable"
                density="compact"
                class="ms-6"
              />
            </div>
          </VCol>
          <VCol 
              v-for="lang in languages"
              :key="lang.lang_code"
              cols="12"
            >
            <div class="d-flex align-center">
              <AppTextField
                :name="`general_notice[${lang.lang_code}]`"
                v-model="props.form.general_notice[lang.lang_code]"
                :label="`${$t('General Notice')} (${lang.lang_native_name})`"
              />
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
