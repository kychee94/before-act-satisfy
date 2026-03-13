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
        :title="$t('Company Info')"
      >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex align-center">
              <AppTextField
                name="comp_email"
                v-model="props.form.comp_email"
                :label="`${$t('Email')}`"
              />
            </div>
          </VCol>
          <VCol cols="12">
            <div class="d-flex align-center">
              <AppTextField
                name="comp_hotline"
                v-model="props.form.comp_hotline"
                :label="`${$t('Hotline')}`"
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
