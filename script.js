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
const TRANSLATION_CACHE_KEY = "pervoe-vtoroe-translation-cache-v1";
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
    settingsText: "Выберите язык. Сайт запомнит его и в следующий раз откроется уже на нём.",
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
    heroBannerClassicMetricLabel: "Среднее оформление",
    heroBannerClassicMetricValue: "1 минута",
    heroBannerInfoKicker: "Информация",
    heroBannerInstallChipPhone: "iPhone",
    heroBannerInstallChipPwa: "PWA",
    heroBannerInstallChipSafari: "Safari",
    heroBannerInstallKicker: "Добавить на экран",
    heroBannerInstallTitle: "Как скачать приложение на iPhone",
    heroBannerInstallText: "Сохраните сайт на рабочий стол и открывайте его как приложение без интерфейса браузера.",
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
    settingsText: "Тілді таңдаңыз. Сайт оны есте сақтап, келесі жолы сол тілде ашылады.",
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
    heroBannerClassicMetricLabel: "Рәсімдеудің орташа уақыты",
    heroBannerClassicMetricValue: "1 минут",
    heroBannerInfoKicker: "Ақпарат",
    heroBannerInstallChipPhone: "iPhone",
    heroBannerInstallChipPwa: "PWA",
    heroBannerInstallChipSafari: "Safari",
    heroBannerInstallKicker: "Басты экранға қосу",
    heroBannerInstallTitle: "Қосымшаны iPhone-ға қалай орнатуға болады",
    heroBannerInstallText: "Сайтты басты экранға сақтап, оны браузер жолағынсыз жеке қосымша сияқты ашыңыз.",
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
    settingsText: "Choose a language. The site will remember it and open in it next time.",
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
    heroBannerClassicMetricLabel: "Average checkout",
    heroBannerClassicMetricValue: "1 minute",
    heroBannerInfoKicker: "Info",
    heroBannerInstallChipPhone: "iPhone",
    heroBannerInstallChipPwa: "PWA",
    heroBannerInstallChipSafari: "Safari",
    heroBannerInstallKicker: "Add to home screen",
    heroBannerInstallTitle: "How to install the app on iPhone",
    heroBannerInstallText: "Save the site to your home screen and launch it like a real app without the browser interface.",
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
let translationCache = loadTranslationCache();
const systemThemeMedia = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
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
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveTranslationCache() {
  localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationCache));
}

function getLocale() {
  return LANGUAGE_META[currentLanguage]?.locale || "ru-RU";
}

