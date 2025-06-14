import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { imagePlaceholder } from '../src/lib/vite-img-placeholder';

export default defineConfig({
  plugins: [
    imagePlaceholder() ,
    react(),
  ],
  root: 'demo',
  server: {
    open: true
  }
});
