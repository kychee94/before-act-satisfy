import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    show: false,
    message: '',
    color: '',
    timeout: 4000,
  }),

  actions: {
    trigger({ message, color = 'success', timeout = 4000 }) {
      this.show = true
      this.message = message
      this.color = color
      this.timeout = timeout
    },
    close() {
      this.show = false
    },
  },
})