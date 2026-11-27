# Christiana Wong’s website

An editorial personal site with a writing archive, bookshelf, and interactive playground. GitHub Pages serves the committed HTML, CSS, and JavaScript directly from the repository root. Node runs only when editing or previewing the site.

## Preview locally

With Node.js 20 or newer, run:

```sh
npm ci
npm run build
npm run dev
```

Open <http://localhost:3000>. Run `npm run build` again after editing an article, template, or data file, then refresh the browser. Use `PORT=3001 npm run dev` if port 3000 is occupied.

## Add an article

1. Copy `_editorial/templates/article.md` into `_editorial/published/`. Its lowercase, hyphenated filename supplies the article URL. For example, `on-reading.md` becomes `/writing/on-reading/`.
2. Fill in the title, description, category, and kind. Use `Essay` or `Note` for kind. The available categories are Life & Identity, Technology & Thinking, Art & Culture, Places & Travel, Field Notes, and Books.
3. Supply a known publication date as a quoted `YYYY-MM-DD` value, or use `year` for a year-only entry. For a cover, add an optimized image to `assets/` and supply `cover`, `coverAlt`, and optionally `caption`. Set `featured: true` to select the piece for the optional archive feature. If multiple pieces are marked featured, the newest one is shown.
4. Run `npm run build` and commit the Markdown and generated files. The archive, sitemap, RSS feed, and article navigation update automatically.

Keep unfinished work outside the published directory. `_editorial/editorial-backlog.md` and `_editorial/content-review.md` are excluded from the Pages website and visible in the public GitHub repository.

## Add a book or update Now

- Add a record to `_editorial/books.json` with a unique lowercase `id`, `title`, and `author`. Optional fields include `color` (olive, rust, blue, plum, ochre), `isbn`, `amazonAsin` (the ten-character product ID on Amazon.com), `status`, `finished`, `description` (what the book is about), `reflection` (why you like it), `passage`, and `related` (article slugs). An image at `assets/covers/<id>.webp` takes precedence over the typographic cover.
- Update `_editorial/now.json` and its `updated` date.
- Regenerate and commit the output after either edit.

### Amazon Associates links

Set `trackingId` in `_editorial/amazon.json` to the Amazon.com Associates tracking ID for this site, then rebuild. A configured ID adds the `tag` parameter, per-link disclosure, and Amazon Associates statement to the bookshelf. An empty value produces regular Amazon links.

## Deployment

Review the draft PR and preview before merging. GitHub Pages currently publishes the root of `main`. After an approved merge, check the Pages build, then open <https://www.christianawong.com> and spot-check the home page, essay, and feed. The existing custom domain and CNAME require no changes. If a published revision needs to be rolled back, revert it through the usual PR process.

The original photo files stay at their original URLs. The site uses smaller WebP derivatives in its layouts. Book artwork is sourced from the previous site’s Amazon and Open Library image URLs. Inter and Source Serif 4 are served locally under their bundled Open Font Licenses.
