/* ============================================================
   दिप्र फ़ाउंडेशन — Mobile app shell (bottom tab bar)
   Dipra Foundation — shared mobile navigation
   ============================================================
   उपयोग:  <script src="app-nav.js" defer></script>  (</body> से पहले)
   कोई निर्भरता नहीं — style.css/brand variables की ज़रूरत नहीं।
   बंद करने के लिए:  <body data-app-nav="off">
   ============================================================ */
(function () {
  'use strict';

  var SHEET = [
    '@media (max-width: 860px) {',
      ':root{--dpn-h:62px;--dpn-safe:env(safe-area-inset-bottom,0px);--dpn-total:calc(var(--dpn-h) + var(--dpn-safe));',
      '--dpn-maroon:#8B1538;--dpn-saffron:#FF7A00;--dpn-gold:#D4A017;--dpn-green:#0D7A3A;--dpn-ink:#3a2b23;--dpn-muted:#8a7a70;}',
      'body{padding-bottom:var(--dpn-total) !important;}',
      '.dpn{position:fixed;left:0;right:0;bottom:0;height:var(--dpn-total);padding-bottom:var(--dpn-safe);',
      'background:rgba(255,255,255,.96);-webkit-backdrop-filter:saturate(180%) blur(18px);backdrop-filter:saturate(180%) blur(18px);',
      'border-top:1px solid rgba(212,160,23,.35);box-shadow:0 -4px 18px rgba(139,21,56,.10);',
      'display:grid;grid-template-columns:repeat(5,1fr);align-items:stretch;z-index:950;}',
      '.dpn a{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;',
      'min-height:48px;padding:6px 2px;color:var(--dpn-muted);font-size:.68rem;font-weight:700;line-height:1.15;',
      'text-decoration:none;-webkit-tap-highlight-color:transparent;font-family:inherit;}',
      '.dpn a .ic{font-size:1.32rem;line-height:1;}',
      '.dpn a:active{transform:scale(.93);}',
      '.dpn a.on{color:var(--dpn-maroon);}',
      '.dpn a.on::before{content:"";position:absolute;top:3px;width:30px;height:3px;border-radius:999px;',
      'background:linear-gradient(90deg,var(--dpn-saffron),var(--dpn-green));}',
      '.dpn a.fab .ic{width:46px;height:46px;border-radius:50%;margin-top:-20px;display:grid;place-items:center;',
      'background:linear-gradient(135deg,var(--dpn-saffron),#e2670a);color:#fff;font-size:1.45rem;font-weight:700;',
      'border:3px solid #fff;box-shadow:0 6px 18px rgba(255,122,0,.42);}',
      '.dpn a.fab{color:var(--dpn-saffron);}',
      '.bn-en{display:none;}',
      'body.lang-en .bn-hi{display:none;}body.lang-en .bn-en{display:inline;}',
    '}',
    '@media print{.dpn{display:none !important;}}'
  ].join('');

  var ITEMS = [
    { href: 'index.html',        ic: '🏠', hi: 'गृह',     en: 'Home' },
    { href: 'the_Uplift.html',   ic: '🎓', hi: 'कोर्स',   en: 'Courses' },
    { href: 'the_Uplift.html',   ic: '＋', hi: 'आवेदन',   en: 'Apply', fab: true, hash: '#apply' },
    { href: 'donate.html',       ic: '🎁', hi: 'दान',     en: 'Donate' },
    { href: 'portal.html',       ic: '👤', hi: 'खाता',    en: 'Account' }
  ];

  function currentFile() {
    var path = location.pathname.split('/').pop() || 'index.html';
    return path === '' ? 'index.html' : path;
  }

  function build() {
    var body = document.body;
    if (!body) return;
    if (body.getAttribute('data-app-nav') === 'off') return;
    if (document.querySelector('.bottom-nav, .dpn')) return;
    if (body.getAttribute('data-app-nav') === 'hide') return;

    var style = document.createElement('style');
    style.id = 'dpn-style';
    style.textContent = SHEET;
    document.head.appendChild(style);

    var here = currentFile();
    var nav = document.createElement('nav');
    nav.className = 'dpn';
    nav.setAttribute('aria-label', 'Primary');

    ITEMS.forEach(function (item) {
      var a = document.createElement('a');
      var isHome = item.href === here && !item.hash;
      if (isHome) { a.className = 'on'; a.setAttribute('aria-current', 'page'); }
      a.className += (a.className ? ' ' : '') + (item.fab ? 'fab' : '');
      a.href = item.href + (item.hash || '');
      if (item.fab) a.setAttribute('aria-label', item.hi);
      a.innerHTML = '<span class="ic" aria-hidden="true">' + item.ic + '</span>' +
                    '<span><span class="bn-hi">' + item.hi + '</span><span class="bn-en">' + item.en + '</span></span>';
      nav.appendChild(a);
    });

    body.appendChild(nav);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
