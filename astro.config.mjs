// @ts-check
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';

import starlightThemeNext from 'starlight-theme-next';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import d2 from 'astro-d2';

export default defineConfig({
  site: 'https://atlassalutis.netlify.app',
  integrations: [starlight({
    title: 'Atlas Salutis',
    plugins: [starlightThemeNext()],
    customCss: ['./src/styles/global.css'],
    favicon: '/favicon.svg',
    logo: {
      light: './src/assets/logo-light.svg',
      dark: './src/assets/logo-dark.svg',
      alt: 'Atlas Salutis',
    },
    components: {
      PageTitle: './src/overrides/PageTitle.astro',
    },
    sidebar: [
      { label: 'Personas', link: '/people/' },
      { label: 'Entrevistas', link: '/interviews/' },
      { label: 'Alimentación', items: [{ autogenerate: { directory: 'posts/alimentacion' } }] },
      { label: 'Entrenamiento y movimiento', items: [{ autogenerate: { directory: 'posts/entrenamiento' } }] },
      { label: 'Sueño y descanso', items: [{ autogenerate: { directory: 'posts/sueno' } }] },
      { label: 'Peso, metabolismo y hormonas', items: [{ autogenerate: { directory: 'posts/metabolismo' } }] },
      { label: 'Mente y hábitos', items: [{ autogenerate: { directory: 'posts/habitos' } }] },
    ],
  }), react(), mdx(), d2({
    inline: true,
    experimental: { useD2js: true },
  })],

  vite: {
    plugins: [tailwindcss()],
  },
});