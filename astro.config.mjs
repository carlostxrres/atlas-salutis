// @ts-check
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';

import starlightThemeNext from 'starlight-theme-next';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import d2 from 'astro-d2';

export default defineConfig({
  integrations: [starlight({
    title: 'Atlas Salutis',
    plugins: [starlightThemeNext()],
    customCss: ['./src/styles/global.css'],
    sidebar: [
      { label: 'Personas', link: '/people/' },
      { label: 'Entrevistas', link: '/interviews/' },
      { label: 'Posts', items: [{ autogenerate: { directory: 'posts' } }] },
    ],
  }), react(), mdx(), d2({
    inline: true,
    experimental: { useD2js: true },
  })],

  vite: {
    plugins: [tailwindcss()],
  },
});