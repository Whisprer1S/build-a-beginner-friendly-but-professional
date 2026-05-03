# Sufra AR Project Documentation

## 1. Project Overview

Sufra AR is a premium WebAR restaurant menu product for restaurants, cafes, hotels, lounges, and hospitality venues. The current codebase is a static React + Vite frontend that can be deployed on Vercel and configured with local JavaScript data files.

Core value:

- Guests scan a QR code for a restaurant.
- The website opens a mobile-first menu experience.
- Guests browse categories, search dishes, filter by veg/meat, inspect ingredients, and switch language/currency.
- Guests open a dish detail modal and launch a 3D/AR viewer.
- The AR viewer uses `<model-viewer>` so guests can preview dishes in 3D and view them on their table before ordering.

Sufra AR is also positioning toward a future Virtual Restaurant Experience: a coming-soon concept where guests can explore a restaurant before visiting, move from entrance to table, preview seating, switch day/night atmosphere, open the AR menu inside the virtual space, and view dishes on the selected table.

This is a frontend-only MVP/product shell. There is no backend, no database, no login system, no dashboard, and no payments.

## 2. Tech Stack

- React 19, rendered from `src/main.jsx`
- Vite 7, configured by `vite.config.js`
- Vercel, configured by `vercel.json`
- Google `<model-viewer>`, loaded from CDN in `index.html`
- `lucide-react` for UI icons
- Static JavaScript config files under `src/data`
- Static images under `public/images/dishes`
- Static 3D models under `public/models/dishes`
- No backend
- No database
- No payment integration

Important entry files:

- `index.html` loads Google Fonts, favicon, and the model-viewer CDN script.
- `src/main.jsx` mounts `<App />`.
- `src/App.jsx` currently contains routing, layout components, menu UI, dish modal, pricing, pages, footer, and model-viewer page.
- `src/styles.css` contains all current styling.

## 3. Core Rules / Non-Negotiables

- Do not add a backend.
- Do not add a database.
- Do not add login, dashboard, admin, or payment flows unless explicitly requested later.
- Do not hardcode restaurant/menu/pricing data inside UI components if it can live in config.
- Do not break AR/model-viewer.
- Do not duplicate image or model assets.
- Do not move assets unless a task explicitly asks for asset cleanup.
- Do not remove working routes.
- Keep the menu mobile-first.
- Keep desktop layouts clean and centered around the mobile app-style experience.
- Keep code beginner-friendly and scalable.
- Keep config files easy to edit.
- Run `npm.cmd run build` before finishing code changes.
- If editing visible copy, update the translation system, not scattered JSX strings.

## 4. Current Routes

Routing is implemented manually in `src/App.jsx` using `window.location.pathname` and query parameters.

Important functions:

- `getRouteFromPath()` parses the current path.
- `findRestaurantBySlug()` from `src/data/restaurants/index.js` finds matching restaurant config.
- `navigateToMenu(slug, query)` updates history state and route state.
- `openViewer(dish)` navigates to viewer query params.
- `backToMenu()` returns to the menu and clears modal state.

Routes:

| Route | Displays | Handler/component | Notes |
| --- | --- | --- | --- |
| `/` | Product landing page with hero, value section, embedded mobile AR menu, virtual experience teaser, pricing preview, footer | `LandingPage` inside `Shell` | Uses default restaurant config for the embedded menu. Default slug is `sufra-old-town`. |
| `/pricing` | Full pricing page | `PricingPage` -> `PricingSection` | Pricing data comes from `src/data/plans.js`; visible translated text/features come from `src/data/translations.js`. |
| `/experience` | Virtual Restaurant Experience coming-soon page | `ExperiencePage` | Uses translated content and real email/Instagram contact links. |
| `/about` | About page | `AboutPage` -> `InfoPage` | Uses translated text from `src/data/translations.js`. |
| `/contact` | Contact page | `ContactPage` -> `InfoPage` | Uses real email and Instagram links from `src/data/brand.js`. |
| `/sufra-old-town` | Restaurant menu page | `MenuExperience` inside `Shell` | Loads `src/data/restaurants/sufra-old-town.js`. |
| `/demo-cafe` | Second sample restaurant menu page | `MenuExperience` inside `Shell` | Loads `src/data/restaurants/demo-cafe.js`, which currently reuses most of Sufra Old Town config with a different slug/name/subtitle. |
| `/<invalid-slug>` | Not found page | `NotFoundPage` | Any non-static path is treated as a restaurant slug. If not found, a clean not-found page appears. |