function t(key, vars = {}) {
  const table = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.ru;
  const fallback = UI_TRANSLATIONS.ru[key] || key;
  const value = table[key] || fallback;
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

function normalizePhotoUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1200`;
  }
  const driveIdMatch = url.match(/[?&]id=([^&]+)/i);
  if (driveIdMatch && /drive\.google\.com/i.test(url)) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1200`;
  }
  return url;
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
      ...item,
      displayName: item.name,
      displayCategory: item.category,
      displayDescription: item.description,
      displayWeight: getLocalizedWeight(item.weight, lang),
      displayCalories: getLocalizedCalories(item.calories, lang)
    };
  }

  const translated = menuTranslations[lang]?.[item.id] || {};
  return {
    ...item,
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

function splitHeroBannerCopy(source) {
  const rawText = String(source || "").trim().replace(/\s+/g, " ");
  if (!rawText) return { title: "", body: "" };

  const separators = [" || ", " | ", " — ", " - ", ": "];
  for (const separator of separators) {
    if (!rawText.includes(separator)) continue;
    const [title, ...rest] = rawText.split(separator);
    const body = rest.join(separator).trim();
    if (title.trim() && body) {
      return { title: title.trim(), body };
    }
  }

  return { title: rawText, body: "" };
}

function createHeroBanner(rawValue, index) {
  const value = String(rawValue || "").trim();
  if (!value) return null;
  const bannerKey = encodeURIComponent(value.toLowerCase()).replace(/%/g, "").slice(0, 72) || String(index);

  const normalized = value.toLowerCase().replace(/\s+/g, " ");
  if (
    normalized.includes("как скачать приложение на ios") ||
    normalized.includes("как скачать приложение на iphone") ||
    normalized.includes("скачать приложение на ios") ||
    normalized.includes("скачать приложение на iphone")
  ) {
    return {
      id: `hero-banner-ios-${index}`,
      type: "ios-install",
      raw: value
    };
  }

  const { title, body } = splitHeroBannerCopy(value);
  if (!title) return null;

  return {
    id: `hero-banner-text-${bannerKey}-${index}`,
    type: "text",
    raw: value,
    title,
    body
  };
}

function getHeroBannerSignature(banner) {
  if (!banner) return "";
  if (banner.type === "classic") return "classic";
  if (banner.type === "ios-install") return "ios-install";
  return `${banner.type || "text"}::${banner.title || ""}::${banner.body || ""}`;
}

function getDefaultHeroBanners() {
  return [
    {
      id: "hero-banner-classic-default",
      type: "classic",
      raw: "__classic__"
    },
    {
      id: "hero-banner-ios-default",
      type: "ios-install",
      raw: "Как скачать приложение на IOS"
    }
  ];
}

function buildHeroBannersFromRows(rows, bannerColumnIndex) {
  const builtInBanners = getDefaultHeroBanners();
  if (!Array.isArray(rows) || bannerColumnIndex < 0) return builtInBanners;

  const seen = new Set(builtInBanners.map(getHeroBannerSignature));
  const banners = rows
    .slice(1)
    .map((line, index) => createHeroBanner(parseCsvLine(line)[bannerColumnIndex], index))
    .filter(Boolean)
    .filter((banner) => {
      const dedupeKey = getHeroBannerSignature(banner);
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });

  return [...builtInBanners, ...banners];
}

async function ensureHeroBannerTranslations(lang) {
  if (lang === "ru" || !heroBanners.length) return;
  if (heroBannerTranslationPromises[lang]) return heroBannerTranslationPromises[lang];

  const untranslatedBanners = heroBanners.filter((banner) => (
    banner.type === "text" && !heroBannerTranslations[lang]?.[banner.id]
  ));

  if (!untranslatedBanners.length) return;

  heroBannerTranslationPromises[lang] = mapWithConcurrency(untranslatedBanners, async (banner) => {
    const [title, body] = await Promise.all([
      translateText(banner.title, lang),
      banner.body ? translateText(banner.body, lang) : ""
    ]);

    heroBannerTranslations[lang][banner.id] = {
      title: title || banner.title,
      body: body || banner.body
    };
  }, 3).finally(() => {
    delete heroBannerTranslationPromises[lang];
  });

  return heroBannerTranslationPromises[lang];
}

function getDisplayHeroBanner(banner, lang = currentLanguage) {
  if (!banner) return null;

  if (banner.type === "classic") {
    return {
      ...banner,
      displayKicker: t("heroBannerClassicKicker"),
      displayTitle: t("heroBannerClassicTitle"),
      displayBody: t("heroBannerClassicSubtitle"),
      displayMetricLabel: t("heroBannerClassicMetricLabel"),
      displayMetricValue: t("heroBannerClassicMetricValue"),
      badges: [
        t("heroBannerClassicBadgeFresh"),
        t("heroBannerClassicBadgeFast"),
        t("heroBannerClassicBadgeFree")
      ]
    };
  }

  if (banner.type === "ios-install") {
    return {
      ...banner,
      displayKicker: t("heroBannerInstallKicker"),
      displayTitle: t("heroBannerInstallTitle"),
      displayBody: t("heroBannerInstallText"),
      displayNote: t("heroBannerInstallNote"),
      chips: [
        t("heroBannerInstallChipPhone"),
        t("heroBannerInstallChipPwa"),
        t("heroBannerInstallChipSafari")
      ],
      steps: [
        { icon: "language", text: t("heroBannerInstallStep1") },
        { icon: "ios_share", text: t("heroBannerInstallStep2") },
        { icon: "add_box", text: t("heroBannerInstallStep3") }
      ]
    };
  }

  if (lang === "ru") {
    return {
      ...banner,
      displayKicker: t("heroBannerInfoKicker"),
      displayTitle: banner.title,
      displayBody: banner.body
    };
  }

  const translated = heroBannerTranslations[lang]?.[banner.id] || {};
  return {
    ...banner,
    displayKicker: t("heroBannerInfoKicker"),
    displayTitle: translated.title || banner.title,
    displayBody: translated.body || banner.body
  };
}

function buildHeroBannerHtml(banner, index) {
  const displayBanner = getDisplayHeroBanner(banner) || banner;

  if (banner.type === "classic") {
    return `<article class="hero-banner-slide" aria-roledescription="slide" aria-label="${escapeHtml(`${index + 1}`)}">
      <div class="hero-banner hero-banner--classic">
        <div class="hero-banner-content">
          <p class="hero-banner-kicker">${escapeHtml(displayBanner.displayKicker)}</p>
          <h2 class="hero-banner-title">${escapeHtml(displayBanner.displayTitle)}</h2>
          <p class="hero-banner-text">${escapeHtml(displayBanner.displayBody)}</p>
          <div class="hero-banner-classic-badges">
            ${displayBanner.badges.map((badge) => `<span class="hero-banner-classic-badge">${escapeHtml(badge)}</span>`).join("")}
          </div>
        </div>
        <div class="hero-banner-art hero-banner-art--classic" aria-hidden="true">
          <div class="hero-banner-classic-card">
            <p class="hero-banner-classic-card-label">${escapeHtml(displayBanner.displayMetricLabel)}</p>
            <p class="hero-banner-classic-card-value">${escapeHtml(displayBanner.displayMetricValue)}</p>
            <div class="hero-banner-classic-card-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </article>`;
  }

  if (banner.type === "ios-install") {
    return `<article class="hero-banner-slide" aria-roledescription="slide" aria-label="${escapeHtml(`${index + 1}`)}">
      <div class="hero-banner hero-banner--ios">
        <div class="hero-banner-content">
          <div class="hero-banner-chips">
            ${displayBanner.chips.map((chip) => `<span class="hero-banner-chip">${escapeHtml(chip)}</span>`).join("")}
          </div>
          <p class="hero-banner-kicker">${escapeHtml(displayBanner.displayKicker)}</p>
          <h2 class="hero-banner-title">${escapeHtml(displayBanner.displayTitle)}</h2>
          <p class="hero-banner-text">${escapeHtml(displayBanner.displayBody)}</p>
          <div class="hero-banner-steps">
            ${displayBanner.steps.map((step) => `<div class="hero-banner-step"><span class="material-symbols-outlined hero-banner-step-icon" aria-hidden="true">${step.icon}</span><span class="hero-banner-step-text">${escapeHtml(step.text)}</span></div>`).join("")}
          </div>
          <p class="hero-banner-note">${escapeHtml(displayBanner.displayNote)}</p>
        </div>
        <div class="hero-banner-art" aria-hidden="true">
          <div class="hero-banner-orb hero-banner-orb-one"></div>
          <div class="hero-banner-orb hero-banner-orb-two"></div>
          <div class="hero-banner-device">
            <div class="hero-banner-device-notch"></div>
            <div class="hero-banner-device-screen">
              <div class="hero-banner-device-head"></div>
              <div class="hero-banner-device-card"></div>
              <div class="hero-banner-device-row"></div>
              <div class="hero-banner-device-row is-short"></div>
              <div class="hero-banner-device-footer">
                <span class="hero-banner-device-pill"></span>
                <span class="hero-banner-device-pill"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>`;
  }

  return `<article class="hero-banner-slide" aria-roledescription="slide" aria-label="${escapeHtml(`${index + 1}`)}">
    <div class="hero-banner hero-banner--generic">
      <div class="hero-banner-content">
        <p class="hero-banner-kicker">${escapeHtml(displayBanner.displayKicker)}</p>
        <h2 class="hero-banner-title">${escapeHtml(displayBanner.displayTitle)}</h2>
        ${displayBanner.displayBody ? `<p class="hero-banner-text">${escapeHtml(displayBanner.displayBody)}</p>` : ""}
      </div>
      <div class="hero-banner-art hero-banner-art--generic" aria-hidden="true">
        <div class="hero-banner-orb hero-banner-orb-one"></div>
        <div class="hero-banner-orb hero-banner-orb-two"></div>
      </div>
    </div>
  </article>`;
}

function syncHeroBannerTrack(options = {}) {
  const carousel = document.getElementById("hero-banner-carousel");
  const track = document.getElementById("hero-banner-track");
  if (!carousel || !track) return;

  const width = carousel.clientWidth || 1;
  const offsetX = Number(options.offsetX || 0);
  const withTransition = options.withTransition !== false;

  track.style.transition = withTransition ? HERO_CAROUSEL_TRANSITION : "none";
  track.style.transform = `translateX(${(-activeHeroBanner * width) + offsetX}px)`;
}

function updateHeroBannerCarousel() {
  const dots = document.getElementById("hero-banner-dots");
  if (!dots || !heroBanners.length) return;

  activeHeroBanner = ((activeHeroBanner % heroBanners.length) + heroBanners.length) % heroBanners.length;
  syncHeroBannerTrack({
    withTransition: !activeHeroIsDragging,
    offsetX: activeHeroIsDragging ? activeHeroDragOffsetX : 0
  });

  dots.querySelectorAll("[data-hero-slide-index]").forEach((button, index) => {
    const isActive = index === activeHeroBanner;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", String(isActive));
  });

  dots.classList.toggle("is-hidden", heroBanners.length <= 1);
}

function renderHeroBanners() {
  const carousel = document.getElementById("hero-banner-carousel");
  const track = document.getElementById("hero-banner-track");
  const dots = document.getElementById("hero-banner-dots");
  if (!carousel || !track || !dots) return;

  const banners = heroBanners.length ? heroBanners : getDefaultHeroBanners();
  heroBanners = banners;
  activeHeroBanner = Math.min(Math.max(activeHeroBanner, 0), banners.length - 1);

  carousel.setAttribute("aria-label", t("heroBannerCarouselAria"));
  track.innerHTML = banners.map((banner, index) => buildHeroBannerHtml(banner, index)).join("");
  dots.innerHTML = banners.map((banner, index) => (
    `<button class="hero-banner-dot${index === activeHeroBanner ? " is-active" : ""}" type="button" data-hero-slide-index="${index}" aria-label="${escapeHtml(t("heroBannerDotAria", { index: index + 1 }))}" aria-current="${index === activeHeroBanner ? "true" : "false"}"></button>`
  )).join("");

  updateHeroBannerCarousel();
}

function bindHeroBannerSwipeEvents() {
  const carousel = document.getElementById("hero-banner-carousel");
  if (!carousel || carousel.dataset.swipeBound === "true") return;
  carousel.dataset.swipeBound = "true";

  carousel.addEventListener("pointerdown", (event) => {
    if (heroBanners.length <= 1) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest(".hero-banner-dot")) return;

    activeHeroPointerId = event.pointerId;
    activeHeroDragStartX = event.clientX;
    activeHeroDragOffsetX = 0;
    activeHeroIsDragging = true;
    carousel.setPointerCapture(event.pointerId);
    syncHeroBannerTrack({ withTransition: false, offsetX: 0 });
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!activeHeroIsDragging || activeHeroPointerId !== event.pointerId) return;
    activeHeroDragOffsetX = event.clientX - activeHeroDragStartX;
    syncHeroBannerTrack({ withTransition: false, offsetX: activeHeroDragOffsetX });
  });

  const finishSwipe = (event) => {
    if (!activeHeroIsDragging || activeHeroPointerId !== event.pointerId) return;

    const carouselWidth = carousel.clientWidth || 1;
    const swipeThreshold = Math.max(carouselWidth * 0.16, 44);

    if (Math.abs(activeHeroDragOffsetX) > swipeThreshold && heroBanners.length > 1) {
      if (activeHeroDragOffsetX < 0) activeHeroBanner = (activeHeroBanner + 1) % heroBanners.length;
      if (activeHeroDragOffsetX > 0) activeHeroBanner = (activeHeroBanner - 1 + heroBanners.length) % heroBanners.length;
    }

    activeHeroPointerId = null;
    activeHeroDragStartX = 0;
    activeHeroDragOffsetX = 0;
    activeHeroIsDragging = false;
    updateHeroBannerCarousel();
  };

  carousel.addEventListener("pointerup", finishSwipe);
  carousel.addEventListener("pointercancel", finishSwipe);
  carousel.addEventListener("lostpointercapture", (event) => {
    if (!activeHeroIsDragging || activeHeroPointerId !== event.pointerId) return;
    finishSwipe(event);
  });
}

