import { useEffect, useRef, useState } from 'react';
import {
  Beef,
  CircleDollarSign,
  ExternalLink,
  Flame,
  GlassWater,
  Globe,
  Grid,
  Leaf,
  List,
  Mail,
  Moon,
  Music2,
  Search,
  Sun,
  Wine,
} from 'lucide-react';
import { brand } from './data/brand.js';
import { currencies, defaultCurrencyCode, formatPrice } from './data/currencies.js';
import { pricingPlans } from './data/plans.js';
import { siteContent } from './data/siteContent.js';
import { getTranslation, translations } from './data/translations.js';
import {
  defaultRestaurant,
  defaultRestaurantSlug,
  findRestaurantBySlug,
  languages,
} from './data/restaurants/index.js';

const demoRequestHref = `mailto:${brand.email}?subject=Sufra%20AR%20Demo%20Request`;
const customPlanHref = `mailto:${brand.email}?subject=Sufra%20AR%20Custom%20Plan%20Inquiry`;
const inquiryHref = `mailto:${brand.email}?subject=Sufra%20AR%20Inquiry`;

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
    vip: 'pricingVip',
    custom: 'pricingCustom',
  };
  return t(language, titleKeys[plan.id]) || plan.title;
}

function getPlanFeatures(plan, language) {
  const featureKeys = {
    basic: 'pricingBasicFeatures',
    pro: 'pricingProFeatures',
    vip: 'pricingVipFeatures',
    custom: 'pricingCustomFeatures',
  };
  const translatedFeatures = tArray(language, featureKeys[plan.id]);
  return translatedFeatures.length ? translatedFeatures : plan.features;
}

function getPlanPrice(plan, language) {
  if (plan.id === 'custom') return t(language, 'pricingCustomPrice');
  return `${plan.price.split(' / ')[0]} / ${t(language, 'pricingMonth')}`;
}

function translateIngredientName(name, language) {
  return translations[language]?.ingredientNames?.[name] ?? translations.en.ingredientNames?.[name] ?? name;
}

function translateIngredientBenefit(benefit, language) {
  return translations[language]?.ingredientBenefits?.[benefit] ?? translations.en.ingredientBenefits?.[benefit] ?? benefit;
}

