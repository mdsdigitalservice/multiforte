import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const source = readFileSync(new URL('../src/scripts/consent-bootstrap.js', import.meta.url), 'utf8');
const key = 'mf_cookie_consent_v1';
function boot(saved, { blockedStorage = false, hostname = 'www.multiforteseguranca.com.br' } = {}) {
  const scripts = [], removed = [], store = new Map(saved === undefined ? [] : [[key, typeof saved === 'string' ? saved : JSON.stringify(saved)]]);
  const window = { location: { hostname, reload() { this.reloads = (this.reloads || 0) + 1; } }, localStorage: { getItem(k) { if (blockedStorage) throw Error(); return store.get(k); }, setItem(k,v) { if (blockedStorage) throw Error(); store.set(k,v); } }, addEventListener() {} };
  const document = { head: { appendChild: s => scripts.push(s) }, createElement: () => ({}), get cookie() { return '_ga=test; _ga_ABC=test; _gcl_aw=test; essential=keep'; }, set cookie(v) { removed.push(v); } };
  vm.runInNewContext(source, { window, document, Date, Number });
  return { window, scripts, removed, store, api: window.mfConsent, commands: window.dataLayer };
}
const stored = (analytics, advertising, updatedAt = Date.now()) => ({ version:1, analytics, advertising, updatedAt });
test('first visit denies all four consent signals before any container loads', () => {
 const s=boot(); assert.equal(s.scripts.length,0); assert.equal(s.api.get(),null);
 assert.equal(s.commands[0][0],'consent'); assert.equal(s.commands[0][1],'default');
 assert.deepEqual(Object.values(s.commands[0][2]), ['denied','denied','denied','denied']);
 assert.equal(s.window['ga-disable-G-F6M0XJGNEN'],true);
});
test('reject keeps optional tags unloaded and essential cookies intact', () => {
 const s=boot(); s.api.save(false,false); assert.equal(s.scripts.length,0); assert.equal(s.api.allowsAnalytics(),false);
 assert.ok(s.removed.some(x=>x.startsWith('_ga='))); assert.ok(s.removed.some(x=>x.startsWith('_gcl_aw=')));
 assert.ok(s.removed.every(x=>!x.startsWith('essential=')));
 assert.equal(JSON.parse(s.store.get(key)).advertising,false);
});
test('accept all sends granted signals before loading exactly one container', () => {
 const s=boot(); s.api.save(true,true); assert.equal(s.scripts.length,1); assert.equal(s.api.allowsAnalytics(),true);
 assert.equal(s.commands[1][1],'update'); assert.ok(Object.values(s.commands[1][2]).every(x=>x==='granted'));
 assert.equal(s.commands[2].event,'gtm.js'); assert.match(s.scripts[0].src,/GTM-WFVNC959/);
 s.api.save(true,true); assert.equal(s.scripts.length,1);
});
test('separate choices grant only the selected category', () => {
 for (const [a,b] of [[true,false],[false,true]]) {
  const s=boot(); s.api.save(a,b); const signals=s.commands[1][2];
  assert.equal(signals.analytics_storage,a?'granted':'denied'); assert.equal(signals.ad_storage,b?'granted':'denied');
  assert.equal(signals.ad_user_data,b?'granted':'denied'); assert.equal(signals.ad_personalization,b?'granted':'denied');
  assert.equal(s.window['ga-disable-G-F6M0XJGNEN'],!a);
 }
});
test('saved choices restore before initialization; expiry and invalid choices fail closed', () => {
 const s=boot(stored(true,false)); assert.equal(s.scripts.length,1); assert.equal(s.commands[1][1],'update');
 for (const saved of ['invalid', stored(true,true,0), {...stored(true,true),version:2}, {...stored(true,true),analytics:'yes'}]) {
  const state=boot(saved); assert.equal(state.scripts.length,0); assert.equal(state.api.get(),null);
 }
 assert.equal(boot(stored(false,false)).scripts.length,0);
});
test('revoking permissions updates consent, removes cookies, and reloads to stop existing tags', () => {
 const s=boot(stored(true,true)); s.api.save(false,false);
 assert.equal(s.api.allowsAnalytics(),false); assert.equal(s.window.location.reloads,1);
 assert.ok(s.removed.some(x=>x.startsWith('_ga='))); assert.ok(s.removed.some(x=>x.startsWith('_gcl_aw=')));
 assert.equal(s.scripts.length,1);
});
test('blocked storage works for the session and previews never send production analytics', () => {
 const s=boot(undefined,{blockedStorage:true}); assert.doesNotThrow(()=>s.api.save(true,true)); assert.equal(s.scripts.length,1);
 const preview=boot(undefined,{hostname:'multiforte.pages.dev'}); preview.api.save(true,true); assert.equal(preview.scripts.length,0);
});
