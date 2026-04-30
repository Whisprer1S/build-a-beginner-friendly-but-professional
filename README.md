# Sufra AR

Sufra AR is a static React + Vite AR menu system for restaurants. There is no backend, database, login, dashboard, or payment flow.

The app supports multiple restaurants from static config files. Adding a new client means copying one config file and editing data.

## Run Locally

```bash
npm install
npm run dev
```

## Restaurant URLs

The app reads the restaurant slug from the URL path:

```text
/                  -> default restaurant
/sufra-old-town    -> Sufra Old Town
/demo-cafe         -> Demo Cafe
```

Example production URLs:

```text
https://domain.com/sufra-old-town
https://domain.com/demo-cafe
```

The homepage `/` loads `sufra-old-town` as the default live demo.

## Config Structure

Restaurant configs live in:

```text
src/data/restaurants
```

Current configs:

```text
src/data/restaurants/sufra-old-town.js
src/data/restaurants/demo-cafe.js
src/data/restaurants/index.js
```

`index.js` imports and registers every restaurant config. It also controls the default homepage restaurant.

## Add A New Restaurant

1. Duplicate an existing config file, for example:

```text
src/data/restaurants/demo-cafe.js
```

2. Rename it to the new slug:

```text
src/data/restaurants/new-restaurant.js
```

3. Edit:

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

4. Import and add it in:

```text
src/data/restaurants/index.js
```

## Edit Dishes

Each dish has:

- `id`
- `category`
- translated `name`
- translated `description`
- `price`
- `image`
- `model`
- `arScale`
- `arPlacement`
- `cameraOrbit`
- `fieldOfView`

`category` must match a category `id`.

Dish photos go in:

```text
public/images
```

3D models go in:

```text
public/models
```

Example:

```js
image: '/images/steak.jpg',
model: '/models/steak.glb',
arScale: '1 1 1',
arPlacement: 'floor',
cameraOrbit: '35deg 72deg 2.8m',
fieldOfView: '28deg',
```

## Theme

Each restaurant controls its own colors and fonts:

```js
theme: {
  background: '#F8F6F2',
  text: '#1F1F1F',
  secondaryText: '#6B6B6B',
  accent: '#D4AF37',
  card: '#FDFCF9',
  border: '#EAE5DC',
  headingFont: '"Playfair Display", Georgia, serif',
  bodyFont: 'Inter, "Helvetica Neue", Arial, system-ui, sans-serif',
}
```

The React app applies these values as CSS variables.

## QR Codes

Deploy the app, then generate one QR code per restaurant URL.

Examples:

```text
https://domain.com/sufra-old-town
https://domain.com/demo-cafe
```

Use any QR code generator, paste the restaurant URL, and print the result for tables or menus.

## Vercel Deployment

Use the default Vite settings:

- Build command: `npm run build`
- Output directory: `dist`

The included `vercel.json` rewrites route slugs like `/demo-cafe` back to the React app, so direct QR-code visits work.
