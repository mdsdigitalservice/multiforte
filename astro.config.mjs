import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.multiforteseguranca.com.br',
  output: 'static',
  outDir: './dist',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
