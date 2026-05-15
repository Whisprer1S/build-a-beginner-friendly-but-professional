# Sufra AR Project Documentation

## 1. Project Overview

Sufra AR is a premium WebAR restaurant menu product for restaurants, cafes, hotels, lounges, and hospitality venues. The current codebase is a static React + Vite frontend that can be deployed on Vercel and configured with local JavaScript data files.

Technical package/repository name: `sufra-ar`.
Public product/brand name: `Sufra AR`.

Core value:

- Guests scan a QR code for a restaurant.
- The website opens a mobile-first menu experience.
- Guests browse categories, search dishes, filter by food or drink type, inspect ingredients, and switch language.
- Guests open dish Details directly into the full viewer page.
- Dishes with models can switch between Photo and 3D; photo-only dishes such as drinks do not show AR.
- The AR viewer uses `<model-viewer>` for model-backed dishes so guests can preview dishes in 3D and view them on their table before ordering.

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
| `/` | Product landing page with hero, value section, embedded mobile AR menu, pricing preview, footer | `LandingPage` inside `Shell` | Uses default restaurant config for the embedded menu. Default slug is `demo`. |
| `/pricing` | Full pricing page | `PricingPage` -> `PricingSection` | Pricing data comes from `src/data/plans.js`; visible translated text/features come from `src/data/translations.js`. |
| `/about` | About page | `AboutPage` -> `InfoPage` | Uses translated text from `src/data/translations.js`. |
| `/menu/demo` | Primary public demo menu page | `MenuExperience` inside `Shell` | Loads `src/data/restaurants/sufra-old-town.js`; the file name is legacy, but the public slug is `demo`. |
| `/menu/demo-cafe` | Second sample restaurant menu page | `MenuExperience` inside `Shell` | Loads `src/data/restaurants/demo-cafe.js`, which currently reuses most of the demo config with a different slug/name/subtitle. |
| `/sufra-old-town` | Legacy redirect | `getRouteFromPath` | Old public route. Do not use for new links; it is immediately normalized to `/menu/demo`. |
| `/demo-cafe` | Legacy direct sample route | `MenuExperience` inside `Shell` | Kept for compatibility with the older top-level slug system. Prefer `/menu/demo-cafe` for new links. |
| `/<invalid-slug>` | Not found page | `NotFoundPage` | Any non-static path is treated as a restaurant slug. If not found, a clean not-found page appears. |

Viewer query route:

