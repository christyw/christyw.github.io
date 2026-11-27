import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { marked } from 'marked';
import { parse } from 'yaml';

const domain = 'https://www.christianawong.com';
const owner = 'Christiana Wong';
const categories = ['Life & Identity', 'Technology & Thinking', 'Art & Culture', 'Places & Travel', 'Field Notes', 'Books'];
const data = name => JSON.parse(readFileSync('_editorial/' + name + '.json', 'utf8'));
const profile = data('profile');
const books = data('books');
const now = data('now');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const arrow = '<svg class="link-icon" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg>';
const nav = [['Home','/'], ['Writing','/writing/'], ['Bookshelf','/bookshelf/'], ['Playground','/playground/'], ['Now','/now/'], ['About','/about/']];
const articles = readdirSync('_editorial/published').filter(file => file.endsWith('.md')).map(file => {
  const input = readFileSync('_editorial/published/' + file, 'utf8');
  const match = input.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Frontmatter missing in ' + file);
  const meta = parse(match[1]);
  const slug = file.slice(0, -3);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use a lowercase, hyphenated filename for ' + file);
  if (!meta.title || !meta.description || !categories.includes(meta.category) || !['Essay', 'Note'].includes(meta.kind)) {
    throw new Error('Check title, description, category and kind in ' + file);
  }
  const body = marked.parse(match[2]);
  const minutes = Math.max(1, Math.ceil(body.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length / 220));
  return {...meta, body, minutes, path: '/writing/' + slug + '/'};
}).sort((a,b) => String(b.date || b.year || '').localeCompare(String(a.date || a.year || '')) || a.title.localeCompare(b.title));

const featured = articles.find(article => article.featured);
const routeFiles = new Set();
function write(file, content) {
  mkdirSync(dirname(file), {recursive: true});
  writeFileSync(file, content.replace(/[ \t]+$/gm, ''));
  routeFiles.add(file);
}

function calendar(value) {
  return new Intl.DateTimeFormat('en', {dateStyle:'long', timeZone:'UTC'}).format(new Date(value + 'T00:00:00Z'));
}

function metadata(article) {
  const date = article.date ? '<time datetime="' + escape(article.date) + '">' + calendar(article.date) + '</time>' :
    article.year ? '<time datetime="' + escape(article.year) + '">' + escape(article.year) + '</time>' : '';
  return [escape(article.kind), escape(article.category), date, article.minutes + ' min read'].filter(Boolean).join(' <span aria-hidden="true">·</span> ');
}

const socialLinks = Object.entries(profile.socials).map(([label, url]) => '<a href="' + escape(url) + '">' + escape(label) + '</a>').join('');

function page({title, path, description, current = path, image, kind = 'website', body, noindex = false, script}) {
  const name = path === '/' ? owner : title + ' · ' + owner;
  const preview = image || '/assets/portrait.webp';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(name)}</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${domain + path}">
<meta property="og:title" content="${escape(name)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${domain + path}">
<meta property="og:image" content="${escape(domain + preview)}">
<meta property="og:type" content="${kind}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="Christiana Wong · Writing" href="/feed.xml">
<link rel="preload" href="/assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/site.css">
<script>
try { const theme = localStorage.getItem('cw-theme'); if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme; } catch {}
</script>
<script src="/assets/site.js" defer></script>${script ? '\n<script src="' + escape(script) + '" defer></script>' : ''}
</head>
<body class="${path === '/' ? 'front-page' : kind === 'article' ? 'article-page' : 'inside-page'}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header shell">
  <a class="masthead" href="/">christiana wong<span>.</span></a>
  <nav aria-label="Main navigation">${nav.map(([label, href]) =>
    `<a href="${href}"${current === href ? ' aria-current="' + (current === path ? 'page' : 'location') + '"' : ''}>${label}</a>`).join('')}</nav>
  <button class="theme" type="button" hidden aria-label="Dark mode" aria-pressed="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.6 15.3A9 9 0 0 1 8.7 3.4 9 9 0 1 0 20.6 15.3Z"/></svg></button>
