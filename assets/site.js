const theme = document.querySelector('.theme');
const root = document.documentElement;
theme.hidden = false;
theme.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
theme.addEventListener('click', () => {
  const mode = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = mode;
  theme.setAttribute('aria-pressed', String(mode === 'dark'));
  try { localStorage.setItem('cw-theme', mode); } catch {}
});

const filters = document.querySelector('.filters');
if (filters) {
  const search = document.querySelector('#writing-query');
  const category = document.querySelector('#writing-category');
  const entries = [...document.querySelectorAll('[data-entry]')];
  const count = document.querySelector('.archive-count');
  const empty = document.querySelector('.archive-empty');
  function filterWriting() {
    const words = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const entry of entries) {
      entry.hidden = Boolean(category.value && entry.dataset.category !== category.value) ||
        !words.every(word => entry.dataset.search.toLocaleLowerCase().includes(word));
      if (!entry.hidden) visible++;
    }
    count.textContent = visible === 1 ? '1 piece' : visible + ' pieces';
    empty.hidden = visible > 0;
  }
  filters.hidden = false;
  filters.addEventListener('input', filterWriting);
  filterWriting();
}

const progress = document.querySelector('.reading-progress span');
if (progress) {
  const essay = document.querySelector('.essay');
  function updateProgress() {
    const distance = essay.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
    const ratio = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 1;
    progress.style.transform = 'scaleX(' + ratio + ')';
  }
  window.addEventListener('scroll', updateProgress, {passive:true});
  window.addEventListener('resize', updateProgress);
  window.addEventListener('load', updateProgress, {once:true});
  updateProgress();
}

function openLinkedBook() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.matches('details.book')) target.open = true;
}
openLinkedBook();
window.addEventListener('hashchange', openLinkedBook);

for (const image of document.querySelectorAll('.book-cover img')) {
  const showFallback = () => { image.hidden = true; };
  if (image.complete && !image.naturalWidth) showFallback();
  image.addEventListener('error', showFallback, {once:true});
}

for (const garden of document.querySelectorAll('[data-garden]')) {
  const frame = garden.parentElement;
  const angle = frame.querySelector('[data-angle]');
  const seeds = frame.querySelector('[data-seeds]');
  const spread = frame.querySelector('[data-spread]');
  function renderGarden() {
    const count = Number(seeds?.value || 170);
    const turn = Number(angle.value);
    const size = Number(spread?.value || 5);
    for (const [control, suffix] of [[angle,'°'], [seeds,''], [spread,'']]) {
      if (control) frame.querySelector('output[for="' + control.id + '"]').value = control.value + suffix;
    }
    const plants = Array.from({length:count}, (_, i) => {
      const radius = 140 * Math.sqrt(i / count);
      const leaf = size * (.36 + .64 * i / count);
      const color = i % 7 === 0 ? 'var(--accent)' : 'currentColor';
      return `<ellipse cx="${radius.toFixed(1)}" cy="0" rx="${leaf.toFixed(1)}" ry="${(leaf * .46).toFixed(1)}" transform="rotate(${(i * turn % 360).toFixed(1)})" fill="${color}"/>`;
    }).join('');
    garden.innerHTML = '<circle cx="180" cy="160" r="150" fill="none" stroke="currentColor" stroke-width=".55" stroke-dasharray="1 4"/><g transform="translate(180 160)">' + plants + '</g>';
  }
  frame.addEventListener('input', renderGarden);
  frame.querySelector('[data-reset]')?.addEventListener('click', () => {
    for (const control of [angle, seeds, spread]) control.value = control.defaultValue;
    renderGarden();
  });
  renderGarden();
}

function swatchAt(hue, saturation, lightness) {
  const amplitude = saturation * Math.min(lightness, 1 - lightness);
  const channels = [0, 8, 4].map(offset => {
    const phase = (offset + hue / 30) % 12;
    const channel = lightness - amplitude * Math.max(-1, Math.min(phase - 3, 9 - phase, 1));
    return Math.round(255 * channel);
  });
  const hex = '#' + channels.map(channel => channel.toString(16).padStart(2, '0')).join('').toUpperCase();
  const luminance = channels.map(channel => {
    const value = channel / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  }).reduce((sum, channel, i) => sum + channel * [.2126, .7152, .0722][i], 0);
  return {hex, text: luminance > .179 ? '#000' : '#fff'};
}

const swatches = document.querySelector('.swatches');
if (swatches) {
  const hue = document.querySelector('#hue');
  const harmony = document.querySelector('#harmony');
  const status = document.querySelector('.copy-status');
  const offsets = {analogous:[-28,-14,0,14,28], complementary:[0,14,0,180,194], triadic:[0,120,0,240,120]};
  const saturation = [.22,.33,.44,.39,.31];
  const lightness = [.91,.72,.5,.35,.21];
  function renderPalette() {
    const base = Number(hue.value);
    document.querySelector('output[for="hue"]').value = base + '°';
    swatches.innerHTML = offsets[harmony.value].map((offset, i) => {
      const {hex,text} = swatchAt((base + offset + 360) % 360, saturation[i], lightness[i]);
      return `<button type="button" class="swatch" style="--swatch:${hex};--swatch-text:${text}" data-hex="${hex}" aria-label="Copy ${hex}">${hex}</button>`;
    }).join('');
    status.textContent = '';
  }
  hue.addEventListener('input', renderPalette);
  harmony.addEventListener('change', renderPalette);
  document.querySelector('[data-palette-shuffle]').addEventListener('click', () => {
    hue.value = (Number(hue.value) + 1 + Math.floor(Math.random() * 359)) % 360;
    renderPalette();
  });
  swatches.addEventListener('click', async event => {
    const hex = event.target.closest('[data-hex]')?.dataset.hex;
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
      status.textContent = 'Copied ' + hex;
    } catch {
      status.textContent = hex + ' · Clipboard unavailable.';
    }
  });
  renderPalette();
}
