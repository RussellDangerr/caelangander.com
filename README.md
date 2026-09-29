# caelangander.com

Forward-deployed product management in healthcare SaaS. Plus a few games, sites, and experiments on the side.

Live at [caelangander.com](https://caelangander.com).

## What's here

A single-page kiosk with three entry tiles, each deep-linkable via path-routed URLs:

- **Talk** ([caelangander.com/talk](https://caelangander.com/talk)) — scheduling and contact.
- **Learn** ([caelangander.com/learn](https://caelangander.com/learn)) — background, experience, and current focus, with selected work that includes [Raven](https://raven.caelangander.com).
- **Explore** ([caelangander.com/explore](https://caelangander.com/explore)) — games, sites, and experiments. Links out to [Raven](https://raven.caelangander.com), a technology atlas, and to side projects like [Violencetown](https://violencetown.russelldangerr.com/game/) and [Clown City](https://clowncity.russelldangerr.com).

Routing uses the History API; Cloudflare Pages serves `index.html` for any unmatched path, so refreshes and direct links resolve to the right view without a 404 round-trip.

## Tech

- Vanilla HTML / CSS / JavaScript — no build step, no framework.
- Hand-written CSS design system (`style.css`) on a bold-editorial palette: roughly 70% warm-neutral, 20% green, 10% purple, with a per-verb accent (Talk and Learn green, Explore purple). Colour values reference [Tailwind](https://tailwindcss.com/)'s green-700 / purple-700 as citable tokens — there is no Tailwind CDN or utility classes.
- Typography: [Fraunces](https://fonts.google.com/specimen/Fraunces) (display serif) paired with IBM Plex Sans / Mono, self-hosted from `assets/fonts/` under the SIL Open Font License.
- Light and dark themes follow the visitor's device automatically (`prefers-color-scheme`); there is no manual theme toggle.
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

## Image credits

Third-party images keep their own terms and are not covered by the license below.

- `assets/mizzou-quad.webp`: cropped from ["Jesse Hall Aerial"](https://commons.wikimedia.org/wiki/File:Jesse_Hall_Aerial.jpg) by [Lectrician2](https://commons.wikimedia.org/wiki/User:Lectrician2), licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The cropped version is shared under the same license.
- `assets/oracle-health-campus.webp`: ["Innovations first floor"](https://commons.wikimedia.org/wiki/File:Innovations_first_floor.jpg) by Hookmeupbarb, licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), shown in full and resized.
- `assets/aurora-install.webp`: © EnergyLink, from its [City of Aurora case study](https://goenergylink.com/case-studies/city-of-aurora/).
- `assets/logos/`: trademarks of WellSky, Aptive Resources, Oracle and EnergyLink, used only to identify former and current employers. The Oracle mark is from [Simple Icons](https://simpleicons.org/) (CC0).

## License

All rights reserved, except the third-party images above.
