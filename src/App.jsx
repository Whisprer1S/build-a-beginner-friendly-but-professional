import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronUp,
  ExternalLink,
  GlassWater,
  Globe,
  Grid,
  Leaf,
  ListChecks,
  List,
  Mail,
  Minus,
  Moon,
  Music2,
  Phone,
  Plus,
  Search,
  Sun,
  Trash2,
  Wine,
  X,
} from 'lucide-react';
import { brand } from './data/brand.js';
import { formatPrice } from './data/currencies.js';
import { pricingPlans } from './data/plans.js';
import { siteContent } from './data/siteContent.js';
import { getTranslation, translations } from './data/translations.js';
import {
  defaultRestaurant,
  defaultRestaurantSlug,
  findRestaurantBySlug,
  languages,
} from './data/restaurants/index.js';
import { createQrModules } from './utils/qrCode.js';

const demoRequestHref = `mailto:${brand.email}?subject=Sufra%20AR%20Demo%20Request`;
const DEMO_MENU_QR_URL = 'https://sufraar.com/menu/demo';
const DEFAULT_LANGUAGE = 'ka';

function t(language, key) {
  return getTranslation(language, key);
}

function tArray(language, key) {
  const value = getTranslation(language, key);
  return Array.isArray(value) ? value : [];
}

function getPlanTitle(plan, language) {
  const titleKeys = {
    basic: 'pricingBasic',
    pro: 'pricingPro',
    custom: 'pricingCustom',
  };
  return t(language, titleKeys[plan.id]) || plan.title;
}

function getPlanFeatures(plan, language) {
  const featureKeys = {
    basic: 'pricingBasicFeatures',
    pro: 'pricingProFeatures',
    custom: 'pricingCustomFeatures',
  };
  const translatedFeatures = tArray(language, featureKeys[plan.id]);
  return translatedFeatures.length ? translatedFeatures : plan.features;
}

function getPlanPrice(plan, language) {
  if (plan.id === 'custom') return t(language, 'pricingCustomPrice');
  return `${plan.price.split(' / ')[0]} / ${t(language, 'pricingMonth')}`;
}

function getPlanSetupNote(plan, language) {
  return plan.id === 'custom' ? '' : t(language, 'pricingSetupFee');
}

function getPlanCta(plan, language) {
  return plan.id === 'custom' ? t(language, 'pricingContactUs') : t(language, 'getStarted');
}

function translateIngredientName(name, language) {
  return translations[language]?.ingredientNames?.[name] ?? translations.en.ingredientNames?.[name] ?? name;
}

function translateIngredientBenefit(benefit, language) {
  return translations[language]?.ingredientBenefits?.[benefit] ?? translations.en.ingredientBenefits?.[benefit] ?? benefit;
}

function getIngredientKey(name) {
  return String(name || '').trim().toLowerCase();
}

function getIngredientInfo(dish, ingredientName) {
  const ingredientKey = getIngredientKey(ingredientName);
  const ingredient = (dish.ingredients || []).find((item) => getIngredientKey(item.name) === ingredientKey);
  const hotspot = (dish.ingredientHotspots || []).find((item) => getIngredientKey(item.name) === ingredientKey);

  return {
    name: ingredient?.name || hotspot?.name || ingredientName,
    benefits: ingredient?.benefits?.length ? ingredient.benefits : hotspot?.benefits || [],
  };
}

function getIngredientInfos(dish) {
  return (dish.ingredients || []).map((ingredient) => getIngredientInfo(dish, ingredient.name));
}

function getArPlatform() {
  if (typeof navigator === 'undefined') return 'default';

  const userAgent = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const isIPadOSDesktopMode = platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  if (/iPad|iPhone|iPod/i.test(userAgent) || isIPadOSDesktopMode) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'default';
}

function getArModesForPlatform(platform) {
  if (platform === 'ios') return 'quick-look';
  if (platform === 'android') return 'scene-viewer webxr';
  return 'scene-viewer webxr quick-look';
}

function getPlatformScaleMultiplier(dish, platform) {
  const platformScale = dish.platformScale || {};
  const multiplier = Number(platformScale[platform] ?? platformScale.default ?? 1);
  return Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
}

function formatScaleValue(value) {
  return Number(value.toFixed(6)).toString();
}

function getModelScaleForPlatform(dish, platform) {
  const baseScale = String(dish.arScale || '1 1 1')
    .trim()
    .split(/\s+/)
    .map(Number);
  const safeBaseScale = baseScale.length === 3 && baseScale.every((value) => Number.isFinite(value) && value > 0)
    ? baseScale
    : [1, 1, 1];
  const multiplier = getPlatformScaleMultiplier(dish, platform);

  return safeBaseScale.map((value) => formatScaleValue(value * multiplier)).join(' ');
}

function text(value, language) {
  if (Array.isArray(value)) return value;
  return value?.[language] || value?.en || '';
}

function formatCaloriesValue(value, language) {
  if (value === null || value === undefined || value === '') return '';
  const rawValue = typeof value === 'number' ? String(value) : text(value, language) || String(value);
  const numberMatch = rawValue.match(/\d+(?:[.,]\d+)?/);
  return numberMatch ? `${numberMatch[0].replace(',', '.')} Cal` : '';
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function scrollToTopInstant() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch {
    window.scrollTo(0, 0);
  }
}

function getRouteFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const staticPages = ['about', 'pricing'];
  const pathParts = path.split('/');

  if (!path) return { page: 'home', slug: defaultRestaurantSlug, params: getParams() };
  if (staticPages.includes(path)) return { page: path, slug: defaultRestaurantSlug, params: getParams() };
  if (path === 'sufra-old-town') {
    const params = getParams();
    window.history.replaceState({}, '', buildRestaurantUrl(defaultRestaurantSlug, Object.fromEntries(params.entries())));
    return { page: 'menu', slug: defaultRestaurantSlug, params: getParams() };
  }
  if (pathParts[0] === 'menu' && pathParts[1]) return { page: 'menu', slug: pathParts[1], params: getParams() };
  return { page: 'menu', slug: path, params: getParams() };
}

