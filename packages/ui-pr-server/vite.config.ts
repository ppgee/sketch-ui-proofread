import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'client',
  publicDir: 'public',
  server: {
    port: 3001,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        charset: false,
      },
    },
  },
});
