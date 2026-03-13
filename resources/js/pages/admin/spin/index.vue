<script setup>
import { usePage, router } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import Segment from '@/pages/admin/spin/setting/segment.vue'
import Setting from '@/pages/admin/spin/setting/setting.vue'
import { useI18n } from 'vue-i18n'

const page = usePage()
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    spins: [Array, Object],
    types: [Array, Object],
    spin: [Array, Object],
    tab: String
})

// Tabs list
const tabs = [
  { title: t('Segment'), icon: 'mdi-pizza', tab: 'segment' },
  { title: t('Setting'), icon: 'mdi-cog', tab: 'setting' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'segment')

// Switch SPA-style tabs
const switchTab = tab => {
  router.get(
    route('admin.spin.index'),
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
          <VWindowItem value="segment">
            <Segment :pageTitle="pageTitle" :types="types" :spins="spins" />
          </VWindowItem>

          <VWindowItem value="setting">
            <Setting :pageTitle="pageTitle" :spin="spin" />
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