function getRestaurantPath(slug) {
  return `/menu/${slug}`;
}

function buildRestaurantUrl(slug, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const search = params.toString();
  return search ? `${getRestaurantPath(slug)}?${search}` : getRestaurantPath(slug);
}

function getThemeStyle(restaurant, themeMode) {
  const theme = restaurant.theme;
  const isDark = themeMode === 'dark';

  return {
    '--bg': isDark ? '#121212' : theme.background,
    '--text': isDark ? '#FFFFFF' : theme.text,
    '--secondary-text': isDark ? '#A7A7A7' : theme.secondaryText,
    '--accent': theme.accent,
    '--card': isDark ? '#181818' : theme.card,
    '--border': isDark ? '#2A2A2A' : theme.border,
    '--dropdown-bg': isDark ? '#1F1F1F' : '#FFFFFF',
    '--dropdown-text': isDark ? '#FFFFFF' : '#121212',
    '--dropdown-selected-bg': isDark ? '#E0E0E0' : '#121212',
    '--dropdown-selected-text': isDark ? '#121212' : '#FFFFFF',
    '--badge-bg': isDark ? '#F7F7F5' : '#121212',
    '--badge-text': isDark ? '#121212' : '#FFFFFF',
    '--recommended-cta-bg': isDark ? '#F7F7F5' : '#121212',
    '--recommended-cta-text': isDark ? '#121212' : '#FFFFFF',
    '--recommended-cta-border': isDark ? '#F7F7F5' : '#121212',
    '--heading-font': theme.headingFont,
    '--body-font': theme.bodyFont,
  };
}

function getDishCategoryId(dish) {
  return dish.categoryId || dish.category;
}

function hasDishModel(dish) {
  return Boolean(dish?.hasModel && dish?.model && getDishCategoryId(dish) !== 'drinks');
}

const FOOD_FILTER_OPTIONS = ['all', 'veg'];
const DRINK_FILTER_OPTIONS = ['all', 'alcoholic', 'non-alcoholic'];

function isSupportedLanguage(language) {
  return languages.some((item) => item.code === language);
}

function getSavedLanguage(keys, fallback = DEFAULT_LANGUAGE) {
  const saved = keys.map((key) => localStorage.getItem(key)).find(isSupportedLanguage);
  return saved || fallback;
}

function getFilterOptionsForCategory(categoryId) {
  if (categoryId === 'desserts') return [];
  if (categoryId === 'drinks') return DRINK_FILTER_OPTIONS;
  return FOOD_FILTER_OPTIONS;
}

function getDishFilterValue(dish) {
  if (getDishCategoryId(dish) === 'drinks') return dish.drinkType;
  return dish.type;
}

function getDishBadgeType(dish) {
  const categoryId = getDishCategoryId(dish);
  if (categoryId === 'desserts') return null;
  if (categoryId === 'drinks') return dish.drinkType || null;
  return dish.type === 'veg' ? 'veg' : null;
}

function getSelectionStorageKey(slug) {
  return `sufra-selection-${slug}`;
}

function normalizeSelection(selection) {
  if (!Array.isArray(selection)) return [];

  const quantitiesByDish = new Map();
  selection.forEach((item) => {
    const dishId = item?.dishId || item?.id;
    const quantity = Math.floor(Number(item?.quantity));
    if (!dishId || quantity < 1) return;
    quantitiesByDish.set(dishId, (quantitiesByDish.get(dishId) || 0) + quantity);
  });

  return Array.from(quantitiesByDish, ([dishId, quantity]) => ({ dishId, quantity }));
}

function readSelection(slug) {
  try {
    return normalizeSelection(JSON.parse(localStorage.getItem(getSelectionStorageKey(slug)) || '[]'));
  } catch {
    return [];
  }
}

function writeSelection(slug, selection) {
  localStorage.setItem(getSelectionStorageKey(slug), JSON.stringify(normalizeSelection(selection)));
}

function sanitizeSelectionForRestaurant(selection, restaurant) {
  const dishIds = new Set(restaurant.dishes.map((dish) => dish.id));
  return normalizeSelection(selection).filter((item) => dishIds.has(item.dishId));
}

function getSelectionItems(selection, restaurant) {
  return sanitizeSelectionForRestaurant(selection, restaurant)
    .map((item) => ({
      ...item,
      dish: restaurant.dishes.find((dish) => dish.id === item.dishId),
    }))
    .filter((item) => item.dish);
}

function getSelectionItemCount(selectionItems) {
  return selectionItems.reduce((total, item) => total + item.quantity, 0);
}

function getSelectionTotal(selectionItems) {
  return selectionItems.reduce((total, item) => total + item.dish.priceGEL * item.quantity, 0);
}

function getSelectionQuantity(selection, dishId) {
  return normalizeSelection(selection).find((item) => item.dishId === dishId)?.quantity || 0;
}

function setSelectionQuantity(selection, dishId, quantity) {
  const nextQuantity = Math.max(0, Math.floor(Number(quantity)));
  const withoutDish = normalizeSelection(selection).filter((item) => item.dishId !== dishId);
  return nextQuantity > 0 ? [...withoutDish, { dishId, quantity: nextQuantity }] : withoutDish;
}

function BadgeIcon({ size = 14, type }) {
  if (type === 'veg') return <Leaf size={size} />;
  if (type === 'alcoholic') return <Wine size={size} />;
  if (type === 'non-alcoholic') return <GlassWater size={size} />;
  return null;
}

