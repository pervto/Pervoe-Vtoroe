let menuData = [];
let cart = [];
let activeCategory = "__all__";
let searchQuery = "";
let toastTimer = null;
let promo = { code: "", discount: 0 };
let categoryOrderList = [];
let heroBanners = [];
let lastMenuLoadError = "";
let activeDishName = "";
let activeDishSlide = 0;
let activeDishPhotoKey = "";
let activeDishPointerId = null;
let activeDishDragStartX = 0;
let activeDishDragOffsetX = 0;
let activeDishIsDragging = false;
let activeHeroBanner = 0;
let activeHeroPointerId = null;
let activeHeroDragStartX = 0;
let activeHeroDragOffsetX = 0;
let activeHeroIsDragging = false;

const CART_KEY = "pervoe-vtoroe-cart";
const PROMO_KEY = "pervoe-vtoroe-promo";
const LANGUAGE_KEY = "pervoe-vtoroe-language";
const THEME_KEY = "pervoe-vtoroe-theme";
const TRANSLATION_CACHE_KEY = "pervoe-vtoroe-translation-cache-v2";
const MAX_TRANSLATION_CACHE_ENTRIES = 1200;
const DISH_CAROUSEL_TRANSITION = "transform .34s cubic-bezier(.22, 1, .36, 1)";
const HERO_CAROUSEL_TRANSITION = "transform .34s cubic-bezier(.22, 1, .36, 1)";
const ALL_CATEGORY = "__all__";
const LANGUAGE_META = {
  ru: { locale: "ru-RU", translationCode: "ru" },
  kk: { locale: "kk-KZ", translationCode: "kk" },
  en: { locale: "en-US", translationCode: "en" }
};
const UI_TRANSLATIONS = {
  ru: {
    siteTitle: "Первое-Второе",
    logoAlt: "Первое-Второе",
    settingsButtonAria: "Открыть настройки",
    settingsKicker: "Настройки",
    settingsTitle: "Язык интерфейса",
    settingsText: "",
    settingsGroupAria: "Выбор языка",
    languageRu: "Русский",
    languageKk: "Казахский",
    languageEn: "Английский",
    settingsThemeTitle: "Тема",
    settingsThemeText: "Авто повторяет тему устройства.",
    settingsThemeGroupAria: "Выбор темы",
    themeAuto: "Авто",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    heroBannerCarouselAria: "Информационные баннеры",
    heroBannerDotAria: "Открыть баннер {index}",
    heroBannerClassicKicker: "Доставка каждый день",
    heroBannerClassicTitle: "Выберите блюда, добавьте в корзину и отправьте заказ в WhatsApp за 1 минуту.",
    heroBannerClassicSubtitle: "Доставка работает ежедневно с 9:00 до 18:00.",
    heroBannerClassicBadgeFresh: "Свежие блюда",
    heroBannerClassicBadgeFast: "Быстрая доставка",
    heroBannerClassicBadgeFree: "Без регистрации",
    heroBannerInfoKicker: "Информация",
    heroBannerInstallKicker: "Добавить на экран",
    heroBannerInstallTitle: "Как скачать приложение на iPhone",
    heroBannerInstallText: "Сохраните сайт на рабочий стол и открывайте его как приложение.",
    heroBannerInstallStep1: "Откройте сайт в Safari",
    heroBannerInstallStep2: "Нажмите кнопку «Поделиться»",
    heroBannerInstallStep3: "Выберите «На экран Домой»",
    heroBannerInstallNote: "После этого иконка появится на главном экране, а сайт будет запускаться как отдельное приложение.",
    searchPlaceholder: "Поиск по блюдам",
    searchClearAria: "Очистить поиск",
    loadingMenu: "Загружаем меню...",
    translatingMenu: "Перевожу меню...",
    noResults: "Ничего не найдено. Попробуйте другое название.",
    noAvailable: "Нет доступных блюд. Проверьте колонку Наличие (Да/Нет).",
    loadErrorHeading: "Не удалось загрузить меню",
    loadError: "Ошибка загрузки меню: {message}",
    retryLoadButton: "Попробовать снова",
    footerReview: "Будем рады вашим отзывам",
    address: "Петропавловск, Интернациональная улица, 67",
    toTopAria: "Наверх",
    cartButton: "Корзина",
    cartTitle: "Ваш заказ",
    closeAria: "Закрыть",
    promoLabel: "Промокод (необязательно)",
    promoPlaceholder: "Введите промокод",
    promoApply: "Применить",
    promoMissing: "Промокод не указан",
    promoAppliedPercent: "Промокод применен: скидка 10%",
    promoAppliedFixed: "Промокод применен: скидка 200₸",
    promoNotFound: "Промокод не найден",
    subtotal: "Сумма",
    discount: "Скидка",
    total: "Итого",
    totalFull: "Общая сумма",
    deliveryTitle: "Данные для доставки",
    namePlaceholder: "Ваше имя",
    phonePlaceholder: "Ваш телефон",
    addressPlaceholder: "Адрес доставки",
    commentPlaceholder: "Комментарий к заказу (необязательно)",
    orderButton: "Оформить в WhatsApp",
    paymentNote: "Оплата временно осуществляется только через удалённую оплату Kaspi. Приносим извинения за неудобства.",
    dishAbout: "О блюде",
    dishNoCategory: "Без категории",
    dishDescriptionFallback: "Подробное описание скоро появится.",
    dishOpenAria: "Открыть {name}",
    dishCloseAria: "Закрыть просмотр блюда",
    dishPrevPhotoAria: "Предыдущее фото",
    dishNextPhotoAria: "Следующее фото",
    dishPhotoSoon: "Фотография блюда скоро появится",
    thanksTitle: "Спасибо за заказ!",
    thanksText: "Мы уже получили вашу заявку. Ждем вас снова.",
    thanksButton: "Отлично",
    categoriesAll: "Все",
    addButton: "Добавить",
    cartEmpty: "Корзина пока пустая.",
    removeButton: "Удалить",
    toastAdded: "{name} добавлено в корзину",
    alertCartEmpty: "Корзина пустая. Добавьте блюда.",
    alertFillRequired: "Заполните имя, телефон и адрес.",
    alertWhatsAppBlocked: "Не удалось открыть WhatsApp. Разрешите всплывающие окна и попробуйте снова.",
    confirmWhatsAppSent: "WhatsApp открыт. Нажмите OK только после того, как действительно отправите сообщение с заказом.",
    waGreeting: "Здравствуйте!",
    waIntro: "Хочу оформить заказ.",
    waName: "Имя",
    waPhone: "Телефон",
    waAddress: "Адрес",
    waComment: "Комментарий",
    waPromo: "Промокод",
    waOrder: "Заказ",
    waTotal: "Итого"
  },
  kk: {
    siteTitle: "Бірінші-Екінші",
    logoAlt: "Бірінші-Екінші",
    settingsButtonAria: "Баптауларды ашу",
    settingsKicker: "Баптаулар",
    settingsTitle: "Интерфейс тілі",
    settingsText: "",
    settingsGroupAria: "Тілді таңдау",
    languageRu: "Орысша",
    languageKk: "Қазақша",
    languageEn: "Ағылшынша",
    settingsThemeTitle: "Тақырып",
    settingsThemeText: "Авто құрылғы тақырыбын қайталайды.",
    settingsThemeGroupAria: "Тақырыпты таңдау",
    themeAuto: "Авто",
    themeLight: "Ашық",
    themeDark: "Қараңғы",
    heroBannerCarouselAria: "Ақпараттық баннерлер",
    heroBannerDotAria: "{index}-баннерді ашу",
    heroBannerClassicKicker: "Күн сайын жеткізу",
    heroBannerClassicTitle: "Тағамдарды таңдаңыз, себетке қосыңыз және тапсырысты WhatsApp арқылы 1 минутта жіберіңіз.",
    heroBannerClassicSubtitle: "Жеткізу күн сайын 9:00-ден 18:00-ге дейін жұмыс істейді.",
    heroBannerClassicBadgeFresh: "Жаңа тағамдар",
    heroBannerClassicBadgeFast: "Жылдам жеткізу",
    heroBannerClassicBadgeFree: "Тіркелусіз",
    heroBannerInfoKicker: "Ақпарат",
    heroBannerInstallKicker: "Басты экранға қосу",
    heroBannerInstallTitle: "Қосымшаны iPhone-ға қалай орнатуға болады",
    heroBannerInstallText: "Сайтты басты экранға сақтап, оны қолданба сияқты ашыңыз.",
    heroBannerInstallStep1: "Сайтты Safari-де ашыңыз",
    heroBannerInstallStep2: "«Бөлісу» батырмасын басыңыз",
    heroBannerInstallStep3: "«Басты экранға» тармағын таңдаңыз",
    heroBannerInstallNote: "Осыдан кейін белгіше басты экранда пайда болады, ал сайт бөлек қосымша сияқты ашылады.",
    searchPlaceholder: "Тағамдар бойынша іздеу",
    searchClearAria: "Іздеуді тазарту",
    loadingMenu: "Мәзір жүктелуде...",
    translatingMenu: "Мәзір аударылып жатыр...",
    noResults: "Ештеңе табылмады. Басқа атауды қолданып көріңіз.",
    noAvailable: "Қолжетімді тағамдар жоқ. Қолжетімділік бағанын тексеріңіз (Иә/Жоқ).",
    loadErrorHeading: "Мәзірді жүктеу мүмкін болмады",
    loadError: "Мәзірді жүктеу қатесі: {message}",
    retryLoadButton: "Қайта көру",
    footerReview: "Пікірлеріңізге қуаныштымыз",
    address: "Петропавл, Интернациональная көшесі, 67",
    toTopAria: "Жоғарыға",
    cartButton: "Себет",
    cartTitle: "Тапсырысыңыз",
    closeAria: "Жабу",
    promoLabel: "Промокод (міндетті емес)",
    promoPlaceholder: "Промокодты енгізіңіз",
    promoApply: "Қолдану",
    promoMissing: "Промокод енгізілмеген",
    promoAppliedPercent: "Промокод қолданылды: 10% жеңілдік",
    promoAppliedFixed: "Промокод қолданылды: 200₸ жеңілдік",
    promoNotFound: "Промокод табылмады",
    subtotal: "Сома",
    discount: "Жеңілдік",
    total: "Барлығы",
    totalFull: "Жалпы сома",
    deliveryTitle: "Жеткізу деректері",
    namePlaceholder: "Атыңыз",
    phonePlaceholder: "Телефоныңыз",
    addressPlaceholder: "Жеткізу мекенжайы",
    commentPlaceholder: "Тапсырысқа пікір (міндетті емес)",
    orderButton: "WhatsApp арқылы рәсімдеу",
    paymentNote: "Қазір төлем тек Kaspi арқылы қашықтан қабылданады. Қолайсыздық үшін кешірім сұраймыз.",
    dishAbout: "Тағам туралы",
    dishNoCategory: "Санатсыз",
    dishDescriptionFallback: "Толық сипаттама жақында қосылады.",
    dishOpenAria: "{name} ашу",
    dishCloseAria: "Тағам көрінісін жабу",
    dishPrevPhotoAria: "Алдыңғы фото",
    dishNextPhotoAria: "Келесі фото",
    dishPhotoSoon: "Тағам суреті жақында қосылады",
    thanksTitle: "Тапсырысыңызға рахмет!",
    thanksText: "Өтініміңіз қабылданды. Қайта күтеміз.",
    thanksButton: "Тамаша",
    categoriesAll: "Барлығы",
    addButton: "Қосу",
    cartEmpty: "Себет әзірге бос.",
    removeButton: "Жою",
    toastAdded: "{name} себетке қосылды",
    alertCartEmpty: "Себет бос. Тағам қосыңыз.",
    alertFillRequired: "Атыңызды, телефоныңызды және мекенжайыңызды толтырыңыз.",
    alertWhatsAppBlocked: "WhatsApp ашылмады. Қалқымалы терезелерге рұқсат беріп, қайта көріңіз.",
    confirmWhatsAppSent: "WhatsApp ашылды. Тапсырыс хабарламасын шынымен жібергеннен кейін ғана OK батырмасын басыңыз.",
    waGreeting: "Сәлеметсіз бе!",
    waIntro: "Тапсырыс бергім келеді.",
    waName: "Аты",
    waPhone: "Телефон",
    waAddress: "Мекенжай",
    waComment: "Пікір",
    waPromo: "Промокод",
    waOrder: "Тапсырыс",
    waTotal: "Барлығы"
  },
  en: {
    siteTitle: "First-Second",
    logoAlt: "First-Second",
    settingsButtonAria: "Open settings",
    settingsKicker: "Settings",
    settingsTitle: "Interface language",
    settingsText: "",
    settingsGroupAria: "Language selection",
    languageRu: "Russian",
    languageKk: "Kazakh",
    languageEn: "English",
    settingsThemeTitle: "Theme",
    settingsThemeText: "Auto follows your device theme.",
    settingsThemeGroupAria: "Theme selection",
    themeAuto: "Auto",
    themeLight: "Light",
    themeDark: "Dark",
    heroBannerCarouselAria: "Info banners",
    heroBannerDotAria: "Open banner {index}",
    heroBannerClassicKicker: "Delivery every day",
    heroBannerClassicTitle: "Choose your dishes, add them to the cart, and send your order via WhatsApp in 1 minute.",
    heroBannerClassicSubtitle: "Delivery is available daily from 9:00 to 18:00.",
    heroBannerClassicBadgeFresh: "Fresh dishes",
    heroBannerClassicBadgeFast: "Fast delivery",
    heroBannerClassicBadgeFree: "No registration",
    heroBannerInfoKicker: "Info",
    heroBannerInstallKicker: "Add to home screen",
    heroBannerInstallTitle: "How to install the app on iPhone",
    heroBannerInstallText: "Save the site to your home screen and open it like an app.",
    heroBannerInstallStep1: "Open the site in Safari",
    heroBannerInstallStep2: "Tap the Share button",
    heroBannerInstallStep3: "Choose Add to Home Screen",
    heroBannerInstallNote: "After that, the icon will appear on your home screen and the site will open like a standalone app.",
    searchPlaceholder: "Search dishes",
    searchClearAria: "Clear search",
    loadingMenu: "Loading menu...",
    translatingMenu: "Translating menu...",
    noResults: "Nothing found. Try another dish name.",
    noAvailable: "No dishes are currently available. Check the availability column.",
    loadErrorHeading: "Unable to load the menu",
    loadError: "Menu loading error: {message}",
    retryLoadButton: "Try again",
    footerReview: "We would love to hear your feedback",
    address: "Petropavlovsk, Internationalnaya Street, 67",
    toTopAria: "Back to top",
    cartButton: "Cart",
    cartTitle: "Your order",
    closeAria: "Close",
    promoLabel: "Promo code (optional)",
    promoPlaceholder: "Enter promo code",
    promoApply: "Apply",
    promoMissing: "No promo code entered",
    promoAppliedPercent: "Promo code applied: 10% discount",
    promoAppliedFixed: "Promo code applied: 200₸ discount",
    promoNotFound: "Promo code not found",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    totalFull: "Grand total",
    deliveryTitle: "Delivery details",
    namePlaceholder: "Your name",
    phonePlaceholder: "Your phone",
    addressPlaceholder: "Delivery address",
    commentPlaceholder: "Order comment (optional)",
    orderButton: "Checkout via WhatsApp",
    paymentNote: "Payment is currently available only via remote Kaspi payment. We apologize for the inconvenience.",
    dishAbout: "About the dish",
    dishNoCategory: "No category",
    dishDescriptionFallback: "Detailed description will be added soon.",
    dishOpenAria: "Open {name}",
    dishCloseAria: "Close dish view",
    dishPrevPhotoAria: "Previous photo",
    dishNextPhotoAria: "Next photo",
    dishPhotoSoon: "Dish photo will appear soon",
    thanksTitle: "Thank you for your order!",
    thanksText: "We have already received your request. See you again soon.",
    thanksButton: "Great",
    categoriesAll: "All",
    addButton: "Add",
    cartEmpty: "Your cart is empty for now.",
    removeButton: "Remove",
    toastAdded: "{name} added to cart",
    alertCartEmpty: "Your cart is empty. Add some dishes first.",
    alertFillRequired: "Please fill in your name, phone number, and address.",
    alertWhatsAppBlocked: "Unable to open WhatsApp. Please allow pop-ups and try again.",
    confirmWhatsAppSent: "WhatsApp is open. Press OK only after you actually send the order message.",
    waGreeting: "Hello!",
    waIntro: "I would like to place an order.",
    waName: "Name",
    waPhone: "Phone",
    waAddress: "Address",
    waComment: "Comment",
    waPromo: "Promo code",
    waOrder: "Order",
    waTotal: "Total"
  }
};
let currentLanguage = loadSavedLanguage();
let currentThemeMode = loadSavedThemeMode();
let menuTranslations = { kk: {}, en: {} };
let menuTranslationPromises = {};
let heroBannerTranslations = { kk: {}, en: {} };
let heroBannerTranslationPromises = {};
let translationCache = {};
let translationCacheLoaded = false;
const systemThemeMedia = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function isDesktopHeroBannerLane() {
  return window.matchMedia ? window.matchMedia("(min-width: 861px)").matches : false;
}
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map((item) => item.replace(/^"|"$/g, ""));
}

function loadSavedLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  return LANGUAGE_META[saved] ? saved : "ru";
}

function loadSavedThemeMode() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return ["auto", "light", "dark"].includes(saved) ? saved : "auto";
  } catch {
    return "auto";
  }
}

function resolveThemeMode(mode = currentThemeMode) {
  if (mode === "light" || mode === "dark") return mode;
  return systemThemeMedia?.matches ? "dark" : "light";
}

function getThemeColor(theme = resolveThemeMode()) {
  return theme === "dark" ? "#101722" : "#abb4bf";
}

function updateThemeMeta(theme = resolveThemeMode()) {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) themeColorMeta.setAttribute("content", getThemeColor(theme));

  const appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusMeta) appleStatusMeta.setAttribute("content", theme === "dark" ? "black-translucent" : "default");
}

function syncBrandLogo(theme = resolveThemeMode()) {
  const logo = document.querySelector("[data-logo-src-light]");
  if (!logo) return;

  const nextSrc = theme === "dark"
    ? (logo.dataset.logoSrcDark || logo.dataset.logoSrcLight)
    : logo.dataset.logoSrcLight;
  const logoVersion = logo.dataset.logoVersion;
  const resolvedSrc = logoVersion ? `${nextSrc}?v=${logoVersion}` : nextSrc;

  if (logo.getAttribute("src") !== resolvedSrc) {
    logo.setAttribute("src", resolvedSrc);
  }
}

