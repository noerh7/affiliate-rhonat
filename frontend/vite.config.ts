
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // On délègue toutes les requêtes /api/... au backend Vercel
        // afin d'éviter les problèmes de CORS en dev tout en utilisant
        // uniquement https://affiliate-rhonat-delta.vercel.app.
        target: 'https://affiliate-rhonat-delta.vercel.app',
        changeOrigin: true,
        secure: true,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Explicitly forward Authorization header
            if (req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            }
            if (req.headers['x-clickbank-key']) {
              proxyReq.setHeader('x-clickbank-key', req.headers['x-clickbank-key']);
            }
            if (req.headers['x-jvzoo-key']) {
              proxyReq.setHeader('x-jvzoo-key', req.headers['x-jvzoo-key']);
            }
            console.log('[Vite Proxy] Forwarding:', req.method, req.url, '->', options.target + req.url);
            console.log('[Vite Proxy] Headers - Authorization:', req.headers.authorization ? 'present' : 'missing');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[Vite Proxy] Response:', proxyRes.statusCode, 'for', req.url);
          });
        },
      },
    },
  },
});