```text
/menu/demo?dish=steak&view=viewer&lang=en
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
  - Main default demo menu config.
  - This file keeps its legacy filename for safety, but its public slug is `demo` and its public route is `/menu/demo`.
  - Contains category definitions, dish data, image/model paths, ingredient tags, ingredient hotspots, AR scale/camera settings, and theme values.
- `src/data/restaurants/demo-cafe.js`
  - Second sample restaurant config.
  - Imports and spreads `sufraOldTown`, then changes `slug`, `restaurantName`, and `subtitle`.
- `src/data/plans.js`
  - Base pricing plan ids, English titles, prices, CTA names, and feature lists.
  - `App.jsx` uses plan ids and pulls translated display text from `src/data/translations.js`.
- `src/data/currencies.js`
  - GEL-only `formatPrice(priceGEL)` helper.
- `src/data/translations.js`
  - Main visible UI translation dictionary for `en`, `ka`, `ru`.
  - Exports `translations` and `getTranslation(language, key)`.
- `src/data/brand.js`
  - Brand-level contact and identity data: name, translated slogan, email, phone/WhatsApp, and social links.
- `src/data/siteContent.js`
  - Contains supporting landing/about copy objects.
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

Every dish should reference one of those ids with `categoryId`. Dessert categories intentionally hide Veg/Meat filters and badges. Drink categories use `drinkType` values such as `alcoholic` and `non-alcoholic` instead of Veg/Meat labels.

Drinks are photo-only. They should use existing dish photos, set `hasModel: false`, and should not render `model-viewer`, the Photo / 3D selector, or `View on your table`.

Each dish should include:

```js
{
  id: 'steak',
  categoryId: 'grill',
  type: 'meat', // food items use 'veg' or 'meat'; drinks use type: 'drink' plus drinkType
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
  arScale: '1 1 1',
  arPlacement: 'floor',
  cameraOrbit: '35deg 72deg 2.8m',
  fieldOfView: '28deg',
}
```

Base price is always `priceGEL`. Dish prices always display in GEL through `formatPrice` in `src/data/currencies.js`; there is no USD/EUR conversion or currency selector.

Current category mapping in `sufra-old-town.js`:

- `starters`: Adjaruli Khachapuri, Bruschetta
- `salads`: Chicken Salad
- `main-course`: Mountain Khinkali, Chicken Alfredo
- `grill`: Steak, Mtsvadi
- `desserts`: Tiramisu
- `drinks`: Orange Juice (`drinkType: non-alcoholic`, photo-only)

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
2. `openViewer(dish)` navigates directly to:

```text
/menu/demo?dish=<dish-id>&view=viewer&lang=<language>
```

3. `App` detects `view=viewer` and renders `ModelViewerPage`.
4. `ModelViewerPage` shows dish info, clickable ingredient chips/info, a small `Add to selection` or quantity control, and the media area.
5. Model-backed dishes show a Photo / 3D selector. Photo uses `dish.image`; 3D passes `dish.model`, `dish.arScale`, `dish.arPlacement`, `dish.cameraOrbit`, and `dish.fieldOfView` into `<model-viewer>`.
6. Dishes without models, including drinks, stay photo-only and do not render `<model-viewer>` or the AR launch button.

Current model-viewer realism settings:

- `ar`
- Platform-specific `ar-modes`
  - iOS/iPadOS: `quick-look`
  - Android: `scene-viewer webxr`
  - Default/desktop fallback: `scene-viewer webxr quick-look`
  - Android prioritizes native Scene Viewer before WebXR because testing showed better placement behavior.
- `ar-scale="fixed"`
- `disable-zoom`
- `camera-controls`
- `auto-rotate`
- `scale={modelScale}`
- `data-ar-platform={arPlatform}`
- `data-platform-scale={platformScaleMultiplier}`
- `data-ar-scale={modelScale}`
- `touch-action="pan-y"`

These settings apply only when the dish has a real model and is not in the `drinks` category.

`modelScale` is derived from the dish `arScale` multiplied by optional platform scale values:

```js
const modelScale = getModelScaleForPlatform(dish, arPlatform);
```

Platform scale override support is optional:

```js
platformScale: {
  default: 1,
  ios: 1,
  android: 1,
}
```

If `platformScale` is omitted, all multipliers default to `1`. Android values should stay `1` unless real Android testing proves a specific model needs calibration. This keeps one shared GLB per dish and avoids duplicate iOS/Android model files. The temporary `test` dish using `/models/dishes/tst.glb` has Android calibration reset for clean testing of the corrected GLB: `default: 1`, `ios: 1`, `android: 1`, targeting an approximately 32-33 cm pizza diameter. Android-specific calibration may be reintroduced later only if clean physical testing proves it is still needed. There is a code comment in `ModelViewerPage` noting that iOS Quick Look may still use dimensions baked into the USDZ/GLB conversion.

Rules:

- Keep `ar-scale="fixed"` where possible.
- Use `arScale: '1 1 1'` by default so real-world size comes from the correctly exported GLB.
- Keep platform scale multipliers at `1` by default.
- Do not re-enable unrealistic free zoom/scale unless explicitly requested.
- User should be able to rotate/orbit in 3D preview.
- AR must keep launching normally on mobile for model-backed food dishes.
- Do not remove `<model-viewer>` or the AR slot button.
- Test viewer routes after AR changes.

## 10. Ingredient Callouts / Hotspots

Ingredient callouts are now shown as normal UI, not as visible `<model-viewer>` hotspot labels.

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

- `ingredientHotspots` can remain in dish configs as ingredient metadata and future positioning data.
- Visible floating hotspot labels are no longer rendered over the 3D model.
- Viewer ingredient chips are rendered from `dish.ingredients` as clickable buttons.
- Tapping a chip opens a small white `IngredientInfoCard` overlay inside the black viewer preview area.
- Benefits are matched by ingredient name, using `dish.ingredients` first and `ingredientHotspots` as a fallback.
- Visible name/benefits are translated through `translateIngredientName` and `translateIngredientBenefit`.
- The real AR launch remains clean and should not show ingredient labels.

Important limitation:

This is not real 3D ingredient detection. Ingredient benefits are static menu metadata. Any `position` and `normal` values in `ingredientHotspots` are currently not used for visible UI.

Future improvements:

- Add richer ingredient/nutrition metadata.
- Tune or repurpose hotspot positions only if a future task explicitly brings back spatial callouts.

### My Selection

The mobile menu includes a frontend-only saved dishes feature called `My selection`.

Behavior:

- Guests can save dishes from menu cards and the full dish viewer page.
- When saved dishes exist, the menu shows a subtle bottom `View selection` access button.
- With no saved dishes, the top menu/header stays clean and selection access can remain hidden.
- Saved dishes store only dish ids and quantities in `localStorage`.
- Storage is per restaurant slug using `sufra-selection-${restaurant.slug}`.
- Rendering resolves dish details from the current restaurant config and ignores saved ids that no longer exist.
- Prices and estimated totals use `formatPrice` and display in GEL only.
- Dish names follow the current menu language.
- The bottom sheet says `Show this list to your waiter.`

Rules:

- This is not a cart, checkout, order submission, payment flow, table-number flow, or backend feature.
- Do not add backend/database/login/admin/payment/order behavior to this feature.

## 11. Price Display

Base currency is GEL. Currency switching and USD/EUR conversion have been removed.

The GEL-only price formatter lives in:

```text
src/data/currencies.js
```

Dish and selection prices are rendered with:

```js
formatPrice(dish.priceGEL)
```

Prices display as plain GEL text, for example `12 GEL`. Pricing plan prices are also displayed in GEL as static plan copy.

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
- Dish detail/viewer action labels
- My selection labels, helper text, quantity labels, and empty states
- Back/viewer buttons
- AR helper text
- Ingredient labels/benefits
- Pricing section/page
- Pricing features and buttons
- About page
- Footer contact label
- Footer nav/contact labels
- Empty states

Must stay English:

- `Sufra AR`
- `Powered by Sufra AR`
- Email address
- Instagram handle
- Currency codes/symbols

Brand slogan translations:

- English: `See It Before You Order`
- Georgian: `ნახე, სანამ შეუკვეთავ`
- Russian: `Увидь перед заказом`

Site and menu language state are intentionally separate. Site language is stored under `sufra-site-language`; menu language is stored under `sufra-menu-language`. Older `sufra-language` values are used only as a fallback. Viewer URLs can also include `lang=<code>`, which applies to the menu/viewer context.

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
- Pro - 149 GEL / month, shown with the translated `Best value` badge
- Custom - Prices may vary

Pricing display is rendered by `PricingSection` in `src/App.jsx`.

Plan feature text is translated through `src/data/translations.js` with keys:

- `pricingBasicFeatures`
- `pricingProFeatures`
- `pricingCustomFeatures`

Current English feature bullets:

Basic:

- Maximum AR quantity: 20
- Full text and photo menu
- Ingredient tags
- Basic restaurant branding

Pro:

- Everything in Basic
- Unlimited AR dishes
- 1 free AR dish change per month
- Custom restaurant branding
- Priority menu updates
- Multi-location-ready structure

Custom:

- Custom solution for larger or special projects
- Flexible AR menu structure
- Custom scope based on restaurant needs
- Contact us for pricing

Basic and Pro cards show a subtle `+ setup fee` note near the monthly price. Custom shows `Prices may vary` and `Please contact us`; it does not show a fixed setup fee.

Pricing sections also show a subtle note: monthly subscription starts 1 month after the setup fee payment.

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
- TikTok: `https://www.tiktok.com/@sufra.ar`
- TikTok handle: `@sufra.ar`
- Facebook: `https://www.facebook.com/share/199UTeER2Z/?mibextid=wwXIfr`
- WhatsApp / phone: `(+995) 598 11 99 81`
- WhatsApp link: `https://wa.me/message/BMXAZDQRTUXEG1`