function findItemByAnyName(name) {
  return menuData.find((item) => {
    const displayItem = getDisplayItem(item);
    return item.name === name || displayItem?.displayName === name;
  }) || null;
}

function getItemByName(name) {
  return menuData.find((item) => item.name === name) || null;
}

function getItemPhotos(item) {
  if (!item) return [];
  const rawPhotos = Array.isArray(item.photos) && item.photos.length ? item.photos : [item.photo];
  return [...new Set(rawPhotos.map(normalizePhotoUrl).filter(Boolean))];
}

function buildDishPhotoHtml(item, className = "food-image") {
  const [photoUrl] = getItemPhotos(item);
  const displayItem = getDisplayItem(item) || item;
  if (photoUrl) {
    return `<img class="${className}" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(displayItem.displayName || item.name)}" loading="lazy" />`;
  }
  return `<div class="food-image-placeholder">${escapeHtml(t("dishPhotoSoon"))}</div>`;
}

function getDishSlideCount(item) {
  return Math.max(getItemPhotos(item).length, 1);
}

function syncDishModalTrack(options = {}) {
  const track = document.getElementById("dish-modal-track");
  const gallery = document.querySelector(".dish-modal-gallery");
  if (!track || !gallery) return;

  const width = gallery.clientWidth || 1;
  const offsetX = Number(options.offsetX || 0);
  const withTransition = options.withTransition !== false;

  track.style.transition = withTransition ? DISH_CAROUSEL_TRANSITION : "none";
  track.style.transform = `translateX(${(-activeDishSlide * width) + offsetX}px)`;
}

function renderDishModalSlides(item) {
  const track = document.getElementById("dish-modal-track");
  if (!track || !item) return 1;

  const photos = getItemPhotos(item);
  const totalSlides = getDishSlideCount(item);
  const photoKey = photos.length ? photos.join("|") : "__empty__";
  const displayItem = getDisplayItem(item) || item;

  if (track.dataset.photoKey !== photoKey) {
    track.innerHTML = photos.length
      ? photos.map((photoUrl, index) => (
        `<div class="dish-modal-slide">
          <img class="dish-modal-image" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(`${displayItem.displayName || item.name} ${index + 1}`)}" loading="eager" decoding="async" draggable="false" />
        </div>`
      )).join("")
      : `<div class="dish-modal-slide"><div class="dish-modal-image-placeholder">${escapeHtml(t("dishPhotoSoon"))}</div></div>`;

    track.dataset.photoKey = photoKey;
  }

  activeDishPhotoKey = photoKey;
  return totalSlides;
}

function renderDishModalDots(totalSlides) {
  const dots = document.getElementById("dish-modal-dots");
  if (!dots) return;

  dots.innerHTML = Array.from({ length: totalSlides }, (_, index) => (
    `<button class="dish-modal-dot${index === activeDishSlide ? " is-active" : ""}" type="button" data-slide-index="${index}" aria-label="${escapeHtml(`${t("dishNextPhotoAria")} ${index + 1}`)}" aria-current="${index === activeDishSlide ? "true" : "false"}"></button>`
  )).join("");
}

function preloadDishPhotos(item) {
  getItemPhotos(item).forEach((photoUrl) => {
    const image = new Image();
    image.decoding = "async";
    image.src = photoUrl;
  });
}

function showToast(text) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
}

function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) cart = parsed.filter((item) => item && item.name && Number(item.qty) > 0);
  } catch {
    cart = [];
  }
}
function savePromo() { localStorage.setItem(PROMO_KEY, JSON.stringify(promo)); }
function loadPromo() {
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.discount === "number") promo = parsed;
  } catch {
    promo = { code: "", discount: 0 };
  }
}

function applyPromoCode() {
  const input = document.getElementById("promo-code");
  const hint = document.getElementById("promo-hint");
  const code = String(input.value || "").trim().toUpperCase();

  if (!code) {
    promo = { code: "", discount: 0 };
    hint.textContent = t("promoMissing");
    savePromo();
    updateTotals();
    return;
  }

  if (code === "SKIDKA10") {
    promo = { code, discount: 10 };
    hint.textContent = t("promoAppliedPercent");
  } else if (code === "FIRST200") {
    promo = { code, discount: 200 };
    hint.textContent = t("promoAppliedFixed");
  } else {
    promo = { code: "", discount: 0 };
    hint.textContent = t("promoNotFound");
  }

  savePromo();
  updateTotals();
}

function getCartQty(name) {
  const found = cart.find((x) => x.name === name);
  return found ? found.qty : 0;
}

function syncOverlayState() {
  const cartModal = document.getElementById("cart-modal");
  const dishModal = document.getElementById("dish-modal");

  const isOverlayActive = (element) => Boolean(
    element &&
    (element.classList.contains("show") || element.classList.contains("is-closing"))
  );

  const hasOverlayOpen = Boolean(
    isOverlayActive(cartModal) ||
    isOverlayActive(dishModal)
  );

  document.body.classList.toggle("no-scroll", hasOverlayOpen);

  const cartButton = document.getElementById("cart-button");
  if (cartButton) cartButton.classList.toggle("is-hidden", hasOverlayOpen);
}

const OVERLAY_CLOSE_DURATION = 340;

function openOverlay(element) {
  if (!element) return;
  if (element.__closeTimer) {
    clearTimeout(element.__closeTimer);
    element.__closeTimer = null;
  }

  element.classList.remove("is-closing");
  element.setAttribute("aria-hidden", "false");
  syncOverlayState();
  requestAnimationFrame(() => {
    element.classList.add("show");
  });
}

