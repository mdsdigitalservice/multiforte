import { readFileSync, existsSync } from 'node:fs';
const state = JSON.parse(readFileSync(new URL('../src/data/migration.json', import.meta.url), 'utf8'));
const pages = JSON.parse(readFileSync(new URL('../src/data/wordpress.json', import.meta.url), 'utf8')).pages;
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
const failures = [];
if (state.status !== 'complete' || state.reviewed !== true || !state.capturedAt) failures.push('Importar e conferir os textos, metadados e navegação originais.');
if (!state.expectedPaths?.includes('/')) failures.push('Registrar o inventário completo de URLs originais.');
if (/X-Robots-Tag:\s*noindex/i.test(headers)) failures.push('Remover o noindex global após revisar a migração.');
for (const path of state.expectedPaths ?? []) {
  // Literal routes are used until the original route inventory is available.
  if (!path.startsWith('/') || path.includes('..') || path.includes('?') || path.includes('#')) { failures.push(`URL inválida: ${path}`); continue; }
  const route = path.replace(/^\/+|\/+$/g, '');
  if (!pages.some(page => page.path === path) && !existsSync(new URL(`../src/pages/${route || 'index'}.astro`, import.meta.url)) && !existsSync(new URL(`../src/pages/${route}/index.astro`, import.meta.url))) failures.push(`Página ausente: ${path}`);
}
if (failures.length) { console.error('Migração ainda não pronta para substituir o WordPress:\n- ' + failures.join('\n- ')); process.exit(1); }
console.log('Revisão de migração registrada. Execute a auditoria final de conteúdo e links.');
