import { ref, watch, computed } from 'vue'
import { layoutConfig } from '@layouts/config'
import { AppContentLayoutNav } from '@layouts/enums'
import { useLayoutConfigStore } from '@layouts/stores/config'

export const openGroups = ref([])

/**
 * Return nav link props to use
 // @param {Object, String} item navigation routeName or route Object provided in navigation data
 */

export const getComputedNavLinkToProp = computed(() => link => {
  const props = {
    target: link.target,
    rel: link.rel,
  }

  // If route is string => it assumes string is route name => Create route object from route name
  // If route is not string => It assumes it's route object => returns passed route object
  if (link.to) {
    if (typeof link.to === 'string') {
      // Simple route name
      props.href = route(link.to)
    } else if (typeof link.to === 'object' && link.to.name) {
      // Route object with name and params
      props.href = route(link.to.name, link.to.params || {})
    }
  } else if (link.href) {
    props.href = link.href
  }
  
  return props
})

/**
 * Return route name for navigation link
 * If link is string then it will assume it is route-name
 * IF link is object it will resolve the object and will return the link
 // @param {Object, String} link navigation link object/string
 */
// ✅ Resolves Ziggy route name to URL (string)
export const resolveNavLinkRouteName = link => {
  if (!link.to) 
    return null
  if (typeof link.to === 'string') 
    return link.to
  if (typeof link.to === 'object' && link.to.name) 
    return link.to.name
  return null
}

/**
 * Check if nav-link is active
 * @param {object} link nav-link object
 */
// ✅ Checks if link is active based on `route().current(...)`
export const isNavLinkActive = (link) => {
  const routeName = resolveNavLinkRouteName(link)
  if (!routeName) return false

  const baseName = routeName.endsWith('.index')
    ? routeName.slice(0, -6)
    : routeName

  // Matches exact route or partial via route().current
  return route().current(routeName) || route().current(`${routeName}.*`) || route().current(`${baseName}.*`)
}

/**
 * Check if nav group is active
 * @param {Array} children Group children
 */
// ✅ Checks if group has an active child
export const isNavGroupActive = (children) => {
  return children.some(child => {
    if ('children' in child) return isNavGroupActive(child.children)
    return isNavLinkActive(child)
  })
}

/**
 * Change `dir` attribute based on direction
 * @param dir 'ltr' | 'rtl'
 */
export const _setDirAttr = dir => {
  // Check if document exists for SSR
  if (typeof document !== 'undefined')
    document.documentElement.setAttribute('dir', dir)
}

/**
 * Return dynamic i18n props based on i18n plugin is enabled or not
 * @param key i18n translation key
 * @param tag tag to wrap the translation with
 */
export const getDynamicI18nProps = (key, tag = 'span') => {
  if (!layoutConfig.app.i18n.enable)
    return {}
  
  return {
    keypath: key,
    tag,
    scope: 'global',
  }
}
export const switchToVerticalNavOnLtOverlayNavBreakpoint = () => {
  const configStore = useLayoutConfigStore()

  /*
        ℹ️ This is flag will hold nav type need to render when switching between lgAndUp from mdAndDown window width
  
        Requirement: When we nav is set to `horizontal` and we hit the `mdAndDown` breakpoint nav type shall change to `vertical` nav
        Now if we go back to `lgAndUp` breakpoint from `mdAndDown` how we will know which was previous nav type in large device?
  
        Let's assign value of `appContentLayoutNav` as default value of lgAndUpNav. Why 🤔?
          If template is viewed in lgAndUp
            We will assign `appContentLayoutNav` value to `lgAndUpNav` because at this point both constant is same
            Hence, for `lgAndUpNav` it will take value from theme config file
          else
            It will always show vertical nav and if user increase the window width it will fallback to `appContentLayoutNav` value
            But `appContentLayoutNav` will be value set in theme config file
      */
  const lgAndUpNav = ref(configStore.appContentLayoutNav)


  /*
        There might be case where we manually switch from vertical to horizontal nav and vice versa in `lgAndUp` screen
        So when user comes back from `mdAndDown` to `lgAndUp` we can set updated nav type
        For this we need to update the `lgAndUpNav` value if screen is `lgAndUp`
      */
  watch(() => configStore.appContentLayoutNav, value => {
    if (!configStore.isLessThanOverlayNavBreakpoint)
      lgAndUpNav.value = value
  })

  /*
        This is layout switching part
        If it's `mdAndDown` => We will use vertical nav no matter what previous nav type was
        Or if it's `lgAndUp` we need to switch back to `lgAndUp` nav type. For this we will tracker property `lgAndUpNav`
      */
  watch(() => configStore.isLessThanOverlayNavBreakpoint, val => {
    configStore.appContentLayoutNav = val ? AppContentLayoutNav.Vertical : lgAndUpNav.value
  }, { immediate: true })
}

/**
 * Convert Hex color to rgb
 * @param hex
 */
export const hexToRgb = hex => {
  // ✅ HARD GUARD — prevents dashboard crash
  if (!hex || typeof hex !== 'string') {
    return '115,103,240' // default Vuetify primary color
  }

  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i

  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : '115,103,240'
}

/**
 *RGBA color to Hex color with / without opacity
 */
export const rgbaToHex = (rgba, forceRemoveAlpha = false) => {
  return (`#${rgba
    .replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
    .split(',') // splits them at ","
    .filter((string, index) => !forceRemoveAlpha || index !== 3)
    .map(string => Number.parseFloat(string)) // Converts them to numbers
    .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
    .map(number => number.toString(16)) // Converts numbers to hex
    .map(string => (string.length === 1 ? `0${string}` : string)) // Adds 0 when length of one number is 1
    .join('')}`)
}
