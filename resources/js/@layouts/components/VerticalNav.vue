<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { VNodeRenderer } from './VNodeRenderer'
import { layoutConfig } from '@layouts'
import {
  VerticalNavGroup,
  VerticalNavLink,
  VerticalNavSectionTitle,
} from '@layouts/components'
import { useLayoutConfigStore } from '@layouts/stores/admin/config'
import { injectionKeyIsVerticalNavHovered } from '@layouts/symbols'
import { Link, usePage } from '@inertiajs/vue3'
import { useNotificationStore } from '@/stores/admin/notification'

const accesses = usePage().props.permission
const initialNotification = usePage().props.notifications;
const orderCount = initialNotification.order
const { t } = useI18n()

const props = defineProps({
  tag: {
    type: null,
    required: false,
    default: 'aside',
  },
  navItems: {
    type: null,
    required: true,
  },
  isOverlayNavActive: {
    type: Boolean,
    required: true,
  },
  toggleIsOverlayNavActive: {
    type: Function,
    required: true,
  },
})

const refNav = ref()
const isHovered = useElementHover(refNav)

provide(injectionKeyIsVerticalNavHovered, isHovered)

const configStore = useLayoutConfigStore()

// =============== Notification ===============
const { notifications } = usePage().props;
const notificationStore = useNotificationStore()
const notificationSnackbar = ref({
  show: false,
  message: null,
})
notificationStore.init()

// Show snackbar on page load/navigation if there are notifications
onMounted(() => {
  const notificationData = {
    'order': {
      'count': orderCount
    }
  }

  showNotificationSnackbar(notificationData)
})

function showNotificationSnackbar(notificationData) {
  
  // Build notification message
  let messages = []

  for (const key in notificationData) {
    const count = notificationData[key]?.count
    if (count > 0) {
      messages.push(
        t('notifications.pending', {
          count,
          item: t(`notifications.${key}`, count)
        })
      )
    }
  }
  
  if (messages.length > 0) {
    notificationSnackbar.value.message = messages.join('<br>')
    notificationSnackbar.value.show = true
  }
}

function populateNotifications(navItems, notification) {
  return navItems.map(item => {
    // Clone the item to avoid mutations
    const updatedItem = { ...item }

    const notificationData = notification.updatedData || {}
    // Check if notificationData is not empty
    if (Object.keys(notificationData).length === 0) {
      return updatedItem // Return early if no notification data
    }

    const keys = Object.keys(notification.updatedData)

    // Check if this item should have notifications
    if (item.notification && notificationData[item.notification] !== undefined) {
      keys.forEach(key => {
        // Case-insensitive match between item.notification and notification keys
        if (item.notification.toLowerCase() === key.toLowerCase()) {
          // Update badge content with the notification count
          updatedItem.badgeContent = notificationData[key]?.count
          
          // Update children too
          if (item.children) {
            updatedItem.children = populateNotifications(item.children, notification)
          }
        }
      })
    }

    showNotificationSnackbar(notification.updatedData)
    
    return updatedItem
  })
}

// ============================================

const hasAccess = (func, level) => {
  return accesses[func] >= level
}

function filterMenu(items) {
  return items
    .map(item => {
      if (item.children) {
        const filteredChildren = filterMenu(item.children)
        return filteredChildren.length ? { ...item, children: filteredChildren } : null
      }
      if (item.permission) {
        return hasAccess(item.permission, item.level) ? item : null
      }
      return item
    })
    .filter(Boolean)
}

const filteredItems = computed(() => {
  const filtered = filterMenu(props.navItems || [])
  return populateNotifications(filtered, notificationStore)
})

const resolveNavItemComponent = item => {
  if ('heading' in item)
    return VerticalNavSectionTitle
  if ('children' in item)
    return VerticalNavGroup
  
  return VerticalNavLink
}

/*ℹ️ Close overlay side when route is changed
Close overlay vertical nav when link is clicked
*/
const route = useRoute()

watch(() => route.name, () => {
  props.toggleIsOverlayNavActive(false)
})

const isVerticalNavScrolled = ref(false)
const updateIsVerticalNavScrolled = val => isVerticalNavScrolled.value = val

const handleNavScroll = evt => {
  isVerticalNavScrolled.value = evt.target.scrollTop > 0
}

const hideTitleAndIcon = configStore.isVerticalNavMini(isHovered)

const appName = import.meta.env.VITE_APP_NAME;

const { layoutInfo } = usePage().props;

</script>

