# Agent Instructions for Sufra AR

## Project Summary

Sufra AR is a premium WebAR restaurant menu product. Guests scan a QR code, browse a mobile-first menu, inspect dish details and ingredients, and view model-backed dishes in 3D/AR on their table before ordering.

The app is a React + Vite frontend deployed on Vercel. It uses static config files only. There is no backend, database, login, dashboard, or payment system.

Technical package/repository name: `sufra-ar`.
Public product/brand name: `Sufra AR`.

## Non-Negotiable Rules

- Do not add a backend.
- Do not add a database.
- Do not add login, dashboard, or payment flows unless explicitly requested.
- Do not break AR/model-viewer.
- Do not duplicate image/model assets.
- Do not move assets unless explicitly requested.
- Do not remove working routes.
- Keep the experience mobile-first.
- Keep code beginner-friendly and scalable.
- Run `npm.cmd run build` before finishing code changes.

## What Not To Break

Current routes:

- `/`
- `/pricing`
- `/about`
- `/menu/demo`
- `/menu/demo-cafe`
- `/sufra-old-town` redirects to `/menu/demo` as a legacy route
- `/demo-cafe` remains a legacy direct route for compatibility

The homepage demo section should point to the existing `/menu/demo` route with a code-generated QR preview. Do not create copied demo configs, copied dish data, or duplicate image/GLB assets for the homepage.

Viewer routes use query params, for example:

```text
/menu/demo?dish=steak&view=viewer&lang=en
```

Important components/functions in `src/App.jsx`:

- `App`
- `getRouteFromPath`
- `navigateToMenu`
- `openViewer`
- `backToMenu`
- `LandingPage`
- `MenuExperience`
- `ModelViewerPage`
- `PricingSection`
- `AboutPage`
- `Footer`

## Commands

Install dependencies:

```powershell
npm.cmd install
```

Run dev:

```powershell
npm.cmd run dev
```

Expose to phone:

```powershell
npm.cmd run dev -- --host 0.0.0.0
```

Build:

```powershell
npm.cmd run build
```

Preview:

```powershell
npm.cmd run preview
```

## File/Data Rules

Main files:

- `src/App.jsx` - routing, layout, menu UI, modal, AR viewer, pages, footer
- `src/styles.css` - all styling
- `src/data/restaurants/index.js` - restaurant registry and languages
- `src/data/restaurants/sufra-old-town.js` - default demo restaurant/menu config; legacy filename, public slug is `demo`
- `src/data/restaurants/demo-cafe.js` - second sample config
- `src/data/translations.js` - visible UI translations
- `src/data/currencies.js` - GEL-only price formatter
- `src/data/plans.js` - pricing plan ids/prices/base features
- `src/data/brand.js` - brand identity and contact info

Keep restaurant/menu data in config files, not hardcoded in components.

Restaurant configs may include a static `schedule` object with translated status text and weekly hours. If a restaurant has no schedule, the menu schedule row should hide cleanly.

Required category ids:

```text
main-course
salads
baked-goods
drinks
```

Food categories use All / Veg filters; Meat is not shown as a filter or badge in the demo UI. Drink categories use Alcoholic / Non-alcoholic filters and badges. Drinks are photo-only and should not render `model-viewer`, AR launch, or a Photo / 3D selector.

Each dish should have:

- `id`
- `categoryId`
- `type` (`veg`/`meat` for food, `drink` for drinks)
- `drinkType` for drinks, such as `alcoholic` or `non-alcoholic`
- translated `name`
- translated `description`
- `priceGEL`
- translated `calories` when calorie information is available
- `image`
- `model`
- `hasModel`
- `ingredients`
- `ingredientHotspots` if callouts are available
- `arScale`
- `arPlacement`
- `cameraOrbit`
- `fieldOfView`

Use `arScale: '1 1 1'` by default. Dish real-world size should come from the correctly exported GLB unless a future task explicitly asks for a calibrated override.

`platformScale` is optional future calibration metadata and should be omitted unless platform-specific AR testing proves it is needed.

Dishes with real models can show the Photo / 3D selector in the viewer. Dishes without models, including drinks, should show the existing dish photo only.

Asset folders:

- Images: `public/images/dishes`
- Models: `public/models/dishes`

Use public paths:

```js
image: '/images/dishes/steak.jpg'
model: '/models/dishes/steak.glb'
```

Do not duplicate assets. Current filenames include spaces and uppercase letters; reference them exactly. Prefer lowercase kebab-case for future assets.

