import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    // Exclude problematic dependencies from Vite's dependency optimization
    exclude: [
      '@angular/common/http',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/core',
      '@angular/common',
      '@angular/router'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
}); 