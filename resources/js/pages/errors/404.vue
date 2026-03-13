<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { Head, Link, useForm } from '@inertiajs/vue3';
import Layout from '@/layouts/frontend/Layout.vue'

import pages401 from '@images/pages/404.png'
import miscMaskDark from '@images/pages/misc-mask-dark.png'
import miscMaskLight from '@images/pages/misc-mask-light.png'

definePage({
    layout: 'Layout',
})
</script>

<template>
    <Head title="404"/>

    <Layout>
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
            :href="route('home')"
          >
            {{$t('Back To Home')}}
          </Link>
        </div>
      </div>
    </Layout>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