<template>
  <Component
    :is="props.tag"
    ref="refNav"
    data-allow-mismatch
    class="layout-vertical-nav"
    :class="[
      {
        'overlay-nav': configStore.isLessThanOverlayNavBreakpoint,
        'hovered': isHovered,
        'visible': isOverlayNavActive,
        'scrolled': isVerticalNavScrolled,
      },
    ]"
  >
    <!-- 👉 Header -->
    <div class="nav-header">
      <slot name="nav-header">
        <Link
          href="/admin/dashboard"
          class="app-logo app-title-wrapper"
        >
          <VImg :src="layoutInfo.logo" alt="Logo" v-if="layoutInfo.logo" width="50"/>

          <Transition name="vertical-nav-app-title">
            <h1
              v-show="!hideTitleAndIcon"
              class="app-logo-title"
            >
              {{ appName }}
            </h1>
          </Transition>
        </Link>
        <!-- 👉 Vertical nav actions -->
        <!-- Show toggle collapsible in >md and close button in <md -->
        <div class="header-action">
          <VIcon
            :is="layoutConfig.app.iconRenderer || 'div'"
            v-show="configStore.isVerticalNavCollapsed"
            class="d-none nav-unpin"
            :class="configStore.isVerticalNavCollapsed && 'd-lg-block'"
            v-bind="layoutConfig.icons.verticalNavUnPinned"
            @click="configStore.isVerticalNavCollapsed = !configStore.isVerticalNavCollapsed"
          />
          <VIcon
            :is="layoutConfig.app.iconRenderer || 'div'"
            v-show="!configStore.isVerticalNavCollapsed"
            class="d-none nav-pin"
            :class="!configStore.isVerticalNavCollapsed && 'd-lg-block'"
            v-bind="layoutConfig.icons.verticalNavPinned"
            @click="configStore.isVerticalNavCollapsed = !configStore.isVerticalNavCollapsed"
          />
          <VIcon
            :is="layoutConfig.app.iconRenderer || 'div'"
            class="d-lg-none"
            v-bind="layoutConfig.icons.close"
            @click="toggleIsOverlayNavActive(false)"
          />
        </div>
      </slot>
    </div>
    <slot name="before-nav-items">
      <div class="vertical-nav-items-shadow" />
    </slot>
    <slot
      name="nav-items"
      :update-is-vertical-nav-scrolled="updateIsVerticalNavScrolled"
    >
      <PerfectScrollbar
        :key="configStore.isAppRTL"
        tag="ul"
        class="nav-items"
        :options="{ wheelPropagation: false }"
        @ps-scroll-y="handleNavScroll"
      >
        <Component
          :is="resolveNavItemComponent(item)"
          v-for="(item, index) in filteredItems"
          :key="index"
          :item="item"
        />
      </PerfectScrollbar>
    </slot>
    <slot name="after-nav-items" />
  </Component>

  <VSnackbar
      v-model="notificationSnackbar.show"
      color="error"
      :timeout="2000"
      location="top"
      multi-line
      vertical
    >
    <div v-html="notificationSnackbar.message"></div>
  </VSnackbar>
</template>

<style lang="scss" scoped>
.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.75rem;

  .app-logo-title {
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: 0.25px;
    line-height: 1.5rem;
    text-transform: capitalize;
  }
}
</style>

<style lang="scss">
@use "@configured-variables" as variables;
@use "@layouts/styles/mixins";

// 👉 Vertical Nav
.layout-vertical-nav {
  position: fixed;
  z-index: variables.$layout-vertical-nav-z-index;
  display: flex;
  flex-direction: column;
  block-size: 100%;
  inline-size: variables.$layout-vertical-nav-width;
  inset-block-start: 0;
  inset-inline-start: 0;
  transition: inline-size 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  will-change: transform, inline-size;

  .nav-header {
    display: flex;
    align-items: center;

    .header-action {
      cursor: pointer;

      @at-root {
        #{variables.$selector-vertical-nav-mini} .nav-header .header-action {
          &.nav-pin,
          &.nav-unpin {
            display: none !important;
          }
        }
      }
    }
  }

  .app-title-wrapper {
    margin-inline-end: auto;
  }

  .nav-items {
    block-size: 100%;

    // ℹ️ We no loner needs this overflow styles as perfect scrollbar applies it
    // overflow-x: hidden;

    // // ℹ️ We used `overflow-y` instead of `overflow` to mitigate overflow x. Revert back if any issue found.
    // overflow-y: auto;
  }

  .nav-item-title {
    overflow: hidden;
    margin-inline-end: auto;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // 👉 Collapsed
  .layout-vertical-nav-collapsed & {
    &:not(.hovered) {
      inline-size: variables.$layout-vertical-nav-collapsed-width;
    }
  }
}

// Small screen vertical nav transition
@media (max-width: 1279px) {
  .layout-vertical-nav {
    &:not(.visible) {
      transform: translateX(-#{variables.$layout-vertical-nav-width});

      @include mixins.rtl {
        transform: translateX(variables.$layout-vertical-nav-width);
      }
    }

    transition: transform 0.25s ease-in-out;
  }
}
</style>
