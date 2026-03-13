import { defineStore } from 'pinia'

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    current: localStorage.getItem('locale') || 'en', // load from storage
  }),
  actions: {
    setLocale(lang) {
      this.current = lang
      localStorage.setItem('locale', lang)
    },
  },
})