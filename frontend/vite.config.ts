import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@tensorflow/tfjs', '@tensorflow-models/mobilenet']
  },
  define: {
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify('http://localhost:5000')
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
    headers: {
      // Allow Google popup / One Tap
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      // Optional: only if you need SharedArrayBuffer or cross-origin isolation
      // 'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  }
});
