// Demo Cafe restaurant config
// Duplicate this file when onboarding another restaurant.
// Then change slug, names, theme, images, dishes, and model settings.

const demoCafe = {
  slug: 'demo-cafe',
  brandName: 'Demo Cafe AR',
  currency: 'GEL',
  restaurantName: {
    en: 'Demo Cafe',
    ka: 'დემო კაფე',
    ru: 'Демо Кафе',
  },
  subtitle: {
    en: 'A relaxed cafe menu sample for testing Sufra AR with another restaurant.',
    ka: 'მყუდრო კაფეს მენიუს ნიმუში Sufra AR-ის მეორე რესტორანზე შესამოწმებლად.',
    ru: 'Пример уютного кафе-меню для тестирования Sufra AR со вторым рестораном.',
  },
  locationLabel: {
    en: 'Rustaveli Avenue, Tbilisi, Georgia',
    ka: 'რუსთაველის გამზირი, თბილისი, საქართველო',
    ru: 'Проспект Руставели, Тбилиси, Грузия',
  },
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Rustaveli%20Avenue%2C%20Tbilisi%2C%20Georgia',
  heroImage: '/images/Funicular Restaurant Complex1.jpg',

  // This demo uses a slightly calmer cafe theme.
  theme: {
    background: '#F8F6F2',
    text: '#1F1F1F',
    secondaryText: '#6B6B6B',
    accent: '#D4AF37',
    card: '#FDFCF9',
    border: '#EAE5DC',
    headingFont: '"Playfair Display", Georgia, serif',
    bodyFont: 'Inter, "Helvetica Neue", Arial, system-ui, sans-serif',
  },

  categories: [
    {
      id: 'cafe-favorites',
      name: {
        en: 'Cafe Favorites',
        ka: 'კაფეს რჩეულები',
        ru: 'Любимое в кафе',
      },
    },
    {
      id: 'chef-plates',
      name: {
        en: 'Chef Plates',
        ka: 'შეფის კერძები',
        ru: 'Блюда от шефа',
      },
    },
  ],

  dishes: [
    {
      id: 'demo-khinkali',
      category: 'cafe-favorites',
      name: {
        en: 'Cafe Khinkali',
        ka: 'კაფეს ხინკალი',
        ru: 'Кафе хинкали',
      },
      description: {
        en: 'A sample dumpling plate for demo menus and QR testing.',
        ka: 'სადემო ხინკლის თეფში მენიუსა და QR ტესტირებისთვის.',
        ru: 'Демо-порция хинкали для меню и проверки QR.',
      },
      price: 16,
      image: '/images/mtis khinkali.webp',
      model: '/models/khinkali.glb',
      arScale: '1 1 1',
      arPlacement: 'floor',
      cameraOrbit: '30deg 68deg 2.2m',
      fieldOfView: '32deg',
    },
    {
      id: 'demo-khachapuri',
      category: 'cafe-favorites',
      name: {
        en: 'Mini Adjaruli',
        ka: 'მინი აჭარული',
        ru: 'Мини аджарули',
      },
      description: {
        en: 'A compact khachapuri sample using the same AR-ready model workflow.',
        ka: 'მინი ხაჭაპურის ნიმუში იგივე AR მოდელის სამუშაო პროცესით.',
        ru: 'Мини-хачапури с тем же процессом AR-модели.',
      },
      price: 20,
      image: '/images/adjaruli khachapuri.jfif',
      model: '/models/adjaruli-khachapuri.glb',
      arScale: '1 1 1',
      arPlacement: 'floor',
      cameraOrbit: '35deg 70deg 2.4m',
      fieldOfView: '30deg',
    },
    {
      id: 'demo-steak',
      category: 'chef-plates',
      name: {
        en: 'Cafe Steak',
        ka: 'კაფეს სტეიკი',
        ru: 'Кафе стейк',
      },
      description: {
        en: 'Grilled steak served with herbs and rich sauce.',
        ka: 'გრილზე შემწვარი სტეიკი მწვანილებით და სოუსით.',
        ru: 'Стейк на гриле с зеленью и насыщенным соусом.',
      },
      price: 38,
      image: '/images/steak.jpg',
      model: '/models/steak.glb',
      arScale: '1 1 1',
      arPlacement: 'floor',
      cameraOrbit: '35deg 72deg 2.8m',
      fieldOfView: '28deg',
    },
  ],
};

export default demoCafe;
