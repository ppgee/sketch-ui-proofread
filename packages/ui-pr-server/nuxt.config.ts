import { defineNuxtConfig } from 'nuxt3'
import { join } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  typescript: {
    shim: true,
    strict: true
  },
  meta: {
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  components: [
    '~/components/',
    {
      // Because '@nuxt/Components' does not support 'vue.use(ElButton)' mode  
      // So it's only equivalent to 'auto-imports'
      path: join(__dirname, "node_modules/element-plus/lib/components"),
      pattern: ["*/index.js"],
      prefix: "el",
    },
  ],
  vite: {
    plugins: [
      Components({
        resolvers: [ElementPlusResolver({
          ssr: true
        })]
      })
    ]
  }
})
