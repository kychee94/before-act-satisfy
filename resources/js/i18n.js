import { createI18n } from 'vue-i18n';
import en from '/resources/lang/en.json'
import zh from '/resources/lang/zh.json'
import ms from '/resources/lang/ms.json'

const locale =
  document.documentElement.lang ||
  window?.__INITIAL_STATE__?.locale ||
  'en'

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
    ms
  }
})