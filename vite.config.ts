import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/porsche-911-3d/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
  },
}));
