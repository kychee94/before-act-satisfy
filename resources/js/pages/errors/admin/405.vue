<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@adminThemeConfig'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'

definePage({
    name: "405",
    layout: 'DefaultLayoutWithVerticalNav',
})

</script>

<template>
    <Head title="405"/>

    <DefaultLayoutWithVerticalNav>
      <!-- <template #logo>
        <LoginLogo :nodes="themeConfig.app.logo" :title="themeConfig.app.title"/>
      </template> -->
      <div class="layout-wrapper layout-blank">
        <div class="misc-wrapper">
          <ErrorHeader
            status-code="405"
            title="Method Not Allowed"
            description="The method used for this request is not allowed on this page."
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
