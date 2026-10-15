import type { APIRoute } from 'astro';
import data from '../data/wordpress.json';
import { site } from '../data/site';
export const GET: APIRoute = () => new Response(
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  data.pages.filter(page => page.path !== "/teste/").map(page => `<url><loc>${new URL(page.path, site.origin).href}</loc></url>`).join('') + '</urlset>',
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
