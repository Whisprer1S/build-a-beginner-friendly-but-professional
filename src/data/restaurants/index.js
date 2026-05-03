import demoCafe from './demo-cafe.js';
import sufraOldTown from './sufra-old-town.js';

export const languages = [
  { code: 'en', label: 'ENG' },
  { code: 'ka', label: 'GEO' },
  { code: 'ru', label: 'RUS' },
];

// Add new restaurant configs here after copying one of the files in this folder.
export const restaurants = [sufraOldTown, demoCafe];

// The homepage "/" and public demo route "/menu/demo" load this restaurant.
export const defaultRestaurantSlug = 'demo';

export const defaultRestaurant =
  restaurants.find((restaurant) => restaurant.slug === defaultRestaurantSlug) || restaurants[0];

export function findRestaurantBySlug(slug) {
  return restaurants.find((restaurant) => restaurant.slug === slug);
}