function applyTheme(mode = currentThemeMode, options = {}) {
  const persist = Boolean(options.persist);
  currentThemeMode = ["auto", "light", "dark"].includes(mode) ? mode : "auto";
  const effectiveTheme = resolveThemeMode(currentThemeMode);

  document.documentElement.dataset.themeMode = currentThemeMode;
  document.documentElement.dataset.theme = effectiveTheme;
  document.documentElement.style.colorScheme = effectiveTheme;
  updateThemeMeta(effectiveTheme);
  syncBrandLogo(effectiveTheme);

  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, currentThemeMode);
    } catch {}
  }

  updateThemeButtons(false);
}

function loadTranslationCache() {
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? trimTranslationCache(parsed) : {};
  } catch {
    return {};
  }
}

let translationCacheSaveTimer = null;

function trimTranslationCache(source) {
  const entries = Object.entries(source || {});
  if (entries.length <= MAX_TRANSLATION_CACHE_ENTRIES) {
    return Object.fromEntries(entries);
  }

  return Object.fromEntries(entries.slice(-MAX_TRANSLATION_CACHE_ENTRIES));
}

function ensureTranslationCacheLoaded() {
  if (translationCacheLoaded) return;
  translationCache = loadTranslationCache();
  translationCacheLoaded = true;
}