Viewer query route:

```text
/sufra-old-town?dish=steak&view=viewer&lang=en
```

When `view=viewer` and `dish=<dish id>` matches a dish in the active restaurant config, `App` renders `ModelViewerPage`.

## 5. Folder Structure

Current project structure:

```text
.
├── AGENTS.md                         # created by this documentation pass
├── PROJECT_DOCUMENTATION.md           # created by this documentation pass
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
├── vite.config.js
├── public
│   ├── favicon.svg
│   ├── images
│   │   └── dishes
│   │       ├── adjaruli khachapuri.jfif
│   │       ├── Bruschetta.jpg
│   │       ├── Chicken Alfredo.jpg
│   │       ├── Chicken Salad.jpg
│   │       ├── fine dining table phone.jpg
│   │       ├── mtis khinkali.webp
│   │       ├── mtsvadi.jfif
│   │       ├── orange juice.jpg
│   │       ├── steak.jpg
│   │       └── Tiramisu.jpg
│   └── models
│       └── dishes
│           ├── adjaruli-khachapuri.glb
│           ├── Bruschetta.glb
│           ├── Chicken Alfredo.glb
│           ├── Chicken Salad.glb
│           ├── khinkali.glb
│           ├── khinkali.glb.glb
│           ├── orange juice.glb
│           ├── placeholder-dish.glb
│           ├── steak.glb
│           └── tiramisu.glb
└── src
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    └── data
        ├── brand.js
        ├── currencies.js
        ├── plans.js
        ├── siteContent.js
        ├── translations.js
        └── restaurants
            ├── demo-cafe.js
            ├── index.js
            └── sufra-old-town.js
```

There is currently no `src/components` folder. Component functions are currently defined in `src/App.jsx`.

## 6. Data Architecture

Main data files:

- `src/data/restaurants/index.js`
  - Exports `languages`, `restaurants`, `defaultRestaurantSlug`, `defaultRestaurant`, and `findRestaurantBySlug`.
  - Current language selector labels are `ENG`, `GEO`, `RUS`.
  - Current registered restaurants are `sufraOldTown` and `demoCafe`.
- `src/data/restaurants/sufra-old-town.js`
  - Main default menu config.
  - Contains category definitions, dish data, image/model paths, ingredient tags, ingredient hotspots, AR scale/camera settings, and theme values.
- `src/data/restaurants/demo-cafe.js`
  - Second sample restaurant config.
  - Imports and spreads `sufraOldTown`, then changes `slug`, `restaurantName`, and `subtitle`.
- `src/data/plans.js`
  - Base pricing plan ids, English titles, prices, CTA names, and feature lists.
  - `App.jsx` uses plan ids and pulls translated display text from `src/data/translations.js`.
- `src/data/currencies.js`
  - Static GEL/USD/EUR rates and `formatPrice(priceGEL, currencyCode)`.
- `src/data/translations.js`
  - Main visible UI translation dictionary for `en`, `ka`, `ru`.
  - Exports `translations` and `getTranslation(language, key)`.
- `src/data/brand.js`
  - Brand-level contact and identity data: name, slogan, email, Instagram handle/URL.
- `src/data/siteContent.js`
  - Currently still contains older content objects.
  - Current `App.jsx` only uses `siteContent.hero.image` for the landing hero image. Most visible copy now comes from `translations.js`.

Important helper functions in `src/App.jsx`:

