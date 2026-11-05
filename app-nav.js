/* ============================================================
   दिप्र फ़ाउंडेशन — Mobile app shell (bottom bar + header menu)
   Dipra Foundation — shared mobile navigation
   ============================================================
   उपयोग:  <script src="/app-nav.js" defer></script>  (</body> से पहले)
   ≤860px पर हर पेज पर एक ही bottom bar और एक ही 3-line मेनू।
   बंद करने के लिए:  <body data-app-nav="off">
   ============================================================ */
(function () {
  'use strict';

  var MENU_ID = 'dpnMenu';
  var BURGER_ID = 'dpnBurger';

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
      /* pledge पेज का sticky "पढ़ लिया" बार tab bar के ऊपर बैठे */
      '.readbox{bottom:calc(10px + var(--dpn-total,0px));z-index:940;}',
      /* portal का अपना bar इन-पेज views संभालता है — वह दिखे तो shared bar छिपा रहे */
      '#bottom-nav:not(.hidden)~.dpn{display:none !important;}',
      /* हर पेज का लुक एक जैसा — पुराने native मेनू/बर्गर मोबाइल पर छिपे रहें */
      '#mainNav,.mobile-drawer,.drawer-scrim,.nav-backdrop,header .nav-links,.desktop-nav{display:none !important;}',
      '#burger:not(.dpn-burger),.burger:not(.dpn-burger),#menuToggle:not(.dpn-burger),#navToggle:not(.dpn-burger){display:none !important;}',
      '.bn-en{display:none;}',
      'body.lang-en .bn-hi{display:none;}body.lang-en .bn-en{display:inline;}',
    '}',
    /* डेस्कटॉप पर कोई mobile chrome नहीं — पेज का अपना header नेविगेशन चालू रहे */
    '@media (min-width: 861px) {',
      '.dpn,#' + MENU_ID + ',.dpn-backdrop,.dpn-burger{display:none !important;}',
    '}',
    /* डेस्कटॉप पर कोई mobile-chrome नहीं — header का अपना नेविगेशन चालू रहे */
    '@media (min-width: 861px) {',
      '.dpn,#' + MENU_ID + ',.dpn-backdrop,.dpn-burger{display:none !important;}',
    '}',
    '@media print{.dpn,#' + MENU_ID + ',.dpn-backdrop,.dpn-burger{display:none !important;}}'
  ].join('');

  var NAV_SHEET = [
    '@media (max-width: 860px) {',
      '#' + MENU_ID + '{position:fixed;top:0;right:0;left:auto;bottom:0;width:min(360px,88vw);height:100dvh;',
      'display:block;background:linear-gradient(180deg,#fff 0,#fffaf4 100%);color:var(--dpn-ink);',
      'z-index:1200;margin:0;padding:calc(18px + env(safe-area-inset-top,0px)) 18px calc(96px + var(--dpn-safe));',
      'overflow-y:auto;overscroll-behavior:contain;box-shadow:-12px 0 36px rgba(53,17,31,.2);',
      'transform:translateX(105%);visibility:hidden;opacity:0;',
      'transition:transform .26s ease,visibility .26s,opacity .26s;}',
      '#' + MENU_ID + '.dpn-open{transform:translateX(0);visibility:visible;opacity:1;}',
      '#' + MENU_ID + ' ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;align-items:stretch;gap:7px;}',
      '#' + MENU_ID + ' li{display:block;}',
      '#' + MENU_ID + ' a{display:block;padding:13px 15px;font-size:1rem;font-weight:700;color:var(--dpn-ink);',
      'text-decoration:none;border:1px solid rgba(0,0,0,.07);border-radius:12px;background:#fff;',
      'box-shadow:0 2px 8px rgba(74,31,17,.045);}',
      '#' + MENU_ID + ' a.dpn-on,#' + MENU_ID + ' a:hover,#' + MENU_ID + ' a:focus-visible{background:#fff1e0;color:var(--dpn-maroon);border-color:#f1d4ac;}',
      '#' + MENU_ID + ' .dpn-sec{margin:0 2px 16px;padding-bottom:12px;border-bottom:1px solid rgba(0,0,0,.08);',
      'display:flex;align-items:center;justify-content:space-between;gap:10px;}',
      '#' + MENU_ID + ' .dpn-sec b{font-size:1.06rem;color:var(--dpn-maroon);}',
      '.dpn-x{width:44px;height:44px;flex:none;border:1px solid rgba(0,0,0,.10);border-radius:13px;background:#fff;',
      'color:var(--dpn-maroon);font-size:1.5rem;line-height:1;cursor:pointer;}',
      '#' + MENU_ID + ' .dpn-sub{display:block;font-size:.72rem;font-weight:600;color:var(--dpn-muted);margin-top:2px;}',
      '.dpn-backdrop{position:fixed;inset:0;background:rgba(35,18,12,.42);z-index:1150;border:0;padding:0;',
      'opacity:0;visibility:hidden;transition:opacity .26s,visibility .26s;cursor:pointer;}',
      '.dpn-backdrop.dpn-open{opacity:1;visibility:visible;}',
      '.dpn-burger{position:fixed;top:calc(9px + env(safe-area-inset-top,0px));right:12px;z-index:1010;margin:0;',
      'display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;width:46px;height:46px;',
      'border:1px solid rgba(0,0,0,.10);border-radius:13px;background:#fffaf4;box-shadow:0 3px 10px rgba(139,21,56,.08);',
      'cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}',
      '.dpn-burger:active{transform:scale(.96);}',
      '.dpn-burger span{display:block;width:22px;height:2.5px;background:var(--dpn-maroon);border-radius:2px;transition:.25s;}',
      '.dpn-burger.dpn-open span:nth-child(1){transform:translateY(7.5px) rotate(45deg);}',
      '.dpn-burger.dpn-open span:nth-child(2){opacity:0;}',
      '.dpn-burger.dpn-open span:nth-child(3){transform:translateY(-7.5px) rotate(-45deg);}',
      'body.dpn-lock{overflow:hidden !important;}',
      /* भाषा बदलने का बटन 3-लाइन मेनू के पीछे न छिपे — थोड़ा बाईं ओर */
      '.lang-switch,.lang,.langs{margin-right:64px;}',
      /* जो पेज इसे मोबाइल पर पूरी तरह छिपा देते हैं (nav-links के अंदर) — वही बटन मेनू के बाएँ */
      '.dpn-lang{position:fixed;top:calc(9px + env(safe-area-inset-top,0px));right:66px;z-index:1010;}',
      '.dpn-lang>div{margin:0 !important;display:flex !important;}',
    '}',
    '@media print{#' + MENU_ID + ',.dpn-backdrop,.dpn-burger{display:none !important;}}'
  ].join('');

  var ITEMS = [
    { href: '/index.html',      ic: '🏠', hi: 'गृह',     en: 'Home',    re: /^\/$|^\/(index\.html|home(\/index\.html)?)$/i },
    { href: '/the_Uplift/',     ic: '🎓', hi: 'कोर्स',   en: 'Courses', re: /^\/the_Uplift/i },
    { href: '/the_Uplift/',     ic: '＋', hi: 'आवेदन',   en: 'Apply',  fab: true, hash: '#apply' },
    { href: '/donate/',         ic: '🎁', hi: 'दान',     en: 'Donate',  re: /^\/donate/i },
    { href: '/portal/',         ic: '👤', hi: 'खाता',    en: 'Account', re: /^\/portal/i }
  ];

  var MENU = [
    { href: '/home/',        hi: 'गृह',            en: 'Home',                 re: /^\/$|^\/(index\.html|home)/i },
    { href: '/about/',       hi: 'हमारे बारे में',  en: 'About us',             re: /^\/about/i },
    { href: '/the_Uplift/',  hi: 'The Uplift',     en: 'Courses & apply',      re: /^\/the_Uplift/i },
    { href: '/pledge/',      hi: 'संकल्प लें',     en: 'Take a pledge',        re: /^\/pledge/i },
    { href: '/ebook/',       hi: 'ई-पुस्तक',       en: 'E-book',               re: /^\/ebook/i },
    { href: '/districts/',   hi: 'ज़िले',          en: 'Districts',            re: /^\/districts/i },
    { href: '/verify/',      hi: 'सत्यापन',        en: 'Verify certificate',   re: /^\/verify(?!-)/i },
    { href: '/portal/',      hi: 'पोर्टल',         en: 'Member portal',        re: /^\/portal/i },
    { href: '/donate/',      hi: 'दान',            en: 'Donate',               re: /^\/donate/i },
    { href: '/contact/',     hi: 'संपर्क',         en: 'Contact',              re: /^\/contact/i },
    { href: '/disclaimer/',  hi: 'गोपनीयता',       en: 'Privacy & disclaimer', re: /^\/disclaimer/i }
  ];

  function currentPath() {
    var path = location.pathname.replace(/index\.html$/i, '');
    if (path.length > 1) path = path.replace(/\/$/, '');
    return path || '/';
  }

  /* fold-URL (/donate/) aur root-URL (/donate.html) दोनों एक जैसे पहचानें */
  function isActive(re) {
    return !!re && re.test(currentPath());
  }

  function addStyle(id, css) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildBar() {
    if (document.querySelector('nav.dpn')) return;
    var native = document.querySelector('.bottom-nav');
    // इन-पेज section bar (the_Uplift) की जगह shared bar; portal का view-bar छोड़ दें
    var isAppTabber = native && (native.querySelector('button[data-view]') || native.querySelector('.bottom-nav-item[hidden]'));
    if (native && !isAppTabber) native.style.setProperty('display', 'none', 'important');

    var bar = document.createElement('nav');
    bar.className = 'dpn';
    bar.setAttribute('aria-label', 'Primary');

    ITEMS.forEach(function (item) {
      var a = document.createElement('a');
      if (!item.fab && isActive(item.re)) { a.className = 'on'; a.setAttribute('aria-current', 'page'); }
      a.className += (a.className ? ' ' : '') + (item.fab ? 'fab' : '');
      a.href = item.href + (item.hash || '');
      if (item.fab) a.setAttribute('aria-label', item.hi);
      a.innerHTML = '<span class="ic" aria-hidden="true">' + item.ic + '</span>' +
                    '<span><span class="bn-hi">' + item.hi + '</span><span class="bn-en">' + item.en + '</span></span>';
      bar.appendChild(a);
    });

    document.body.appendChild(bar);

    // portal का अपना view-bar लॉगिन के बाद दिखता है — तब shared bar हटा दें (दो bar एक साथ न दिखें)
    if (isAppTabber) {
      var sync = function () {
        var shown = w.getComputedStyle(native).display !== 'none';
        bar.style.setProperty('display', shown ? 'none' : '', shown ? 'important' : '');
      };
      var w = window;
      try { new MutationObserver(sync).observe(native, { attributes: true, attributeFilter: ['class', 'style'] }); } catch (e) {}
      sync();
    }
  }

  /* मोबाइल पर भाषा-बटन हर पेज पर दिखे: इन-फ्लो हो तो burger से दूर, छिपा हो तो ऊपर ले आओ */
  function placeLang() {
    var groups = [].slice.call(document.querySelectorAll('.lang-switch,.lang,.langs'))
      .filter(function (g) { return g.querySelector('button[data-lang]'); });
    if (!groups.length) return;
    if (groups.some(function (g) { return g.getBoundingClientRect().width > 0; })) return;
    var host = document.createElement('div');
    host.className = 'dpn-lang';
    host.appendChild(groups[0]);
    document.body.appendChild(host);
  }

  function buildMenu() {
    if (document.getElementById(MENU_ID)) return;

    var menu = document.createElement('nav');
    menu.id = MENU_ID;
    menu.setAttribute('aria-label', 'Main Navigation');
    menu.innerHTML = '<div class="dpn-sec"><b>मेनू / Menu</b>' +
      '<button type="button" class="dpn-x" aria-label="मेनू बंद करें / Close menu">×</button></div>' +
      '<ul>' + MENU.map(function (m) {
        return '<li><a href="' + m.href + '"' + (isActive(m.re) ? ' class="dpn-on"' : '') + '>' +
               m.hi + '<span class="dpn-sub">' + m.en + '</span></a></li>';
      }).join('') + '</ul>';

    var burger = document.createElement('button');
    burger.type = 'button';
    burger.id = BURGER_ID;
    burger.className = 'dpn-burger';
    burger.setAttribute('aria-label', 'मेनू खोलें / Open menu');
    burger.setAttribute('aria-controls', MENU_ID);
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';

    var backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'dpn-backdrop';
    backdrop.setAttribute('aria-label', 'Close menu');
    backdrop.setAttribute('tabindex', '-1');

    document.body.appendChild(backdrop);
    document.body.appendChild(menu);
    document.body.appendChild(burger);
    addStyle('dpn-nav-style', NAV_SHEET);

    var open = false;
    function setOpen(next) {
      open = !!next;
      menu.classList.toggle('dpn-open', open);
      burger.classList.toggle('dpn-open', open);
      backdrop.classList.toggle('dpn-open', open);
      burger.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('dpn-lock', open);
    }
    setOpen(false);

    burger.addEventListener('click', function (e) { e.preventDefault(); setOpen(!open); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    menu.querySelector('.dpn-x').addEventListener('click', function () { setOpen(false); });
    menu.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { setOpen(false); });
    try { placeLang(); } catch (e) { /* भाषा-बटन न हटे तो भी पेज चले */ }
  }

  function build() {
    var body = document.body;
    if (!body) return;
    var mode = body.getAttribute('data-app-nav');
    if (mode === 'off' || mode === 'hide') return;

    addStyle('dpn-style', SHEET);
    try { buildBar(); } catch (e) { /* bar न बने तो भी पेज चले */ }
    try { buildMenu(); } catch (e) { /* menu न बने तो भी पेज चले */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
