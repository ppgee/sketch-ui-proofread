import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  typescript: {
    shim: true,
    strict: true
  },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  buildModules: [
    '@nuxtjs/tailwindcss'
  ],
  meta: {
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' }
    ]
  },
  vite: {
    server: {
      open: true,
    },
    logLevel: 'info',
    optimizeDeps: {
      include: [
        '@headlessui/vue', '@heroicons/vue/solid', '@heroicons/vue/outline', 'vue'
      ]
    }
  },
})
