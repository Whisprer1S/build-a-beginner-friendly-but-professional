# Sufra AR

Sufra AR is a static React + Vite WebAR menu product for restaurants, cafes, hotels, and lounges.

Technical package/repository name: `sufra-ar`.
Public product/brand name: `Sufra AR`.

There is no backend, database, login system, dashboard, or payment flow in this MVP. Restaurant pages, menu items, prices, images, 3D models, AR settings, and themes are controlled with simple config files.

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Routes

```text
/                  -> product landing page with pricing preview and QR demo section
/menu/demo         -> primary public demo menu
/menu/demo-cafe    -> second sample restaurant menu
/sufra-old-town    -> legacy route that redirects to /menu/demo
/demo-cafe         -> legacy direct route kept for compatibility
/pricing           -> full pricing page
/about             -> about Sufra AR
```

## Project Structure

```text
src/App.jsx                       -> app layout, routing, menu UI, modal, AR viewer
src/styles.css                    -> global styling and responsive UI
src/data/brand.js                 -> Sufra AR brand identity and contact links
src/data/currencies.js            -> GEL-only price formatter
src/data/plans.js                 -> pricing plan content
src/data/siteContent.js           -> landing and about copy
src/data/restaurants/index.js     -> restaurant registry and default restaurant
src/data/restaurants/*.js         -> restaurant menu configs
```

Assets are referenced from:

```text
public/images/dishes
public/models/dishes
```

## Menu Features

- Guest-facing menu routes use a clean menu-only layout: no marketing website header, a small `Designed with 🤍 by Sufra AR` credit footer, and a floating back-to-top button after scrolling.
- The menu shows all current categories as one continuous grouped menu. Category pills scroll to their sections and update as the guest scrolls.
- Restaurant configs can include a static weekly schedule. When present, the menu shows an open-status row and a working-hours modal.
- Viewer ingredient chips are clickable and open a small normal UI info card. `ingredientHotspots` may remain in menu data, but visible labels no longer float over the 3D model.
- `My selection` is a local-only saved dishes list with compact dish card/viewer-page add controls and a subtle bottom `View selection` access button after dishes are saved. It stores dish ids and quantities per restaurant in `localStorage` with `sufra-selection-${restaurant.slug}`.
- `My selection` is not checkout, ordering, payment, table submission, or a backend feature.

The first-time/default language is Georgian (`ka`). Saved user choices and explicit `lang=` URL query parameters still override that default.

## Add A New Restaurant

1. Copy an existing config:

```text
src/data/restaurants/sufra-old-town.js
```

The current default demo config keeps this legacy filename for safety, but its public slug is `demo` and its public URL is `/menu/demo`.

2. Rename the copied file to the new restaurant name, for example:

```text
src/data/restaurants/new-restaurant.js
```

3. Edit the exported config:

- `slug`
- `brandName`
- `restaurantName`
- `subtitle`
- `locationLabel`
- `mapUrl`
- `heroImage`
- `theme`
- `categories`
- `dishes`
- `schedule`, if the venue should show working hours

4. Import and register it in:

```text
src/data/restaurants/index.js
```

Adding a client should usually mean copying one restaurant config and editing data.

## Edit Menu Data

Each dish can control:

- `id`
- `categoryId`
- `type` as `veg` or `meat` for food, or `drink` for drinks
- `drinkType` for drinks, such as `alcoholic` or `non-alcoholic`
- translated `name`
- translated `description`
- `priceGEL`
- translated `calories` when available
- `image`
- `model`
- `hasModel`
- `ingredients`
- `ingredientHotspots`
- `arScale`
- `arPlacement`
- `cameraOrbit`
- `fieldOfView`

Example:

```js
{
  id: 'steak',
  categoryId: 'main-course',
  type: 'meat',
  priceGEL: 42,
  calories: {
    en: 'Approx. 780 kcal',
    ka: 'დაახლოებით 780 კკალ',
    ru: 'Примерно 780 ккал',
  },
  image: '/images/dishes/steak.jpg',
  model: '/models/dishes/steak.glb',
  hasModel: true,
  arScale: '1 1 1',
  arPlacement: 'floor',
  cameraOrbit: '35deg 72deg 2.8m',
  fieldOfView: '28deg',
}
```

The current demo menu uses `main-course`, `salads`, `baked-goods`, and `drinks`. Food categories show All / Veg filters only; Meat is not shown as a visible filter or badge. Drink categories use Alcoholic / Non-alcoholic filters and badges. Drinks are photo-only and should not show AR/model-viewer.

If a custom 3D model is not ready, use:

```js
model: '/models/dishes/placeholder-dish.glb',
hasModel: false,
```

## Price Display

Base prices are always stored in GEL with `priceGEL`.

GEL-only formatting lives in:

```text
src/data/currencies.js
```

Currency switching and USD/EUR conversion are not active. Dish prices display as plain GEL text, for example `12 GEL`.

## QR Codes

The homepage includes a code-generated QR demo section that points to the live demo URL:

```text
https://sufraar.com/menu/demo
```

Deploy the app, then generate one QR code per restaurant URL for each real client venue.

Examples:

```text
https://domain.com/menu/demo
https://domain.com/menu/demo-cafe
```

Use any QR code generator, paste the restaurant URL, and print the QR for tables, menus, or signage.

Do not use `/sufra-old-town` for new QR codes or public links. It is a legacy route that redirects to `/menu/demo` only to protect old visits.

## Vercel Deployment

Use the default Vite settings:

- Build command: `npm run build`
- Output directory: `dist`

The included `vercel.json` rewrites direct URLs like `/menu/demo`, `/menu/demo-cafe`, `/pricing`, and `/about` back to the React app, so QR-code visits and page refreshes work on Vercel.
