import { useEffect, useRef, useState } from 'react';
import {
  Beef,
  CircleDollarSign,
  Flame,
  Globe,
  Grid,
  Leaf,
  List,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { brand } from './data/brand.js';
import { currencies, defaultCurrencyCode, formatPrice } from './data/currencies.js';
import { pricingPlans } from './data/plans.js';
import { siteContent } from './data/siteContent.js';
import {
  defaultRestaurant,
  defaultRestaurantSlug,
  findRestaurantBySlug,
  languages,
} from './data/restaurants/index.js';

const ui = {
  en: {
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    pricing: 'Pricing',
    experience: 'Experience',
    email: 'Email',
    instagram: 'Instagram',
    comingSoon: 'Coming soon',
    viewMenu: 'View menu',
    seePricing: 'See pricing',
    learnExperience: 'Learn about the experience',
    getStarted: 'Get started',
    contactSales: 'Contact sales',
    emailUs: 'Email us',
    search: 'Search dishes...',
    swipeCategories: 'Swipe categories',
    moreDishes: 'More dishes coming soon.',
    all: 'All',
    veg: 'Veg',
    meat: 'Meat',
    details: 'Details',
    viewOnTable: 'View on your table',
    backToMenu: 'Back to menu',
    powered: 'Powered by Sufra AR',
    notFound: 'Restaurant not found',
    modelHint: 'Rotate the dish. AR scale is fixed for a realistic table preview.',
  },
  ka: {
    home: 'მთავარი',
    about: 'შესახებ',
    contact: 'კონტაქტი',
    pricing: 'ფასები',
    experience: 'გამოცდილება',
    email: 'ელფოსტა',
    instagram: 'Instagram',
    comingSoon: 'მალე',
    viewMenu: 'View menu',
    seePricing: 'ფასების ნახვა',
    learnExperience: 'გამოცდილების ნახვა',
    getStarted: 'Get started',
    contactSales: 'დაკავშირება',
    emailUs: 'Email us',
    search: 'Search dishes...',
    swipeCategories: 'Swipe categories',
    moreDishes: 'More dishes coming soon.',
    all: 'All',
    veg: 'Veg',
    meat: 'Meat',
    details: 'დეტალები',
    viewOnTable: 'მაგიდაზე ნახვა',
    backToMenu: 'მენიუში დაბრუნება',
    powered: 'Powered by Sufra AR',
    notFound: 'რესტორანი ვერ მოიძებნა',
    modelHint: 'დაატრიალეთ კერძი. AR მასშტაბი ფიქსირებულია რეალისტური ხედისთვის.',
  },
  ru: {
    home: 'Главная',
    about: 'О нас',
    contact: 'Контакт',
    pricing: 'Цены',
    experience: 'Опыт',
    email: 'Email',
    instagram: 'Instagram',
    comingSoon: 'Скоро',
    viewMenu: 'View menu',
    seePricing: 'Смотреть цены',
    learnExperience: 'Об опыте',
    getStarted: 'Get started',
    contactSales: 'Связаться',
    emailUs: 'Email us',
    search: 'Search dishes...',
    swipeCategories: 'Swipe categories',
    moreDishes: 'More dishes coming soon.',
    all: 'All',
    veg: 'Veg',
    meat: 'Meat',
    details: 'Детали',
    viewOnTable: 'Посмотреть на столе',
    backToMenu: 'Назад к меню',
    powered: 'Powered by Sufra AR',
    notFound: 'Ресторан не найден',
    modelHint: 'Поверните блюдо. AR масштаб фиксирован для реалистичного просмотра.',
  },
};

const demoRequestHref = `mailto:${brand.email}?subject=Sufra%20AR%20Demo%20Request`;
const customPlanHref = `mailto:${brand.email}?subject=Sufra%20AR%20Custom%20Plan%20Inquiry`;

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

  if (!path) return { page: 'home', slug: defaultRestaurantSlug, params: getParams() };
  if (staticPages.includes(path)) return { page: path, slug: defaultRestaurantSlug, params: getParams() };
  return { page: 'menu', slug: path, params: getParams() };
}