## AR Rules

`<model-viewer>` is loaded from CDN in `index.html`.

AR viewer is implemented in `ModelViewerPage` in `src/App.jsx`.

Preserve:

- `ar`
- platform-specific `ar-modes` (`quick-look` for iOS, `scene-viewer webxr` for Android, `scene-viewer webxr quick-look` for desktop/default). Android prioritizes Scene Viewer before WebXR because testing showed better placement behavior.
- `ar-scale="fixed"`
- `disable-zoom`
- `camera-controls`
- dish-specific `scale={modelScale}` derived from `dish.arScale` and optional `platformScale`
- dish-specific `src={dish.model}`
- AR slot button text/action

Do not re-enable unrealistic free scaling unless explicitly requested. Users should be able to rotate/orbit in preview and launch AR on mobile. iOS Quick Look may handle scale differently than WebXR/Scene Viewer.

Optional `platformScale` values default to `1` for all platforms. Do not add Android scale overrides unless real Android testing proves a specific model needs calibration. Keep one shared GLB per dish instead of duplicating iOS/Android model files.

Visible ingredient info in the viewer should come from clickable ingredient chips and a normal UI info card. Do not render floating `<model-viewer>` hotspot labels over the 3D model unless a future task explicitly asks for spatial callouts again. `ingredientHotspots` may remain in dish data as metadata/future positioning data.

For dishes without a real model, keep `hasModel: false` so the viewer stays photo-only and does not render AR controls.

## Translation Rules

Supported internal language codes:

- `en`
- `ka`
- `ru`

Selector labels:

- `ENG`
- `GEO`
- `RUS`

Visible UI translations live in `src/data/translations.js`. Site language and menu language state are separate; do not collapse them back into one shared state. Currency switching has been removed, and menu prices display in GEL only.

The first-time/default language is Georgian (`ka`). Saved user language and explicit `lang=` URL query parameters should still be respected.

Do not translate:

- `Sufra AR`
- `Designed with 🤍 by Sufra AR`
- email address
- Instagram handle
- currency codes/symbols

The brand slogan is translated by language:

- English: `See It Before You Order`
- Georgian: `ნახე, სანამ შეუკვეთავ`
- Russian: `Увидь перед заказом`

When adding visible UI text, add it to `translations.js` and use `t(language, key)` or `tArray(language, key)` from `src/App.jsx`.

Dish descriptions and category labels live in restaurant configs.

`My selection` is frontend-only and local-only. It stores minimal dish id/quantity data per restaurant with `sufra-selection-${restaurant.slug}` and must not become checkout, payment, order submission, table submission, login, admin, backend, or database behavior.

The menu renders all current restaurant categories as one continuous grouped menu. Category pills are scroll shortcuts to category sections and should visually update as the user scrolls.

## Contact Info

Email:

```text
sufraar@gmail.com
```

Instagram:

```text
https://www.instagram.com/sufraar/
```

Handle:

```text
@sufraar
```

TikTok:

```text
https://www.tiktok.com/@sufra.ar
```

Facebook:

```text
https://www.facebook.com/share/199UTeER2Z/?mibextid=wwXIfr
```

WhatsApp / phone:

```text
(+995) 598 11 99 81
https://wa.me/message/BMXAZDQRTUXEG1
```

Contact link rules:

- Email links must be real `mailto:` anchors.
- Instagram/TikTok/Facebook links must use `target="_blank"` and `rel="noreferrer"`.
- WhatsApp links must use `target="_blank"` and `rel="noreferrer"`.
- Do not use `href="#"` for contact actions.

Current mailto subjects in `src/App.jsx`:

- Demo request: `Sufra AR Demo Request`

## Deployment Notes

The app is deployed on Vercel.

Production domain:

```text
https://sufraar.com
```

`vercel.json` rewrites all paths to `index.html`, so direct route visits and QR-code links work.

Build output is `dist`.

## Code Quality Rules

- Keep code clean, minimal, and readable.
- Do not create duplicate components or duplicate CSS.
- Do not put large repeated JSX blocks in `App.jsx`.
- Extract reusable sections into components when useful.
- Keep data in config files, not hardcoded in components.
- Do not duplicate assets.
- Do not add unnecessary libraries.
- Prefer simple beginner-friendly code.
- Remove unused imports and unused code after changes.
- Keep mobile-first behavior.
- Preserve existing UI unless the task asks for visual changes.
- Run `npm.cmd run build` before finishing.