function saveTranslationCache() {
  if (translationCacheSaveTimer) return;

  translationCacheSaveTimer = window.setTimeout(() => {
    translationCacheSaveTimer = null;
    try {
      translationCache = trimTranslationCache(translationCache);
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationCache));
    } catch {}
  }, 180);
}

function flushTranslationCache() {
  if (translationCacheSaveTimer) {
    window.clearTimeout(translationCacheSaveTimer);
    translationCacheSaveTimer = null;
  }

  try {
    translationCache = trimTranslationCache(translationCache);
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationCache));
  } catch {}
}

function getLocale() {
  return LANGUAGE_META[currentLanguage]?.locale || "ru-RU";
}

function t(key, vars = {}) {
  const table = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.ru;
  const hasFallback = Object.prototype.hasOwnProperty.call(UI_TRANSLATIONS.ru, key);
  const hasValue = Object.prototype.hasOwnProperty.call(table, key);
  const fallback = hasFallback ? UI_TRANSLATIONS.ru[key] : key;
  const value = hasValue ? table[key] : fallback;
  return Object.entries(vars).reduce((text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement), value);
}

function money(value, lang = currentLanguage) {
  const locale = LANGUAGE_META[lang]?.locale || "ru-RU";
  return `${Number(value || 0).toLocaleString(locale)}₸`;
}