function closeOverlay(element) {
  if (!element) return;
  if (!element.classList.contains("show") && !element.classList.contains("is-closing")) return;

  if (element.__closeTimer) {
    clearTimeout(element.__closeTimer);
  }

  element.classList.remove("show");
  element.classList.add("is-closing");
  syncOverlayState();

  element.__closeTimer = setTimeout(() => {
    element.classList.remove("is-closing");
    element.setAttribute("aria-hidden", "true");
    element.__closeTimer = null;
    syncOverlayState();
  }, OVERLAY_CLOSE_DURATION);
}

function openCart() {
  openOverlay(document.getElementById("cart-modal"));
}

function closeCart() {
  closeOverlay(document.getElementById("cart-modal"));
}

function showThanksModal() {
  const el = document.getElementById("thanks-modal");
  if (el) el.classList.add("show");
}

function hideThanksModal() {
  const el = document.getElementById("thanks-modal");
  if (el) el.classList.remove("show");
}

function updateDishModalCarousel(item) {
  const modal = document.getElementById("dish-modal");
  const track = document.getElementById("dish-modal-track");
  const dots = document.getElementById("dish-modal-dots");
  const prevBtn = document.getElementById("dish-modal-prev");
  const nextBtn = document.getElementById("dish-modal-next");
  if (!modal || !track || !dots || !prevBtn || !nextBtn || !item) return;

  const totalSlides = renderDishModalSlides(item);
  activeDishSlide = Math.min(Math.max(activeDishSlide, 0), totalSlides - 1);
  syncDishModalTrack({ withTransition: !activeDishIsDragging, offsetX: activeDishIsDragging ? activeDishDragOffsetX : 0 });
  renderDishModalDots(totalSlides);

  const multipleSlides = totalSlides > 1;
  prevBtn.classList.toggle("is-hidden", !multipleSlides);
  nextBtn.classList.toggle("is-hidden", !multipleSlides);
  dots.classList.toggle("is-hidden", !multipleSlides);
}

function updateDishModalControls() {
  const controls = document.getElementById("dish-modal-controls");
  if (!controls || !activeDishName) return;
  const qty = getCartQty(activeDishName);
  const previousState = controls.dataset.state || "add";
  const nextState = qty > 0 ? "qty" : "add";
  controls.dataset.state = nextState;
  controls.innerHTML = buildControlsHtml(activeDishName, {
    animate: previousState !== nextState,
    state: nextState
  });
  bindMenuControlEvents();
}

function renderDishModal(item) {
  if (!item) return;
  const displayItem = getDisplayItem(item);
  const title = document.getElementById("dish-modal-title");
  const price = document.getElementById("dish-modal-price");
  const weight = document.getElementById("dish-modal-weight");
  const category = document.getElementById("dish-modal-category");
  const tagWeight = document.getElementById("dish-modal-tag-weight");
  const meta = document.getElementById("dish-modal-meta");
  const description = document.getElementById("dish-modal-description");

  const metaParts = [];
  if (displayItem.displayCalories) metaParts.push(displayItem.displayCalories);

  title.textContent = displayItem.displayName;
  price.textContent = money(item.price);
  weight.textContent = "";
  weight.classList.add("is-empty");
  category.textContent = displayItem.displayCategory || t("dishNoCategory");
  category.classList.toggle("is-empty", !displayItem.displayCategory && !t("dishNoCategory"));
  tagWeight.textContent = displayItem.displayWeight || "";
  tagWeight.classList.toggle("is-empty", !displayItem.displayWeight);
  meta.textContent = metaParts.join(" • ");
  meta.classList.toggle("is-empty", !metaParts.length);
  description.textContent = displayItem.displayDescription || t("dishDescriptionFallback");
  description.classList.toggle("is-empty", !displayItem.displayDescription);

  preloadDishPhotos(item);
  updateDishModalCarousel(item);
  updateDishModalControls();
}

function openDishModal(name) {
  const item = getItemByName(name);
  const modal = document.getElementById("dish-modal");
  if (!item || !modal) return;
  activeDishName = item.name;
  activeDishSlide = 0;
  activeDishPointerId = null;
  activeDishDragStartX = 0;
  activeDishDragOffsetX = 0;
  activeDishIsDragging = false;
  renderDishModal(item);
  openOverlay(modal);
}

function closeDishModal() {
  const modal = document.getElementById("dish-modal");
  if (!modal) return;
  closeOverlay(modal);
  activeDishName = "";
  activeDishSlide = 0;
  activeDishPointerId = null;
  activeDishDragStartX = 0;
  activeDishDragOffsetX = 0;
  activeDishIsDragging = false;
}

function updateCartButton() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const btn = document.getElementById("cart-button");
  const countEl = document.getElementById("cart-count");
  countEl.textContent = count;
  if (count > 0) btn.classList.add("visible");
  else btn.classList.remove("visible");
}

function updateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let discountAmount = 0;
  if (promo.discount > 0 && promo.discount < 100) discountAmount = Math.round(subtotal * promo.discount / 100);
  else discountAmount = promo.discount;
  discountAmount = Math.min(discountAmount, subtotal);
  const finalTotal = subtotal - discountAmount;
  const hasDiscount = discountAmount > 0;
  const subtotalRow = document.getElementById("subtotal-row");
  const discountRow = document.getElementById("discount-row");
  const totalLabel = document.getElementById("total-label");
  const totalsBox = document.querySelector(".totals-box");

  document.getElementById("subtotal-amount").textContent = money(subtotal);
  document.getElementById("discount-amount").textContent = money(discountAmount);
  document.getElementById("total-amount").textContent = Number(finalTotal).toLocaleString(getLocale());
  if (subtotalRow) subtotalRow.classList.toggle("is-hidden", !hasDiscount);
  if (discountRow) discountRow.classList.toggle("is-hidden", !hasDiscount);
  if (totalLabel) totalLabel.textContent = hasDiscount ? t("total") : t("totalFull");
  if (totalsBox) totalsBox.classList.toggle("is-compact", !hasDiscount);
  return { finalTotal };
}

function updateSearchClearVisibility() {
  const clearBtn = document.getElementById("search-clear");
  if (!clearBtn) return;
  if (searchQuery.trim()) clearBtn.classList.add("show");
  else clearBtn.classList.remove("show");
}

function updateMenuControls() {
  document.querySelectorAll(".food-card[data-item-name]").forEach((card) => {
    const name = card.dataset.itemName;
    const controls = card.querySelector(".item-controls");
    if (!controls) return;
    const qty = getCartQty(name);
    const previousState = controls.dataset.state || "add";
    const nextState = qty > 0 ? "qty" : "add";

    controls.dataset.state = nextState;
    card.dataset.cartState = nextState;
    controls.innerHTML = buildControlsHtml(name, {
      animate: previousState !== nextState,
      state: nextState
    });
  });

  bindMenuControlEvents();
  updateDishModalControls();
}

function addToCart(item) {
  const found = cart.find((x) => x.name === item.name);
  if (found) found.qty += 1;
  else cart.push({ name: item.name, price: item.price, qty: 1, weight: item.weight, calories: item.calories });

  renderCart();
  updateMenuControls();
  saveCart();
  const displayItem = getDisplayItem(item);
  showToast(t("toastAdded", { name: displayItem.displayName || item.name }));
}

function changeQty(name, delta) {
  const found = cart.find((x) => x.name === name);
  if (!found) return;
  found.qty += delta;
  if (found.qty <= 0) cart = cart.filter((x) => x.name !== name);

  renderCart();
  updateMenuControls();
  saveCart();
}

function removeFromCart(name) {
  cart = cart.filter((x) => x.name !== name);
  renderCart();
  updateMenuControls();
  saveCart();
}

