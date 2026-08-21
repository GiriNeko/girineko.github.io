import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://ineko.cc',
  integrations: [react()],
  compressHTML: true,
  vite: {
    build: {
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('three') || id.includes('@react-three')) return 'webgl';
            if (id.includes('gsap') || id.includes('lenis')) return 'motion';
          },
        },
      },
    },
  },
});
