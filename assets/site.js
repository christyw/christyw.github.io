if (location.pathname === '/') {
  const previousSections = new Map([
    ['#writing', '/writing/'], ['#sunrise-card', '/writing/a-sunrise-hike/'],
    ['#reading', '/bookshelf/'], ['#playground', '/playground/'],
    ['#now', '/now/'], ['#about', '/about/'], ['#interests', '/about/#interests']
  ]);
  function openPreviousSection() {
    const destination = previousSections.get(location.hash);
    if (destination) location.replace(destination);
  }
  openPreviousSection();
  window.addEventListener('hashchange', openPreviousSection);
}

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
