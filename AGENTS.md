# Agent Instructions for Sufra AR

## Project Summary

Sufra AR is a premium WebAR restaurant menu product. Guests scan a QR code, browse a mobile-first menu, inspect dish details and ingredients, and view dishes in 3D/AR on their table before ordering.

The app is a React + Vite frontend deployed on Vercel. It uses static config files only. There is no backend, database, login, dashboard, or payment system.

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
- `/experience`
- `/about`
- `/contact`
- `/sufra-old-town`
- `/demo-cafe`

Viewer routes use query params, for example:

```text
/sufra-old-town?dish=steak&view=viewer&lang=en
```

Important components/functions in `src/App.jsx`:

- `App`
- `getRouteFromPath`
- `navigateToMenu`
- `openViewer`
- `backToMenu`
- `LandingPage`
- `MenuExperience`
- `DishModal`
- `ModelViewerPage`
- `PricingSection`
- `ExperiencePage`
- `AboutPage`
- `ContactPage`
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
- `src/data/restaurants/sufra-old-town.js` - default restaurant/menu config
- `src/data/restaurants/demo-cafe.js` - second sample config
- `src/data/translations.js` - visible UI translations
- `src/data/currencies.js` - static currency conversion
- `src/data/plans.js` - pricing plan ids/prices/base features
- `src/data/brand.js` - brand identity and contact info

Keep restaurant/menu data in config files, not hardcoded in components.

Required category ids:

```text
starters
salads
main-course
grill
desserts
drinks
```

Each dish should have:

- `id`
- `categoryId`
- `type`
- translated `name`
- translated `description`
- `priceGEL`
- `image`
- `model`
- `hasModel`
- `ingredients`
- `ingredientHotspots` if callouts are available
- `arScale`
- `arPlacement`
- `cameraOrbit`
- `fieldOfView`

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
- `ar-modes="webxr scene-viewer quick-look"`
- `ar-scale="fixed"`
- `disable-zoom`
- `camera-controls`
- dish-specific `scale={dish.arScale}`
- dish-specific `src={dish.model}`
- AR slot button text/action

Do not re-enable unrealistic free scaling unless explicitly requested. Users should be able to rotate/orbit in preview and launch AR on mobile. iOS Quick Look may handle scale differently than WebXR/Scene Viewer.

Mtsvadi currently uses:

```js
model: '/models/dishes/placeholder-dish.glb'
hasModel: false
```

## Translation Rules

Supported internal language codes:

- `en`
- `ka`
- `ru`

Selector labels:

- `ENG`
- `GEO`
- `RUS`

Visible UI translations live in `src/data/translations.js`.

Do not translate:

- `Sufra AR`
- `Dining, Before It Arrives.`
- `Powered by Sufra AR`
- email address
- Instagram handle
- currency codes/symbols

When adding visible UI text, add it to `translations.js` and use `t(language, key)` or `tArray(language, key)` from `src/App.jsx`.

Dish descriptions and category labels live in restaurant configs.

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

Contact link rules:

- Email links must be real `mailto:` anchors.
- Instagram links must use `target="_blank"` and `rel="noreferrer"`.
- Do not use `href="#"` for contact actions.

Current mailto subjects in `src/App.jsx`:

- Inquiry: `Sufra AR Inquiry`
- Demo request: `Sufra AR Demo Request`
- Custom plan inquiry: `Sufra AR Custom Plan Inquiry`

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