function getLocalizedCalories(value, lang = currentLanguage) {
  if (!value) return "";
  if (lang === "en") return `${value} kcal`;
  return `${value} ккал`;
}

function getLocalizedWeight(value, lang = currentLanguage) {
  const weight = String(value || "").trim();
  if (!weight) return "";

  if (lang === "en") {
    return weight
      .replace(/грамм(?:а|ов)?/gi, "g")
      .replace(/гр\b/gi, "g")
      .replace(/г\b/gi, "g")
      .replace(/килограмм(?:а|ов)?/gi, "kg")
      .replace(/кг\b/gi, "kg")
      .replace(/миллилитр(?:а|ов)?/gi, "ml")
      .replace(/мл\b/gi, "ml")
      .replace(/литр(?:а|ов)?/gi, "l")
      .replace(/л\b/gi, "l")
      .replace(/шт\b/gi, "pcs");
  }

  if (lang === "kk") {
    return weight
      .replace(/шт\b/gi, "дана")
      .replace(/грамм(?:а|ов)?/gi, "г")
      .replace(/гр\b/gi, "г");
  }

  return weight;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractGoogleDriveFileId(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) return "";

  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  const directMatch = url.match(/drive\.google\.com\/(?:open|uc|thumbnail)[^?#]*[?&]id=([^&#]+)/i);
  if (directMatch && directMatch[1]) return directMatch[1];

  const genericIdMatch = url.match(/[?&]id=([^&#]+)/i);
  if (genericIdMatch && genericIdMatch[1] && /drive\.google\.com/i.test(url)) return genericIdMatch[1];

  return "";
}

function extractGoogleDriveResourceKey(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url || !/drive\.google\.com/i.test(url)) return "";

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get("resourcekey") || "";
  } catch {
    const match = url.match(/[?&]resourcekey=([^&#]+)/i);
    return match && match[1] ? match[1] : "";
  }
}

function appendGoogleDriveResourceKey(url, resourceKey) {
  const key = String(resourceKey || "").trim();
  if (!url || !key) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}resourcekey=${encodeURIComponent(key)}`;
}

function normalizePhotoTargetWidth(targetWidth, fallbackWidth = 1200) {
  const width = Number(targetWidth);
  if (!Number.isFinite(width) || width <= 0) return fallbackWidth;
  return Math.max(1, Math.round(width));
}

function isDirectImageUrl(rawUrl) {
  const url = String(rawUrl || "").trim().toLowerCase();
  if (!url) return false;
  return (
    /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(url) ||
    url.includes("googleusercontent.com") ||
    url.includes("ggpht.com")
  );
}

function buildPhotoUrlCandidates(rawUrl, options = {}) {
  const url = String(rawUrl || "").trim();
  if (!url) return [];

  const candidates = [];
  const targetWidth = normalizePhotoTargetWidth(options.targetWidth, 1200);
  const addCandidate = (value) => {
    const nextValue = String(value || "").trim();
    if (!nextValue || candidates.includes(nextValue)) return;
    candidates.push(nextValue);
  };

  const driveFileId = extractGoogleDriveFileId(url);
  if (driveFileId) {
    const resourceKey = extractGoogleDriveResourceKey(url);
    addCandidate(appendGoogleDriveResourceKey(`https://drive.google.com/thumbnail?id=${driveFileId}&sz=w${targetWidth}`, resourceKey));
    addCandidate(appendGoogleDriveResourceKey(`https://drive.google.com/uc?export=view&id=${driveFileId}`, resourceKey));
    addCandidate(`https://lh3.googleusercontent.com/d/${driveFileId}=w${targetWidth}`);
  }

  if (isDirectImageUrl(url)) {
    addCandidate(url);
  }

  addCandidate(url);
  return candidates;
}

function normalizePhotoUrl(rawUrl, options = {}) {
  const candidates = buildPhotoUrlCandidates(rawUrl, options);
  return candidates[0] || "";
}

function getTranslationCacheKey(text, lang) {
  return `${lang}::${text}`;
}

async function translateViaGoogle(text, lang) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "ru");
  url.searchParams.set("tl", LANGUAGE_META[lang]?.translationCode || lang);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Google translate error ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error("Unexpected Google translate response");
  return data[0].map((part) => part[0] || "").join("").trim();
}

async function translateViaMyMemory(text, lang) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `ru|${LANGUAGE_META[lang]?.translationCode || lang}`);
  url.searchParams.set("mt", "1");
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`MyMemory error ${response.status}`);
  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (!translated) throw new Error("Empty MyMemory response");
  return String(translated).trim();
}