</header>
<main id="main" class="shell" tabindex="-1">${body}</main>
<footer class="site-footer shell" id="contact">
  <nav aria-label="Contact and feeds">${socialLinks}<a href="/feed.xml">RSS</a></nav>
</footer>
</body>
</html>
`;
}

function headline(title, description, label) {
  return `<header class="page-intro">${label ? '<p class="eyebrow">' + escape(label) + '</p>' : ''}<h1>${escape(title)}</h1><p class="lede">${escape(description)}</p></header>`;
}

function cover(article, extra = '') {
  if (!article.cover) return '';
  const srcset = article.cover === '/assets/sunrise.webp' ?
    ' srcset="/assets/sunrise-small.webp 548w, /assets/sunrise.webp 975w" sizes="(max-width: 700px) 92vw, 72vw"' : '';
  return `<img src="${escape(article.cover)}"${srcset} alt="${escape(article.coverAlt)}" ${extra}>`;
}

function feature(article) {
  return `<article class="feature ${article.cover ? '' : 'without-picture'}">
    ${article.cover ? '<a class="feature-image" href="' + article.path + '" tabindex="-1" aria-hidden="true">' + cover(article) + '</a>' : ''}
    <div class="feature-text"><p class="eyebrow">${escape(article.category)} <span aria-hidden="true">·</span> ${escape(article.kind)}</p>
    <h3><a href="${article.path}">${escape(article.title)}</a></h3>
    <p>${escape(article.description)}</p><a class="text-link" href="${article.path}">Read the ${escape(article.kind.toLowerCase())} ${arrow}</a></div>
  </article>`;
}

function writingRow(article, archive = false) {
  return `<li class="writing-row"${archive ? ' data-entry data-category="' + escape(article.category) + '" data-search="' + escape([article.title,article.description,article.category,article.kind,article.body.replace(/<[^>]*>/g, ' ')].join(' ')) + '"' : ''}>
    <div><p class="eyebrow">${metadata(article)}</p><h3><a href="${article.path}">${escape(article.title)}</a></h3><p>${escape(article.description)}</p></div>
    <span class="row-link" aria-hidden="true">${arrow}</span>
  </li>`;
}

function bookCover(book) {
  const file = '/assets/covers/' + book.id + '.webp';
  return `<span class="book-cover ${escape(book.color)}" aria-hidden="true">
    <span class="book-type"><strong>${escape(book.title)}</strong><small>${escape(book.author)}</small></span>
    ${existsSync('.' + file) ? '<img src="' + file + '" alt="" width="330" height="510" loading="lazy">' : ''}
  </span>`;
}

function bookItem(book) {
  const optional = [
    ['Reading status', book.status], ['Finished', book.finished]
  ].filter(([,value]) => value).map(([label, value]) => '<dt>' + label + '</dt><dd>' + escape(value) + '</dd>').join('');
  const related = (book.related || []).map(slug => articles.find(article => article.path === '/writing/' + slug + '/')).filter(Boolean);
  return `<li><details class="book" id="${escape(book.id)}">
    <summary>${bookCover(book)}<span class="book-title">${escape(book.title)}</span><span class="book-author">${escape(book.author)}</span><span class="book-action">Book details</span></summary>
    <div class="book-details">
      ${book.description ? '<p>' + escape(book.description) + '</p>' : ''}
      ${book.reflection ? '<p>' + escape(book.reflection) + '</p>' : ''}
      ${optional ? '<dl>' + optional + '</dl>' : ''}
      ${book.passage ? '<blockquote>' + escape(book.passage) + '</blockquote>' : ''}
      ${related.length ? '<p>Related writing</p><ul>' + related.map(article => '<li><a href="' + article.path + '">' + escape(article.title) + '</a></li>').join('') + '</ul>' : ''}
    </div></details></li>`;
}

const home = `<div class="front-spread">
  <header class="home-hero"><h1><span>We’ll get to</span> <span>the point</span> <span class="headline-ending">eventually<span class="headline-period">.</span></span></h1></header>
  <aside class="hero-context" aria-label="About Christy">
    <p class="lede">Hi, I’m Christy. I’m a perfectionist about a surprisingly narrow range of things.</p>
  </aside>
