# Francesco Luigi Scotti

Portfolio site for photographer Francesco Luigi Scotti. Next.js 16 (App Router), statically exported.

## Routes

| Route | Contents |
|---|---|
| `/` | Full-bleed scrolling cover image |
| `/universe` | Moodboard of all 35 projects, oxblood ground |
| `/creative-direction` | Same moodboard, black ground |
| `/projects/[slug]` | One project's full image set (35 pages, prerendered) |
| `/story` | Biography and contact |

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

`output: "export"` in `next.config.ts` writes a fully static site to `out/`. There is no server
runtime: every route is prerendered at build time.

## Deploying to Cloudflare Pages

Because the site is a pure static export, it needs no Cloudflare adapter — not
`@cloudflare/next-on-pages`, not `@opennextjs/cloudflare`. Point Pages at `out/`.

**Git integration (recommended).** Connect the repository in the Cloudflare dashboard and set:

| Setting | Value |
|---|---|
| Framework preset | None (or "Next.js (Static HTML Export)") |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | `20` or later (set `NODE_VERSION` if the default is older) |

**Direct upload.**

```bash
npm run build
npx wrangler pages deploy out
```

### Notes

- `public/_headers` ships in the export and sets immutable caching for `/_next/static/*` and
  `/cover/*`, plus baseline security headers.
- Clean URLs (`/universe` → `universe.html`) and `404.html` are handled by Pages automatically.
  Serving `out/` with a plain static file server that lacks HTML fallback will 404 on subroutes;
  that is a limitation of the test server, not the build.

## Media

Project imagery is hotlinked from `static.wixstatic.com` (the Wix CDN backing
francescoluigiscotti.com), sized per breakpoint via Wix transform URLs. The site therefore depends
on that CDN staying available. Moving the images into this repo or onto R2 would remove that
dependency.

The cover image is local, in `public/cover/`, pre-generated at four widths and selected with
`srcset`. Regenerate with:

```bash
for w in 640 960 1400; do
  sips --resampleWidth $w --setProperty format jpeg --setProperty formatOptions 50 \
    public/cover/cover-1959.jpg --out public/cover/cover-$w.jpg
done
```
