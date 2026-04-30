// Sufra Old Town restaurant config
// To add a new client, copy this file, rename it to the new slug,
// edit the values below, then export it from src/data/restaurants/index.js.

const sufraOldTown = {
  slug: "sufra-old-town",
  brandName: "Sufra AR",
  currency: "GEL",
  restaurantName: {
    en: "Sufra Old Town",
    ka: "სუფრა ძველი თბილისი",
    ru: "Суфра Старый Тбилиси",
  },
  subtitle: {
    en: "A refined Georgian table in the heart of Tbilisi.",
    ka: "დახვეწილი ქართული სუფრა თბილისის გულში.",
    ru: "Изысканный грузинский стол в сердце Тбилиси.",
  },
  locationLabel: {
    en: "Mtatsminda Plateau, Tbilisi, Georgia",
    ka: "მთაწმინდის პლატო, თბილისი, საქართველო",
    ru: "Плато Мтацминда, Тбилиси, Грузия",
  },
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Funicular%20Restaurant%20Complex%2C%20Mtatsminda%20Plateau%2C%20Tbilisi%2C%20Georgia",
  heroImage: "/images/Funicular Restaurant Complex1.jpg",

  // Change colors and fonts here for this restaurant only.
  theme: {
    background: "#FAFAF8",
    text: "#121212",
    secondaryText: "#666666",
    accent: "#121212",
    card: "#FFFFFF",
    border: "#E0E0E0",
    headingFont: '"Playfair Display", Georgia, serif',
    bodyFont: 'Inter, "Helvetica Neue", Arial, system-ui, sans-serif',
  },

  // Add or edit menu sections here.
  categories: [
    {
      id: "signatures",
      name: {
        en: "Signature Dishes",
        ka: "საფირმო კერძები",
        ru: "Фирменные блюда",
      },
    },
    {
      id: "mains",
      name: {
        en: "From the Grill",
        ka: "გრილიდან",
        ru: "С гриля",
      },
    },
  ],

  // Add or edit dishes here.
  // category must match one of the category ids above.
  // image points to /public/images. model points to /public/models.
  // arScale, arPlacement, cameraOrbit, and fieldOfView tune the AR/3D view.
  dishes: [
    {
      id: "adjaruli-khachapuri",
      category: "signatures",
      name: {
        en: "Adjaruli Khachapuri",
        ka: "აჭარული ხაჭაპური",
        ru: "Аджарский хачапури",
      },
      description: {
        en: "Boat-shaped Georgian cheese bread with egg yolk and butter.",
        ka: "ნავის ფორმის ხაჭაპური კვერცხის გულითა და კარაქით.",
        ru: "Лодочка с грузинским сыром, желтком и сливочным маслом.",
      },
      price: 24,
      image: "/images/adjaruli khachapuri.jfif",
      model: "/models/adjaruli-khachapuri.glb",
      arScale: "1 1 1",
      arPlacement: "floor",
      cameraOrbit: "35deg 70deg 2.4m",
      fieldOfView: "30deg",
    },
    {
      id: "khinkali",
      category: "signatures",
      name: {
        en: "Mountain Khinkali",
        ka: "მთის ხინკალი",
        ru: "Горные хинкали",
      },
      description: {
        en: "Hand-folded dumplings filled with spiced beef and warm broth.",
        ka: "ხელით დაკეცილი ხინკალი სუნელოვანი ხორცითა და წვენით.",
        ru: "Ручные хинкали с пряной говядиной и горячим бульоном.",
      },
      price: 18,
      image: "/images/mtis khinkali.webp",
      model: "/models/khinkali.glb",
      arScale: "1 1 1",
      arPlacement: "floor",
      cameraOrbit: "30deg 68deg 2.2m",
      fieldOfView: "32deg",
    },
    {
      id: "steak",
      category: "mains",
      name: {
        en: "Steak",
        ka: "სტეიკი",
        ru: "Стейк",
      },
      description: {
        en: "Grilled steak served with herbs and rich sauce.",
        ka: "გრილზე შემწვარი სტეიკი მწვანილებით და სოუსით.",
        ru: "Стейк на гриле с зеленью и насыщенным соусом.",
      },
      price: 38,
      image: "/images/steak.jpg",
      model: "/models/steak.glb",
      arScale: "1 1 1",
      arPlacement: "floor",
      cameraOrbit: "35deg 72deg 2.8m",
      fieldOfView: "28deg",
    },
  ],
};

export default sufraOldTown;
