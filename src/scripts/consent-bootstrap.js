// Runs synchronously in <head>, before any Google container can load.
(function () {
  var key = 'mf_cookie_consent_v1';
  var lifetime = 180 * 24 * 60 * 60 * 1000;
  var current = null;
  var loaded = false;
  var production = ['multiforteseguranca.com.br', 'www.multiforteseguranca.com.br'].includes(window.location.hostname);
  window.dataLayer = window.dataLayer || [];
  function consentCommand() { window.dataLayer.push(arguments); }
  function signals(choice) {
    return {
      analytics_storage: choice && choice.analytics ? 'granted' : 'denied',
      ad_storage: choice && choice.advertising ? 'granted' : 'denied',
      ad_user_data: choice && choice.advertising ? 'granted' : 'denied',
      ad_personalization: choice && choice.advertising ? 'granted' : 'denied'
    };
  }
  function readChoice(raw) {
    try {
      var choice = JSON.parse(raw);
      var age = Date.now() - choice.updatedAt;
      if (choice.version === 1 && typeof choice.analytics === 'boolean' &&
          typeof choice.advertising === 'boolean' && Number.isFinite(choice.updatedAt) &&
          age >= 0 && age < lifetime) return choice;
    } catch (_) { /* Missing, unavailable or invalid storage means no consent. */ }
    return null;
  }
  function removeOptionalCookies(choice) {
    var domains = ['', window.location.hostname, '.multiforteseguranca.com.br'];
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      var analyticsCookie = /^_ga(?:_|$)|^_gid$|^_gat/.test(name);
      var advertisingCookie = /^_gcl_|^_gac_/.test(name);
      if ((!choice.analytics && analyticsCookie) || (!choice.advertising && advertisingCookie)) {
        domains.forEach(function (domain) {
          document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
        });
      }
    });
  }
  function loadContainer() {
    if (loaded || !production || !current || (!current.analytics && !current.advertising)) return;
    loaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-WFVNC959';
    document.head.appendChild(script);
  }
  consentCommand('consent', 'default', signals(null));
  // Also prevent Analytics collection when only advertising is allowed.
  window['ga-disable-G-F6M0XJGNEN'] = true;
  try { current = readChoice(window.localStorage.getItem(key)); } catch (_) {}
  if (current) {
    window['ga-disable-G-F6M0XJGNEN'] = !current.analytics;
    consentCommand('consent', 'update', signals(current));
    removeOptionalCookies(current);
    loadContainer();
  } else {
    removeOptionalCookies({ analytics: false, advertising: false });
  }
  window.mfConsent = {
    get: function () { return current ? Object.assign({}, current) : null; },
    allowsAnalytics: function () { return !!(current && current.analytics); },
    save: function (analytics, advertising) {
      var previous = current;
      current = { version: 1, analytics: analytics === true, advertising: advertising === true, updatedAt: Date.now() };
      try { window.localStorage.setItem(key, JSON.stringify(current)); } catch (_) {}
      window['ga-disable-G-F6M0XJGNEN'] = !current.analytics;
      consentCommand('consent', 'update', signals(current));
      removeOptionalCookies(current);
      // Reload after changing an active container: old tags stop, and newly
      // permitted initialization tags can run with the new consent state.
      if (loaded && previous && (previous.analytics !== current.analytics || previous.advertising !== current.advertising)) {
        window.location.reload();
        return;
      }
      loadContainer();
    }
  };
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) window.location.reload();
  });
})();
