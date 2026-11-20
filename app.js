'use strict';

const contactChoices = document.getElementById('contactes-whatsapp');
document.querySelectorAll('a[href="#contactes-whatsapp"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    contactChoices.focus({preventScroll: true});
    contactChoices.scrollIntoView({block: 'start', behavior: 'instant'});
  });
});

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Obre el menú');
  mobileNav.hidden = true;
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Obre el menú' : 'Tanca el menú');
  mobileNav.hidden = isOpen;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!document.querySelector('.site-header').contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const navLinks = [...document.querySelectorAll('.desktop-nav .nav-link')];
const sections = ['inici', 'serveis', 'nosaltres', 'contacte'].map(id => document.getElementById(id));
let ticking = false;
function updateNavigation() {
  const marker = window.scrollY + 190;
  let activeSection = sections[0];
  for (const section of sections) if (section.offsetTop <= marker) activeSection = section;
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20) activeSection = sections[3];
  navLinks.forEach(link => {
    const active = link.hash === '#' + activeSection.id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  document.querySelector('.mobile-contact-bar')?.classList.toggle('is-at-contact', activeSection.id === 'contacte');
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateNavigation);
    ticking = true;
  }
}, {passive: true});
updateNavigation();

const form = document.getElementById('contact-form');
const result = document.getElementById('form-result');
const summary = document.getElementById('request-summary');
const status = document.getElementById('copy-status');
const cleaningType = document.getElementById('cleaning-type');
const cleaningTypeField = document.querySelector('.cleaning-type-field');
function updateCleaningType() {
  const isGardenOnly = form.elements.service.value === 'Jardineria';
  cleaningTypeField.hidden = isGardenOnly;
  cleaningType.disabled = isGardenOnly;
}
form.querySelectorAll('input[name="service"]').forEach(input => input.addEventListener('change', updateCleaningType));
updateCleaningType();
let requestText = '';
document.querySelectorAll('.service-request').forEach(button => {
  button.addEventListener('click', () => {
    form.hidden = false;
    result.hidden = true;
    const radio = [...form.elements.service].find(input => input.value === button.dataset.service);
    if (radio) radio.checked = true;
    if (button.dataset.cleaningType) cleaningType.value = button.dataset.cleaningType;
    updateCleaningType();
    document.getElementById('contacte').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  requestText = [
    'Hola, Serveis A&V. Voldria consultar un servei.',
    '',
    'Nom: ' + data.get('name').trim(),
    'Municipi: ' + data.get('town').trim(),
    'Servei: ' + data.get('service'),
    ...(data.get('cleaningType') && data.get('cleaningType') !== 'Encara no ho sé' ? ['Modalitat: ' + data.get('cleaningType')] : []),
    'Freqüència: ' + data.get('frequency'),
    '',
    'Què necessito:',
    data.get('message').trim()
  ].join('\n');
  summary.textContent = requestText;
  document.querySelectorAll('.request-whatsapp').forEach(link => {
    link.href = 'https://wa.me/' + link.dataset.phone + '?text=' + encodeURIComponent(requestText);
  });
  status.textContent = '';
  form.hidden = true;
  result.hidden = false;
  result.focus({preventScroll: true});
  const top = result.getBoundingClientRect().top;
  if (top < 100 || top > window.innerHeight - 180) result.scrollIntoView({block: 'center', behavior: 'smooth'});
});
document.getElementById('edit-request').addEventListener('click', () => {
  result.hidden = true;
  form.hidden = false;
  document.getElementById('name').focus({preventScroll: true});
});
document.getElementById('download-request').addEventListener('click', () => {
  const blob = new Blob(['\ufeff' + requestText + '\n'], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'consulta-serveis-av.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'S’ha preparat la descàrrega de la consulta.';
});
document.getElementById('copy-request').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(requestText);
    status.textContent = 'Text copiat. Ja el pots enganxar on vulguis.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(summary);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Text seleccionat. Fes servir l’opció Copia del dispositiu.';
  }
});

const privacyDialog = document.getElementById('privacy-dialog');
document.getElementById('privacy-button').addEventListener('click', () => privacyDialog.showModal());
privacyDialog.querySelectorAll('.dialog-close, .close-privacy').forEach(button => button.addEventListener('click', () => privacyDialog.close()));
privacyDialog.addEventListener('click', event => {
  if (event.target === privacyDialog) {
    const bounds = privacyDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) privacyDialog.close();
  }
});
document.getElementById('year').textContent = new Date().getFullYear();
