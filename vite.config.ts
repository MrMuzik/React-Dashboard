import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  /* Base path must match the GitHub Pages subpath (/repo-name/) so that
     asset URLs resolve correctly in production. In dev it defaults to '/'. */
  base: '/React-Dashboard/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
