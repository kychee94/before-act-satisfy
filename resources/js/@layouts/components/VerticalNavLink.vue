<script setup>
import { layoutConfig } from '@layouts'
import { can } from '@layouts/plugins/casl'
import { useLayoutConfigStore } from '@layouts/stores/config'
import { usePage, Link } from '@inertiajs/vue3'

const page = usePage()

import {
  getComputedNavLinkToProp,
  getDynamicI18nProps,
  // isNavLinkActive,
} from '@layouts/utils'

const props = defineProps({
  item: {
    type: null,
    required: true,
  },
})

// overrides using inertiajs instead of vue method
const isNavLinkActive = (item) => {
  const current = new URL(page.url, window.location.origin).pathname

  let targetPath
  if (typeof item.to === 'string') {
    // Simple route name
    targetPath = new URL(route(item.to), window.location.origin).pathname
  } else if (typeof item.to === 'object' && item.to.name) {
    // Route object with name and params
    targetPath = new URL(route(item.to.name, item.to.params || {}), window.location.origin).pathname
  } else {
    targetPath = new URL(item.href, window.location.origin).pathname
  }

  return current === targetPath || current.startsWith(targetPath + '/')
}

const configStore = useLayoutConfigStore()
const hideTitleAndBadge = configStore.isVerticalNavMini()
</script>

<template>
  <li
    v-if="can(item.action, item.subject)"
    class="nav-link"
    :class="{ disabled: item.disable }"
  >
    <Component
      :is="item.to ? Link : 'a'"
      v-bind="getComputedNavLinkToProp(item)"
      :class="{ 'router-link-active router-link-exact-active': isNavLinkActive(item) }"
    >
      <v-icon
        :is="layoutConfig.app.iconRenderer || 'i'"
        v-bind="item.icon || layoutConfig.verticalNav.defaultNavItemIconProps"
        class="nav-item-icon"
      />
      <TransitionGroup name="transition-slide-x">
        <!-- 👉 Title -->
        <Component
          :is="layoutConfig.app.i18n.enable ? 'i18n-t' : 'span'"
          v-show="!hideTitleAndBadge"
          key="title"
          class="nav-item-title"
          v-bind="getDynamicI18nProps(item.title, 'span')"
        >
          {{ item.title }}
        </Component>

        <!-- 👉 Badge -->
        <Component
          is="span"
          v-if="item.badgeContent"
          v-show="!hideTitleAndBadge"
          key="badge"
          class="nav-item-badge"
          :class="item.badgeClass"
          v-bind="item.badgeContent"
        >
          {{ item.badgeContent }}
        </Component>
      </TransitionGroup>
    </Component>
  </li>
</template>

<style lang="scss">
.layout-vertical-nav {
  .nav-link a {
    display: flex;
    align-items: center;
  }
}
</style>
