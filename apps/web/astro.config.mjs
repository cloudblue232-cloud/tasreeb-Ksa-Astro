// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'

export default defineConfig({
  output: 'server',
  adapter: vercel({
    isr: {
      // Pages are cached for 60 seconds, then automatically re-fetched from Supabase.
      // After an admin update, the change will appear within 1 minute max.
      // Visitors still get instant cached page loads during that window.
      expiration: 60,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@saudi-leaks/shared'],
    },
  },
})