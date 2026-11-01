/* ============================================================
   दिप्र फ़ाउंडेशन — Sound Effects System
   Dipra Foundation — Common Sound Effects
   Version: 1.1 (with subtle slider sound)
   ============================================================
   उपयोग:
   <script src="sound.js" defer></script>
   (</body> से ठीक पहले जोड़ें)

   Features:
   - Web Audio API (कोई external file नहीं)
   - Auto-attach to buttons, links, cards, tabs, modals, toasts
   - Floating sound toggle button (bottom-left)
   - Keyboard shortcut: Ctrl+M (mute/unmute)
   - localStorage में preference save
   - Accessibility: prefers-reduced-motion respect करता है
   - Auto-slide पर subtle sound (volume 0.05)
   ============================================================ */

(function() {
  'use strict';

  /* ============================================================
     1. CONFIG
     ============================================================ */
  const SOUND_CONFIG = {
    enabled: true,
    volume: 0.35,
    respectPrefersReduced: true,
    persistUserChoice: true,
    sounds: {
      click:        { freq: 800,  type: 'sine',     duration: 0.06, volume: 0.20 },
      hover:        { freq: 1200, type: 'sine',     duration: 0.03, volume: 0.08 },
      success:      { freq: 880,  type: 'sine',     duration: 0.15, volume: 0.30, chord: [880, 1108, 1318] },
      error:        { freq: 220,  type: 'sawtooth', duration: 0.20, volume: 0.25 },
      notification: { freq: 660,  type: 'triangle', duration: 0.12, volume: 0.25, chord: [660, 880] },
      modalOpen:    { freq: 520,  type: 'sine',     duration: 0.10, volume: 0.20, slide: 'up' },
      modalClose:   { freq: 520,  type: 'sine',     duration: 0.10, volume: 0.20, slide: 'down' },
      pageLoad:     { freq: 523,  type: 'sine',     duration: 0.18, volume: 0.22, chord: [523, 659, 784] },
      tabSwitch:    { freq: 700,  type: 'triangle', duration: 0.08, volume: 0.20 },
      toggle:       { freq: 900,  type: 'sine',     duration: 0.06, volume: 0.18 },
      formSubmit:   { freq: 587,  type: 'sine',     duration: 0.12, volume: 0.25, chord: [587, 740] },
      formReset:    { freq: 440,  type: 'sine',     duration: 0.10, volume: 0.20 },
      copy:         { freq: 1400, type: 'sine',     duration: 0.08, volume: 0.20 },
      whatsapp:     { freq: 990,  type: 'sine',     duration: 0.12, volume: 0.22, chord: [990, 1240] },
      /* 👇 Thoughts slider auto-slide के लिए subtle sound */
      slideChange:  { freq: 1000, type: 'sine',     duration: 0.04, volume: 0.05 }
    }
  };

  /* ============================================================
     2. PREFERENCES (Reduced Motion + localStorage)
     ============================================================ */
  if (SOUND_CONFIG.respectPrefersReduced) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      SOUND_CONFIG.enabled = false;
    }
  }

  if (SOUND_CONFIG.persistUserChoice) {
    const stored = localStorage.getItem('dipra_sound_enabled');
    if (stored === 'false') SOUND_CONFIG.enabled = false;
    if (stored === 'true')  SOUND_CONFIG.enabled = true;
    const storedVol = localStorage.getItem('dipra_sound_volume');
    if (storedVol) SOUND_CONFIG.volume = parseFloat(storedVol);
  }

  /* ============================================================
     3. AUDIO CONTEXT
     ============================================================ */
  let audioCtx = null;
  let isUnlocked = false;

  function getCtx() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('[SoundFX] AudioContext not supported');
        return null;
      }
    }
    return audioCtx;
  }

  function unlockAudio() {
    if (isUnlocked) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => { isUnlocked = true; }).catch(() => {});
    } else {
      isUnlocked = true;
    }
  }

  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, unlockAudio, { once: true, passive: true });
  });

  /* ============================================================
     4. PLAY TONE
     ============================================================ */
  function playTone(config) {
    if (!SOUND_CONFIG.enabled) return;
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = (config.volume || 0.2) * SOUND_CONFIG.volume;
    const frequencies = config.chord || [config.freq];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = config.type || 'sine';
      osc.frequency.setValueAtTime(freq, now);

      if (config.slide === 'up') {
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + config.duration);
      } else if (config.slide === 'down') {
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + config.duration);
      }

      const delay = idx * 0.05;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(volume, now + delay + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + config.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + config.duration + 0.05);
    });
  }

  /* ============================================================
     5. PUBLIC API
     ============================================================ */
  const SoundFX = {
    play(name) {
      const config = SOUND_CONFIG.sounds[name];
      if (!config) { console.warn('[SoundFX] Unknown sound:', name); return; }
      playTone(config);
    },
    enable() {
      SOUND_CONFIG.enabled = true;
      localStorage.setItem('dipra_sound_enabled', 'true');
      this.play('success');
      updateIndicator();
    },
    disable() {
      SOUND_CONFIG.enabled = false;
      localStorage.setItem('dipra_sound_enabled', 'false');
      updateIndicator();
    },
    toggle() {
      if (SOUND_CONFIG.enabled) this.disable();
      else this.enable();
    },
    setVolume(v) {
      SOUND_CONFIG.volume = Math.max(0, Math.min(1, v));
      localStorage.setItem('dipra_sound_volume', String(SOUND_CONFIG.volume));
    },
    isEnabled() { return SOUND_CONFIG.enabled; }
  };

  window.SoundFX = SoundFX;

  /* ============================================================
     6. AUTO-ATTACH: CLICK EVENTS
     ============================================================ */
  document.addEventListener('click', function(e) {
    const el = e.target.closest(
      'button, .btn, a, .action-btn, .portal-tab, .admin-tab, .lang-btn, ' +
      '.slider-btn, .slider-dot, .burger, .quick-btn, .cat-card, ' +
      '.district-item, .amount-preset, .free-card, .ebook-tab, .result-tab, ' +
      '.tbl-btn, .upload-btn, .bearer, .pillar, .value-item, .way-item, ' +
      '.support-card, .impact-card, .usage-card, .benefit-col, .download-card'
    );
    if (!el || el.disabled) return;

    /* — Skip if this element has data-no-sound — */
    if (el.dataset.noSound === 'true') return;

    /* — Skip if inside slider (slider already plays its own) — */
    if (el.closest('.thoughts-slider') && !el.matches('.slider-btn, .slider-dot')) {
      return;
    }

    /* — Determine sound by element — */
    if (el.matches('.lang-btn, .portal-tab, .admin-tab, .slider-dot, .burger, .ebook-tab, .result-tab')) {
      SoundFX.play('tabSwitch');
    } else if (el.matches('.slider-btn')) {
      SoundFX.play('click');
    } else if (el.matches('a[href^="mailto:"], a[href^="tel:"]')) {
      SoundFX.play('whatsapp');
    } else if (el.matches('.amount-preset, .cat-card, .district-item, .quick-btn')) {
      SoundFX.play('toggle');
    } else if (el.matches('.tbl-btn, .upload-btn')) {
      SoundFX.play('click');
    } else if (el.matches('.card, .info-card, .pillar, .bearer, .value-item, .way-item, .support-card, .impact-card, .usage-card, .free-card, .benefit-col, .download-card')) {
      SoundFX.play('click');
    } else {
      SoundFX.play('click');
    }
  }, true);

  /* ============================================================
     7. AUTO-ATTACH: HOVER (subtle tick)
     ============================================================ */
  let hoverThrottle = false;
  document.addEventListener('mouseover', function(e) {
    const el = e.target.closest(
      '.card, .info-card, .pillar, .bearer, .value-item, .usage-card, ' +
      '.impact-card, .free-card, .support-card, .way-item, .benefit-col, .download-card'
    );
    if (!el) return;
    if (hoverThrottle) return;
    hoverThrottle = true;
    setTimeout(() => { hoverThrottle = false; }, 150);
    SoundFX.play('hover');
  }, { passive: true });

  /* ============================================================
     8. FORM EVENTS
     ============================================================ */
  document.addEventListener('submit', function() {
    SoundFX.play('formSubmit');
  }, true);

  const errorObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const el = m.target;
        if (el.classList && el.classList.contains('err')) {
          SoundFX.play('error');
        }
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.field, .consent-box').forEach(el => {
      errorObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  });

  /* ============================================================
     9. MODAL OPEN/CLOSE
     ============================================================ */
  const modalObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const el = m.target;
        if (el.classList && el.classList.contains('modal')) {
          if (el.classList.contains('show')) {
            SoundFX.play('modalOpen');
          } else {
            SoundFX.play('modalClose');
          }
        }
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal').forEach(el => {
      modalObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  });

  /* ============================================================
     10. TOAST NOTIFICATIONS
     ============================================================ */
  const toastObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const el = m.target;
        if (el.classList && el.classList.contains('toast')) {
          if (el.classList.contains('show')) {
            const text = el.textContent || '';
            if (text.includes('✓') || text.includes('सफल') || text.includes('धन्यवाद') || text.toLowerCase().includes('success')) {
              SoundFX.play('success');
            } else if (text.includes('❌') || text.includes('त्रुटि') || text.toLowerCase().includes('error') || text.includes('कृपया')) {
              SoundFX.play('error');
            } else {
              SoundFX.play('notification');
            }
          }
        }
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.toast').forEach(el => {
      toastObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  });

  /* ============================================================
     11. CONFIRMATION CARDS
     ============================================================ */
  const confirmObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const el = m.target;
        if (el.classList && el.classList.contains('confirm') && el.classList.contains('show')) {
          SoundFX.play('success');
        }
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.confirm').forEach(el => {
      confirmObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  });

  /* ============================================================
     12. PAGE LOAD SOUND
     ============================================================ */
  window.addEventListener('load', function() {
    setTimeout(() => {
      if (isUnlocked) SoundFX.play('pageLoad');
    }, 400);
  });

  /* ============================================================
     13. FLOATING SOUND TOGGLE BUTTON
     ============================================================ */
  function injectSoundToggle() {
    if (document.getElementById('soundToggleBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'soundToggleBtn';
    btn.setAttribute('aria-label', 'Sound toggle');
    btn.title = '🔊 Sound on / off';
    btn.innerHTML = '<span id="soundIcon">🔊</span>';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8B1538, #B91C48);
      color: #fff;
      border: 2px solid #F0BE3E;
      box-shadow: 0 6px 18px rgba(139, 21, 56, 0.35);
      cursor: pointer;
      z-index: 1400;
      font-size: 1.3rem;
      display: grid;
      place-items: center;
      transition: all 0.2s ease;
      padding: 0;
      line-height: 1;
      font-family: inherit;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 10px 26px rgba(139, 21, 56, 0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 6px 18px rgba(139, 21, 56, 0.35)';
    });

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      SoundFX.toggle();
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
    });

    document.body.appendChild(btn);
    updateIndicator();
  }

  function updateIndicator() {
    const icon = document.getElementById('soundIcon');
    const btn = document.getElementById('soundToggleBtn');
    if (!icon || !btn) return;
    if (SOUND_CONFIG.enabled) {
      icon.textContent = '🔊';
      btn.style.opacity = '1';
      btn.title = '🔊 Sound ON — Click to mute (Ctrl+M)';
    } else {
      icon.textContent = '🔇';
      btn.style.opacity = '0.65';
      btn.title = '🔇 Sound OFF — Click to unmute (Ctrl+M)';
    }
  }

  document.addEventListener('DOMContentLoaded', injectSoundToggle);

  /* ============================================================
     14. KEYBOARD SHORTCUT: Ctrl + M
     ============================================================ */
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      SoundFX.toggle();
    }
  });

  /* ============================================================
     15. QUICK HELPERS
     ============================================================ */
  window.playClick    = () => SoundFX.play('click');
  window.playSuccess  = () => SoundFX.play('success');
  window.playError    = () => SoundFX.play('error');
  window.playNotify   = () => SoundFX.play('notification');
  window.playSlide    = () => SoundFX.play('slideChange');

  /* ============================================================
     16. OPTIONAL: AUTO-WIRE THOUGHTS SLIDER
     ============================================================
     अगर आपके slider में `nextSlide()` / `prevSlide()` functions हैं,
     तो उनमें manually `SoundFX.play('slideChange')` डालें।
     
     यह block सिर्फ उन pages के लिए है जहाँ slider data attribute
     `data-sound-slider="true"` है।
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function() {
    // जब भी कोई element with .thought-slide .active change हो, subtle sound
    const slides = document.querySelectorAll('.thought-slide');
    if (slides.length === 0) return;

    const sliderObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const el = m.target;
          if (el.classList.contains('thought-slide') && el.classList.contains('active')) {
            // यह अभी active हुआ है
            // (अगर आप nextSlide/prevSlide में manually sound डाल रहे हैं,
            // तो इस block को comment कर दें ताकि double sound न हो)
            // SoundFX.play('slideChange');  // ← uncomment if you want auto
          }
        }
      });
    });

    slides.forEach(el => {
      sliderObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
  });

  /* ============================================================
     READY
     ============================================================ */
  console.log(
    '%c🔊 Dipra Sound FX v1.1 loaded',
    'color:#8B1538;font-weight:bold;font-size:12px'
  );
  console.log(
    '%cSounds: click, hover, success, error, notification, modalOpen, modalClose, pageLoad, tabSwitch, toggle, formSubmit, formReset, copy, whatsapp, slideChange',
    'color:#5A4030;font-size:10px'
  );

})();
