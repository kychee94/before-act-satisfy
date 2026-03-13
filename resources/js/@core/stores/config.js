import { storeToRefs } from 'pinia'
import { useTheme } from 'vuetify'
import { cookieRef, useLayoutConfigStore } from '@layouts/stores/config'
import { themeConfig } from '@themeConfig'
import { AppContentLayoutNav, NavbarType } from '@layouts/enums'

// SECTION Store
export const useConfigStore = defineStore('config', () => {
  // 👉 Theme
  const userPreferredColorScheme = usePreferredColorScheme()
  const cookieColorScheme = cookieRef('color-scheme', 'light')

  watch(userPreferredColorScheme, val => {
    if (val !== 'no-preference')
      cookieColorScheme.value = val
  }, { immediate: true })

  const theme = cookieRef('theme', themeConfig.app.theme)

  // 👉 isVerticalNavSemiDark
  const isVerticalNavSemiDark = cookieRef('isVerticalNavSemiDark', themeConfig.verticalNav.isVerticalNavSemiDark)

  // 👉 Skin
  const skin = cookieRef('skin', themeConfig.app.skin)

  // 👉 Vertical Nav Collapsed
  const isVerticalNavCollapsed = cookieRef('isVerticalNavCollapsed', themeConfig.verticalNav.isVerticalNavCollapsed)

  // 👉 App Content Width
  const appContentWidth = cookieRef('appContentWidth', themeConfig.app.contentWidth)

  // 👉 App Content Layout Nav
  const appContentLayoutNav = ref(themeConfig.app.contentLayoutNav)

  watch(appContentLayoutNav, val => {
    // If Navbar type is hidden while switching to horizontal nav => Reset it to sticky
    if (val === AppContentLayoutNav.Horizontal) {
      if (navbarType.value === NavbarType.Hidden)
        navbarType.value = NavbarType.Sticky
      isVerticalNavCollapsed.value = false
    }
  })

  // 👉 Horizontal Nav Type
  const horizontalNavType = ref(themeConfig.horizontalNav.type)

  //  👉 Horizontal Nav Popover Offset
  const horizontalNavPopoverOffset = ref(themeConfig.horizontalNav.popoverOffset)

  // 👉 Layout Classes
  const _layoutClasses = computed(() => {
    const { y: windowScrollY } = useWindowScroll()
    
    return [
      `layout-nav-type-${appContentLayoutNav.value}`,
      `layout-navbar-${navbarType.value}`,
      `layout-footer-${footerType.value}`,
      {
        'layout-vertical-nav-collapsed': isVerticalNavCollapsed.value
                    && appContentLayoutNav.value === 'vertical'
                    && !isLessThanOverlayNavBreakpoint.value,
      },
      { [`horizontal-nav-${horizontalNavType.value}`]: appContentLayoutNav.value === 'horizontal' },
      `layout-content-width-${appContentWidth.value}`,
      { 'layout-overlay-nav': isLessThanOverlayNavBreakpoint.value },
      { 'window-scrolled': unref(windowScrollY) },
      route.meta.layoutWrapperClasses ? route.meta.layoutWrapperClasses : null,
    ]
  })

  // ℹ️ We need to use `storeToRefs` to forward the state
  const { isLessThanOverlayNavBreakpoint, navbarType, isNavbarBlurEnabled, footerType, isAppRTL } = storeToRefs(useLayoutConfigStore())
  
  return {
    theme,
    isVerticalNavSemiDark,
    skin,
    horizontalNavType,
    horizontalNavPopoverOffset,

    // @layouts exports
    isLessThanOverlayNavBreakpoint,
    appContentWidth,
    navbarType,
    isNavbarBlurEnabled,
    appContentLayoutNav,
    isVerticalNavCollapsed,
    footerType,
    isAppRTL,
    _layoutClasses,
  }
})
// !SECTION
// SECTION Init
export const initConfigStore = (app) => {
  const configStore = useConfigStore()
  const userPreferredColorScheme = usePreferredColorScheme()

  const vuetifyTheme = useTheme()

  // Sync Vuetify theme with config store
  watch(
    [() => configStore.theme, userPreferredColorScheme],
    () => {
      vuetifyTheme.global.name.value =
        configStore.theme === 'system'
          ? (userPreferredColorScheme.value === 'dark' ? 'dark' : 'light')
          : configStore.theme
    },
    { immediate: true }
  )

  onMounted(() => {
    if (configStore.theme === 'system') {
      vuetifyTheme.global.name.value = userPreferredColorScheme.value
    }
  })
}
// !SECTION
