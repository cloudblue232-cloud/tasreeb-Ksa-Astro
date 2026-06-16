// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'

export default defineConfig({
  output: 'server',
  adapter: vercel({
    isr: {
      // Revalidate all pages every hour (like Next.js revalidate: 3600)
      expiration: 3600,
      // Allow on-demand purging from the Admin Dashboard
      bypassToken: process.env.REVALIDATION_TOKEN,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@saudi-leaks/shared'],
    },
  },
})