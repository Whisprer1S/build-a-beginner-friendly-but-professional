# Sufra AR

Sufra AR is a static React + Vite WebAR menu product for restaurants, cafes, hotels, and lounges.

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
/                  -> product landing page with pricing preview and demo menu
/sufra-old-town    -> mobile WebAR menu demo
/demo-cafe         -> second sample restaurant menu
/pricing           -> full pricing page
/experience        -> upcoming Virtual Restaurant Experience page
/about             -> about Sufra AR
/contact           -> contact placeholder page
```

## Project Structure

```text
src/App.jsx                       -> app layout, routing, menu UI, modal, AR viewer
src/styles.css                    -> global styling and responsive UI
src/data/brand.js                 -> Sufra AR brand placeholders
src/data/currencies.js            -> static GEL / USD / EUR conversion
src/data/plans.js                 -> pricing plan content
src/data/siteContent.js           -> landing, about, contact, experience copy
src/data/restaurants/index.js     -> restaurant registry and default restaurant
src/data/restaurants/*.js         -> restaurant menu configs
```

Assets are referenced from:

```text
public/images/dishes
public/models/dishes
```

## Add A New Restaurant

1. Copy an existing config:

```text
src/data/restaurants/sufra-old-town.js
```

2. Rename it to the new URL slug, for example:

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

4. Import and register it in:

```text
src/data/restaurants/index.js
```

Adding a client should usually mean copying one restaurant config and editing data.

## Edit Menu Data

Each dish can control:

- `id`
- `categoryId`
- `type` as `veg` or `meat`
- translated `name`
- translated `description`
- `priceGEL`
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
  categoryId: 'grill',
  type: 'meat',
  priceGEL: 42,
  image: '/images/dishes/steak.jpg',
  model: '/models/dishes/steak.glb',
  hasModel: true,
  arScale: '1 1 1',
  arPlacement: 'floor',
  cameraOrbit: '35deg 72deg 2.8m',
  fieldOfView: '28deg',
}
```

If a custom 3D model is not ready, use:

```js
model: '/models/dishes/placeholder-dish.glb',
hasModel: false,
```

## Currency

Base prices are always stored in GEL with `priceGEL`.

Static conversion rates live in:

```text
src/data/currencies.js
```

Current rates:

- 1 GEL = 0.37 USD
- 1 GEL = 0.315 EUR

## QR Codes

Deploy the app, then generate one QR code per restaurant URL.

Examples:

```text
https://domain.com/sufra-old-town
https://domain.com/demo-cafe
```

Use any QR code generator, paste the restaurant URL, and print the QR for tables, menus, or signage.

## Vercel Deployment

Use the default Vite settings:

- Build command: `npm run build`
- Output directory: `dist`

The included `vercel.json` rewrites direct URLs like `/demo-cafe`, `/pricing`, and `/experience` back to the React app, so QR-code visits and page refreshes work on Vercel.
