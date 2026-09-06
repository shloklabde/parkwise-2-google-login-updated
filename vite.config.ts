import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    esbuild: {
      target: 'es2022',
    },
    optimizeDeps: {
      // maplibre-gl v6 loads its tile worker by URL; Vite's dep pre-bundler does
      // not emit maplibre-gl-worker.mjs into .vite/deps, which leaves the map
      // style loaded but no vector tiles rendered (blank/white map). Exclude it
      // so the worker resolves from node_modules instead.
      exclude: ['maplibre-gl'],
      esbuildOptions: {
        target: 'es2022',
      },
    },
    build: {
      target: 'es2022',
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
