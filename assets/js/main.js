/**
 * main.js — DJfilm | Vidéaste à Agen
 * JS vanilla minimal — aucune dépendance externe
 */

(function () {
  'use strict';

  /* =====================================================================
     1. HEADER — scroll behavior
     ===================================================================== */
  const header = document.getElementById('site-header');

  if (header) {
    let lastScrollY = 0;
    const SCROLL_THRESHOLD = 20;

    function onScroll() {
      const y = window.scrollY;
      const nav = document.getElementById('site-nav');
      if (y > SCROLL_THRESHOLD) {
        header.classList.add('is-scrolled');
        if (nav) nav.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
        if (nav) nav.classList.remove('is-scrolled');
      }
      lastScrollY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // état initial
  }

  /* =====================================================================
     2. NAVIGATION MOBILE — hamburger
     ===================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const siteNav   = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    function openNav() {
      siteNav.classList.add('is-open');
      navToggle.classList.add('is-open');
      if (header) header.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Fermer le menu');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      siteNav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      if (header) header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', function () {
      const isOpen = siteNav.classList.contains('is-open');
      isOpen ? closeNav() : openNav();
    });

    // Fermer sur Echap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    // Fermer au clic sur un lien
    siteNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Fermer au redimensionnement > mobile
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeNav();
    });
  }

  /* =====================================================================
     3. REVEAL AU SCROLL — Intersection Observer
     ===================================================================== */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback : tout visible
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* =====================================================================
     4. FAQ — ACCORDÉON
     ===================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const toggle = item.querySelector('.faq-item__toggle');
    const answer = item.querySelector('.faq-item__answer');

    if (!toggle || !answer) return;

    toggle.addEventListener('click', function () {
      const isOpen = item.classList.contains('is-open');

      // Fermer tous les autres
      faqItems.forEach(function (otherItem) {
        if (otherItem !== item && otherItem.classList.contains('is-open')) {
          otherItem.classList.remove('is-open');
          otherItem.querySelector('.faq-item__toggle').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-item__answer').hidden = true;
        }
      });

      // Toggle l'item courant
      if (isOpen) {
        item.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
      } else {
        item.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  /* =====================================================================
     5. FAQ — FILTRES PAR CATÉGORIE
     ===================================================================== */
  const faqCatBtns = document.querySelectorAll('.faq-cat-btn');
  const faqGroups  = document.querySelectorAll('.faq-group');

  if (faqCatBtns.length > 0) {
    faqCatBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const cat = btn.dataset.category;

        faqCatBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        faqGroups.forEach(function (group) {
          if (cat === 'all' || group.dataset.category === cat) {
            group.hidden = false;
          } else {
            group.hidden = true;
          }
        });
      });
    });
  }

  /* =====================================================================
     6. PORTFOLIO — FILTRES
     ===================================================================== */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (filterBtns.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const cat = btn.dataset.filter;

        filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        portfolioCards.forEach(function (card) {
          if (cat === 'all' || card.dataset.category === cat) {
            card.classList.remove('is-hidden');
          } else {
            card.classList.add('is-hidden');
          }
        });
      });
    });
  }

  /* =====================================================================
     7. FORMULAIRE CONTACT — feedback utilisateur
     ===================================================================== */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const successMsg = document.getElementById('form-success');
    const errorMsg   = document.getElementById('form-error');

    contactForm.addEventListener('submit', function (e) {
      // Si l'action est un vrai endpoint (Formspree), laisser le navigateur gérer
      // Sinon fallback mailto
      const action = contactForm.getAttribute('action') || '';
      if (!action || action.includes('VOTRE_ID_FORMSPREE')) {
        e.preventDefault();
        // Fallback : construire un mailto
        const name    = (contactForm.querySelector('#name')    || {}).value || '';
        const email   = (contactForm.querySelector('#email')   || {}).value || '';
        const service = (contactForm.querySelector('#service') || {}).value || '';
        const message = (contactForm.querySelector('#message') || {}).value || '';
        const subject = encodeURIComponent('Demande depuis djfilm.fr — ' + service);
        const body    = encodeURIComponent('Nom : ' + name + '\nEmail : ' + email + '\nService : ' + service + '\n\n' + message);
        window.location.href = 'mailto:djfilm@outlook.fr?subject=' + subject + '&body=' + body;
      }
    });
  }

  /* =====================================================================
     8. URL PARAM — pré-sélection du service dans le formulaire
     ===================================================================== */
  const serviceSelect = document.getElementById('service');
  if (serviceSelect) {
    const params  = new URLSearchParams(window.location.search);
    const service = params.get('service');
    if (service) {
      serviceSelect.value = service;
    }
  }

  /* =====================================================================
     9. SMOOTH SCROLL pour les ancres internes
     ===================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 72) + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });


  /* =====================================================================
     10. MODALE VIDÉO — portfolio
     ===================================================================== */
  var videoModal    = document.getElementById('video-modal');
  var videoPlayer   = document.getElementById('video-modal-player');
  var videoIframe   = document.getElementById('video-modal-iframe');
  var modalClose    = document.getElementById('video-modal-close');
  var modalBackdrop = document.getElementById('video-modal-backdrop');

  if (videoModal && (videoPlayer || videoIframe)) {

    function openVideoModal(src, type) {
      if (type === 'youtube') {
        videoIframe.src = src + '?autoplay=1&rel=0';
        videoIframe.hidden = false;
        if (videoPlayer) videoPlayer.hidden = true;
      } else {
        videoPlayer.src = src;
        videoPlayer.hidden = false;
        if (videoIframe) videoIframe.hidden = true;
      }
      videoModal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (modalClose) modalClose.focus();
      if (type === 'local') videoPlayer.play();
    }

    function closeVideoModal() {
      videoModal.hidden = true;
      document.body.style.overflow = '';
      if (videoPlayer) { videoPlayer.pause(); videoPlayer.src = ''; videoPlayer.hidden = true; }
      if (videoIframe) { videoIframe.src = ''; videoIframe.hidden = true; }
    }

    // Déclencheurs
    document.querySelectorAll('[data-video-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var src  = trigger.dataset.videoSrc;
        var type = trigger.dataset.videoType || 'local';
        openVideoModal(src, type);
      });
    });

    // Fermeture
    if (modalClose)    modalClose.addEventListener('click', closeVideoModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !videoModal.hidden) closeVideoModal();
    });
  }


  /* =====================================================================
     11. CAROUSEL DE SERVICES — cycle automatique selon le nombre d'images
     ===================================================================== */
  var carousels = document.querySelectorAll('.service-carousel');

  if (carousels.length) {
    var SLIDE_DURATION = 4; // secondes par slide
    var FADE_DURATION  = 1; // secondes pour le fondu
    var generatedCounts = {};
    var keyframeRules = [];

    // Passe 1 : collecter les comptes uniques et préparer les keyframes
    carousels.forEach(function (carousel) {
      var count = carousel.querySelectorAll('.service-carousel__slide').length;
      if (count < 2 || generatedCounts[count]) return;

      var total = count * SLIDE_DURATION;
      var p1 = (FADE_DURATION / total * 100).toFixed(2);
      var p2 = (SLIDE_DURATION / total * 100).toFixed(2);
      var p3 = ((SLIDE_DURATION + FADE_DURATION) / total * 100).toFixed(2);

      keyframeRules.push(
        '@keyframes carousel-fade-' + count + ' {' +
        '  0%       { opacity: 0; }' +
        '  ' + p1 + '% { opacity: 1; }' +
        '  ' + p2 + '% { opacity: 1; }' +
        '  ' + p3 + '% { opacity: 0; }' +
        '  100%     { opacity: 0; }' +
        '}'
      );
      generatedCounts[count] = true;
    });

    // Injecter les keyframes EN PREMIER, avant toute assignation d'animation
    if (keyframeRules.length) {
      var styleEl = document.createElement('style');
      styleEl.textContent = keyframeRules.join('\n');
      document.head.appendChild(styleEl);
    }

    // Passe 2 : assigner l'animation complète (shorthand) sur chaque slide
    carousels.forEach(function (carousel) {
      var slides = carousel.querySelectorAll('.service-carousel__slide');
      var count  = slides.length;
      if (count < 2) return;

      var total = count * SLIDE_DURATION;
      var name  = 'carousel-fade-' + count;

      slides.forEach(function (slide, i) {
        slide.style.animation = name + ' ' + total + 's ease-in-out ' + (i * SLIDE_DURATION) + 's infinite';
      });
    });
  }



})();