</div>`;
write('index.html', page({title:owner, path:'/', description:'The personal site of Christiana Wong, with writing, a bookshelf, and creative experiments.', body:home}));

const archive = headline('Occasional writing', 'Essays and notes by Christiana Wong.') +
  (featured ? `<section><header class="section-head"><h2>Featured</h2></header>${feature(featured)}</section>` : '') +
  `<section class="archive" aria-labelledby="archive-heading"><header class="section-head"><h2 id="archive-heading">Archive</h2></header>
  <div class="archive-index"><div class="filters" hidden><label>Search writing<input type="search" id="writing-query" placeholder="Search by title or text"></label>
  <label>Category<select id="writing-category"><option value="">All categories</option>${categories.map(category => '<option>' + escape(category) + '</option>').join('')}</select></label></div>
  <div class="archive-results"><p class="archive-count" aria-live="polite"></p><p class="archive-empty" hidden>No pieces match your search.</p>
  <ul class="writing-list">${articles.map(article => writingRow(article, true)).join('')}</ul></div></div></section>`;
write('writing/index.html', page({title:'Writing', path:'/writing/', description:'Browse the essays and notes of Christiana Wong.', body:archive}));

for (const [i, article] of articles.entries()) {
  const adjacent = [['Previous',articles[i+1]], ['Next',articles[i-1]]].filter(([,value]) => value);
  const related = articles.filter(other => other !== article && other.category === article.category).slice(0,3);
  const body = `<div class="reading-progress" aria-hidden="true"><span></span></div>
  <article class="essay">
    <header class="essay-title"><a class="text-link" href="/writing/">Writing archive</a><p class="eyebrow">${metadata(article)}</p><h1>${escape(article.title)}</h1></header>
    ${article.cover ? '<figure class="essay-photo">' + cover(article) + (article.caption ? '<figcaption>' + escape(article.caption) + '</figcaption>' : '') + '</figure>' : ''}
    <div class="essay-reading"><p class="essay-byline">Christiana Wong</p><div class="prose" data-essay-body>${article.body}</div></div>
  </article>
  ${adjacent.length ? '<nav class="article-nav" aria-label="Adjacent articles">' + adjacent.map(([label,item]) => '<a href="' + item.path + '"><span class="eyebrow">' + label + '</span><strong>' + escape(item.title) + '</strong></a>').join('') + '</nav>' : ''}
  ${related.length ? '<section class="archive"><header class="section-head"><h2>Related writing</h2></header><ul class="writing-list">' + related.map(item => writingRow(item)).join('') + '</ul></section>' : ''}`;
  write(article.path.slice(1) + 'index.html', page({...article, current:'/writing/', image:article.cover, kind:'article', body}));
}

write('bookshelf/index.html', page({title:'Bookshelf', path:'/bookshelf/', description:'A few favorite books from Christiana Wong’s bookshelf.',
  body:headline('Books I’ve kept', profile.booksIntroduction, 'Bookshelf') + `<ul class="books-grid">${books.map(book => bookItem(book)).join('')}</ul>`}));

function lookingArtwork(reveal) {
  const credit = '<a href="https://www.artic.edu/artworks/8991/improvisation-no-30-cannons">Vasily Kandinsky, <cite>Improvisation No. 30 (Cannons)</cite>, 1913</a> · Art Institute of Chicago, public domain';
  return `<figure class="play-artwork">
    <img src="/assets/kandinsky-improvisation-30.webp" width="1060" height="1059" ${reveal ? '' : 'loading="lazy"'} alt="An abstract painting with bright washes of color, sweeping black lines, and small angular shapes.">
    <figcaption${reveal ? ' data-art-credit hidden' : ''}>${credit}</figcaption>
  </figure>`;
}

const playground = headline('Playground', 'A few things to try when you have a minute.') + `
<nav class="play-index" aria-label="Playground experiments">
  <a href="#look">Look Before the Label</a>
  <a href="#minute">One Minute With a Painting</a>
  <a href="#smaller">Make It Smaller</a>
  <a href="#asterisk">Advice With an Asterisk</a>
