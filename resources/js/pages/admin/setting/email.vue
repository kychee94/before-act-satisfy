<script setup>
import { usePage, router } from '@inertiajs/vue3'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import Setting from '@/pages/admin/setting/email/setting.vue'
import Listing from '@/pages/admin/setting/email/listing.vue'
import ScrollToTop from '@core/components/ScrollToTop.vue'

// Props from backend
const page = usePage()
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    emailInfo: [Array, Object],
    tab: String
})

// Tabs list
const tabs = [
  { title: t('Setting'), icon: 'mdi-cogs', tab: 'setting' },
  { title: t('Listing'), icon: 'tabler-list', tab: 'listing' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'setting')

// Switch SPA-style tabs
const switchTab = tab => {
  router.get(
    route('admin.setting.email.index'),
    { tab },
    { preserveScroll: true, preserveState: true }
  )
}
</script>

<template>
    <Head :title="$t('Email')"/>

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
        <VWindowItem value="setting">
          <Setting
              :pageTitle="pageTitle"
              :emailInfo="emailInfo"
            />
        </VWindowItem>

        <VWindowItem value="listing">
          <Listing
              :pageTitle="pageTitle"
              :emailInfo="emailInfo"
            />
        </VWindowItem>
      </VWindow>
    </div>
  </DefaultLayoutWithVerticalNav>
</template>
