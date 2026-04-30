import { useEffect, useMemo, useState } from 'react';
import { brand } from './data/brand.js';
import {
  defaultRestaurant,
  defaultRestaurantSlug,
  findRestaurantBySlug,
  languages,
} from './data/restaurants/index.js';

const ui = {
  en: {
    menu: 'Menu',
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    email: 'Email',
    instagram: 'Instagram',
    comingSoon: 'Coming soon',
    view3d: 'View in 3D / AR',
    details: 'Details',
    close: 'Close',
    backToMenu: 'Back to menu',
    viewOnTable: 'View on your table',
    scanHint: 'QR menu preview',
    powered: 'Powered by Sufra AR',
    modelHint: 'Drag to rotate. Pinch or scroll to zoom.',
    notFound: 'Restaurant not found',
  },
  ka: {
    menu: 'მენიუ',
    home: 'მთავარი',
    about: 'შესახებ',
    contact: 'კონტაქტი',
    email: 'ელფოსტა',
    instagram: 'Instagram',
    comingSoon: 'მალე',
    view3d: 'ნახვა 3D / AR',
    details: 'დეტალები',
    close: 'დახურვა',
    backToMenu: 'მენიუში დაბრუნება',
    viewOnTable: 'მაგიდაზე ნახვა',
    scanHint: 'QR მენიუს პრევიუ',
    powered: 'Powered by Sufra AR',
    modelHint: 'დაატრიალეთ თითით. გასადიდებლად გამოიყენეთ ორი თითი.',
    notFound: 'რესტორანი ვერ მოიძებნა',
  },
  ru: {
    menu: 'Меню',
    home: 'Главная',
    about: 'О нас',
    contact: 'Контакт',
    email: 'Email',
    instagram: 'Instagram',
    comingSoon: 'Скоро',
    view3d: 'Смотреть в 3D / AR',
    details: 'Детали',
    close: 'Закрыть',
    backToMenu: 'Назад к меню',
    viewOnTable: 'Посмотреть на столе',
    scanHint: 'QR меню',
    powered: 'Powered by Sufra AR',
    modelHint: 'Поверните жестом. Для масштаба используйте два пальца.',
    notFound: 'Ресторан не найден',
  },
};

function text(value, language) {
  return value?.[language] || value?.en || '';
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function getSlugFromPath() {
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
  return slug || defaultRestaurantSlug;
}

function getRouteFromPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');

  if (path === 'about' || path === 'contact') {
    return { page: path, slug: defaultRestaurantSlug, params: getParams() };
  }

  return { page: 'menu', slug: path || defaultRestaurantSlug, params: getParams() };
}

function getRestaurantPath(slug) {
  return slug === defaultRestaurantSlug ? '/' : `/${slug}`;
}