function text(value, language) {
  if (Array.isArray(value)) return value;
  return value?.[language] || value?.en || '';
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function getRouteFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const staticPages = ['about', 'contact', 'pricing', 'experience'];
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
    '--experience-cta-bg': isDark ? '#F7F7F5' : '#FFFFFF',
    '--experience-cta-text': '#121212',
    '--experience-cta-border': isDark ? '#F7F7F5' : '#CFCFC8',
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

const FOOD_FILTER_OPTIONS = ['all', 'veg', 'meat'];
const DRINK_FILTER_OPTIONS = ['all', 'alcoholic', 'non-alcoholic'];

function isSupportedLanguage(language) {
  return languages.some((item) => item.code === language);
}

function isSupportedCurrency(currencyCode) {
  return currencies.some((item) => item.code === currencyCode);
}

function getSavedLanguage(keys, fallback = 'en') {
  const saved = keys.map((key) => localStorage.getItem(key)).find(isSupportedLanguage);
  return saved || fallback;
}

function getSavedCurrency(keys, fallback = defaultCurrencyCode) {
  const saved = keys.map((key) => localStorage.getItem(key)).find(isSupportedCurrency);
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
  return dish.type || null;
}

function BadgeIcon({ size = 14, type }) {
  if (type === 'veg') return <Leaf size={size} />;
  if (type === 'meat') return <Beef size={size} />;
  if (type === 'alcoholic') return <Wine size={size} />;
  if (type === 'non-alcoholic') return <GlassWater size={size} />;
  return null;
}

function App() {
  const requestedLanguage = getParams().get('lang');
  const routeLanguage = isSupportedLanguage(requestedLanguage) ? requestedLanguage : null;
  const [siteLanguage, setSiteLanguage] = useState(() => getSavedLanguage(['sufra-site-language', 'sufra-language']));
  const [menuLanguage, setMenuLanguage] = useState(() => routeLanguage || getSavedLanguage(['sufra-menu-language', 'sufra-language']));
  const [siteCurrency, setSiteCurrency] = useState(() => getSavedCurrency(['sufra-site-currency', 'sufra-currency']));
  const [menuCurrency, setMenuCurrency] = useState(() => getSavedCurrency(['sufra-menu-currency', 'sufra-currency']));
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('sufra-theme') || 'light');
  const [menuTheme, setMenuTheme] = useState(() => localStorage.getItem('sufra-menu-theme') || 'dark');
  const [route, setRoute] = useState(() => getRouteFromPath());
  const [selectedDish, setSelectedDish] = useState(null);

  useEffect(() => localStorage.setItem('sufra-site-language', siteLanguage), [siteLanguage]);
  useEffect(() => localStorage.setItem('sufra-menu-language', menuLanguage), [menuLanguage]);
  useEffect(() => localStorage.setItem('sufra-site-currency', siteCurrency), [siteCurrency]);
  useEffect(() => localStorage.setItem('sufra-menu-currency', menuCurrency), [menuCurrency]);
  useEffect(() => localStorage.setItem('sufra-theme', themeMode), [themeMode]);
  useEffect(() => localStorage.setItem('sufra-menu-theme', menuTheme), [menuTheme]);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedDish(null);
      setRoute(getRouteFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const requestedMenuLanguage = route.params.get('lang');
    if (isSupportedLanguage(requestedMenuLanguage)) setMenuLanguage(requestedMenuLanguage);
  }, [route]);

  const activeRestaurant = findRestaurantBySlug(route.slug);
  const restaurant = activeRestaurant || defaultRestaurant;
  const themeStyle = getThemeStyle(restaurant, themeMode);
  const activeDish = restaurant.dishes.find((dish) => dish.id === route.params.get('dish'));
  const isViewer = route.params.get('view') === 'viewer' && activeDish;

  function navigateToMenu(slug, query = {}) {
    const url = buildRestaurantUrl(slug, query);
    window.history.pushState({}, '', url);
    setRoute({ page: 'menu', slug, params: getParams() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openViewer(dish) {
    setSelectedDish(null);
    navigateToMenu(restaurant.slug, { dish: dish.id, view: 'viewer', lang: menuLanguage });
  }

  function backToMenu() {
    setSelectedDish(null);
    navigateToMenu(restaurant.slug, { lang: menuLanguage });
  }

  if (!activeRestaurant && route.page === 'menu') {
    return <NotFoundPage language={siteLanguage} controls={{ language: siteLanguage, setLanguage: setSiteLanguage, currency: siteCurrency, setCurrency: setSiteCurrency, themeMode, setThemeMode }} style={themeStyle} />;
  }

  const controls = { language: siteLanguage, setLanguage: setSiteLanguage, currency: siteCurrency, setCurrency: setSiteCurrency, themeMode, setThemeMode };
  const menuControls = {
    language: menuLanguage,
    setLanguage: setMenuLanguage,
    currency: menuCurrency,
    setCurrency: setMenuCurrency,
    themeMode: menuTheme,
    setThemeMode: setMenuTheme,
  };

  if (isViewer) {
    return (
      <ModelViewerPage
        controls={menuControls}
        currency={menuCurrency}
        dish={activeDish}
        language={menuLanguage}
        menuTheme={menuTheme}
        onBack={backToMenu}
        restaurant={restaurant}
        style={themeStyle}
      />
    );
  }

  if (route.page === 'pricing') return <PricingPage controls={controls} language={siteLanguage} style={themeStyle} />;
  if (route.page === 'experience') return <ExperiencePage controls={controls} language={siteLanguage} style={themeStyle} />;
  if (route.page === 'about') return <AboutPage controls={controls} language={siteLanguage} style={themeStyle} />;
  if (route.page === 'contact') return <ContactPage controls={controls} language={siteLanguage} style={themeStyle} />;

  if (route.page === 'menu') {
    return (
      <Shell controls={controls} language={siteLanguage} restaurant={restaurant} style={themeStyle}>
        <MenuExperience
          controls={menuControls}
          currency={menuCurrency}
          language={menuLanguage}
          menuTheme={menuTheme}
          onDishSelect={setSelectedDish}
          restaurant={restaurant}
        />
        {selectedDish && (
          <DishModal
            currency={menuCurrency}
            dish={selectedDish}
            language={menuLanguage}
            menuTheme={menuTheme}
            onClose={() => setSelectedDish(null)}
            onViewer={() => openViewer(selectedDish)}
            restaurant={restaurant}
          />
        )}
      </Shell>
    );
  }

  return (
    <Shell controls={controls} language={siteLanguage} restaurant={restaurant} style={themeStyle}>
      <LandingPage
        menuCurrency={menuCurrency}
        menuLanguage={menuLanguage}
        language={siteLanguage}
        menuControls={menuControls}
        menuTheme={menuTheme}
        onDishSelect={setSelectedDish}
        restaurant={restaurant}
      />
      {selectedDish && (
        <DishModal
          currency={menuCurrency}
          dish={selectedDish}
          language={menuLanguage}
          menuTheme={menuTheme}
          onClose={() => setSelectedDish(null)}
          onViewer={() => openViewer(selectedDish)}
          restaurant={restaurant}
        />
      )}
    </Shell>
  );
}

function Shell({ children, controls, language, restaurant, style }) {
  return (
    <div className="app-shell" style={style}>
      <SiteHeader controls={controls} restaurant={restaurant} />
      {children}
      <Footer language={language} restaurant={restaurant} />
    </div>
  );
}

function Logo() {
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
        <span className="logo-slogan">{brand.slogan}</span>
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
      <label className="control-pill">
        <CircleDollarSign size={14} />
        <select value={controls.currency} onChange={(event) => controls.setCurrency(event.target.value)}>
          {currencies.map((item) => (
            <option key={item.code} value={item.code}>
              {item.symbol} {item.label}
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

function SiteHeader({ controls, restaurant }) {
  return (
    <header className="site-header">
      <a className="brand" href={restaurant.slug === defaultRestaurantSlug ? '/' : buildRestaurantUrl(restaurant.slug)}>
        <Logo />
      </a>
      <HeaderControls controls={controls} />
    </header>
  );
}

function LandingPage({ language, menuControls, menuCurrency, menuLanguage, menuTheme, onDishSelect, restaurant }) {
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
            <a className="secondary-link" href="/pricing">{t(language, 'seePricing')}</a>
          </div>
        </div>
      </section>

      <ProductValueSection language={language} />

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <p className="eyebrow">{t(language, 'menuLabel')}</p>
          <h2>{t(language, 'menuTitle')}</h2>
          <p>{t(language, 'menuSubtitle')}</p>
        </div>
        <MenuExperience
          controls={menuControls}
          currency={menuCurrency}
          isPreview
          language={menuLanguage}
          menuTheme={menuTheme}
          onDishSelect={onDishSelect}
          restaurant={restaurant}
        />
      </section>

      <ExperiencePreview language={language} />
      <PricingSection compact language={language} />
    </main>
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
  return (
    <section className={compact ? 'pricing-section compact' : 'pricing-section'}>
      <div className="section-heading">
        <p className="eyebrow">{t(language, 'pricingLabel')}</p>
        <p>{t(language, 'pricingSubtitle')}</p>
      </div>
      <div className="pricing-carousel-shell">
        <p className="pricing-scroll-hint">{t(language, 'swipePlans')}</p>
        <div className="pricing-grid">
          {pricingPlans.map((plan) => (
            <article className={`pricing-card ${plan.badge ? 'recommended' : ''}`} key={plan.id}>
              {plan.badge && <span className="plan-badge">{t(language, 'pricingRecommended')}</span>}
              <h3>{getPlanTitle(plan, language)}</h3>
              <ul>
                {getPlanFeatures(plan, language).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="plan-bottom">
                <strong>{getPlanPrice(plan, language)}</strong>
                <a
                  className={plan.id === 'pro' ? 'primary-link' : 'secondary-link'}
                  href={plan.id === 'custom' ? customPlanHref : demoRequestHref}
                >
                  {plan.id === 'custom' ? t(language, 'contactSales') : t(language, 'getStarted')}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperiencePreview({ language }) {
  return (
    <section className="experience-preview">
      <p className="eyebrow">{t(language, 'experienceLabel')}</p>
      <h2>{t(language, 'experienceTitle')}</h2>
      <p>{t(language, 'experienceSubtitle')}</p>
      <a className="secondary-link" href="/experience">{t(language, 'learnExperience')}</a>
    </section>
  );
}

function MenuExperience({ controls, currency, isPreview = false, language, menuTheme, onDishSelect, restaurant }) {
  const [activeCategoryId, setActiveCategoryId] = useState(restaurant.categories[0]?.id || '');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setActiveCategoryId(restaurant.categories[0]?.id || '');
    setFilter('all');
  }, [restaurant.slug]);

  const activeCategory = restaurant.categories.find((category) => category.id === activeCategoryId) || restaurant.categories[0];
  const filterOptions = getFilterOptionsForCategory(activeCategory?.id);
  const filteredDishes = restaurant.dishes.filter((dish) => {
    const matchesCategory = getDishCategoryId(dish) === activeCategory?.id;
    const matchesType = !filterOptions.length || filter === 'all' || getDishFilterValue(dish) === filter;
    const searchable = [
      text(dish.name, language),
      text(dish.description, language),
      ...(dish.ingredients || []).map((ingredient) => ingredient.name),
    ].join(' ').toLowerCase();
    return matchesCategory && matchesType && searchable.includes(query.toLowerCase());
  });

  function chooseCategory(categoryId) {
    setActiveCategoryId(categoryId);
    setFilter('all');
  }

  return (
    <section className={`menu-app menu-theme-${menuTheme || controls.themeMode} ${isPreview ? 'preview' : ''}`}>
      <div className="menu-app-top">
        <Logo />
        <HeaderControls controls={controls} />
      </div>
      <p className="menu-restaurant-label">{text(restaurant.restaurantName, language)}</p>

      <div className="category-strip">
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
        <span className="category-scroll-hint">{t(language, 'swipeCategories')}</span>
      </div>

      <label className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(language, 'search')} />
      </label>

      <div className="menu-toolbar">
        <div>
          <p className="eyebrow">{t(language, 'category')}</p>
          <h2>{text(activeCategory?.label || activeCategory?.name, language)}</h2>
        </div>
        <div className="toolbar-actions">
          {filterOptions.map((item) => (
            <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">
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

      <div className={`menu-dishes ${viewMode}`}>
        {filteredDishes.map((dish) => (
          <DishCard
            currency={currency}
            dish={dish}
            key={dish.id}
            language={language}
            onDetails={() => onDishSelect(dish)}
            restaurant={restaurant}
          />
        ))}
        {!filteredDishes.length && (
          <div className="empty-menu-state">{t(language, 'moreDishes')}</div>
        )}
      </div>
    </section>
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

function DishCard({ currency, dish, language, onDetails }) {
  const badgeType = getDishBadgeType(dish);

  return (
    <article className="dish-card" onClick={onDetails}>
      <img src={dish.image} alt={text(dish.name, language)} />
      <div className="dish-content">
        <div className="dish-title-row">
          <h3>{text(dish.name, language)}</h3>
          <span>{formatPrice(dish.priceGEL, currency)}</span>
        </div>
        <p>{text(dish.description, language)}</p>
        <div className={`dish-meta-row ${badgeType ? '' : 'no-badge'}`}>
          {badgeType && <TypeBadge language={language} type={badgeType} />}
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
    </article>
  );
}

function IngredientTags({ ingredients, language }) {
  return (
    <div className="ingredient-tags">
      {(ingredients || []).map((ingredient) => (
        <span key={ingredient.name}>{translateIngredientName(ingredient.name, language)}</span>
      ))}
    </div>
  );
}

function DishModal({ currency, dish, language, menuTheme, onClose, onViewer }) {
  const badgeType = getDishBadgeType(dish);

  return (
    <div className={`modal-backdrop menu-theme-${menuTheme}`} role="presentation" onClick={onClose}>
      <section className="dish-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <img src={dish.image} alt={text(dish.name, language)} />
        <div>
          <div className="dish-title-row">
            <h2>{text(dish.name, language)}</h2>
            <span>{formatPrice(dish.priceGEL, currency)}</span>
          </div>
          {badgeType && <TypeBadge language={language} type={badgeType} />}
          <p>{text(dish.description, language)}</p>
          <IngredientTags ingredients={dish.ingredients} language={language} />
          <div className="dish-actions">
            <button className="secondary-button" onClick={onClose} type="button">{t(language, 'backToMenu')}</button>
            <button className="primary-button" onClick={onViewer} type="button">
              <span className="wipe-label" data-text={t(language, 'viewOnTable')}>{t(language, 'viewOnTable')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ModelViewerPage({ controls, currency, dish, language, menuTheme, onBack, restaurant, style }) {
  const modelViewerRef = useRef(null);
  const modelScale = dish.arScale || '0.25 0.25 0.25';
  const [showHotspots, setShowHotspots] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHotspots(true), 2400);
    return () => window.clearTimeout(timer);
  }, [dish.id]);

  useEffect(() => {
    modelViewerRef.current?.setAttribute('scale', modelScale);
  }, [modelScale]);

  return (
    <div className={`viewer-shell menu-theme-${menuTheme}`} style={style}>
      <SiteHeader controls={controls} restaurant={restaurant} />
      <main className="viewer-page">
        <button className="back-button" onClick={onBack} type="button">{t(language, 'backToMenu')}</button>
        <section className="viewer-layout">
          {/* The scale value controls the model-viewer preview plus WebXR/Scene Viewer AR.
             iOS Quick Look may ignore this and use dimensions baked into the USDZ/GLB conversion. */}
          <model-viewer
            ref={modelViewerRef}
            alt={text(dish.name, language)}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement={dish.arPlacement}
            ar-scale="fixed"
            auto-rotate
            camera-controls
            camera-orbit={dish.cameraOrbit}
            disable-zoom
            exposure="0.95"
            field-of-view={dish.fieldOfView}
            poster={dish.image}
            data-ar-scale={modelScale}
            scale={modelScale}
            shadow-intensity="1"
            src={dish.model}
            touch-action="pan-y"
          >
            {showHotspots && (dish.ingredientHotspots || []).map((hotspot) => (
              <button
                className="ingredient-hotspot"
                key={hotspot.id}
                slot={`hotspot-${hotspot.id}`}
                data-position={hotspot.position}
                data-normal={hotspot.normal}
                type="button"
              >
                <span>{translateIngredientName(hotspot.name, language)}</span>
                <small>{hotspot.benefits.map((benefit) => translateIngredientBenefit(benefit, language)).join(' / ')}</small>
              </button>
            ))}
            <button className="ar-button" slot="ar-button" type="button">
              <span className="wipe-label" data-text={t(language, 'viewOnTable')}>{t(language, 'viewOnTable')}</span>
            </button>
          </model-viewer>
          <div className="viewer-info-card">
            <div>
              <p className="eyebrow">{restaurant.brandName}</p>
              <h1>{text(dish.name, language)}</h1>
            </div>
            <p>{text(dish.description, language)}</p>
            <IngredientTags ingredients={dish.ingredients} language={language} />
            <div className="viewer-meta-row">
              <strong>{formatPrice(dish.priceGEL, currency)}</strong>
              <span>{dish.hasModel === false ? t(language, 'placeholderModel') : t(language, 'modelHint')}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer language={language} restaurant={restaurant} />
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

function ExperiencePage({ controls, language, style }) {
  return (
    <Shell controls={controls} language={language} restaurant={defaultRestaurant} style={style}>
      <main className="page-content">
        <section className="experience-page">
          <p className="eyebrow">{t(language, 'experienceLabel')}</p>
          <h1>{t(language, 'experienceTitle')}</h1>
          <p>{t(language, 'experienceSubtitle')}</p>
          <div className="experience-list">
            {tArray(language, 'experienceFeatures').map((item) => (
              <span key={item}><Flame size={16} />{item}</span>
            ))}
          </div>
          <div className="contact-actions centered">
            <a className="primary-link" href={inquiryHref}>{t(language, 'emailUs')}</a>
            <a className="secondary-link" href={brand.instagramUrl} rel="noreferrer" target="_blank">
              {brand.instagramHandle}
            </a>
          </div>
        </section>
      </main>
    </Shell>
  );
}

function AboutPage({ controls, language, style }) {
  return (
    <Shell controls={controls} language={language} restaurant={defaultRestaurant} style={style}>
      <main className="page-content">
        <InfoPage title={t(language, 'aboutTitle')} paragraphs={tArray(language, 'aboutParagraphs')} eyebrow={t(language, 'aboutLabel')} />
      </main>
    </Shell>
  );
}

function ContactPage({ controls, language, style }) {
  return (
    <Shell controls={controls} language={language} restaurant={defaultRestaurant} style={style}>
      <main className="page-content">
        <InfoPage title={t(language, 'contactTitle')} paragraphs={[t(language, 'contactText')]} eyebrow={t(language, 'contactLabel')}>
          <div className="contact-actions">
            <a className="primary-link" href={`mailto:${brand.email}`}>
              {t(language, 'email')}: {brand.email}
            </a>
            <a className="secondary-link" href={brand.instagramUrl} rel="noreferrer" target="_blank">
              {t(language, 'instagram')}: {brand.instagramHandle}
            </a>
          </div>
        </InfoPage>
      </main>
    </Shell>
  );
}

function InfoPage({ children, eyebrow, paragraphs, title }) {
  return (
    <section className="info-page">
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
  return null;
}

function Footer({ language, restaurant }) {
  const footerContacts = [
    { key: 'email', href: 'mailto:' + brand.email, label: brand.email, ariaLabel: t(language, 'email') + ': ' + brand.email },
    { key: 'instagram', href: brand.instagramUrl, label: brand.instagramHandle, ariaLabel: t(language, 'instagram') + ': ' + brand.instagramHandle, external: true },
    { key: 'tiktok', href: brand.tiktokUrl, label: brand.tiktokHandle, ariaLabel: 'TikTok: ' + brand.tiktokHandle, external: true },
    { key: 'facebook', href: brand.facebookUrl, label: brand.facebookLabel, ariaLabel: brand.facebookLabel, external: true },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo />
          <p>{t(language, 'footerDescription')}</p>
        </div>
        <nav className="footer-nav" aria-label={t(language, 'footerNavigation')}>
          <a href="/">{t(language, 'home')}</a>
          <a href="/about">{t(language, 'about')}</a>
          <a href="/contact">{t(language, 'contact')}</a>
        </nav>
        <div className="footer-contact">
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

