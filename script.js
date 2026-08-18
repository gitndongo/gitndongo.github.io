document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- SCROLL PROGRESS BAR ---------- */
  const scrollBar = document.getElementById('scrollBar');
  function updateScrollBar(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (scrollBar) scrollBar.style.width = scrolled + '%';
  }

  /* ---------- ROUTE LINE FILL ---------- */
  const routeWrap = document.querySelector('.route-wrap');
  const routeFill = document.getElementById('routeFill');
  function updateRouteFill(){
    if (!routeWrap || !routeFill) return;
    const rect = routeWrap.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height;
    const seen = Math.min(Math.max(viewportH * 0.5 - rect.top, 0), total);
    routeFill.style.height = (total ? (seen / total) * 100 : 0) + '%';
  }

  function onScroll(){
    updateScrollBar();
    updateRouteFill();
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- ACTIVE NAV (scroll spy) ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const sections = navLinks
    .map(a => document.getElementById(a.dataset.section))
    .filter(Boolean);

  function updateActiveNav(){
    let current = null;
    sections.forEach(sec => {
      const r = sec.getBoundingClientRect();
      if (r.top <= 140) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.dataset.section === current);
    });
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealTargets = document.querySelectorAll(
    '.project-card, .skill-row, .tl-item, .section-label, .section-hint, .contact-form, .hero-stats .stat'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 30);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => revealObserver.observe(el));
  }

  /* ---------- HERO STAT COUNTERS ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  function animateCount(el){
    const target = parseInt(el.dataset.count, 10);
    if (prefersReduced) { el.textContent = target; return; }
    const duration = 900;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => statObserver.observe(el));
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------- SKILL ↔ PROJECT FILTER ---------- */
  const skillRows = document.querySelectorAll('.skill-row');
  const projectCards = document.querySelectorAll('.project-card');
  let activeFilter = null;

  function applyFilter(filterWords){
    projectCards.forEach(card => {
      const tags = (card.dataset.tags || '').split(' ');
      const match = filterWords.some(w => tags.includes(w));
      card.classList.toggle('dimmed', !match);
      card.classList.toggle('highlighted', match);
    });
  }
  function clearFilter(){
    projectCards.forEach(card => {
      card.classList.remove('dimmed', 'highlighted');
    });
  }

  skillRows.forEach(row => {
    row.addEventListener('click', () => {
      const filterWords = (row.dataset.filter || '').split(' ');
      if (activeFilter === row) {
        activeFilter = null;
        row.classList.remove('active');
        clearFilter();
        document.getElementById('projets').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'nearest' });
        return;
      }
      skillRows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      activeFilter = row;
      applyFilter(filterWords);
      document.getElementById('projets').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------- PROJECT CARD TILT ---------- */
  if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- COPY EMAIL ---------- */
  const copyBtn = document.getElementById('copyEmailBtn');
  const emailText = document.getElementById('emailText');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        const original = emailText.textContent;
        emailText.textContent = 'copié ✓';
        setTimeout(() => { emailText.textContent = original; }, 1500);
      } catch (err) {
        window.location.href = `mailto:${email}`;
      }
    });
  }
});
