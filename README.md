# caelangander.com

Forward-deployed product management in healthcare SaaS. Plus a few games, sites, and experiments on the side.

Live at [caelangander.com](https://caelangander.com).

## What's here

A single-page kiosk with three entry tiles, each deep-linkable via path-routed URLs:

- **Talk** ([caelangander.com/talk](https://caelangander.com/talk)) — scheduling and contact.
- **Learn** ([caelangander.com/learn](https://caelangander.com/learn)) — background, experience, and current focus.
- **Explore** ([caelangander.com/explore](https://caelangander.com/explore)) — games, sites, and experiments. Links out to side projects like [Violencetown](https://violencetown.russelldangerr.com/game/) and [Clown City](https://clowncity.russelldangerr.com).

Routing uses the History API plus Cloudflare Pages `_redirects` so refreshes and direct links resolve to the right view without a 404 round-trip.

## Tech

- Vanilla HTML / CSS / JavaScript — no build step.
- [Tailwind](https://tailwindcss.com/) utility classes (via CDN), palette built around Tailwind's Moss-green plus a purple accent.
- Cloudflare Pages for hosting and path routing.
- Custom C-over-g monogram (Calibri, vectorized to SVG paths so it renders identically across browsers).

## Running locally

No build step. Open `index.html` directly in a browser, or serve the folder with any static server:

```
python -m http.server 8000
# or
npx http-server
```

Then visit `http://localhost:8000`.

## Branch workflow

GitFlow-lite:

- `main` — what's live on caelangander.com.
- `dev` — integration branch; day-to-day work lives here.
- `feature/*` — short-lived branches off `dev` for discrete additions.

Feature branches are cut from the tip of `dev`, never from `main` or a stale ancestor.

## License

All rights reserved.
