// @ts-check
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';

import starlightThemeNext from 'starlight-theme-next';

import starlightImageZoom from 'starlight-image-zoom';

import starlightLlmsTxt from 'starlight-llms-txt';

import starlightScrollToTop from 'starlight-scroll-to-top';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import d2 from 'astro-d2';

export default defineConfig({
  site: 'https://atlassalutis.netlify.app',
  integrations: [starlight({
    title: 'Atlas Salutis',
    plugins: [
      starlightThemeNext(),
      starlightImageZoom(),
      starlightLlmsTxt({ rawContent: true }),
      starlightScrollToTop({ tooltipText: 'Volver arriba', showTooltip: true, borderRadius: '50' }),
    ],
    routeMiddleware: './src/routeData.ts',
    customCss: ['./src/styles/global.css'],
    favicon: '/favicon.svg',
    logo: {
      light: './src/assets/logo-light.svg',
      dark: './src/assets/logo-dark.svg',
      alt: 'Atlas Salutis',
    },
    components: {
      PageTitle: './src/overrides/PageTitle.astro',
      ThemeSelect: './src/overrides/ThemeSelect.astro',
    },
    sidebar: [
      { label: 'Personas', link: '/people/' },
      { label: 'Entrevistas', link: '/interviews/' },
      { label: 'Alimentación', collapsed: true, items: [{ autogenerate: { directory: 'posts/alimentacion' } }] },
      { label: 'Entrenamiento y movimiento', collapsed: true, items: [{ autogenerate: { directory: 'posts/entrenamiento' } }] },
      { label: 'Sueño y descanso', collapsed: true, items: [{ autogenerate: { directory: 'posts/sueno' } }] },
      { label: 'Peso, metabolismo y hormonas', collapsed: true, items: [{ autogenerate: { directory: 'posts/metabolismo' } }] },
      { label: 'Mente y hábitos', collapsed: true, items: [{ autogenerate: { directory: 'posts/habitos' } }] },
    ],
  }), react(), mdx(), d2({
    inline: true,
    experimental: { useD2js: true },
    theme: {
      dark: '100',
      default: '100',
    }
  })],

  vite: {
    plugins: [tailwindcss()],
  },
});
