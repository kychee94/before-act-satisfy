<script setup>
import { useTheme } from 'vuetify'
import { HorizontalNav } from '@layouts/components'
import { useLayoutConfigStore } from '@layouts/stores/config'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import { hexToRgb } from '@core/utils/colorConverter'

const props = defineProps({
  navItems: {
    type: null,
    required: true,
  },
})

const { width: windowWidth } = useWindowSize()
const configStore = useLayoutConfigStore()
const isOverlayNavActive = ref(false)
const isLayoutOverlayVisible = ref(false)

// 👉 Inject background configuration from page
const layoutBackground = inject('layoutBackground', null)
const backgroundStyles = computed(() => {
  if (!layoutBackground) return {}
  
  if (typeof layoutBackground === 'string') {
    return {
      backgroundImage: `url(${layoutBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }
  }
  
  return {
    backgroundImage: `url(${layoutBackground.image})`,
    backgroundSize: layoutBackground.size || 'cover',
    backgroundPosition: layoutBackground.position || 'center',
    backgroundAttachment: layoutBackground.attachment || 'fixed',
    ...(layoutBackground.opacity && {
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundColor: `rgba(0, 0, 0, ${1 - layoutBackground.opacity})`,
        zIndex: -1
      }
    })
  }
})

// ℹ️ This is alternative to below two commented watcher

// We want to show overlay if overlay nav is visible and want to hide overlay if overlay is hidden and vice versa.
syncRef(isOverlayNavActive, isLayoutOverlayVisible)

// })

// ℹ️ Hide overlay if user open overlay nav in <md and increase the window width without closing overlay nav
watch(windowWidth, () => {
  if (!configStore.isLessThanOverlayNavBreakpoint && isLayoutOverlayVisible.value)
    isLayoutOverlayVisible.value = false
})

</script>

<template>
  <div
    class="layout-wrapper"
    data-allow-mismatch
    :class="configStore._layoutClasses"
    :style="backgroundStyles"
  >
    <div
      class="layout-navbar-and-nav-container"
      :class="configStore.isNavbarBlurEnabled && 'header-blur'"
    >
      <!-- 👉 Navbar -->
      <div class="layout-navbar border-b-0">
        <div class="navbar-content-container">
          <slot name="navbar" />
        </div>
      </div>
      <!-- 👉 Navigation -->
      <div class="layout-horizontal-nav">
        <div class="horizontal-nav-content-container">
          <HorizontalNav :nav-items="navItems" />
        </div>
      </div>
    </div>

    <div class="slideshow">
        <slot name="slideshow" />
    </div>

    <main class="layout-page-content">
      <slot />
    </main>

    <!-- 👉 Footer -->
    <footer class="layout-footer">
      <div class="footer-content-container">
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
@use "@configured-variables" as variables;
@use "@layouts/styles/placeholders";
@use "@layouts/styles/mixins";

.layout-wrapper {
  &.layout-nav-type-horizontal {
    display: flex;
    flex-direction: column;

    // // TODO(v2): Check why we need height in vertical nav & min-height in horizontal nav
    // min-height: 100%;
    min-block-size: 100dvh;

    .layout-navbar-and-nav-container {
      z-index: 10;
    }

    .layout-navbar {
      z-index: variables.$layout-horizontal-nav-layout-navbar-z-index;
      //block-size: variables.$layout-horizontal-nav-navbar-height;

      // ℹ️ For now we are not independently managing navbar and horizontal nav so we won't use below style to avoid conflicting with combo style of navbar and horizontal nav
      // If we add independent style of navbar & horizontal nav then we have to add :not for avoiding conflict with combo styles
      // .layout-navbar-sticky & {
      //   @extend %layout-navbar-sticky;
      // }

      // ℹ️ For now we are not independently managing navbar and horizontal nav so we won't use below style to avoid conflicting with combo style of navbar and horizontal nav
      // If we add independent style of navbar & horizontal nav then we have to add :not for avoiding conflict with combo styles
      // .layout-navbar-hidden & {
      //   @extend %layout-navbar-hidden;
      // }
    }

    // 👉 Navbar
    .navbar-content-container {
      @include mixins.boxed-content;
    }

    // 👉   Content height fixed
    &.layout-content-height-fixed {
      max-block-size: 100dvh;

      .layout-page-content {
        overflow: hidden;

        > :first-child {
          max-block-size: 100%;
          overflow-y: auto;
        }
      }
    }

    // 👉 Footer
    // Boxed content
    .layout-footer {
      .footer-content-container {
        @include mixins.boxed-content;
      }
    }
  }

  // If both navbar & horizontal nav sticky
  &.layout-navbar-sticky.horizontal-nav-sticky {
    .layout-navbar-and-nav-container {
      position: sticky;
      inset-block-start: 0;
      will-change: transform;
    }
  }

  &.layout-navbar-hidden.horizontal-nav-hidden {
    .layout-navbar-and-nav-container {
      display: none;
    }
  }
}

// 👉 Horizontal nav nav
.layout-horizontal-nav {
  z-index: variables.$layout-horizontal-nav-z-index;

  // .horizontal-nav-sticky & {
  //   width: 100%;
  //   will-change: transform;
  //   position: sticky;
  //   top: 0;
  // }

  // .horizontal-nav-hidden & {
  //   display: none;
  // }

  .horizontal-nav-content-container {
    @include mixins.boxed-content(true);
  }
}
</style>