function buildRestaurantUrl(slug, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const path = getRestaurantPath(slug);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

function getThemeStyle(restaurant) {
  const theme = restaurant.theme;

  return {
    '--bg': theme.background,
    '--text': theme.text,
    '--secondary-text': theme.secondaryText,
    '--accent': theme.accent,
    '--card': theme.card,
    '--border': theme.border,
    '--heading-font': theme.headingFont,
    '--body-font': theme.bodyFont,
  };
}

function App() {
  const [language, setLanguage] = useState(() => {
    const requestedLanguage = getParams().get('lang');
    if (languages.some((item) => item.code === requestedLanguage)) return requestedLanguage;
    return localStorage.getItem('sufra-language') || 'en';
  });
  const [route, setRoute] = useState(() => getRouteFromPath());
  const [selectedDish, setSelectedDish] = useState(null);

  useEffect(() => {
    localStorage.setItem('sufra-language', language);
  }, [language]);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedDish(null);
      setRoute(getRouteFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const activeRestaurant = findRestaurantBySlug(route.slug);
  const view = route.params.get('view');
  const dishId = route.params.get('dish');

  const groupedCategories = useMemo(() => {
    if (!activeRestaurant) return [];

    return activeRestaurant.categories.map((category) => ({
      ...category,
      dishes: activeRestaurant.dishes.filter((dish) => dish.category === category.id),
    }));
  }, [activeRestaurant]);

  const activeDish = activeRestaurant?.dishes.find((dish) => dish.id === dishId);

  function navigate(slug, query) {
    const url = buildRestaurantUrl(slug, query);
    window.history.pushState({}, '', url);
    setRoute({ page: 'menu', slug, params: getParams() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openViewer(dish) {
    setSelectedDish(null);
    navigate(activeRestaurant.slug, {
      dish: dish.id,
      view: 'viewer',
      lang: language,
    });
  }

  function backToMenu() {
    setSelectedDish(null);
    navigate(activeRestaurant.slug, { lang: language });
  }

  if (!activeRestaurant) {
    return <EmptyState language={language} setLanguage={setLanguage} />;
  }

  const themeStyle = getThemeStyle(activeRestaurant);

  if (route.page === 'about') {
    return <AboutPage language={language} setLanguage={setLanguage} style={themeStyle} />;
  }

  if (route.page === 'contact') {
    return <ContactPage language={language} setLanguage={setLanguage} style={themeStyle} />;
  }

  if (view === 'viewer' && activeDish) {
    return (
      <ModelViewerPage
        dish={activeDish}
        language={language}
        restaurant={activeRestaurant}
        setLanguage={setLanguage}
        style={themeStyle}
        onBack={backToMenu}
      />
    );
  }

  return (
    <div className="app-shell" style={themeStyle}>
      <SiteHeader
        language={language}
        restaurant={activeRestaurant}
        setLanguage={setLanguage}
      />

      <main>
        <section className="restaurant-hero">
          <img
            className="hero-image"
            src={activeRestaurant.heroImage}
            alt={text(activeRestaurant.restaurantName, language)}
          />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow">{activeRestaurant.brandName}</p>
            <h1>{text(activeRestaurant.restaurantName, language)}</h1>
            <p>{text(activeRestaurant.subtitle, language)}</p>
            <div className="restaurant-meta">
              <a href={activeRestaurant.mapUrl} rel="noreferrer" target="_blank">
                {text(activeRestaurant.locationLabel, language)}
              </a>
              <span>{ui[language].scanHint}</span>
            </div>
          </div>
        </section>

        <section className="menu-heading">
          <p className="eyebrow">{brand.name}</p>
          <h2>{ui[language].menu}</h2>
        </section>

        {groupedCategories.map((category) => (
          <section className="category-section" key={category.id}>
            <h3>{text(category.name, language)}</h3>
            <div className="dish-grid">
              {category.dishes.map((dish) => (
                <DishCard
                  dish={dish}
                  key={dish.id}
                  language={language}
                  restaurant={activeRestaurant}
                  onDetails={() => setSelectedDish(dish)}
                  onViewer={() => openViewer(dish)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {selectedDish && (
        <DishModal
          dish={selectedDish}
          language={language}
          restaurant={activeRestaurant}
          onClose={() => setSelectedDish(null)}
          onViewer={() => openViewer(selectedDish)}
        />
      )}

      <Footer language={language} restaurant={activeRestaurant} />
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

function SiteHeader({ language, restaurant, setLanguage }) {
  return (
    <header className="site-header">
      <a className="brand" href={buildRestaurantUrl(restaurant.slug)}>
        <Logo />
      </a>
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
    </header>
  );
}

function LanguageSwitcher({ language, setLanguage }) {
  return (
    <div className="language-switcher" aria-label="Language switcher">
      {languages.map((item) => (
        <button
          className={item.code === language ? 'active' : ''}
          key={item.code}
          onClick={() => setLanguage(item.code)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function DishCard({ dish, language, restaurant, onDetails, onViewer }) {
  return (
    <article className="dish-card">
      <button className="dish-image-button" onClick={onDetails} type="button">
        <img src={dish.image} alt={text(dish.name, language)} />
      </button>
      <div className="dish-content">
        <div className="dish-title-row">
          <h4>{text(dish.name, language)}</h4>
          <span>
            {dish.price} {restaurant.currency}
          </span>
        </div>
        <p>{text(dish.description, language)}</p>
        <div className="dish-actions">
          <button className="secondary-button" onClick={onDetails} type="button">
            {ui[language].details}
          </button>
          <button className="primary-button" onClick={onViewer} type="button">
            <span className="wipe-label" data-text={ui[language].view3d}>
              {ui[language].view3d}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

function DishModal({ dish, language, restaurant, onClose, onViewer }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-modal="true"
        className="dish-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={dish.image} alt={text(dish.name, language)} />
        <div>
          <div className="dish-title-row">
            <h2>{text(dish.name, language)}</h2>
            <span>
              {dish.price} {restaurant.currency}
            </span>
          </div>
          <p>{text(dish.description, language)}</p>
          <div className="dish-actions">
            <button className="secondary-button" onClick={onClose} type="button">
              {ui[language].close}
            </button>
            <button className="primary-button" onClick={onViewer} type="button">
              <span className="wipe-label" data-text={ui[language].view3d}>
                {ui[language].view3d}
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AboutSection({ language }) {
  return (
    <section className="content-section about-section" id="about">
      <div>
        <p className="eyebrow">{ui[language].about}</p>
        <h2>{text(brand.aboutTitle, language)}</h2>
      </div>
      <div className="section-copy">
        {text(brand.aboutText, language).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ language }) {
  return (
    <section className="content-section contact-section" id="contact">
      <div>
        <p className="eyebrow">{ui[language].contact}</p>
        <h2>{text(brand.contactTitle, language)}</h2>
      </div>
      <div className="contact-panel">
        <p>{text(brand.contactCta, language)}</p>
        <div className="contact-actions">
          {brand.email ? (
            <a className="primary-link" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>
          ) : (
            <span className="placeholder-pill">
              {ui[language].email}: {ui[language].comingSoon}
            </span>
          )}
          {brand.instagramUrl ? (
            <a className="secondary-link" href={brand.instagramUrl} rel="noreferrer" target="_blank">
              {ui[language].instagram}
            </a>
          ) : (
            <span className="placeholder-pill">
              {ui[language].instagram}: {ui[language].comingSoon}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function AboutPage({ language, setLanguage, style }) {
  return (
    <div className="app-shell" style={style}>
      <SiteHeader
        language={language}
        restaurant={defaultRestaurant}
        setLanguage={setLanguage}
      />
      <main className="standalone-page">
        <AboutSection language={language} />
      </main>
      <Footer language={language} restaurant={defaultRestaurant} />
    </div>
  );
}

function ContactPage({ language, setLanguage, style }) {
  return (
    <div className="app-shell" style={style}>
      <SiteHeader
        language={language}
        restaurant={defaultRestaurant}
        setLanguage={setLanguage}
      />
      <main className="standalone-page">
        <ContactSection language={language} />
      </main>
      <Footer language={language} restaurant={defaultRestaurant} />
    </div>
  );
}

function ModelViewerPage({ dish, language, restaurant, setLanguage, style, onBack }) {
  return (
    <div className="viewer-shell" style={style}>
      <SiteHeader language={language} restaurant={restaurant} setLanguage={setLanguage} />
      <main className="viewer-page">
        <button className="back-button" onClick={onBack} type="button">
          {ui[language].backToMenu}
        </button>

        <section className="viewer-layout">
          <model-viewer
            alt={text(dish.name, language)}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement={dish.arPlacement}
            auto-rotate
            camera-controls
            camera-orbit={dish.cameraOrbit}
            exposure="0.95"
            field-of-view={dish.fieldOfView}
            poster={dish.image}
            scale={dish.arScale}
            shadow-intensity="1"
            src={dish.model}
            touch-action="pan-y"
          >
            <button className="ar-button" slot="ar-button" type="button">
              {ui[language].viewOnTable}
            </button>
          </model-viewer>

          <div className="viewer-info-card">
            <div>
              <p className="eyebrow">{restaurant.brandName}</p>
              <h1>{text(dish.name, language)}</h1>
            </div>
            <p>{text(dish.description, language)}</p>
            <div className="viewer-meta-row">
              <strong>
                {dish.price} {restaurant.currency}
              </strong>
              <span>{ui[language].modelHint}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer language={language} restaurant={restaurant} />
    </div>
  );
}

function EmptyState({ language, setLanguage }) {
  const style = getThemeStyle(defaultRestaurant);

  return (
    <div className="app-shell" style={style}>
      <SiteHeader
        language={language}
        restaurant={defaultRestaurant}
        setLanguage={setLanguage}
      />
      <main className="empty-state">
        <h1>{ui[language].notFound}</h1>
        <a className="primary-link" href={buildRestaurantUrl(defaultRestaurant.slug)}>
          {ui[language].backToMenu}
        </a>
      </main>
      <Footer language={language} restaurant={defaultRestaurant} />
    </div>
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
          <a href={buildRestaurantUrl(restaurant.slug)}>{ui[language].home}</a>
          <a href="/about">{ui[language].about}</a>
          <a href="/contact">{ui[language].contact}</a>
        </nav>
        <div className="footer-contact">
          <span>{brand.email || `${ui[language].email}: ${ui[language].comingSoon}`}</span>
          {brand.instagramUrl ? (
            <a href={brand.instagramUrl} rel="noreferrer" target="_blank">
              {ui[language].instagram}
            </a>
          ) : (
            <span>
              {ui[language].instagram}: {ui[language].comingSoon}
            </span>
          )}
        </div>
      </div>
      <p className="powered">{ui[language].powered}</p>
    </footer>
  );
}

export default App;
