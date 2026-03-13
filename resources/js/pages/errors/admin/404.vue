<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@adminThemeConfig'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'

import pages401 from '@images/pages/404.png'

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})
</script>

<template>
    <Head title="404"/>

    <DefaultLayoutWithVerticalNav>
      <!-- <template #logo>
        <LoginLogo :nodes="themeConfig.app.logo" :title="themeConfig.app.title"/>
      </template> -->
      <div class="layout-wrapper layout-blank">
        <div class="misc-wrapper">
          <ErrorHeader
            status-code="404"
            title="Page Not Found ⚠️"
            description="We couldn't find the page you are looking for."
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
