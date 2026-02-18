(function () {
  var reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var hoverQuery = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };

  var siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    var syncHeader = function () {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 14);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  }

  var menuBtn = document.querySelector('[data-menu-btn]');
  var nav = document.querySelector('[data-main-nav]');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var yearNodes = Array.prototype.slice.call(document.querySelectorAll('[data-year]'));
  if (yearNodes.length) {
    var currentYear = String(new Date().getFullYear());
    yearNodes.forEach(function (node) {
      node.textContent = currentYear;
    });
  }

  var hero = document.querySelector('.hero');
  var updateHeroParallax = null;
  if (hero && !reduceMotionQuery.matches) {
    updateHeroParallax = function () {
      if (window.innerWidth < 901) {
        hero.style.setProperty('--hero-parallax', '0px');
        return;
      }

      var rect = hero.getBoundingClientRect();
      var viewport = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > viewport) return;

      var progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      var offset = Math.max(-36, Math.min(36, progress * -22));
      hero.style.setProperty('--hero-parallax', offset.toFixed(2) + 'px');
    };

    var parallaxTicking = false;
    var requestParallax = function () {
      if (parallaxTicking) return;
      parallaxTicking = true;
      window.requestAnimationFrame(function () {
        updateHeroParallax();
        parallaxTicking = false;
      });
    };

    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    updateHeroParallax();
  } else if (hero) {
    hero.style.setProperty('--hero-parallax', '0px');
  }

  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-dot]'));
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
  var prevBtn = document.querySelector('[data-prev]');
  var nextBtn = document.querySelector('[data-next]');

  if (slides.length) {
    var current = 0;
    var timer = null;

    var paint = function (next) {
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });

      if (updateHeroParallax) updateHeroParallax();
    };

    var start = function () {
      if (slides.length < 2) return;
      stop();
      timer = setInterval(function () {
        paint(current + 1);
      }, 9000);
    };

    var stop = function () {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        paint(Number(dot.getAttribute('data-dot')) || 0);
        start();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        paint(current - 1);
        start();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        paint(current + 1);
        start();
      });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    paint(0);
    start();
  }

  var revealSelectors = ['.reveal', '.service-card', '.offer-row', '.schedule-card', '.panel', '.quote-card'];
  var revealItems = [];
  var revealSeen = new Set();
  revealSelectors.forEach(function (selector) {
    Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (item) {
      if (revealSeen.has(item)) return;
      revealSeen.add(item);
      if (!item.classList.contains('reveal')) item.classList.add('reveal');
      revealItems.push(item);
    });
  });

  revealItems.forEach(function (item, index) {
    item.style.setProperty('--reveal-delay', String((index % 9) * 55) + 'ms');
  });

  if (revealItems.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
      item.classList.add('visible');
    });
  }

  // iOS/Safari fallback: if observers fail to trigger, force visibility.
  if (revealItems.length) {
    window.setTimeout(function () {
      var hasHidden = revealItems.some(function (item) {
        return !item.classList.contains('is-visible') && !item.classList.contains('visible');
      });

      if (hasHidden) {
        revealItems.forEach(function (item) {
          item.classList.add('is-visible');
          item.classList.add('visible');
        });
      }
    }, 1200);
  }

  if (!reduceMotionQuery.matches && hoverQuery.matches) {
    var tiltCards = Array.prototype.slice.call(document.querySelectorAll('.service-card, .offer-row'));

    tiltCards.forEach(function (card) {
      card.classList.add('tilt-card');

      var frameId = null;
      var tiltX = 0;
      var tiltY = 0;
      var lift = '0px';
      var glare = 0;
      var gx = '50%';
      var gy = '50%';

      var renderTilt = function () {
        card.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
        card.style.setProperty('--tilt-z', lift);
        card.style.setProperty('--tilt-glare', String(glare));
        card.style.setProperty('--tilt-gx', gx);
        card.style.setProperty('--tilt-gy', gy);
        frameId = null;
      };

      var queueRender = function () {
        if (frameId !== null) return;
        frameId = window.requestAnimationFrame(renderTilt);
      };

      var resetTilt = function () {
        tiltX = 0;
        tiltY = 0;
        lift = '0px';
        glare = 0;
        gx = '50%';
        gy = '50%';
        card.classList.remove('is-tilting');
        queueRender();
      };

      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        var px = (event.clientX - rect.left) / rect.width;
        var py = (event.clientY - rect.top) / rect.height;
        px = Math.max(0, Math.min(1, px));
        py = Math.max(0, Math.min(1, py));

        tiltY = (px - 0.5) * 14;
        tiltX = (0.5 - py) * 12;
        lift = '-6px';
        gx = (px * 100).toFixed(2) + '%';
        gy = (py * 100).toFixed(2) + '%';
        glare = Math.min(0.24, 0.08 + Math.abs(tiltX * tiltY) / 390);

        card.classList.add('is-tilting');
        queueRender();
      });

      card.addEventListener('mouseleave', resetTilt);
      card.addEventListener('focusout', resetTilt);
      card.addEventListener(
        'touchstart',
        function () {
          resetTilt();
        },
        { passive: true }
      );
    });
  }

  var consentStorageKey = 'gesundgeht_cookie_consent_v1';
  var consentAllowedLevels = { essential: true, all: true };

  var readCookieConsent = function () {
    try {
      var rawValue = window.localStorage.getItem(consentStorageKey);
      if (!rawValue) return null;
      var parsedValue = JSON.parse(rawValue);
      if (!parsedValue || !consentAllowedLevels[parsedValue.level]) return null;
      return parsedValue.level;
    } catch (error) {
      return null;
    }
  };

  var writeCookieConsent = function (level) {
    if (!consentAllowedLevels[level]) return;
    try {
      window.localStorage.setItem(
        consentStorageKey,
        JSON.stringify({
          level: level,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      // Ignore storage errors (private mode, disabled storage, etc.)
    }
  };

  var applyCookieConsent = function (level) {
    if (!consentAllowedLevels[level]) return;
    document.documentElement.setAttribute('data-cookie-consent', level);
    if (level === 'all') {
      window.dispatchEvent(new CustomEvent('gesundgeht:cookies-all-enabled'));
    }
  };

  var setupCookieBanner = function () {
    if (!document.body) return;

    var banner = document.createElement('section');
    banner.className = 'cookie-consent';
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie Hinweis');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="cookie-consent__panel">' +
      '<p class="cookie-consent__title">Cookie-Hinweis</p>' +
      '<p class="cookie-consent__text">Wir verwenden notwendige Cookies, damit die Website stabil funktioniert. Optionale Cookies helfen uns, die Nutzung zu verbessern.</p>' +
      '<p class="cookie-consent__links"><a href="datenschutz.html">Datenschutz</a><span aria-hidden="true">|</span><a href="impressum.html">Impressum</a></p>' +
      '<div class="cookie-consent__actions">' +
      '<button type="button" class="cookie-btn cookie-btn--ghost" data-cookie-essential>Nur notwendige</button>' +
      '<button type="button" class="cookie-btn cookie-btn--brand" data-cookie-all>Alle akzeptieren</button>' +
      '</div>' +
      '</div>';

    var settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'cookie-settings-btn';
    settingsButton.setAttribute('aria-expanded', 'false');
    settingsButton.textContent = 'Cookie-Einstellungen';

    document.body.appendChild(banner);
    document.body.appendChild(settingsButton);

    var showSettingsButton = function () {
      settingsButton.classList.add('is-visible');
    };

    var hideSettingsButton = function () {
      settingsButton.classList.remove('is-visible');
    };

    var openBanner = function () {
      banner.hidden = false;
      window.requestAnimationFrame(function () {
        banner.classList.add('is-visible');
      });
      settingsButton.setAttribute('aria-expanded', 'true');
      hideSettingsButton();
    };

    var closeBanner = function () {
      banner.classList.remove('is-visible');
      settingsButton.setAttribute('aria-expanded', 'false');
      window.setTimeout(function () {
        if (!banner.classList.contains('is-visible')) {
          banner.hidden = true;
        }
      }, 240);
      showSettingsButton();
    };

    banner.querySelector('[data-cookie-essential]').addEventListener('click', function () {
      writeCookieConsent('essential');
      applyCookieConsent('essential');
      closeBanner();
    });

    banner.querySelector('[data-cookie-all]').addEventListener('click', function () {
      writeCookieConsent('all');
      applyCookieConsent('all');
      closeBanner();
    });

    settingsButton.addEventListener('click', function () {
      openBanner();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (banner.hidden) return;
      var currentConsent = readCookieConsent();
      if (currentConsent) {
        closeBanner();
      }
    });

    var currentConsent = readCookieConsent();
    if (currentConsent) {
      applyCookieConsent(currentConsent);
      banner.hidden = true;
      showSettingsButton();
    } else {
      openBanner();
    }
  };

  setupCookieBanner();

  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var notice = document.querySelector('[data-submit-notice]');
      if (notice) notice.classList.add('show');
      contactForm.reset();
    });
  }
})();
