<script setup>
import { usePage, router } from '@inertiajs/vue3'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import GoogleAnalytics from '@/pages/admin/setting/marketing/analytics.vue'
import SEO from '@/pages/admin/setting/marketing/seo.vue'
import Social from '@/pages/admin/setting/marketing/social.vue'
import AdsPixel from '@/pages/admin/setting/marketing/ads.vue'

const page = usePage()
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    domains: Object,
    gaInfo: [Array, Object],
    seoInfo: [Array, Object],
    socialInfo: [Array, Object],
    tab: String
})

// Tabs list
const tabs = [
  { title: t('Google Analytics'), icon: 'mdi-google-analytics', tab: 'analytics' },
  { title: 'SEO', icon: 'mdi-search-web', tab: 'seo' },
  { title: t('Social'), icon: 'mdi-google-circles-communities', tab: 'social' },
  { title: t('Ads Pixel'), icon: 'mdi-google-ads', tab: 'ads' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'analytics')

// Switch SPA-style tabs
const switchTab = tab => {
  router.get(
    route('admin.setting.marketing.index'),
    { tab },
    { preserveScroll: true, preserveState: true }
  )
}
</script>

<template>
    <Head :title="$t('Marketing')"/>

    <DefaultLayoutWithVerticalNav>
    <div>
      <VTabs
        v-model="activeTab"
        class="v-tabs-pill"
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

      <VWindow
        v-model="activeTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem value="analytics">
          <GoogleAnalytics
              :gaInfo="gaInfo"
            />
        </VWindowItem>

        <VWindowItem value="seo">
          <SEO
              :seoInfo="seoInfo"
            />
        </VWindowItem>

        <VWindowItem value="social">
          <Social
              :socialInfo="socialInfo"
            />
        </VWindowItem>

        <VWindowItem value="ads">
          <AdsPixel
              :domains="domains"
            />
        </VWindowItem>
      </VWindow>
    </div>
  </DefaultLayoutWithVerticalNav>
</template>

<style lang="scss">
@use "@core-scss/template/pages/misc.scss";
</style>