</nav>
<section class="play-station" id="look" aria-labelledby="look-title">
  <header class="section-head"><h2 id="look-title">Look Before the Label</h2></header>
  <div class="play-gallery">
    ${lookingArtwork(true)}
    <div class="play-panel">
      <p class="play-question">Where did your eye go first?</p>
      <p>Pick a detail in your head. Then try looking at the painting through two different labels.</p>
      <div data-looking-controls hidden>
        <button type="button" data-reveal aria-controls="art-labels" aria-expanded="false">Reveal the labels</button>
        <div id="art-labels" hidden>
          <details><summary>Read it like music</summary><p>Follow a black line as if it were a phrase in a piece of music. Notice where it speeds up, where another line interrupts, and where the color gives it room.</p></details>
          <details><summary>Read it as a scene</summary><p>Look for what might be a building, a crowd, or a cannon. Once you think you’ve found one, does the rest of the painting start to look different?</p></details>
          <p class="play-aside">Look again. Does your eye still land in the same place?</p>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="play-station" id="minute" aria-labelledby="minute-title">
  <header class="section-head"><h2 id="minute-title">One Minute With a Painting</h2></header>
  <div class="play-gallery play-gallery--smaller">
    ${lookingArtwork(false)}
    <div class="play-panel">
      <p>Stay with the painting for one minute. Start wherever your attention lands.</p>
      <div data-minute-controls hidden>
        <div class="play-clock" data-timer role="timer" aria-label="Time remaining">1:00</div>
        <p class="play-question" data-prompt aria-live="polite"></p>
        <div class="play-actions"><button type="button" data-timer-toggle>Start</button><button type="button" data-timer-reset disabled>Reset</button></div>
      </div>
      <noscript><p>Find a color, follow an edge, then look at a part you’ve passed over.</p></noscript>
    </div>
  </div>
</section>
<section class="play-station" id="smaller" aria-labelledby="smaller-title">
  <header class="section-head"><h2 id="smaller-title">Make It Smaller</h2></header>
  <p class="play-intro">Take something you’re putting off and turn it into a step you could do right now.</p>
  <form class="play-task" data-small-task hidden>
    <div><label for="big-task">What are you putting off?</label><input id="big-task" name="task" placeholder="Work on my taxes" maxlength="160" required></div>
    <div><label for="small-step">What’s the first thing you could physically do?</label><input id="small-step" name="step" placeholder="Find one W-2" maxlength="160" required></div>
    <div class="play-actions"><button type="submit">Keep this step</button><button type="button" data-task-clear>Clear</button></div>
    <p class="play-aside">Saved in this browser when you choose to keep a step.</p>
    <p class="play-result" data-task-result role="status" hidden></p>
  </form>
</section>
<section class="play-station" id="asterisk" aria-labelledby="asterisk-title">
  <header class="section-head"><h2 id="asterisk-title">Advice With an Asterisk</h2></header>
  <div class="play-advice" data-advice>
    <div data-advice-card><p class="play-quote">Trust the process.</p><details><summary>Read the asterisk</summary><p>Check occasionally that there is a process.</p></details></div>
    <div data-advice-card hidden><p class="play-quote">Stay the course.</p><details><summary>Read the asterisk</summary><p>Check that you still want to go where it leads.</p></details></div>
    <div data-advice-card hidden><p class="play-quote">Sleep on it.</p><details><summary>Read the asterisk</summary><p>Set an alarm if the decision is due at nine.</p></details></div>
    <button type="button" data-next-advice hidden>Another one</button>
    <p class="play-aside" data-advice-status role="status" hidden></p>
  </div>