- `t(language, key)` reads translations through `getTranslation`.
- `tArray(language, key)` reads translated arrays such as feature lists.
- `text(value, language)` reads translated config objects with English fallback.
- `getPlanTitle(plan, language)`, `getPlanFeatures(plan, language)`, and `getPlanPrice(plan, language)` adapt pricing plan data to the active language.
- `translateIngredientName(name, language)` and `translateIngredientBenefit(benefit, language)` translate ingredient callout text.

## 7. Restaurant/Menu Config Rules

Category ids must stay consistent:

```text
starters
salads
main-course
grill
desserts
drinks
```

Every dish should reference one of those ids with `categoryId`.

Each dish should include:

```js
{
  id: 'steak',
  categoryId: 'grill',
  type: 'meat',
  name: { en: 'Steak', ka: 'Steak', ru: 'Steak' },
  description: {
    en: 'Grilled steak served with herbs and sauce.',
    ka: '...',
    ru: '...',
  },
  priceGEL: 42,
  image: '/images/dishes/steak.jpg',
  model: '/models/dishes/steak.glb',
  hasModel: true,
  ingredients: [
    { name: 'Beef', benefits: ['Protein', 'Iron'] },
  ],
  ingredientHotspots: [
    {
      id: 'beef',
      name: 'Beef',
      position: '0m 0.08m 0m',
      normal: '0m 1m 0m',
      benefits: ['Protein', 'Iron'],
    },
  ],
  arScale: '0.22 0.22 0.22',
  arPlacement: 'floor',
  cameraOrbit: '35deg 72deg 2.8m',
  fieldOfView: '28deg',
}
```

Base price is always `priceGEL`. Other currencies are converted from GEL by `formatPrice` in `src/data/currencies.js`.

Current category mapping in `sufra-old-town.js`:

- `starters`: Adjaruli Khachapuri, Bruschetta
- `salads`: Chicken Salad
- `main-course`: Mountain Khinkali, Chicken Alfredo
- `grill`: Steak, Mtsvadi
- `desserts`: Tiramisu
- `drinks`: Orange Juice

If a dish does not have a real model yet:

```js
model: '/models/dishes/placeholder-dish.glb',
hasModel: false,
```

Current example: Mtsvadi uses the placeholder model.

## 8. Asset Rules

Images should live in:

```text
public/images/dishes
```

Models should live in:

```text
public/models/dishes
```

Assets are referenced from React/config using public URL paths:

```js
image: '/images/dishes/steak.jpg'
model: '/models/dishes/steak.glb'
```

Rules:

- Do not duplicate assets.
- Do not move or rename existing assets unless an asset-cleanup task explicitly asks for it.
- Be careful with current filenames containing spaces and uppercase letters.
- Use the exact path currently in config.
- For future assets, prefer lowercase kebab-case filenames, for example `chicken-alfredo.jpg` and `chicken-alfredo.glb`.
- If an asset is missing, use `placeholder-dish.glb` for models and add a clear config comment rather than inventing duplicate files.

Hero image currently used by the landing page:

```text
/images/dishes/fine dining table phone.jpg
```

## 9. AR / model-viewer Rules

`<model-viewer>` is loaded from CDN in `index.html`:

```html
<script
  type="module"
  src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
></script>
```

The AR viewer is implemented in `ModelViewerPage` in `src/App.jsx`.

Flow:

1. User opens a dish card or Details button.
2. `DishModal` displays dish details.
3. `View on your table` calls `openViewer(dish)`.
4. `openViewer(dish)` clears modal state and navigates to:

```text
/sufra-old-town?dish=<dish-id>&view=viewer&lang=<language>
```

5. `App` detects `view=viewer` and renders `ModelViewerPage`.
6. `ModelViewerPage` passes `dish.model`, `dish.image`, `dish.arScale`, `dish.arPlacement`, `dish.cameraOrbit`, and `dish.fieldOfView` into `<model-viewer>`.

Current model-viewer realism settings:

