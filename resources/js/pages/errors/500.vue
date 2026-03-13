<script setup>
import { usePage } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { Head, Link, useForm } from '@inertiajs/vue3';
import Layout from '@/layouts/frontend/Layout.vue'

import miscMaskDark from '@images/pages/misc-mask-dark.png'
import miscMaskLight from '@images/pages/misc-mask-light.png'

definePage({
    layout: 'Layout',
})

</script>

<template>
    <Head title="500"/>

    <Layout>
      <!-- <template #logo>
        <LoginLogo :nodes="themeConfig.app.logo" :title="themeConfig.app.title"/>
      </template> -->
      <div class="layout-wrapper layout-blank">
        <div class="misc-wrapper">
          <ErrorHeader
            status-code="500"
            title="Oops! Something went wrong."
            description="Please show this error code to the administrators."
          />
          <Link
            class="v-btn v-btn--variant-text bg-custom text-none px-4 py-2"
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