function renderCategories() {
  const categoriesEl = document.getElementById("categories");
  const uniqueCategories = [...new Set(menuData.map((item) => item.category).filter(Boolean))];
  const orderedFromSheet = categoryOrderList.filter((cat) => uniqueCategories.includes(cat));
  const notInSheetOrder = uniqueCategories.filter((cat) => !orderedFromSheet.includes(cat));
  const categories = [ALL_CATEGORY, ...orderedFromSheet, ...notInSheetOrder];

  categoriesEl.innerHTML = categories
    .map((cat) => {
      const translatedCategory = cat === ALL_CATEGORY
        ? t("categoriesAll")
        : getDisplayCategoryLabel(cat);
      return `<button class="category-btn ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${escapeHtml(translatedCategory)}</button>`;
    })
    .join("");

  categoriesEl.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderCategories();
      renderMenu();
      const menuGrid = document.getElementById("menu-grid");
      const header = document.getElementById("site-header");
      const menuDock = document.getElementById("menu-dock");
      if (menuGrid) {
        const headerHeight = header ? header.offsetHeight : 0;
        const dockHeight = menuDock ? menuDock.offsetHeight : 0;
        const top = menuGrid.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({ top: Math.max(top - dockHeight, 0), behavior: "smooth" });
      }
    });
  });
}

function renderCategoriesSkeleton() {
  const categoriesEl = document.getElementById("categories");
  if (!categoriesEl) return;
  const skeletonItems = [88, 126, 114, 98, 108, 92];
  categoriesEl.innerHTML = skeletonItems
    .map((width) => `<span class="category-skeleton" style="width:${width}px" aria-hidden="true"></span>`)
    .join("");
}

function buildControlsHtml(name, options = {}) {
  const qty = getCartQty(name);
  const state = options.state || (qty > 0 ? "qty" : "add");
  const animationClass = options.animate ? " is-entering" : "";
  return qty > 0
    ? `<div class="qty-inline${animationClass}" data-state="${state}"><button class="card-minus" data-name="${escapeHtml(name)}">-</button><span>${qty}</span><button class="card-plus" data-name="${escapeHtml(name)}">+</button></div>`
    : `<button class="btn-add${animationClass}" data-state="${state}" data-name="${escapeHtml(name)}"><span class="btn-add-main"><span class="btn-add-label">${escapeHtml(t("addButton"))}</span></span></button>`;
}

function bindMenuControlEvents() {
  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.onclick = (event) => {
      event.stopPropagation();
      const item = menuData.find((x) => x.name === btn.dataset.name);
      if (item) addToCart(item);
    };
  });

  document.querySelectorAll(".card-plus").forEach((btn) => {
    btn.onclick = (event) => {
      event.stopPropagation();
      changeQty(btn.dataset.name, 1);
    };
  });

  document.querySelectorAll(".card-minus").forEach((btn) => {
    btn.onclick = (event) => {
      event.stopPropagation();
      changeQty(btn.dataset.name, -1);
    };
  });
}

function bindMenuCardEvents() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;

  grid.querySelectorAll(".food-card").forEach((card) => {
    card.onclick = () => openDishModal(card.dataset.itemName);
    card.onkeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDishModal(card.dataset.itemName);
      }
    };
  });
}

function bindDishModalSwipeEvents() {
  const gallery = document.getElementById("dish-modal-gallery") || document.querySelector(".dish-modal-gallery");
  if (!gallery || gallery.dataset.swipeBound === "true") return;
  gallery.dataset.swipeBound = "true";

  gallery.addEventListener("pointerdown", (event) => {
    const item = getItemByName(activeDishName);
    if (!item || getDishSlideCount(item) <= 1) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest(".dish-modal-nav, .dish-modal-dot, .dish-modal-close")) return;

    activeDishPointerId = event.pointerId;
    activeDishDragStartX = event.clientX;
    activeDishDragOffsetX = 0;
    activeDishIsDragging = true;
    gallery.setPointerCapture(event.pointerId);
    syncDishModalTrack({ withTransition: false, offsetX: 0 });
  });

  gallery.addEventListener("pointermove", (event) => {
    if (!activeDishIsDragging || activeDishPointerId !== event.pointerId) return;
    activeDishDragOffsetX = event.clientX - activeDishDragStartX;
    syncDishModalTrack({ withTransition: false, offsetX: activeDishDragOffsetX });
  });

  const finishSwipe = (event) => {
    if (!activeDishIsDragging || activeDishPointerId !== event.pointerId) return;

    const item = getItemByName(activeDishName);
    const totalSlides = item ? getDishSlideCount(item) : 1;
    const galleryWidth = gallery.clientWidth || 1;
    const swipeThreshold = Math.max(galleryWidth * 0.16, 44);

    if (Math.abs(activeDishDragOffsetX) > swipeThreshold && totalSlides > 1) {
      if (activeDishDragOffsetX < 0 && activeDishSlide < totalSlides - 1) activeDishSlide += 1;
      if (activeDishDragOffsetX > 0 && activeDishSlide > 0) activeDishSlide -= 1;
    }

    activeDishPointerId = null;
    activeDishDragStartX = 0;
    activeDishDragOffsetX = 0;
    activeDishIsDragging = false;

    if (item) updateDishModalCarousel(item);
    else syncDishModalTrack({ withTransition: true, offsetX: 0 });
  };

  gallery.addEventListener("pointerup", finishSwipe);
  gallery.addEventListener("pointercancel", finishSwipe);
  gallery.addEventListener("lostpointercapture", (event) => {
    if (!activeDishIsDragging || activeDishPointerId !== event.pointerId) return;
    finishSwipe(event);
  });
}