- `ar`
- `ar-modes="webxr scene-viewer quick-look"`
- `ar-scale="fixed"`
- `disable-zoom`
- `camera-controls`
- `auto-rotate`
- `scale={modelScale}`
- `data-ar-scale={modelScale}`
- `touch-action="pan-y"`

`modelScale` is derived from:

```js
const modelScale = dish.arScale || '0.25 0.25 0.25';
```

There is a code comment in `ModelViewerPage` noting that scale controls the model-viewer preview plus WebXR/Scene Viewer AR, but iOS Quick Look may ignore this and use dimensions baked into the USDZ/GLB conversion.

Rules:

- Keep `ar-scale="fixed"` where possible.
- Keep default real-world table scale controlled per dish with `arScale`.
- Do not re-enable unrealistic free zoom/scale unless explicitly requested.
- User should be able to rotate/orbit in 3D preview.
- AR must keep launching normally on mobile.
- Do not remove `<model-viewer>` or the AR slot button.
- Test viewer routes after AR changes.

## 10. Ingredient Callouts / Hotspots

Ingredient callouts are implemented as model-viewer hotspots in `ModelViewerPage`.

Data lives in each dish config under `ingredientHotspots`:

```js
ingredientHotspots: [
  {
    id: 'pepper',
    name: 'Pepper',
    position: '0.12m 0.12m 0.02m',
    normal: '0m 1m 0m',
    benefits: ['Spice', 'Antioxidants'],
  },
]
```

Rendering behavior:

- `ModelViewerPage` starts with `showHotspots` false.
- A timer enables hotspots after about 2400ms.
- Each hotspot renders a `<button>` with `slot={`hotspot-${hotspot.id}`}`.
- `data-position` and `data-normal` are approximate positions.
- Visible name/benefits are translated through `translateIngredientName` and `translateIngredientBenefit`.

Important limitation:

This is not real 3D ingredient detection. Hotspots are manually estimated per model. They may need tuning for each GLB file.

Future improvements:

- Tune hotspot positions per actual model geometry.
- Add richer ingredient/nutrition metadata.
- Improve hotspot layout for small screens.
- Consider per-dish hotspot visibility controls if some models do not align well.

## 11. Currency System

Base currency is GEL.

Currency data and conversion logic live in:

```text
src/data/currencies.js
```

Current currencies:

```js
{ code: 'GEL', symbol: '₾', rateFromGel: 1, decimals: 0 }
{ code: 'USD', symbol: '$', rateFromGel: 0.37, decimals: 2 }
{ code: 'EUR', symbol: '€', rateFromGel: 0.315, decimals: 2 }
```

Current static rates:

- 1 GEL = 0.37 USD
- 1 GEL = 0.315 EUR

There is no exchange-rate API.

The currency selector is rendered by `HeaderControls` in `src/App.jsx`. It is used in both the site header and the mobile menu top area. The selected currency is stored in `localStorage` under `sufra-currency`.

Dish prices are rendered with:

```js
formatPrice(dish.priceGEL, currency)
```

Pricing plan prices are currently displayed in GEL only.

## 12. Language / Translation System

Supported languages:

- `en` -> selector label `ENG`
- `ka` -> selector label `GEO`
- `ru` -> selector label `RUS`

Language registration lives in:

```text
src/data/restaurants/index.js
```

Visible UI translations live in:

```text
src/data/translations.js
```

Fallback behavior:

```js
translations[language]?.[key] ?? translations.en[key] ?? key
```

Config text objects use `text(value, language)` in `src/App.jsx`, with English fallback:

```js
return value?.[language] || value?.en || '';
```

What should translate:

- Hero text and buttons
- Product/value section
- Menu section titles/subtitles
- Category names
- Search placeholder
- Filters
- Dish descriptions when translations exist
- Detail modal labels
- Back/viewer buttons
- AR helper text
- Ingredient labels/benefits
- Virtual Restaurant Experience section/page
- Pricing section/page
- Pricing features and buttons
- About page
- Contact page
- Footer nav/contact labels
- Empty states

Must stay English:

