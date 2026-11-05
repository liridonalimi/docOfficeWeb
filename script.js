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
