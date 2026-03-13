<script setup>
import { usePage, router } from '@inertiajs/vue3'
import { VForm } from 'vuetify/components/VForm'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { Head, Link, useForm } from '@inertiajs/vue3';
import DefaultLayoutWithVerticalNav from '@/layouts/components/DefaultLayoutWithVerticalNav.vue'
import Fab from '@/pages/admin/setting/design/fab.vue'
import { useI18n } from 'vue-i18n'

const page = usePage()
const { t } = useI18n()

definePage({
    layout: 'DefaultLayoutWithVerticalNav',
})

const props = defineProps({
    pageTitle: String,
    designInfo: [Array, Object],
    tab: String
})

// Tabs list
const tabs = [
  { title: t('Floating'), icon: 'mdi-airballoon', tab: 'fab' },
]

// Reactive tab from query
const activeTab = ref(props.tab ?? 'fab')

// Switch SPA-style tabs
const switchTab = tab => {
  router.get(
    route('admin.setting.design.index'),
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
          <VWindowItem value="fab">
            <Fab 
                :pageTitle="pageTitle"
                :designInfo="designInfo"
              />
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
