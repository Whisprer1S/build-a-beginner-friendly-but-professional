import { useEffect, useMemo, useState } from 'react';
import {
  defaultRestaurant,
  defaultRestaurantSlug,
  findRestaurantBySlug,
  languages,
} from './data/restaurants/index.js';

const ui = {
  en: {
    menu: 'Menu',
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

function buildRestaurantUrl(slug, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const path = `/${slug}`;
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
  const [route, setRoute] = useState(() => ({
    slug: getSlugFromPath(),
    params: getParams(),
  }));
  const [selectedDish, setSelectedDish] = useState(null);

  useEffect(() => {
    localStorage.setItem('sufra-language', language);
  }, [language]);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedDish(null);
      setRoute({ slug: getSlugFromPath(), params: getParams() });
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
    setRoute({ slug, params: getParams() });
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
          <p className="eyebrow">{activeRestaurant.brandName}</p>
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

      <Footer language={language} />
    </div>
  );
}

function Logo({ brandName }) {
  return (
    <span className="logo">
      <span className="logo-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <circle cx="24" cy="24" r="22" />
          <path d="M29.9 14.1c-1.5-1-3.6-1.6-5.9-1.6-4.5 0-7.4 2.3-7.4 5.7 0 3.2 2.4 4.7 6.8 6.3 3.4 1.2 4.7 2.1 4.7 3.9 0 1.8-1.6 3-4.1 3-2.5 0-4.6-.8-6.5-2.3l-1.8 3.2c2 1.7 5 2.7 8.2 2.7 5.1 0 8.5-2.6 8.5-6.7 0-3.3-2.1-5-7.2-6.7-3.1-1.1-4.4-1.8-4.4-3.3 0-1.5 1.3-2.2 3.3-2.2 1.8 0 3.3.5 4.8 1.4l1-3.4Z" />
        </svg>
      </span>
      <span className="logo-text">{brandName}</span>
    </span>
  );
}

function SiteHeader({ language, restaurant, setLanguage }) {
  return (
    <header className="site-header">
      <a className="brand" href={buildRestaurantUrl(restaurant.slug)}>
        <Logo brandName={restaurant.brandName} />
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
          <span>{dish.price} {restaurant.currency}</span>
        </div>
        <p>{text(dish.description, language)}</p>
        <div className="dish-actions">
          <button className="secondary-button" onClick={onDetails} type="button">
            {ui[language].details}
          </button>
          <button className="primary-button" onClick={onViewer} type="button">
            {ui[language].view3d}
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
            <span>{dish.price} {restaurant.currency}</span>
          </div>
          <p>{text(dish.description, language)}</p>
          <div className="dish-actions">
            <button className="secondary-button" onClick={onClose} type="button">
              {ui[language].close}
            </button>
            <button className="primary-button" onClick={onViewer} type="button">
              {ui[language].view3d}
            </button>
          </div>
        </div>
      </section>
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
              <strong>{dish.price} {restaurant.currency}</strong>
              <span>{ui[language].modelHint}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer language={language} />
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
    </div>
  );
}

function Footer({ language }) {
  return <footer>{ui[language].powered}</footer>;
}

export default App;