async function translateText(text, lang) {
  const source = String(text || "").trim();
  if (!source || lang === "ru") return source;

  ensureTranslationCacheLoaded();
  const cacheKey = getTranslationCacheKey(source, lang);
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  let translated = source;
  try {
    translated = await translateViaGoogle(source, lang);
  } catch {
    try {
      translated = await translateViaMyMemory(source, lang);
    } catch {
      translated = source;
    }
  }

  translationCache[cacheKey] = translated || source;
  saveTranslationCache();
  return translationCache[cacheKey];
}

async function mapWithConcurrency(items, worker, concurrency = 3) {
  const results = new Array(items.length);
  let index = 0;

  async function next() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length || 1) }, next));
  return results;
}

async function ensureMenuTranslations(lang) {
  if (lang === "ru" || !menuData.length) return;
  if (menuTranslationPromises[lang]) return menuTranslationPromises[lang];

  const untranslatedItems = menuData.filter((item) => !menuTranslations[lang]?.[item.id]);
  if (!untranslatedItems.length) return;

  menuTranslationPromises[lang] = mapWithConcurrency(untranslatedItems, async (item) => {
    const [name, category, description] = await Promise.all([
      translateText(item.name, lang),
      translateText(item.category, lang),
      translateText(item.description, lang)
    ]);

    menuTranslations[lang][item.id] = {
      name: name || item.name,
      category: category || item.category,
      description: description || item.description
    };
  }, 3).finally(() => {
    delete menuTranslationPromises[lang];
  });

  return menuTranslationPromises[lang];
}

function getDisplayItemForLanguage(item, lang = currentLanguage) {
  if (!item) return null;
  if (lang === "ru") {
    return {
      displayName: item.name,
      displayCategory: item.category,
      displayDescription: item.description,
      displayWeight: getLocalizedWeight(item.weight, lang),
      displayCalories: getLocalizedCalories(item.calories, lang)
    };
  }

  const translated = menuTranslations[lang]?.[item.id] || {};
  return {
    displayName: translated.name || item.name,
    displayCategory: translated.category || item.category,
    displayDescription: translated.description || item.description,
    displayWeight: getLocalizedWeight(item.weight, lang),
    displayCalories: getLocalizedCalories(item.calories, lang)
  };
}

function getDisplayItem(item) {
  return getDisplayItemForLanguage(item, currentLanguage);
}

function getDisplayCategoryLabel(category) {
  if (!category) return "";
  if (currentLanguage === "ru") return category;
  const match = menuData.find((item) => item.category === category);
  return match ? (menuTranslations[currentLanguage]?.[match.id]?.category || category) : category;
}

