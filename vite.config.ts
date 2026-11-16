/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev — base '/' (absolute asset paths): the site is served from the
// domain root and BrowserRouter has nested routes (/project/:slug, /post/:slug).
// A relative base made a reload or deep link there request
// /project/assets/…, which the server answers with index.html, so the page
// rendered blank.
export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'src/e2e/**'],
  },
});