Current mailto links in `src/App.jsx`:

```js
const demoRequestHref = `mailto:${brand.email}?subject=Sufra%20AR%20Demo%20Request`;
```

Usage:

- Pricing Basic/Pro/Custom CTAs use demo request mailto.
- Footer email uses `mailto:sufraar@gmail.com`.
- Instagram, TikTok, Facebook, and WhatsApp links use `target="_blank"` and `rel="noreferrer"`.

Desktop note:

Mailto behavior depends on the user's operating system/browser default mail app. The links should still be real anchors, not onClick-only buttons.

## 16. Footer Rules

Footer is implemented by `Footer` in `src/App.jsx`.

Footer must include:

- Logo + slogan
- Short Sufra AR description
- Nav links: Home, About
- Contact section label above contact/social links
- Email link
- Instagram link
- TikTok link
- Facebook link
- WhatsApp / phone link
- `Powered by Sufra AR`

Rules:

- Instagram, TikTok, Facebook, and WhatsApp should appear only in the footer contact/social area, not in the footer nav.
- Logo text stays `Sufra AR`.
- Slogan uses the language-specific text from `brand.slogan`.
- Powered text stays `Powered by Sufra AR`.
- Footer nav labels should translate.
- Email address, phone number, social handles, and URLs should not translate.

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
- Dish UI: `.dish-card`, `.viewer-info-card`, `.selection-sheet`
- AR viewer: `model-viewer`, `.viewer-photo`, `.viewer-media-toggle`, `.ingredient-info-card`, `.ar-button`
- Footer: `.site-footer`

