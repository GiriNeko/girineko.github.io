import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { site } from './src/config.ts';

export default defineConfig({
  site: site.url,
  integrations: [react()],
  compressHTML: true,
  vite: {
    build: {
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('three') || id.includes('@react-three')) return 'webgl';
            if (id.includes('gsap')) return 'motion';
          },
        },
      },
    },
  },
});
