/* =========================================
   DEVONSHIRE HOUSE SKIN CLINIC
   Main JavaScript — All Interactivity
   ========================================= */

(function () {
  'use strict';

  // ============ DARK MODE TOGGLE ============
  const themeToggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    const stored = localStorage.getItem('dh-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dh-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  // Apply stored/system theme immediately
  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('dh-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ============ HEADER SCROLL BEHAVIOUR ============
  const header = document.getElementById('header');
  let lastScroll = 0;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });

  // ============ MOBILE MENU ============
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileOverlay = document.getElementById('mobile-overlay');

  if (menuToggle && mobileMenu && mobileOverlay) {
    function openMenu() {
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      mobileOverlay.classList.add('open');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileOverlay.classList.remove('open');
      document.body.classList.remove('menu-open');
    }

    menuToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileOverlay.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close when clicking a link
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // ============ SCROLL REVEAL ANIMATIONS ============
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: reveal everything immediately
    revealElements.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // ============ TESTIMONIALS CAROUSEL ============
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const cards = track.querySelectorAll('.testimonial-card');
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    let maxIndex = Math.max(0, cards.length - cardsPerView);
    let autoPlayTimer = null;

    function getCardsPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function updateCarousel() {
      const cardWidth = 100 / cardsPerView;
      const offset = currentIndex * cardWidth;
      track.style.transform = 'translateX(-' + offset + '%)';

      // Update dots
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentIndex);
      });

      // Update button states
      prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
      nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();
    }

    function goNext() {
      if (currentIndex < maxIndex) {
        goTo(currentIndex + 1);
      } else {
        goTo(0); // Loop back
      }
    }

    function goPrev() {
      if (currentIndex > 0) {
        goTo(currentIndex - 1);
      } else {
        goTo(maxIndex);
      }
    }

    prevBtn.addEventListener('click', function () {
      goPrev();
      resetAutoPlay();
    });

    nextBtn.addEventListener('click', function () {
      goNext();
      resetAutoPlay();
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
        resetAutoPlay();
      });
    });

    // Auto-play
    function startAutoPlay() {
      autoPlayTimer = setInterval(goNext, 6000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    startAutoPlay();

    // Pause on hover
    track.addEventListener('mouseenter', function () {
      clearInterval(autoPlayTimer);
    });

    track.addEventListener('mouseleave', function () {
      startAutoPlay();
    });

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        cardsPerView = getCardsPerView();
        maxIndex = Math.max(0, cards.length - cardsPerView);
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        updateCarousel();
      }, 200);
    });

    // Initialize
    updateCarousel();
  }

  // ============ HERO PARALLAX ============
  const hero = document.querySelector('.hero');
  const heroBg = hero ? hero.querySelector('.hero__bg') : null;

  if (heroBg && window.innerWidth >= 768) {
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          const scrollY = window.scrollY;
          const heroHeight = hero.offsetHeight;
          if (scrollY <= heroHeight) {
            heroBg.style.transform = 'translateY(' + (scrollY * 0.35) + 'px)';
          }
        });
      }
    });
  }

  // ============ SMOOTH SCROLL FOR ANCHOR LINKS ============
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // ============ FILE UPLOAD (Contact Form) ============
  const uploadZone = document.querySelector('.form-upload');
  const fileInput = document.getElementById('file-upload');

  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', function () {
      fileInput.click();
    });

    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', function () {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        updateFileDisplay(files);
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files.length > 0) {
        updateFileDisplay(fileInput.files);
      }
    });

    function updateFileDisplay(files) {
      const textEl = uploadZone.querySelector('.form-upload__text');
      if (textEl) {
        const names = Array.from(files).map(function (f) { return f.name; }).join(', ');
        textEl.innerHTML = '<strong>' + files.length + ' file(s) selected:</strong> ' + names;
      }
    }
  }

  // ============ FORM VALIDATION (Contact Form) ============
  const form = document.getElementById('booking-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;

      // Validate required fields
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(function (field) {
        const group = field.closest('.form-group');
        if (!field.value.trim()) {
          if (group) group.classList.add('has-error');
          field.classList.add('error');
          isValid = false;
        } else {
          if (group) group.classList.remove('has-error');
          field.classList.remove('error');
        }
      });

      // Validate email format if present
      const emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          const group = emailField.closest('.form-group');
          if (group) group.classList.add('has-error');
          emailField.classList.add('error');
          isValid = false;
        }
      }

      if (isValid) {
        // Show success state
        const submitBtn = form.querySelector('.btn');
        if (submitBtn) {
          submitBtn.textContent = 'Message Sent ✓';
          submitBtn.style.backgroundColor = '#5BA55B';
          submitBtn.style.borderColor = '#5BA55B';
          submitBtn.disabled = true;

          setTimeout(function () {
            submitBtn.textContent = 'Submit';
            submitBtn.style.backgroundColor = '';
            submitBtn.style.borderColor = '';
            submitBtn.disabled = false;
            form.reset();
          }, 3000);
        }
      }
    });

    // Real-time validation clearing
    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        const group = field.closest('.form-group');
        if (group) group.classList.remove('has-error');
        field.classList.remove('error');
      });
    });
  }

  // ============ PHOTO GALLERY LIGHTBOX ============
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  if (galleryItems.length > 0 && lightbox && lightboxImg) {
    let currentPhotoIndex = 0;

    function showPhoto(index) {
      currentPhotoIndex = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[currentPhotoIndex];
      lightboxImg.src = item.getAttribute('data-full');
      lightboxImg.alt = item.getAttribute('data-caption') || '';
      if (lightboxCaption) {
        lightboxCaption.textContent = item.getAttribute('data-caption') || '';
      }
    }

    function openLightbox(index) {
      showPhoto(index);
      lightbox.classList.add('active');
      document.body.classList.add('menu-open');
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.classList.remove('menu-open');
    }

    galleryItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function () {
        showPhoto(currentPhotoIndex - 1);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', function () {
        showPhoto(currentPhotoIndex + 1);
      });
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
      if (e.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
    });
  }

  // ============ BEFORE/AFTER SLIDERS ============
  const beforeAfterWidgets = document.querySelectorAll('.before-after');

  beforeAfterWidgets.forEach(function (widget) {
    const handle = widget.querySelector('.before-after__handle');
    let dragging = false;

    function setPosition(clientX) {
      const rect = widget.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      widget.style.setProperty('--pos', pct + '%');
    }

    function onPointerDown(e) {
      dragging = true;
      setPosition(e.touches ? e.touches[0].clientX : e.clientX);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      setPosition(e.touches ? e.touches[0].clientX : e.clientX);
    }

    function onPointerUp() {
      dragging = false;
    }

    widget.addEventListener('click', function (e) {
      setPosition(e.clientX);
    });

    if (handle) {
      handle.addEventListener('mousedown', onPointerDown);
      handle.addEventListener('touchstart', onPointerDown, { passive: false });
    }

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
  });

  // ============ ACTIVE NAV HIGHLIGHTING ============
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav a');

  if (sections.length > 0 && navLinks.length > 0 && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.remove('active');
              if (link.getAttribute('href').includes('#' + id)) {
                link.classList.add('active');
              }
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px',
      }
    );

    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

})();