## 18. Mobile-First Rules

Phone experience is the priority.

Rules:

- Menu UI must be thumb-friendly.
- Category slider must be horizontally swipeable.
- Category changes reset the active type filter to All. Desserts hide type filters/badges; Drinks use Alcoholic / Non-alcoholic filters and badges and remain photo-only.
- Search must remain usable on mobile. When a query is active, search runs across all dishes in the current restaurant, not only the selected category.
- Dish viewer details and selection controls must fit mobile screens.
- AR button must be obvious and reachable for model-backed food dishes.
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
- `vercel.json` rewrites all routes to `/index.html`, so direct visits like `/pricing`, `/menu/demo-cafe`, and `/menu/demo?dish=steak&view=viewer` work with client-side routing.

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

SEO/favicon notes:

- Browser and Search favicon source is `public/favicon.svg`.
- `index.html` references `/favicon.svg` in the head and also includes PNG fallbacks: `/favicon-48x48.png`, `/favicon-192x192.png`, and `/apple-touch-icon.png`.
- The favicon SVG is square and uses the black/white Sufra AR icon.
- Google Search may take days or weeks to refresh the displayed favicon after production deployment and recrawling.

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
| `orange-juice` | `/images/dishes/orange juice.jpg` | none configured | Photo-only drink; existing GLB asset is not referenced |
| `mtsvadi` | `/images/dishes/mtsvadi.jfif` | `/models/dishes/placeholder-dish.glb` | `hasModel: false`; no dedicated Mtsvadi model yet |

## 22. Current Known Issues / Future Improvements

Known issues/cleanup notes from inspection:

- `src/App.jsx` currently contains many component functions. This works, but future cleanup could extract reusable components into `src/components`.
- `src/data/siteContent.js` contains supporting English content objects, while current visible copy mostly comes from `src/data/translations.js`; `App.jsx` currently uses only `siteContent.hero.image`.
- `src/data/restaurants/sufra-old-town.js` still has a legacy filename. The current public route is `/menu/demo`; `/sufra-old-town` redirects to `/menu/demo` and should not be used for new public links.
- `src/data/brand.js` contains some translated about/description copy, but current visible page copy mostly comes from `src/data/translations.js`; contact identity still comes from `brand.js`.
- `public/models/dishes/khinkali.glb.glb` appears to duplicate `khinkali.glb`. The app currently uses `/models/dishes/khinkali.glb`. Do not delete or move it unless doing an explicit asset cleanup.
- Several asset filenames include spaces and uppercase letters. This is supported if paths are exact, but future assets should prefer lowercase kebab-case.
- Mtsvadi uses `placeholder-dish.glb` and `hasModel: false`.
- Drinks are photo-only; Orange Juice has `hasModel: false` and no configured model path.
- `ingredientHotspots` positions are retained as data but are not currently rendered as visible model-viewer hotspot labels.
- iOS Quick Look may handle scale differently than WebXR/Scene Viewer.
- Temporary `Test` category/dish exists in the demo menu for GLB testing and should be removed after testing. It uses `/models/dishes/tst.glb` with `platformScale` reset to `1` for default, iOS, and Android so the corrected GLB can be tested cleanly at its own exported scale.

Planned/future improvements:

- Better 3D capture/model pipeline for real restaurant dishes.
- More real restaurant dish content and client configs.
- Better ingredient nutrition metadata and optional future spatial callout calibration.
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
15. Preserve `/`, `/pricing`, `/about`, `/menu/demo`, `/menu/demo-cafe`, and the legacy `/sufra-old-town` redirect.