function App() {
  const requestedLanguage = getParams().get('lang');
  const routeLanguage = isSupportedLanguage(requestedLanguage) ? requestedLanguage : null;
  const [siteLanguage, setSiteLanguage] = useState(() => routeLanguage || getSavedLanguage(['sufra-site-language', 'sufra-language']));
  const [menuLanguage, setMenuLanguage] = useState(() => routeLanguage || getSavedLanguage(['sufra-menu-language', 'sufra-language']));
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('sufra-theme') || 'light');
  const [menuTheme, setMenuTheme] = useState(() => localStorage.getItem('sufra-menu-theme') || 'dark');
  const [route, setRoute] = useState(() => getRouteFromPath());
  const activeRestaurant = findRestaurantBySlug(route.slug);
  const restaurant = activeRestaurant || defaultRestaurant;
  const [selection, setSelection] = useState(() => sanitizeSelectionForRestaurant(readSelection(restaurant.slug), restaurant));
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);

  useEffect(() => localStorage.setItem('sufra-site-language', siteLanguage), [siteLanguage]);
  useEffect(() => localStorage.setItem('sufra-menu-language', menuLanguage), [menuLanguage]);
  useEffect(() => localStorage.setItem('sufra-theme', themeMode), [themeMode]);
  useEffect(() => localStorage.setItem('sufra-menu-theme', menuTheme), [menuTheme]);

  useEffect(() => {
    setSelection(sanitizeSelectionForRestaurant(readSelection(restaurant.slug), restaurant));
    setIsSelectionOpen(false);
  }, [restaurant.slug]);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const requestedMenuLanguage = route.params.get('lang');
    if (isSupportedLanguage(requestedMenuLanguage)) {
      setMenuLanguage(requestedMenuLanguage);
      setSiteLanguage(requestedMenuLanguage);
    }
  }, [route]);

  const themeStyle = getThemeStyle(restaurant, themeMode);
  const activeDish = restaurant.dishes.find((dish) => dish.id === route.params.get('dish'));
  const isViewer = route.params.get('view') === 'viewer' && Boolean(activeDish);

  useEffect(() => {
    if (isViewer) scrollToTopInstant();
  }, [activeDish?.id, isViewer, route.slug]);

  function navigateToMenu(slug, query = {}, scrollMode = 'smooth') {
    const url = buildRestaurantUrl(slug, query);
    window.history.pushState({}, '', url);
    setRoute({ page: 'menu', slug, params: getParams() });
    if (scrollMode === 'instant') {
      scrollToTopInstant();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function openViewer(dish) {
    navigateToMenu(restaurant.slug, { dish: dish.id, view: 'viewer', lang: menuLanguage }, 'instant');
  }

  function backToMenu() {
    navigateToMenu(restaurant.slug, { lang: menuLanguage });
  }

  function updateSelection(updater) {
    setSelection((currentSelection) => {
      const nextSelection = sanitizeSelectionForRestaurant(updater(currentSelection), restaurant);
      writeSelection(restaurant.slug, nextSelection);
      return nextSelection;
    });
  }

  function addToSelection(dish) {
    incrementSelection(dish.id);
  }

  function incrementSelection(dishId) {
    updateSelection((currentSelection) => (
      setSelectionQuantity(currentSelection, dishId, getSelectionQuantity(currentSelection, dishId) + 1)
    ));
  }

  function decrementSelection(dishId) {
    updateSelection((currentSelection) => (
      setSelectionQuantity(currentSelection, dishId, getSelectionQuantity(currentSelection, dishId) - 1)
    ));
  }

  function removeFromSelection(dishId) {
    updateSelection((currentSelection) => setSelectionQuantity(currentSelection, dishId, 0));
  }

  function clearSelection() {
    writeSelection(restaurant.slug, []);
    setSelection([]);
  }

  const selectionItems = getSelectionItems(selection, restaurant);
  const selectionControls = {
    addToSelection,
    clearSelection,
    closeSelection: () => setIsSelectionOpen(false),
    decrementSelection,
    getQuantity: (dishId) => getSelectionQuantity(selection, dishId),
    incrementSelection,
    isOpen: isSelectionOpen,
    itemCount: getSelectionItemCount(selectionItems),
    items: selectionItems,
    openSelection: () => setIsSelectionOpen(true),
    removeFromSelection,
    total: getSelectionTotal(selectionItems),
  };

  if (!activeRestaurant && route.page === 'menu') {
    return <NotFoundPage language={siteLanguage} controls={{ language: siteLanguage, setLanguage: setSiteLanguage, themeMode, setThemeMode }} style={themeStyle} />;
  }

  const controls = { language: siteLanguage, setLanguage: setSiteLanguage, themeMode, setThemeMode };
  const menuControls = {
    language: menuLanguage,
    setLanguage: setMenuLanguage,
    themeMode: menuTheme,
    setThemeMode: setMenuTheme,
  };

  if (isViewer) {
    return (
      <ModelViewerPage
        dish={activeDish}
        language={menuLanguage}
        menuTheme={menuTheme}
        onBack={backToMenu}
        restaurant={restaurant}
        selectionControls={selectionControls}
        style={themeStyle}
      />
    );
  }

  if (route.page === 'pricing') return <PricingPage controls={controls} language={siteLanguage} style={themeStyle} />;
  if (route.page === 'about') return <AboutPage controls={controls} language={siteLanguage} style={themeStyle} />;
  if (route.page === 'menu') {
    return (
      <GuestMenuShell language={menuLanguage} menuTheme={menuTheme} style={themeStyle}>
        <MenuExperience
          controls={menuControls}
          language={menuLanguage}
          menuTheme={menuTheme}
          onDishSelect={openViewer}
          restaurant={restaurant}
          selectionControls={selectionControls}
        />
      </GuestMenuShell>
    );
  }

  return (
    <Shell controls={controls} language={siteLanguage} restaurant={restaurant} style={themeStyle}>
      <LandingPage language={siteLanguage} />
    </Shell>
  );
}

function Shell({ children, controls, language, restaurant, style }) {
  return (
    <div className="app-shell" style={style}>
      <SiteHeader controls={controls} language={language} restaurant={restaurant} />
      {children}
      <Footer language={language} restaurant={restaurant} />
    </div>
  );
}

function GuestMenuShell({ children, language, menuTheme, style }) {
  return (
    <div className={`guest-menu-shell menu-theme-${menuTheme}`} style={style}>
      {children}
      <MenuCreditFooter language={language} />
      <BackToTopButton language={language} />
    </div>
  );
}

function MenuCreditFooter({ language }) {
  return (
    <footer className="menu-credit-footer">
      <p>{t(language, 'powered')}</p>
    </footer>
  );
}

function BackToTopButton({ language }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const threshold = Math.min(640, Math.max(360, window.innerHeight * 0.65));
      setIsVisible(window.scrollY > threshold);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  return (
    <button
      aria-label={t(language, 'backToTop')}
      className={`back-to-top-button ${isVisible ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      type="button"
    >
      <ChevronUp size={20} />
    </button>
  );
}

function Logo({ language = DEFAULT_LANGUAGE }) {
  const slogan = text(brand.slogan, language);

  return (
    <span className="logo">
      <span className="logo-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <circle cx="24" cy="24" r="21" />
          <path d="M16 30.7c3.8 3.1 11.3 3.1 15.1 0 3-2.4 2.3-6.1-1.6-7.6l-8.9-3.5c-2.7-1.1-2.3-3.4.8-4.1 3.4-.8 7.2.1 9.6 2.1" />
          <path d="M15.6 33.8c4.9 4.1 14.2 4.1 19.1 0" />
        </svg>
      </span>
      <span className="logo-lockup">
        <span className="logo-text">{brand.name}</span>
        <span className="logo-slogan">{slogan}</span>
      </span>
    </span>
  );
}

function HeaderControls({ controls }) {
  return (
    <div className="header-controls">
      <label className="control-pill">
        <Globe size={14} />
        <select value={controls.language} onChange={(event) => controls.setLanguage(event.target.value)}>
          {languages.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <button
        className="icon-toggle"
        onClick={() => controls.setThemeMode(controls.themeMode === 'dark' ? 'light' : 'dark')}
        type="button"
        aria-label={t(controls.language, 'toggleColorMode')}
      >
        {controls.themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}

function SiteHeader({ controls, language, restaurant }) {
  return (
    <header className="site-header">
      <a className="brand" href={restaurant.slug === defaultRestaurantSlug ? '/' : buildRestaurantUrl(restaurant.slug)}>
        <Logo language={language || controls.language} />
      </a>
      <HeaderControls controls={controls} />
    </header>
  );
}

function LandingPage({ language }) {
  return (
    <main className="landing-page">
      <section className="product-hero">
        <img src={siteContent.hero.image} alt="" />
        <div className="product-hero-copy">
          <p className="eyebrow">{brand.name}</p>
          <h1>{t(language, 'heroTitle')}</h1>
          <p>{t(language, 'heroSubtitle')}</p>
          <div className="hero-actions">
            <a className="primary-link" href="#menu">{t(language, 'viewMenu')}</a>
            <a className="secondary-link" href="#pricing">{t(language, 'seePricing')}</a>
          </div>
        </div>
      </section>

      <ProductValueSection language={language} />

      <DemoQrSection language={language} />

      <PricingSection compact language={language} />
    </main>
  );
}

function DemoQrSection({ language }) {
  return (
    <section className="demo-qr-section" id="menu">
      <div className="section-heading">
        <p className="eyebrow">{t(language, 'menuLabel')}</p>
        <h2>{t(language, 'demoQrTitle')}</h2>
        <p>{t(language, 'demoQrBody')}</p>
      </div>
      <div className="demo-qr-panel">
        <div className="demo-qr-copy">
          <p>{t(language, 'demoQrSupport')}</p>
        </div>
        <div className="demo-qr-action">
          <div className="demo-qr-card">
            <DemoQrCode language={language} value={DEMO_MENU_QR_URL} />
          </div>
          <a className="primary-link demo-qr-button" href={buildRestaurantUrl(defaultRestaurantSlug)}>
            <span className="wipe-label" data-text={t(language, 'openDemoMenu')}>{t(language, 'openDemoMenu')}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function DemoQrCode({ language, value }) {
  const modules = useMemo(() => createQrModules(value), [value]);
  const quietZone = 4;
  const viewBoxSize = modules.length + (quietZone * 2);
  const modulePath = modules.flatMap((row, y) => (
    row.map((isDark, x) => (isDark ? `M${x + quietZone} ${y + quietZone}h1v1h-1z` : ''))
  )).join('');

  return (
    <svg
      aria-label={t(language, 'demoQrAria')}
      className="demo-qr-svg"
      role="img"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
    >
      <rect className="demo-qr-bg" height={viewBoxSize} width={viewBoxSize} />
      <path className="demo-qr-modules" d={modulePath} />
    </svg>
  );
}

function ProductValueSection({ language }) {
  return (
    <section className="value-section">
      <div className="section-heading">
        <p className="eyebrow">{t(language, 'productLabel')}</p>
        <h2>{t(language, 'productTitle')}</h2>
        <p>{t(language, 'productSubtitle')}</p>
      </div>
      <div className="value-grid">
        {tArray(language, 'productPoints').map((item) => (
          <article className="value-card" key={item}>
            <span />
            <p>{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PricingSection({ compact = false, language }) {
  const pricingGridRef = useRef(null);
  const hasSetInitialScroll = useRef(false);

  useEffect(() => {
    const grid = pricingGridRef.current;
    if (!grid || hasSetInitialScroll.current || !window.matchMedia('(max-width: 719px)').matches) return;

    const proCard = grid.querySelector('[data-plan-id="pro"]');
    if (!proCard) return;

    hasSetInitialScroll.current = true;
    requestAnimationFrame(() => {
      const left = proCard.offsetLeft - ((grid.clientWidth - proCard.clientWidth) / 2);
      grid.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
    });
  }, []);

  return (
    <section className={compact ? 'pricing-section compact' : 'pricing-section'} id="pricing">
      <div className="section-heading">
        <p className="eyebrow">{t(language, 'pricingLabel')}</p>
        <p>{t(language, 'pricingSubtitle')}</p>
      </div>
      <div className="pricing-carousel-shell">
        <p className="pricing-scroll-hint">{t(language, 'swipePlans')}</p>
        <div className="pricing-grid" ref={pricingGridRef}>
          {pricingPlans.map((plan) => (
            <article className={`pricing-card ${plan.badge ? 'recommended' : ''}`} data-plan-id={plan.id} key={plan.id}>
              {plan.badge && <span className="plan-badge">{t(language, 'pricingRecommended')}</span>}
              <h3>{getPlanTitle(plan, language)}</h3>
              <ul>
                {getPlanFeatures(plan, language).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="plan-bottom">
                <div className="plan-price">
                  <strong>{getPlanPrice(plan, language)}</strong>
                  {getPlanSetupNote(plan, language) && (
                    <span className="plan-setup-note">{getPlanSetupNote(plan, language)}</span>
                  )}
                </div>
                <a
                  className={plan.id === 'pro' ? 'primary-link' : 'secondary-link'}
                  href={demoRequestHref}
                >
                  {getPlanCta(plan, language)}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
      <p className="pricing-subscription-note">{t(language, 'pricingSubscriptionNote')}</p>
    </section>
  );
}

function MenuExperience({ controls, isPreview = false, language, menuTheme, onDishSelect, restaurant, selectionControls }) {
  const [activeCategoryId, setActiveCategoryId] = useState(restaurant.categories[0]?.id || '');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [query, setQuery] = useState('');
  const [pendingScrollCategoryId, setPendingScrollCategoryId] = useState('');
  const categorySectionRefs = useRef({});
  const selectionEnabled = Boolean(selectionControls);
  const selectionLabel = selectionControls?.itemCount > 0
    ? `${t(language, 'viewSelection')} · ${selectionControls.itemCount} ${t(language, selectionControls.itemCount === 1 ? 'item' : 'items')}`
    : t(language, 'mySelection');

  useEffect(() => {
    setActiveCategoryId(restaurant.categories[0]?.id || '');
    setFilter('all');
    setPendingScrollCategoryId('');
  }, [restaurant.slug]);

  const activeCategory = restaurant.categories.find((category) => category.id === activeCategoryId) || restaurant.categories[0];
  const filterOptions = getFilterOptionsForCategory(activeCategory?.id);
  const activeFilter = filterOptions.includes(filter) ? filter : 'all';
  const normalizedQuery = query.trim().toLowerCase();

  function dishMatchesMenuState(dish) {
    const matchesType = !filterOptions.length || activeFilter === 'all' || getDishFilterValue(dish) === activeFilter;
    const searchable = [
      text(dish.name, language),
      text(dish.name, 'en'),
      text(dish.description, language),
      text(dish.description, 'en'),
      ...(dish.ingredients || []).map((ingredient) => ingredient.name),
    ].join(' ').toLowerCase();
    return matchesType && searchable.includes(normalizedQuery);
  }

  const categorySections = useMemo(() => (
    restaurant.categories
      .map((category) => ({
        category,
        dishes: restaurant.dishes
          .filter((dish) => getDishCategoryId(dish) === category.id)
          .filter(dishMatchesMenuState),
      }))
      .filter((section) => section.dishes.length > 0)
  ), [activeFilter, language, normalizedQuery, restaurant.categories, restaurant.dishes]);
  const visibleCategoryIds = categorySections.map((section) => section.category.id).join('|');
  const hasVisibleDishes = categorySections.length > 0;

  useEffect(() => {
    if (!categorySections.length) return;
    if (categorySections.some((section) => section.category.id === activeCategoryId)) return;
    setActiveCategoryId(categorySections[0].category.id);
  }, [activeCategoryId, categorySections, visibleCategoryIds]);

  useEffect(() => {
    if (!pendingScrollCategoryId) return;

    const section = categorySectionRefs.current[pendingScrollCategoryId];
    if (!section) {
      setPendingScrollCategoryId('');
      return;
    }

    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingScrollCategoryId('');
    });
  }, [pendingScrollCategoryId, visibleCategoryIds]);

  useEffect(() => {
    if (!categorySections.length || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      const categoryId = visibleEntry?.target?.dataset?.categoryId;
      if (categoryId) setActiveCategoryId(categoryId);
    }, {
      root: null,
      rootMargin: '-22% 0px -58% 0px',
      threshold: [0.1, 0.35, 0.6],
    });

    categorySections.forEach(({ category }) => {
      const section = categorySectionRefs.current[category.id];
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [categorySections, visibleCategoryIds]);

  function chooseCategory(categoryId) {
    setActiveCategoryId(categoryId);
    setFilter('all');
    setPendingScrollCategoryId(categoryId);
  }

  function setCategorySectionRef(categoryId, node) {
    if (node) {
      categorySectionRefs.current[categoryId] = node;
    } else {
      delete categorySectionRefs.current[categoryId];
    }
  }

  return (
    <section className={`menu-app menu-theme-${menuTheme || controls.themeMode} ${isPreview ? 'preview' : ''}`}>
      <div className="menu-app-top">
        <Logo language={language} />
        <HeaderControls controls={controls} />
      </div>

      <RestaurantSchedule
        language={language}
        menuTheme={menuTheme || controls.themeMode}
        schedule={restaurant.schedule}
      />

      <div className="category-strip">
        <div className="category-rail-wrap">
          <div className="category-rail" aria-label={t(language, 'menuLabel')}>
            {restaurant.categories.map((category) => (
              <button
                className={category.id === activeCategory?.id ? 'active' : ''}
                key={category.id}
                onClick={() => chooseCategory(category.id)}
                type="button"
              >
                {text(category.label || category.name, language)}
              </button>
            ))}
          </div>
          <span className="category-swipe-indicator" aria-hidden="true" />
        </div>
      </div>

      <label className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(language, 'search')} />
      </label>

      <div className="menu-toolbar">
        <div className="toolbar-actions">
          {filterOptions.map((item) => (
            <button className={activeFilter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">
              <BadgeIcon type={item} />
              {t(language, item)}
            </button>
          ))}
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} type="button" aria-label={t(language, 'listView')}>
            <List size={15} />
          </button>
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} type="button" aria-label={t(language, 'gridView')}>
            <Grid size={15} />
          </button>
        </div>
      </div>

      <div className="menu-dishes">
        {categorySections.map(({ category, dishes }) => (
          <section
            className="menu-category-section"
            data-category-id={category.id}
            key={category.id}
            ref={(node) => setCategorySectionRef(category.id, node)}
          >
            <div className="menu-category-heading">
              <h2>{text(category.label || category.name, language)}</h2>
            </div>
            <div className={`menu-dish-list ${viewMode}`}>
              {dishes.map((dish) => (
                <DishCard
                  dish={dish}
                  key={dish.id}
                  language={language}
                  onDecrementSelection={selectionEnabled ? () => selectionControls.decrementSelection(dish.id) : null}
                  onDetails={() => onDishSelect(dish)}
                  onIncrementSelection={selectionEnabled ? () => selectionControls.addToSelection(dish) : null}
                  selectionQuantity={selectionEnabled ? selectionControls.getQuantity(dish.id) : 0}
                />
              ))}
            </div>
          </section>
        ))}
        {!hasVisibleDishes && (
          <div className="empty-menu-state">{t(language, 'moreDishes')}</div>
        )}
      </div>
      {selectionEnabled && selectionControls.itemCount > 0 && (
        <button className="selection-floating-button" onClick={selectionControls.openSelection} type="button">
          <ListChecks size={18} />
          <span>{selectionLabel}</span>
        </button>
      )}
      {selectionEnabled && selectionControls.isOpen && (
        <SelectionSheet
          language={language}
          menuTheme={menuTheme || controls.themeMode}
          onClear={selectionControls.clearSelection}
          onClose={selectionControls.closeSelection}
          onDecrement={selectionControls.decrementSelection}
          onIncrement={selectionControls.incrementSelection}
          onRemove={selectionControls.removeFromSelection}
          items={selectionControls.items}
          total={selectionControls.total}
        />
      )}
    </section>
  );
}

function RestaurantSchedule({ language, menuTheme, schedule }) {
  const [isOpen, setIsOpen] = useState(false);
  const days = schedule?.days || [];
  const status = text(schedule?.status, language);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!schedule || !status || !days.length) return null;

  return (
    <>
      <div className="schedule-banner">
        <div className="schedule-status">
          <span className="schedule-status-dot" aria-hidden="true" />
          <span>{status}</span>
        </div>
        <button onClick={() => setIsOpen(true)} type="button">
          {t(language, 'seeSchedule')}
        </button>
      </div>

      {isOpen && (
        <div className={`schedule-backdrop menu-theme-${menuTheme}`} role="presentation" onClick={() => setIsOpen(false)}>
          <section className="schedule-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-title" onClick={(event) => event.stopPropagation()}>
            <div className="schedule-modal-header">
              <h2 id="schedule-title">{t(language, 'workingHours')}</h2>
              <button aria-label={t(language, 'close')} className="sheet-icon-button" onClick={() => setIsOpen(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <div className="schedule-list">
              {days.map((item) => (
                <div className="schedule-row" key={text(item.day, 'en')}>
                  <span>{text(item.day, language)}</span>
                  <strong>{item.hours}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function TypeBadge({ language, type }) {
  if (!type) return null;

  return (
    <span className={`type-badge ${type}`}>
      <BadgeIcon type={type} />
      {t(language, type)}
    </span>
  );
}

function QuantityControls({ compact = false, language, onDecrease, onIncrease, quantity }) {
  return (
    <div className={`quantity-controls ${compact ? 'compact' : ''}`} aria-label={`${t(language, 'quantity')}: ${quantity}`}>
      <button aria-label={t(language, 'decreaseQuantity')} onClick={(event) => {
        event.stopPropagation();
        onDecrease();
      }} type="button">
        <Minus size={14} />
      </button>
      <span>{quantity}</span>
      <button aria-label={t(language, 'increaseQuantity')} onClick={(event) => {
        event.stopPropagation();
        onIncrease();
      }} type="button">
        <Plus size={14} />
      </button>
    </div>
  );
}

function SelectionDishControl({ addLabel, language, onDecrease, onIncrease, quantity }) {
  if (!onIncrease) return null;

  if (quantity > 0) {
    return (
      <QuantityControls
        language={language}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        quantity={quantity}
      />
    );
  }

  return (
    <button className="selection-add-button" onClick={(event) => {
      event.stopPropagation();
      onIncrease();
    }} type="button">
      <Bookmark size={14} />
      <span>{addLabel}</span>
    </button>
  );
}

function DishCard({ dish, language, onDecrementSelection, onDetails, onIncrementSelection, selectionQuantity = 0 }) {
  const badgeType = getDishBadgeType(dish);

  return (
    <article className="dish-card" onClick={onDetails}>
      <img src={dish.image} alt={text(dish.name, language)} />
      <div className="dish-content">
        <div className="dish-title-row">
          <h3>{text(dish.name, language)}</h3>
          <span>{formatPrice(dish.priceGEL)}</span>
        </div>
        <p>{text(dish.description, language)}</p>
        <div className={`dish-meta-row ${badgeType ? '' : 'no-badge'}`}>
          {badgeType && <TypeBadge language={language} type={badgeType} />}
          <div className="dish-card-actions">
            <SelectionDishControl
              addLabel={t(language, 'save')}
              language={language}
              onDecrease={onDecrementSelection}
              onIncrease={onIncrementSelection}
              quantity={selectionQuantity}
            />
            <button
              className="secondary-button"
              onClick={(event) => {
                event.stopPropagation();
                onDetails();
              }}
              type="button"
            >
              {t(language, 'details')}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function IngredientTags({ ingredients, language, onIngredientSelect, selectedIngredientName }) {
  return (
    <div className="ingredient-tags">
      {(ingredients || []).map((ingredient) => {
        const isActive = getIngredientKey(ingredient.name) === getIngredientKey(selectedIngredientName);
        if (onIngredientSelect) {
          return (
            <button
              aria-pressed={isActive}
              className={isActive ? 'active' : ''}
              key={ingredient.name}
              onClick={() => onIngredientSelect(ingredient.name)}
              type="button"
            >
              {translateIngredientName(ingredient.name, language)}
            </button>
          );
        }

        return <span key={ingredient.name}>{translateIngredientName(ingredient.name, language)}</span>;
      })}
    </div>
  );
}

function SelectionSheet({ items, language, menuTheme, onClear, onClose, onDecrement, onIncrement, onRemove, total }) {
  return (
    <div className={`selection-backdrop menu-theme-${menuTheme}`} role="presentation" onClick={onClose}>
      <section className="selection-sheet" role="dialog" aria-modal="true" aria-labelledby="selection-title" onClick={(event) => event.stopPropagation()}>
        <div className="selection-sheet-header">
          <div>
            <p className="eyebrow">{t(language, 'viewSelection')}</p>
            <h2 id="selection-title">{t(language, 'mySelection')}</h2>
          </div>
          <button aria-label={t(language, 'close')} className="sheet-icon-button" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {items.length > 0 ? (
          <div className="selection-list">
            {items.map(({ dish, dishId, quantity }) => (
              <article className="selection-item" key={dishId}>
                <img src={dish.image} alt={text(dish.name, language)} />
                <div className="selection-item-copy">
                  <h3>{text(dish.name, language)}</h3>
                  <p>{formatPrice(dish.priceGEL * quantity)}</p>
                </div>
                <QuantityControls
                  compact
                  language={language}
                  onDecrease={() => onDecrement(dishId)}
                  onIncrease={() => onIncrement(dishId)}
                  quantity={quantity}
                />
                <button className="selection-remove-button" onClick={() => onRemove(dishId)} type="button">
                  <Trash2 size={14} />
                  <span>{t(language, 'remove')}</span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="selection-empty">{t(language, 'emptySelection')}</p>
        )}

        <div className="selection-summary">
          <div>
            <span>{t(language, 'estimatedTotal')}</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <p>{t(language, 'selectionWaiterHint')}</p>
        </div>

        <div className="selection-sheet-actions">
          <button className="secondary-button" disabled={!items.length} onClick={onClear} type="button">
            <Trash2 size={15} />
            {t(language, 'clearSelection')}
          </button>
          <button className="primary-button" onClick={onClose} type="button">
            <span className="wipe-label" data-text={t(language, 'close')}>{t(language, 'close')}</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function IngredientInfoCard({ ingredient, language, onClose }) {
  if (!ingredient) return null;

  return (
    <aside className="ingredient-info-card" key={ingredient.name}>
      <button aria-label={t(language, 'close')} className="ingredient-info-close" onClick={onClose} type="button">
        <X size={14} />
      </button>
      <strong>{translateIngredientName(ingredient.name, language)}</strong>
      {ingredient.benefits.length > 0 && (
        <small>{ingredient.benefits.map((benefit) => translateIngredientBenefit(benefit, language)).join(' / ')}</small>
      )}
    </aside>
  );
}

function ModelViewerPage({ dish, language, menuTheme, onBack, restaurant, selectionControls, style }) {
  const modelViewerRef = useRef(null);
  const canShowModel = hasDishModel(dish);
  const [viewerMode, setViewerMode] = useState(() => (canShowModel ? '3d' : 'photo'));
  const [arPlatform] = useState(() => getArPlatform());
  const arModes = getArModesForPlatform(arPlatform);
  const platformScaleMultiplier = getPlatformScaleMultiplier(dish, arPlatform);
  const modelScale = getModelScaleForPlatform(dish, arPlatform);
  const [selectedIngredientName, setSelectedIngredientName] = useState(null);
  const ingredientInfos = getIngredientInfos(dish);
  const selectedIngredient = selectedIngredientName ? getIngredientInfo(dish, selectedIngredientName) : null;
  const selectionQuantity = selectionControls?.getQuantity(dish.id) || 0;
  const calories = formatCaloriesValue(dish.calories, language);

  useEffect(() => {
    setSelectedIngredientName(null);
    setViewerMode(canShowModel ? '3d' : 'photo');
  }, [canShowModel, dish.id]);

  useEffect(() => {
    if (canShowModel && viewerMode === '3d') {
      modelViewerRef.current?.setAttribute('scale', modelScale);
    }
  }, [canShowModel, modelScale, viewerMode]);

  const showModel = canShowModel && viewerMode === '3d';

  return (
    <div className={`viewer-shell menu-theme-${menuTheme}`} style={style}>
      <main className="viewer-page">
        <button className="back-button" onClick={onBack} type="button">{t(language, 'backToMenu')}</button>
        <section className="viewer-layout">
          {/* Base dish arScale is multiplied by optional platformScale values.
             Multipliers default to 1; iOS Quick Look may still use dimensions baked into the USDZ/GLB conversion. */}
          <div className="viewer-model-area">
            {canShowModel && (
              <div className="viewer-media-toggle" aria-label={t(language, 'viewerMediaToggle')} role="group">
                <button
                  className={viewerMode === 'photo' ? 'active' : ''}
                  onClick={() => setViewerMode('photo')}
                  type="button"
                >
                  {t(language, 'photo')}
                </button>
                <button
                  className={viewerMode === '3d' ? 'active' : ''}
                  onClick={() => setViewerMode('3d')}
                  type="button"
                >
                  {t(language, 'threeD')}
                </button>
              </div>
            )}
            {showModel ? (
              <model-viewer
                ref={modelViewerRef}
                alt={text(dish.name, language)}
                ar
                ar-modes={arModes}
                ar-placement={dish.arPlacement}
                ar-scale="fixed"
                auto-rotate
                camera-controls
                camera-orbit={dish.cameraOrbit}
                disable-zoom
                exposure="0.95"
                field-of-view={dish.fieldOfView}
                max-camera-orbit="auto 85deg auto"
                min-camera-orbit="auto 35deg auto"
                poster={dish.image}
                data-ar-platform={arPlatform}
                data-ar-scale={modelScale}
                data-platform-scale={platformScaleMultiplier}
                scale={modelScale}
                shadow-intensity="1"
                src={dish.model}
                touch-action="pan-y"
              >
                <button className="ar-button" slot="ar-button" type="button">
                  <span className="wipe-label" data-text={t(language, 'viewOnTable')}>{t(language, 'viewOnTable')}</span>
                </button>
              </model-viewer>
            ) : (
              <img className="viewer-photo" src={dish.image} alt={text(dish.name, language)} />
            )}
            <IngredientInfoCard
              ingredient={selectedIngredient}
              key={selectedIngredient?.name || 'empty-ingredient-info'}
              language={language}
              onClose={() => setSelectedIngredientName(null)}
            />
          </div>
          <div className="viewer-info-card">
            <div>
              <p className="eyebrow">{restaurant.brandName}</p>
              <h1>{text(dish.name, language)}</h1>
            </div>
            <p>{text(dish.description, language)}</p>
            {calories && (
              <div className="viewer-calories-row">
                <span>{t(language, 'calories')}</span>
                <strong>{calories}</strong>
              </div>
            )}
            <IngredientTags
              ingredients={ingredientInfos}
              language={language}
              onIngredientSelect={setSelectedIngredientName}
              selectedIngredientName={selectedIngredientName}
            />
            {selectionControls && (
              <div className="viewer-selection-row">
                <SelectionDishControl
                  addLabel={t(language, 'addToSelection')}
                  language={language}
                  onDecrease={() => selectionControls.decrementSelection(dish.id)}
                  onIncrease={() => selectionControls.addToSelection(dish)}
                  quantity={selectionQuantity}
                />
              </div>
            )}
            <div className="viewer-meta-row">
              <strong>{formatPrice(dish.priceGEL)}</strong>
              {canShowModel && <span>{t(language, 'modelHint')}</span>}
            </div>
          </div>
        </section>
      </main>
      <MenuCreditFooter language={language} />
      <BackToTopButton language={language} />
    </div>
  );
}

function PricingPage({ controls, language, style }) {
  return (
    <Shell controls={controls} language={language} restaurant={defaultRestaurant} style={style}>
      <main className="page-content">
        <PricingSection language={language} />
      </main>
    </Shell>
  );
}

function AboutPage({ controls, language, style }) {
  return (
    <Shell controls={controls} language={language} restaurant={defaultRestaurant} style={style}>
      <main className="page-content">
        <InfoPage
          title={t(language, 'aboutTitle')}
          paragraphs={tArray(language, 'aboutParagraphs')}
          eyebrow={t(language, 'aboutLabel')}
          variant="about"
        />
      </main>
    </Shell>
  );
}

function InfoPage({ children, eyebrow, paragraphs, title, variant }) {
  const className = variant ? `info-page ${variant}-page` : 'info-page';

  return (
    <section className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="section-copy">
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      {children}
    </section>
  );
}

function NotFoundPage({ controls, language, style }) {
  return (
    <Shell controls={controls} language={language} restaurant={defaultRestaurant} style={style}>
      <main className="empty-state">
        <h1>{t(language, 'notFound')}</h1>
        <a className="primary-link" href="/">{t(language, 'home')}</a>
      </main>
    </Shell>
  );
}

function FooterContactIcon({ kind }) {
  if (kind === 'email') return <Mail size={16} />;
  if (kind === 'instagram') return <span className="social-glyph">IG</span>;
  if (kind === 'tiktok') return <Music2 size={16} />;
  if (kind === 'facebook') return <ExternalLink size={16} />;
  if (kind === 'whatsapp') return <Phone size={16} />;
  return null;
}

function Footer({ language, restaurant }) {
  const footerContacts = [
    { key: 'email', href: 'mailto:' + brand.email, label: brand.email, ariaLabel: t(language, 'email') + ': ' + brand.email },
    { key: 'instagram', href: brand.instagramUrl, label: brand.instagramHandle, ariaLabel: t(language, 'instagram') + ': ' + brand.instagramHandle, external: true },
    { key: 'tiktok', href: brand.tiktokUrl, label: brand.tiktokHandle, ariaLabel: 'TikTok: ' + brand.tiktokHandle, external: true },
    { key: 'facebook', href: brand.facebookUrl, label: brand.facebookLabel, ariaLabel: brand.facebookLabel, external: true },
    { key: 'whatsapp', href: brand.whatsappUrl, label: `${t(language, 'whatsapp')}: ${brand.phoneDisplay}`, ariaLabel: `${t(language, 'whatsapp')}: ${brand.phoneDisplay}`, external: true },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo language={language} />
          <p>{t(language, 'footerDescription')}</p>
        </div>
        <nav className="footer-nav" aria-label={t(language, 'footerNavigation')}>
          <a href="/">{t(language, 'home')}</a>
          <a href="/about">{t(language, 'about')}</a>
        </nav>
        <div className="footer-contact">
          <p className="footer-section-label">{t(language, 'contact')}</p>
          {footerContacts.map((item) => (
            <a
              aria-label={item.ariaLabel}
              href={item.href}
              key={item.key}
              rel={item.external ? 'noreferrer' : undefined}
              target={item.external ? '_blank' : undefined}
            >
              <FooterContactIcon kind={item.key} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
      <p className="powered">{t(language, 'powered')}</p>
    </footer>
  );
}

export default App;

