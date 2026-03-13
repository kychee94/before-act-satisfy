<script setup>
import { usePage, router } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import Checkin from '@/pages/admin/checkin/setting/checkin.vue'
import Setting from '@/pages/admin/checkin/setting/setting.vue'
import { useI18n } from 'vue-i18n'

const page = usePage()
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    checkins: [Array, Object],
    types: [Array, Object],
    checkin: [Array, Object],
    tab: String
})

// Tabs list
const tabs = [
  { title: t('Checkin'), icon: 'mdi-calendar-check', tab: 'checkin' },
  { title: t('Setting'), icon: 'mdi-cog', tab: 'setting' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'checkin')

// Switch SPA-style tabs
const switchTab = tab => {
  router.get(
    route('admin.checkin.index'),
    { tab },
    { preserveScroll: true, preserveState: true }
  )
}
</script>

<template>
    <Head :title="props.pageTitle"/>
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
          <VWindowItem value="checkin">
            <Checkin :pageTitle="pageTitle" :types="types" :checkins="checkins" />
          </VWindowItem>

          <VWindowItem value="setting">
            <Setting :pageTitle="pageTitle" :checkin="checkin" />
          </VWindowItem>
        </VWindow>
      </div>
    </DefaultLayoutWithVerticalNav>
</template>

<style scoped lang="scss">
@use "@core-scss/template/pages/misc.scss";

.centered-input :deep(input) {
  text-align: center;
}
</style>
