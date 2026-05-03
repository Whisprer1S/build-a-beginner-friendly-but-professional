// Demo Cafe reuses the same scalable menu structure with its own slug/name.
// Duplicate either restaurant config to onboard a new venue.

import sufraOldTown from './sufra-old-town.js';

const demoCafe = {
  ...sufraOldTown,
  slug: 'demo-cafe',
  brandName: 'Sufra AR',
  restaurantName: {
    en: 'Sufra Cafe',
    ka: 'Sufra Cafe',
    ru: 'Sufra Cafe',
  },
  subtitle: {
    en: 'A second sample venue using the same mobile WebAR menu system.',
    ka: 'მეორე საცდელი სივრცე იგივე მობილური WebAR მენიუს სისტემით.',
    ru: 'Вторая тестовая площадка с той же мобильной системой WebAR-меню.',
  },
};

export default demoCafe;