function renderMenu() {
  const grid = document.getElementById("menu-grid");
  const byCategory = activeCategory === ALL_CATEGORY ? menuData : menuData.filter((item) => item.category === activeCategory);
  const filtered = byCategory.filter((item) => {
    const displayItem = getDisplayItem(item);
    const query = searchQuery.toLowerCase();
    return !query || item.name.toLowerCase().includes(query) || String(displayItem.displayName || "").toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="status">${escapeHtml(t("noResults"))}</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map((item, index) => {
      const displayItem = getDisplayItem(item);
      const categoryHtml = `<p class="food-category${displayItem.displayCategory ? "" : " is-empty"}">${displayItem.displayCategory ? escapeHtml(displayItem.displayCategory) : "&nbsp;"}</p>`;
      const weightHtml = `<span class="food-weight${displayItem.displayWeight ? "" : " is-empty"}">${displayItem.displayWeight ? escapeHtml(displayItem.displayWeight) : "&nbsp;"}</span>`;
      const imageHtml = buildDishPhotoHtml(item);

      return `<article class="food-card" data-item-name="${escapeHtml(item.name)}" data-cart-state="${getCartQty(item.name) > 0 ? "qty" : "add"}" tabindex="0" role="button" aria-label="${escapeHtml(t("dishOpenAria", { name: displayItem.displayName || item.name }))}" style="animation-delay:${index * 0.06}s">${imageHtml}<div class="food-copy"><div class="food-topline"><div class="food-price">${money(item.price)}</div>${weightHtml}</div><h3 class="food-title">${escapeHtml(displayItem.displayName || item.name)}</h3><div class="food-details">${categoryHtml}</div></div><div class="food-footer"><div class="item-controls" data-state="${getCartQty(item.name) > 0 ? "qty" : "add"}">${buildControlsHtml(item.name)}</div></div></article>`;
    })
    .join("");

  bindMenuControlEvents();
  bindMenuCardEvents();
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="status">${escapeHtml(t("cartEmpty"))}</p>`;
    document.getElementById("subtotal-amount").textContent = money(0);
    document.getElementById("discount-amount").textContent = money(0);
    document.getElementById("total-amount").textContent = "0";
    updateCartButton();
    return;
  }

  cartItems.innerHTML = cart
    .map((item) => {
      const menuItem = getItemByName(item.name);
      const displayItem = menuItem ? getDisplayItem(menuItem) : { displayName: item.name };
      const sum = item.price * item.qty;
      return `<div class="cart-item"><div class="cart-item-top"><span class="cart-item-name">${escapeHtml(displayItem.displayName || item.name)}</span><strong>${money(sum)}</strong></div><div class="cart-controls"><div class="qty-box"><button class="qty-btn" data-action="minus" data-name="${item.name}">-</button><span>${item.qty}</span><button class="qty-btn" data-action="plus" data-name="${item.name}">+</button></div><button class="remove-btn" data-action="remove" data-name="${item.name}">${escapeHtml(t("removeButton"))}</button></div></div>`;
    })
    .join("");

  cartItems.querySelectorAll("button").forEach((btn) => {
    const { action, name } = btn.dataset;
    btn.addEventListener("click", () => {
      if (action === "plus") changeQty(name, 1);
      if (action === "minus") changeQty(name, -1);
      if (action === "remove") removeFromCart(name);
    });
  });

  updateTotals();
  updateCartButton();
}

function createWhatsAppMessage(userName, userPhone, userAddress, orderComment) {
  const { finalTotal } = updateTotals();
  const buildSection = (lang) => {
    const table = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ru;
    const lines = cart.map((item) => {
      const menuItem = getItemByName(item.name);
      const displayItem = menuItem
        ? getDisplayItemForLanguage(menuItem, lang)
        : { displayName: item.name, displayWeight: getLocalizedWeight(item.weight, lang) };
      const weightText = displayItem.displayWeight ? ` (${displayItem.displayWeight})` : "";
      return `- ${displayItem.displayName || item.name}${weightText} x${item.qty} - ${money(item.price * item.qty, lang)}`;
    }).join("\n");

    const commentText = orderComment ? `\n${table.waComment}: ${orderComment}` : "";
    const promoText = promo.code ? `\n${table.waPromo}: ${promo.code}` : "";

    return `${table.waGreeting}\n${table.waIntro}\n${table.waName}: ${userName}\n${table.waPhone}: ${userPhone}\n${table.waAddress}: ${userAddress}${commentText}${promoText}\n${table.waOrder}:\n${lines}\n\n${table.waTotal}: ${money(finalTotal, lang)}`;
  };

  if (currentLanguage === "kk") {
    return `${buildSection("kk")}\n\n${buildSection("ru")}`;
  }

  if (currentLanguage === "en") {
    return `${buildSection("ru")}\n\n${buildSection("en")}`;
  }

  return buildSection("ru");
}

function cleanPhone(phone) {
  return String(phone).replace(/\D/g, "");
}

function syncStickyOffsets() {
  const header = document.getElementById("site-header");
  if (!header) return;
  document.documentElement.style.setProperty("--logo-bar-height", `${Math.ceil(header.offsetHeight)}px`);
}

function updateHeroSearchState() {
  const heroBand = document.getElementById("hero-band");
  const searchInput = document.getElementById("menu-search");
  if (!heroBand || !searchInput) return;
  const shouldHide = document.activeElement === searchInput || searchQuery.trim().length > 0;
  heroBand.classList.toggle("is-hidden", shouldHide);
}

function updateSettingsLanguageButtons(isBusy = false) {
  document.querySelectorAll(".settings-language-btn").forEach((button) => {
    const isActive = button.dataset.lang === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.disabled = isBusy;
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateThemeButtons(isBusy = false) {
  document.querySelectorAll(".settings-theme-btn").forEach((button) => {
    const isActive = button.dataset.themeMode === currentThemeMode;
    button.classList.toggle("is-active", isActive);
    button.disabled = isBusy;
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = t("siteTitle");

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };
  const setPlaceholder = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.placeholder = value;
  };
  const setAriaLabel = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("aria-label", value);
  };

  setAriaLabel("#settings-toggle", t("settingsButtonAria"));
  setText("#settings-popover-kicker", t("settingsKicker"));
  setText("#settings-popover-title", t("settingsTitle"));
  setText("#settings-popover-text", t("settingsText"));
  const languageGroup = document.querySelector(".settings-language-list");
  if (languageGroup) languageGroup.setAttribute("aria-label", t("settingsGroupAria"));
  setText('.settings-language-btn[data-lang="ru"]', t("languageRu"));
  setText('.settings-language-btn[data-lang="kk"]', t("languageKk"));
  setText('.settings-language-btn[data-lang="en"]', t("languageEn"));
  setText("#settings-theme-title", t("settingsThemeTitle"));
  setText("#settings-theme-text", t("settingsThemeText"));
  const themeGroup = document.querySelector(".settings-theme-list");
  if (themeGroup) themeGroup.setAttribute("aria-label", t("settingsThemeGroupAria"));
  setText('.settings-theme-btn[data-theme-mode="auto"]', t("themeAuto"));
  setText('.settings-theme-btn[data-theme-mode="light"]', t("themeLight"));
  setText('.settings-theme-btn[data-theme-mode="dark"]', t("themeDark"));
  const logo = document.querySelector("[data-logo-src-light]");
  if (logo) logo.alt = t("logoAlt");
  const heroCarousel = document.getElementById("hero-banner-carousel");
  if (heroCarousel) heroCarousel.setAttribute("aria-label", t("heroBannerCarouselAria"));

  setPlaceholder("#menu-search", t("searchPlaceholder"));
  setAriaLabel("#search-clear", t("searchClearAria"));
  setText("#menu-loading-text", t("loadingMenu"));

  setText("#address-link", t("address"));
  setText("#review-link-text", t("footerReview"));
  setAriaLabel("#to-top", t("toTopAria"));
  setText("#cart-button-label", t("cartButton"));

  setText("#cart-modal-title", t("cartTitle"));
  setAriaLabel("#close-modal", t("closeAria"));
  setText("#promo-code-label", t("promoLabel"));
  setPlaceholder("#promo-code", t("promoPlaceholder"));
  setText("#promo-apply", t("promoApply"));
  setText("#subtotal-label", t("subtotal"));
  setText("#discount-label", t("discount"));
  setText("#total-label", t("totalFull"));
  setText("#order-form-title", t("deliveryTitle"));
  setPlaceholder("#user-name", t("namePlaceholder"));
  setPlaceholder("#user-phone", t("phonePlaceholder"));
  setPlaceholder("#user-address", t("addressPlaceholder"));
  setPlaceholder("#order-comment", t("commentPlaceholder"));
  setText("#btn-order-text", t("orderButton"));
  setText("#payment-note", t("paymentNote"));

  setAriaLabel("#dish-modal-close", t("dishCloseAria"));
  setAriaLabel("#dish-modal-prev", t("dishPrevPhotoAria"));
  setAriaLabel("#dish-modal-next", t("dishNextPhotoAria"));
  setText("#dish-modal-copy-label", t("dishAbout"));

  setText("#thanks-title", t("thanksTitle"));
  setText("#thanks-text", t("thanksText"));
  setText("#thanks-close", t("thanksButton"));

  const promoHint = document.getElementById("promo-hint");
  if (promoHint) {
    if (!promo.code) promoHint.textContent = "";
    else if (promo.code === "SKIDKA10") promoHint.textContent = t("promoAppliedPercent");
    else if (promo.code === "FIRST200") promoHint.textContent = t("promoAppliedFixed");
  }

  renderHeroBanners();
  if (lastMenuLoadError && !menuData.length) renderMenuErrorState(lastMenuLoadError);
}

function showMenuTranslatingState() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  grid.innerHTML = `<div class="ios-loader-wrap"><div class="ios-loader"></div><p class="status">${t("translatingMenu")}</p></div>`;
}

function renderMenuErrorState(errorMessage) {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  lastMenuLoadError = String(errorMessage || "");

  grid.innerHTML = `<div class="status-card">
    <p class="status-card-title">${escapeHtml(t("loadErrorHeading"))}</p>
    <p class="status">${escapeHtml(t("loadError", { message: errorMessage }))}</p>
    <button id="menu-retry-button" class="status-retry-btn" type="button">${escapeHtml(t("retryLoadButton"))}</button>
  </div>`;

  const retryButton = document.getElementById("menu-retry-button");
  if (retryButton) {
    retryButton.addEventListener("click", () => {
      loadMenu();
    });
  }
}

async function setLanguage(lang) {
  if (!LANGUAGE_META[lang] || lang === currentLanguage) return;
  currentLanguage = lang;
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  applyStaticTranslations();
  updateSettingsLanguageButtons(true);

  if (menuData.length && currentLanguage !== "ru") {
    showMenuTranslatingState();
    await Promise.all([
      ensureMenuTranslations(currentLanguage),
      ensureHeroBannerTranslations(currentLanguage)
    ]);
  }

  renderHeroBanners();
  renderCategories();
  renderMenu();
  renderCart();
  updateTotals();
  updateCartButton();
  const retryButton = document.getElementById("menu-retry-button");
  if (retryButton) retryButton.textContent = t("retryLoadButton");
  if (activeDishName) {
    const item = getItemByName(activeDishName);
    if (item) renderDishModal(item);
  }

  updateSettingsLanguageButtons(false);
  updateThemeButtons(false);
}

function setThemeMode(mode) {
  if (!["auto", "light", "dark"].includes(mode) || mode === currentThemeMode) return;
  applyTheme(mode, { persist: true });
}

function openSettingsPopover() {
  const popover = document.getElementById("settings-popover");
  const toggle = document.getElementById("settings-toggle");
  if (!popover || !toggle) return;
  popover.classList.add("show");
  popover.setAttribute("aria-hidden", "false");
  toggle.setAttribute("aria-expanded", "true");
}

function closeSettingsPopover() {
  const popover = document.getElementById("settings-popover");
  const toggle = document.getElementById("settings-toggle");
  if (!popover || !toggle) return;
  popover.classList.remove("show");
  popover.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
}

function toggleSettingsPopover() {
  const popover = document.getElementById("settings-popover");
  if (!popover) return;
  if (popover.classList.contains("show")) closeSettingsPopover();
  else openSettingsPopover();
}

async function loadMenu() {
  const grid = document.getElementById("menu-grid");
  lastMenuLoadError = "";
  document.body.classList.add("menu-loading");
  renderCategoriesSkeleton();
  grid.innerHTML = `<div class="ios-loader-wrap"><div class="ios-loader"></div><p class="status">${escapeHtml(t("loadingMenu"))}</p></div>`;
  try {
    const response = await fetch(CONFIG.csvUrl, { redirect: "follow" });
    if (!response.ok) throw new Error(`Не удалось загрузить CSV (код ${response.status})`);

    const text = await response.text();
    const rows = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (rows.length < 2) throw new Error("CSV empty");

    const headers = parseCsvLine(rows[0]).map((h) => h.trim().toLowerCase());
    const cleanHeaders = headers.map((h) => h.replace(/\s+/g, " "));

    const aliases = {
      name: ["name", "наименование", "название"],
      price: ["price", "цена"],
      category: ["category", "категория"],
      available: ["available", "наличие (да/нет)", "наличие"],
      photo: ["photo", "photo 1", "photo 2", "фото", "фото 1", "фото 2", "image", "image 1", "image 2", "картинка", "картинка 1", "картинка 2"],
      banner: ["banner", "banners", "баннер", "баннеры"],
      description: ["description", "описание"],
      weight: ["weight", "граммовка", "вес", "граммы"],
      calories: ["calories", "калории", "ккал"],
      categoryOrder: ["category order", "category_order", "порядок категорий", "порядок категории"]
    };

    const findIndexByAliases = (key) => cleanHeaders.findIndex((header) => aliases[key].includes(header));
    const photoIndexes = cleanHeaders.reduce((acc, header, index) => {
      const isPhotoColumn = aliases.photo.includes(header) || /^(photo|image|фото|картинка)(\s*\d+)?$/i.test(header);
      if (isPhotoColumn) acc.push(index);
      return acc;
    }, []);

    const iName = findIndexByAliases("name");
    const iPrice = findIndexByAliases("price");
    const iCategory = findIndexByAliases("category");
    const iAvailable = findIndexByAliases("available");
    const iPhoto = findIndexByAliases("photo");
    const iBanner = findIndexByAliases("banner");
    const iDescription = findIndexByAliases("description");
    const iWeight = findIndexByAliases("weight");
    const iCalories = findIndexByAliases("calories");
    const iCategoryOrder = findIndexByAliases("categoryOrder");

    if ([iName, iPrice, iCategory, iAvailable].some((i) => i === -1)) {
      throw new Error("Missing required CSV columns");
    }

    // Порядок категорий берется из отдельного столбца.
    // Если категория не указана в этом столбце — она идет в конец.
    if (iCategoryOrder >= 0) {
      categoryOrderList = rows
        .slice(1)
        .map((line) => parseCsvLine(line))
        .map((cols) => String(cols[iCategoryOrder] || "").trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index);
    } else {
      categoryOrderList = [];
    }

    heroBanners = buildHeroBannersFromRows(rows, iBanner);
    activeHeroBanner = 0;
    renderHeroBanners();

    menuData = rows
      .slice(1)
      .map((line, index) => ({ cols: parseCsvLine(line), index }))
      .map(({ cols, index }) => {
        const photos = photoIndexes
          .map((index) => cols[index] || "")
          .map((value) => normalizePhotoUrl(value))
          .filter(Boolean);

        return {
          id: `item-${index}`,
          name: cols[iName] || "",
          price: Number(cols[iPrice]) || 0,
          category: cols[iCategory] || "",
          available: ["true", "да", "yes", "1"].includes(String(cols[iAvailable] || "").trim().toLowerCase()),
          photo: photos[0] || (iPhoto >= 0 ? normalizePhotoUrl(cols[iPhoto]) : ""),
          photos,
          description: iDescription >= 0 ? cols[iDescription] : "",
          weight: iWeight >= 0 ? cols[iWeight] : "",
          calories: iCalories >= 0 ? cols[iCalories] : ""
        };
      })
      .filter((item) => item.name && item.available);

    if (!menuData.length) {
      lastMenuLoadError = "";
      grid.innerHTML = `<p class="status">${escapeHtml(t("noAvailable"))}</p>`;
      return;
    }

    if (currentLanguage !== "ru") {
      showMenuTranslatingState();
      await Promise.all([
        ensureMenuTranslations(currentLanguage),
        ensureHeroBannerTranslations(currentLanguage)
      ]);
      renderHeroBanners();
    }

    renderCategories();
    renderMenu();
  } catch (error) {
    renderMenuErrorState(error.message);
  } finally {
    document.body.classList.remove("menu-loading");
    updateCartButton();
  }
}

document.getElementById("cart-button").addEventListener("click", openCart);
document.getElementById("to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
document.getElementById("thanks-close").addEventListener("click", hideThanksModal);
document.getElementById("thanks-modal").addEventListener("click", (e) => { if (e.target.id === "thanks-modal") hideThanksModal(); });
document.getElementById("close-modal").addEventListener("click", closeCart);
document.getElementById("cart-modal").addEventListener("click", (e) => { if (e.target.id === "cart-modal") closeCart(); });
document.getElementById("dish-modal-close").addEventListener("click", closeDishModal);
document.getElementById("dish-modal").addEventListener("click", (e) => {
  if (e.target.id === "dish-modal") closeDishModal();
});
document.getElementById("dish-modal-prev").addEventListener("click", (e) => {
  e.stopPropagation();
  const item = getItemByName(activeDishName);
  if (!item) return;
  const totalSlides = Math.max(getItemPhotos(item).length, 1);
  activeDishSlide = (activeDishSlide - 1 + totalSlides) % totalSlides;
  updateDishModalCarousel(item);
});
document.getElementById("dish-modal-next").addEventListener("click", (e) => {
  e.stopPropagation();
  const item = getItemByName(activeDishName);
  if (!item) return;
  const totalSlides = Math.max(getItemPhotos(item).length, 1);
  activeDishSlide = (activeDishSlide + 1) % totalSlides;
  updateDishModalCarousel(item);
});
document.getElementById("dish-modal-dots").addEventListener("click", (e) => {
  const button = e.target.closest("[data-slide-index]");
  if (!button) return;
  const item = getItemByName(activeDishName);
  if (!item) return;
  activeDishSlide = Number(button.dataset.slideIndex) || 0;
  updateDishModalCarousel(item);
});
bindDishModalSwipeEvents();
document.getElementById("hero-banner-dots").addEventListener("click", (e) => {
  const button = e.target.closest("[data-hero-slide-index]");
  if (!button) return;
  activeHeroBanner = Number(button.dataset.heroSlideIndex) || 0;
  updateHeroBannerCarousel();
});
bindHeroBannerSwipeEvents();

document.getElementById("promo-apply").addEventListener("click", applyPromoCode);
document.getElementById("promo-code").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyPromoCode();
  }
});
document.getElementById("settings-toggle").addEventListener("click", (e) => {
  e.stopPropagation();
  toggleSettingsPopover();
});
document.getElementById("settings-popover").addEventListener("click", (e) => {
  e.stopPropagation();
});
document.querySelectorAll(".settings-language-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const nextLanguage = button.dataset.lang;
    if (!nextLanguage || nextLanguage === currentLanguage) return;
    await setLanguage(nextLanguage);
    closeSettingsPopover();
  });
});
document.querySelectorAll(".settings-theme-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const nextThemeMode = button.dataset.themeMode;
    if (!nextThemeMode) return;
    setThemeMode(nextThemeMode);
  });
});

const searchInput = document.getElementById("menu-search");
const searchClear = document.getElementById("search-clear");
if (searchInput && searchClear) {
  searchInput.addEventListener("focus", updateHeroSearchState);
  searchInput.addEventListener("blur", updateHeroSearchState);

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    updateSearchClearVisibility();
    updateHeroSearchState();
    renderMenu();
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    updateSearchClearVisibility();
    updateHeroSearchState();
    renderMenu();
    searchInput.focus();
  });
}

window.addEventListener("scroll", () => {
  const topBtn = document.getElementById("to-top");
  if (window.scrollY > 380) topBtn.classList.add("show");
  else topBtn.classList.remove("show");
}, { passive: true });

window.addEventListener("resize", () => {
  if (!window.__stickyMetricsTicking) {
    window.__stickyMetricsTicking = true;
    requestAnimationFrame(() => {
      syncStickyOffsets();
      if (activeDishName) syncDishModalTrack({ withTransition: false, offsetX: 0 });
      if (heroBanners.length) syncHeroBannerTrack({ withTransition: false, offsetX: 0 });
      window.__stickyMetricsTicking = false;
    });
  }
}, { passive: true });

window.addEventListener("load", syncStickyOffsets);
window.addEventListener("keydown", (event) => {
  const dishModal = document.getElementById("dish-modal");
  const cartModal = document.getElementById("cart-modal");
  const settingsPopover = document.getElementById("settings-popover");
  if (dishModal && dishModal.classList.contains("show") && event.key === "ArrowLeft") {
    const item = getItemByName(activeDishName);
    if (!item) return;
    const totalSlides = Math.max(getItemPhotos(item).length, 1);
    activeDishSlide = (activeDishSlide - 1 + totalSlides) % totalSlides;
    updateDishModalCarousel(item);
    return;
  }
  if (dishModal && dishModal.classList.contains("show") && event.key === "ArrowRight") {
    const item = getItemByName(activeDishName);
    if (!item) return;
    const totalSlides = Math.max(getItemPhotos(item).length, 1);
    activeDishSlide = (activeDishSlide + 1) % totalSlides;
    updateDishModalCarousel(item);
    return;
  }
  if (event.key !== "Escape") return;
  if (settingsPopover && settingsPopover.classList.contains("show")) {
    closeSettingsPopover();
    return;
  }
  if (dishModal && dishModal.classList.contains("show")) {
    closeDishModal();
    return;
  }
  if (cartModal && cartModal.classList.contains("show")) closeCart();
});
document.addEventListener("click", (event) => {
  const wrap = document.querySelector(".settings-wrap");
  const popover = document.getElementById("settings-popover");
  if (!wrap || !popover || !popover.classList.contains("show")) return;
  if (!wrap.contains(event.target)) closeSettingsPopover();
});

document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!cart.length) return alert(t("alertCartEmpty"));

  const userName = document.getElementById("user-name").value.trim();
  const userPhone = document.getElementById("user-phone").value.trim();
  const userAddress = document.getElementById("user-address").value.trim();
  const orderComment = document.getElementById("order-comment").value.trim();
  if (!userName || !userPhone || !userAddress) return alert(t("alertFillRequired"));

  const message = createWhatsAppMessage(userName, userPhone, userAddress, orderComment);
  const encoded = encodeURIComponent(message);
  const whatsappNumber = cleanPhone(CONFIG.whatsappNumber);
  window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, "_blank");

  cart = [];
  promo = { code: "", discount: 0 };
  saveCart();
  savePromo();
  renderCart();
  updateMenuControls();
  document.getElementById("promo-code").value = "";
  document.getElementById("promo-hint").textContent = "";
  document.getElementById("order-form").reset();
  closeCart();
  showThanksModal();
});

loadCart();
loadPromo();
heroBanners = getDefaultHeroBanners();
applyTheme(currentThemeMode);
applyStaticTranslations();
updateSettingsLanguageButtons(false);
loadMenu();
renderCart();
updateSearchClearVisibility();
syncStickyOffsets();
updateHeroSearchState();
if (promo.code) {
  document.getElementById("promo-code").value = promo.code;
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(syncStickyOffsets);
}

if (systemThemeMedia) {
  const handleSystemThemeChange = () => {
    if (currentThemeMode === "auto") applyTheme("auto");
  };

  if (typeof systemThemeMedia.addEventListener === "function") {
    systemThemeMedia.addEventListener("change", handleSystemThemeChange);
  } else if (typeof systemThemeMedia.addListener === "function") {
    systemThemeMedia.addListener(handleSystemThemeChange);
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