function getRestaurantPath(slug) {
  return slug === defaultRestaurantSlug ? '/sufra-old-town' : `/${slug}`;
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

function App() {
  const [language, setLanguage] = useState(() => {
    const requestedLanguage = getParams().get('lang');
    if (languages.some((item) => item.code === requestedLanguage)) return requestedLanguage;
    return localStorage.getItem('sufra-language') || 'en';
  });
  const [currency, setCurrency] = useState(() => localStorage.getItem('sufra-currency') || defaultCurrencyCode);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('sufra-theme') || 'light');
  const [menuTheme, setMenuTheme] = useState(() => localStorage.getItem('sufra-menu-theme') || 'dark');
  const [route, setRoute] = useState(() => getRouteFromPath());
  const [selectedDish, setSelectedDish] = useState(null);

  useEffect(() => localStorage.setItem('sufra-language', language), [language]);
  useEffect(() => localStorage.setItem('sufra-currency', currency), [currency]);
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
    navigateToMenu(restaurant.slug, { dish: dish.id, view: 'viewer', lang: language });
  }

  function backToMenu() {
    setSelectedDish(null);
    navigateToMenu(restaurant.slug, { lang: language });
  }

  if (!activeRestaurant && route.page === 'menu') {
    return <NotFoundPage language={language} controls={{ language, setLanguage, currency, setCurrency, themeMode, setThemeMode }} style={themeStyle} />;
  }

  const controls = { language, setLanguage, currency, setCurrency, themeMode, setThemeMode };
  const menuControls = {
    language,
    setLanguage,
    currency,
    setCurrency,
    themeMode: menuTheme,
    setThemeMode: setMenuTheme,
  };

  if (isViewer) {
    return (
      <ModelViewerPage
        controls={menuControls}
        currency={currency}
        dish={activeDish}
        language={language}
        menuTheme={menuTheme}
        onBack={backToMenu}
        restaurant={restaurant}
        style={themeStyle}
      />
    );
  }

  if (route.page === 'pricing') return <PricingPage controls={controls} language={language} style={themeStyle} />;
  if (route.page === 'experience') return <ExperiencePage controls={controls} language={language} style={themeStyle} />;
  if (route.page === 'about') return <AboutPage controls={controls} language={language} style={themeStyle} />;
  if (route.page === 'contact') return <ContactPage controls={controls} language={language} style={themeStyle} />;

  if (route.page === 'menu') {
    return (
      <Shell controls={controls} language={language} restaurant={restaurant} style={themeStyle}>
        <MenuExperience
          controls={menuControls}
          currency={currency}
          language={language}
          menuTheme={menuTheme}
          onDishSelect={setSelectedDish}
          restaurant={restaurant}
        />
        {selectedDish && (
          <DishModal
            currency={currency}
            dish={selectedDish}
            language={language}
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
    <Shell controls={controls} language={language} restaurant={restaurant} style={themeStyle}>
      <LandingPage
        currency={currency}
        language={language}
        menuControls={menuControls}
        menuTheme={menuTheme}
        onDishSelect={setSelectedDish}
        restaurant={restaurant}
      />
      {selectedDish && (
        <DishModal
          currency={currency}
          dish={selectedDish}
          language={language}
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
        aria-label="Toggle color mode"
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

function LandingPage({ currency, language, menuControls, menuTheme, onDishSelect, restaurant }) {
  return (
    <main className="landing-page">
      <section className="product-hero">
        <img src={siteContent.hero.image} alt="" />
        <div className="product-hero-copy">
          <p className="eyebrow">{brand.name}</p>
          <h1>{siteContent.hero.title}</h1>
          <p>{siteContent.hero.subtitle}</p>
          <div className="hero-actions">
            <a className="primary-link" href="#menu">{ui[language].viewMenu}</a>
            <a className="secondary-link" href="/pricing">{ui[language].seePricing}</a>
          </div>
        </div>
      </section>

      <ProductValueSection />

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <p className="eyebrow">Menu</p>
          <h2>Mobile-first AR menu</h2>
          <p>Search, filter, inspect ingredients, and view dishes on the table.</p>
        </div>
        <MenuExperience
          controls={menuControls}
          currency={currency}
          isPreview
          language={language}
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

function ProductValueSection() {
  return (
    <section className="value-section">
      <div className="section-heading">
        <p className="eyebrow">{siteContent.value.eyebrow}</p>
        <h2>{siteContent.value.title}</h2>
        <p>{siteContent.value.subtitle}</p>
      </div>
      <div className="value-grid">
        {siteContent.value.items.map((item) => (
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
        <p className="eyebrow">{ui[language].pricing}</p>
        <p>Clear monthly options for restaurants ready to launch a premium AR menu.</p>
      </div>
      <div className="pricing-carousel-shell">
        <p className="pricing-scroll-hint">Swipe plans</p>
        <div className="pricing-grid">
          {pricingPlans.map((plan) => (
            <article className={`pricing-card ${plan.badge ? 'recommended' : ''}`} key={plan.id}>
              {plan.badge && <span className="plan-badge">{plan.badge}</span>}
              <h3>{plan.title}</h3>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="plan-bottom">
                <strong>{plan.price}</strong>
                <a
                  className={plan.id === 'pro' ? 'primary-link' : 'secondary-link'}
                  href={plan.id === 'custom' ? customPlanHref : demoRequestHref}
                >
                  {plan.id === 'custom' ? ui[language].contactSales : ui[language].getStarted}
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
      <p className="eyebrow">{siteContent.virtualExperience.eyebrow}</p>
      <h2>{siteContent.virtualExperience.title}</h2>
      <p>{siteContent.virtualExperience.summary}</p>
      <a className="secondary-link" href="/experience">{ui[language].learnExperience}</a>
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
  const filteredDishes = restaurant.dishes.filter((dish) => {
    const matchesCategory = getDishCategoryId(dish) === activeCategory?.id;
    const matchesType = filter === 'all' || dish.type === filter;
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
        <div className="category-rail" aria-label="Menu categories">
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
        <span className="category-scroll-hint">{ui[language].swipeCategories}</span>
      </div>

      <label className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ui[language].search} />
      </label>

      <div className="menu-toolbar">
        <div>
          <p className="eyebrow">Category</p>
          <h2>{text(activeCategory?.label || activeCategory?.name, language)}</h2>
        </div>
        <div className="toolbar-actions">
          {['all', 'veg', 'meat'].map((item) => (
            <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">
              {item === 'veg' && <Leaf size={14} />}
              {item === 'meat' && <Beef size={14} />}
              {ui[language][item]}
            </button>
          ))}
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} type="button" aria-label="List view">
            <List size={15} />
          </button>
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} type="button" aria-label="Grid view">
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
          <div className="empty-menu-state">{ui[language].moreDishes}</div>
        )}
      </div>
    </section>
  );
}

function TypeBadge({ type }) {
  const Icon = type === 'veg' ? Leaf : Beef;
  return (
    <span className={`type-badge ${type}`}>
      <Icon size={14} />
      {type}
    </span>
  );
}

function DishCard({ currency, dish, language, onDetails }) {
  return (
    <article className="dish-card" onClick={onDetails}>
      <img src={dish.image} alt={text(dish.name, language)} />
      <div className="dish-content">
        <div className="dish-title-row">
          <h3>{text(dish.name, language)}</h3>
          <span>{formatPrice(dish.priceGEL, currency)}</span>
        </div>
        <p>{text(dish.description, language)}</p>
        <div className="dish-meta-row">
          <TypeBadge type={dish.type} />
          <button
            className="secondary-button"
            onClick={(event) => {
              event.stopPropagation();
              onDetails();
            }}
            type="button"
          >
            {ui[language].details}
          </button>
        </div>
      </div>
    </article>
  );
}

function IngredientTags({ ingredients }) {
  return (
    <div className="ingredient-tags">
      {(ingredients || []).map((ingredient) => (
        <span key={ingredient.name}>{ingredient.name}</span>
      ))}
    </div>
  );
}

function DishModal({ currency, dish, language, menuTheme, onClose, onViewer }) {
  return (
    <div className={`modal-backdrop menu-theme-${menuTheme}`} role="presentation" onClick={onClose}>
      <section className="dish-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <img src={dish.image} alt={text(dish.name, language)} />
        <div>
          <div className="dish-title-row">
            <h2>{text(dish.name, language)}</h2>
            <span>{formatPrice(dish.priceGEL, currency)}</span>
          </div>
          <TypeBadge type={dish.type} />
          <p>{text(dish.description, language)}</p>
          <IngredientTags ingredients={dish.ingredients} />
          <div className="dish-actions">
            <button className="secondary-button" onClick={onClose} type="button">{ui[language].backToMenu}</button>
            <button className="primary-button" onClick={onViewer} type="button">
              <span className="wipe-label" data-text={ui[language].viewOnTable}>{ui[language].viewOnTable}</span>
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
        <button className="back-button" onClick={onBack} type="button">{ui[language].backToMenu}</button>
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
                <span>{hotspot.name}</span>
                <small>{hotspot.benefits.join(' · ')}</small>
              </button>
            ))}
            <button className="ar-button" slot="ar-button" type="button">
              <span className="wipe-label" data-text={ui[language].viewOnTable}>{ui[language].viewOnTable}</span>
            </button>
          </model-viewer>
          <div className="viewer-info-card">
            <div>
              <p className="eyebrow">{restaurant.brandName}</p>
              <h1>{text(dish.name, language)}</h1>
            </div>
            <p>{text(dish.description, language)}</p>
            <IngredientTags ingredients={dish.ingredients} />
            <div className="viewer-meta-row">
              <strong>{formatPrice(dish.priceGEL, currency)}</strong>
              <span>{dish.hasModel === false ? 'Placeholder model in use.' : ui[language].modelHint}</span>
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
          <p className="eyebrow">{siteContent.virtualExperience.eyebrow}</p>
          <h1>{siteContent.virtualExperience.title}</h1>
          <p>{siteContent.virtualExperience.summary}</p>
          <div className="experience-list">
            {siteContent.virtualExperience.details.map((item) => (
              <span key={item}><Flame size={16} />{item}</span>
            ))}
          </div>
          <div className="contact-actions centered">
            <a className="primary-link" href={demoRequestHref}>{ui[language].emailUs}</a>
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
        <InfoPage title={siteContent.about.title} paragraphs={siteContent.about.paragraphs} eyebrow={ui[language].about} />
      </main>
    </Shell>
  );
}

function ContactPage({ controls, language, style }) {
  return (
    <Shell controls={controls} language={language} restaurant={defaultRestaurant} style={style}>
      <main className="page-content">
        <InfoPage title={siteContent.contact.title} paragraphs={[siteContent.contact.body]} eyebrow={ui[language].contact}>
          <div className="contact-actions">
            <a className="primary-link" href={`mailto:${brand.email}`}>
              {ui[language].email}: {brand.email}
            </a>
            <a className="secondary-link" href={brand.instagramUrl} rel="noreferrer" target="_blank">
              {ui[language].instagram}: {brand.instagramHandle}
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
        <h1>{ui[language].notFound}</h1>
        <a className="primary-link" href="/">{ui[language].home}</a>
      </main>
    </Shell>
  );
}

function Footer({ language, restaurant }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo />
          <p>{text(brand.shortDescription, language)}</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="/">{ui[language].home}</a>
          <a href="/about">{ui[language].about}</a>
          <a href="/contact">{ui[language].contact}</a>
        </nav>
        <div className="footer-contact">
          <a href={`mailto:${brand.email}`}>{ui[language].email}: {brand.email}</a>
          <a href={brand.instagramUrl} rel="noreferrer" target="_blank">
            {ui[language].instagram}: {brand.instagramHandle}
          </a>
        </div>
      </div>
      <p className="powered">{ui[language].powered}</p>
    </footer>
  );
}

export default App;
