import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Only used during development
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
