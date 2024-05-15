import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';

import EnvCaster from '@niku/vite-env-caster';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [EnvCaster(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
