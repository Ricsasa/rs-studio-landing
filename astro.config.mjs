// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import reactI18next from 'astro-react-i18next';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Needed for the sitemap, canonical URLs and absolute og:image URLs.
  site: 'https://ricsasa.work',

  integrations: [react(), sitemap(), partytown(),

  reactI18next({
    defaultLocale: "es-MX",
    locales: ["en-US", "es-MX"],
    namespaces: ['common', 'projects']
  }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});