</section>
<noscript><p>Enable JavaScript for the interactive controls.</p></noscript>`;
write('playground/index.html', page({title:'Playground', path:'/playground/', description:'Four small experiments in art, attention, and getting started.', body:playground, script:'/assets/playground.js'}));

const nowBody = headline('Now', 'What I’m up to these days.') +
  `<p class="eyebrow now-date">Last updated <time datetime="${escape(now.updated)}">${calendar(now.updated)}</time></p>
  <dl class="now-list">${Object.entries(now.sections).map(([key,value]) =>
    '<div><dt>' + escape(key) + '</dt><dd>' + (value ? escape(value) : 'To be updated.') + '</dd></div>').join('')}</dl>`;
write('now/index.html', page({title:'Now', path:'/now/', description:'A short update from Christiana Wong.', body:nowBody}));

const biography = headline('A bit about me', 'Christiana Wong, also known as Christy.', 'About') +
  `<div class="bio-grid"><div class="prose">${profile.biography.map(p=>'<p>' + p + '</p>').join('')}
    <p>I worked as a data engineer at Airbnb.org, supporting disaster response and emergency housing. These days I’m a data engineer at OpenAI. I’ve lived in New York and San Francisco.</p>
  </div><figure><img src="/assets/portrait.webp" alt="Christiana Wong" width="800" height="800"></figure></div>
  <section class="about-note" id="interests"><h2>What lights me up</h2><p>Museums, modern art, reading, running, tennis, soccer, snowboarding, dance, guitar, baking, and travel.</p></section>
  <section class="about-note" id="contact-note"><h2>Links</h2><p class="inline-links">${socialLinks}</p></section>`;
write('about/index.html', page({title:'About', path:'/about/', description:'Christiana Wong on Detroit, art, mathematics, and engineering.', body:biography}));

write('404.html', page({title:'Page not found', path:'/404.html', description:'This page has wandered off.', noindex:true,
  body:headline('This page wandered off.', 'You can head home or find something to read.', '404') + '<p class="inline-links"><a href="/">Home</a><a href="/writing/">Writing archive</a></p>'}));

const urls = ['/', '/writing/', '/bookshelf/', '/playground/', '/now/', '/about/', ...articles.map(article => article.path)];
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(url => '<url><loc>' + domain + url + '</loc></url>').join('\n') + '\n</urlset>\n');
write('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + domain + '/sitemap.xml\n');
write('feed.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
  '<title>Christiana Wong · Writing</title><link>' + domain + '/writing/</link><description>Essays and notes by Christiana Wong.</description><language>en</language>' +
  '<atom:link href="' + domain + '/feed.xml" rel="self" type="application/rss+xml"/>' + articles.map(article =>
    '<item><title>' + escape(article.title) + '</title><link>' + domain + article.path + '</link><guid>' + domain + article.path + '</guid>' +
    '<description>' + escape(article.description) + '</description><category>' + escape(article.category) + '</category>' +
    (article.date ? '<pubDate>' + new Date(article.date + 'T00:00:00Z').toUTCString() + '</pubDate>' : '') + '</item>').join('') + '</channel></rss>\n');

for (const directory of readdirSync('writing', {withFileTypes:true}).filter(entry => entry.isDirectory())) {
  const file = 'writing/' + directory.name + '/index.html';
  if (existsSync(file) && readFileSync(file, 'utf8').includes('data-essay-body') && !routeFiles.has(file)) rmSync(file);
}
console.log('Generated ' + routeFiles.size + ' files from ' + articles.length + ' published pieces.');