- `Sufra AR`
- `Dining, Before It Arrives.`
- `Powered by Sufra AR`
- Email address
- Instagram handle
- Currency codes/symbols

Current language state is stored in `localStorage` under `sufra-language`. Viewer URLs can also include `lang=<code>`.

## 13. Theme System

There are two theme concepts:

1. Global site theme:
   - State: `themeMode`
   - Stored in `localStorage` as `sufra-theme`
   - Controls the landing/pages/footer wrapper through CSS variables from `getThemeStyle(restaurant, themeMode)`.

2. Menu app theme:
   - State: `menuTheme`
   - Stored in `localStorage` as `sufra-menu-theme`
   - Passed through `menuControls` so the toggle inside the menu affects the menu experience, not the whole website.
   - Used by classes `menu-theme-dark` and `menu-theme-light` in `src/styles.css`.

Theme CSS variables are set in `getThemeStyle`:

- `--bg`
- `--text`
- `--secondary-text`
- `--accent`
- `--card`
- `--border`
- dropdown contrast variables
- badge/CTA contrast variables
- `--heading-font`
- `--body-font`

Design contrast rules:

- The global site can be light or dark.
- The menu defaults to dark and should remain visually separated from dark pages.
- Dropdowns must stay readable in both light and dark themes.
- Buttons must keep black/white contrast.

## 14. Pricing System

Base plan data lives in:

```text
src/data/plans.js
```

The current plan ids and prices:

- Basic - 99 GEL / month
- Pro - 199 GEL / month
- VIP - 299 GEL / month
- Custom - Contact Sales

Pricing display is rendered by `PricingSection` in `src/App.jsx`.

Plan feature text is translated through `src/data/translations.js` with keys:

- `pricingBasicFeatures`
- `pricingProFeatures`
- `pricingVipFeatures`
- `pricingCustomFeatures`

Current English feature bullets:

Basic:

- WebAR menu
- QR code access
- Mobile-first digital menu
- 3D dish preview
- View dishes on table
- EN / GEO / RUS language support
- Basic restaurant branding

Pro:

- Everything in Basic
- Currency switcher: GEL / USD / EUR
- Search and category filters
- Veg / meat indicators
- List and grid menu views
- Ingredient tags
- Enhanced dish detail pages
- Priority design polish

VIP:

- Everything in Pro
- AR ingredient callouts
- Ingredient nutrition highlights
- Premium interactive AR dish experience
- Advanced menu presentation
- Early access to virtual restaurant experience

Custom:

- Custom restaurant experience
- Multiple branches or locations
- Custom 3D/AR model package
- Virtual restaurant walkthrough planning
- Brand-specific UI direction
- Custom feature requests
- Meeting required

There is no payment integration. CTAs are mailto links.

## 15. Contact Links

Brand contact data lives in:

```text
src/data/brand.js
```

Current contact info:

- Email: `sufraar@gmail.com`
- Instagram: `https://www.instagram.com/sufraar/`
- Instagram handle: `@sufraar`

Current mailto links in `src/App.jsx`:

```js
const demoRequestHref = `mailto:${brand.email}?subject=Sufra%20AR%20Demo%20Request`;
const customPlanHref = `mailto:${brand.email}?subject=Sufra%20AR%20Custom%20Plan%20Inquiry`;
const inquiryHref = `mailto:${brand.email}?subject=Sufra%20AR%20Inquiry`;
```

Usage:

- Pricing Basic/Pro/VIP CTAs use demo request mailto.
- Pricing Custom CTA uses custom plan inquiry mailto.
- Experience page Email us uses inquiry mailto.
- Contact page email uses `mailto:sufraar@gmail.com`.
- Footer email uses `mailto:sufraar@gmail.com`.
- Instagram links use `target="_blank"` and `rel="noreferrer"`.

Desktop note:

Mailto behavior depends on the user's operating system/browser default mail app. The links should still be real anchors, not onClick-only buttons.

## 16. Footer Rules

Footer is implemented by `Footer` in `src/App.jsx`.

Footer must include:

