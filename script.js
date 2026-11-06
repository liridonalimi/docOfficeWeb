const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  const toggleLabel = navToggle.querySelector('.sr-only');
  const closeNavigation = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    if (toggleLabel) toggleLabel.textContent = 'Navigation öffnen';
  };

  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    mainNav.classList.toggle('is-open', !open);
    document.body.classList.toggle('nav-open', !open);
    if (toggleLabel) toggleLabel.textContent = open ? 'Navigation öffnen' : 'Navigation schließen';
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNavigation);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNavigation();
      navToggle.focus();
    }
  });
}

const schedule = {
  1: [{ start: 480, end: 720, label: '08:00–12:00' }, { start: 840, end: 1020, label: '14:00–17:00' }],
  2: [{ start: 480, end: 720, label: '08:00–12:00' }, { start: 840, end: 1020, label: '14:00–17:00' }],
  3: [{ start: 480, end: 720, label: '08:00–12:00' }],
  4: [{ start: 420, end: 480, label: '07:00–08:00*' }, { start: 480, end: 720, label: '08:00–12:00' }, { start: 840, end: 1020, label: '14:00–17:00' }],
  5: [{ start: 480, end: 720, label: '08:00–12:00' }]
};

function updatePracticeStatus() {
  const status = document.querySelector('.hours-status');
  const statusText = document.querySelector('#practice-status');
  const hoursText = document.querySelector('#today-hours');
  if (!status || !statusText || !hoursText) return;

  const formatter = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  const dayMap = { So: 0, Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6 };
  const day = dayMap[parts.weekday.replace('.', '')];
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const periods = schedule[day] || [];
  const activePeriod = periods.find((period) => minutes >= period.start && minutes < period.end);

  hoursText.textContent = periods.length ? `${periods.map((period) => period.label).join(' · ')} Uhr` : 'Heute geschlossen';
  status.dataset.state = activePeriod ? 'open' : 'closed';
  statusText.textContent = activePeriod ? 'Die Praxis ist derzeit geöffnet' : 'Die Praxis ist derzeit geschlossen';
}

updatePracticeStatus();

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());


function animateControl(control) {
  control.classList.remove('is-activating');
  void control.offsetWidth;
  control.classList.add('is-activating');
  window.setTimeout(() => control.classList.remove('is-activating'), 300);
}

function announcePhoneAction() {
  window.clearTimeout(toastTimer);
  actionToast.textContent = 'Telefon-App wird geöffnet …';
  actionToast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => actionToast.classList.remove('is-visible'), 1800);
}

function showDestination(target) {
  const arrivalElement = target.querySelector('h1, h2') || target;
  arrivalElement.classList.remove('destination-arrival');
  void arrivalElement.offsetWidth;
  arrivalElement.classList.add('destination-arrival');
  window.setTimeout(() => arrivalElement.classList.remove('destination-arrival'), 950);

  const hadTabindex = target.hasAttribute('tabindex');
  if (!hadTabindex) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  if (!hadTabindex) {
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
}

function navigateToTarget(target, hash) {
  const run = ++navigationRun;
  const header = document.querySelector('.site-header');
  const headerOffset = (header?.offsetHeight || 0) + 18;
  const start = window.scrollY;
  const targetY = Math.max(0, target.getBoundingClientRect().top + start - headerOffset);
  const distance = targetY - start;

  if (reducedMotion.matches || Math.abs(distance) < 2) {
    window.scrollTo({ top: targetY, behavior: 'auto' });
    history.pushState(null, '', hash);
    showDestination(target);
    return;
  }

  const duration = Math.min(1050, Math.max(520, 420 + Math.abs(distance) * .16));
  const startedAt = performance.now();
  document.documentElement.classList.add('is-scripted-scrolling');
  travelProgress.classList.add('is-active');

  const easeInOutCubic = (progress) => progress < .5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  const step = (now) => {
    if (run !== navigationRun) return;
    const progress = Math.min(1, (now - startedAt) / duration);
    const easedProgress = easeInOutCubic(progress);
    window.scrollTo({ top: start + distance * easedProgress, behavior: 'instant' });
    travelProgress.style.transform = `scaleX(${progress})`;

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    document.documentElement.classList.remove('is-scripted-scrolling');
    history.pushState(null, '', hash);
    showDestination(target);
    window.setTimeout(() => {
      travelProgress.classList.remove('is-active');
      travelProgress.style.transform = 'scaleX(0)';
    }, 180);
  };

  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    animateControl(link);
    navigateToTarget(target, hash);
  });
});

document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener('click', () => {
    animateControl(link);
    announcePhoneAction();
  });
});