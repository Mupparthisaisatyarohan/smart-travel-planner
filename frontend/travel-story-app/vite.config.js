import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:3000'

const proxyPaths = [
  '/api/login',
  '/create-account',
  '/google-auth',
  '/get-user',
  '/delete-image',
  '/add-travel-story',
  '/get-all-stories',
  '/image-upload',
  '/video-upload',
  '/get-shared-stories',
  '/search',
  '/filter-by-date',
  '/edit-story',
  '/delete-story',
  '/update-is-favorite',
  '/update-is-shared',
  '/uploads',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      proxyPaths.map((path) => [
        path,
        { target: backendTarget, changeOrigin: true },
      ])
    ),
  },
})