- Logo + slogan
- Short Sufra AR description
- Nav links: Home, About, Contact
- Email link
- Instagram link
- `Powered by Sufra AR`

Rules:

- Instagram should appear only once in the footer contact area.
- Logo text stays `Sufra AR`.
- Slogan stays `Dining, Before It Arrives.`
- Powered text stays `Powered by Sufra AR`.
- Footer nav labels should translate.
- Email address and Instagram handle should not translate.

## 17. Design Direction

Current visual direction:

- Premium
- Minimal
- Apple-like
- Black/white refined
- No gold/yellow brand accents
- Subtle shadows
- Rounded corners
- Quiet luxury hospitality feel

Hybrid design:

- Landing/product/static pages are light premium by default.
- The actual menu experience is a dark mobile-first app-style UI by default.
- The footer remains black.

Important CSS areas:

- Header/logo/control styling: `.site-header`, `.logo`, `.header-controls`, `.control-pill`
- Hero: `.product-hero`
- Pricing: `.pricing-section`, `.pricing-carousel-shell`, `.pricing-grid`, `.pricing-card`
- Menu app: `.menu-app`, `.menu-theme-dark`, `.menu-theme-light`
- Dish UI: `.dish-card`, `.dish-modal`, `.viewer-info-card`
- AR viewer: `model-viewer`, `.ingredient-hotspot`, `.ar-button`
- Footer: `.site-footer`

## 18. Mobile-First Rules

Phone experience is the priority.

Rules:

- Menu UI must be thumb-friendly.
- Category slider must be horizontally swipeable.
- Category changes reset veg/meat filter to All.
- Search must remain usable on mobile.
- Details modal must fit mobile screens.
- AR button must be obvious and reachable.
- Pricing cards should swipe horizontally on mobile using CSS scroll-snap.
- Desktop can show the mobile app-style menu centered inside the page.
- Text must not overflow, especially Georgian and Russian.

Current mobile behaviors are mostly CSS-driven in `src/styles.css`.

## 19. Development Workflow

Install dependencies:

```powershell
npm.cmd install
```

Run local dev server:

```powershell
npm.cmd run dev
```

Expose to a phone on the same network:

```powershell
npm.cmd run dev -- --host 0.0.0.0
```

Build for production:

```powershell
npm.cmd run build
```

Preview production build:

```powershell
npm.cmd run preview
```

Recommended change workflow:

1. Check `git status`.
2. Inspect relevant files before editing.
3. Make small scoped edits.
4. Run `npm.cmd run build`.
5. Test affected routes locally.
6. Commit changes with a clear message.
7. Push to GitHub.
8. Vercel deploys from GitHub.

## 20. Deployment

The app is deployed on Vercel.

Production/custom domain:

```text
https://sufraar.com
```

Vercel behavior:

- GitHub push triggers deployment.
- Build command should be `npm.cmd run build` locally; Vercel normally runs `npm run build`.
- Output directory is `dist`.
- SSL is handled by Vercel.
- `vercel.json` rewrites all routes to `/index.html`, so direct visits like `/pricing`, `/demo-cafe`, and `/sufra-old-town?dish=steak&view=viewer` work with client-side routing.

