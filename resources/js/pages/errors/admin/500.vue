<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})
</script>

<template>
    <Head title="500"/>

    <DefaultLayoutWithVerticalNav>
      <div class="layout-wrapper layout-blank">
        <div class="misc-wrapper">
          <ErrorHeader
            status-code="500"
            title="Oops! Something went wrong."
            description="Please show this error code to the administrators."
          />
          <Link
            class="v-btn v-btn--variant-text bg-primary text-none px-4 py-2"
            :href="route('admin.dashboard')"
          >
            {{$t('Back To Home')}}
          </Link>
        </div>
      </div>
    </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
