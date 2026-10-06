const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

// Reveal the shared site navigation after the first scroll.
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const desktopNav = siteHeader.querySelector('.desktop-nav');
  let scheduled = false;
  const updateHeader = () => {
    scheduled = false;
    const visible = window.scrollY > 48;
    siteHeader.classList.toggle('is-scrolled', visible);
    desktopNav.inert = !visible;
    menuButton.inert = !visible;
    if (!visible) {
      mobileNav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Открыть меню');
      document.body.classList.remove('menu-open');
    }
  };
  const scheduleHeaderUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateHeader);
  };
  window.addEventListener('scroll', scheduleHeaderUpdate, { passive: true });
  window.addEventListener('pageshow', scheduleHeaderUpdate);
  updateHeader();
}

if (menuButton && mobileNav) {
  const closeMenu = () => {
    mobileNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('menu-open');
  };
  menuButton.addEventListener('click', () => {
    const opened = menuButton.getAttribute('aria-expanded') === 'true';
    if (opened) closeMenu();
    else {
      mobileNav.classList.add('is-open');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Закрыть меню');
      document.body.classList.add('menu-open');
    }
  });
  mobileNav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1050) closeMenu();
  });
}

const whyStageButtons = [...document.querySelectorAll('[data-why-stage]')];
if (whyStageButtons.length) {
  const whyMap = document.querySelector('[data-why-map]');
  const setWhyStage = id => {
    whyStageButtons.forEach(button => {
      const active = button.dataset.whyStage === id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-why-panel], [data-why-note]').forEach(item => {
      const active = item.dataset.whyPanel === id || item.dataset.whyNote === id;
      item.classList.toggle('is-active', active);
      item.hidden = !active;
    });
    if (whyMap) whyMap.dataset.whyMap = id;
  };
  whyStageButtons.forEach(button => button.addEventListener('click', () => setWhyStage(button.dataset.whyStage)));
}

const discussionMoreButtons = [...document.querySelectorAll('[data-discussion-more]')];
discussionMoreButtons.forEach(discussionMore => {
  const block = discussionMore.closest('[data-discussion-block]');
  const extraCards = block ? [...block.querySelectorAll('[data-discussion-extra]')] : [];
  discussionMore.addEventListener('click', () => {
    const isExpanded = discussionMore.getAttribute('aria-expanded') === 'true';
    extraCards.forEach(card => { card.hidden = isExpanded; });
    discussionMore.setAttribute('aria-expanded', String(!isExpanded));
    discussionMore.innerHTML = isExpanded ? 'Показать ещё <span aria-hidden="true">↓</span>' : 'Скрыть материалы <span aria-hidden="true">↑</span>';
  });
});

const cityAnimation = document.querySelector('[data-city-animation]');
const cityAnimationToggle = document.querySelector('[data-city-animation-toggle]');
if (cityAnimation && cityAnimationToggle) {
  cityAnimationToggle.addEventListener('click', () => {
    const paused = cityAnimation.classList.toggle('is-paused');
    cityAnimationToggle.setAttribute('aria-pressed', String(paused));
    cityAnimationToggle.querySelector('span').textContent = paused ? 'Продолжить' : 'Пауза';
    cityAnimationToggle.querySelector('i').textContent = paused ? '▶' : 'Ⅱ';
  });
}

const cityHotspots = [...document.querySelectorAll('.city-card')];
cityHotspots.forEach(hotspot => {
  hotspot.tabIndex = 0;
  hotspot.setAttribute('role', 'button');
  hotspot.setAttribute('aria-pressed', 'false');
  const activate = () => {
    const willActivate = !hotspot.classList.contains('is-active');
    cityHotspots.forEach(item => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });
    if (willActivate) {
      hotspot.classList.add('is-active');
      hotspot.setAttribute('aria-pressed', 'true');
    }
  };
  hotspot.addEventListener('click', activate);
  hotspot.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
});

const sectionNavLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]')];
if (sectionNavLinks.length) {
  const header = document.querySelector('.site-header');
  const sections = [...new Set(sectionNavLinks.map(link => link.getAttribute('href')))]
    .map(href => ({ href, element: document.getElementById(href.slice(1)) }))
    .filter(item => item.element);
  let scheduled = false;

  const setActiveSection = href => {
    sectionNavLinks.forEach(link => {
      const active = link.getAttribute('href') === href;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const updateActiveSection = () => {
    const marker = (header?.getBoundingClientRect().bottom || 0) + Math.min(window.innerHeight * .22, 170);
    const current = sections.find(({ element }) => {
      const rect = element.getBoundingClientRect();
      return rect.top <= marker && rect.bottom > marker;
    });
    setActiveSection(current?.href || '');
    scheduled = false;
  };

  const scheduleActiveSectionUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateActiveSection);
  };

  sectionNavLinks.forEach(link => link.addEventListener('click', () => {
    setActiveSection(link.getAttribute('href'));
    window.setTimeout(scheduleActiveSectionUpdate, 80);
  }));
  window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true });
  window.addEventListener('resize', scheduleActiveSectionUpdate);
  window.addEventListener('hashchange', scheduleActiveSectionUpdate);
  updateActiveSection();
}

// Fixed illustration coordinates scale together; text layout remains responsive.
const illustrationObserver = new ResizeObserver(entries => {
  entries.forEach(({ target, contentRect }) => {
    const scene = target.querySelector('[data-scale-width]');
    if (scene && contentRect.width) scene.style.transform = `scale(${contentRect.width / Number(scene.dataset.scaleWidth)})`;
  });
});
document.querySelectorAll('[data-scale-width]').forEach(scene => illustrationObserver.observe(scene.parentElement));
const documentToc = document.querySelector('.document-toc');
const backToTop = document.querySelector('.back-to-top');
if (documentToc && backToTop) {
  const links = [...documentToc.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => ({ link, heading: document.getElementById(link.hash.slice(1)) })).filter(item => item.heading);
  const header = document.querySelector('.site-header');
  let activeLink = null;
  let scheduled = false;

  const updateDocumentNavigation = () => {
    scheduled = false;
    backToTop.hidden = window.scrollY < window.innerHeight;
    const marker = (header?.getBoundingClientRect().bottom || 0) + 48;
    let current = null;
    for (const section of sections) {
      if (section.heading.getBoundingClientRect().top <= marker) current = section.link;
      else break;
    }
    if (current === activeLink) return;
    activeLink = current;
    links.forEach(link => {
      const active = link === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    // Keep the current item visible within the independently scrolling sidebar.
    if (current && getComputedStyle(documentToc).position === 'sticky') {
      const item = current.getBoundingClientRect();
      const toc = documentToc.getBoundingClientRect();
      if (item.top < toc.top) documentToc.scrollTop -= toc.top - item.top + 12;
      else if (item.bottom > toc.bottom) documentToc.scrollTop += item.bottom - toc.bottom + 12;
    }
  };
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateDocumentNavigation);
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  document.fonts.ready.then(scheduleUpdate);
  backToTop.addEventListener('click', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
    document.querySelector('.document-hero h1')?.focus({ preventScroll: true });
  });
  updateDocumentNavigation();
}