Current `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 21. Current Known Assets

Images in `public/images/dishes`:

- `adjaruli khachapuri.jfif`
- `Bruschetta.jpg`
- `Chicken Alfredo.jpg`
- `Chicken Salad.jpg`
- `fine dining table phone.jpg`
- `mtis khinkali.webp`
- `mtsvadi.jfif`
- `orange juice.jpg`
- `steak.jpg`
- `Tiramisu.jpg`

Models in `public/models/dishes`:

- `adjaruli-khachapuri.glb`
- `Bruschetta.glb`
- `Chicken Alfredo.glb`
- `Chicken Salad.glb`
- `khinkali.glb`
- `khinkali.glb.glb`
- `orange juice.glb`
- `placeholder-dish.glb`
- `steak.glb`
- `tiramisu.glb`

Current dish-to-asset mapping in `sufra-old-town.js`:

| Dish id | Image | Model | Notes |
| --- | --- | --- | --- |
| `adjaruli-khachapuri` | `/images/dishes/adjaruli khachapuri.jfif` | `/models/dishes/adjaruli-khachapuri.glb` | Real model |
| `mountain-khinkali` | `/images/dishes/mtis khinkali.webp` | `/models/dishes/khinkali.glb` | Prefer `khinkali.glb`; duplicate `khinkali.glb.glb` exists but is not used |
| `steak` | `/images/dishes/steak.jpg` | `/models/dishes/steak.glb` | Real model |
| `bruschetta` | `/images/dishes/Bruschetta.jpg` | `/models/dishes/Bruschetta.glb` | Real model |
| `chicken-salad` | `/images/dishes/Chicken Salad.jpg` | `/models/dishes/Chicken Salad.glb` | Real model |
| `chicken-alfredo` | `/images/dishes/Chicken Alfredo.jpg` | `/models/dishes/Chicken Alfredo.glb` | Real model |
| `tiramisu` | `/images/dishes/Tiramisu.jpg` | `/models/dishes/tiramisu.glb` | Real model |
| `orange-juice` | `/images/dishes/orange juice.jpg` | `/models/dishes/orange juice.glb` | Real model |
| `mtsvadi` | `/images/dishes/mtsvadi.jfif` | `/models/dishes/placeholder-dish.glb` | `hasModel: false`; no dedicated Mtsvadi model yet |

## 22. Current Known Issues / Future Improvements

Known issues/cleanup notes from inspection:

- `src/App.jsx` currently contains many component functions. This works, but future cleanup could extract reusable components into `src/components`.
- `src/data/siteContent.js` still contains older English content objects. Current visible copy mostly comes from `src/data/translations.js`; `App.jsx` currently uses only `siteContent.hero.image`.
- `src/data/brand.js` contains some translated about/contact/description copy, but current visible page copy comes from `src/data/translations.js`; contact identity still comes from `brand.js`.
- `public/models/dishes/khinkali.glb.glb` appears to duplicate `khinkali.glb`. The app currently uses `/models/dishes/khinkali.glb`. Do not delete or move it unless doing an explicit asset cleanup.
- Several asset filenames include spaces and uppercase letters. This is supported if paths are exact, but future assets should prefer lowercase kebab-case.
- Mtsvadi uses `placeholder-dish.glb` and `hasModel: false`.
- Hotspot positions are approximate and may need per-model tuning.
- iOS Quick Look may handle scale differently than WebXR/Scene Viewer.

Planned/future improvements:

- Better 3D capture/model pipeline for real restaurant dishes.
- More real restaurant dish content and client configs.
- 360/virtual restaurant walkthrough experience.
- Better ingredient hotspot calibration and nutrition metadata.
- Asset folder cleanup and naming normalization.
- Component extraction from `App.jsx` once product behavior is stable.
- Optional test coverage for routing/data helpers.

## 23. How a Future Codex Agent Should Start

Checklist:

1. Read `PROJECT_DOCUMENTATION.md`.
2. Read `AGENTS.md`.
3. Run `git status --short` to see existing changes.
4. Inspect `src/App.jsx` for route/component flow.
5. Inspect `src/data/restaurants/index.js` and relevant restaurant config.
6. Inspect `src/data/translations.js` before editing visible copy.
7. Inspect `src/data/currencies.js` before changing prices/currency.
8. Inspect `src/data/plans.js` before changing pricing plan ids/prices.
9. Run `npm.cmd run build` before finishing.
10. Do not edit AR/model-viewer before understanding `ModelViewerPage`, `openViewer`, query routing, and dish `arScale`.
11. Make small changes.
12. Test affected local routes.
13. Avoid duplicate assets.
14. Preserve mobile-first behavior.
15. Preserve `/`, `/pricing`, `/experience`, `/about`, `/contact`, `/sufra-old-town`, and `/demo-cafe`.
