import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Plugin para permitir importar arquivos .geojson diretamente como objetos JSON JS
const geojsonPlugin = () => ({
  name: 'geojson-loader',
  enforce: 'pre',
  load(id) {
    const cleanId = id.split('?')[0];
    if (cleanId.endsWith('.geojson')) {
      const content = fs.readFileSync(cleanId, 'utf-8');
      return `export default ${content};`;
    }
  },
});

export default defineConfig({
  plugins: [geojsonPlugin(), react()],
  assetsInclude: ['**/*.geojson'],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://backend-smart-nav.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    exclude: [
      'react-photo-sphere-viewer',
      '@photo-sphere-viewer/core',
      '@photo-sphere-viewer/markers-plugin',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});