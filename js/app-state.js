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
    siteTitle: "РџРµСЂРІРѕРµ-Р’С‚РѕСЂРѕРµ",
    logoAlt: "РџРµСЂРІРѕРµ-Р’С‚РѕСЂРѕРµ",
    settingsButtonAria: "РћС‚РєСЂС‹С‚СЊ РЅР°СЃС‚СЂРѕР№РєРё",
    settingsKicker: "РќР°СЃС‚СЂРѕР№РєРё",
    settingsTitle: "РЇР·С‹Рє РёРЅС‚РµСЂС„РµР№СЃР°",
    settingsText: "",
    settingsGroupAria: "Р’С‹Р±РѕСЂ СЏР·С‹РєР°",
    languageRu: "Р СѓСЃСЃРєРёР№",
    languageKk: "РљР°Р·Р°С…СЃРєРёР№",
    languageEn: "РђРЅРіР»РёР№СЃРєРёР№",
    settingsThemeTitle: "РўРµРјР°",
    settingsThemeText: "РђРІС‚Рѕ РїРѕРІС‚РѕСЂСЏРµС‚ С‚РµРјСѓ СѓСЃС‚СЂРѕР№СЃС‚РІР°.",
    settingsThemeGroupAria: "Р’С‹Р±РѕСЂ С‚РµРјС‹",
    themeAuto: "РђРІС‚Рѕ",
    themeLight: "РЎРІРµС‚Р»Р°СЏ",
    themeDark: "РўС‘РјРЅР°СЏ",
    heroBannerCarouselAria: "РРЅС„РѕСЂРјР°С†РёРѕРЅРЅС‹Рµ Р±Р°РЅРЅРµСЂС‹",
    heroBannerDotAria: "РћС‚РєСЂС‹С‚СЊ Р±Р°РЅРЅРµСЂ {index}",
    heroBannerClassicKicker: "Р”РѕСЃС‚Р°РІРєР° РєР°Р¶РґС‹Р№ РґРµРЅСЊ",
    heroBannerClassicTitle: "Р’С‹Р±РµСЂРёС‚Рµ Р±Р»СЋРґР°, РґРѕР±Р°РІСЊС‚Рµ РІ РєРѕСЂР·РёРЅСѓ Рё РѕС‚РїСЂР°РІСЊС‚Рµ Р·Р°РєР°Р· РІ WhatsApp Р·Р° 1 РјРёРЅСѓС‚Сѓ.",
    heroBannerClassicSubtitle: "Р”РѕСЃС‚Р°РІРєР° СЂР°Р±РѕС‚Р°РµС‚ РµР¶РµРґРЅРµРІРЅРѕ СЃ 9:00 РґРѕ 18:00.",
    heroBannerClassicBadgeFresh: "РЎРІРµР¶РёРµ Р±Р»СЋРґР°",
    heroBannerClassicBadgeFast: "Р‘С‹СЃС‚СЂР°СЏ РґРѕСЃС‚Р°РІРєР°",
    heroBannerClassicBadgeFree: "Р‘РµР· СЂРµРіРёСЃС‚СЂР°С†РёРё",
    heroBannerInfoKicker: "РРЅС„РѕСЂРјР°С†РёСЏ",
    heroBannerInstallKicker: "Р”РѕР±Р°РІРёС‚СЊ РЅР° СЌРєСЂР°РЅ",
    heroBannerInstallTitle: "РљР°Рє СЃРєР°С‡Р°С‚СЊ РїСЂРёР»РѕР¶РµРЅРёРµ РЅР° iPhone",
    heroBannerInstallText: "РЎРѕС…СЂР°РЅРёС‚Рµ СЃР°Р№С‚ РЅР° СЂР°Р±РѕС‡РёР№ СЃС‚РѕР» Рё РѕС‚РєСЂС‹РІР°Р№С‚Рµ РµРіРѕ РєР°Рє РїСЂРёР»РѕР¶РµРЅРёРµ.",
    heroBannerInstallStep1: "РћС‚РєСЂРѕР№С‚Рµ СЃР°Р№С‚ РІ Safari",
    heroBannerInstallStep2: "РќР°Р¶РјРёС‚Рµ РєРЅРѕРїРєСѓ В«РџРѕРґРµР»РёС‚СЊСЃСЏВ»",
    heroBannerInstallStep3: "Р’С‹Р±РµСЂРёС‚Рµ В«РќР° СЌРєСЂР°РЅ Р”РѕРјРѕР№В»",
    heroBannerInstallNote: "РџРѕСЃР»Рµ СЌС‚РѕРіРѕ РёРєРѕРЅРєР° РїРѕСЏРІРёС‚СЃСЏ РЅР° РіР»Р°РІРЅРѕРј СЌРєСЂР°РЅРµ, Р° СЃР°Р№С‚ Р±СѓРґРµС‚ Р·Р°РїСѓСЃРєР°С‚СЊСЃСЏ РєР°Рє РѕС‚РґРµР»СЊРЅРѕРµ РїСЂРёР»РѕР¶РµРЅРёРµ.",
    searchPlaceholder: "РџРѕРёСЃРє РїРѕ Р±Р»СЋРґР°Рј",
    searchClearAria: "РћС‡РёСЃС‚РёС‚СЊ РїРѕРёСЃРє",
    loadingMenu: "Р—Р°РіСЂСѓР¶Р°РµРј РјРµРЅСЋ...",
    translatingMenu: "РџРµСЂРµРІРѕР¶Сѓ РјРµРЅСЋ...",
    noResults: "РќРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РґСЂСѓРіРѕРµ РЅР°Р·РІР°РЅРёРµ.",
    noAvailable: "РќРµС‚ РґРѕСЃС‚СѓРїРЅС‹С… Р±Р»СЋРґ. РџСЂРѕРІРµСЂСЊС‚Рµ РєРѕР»РѕРЅРєСѓ РќР°Р»РёС‡РёРµ (Р”Р°/РќРµС‚).",
    loadErrorHeading: "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РјРµРЅСЋ",
    loadError: "РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РјРµРЅСЋ: {message}",
    retryLoadButton: "РџРѕРїСЂРѕР±РѕРІР°С‚СЊ СЃРЅРѕРІР°",
    footerReview: "Р‘СѓРґРµРј СЂР°РґС‹ РІР°С€РёРј РѕС‚Р·С‹РІР°Рј",
    address: "РџРµС‚СЂРѕРїР°РІР»РѕРІСЃРє, РРЅС‚РµСЂРЅР°С†РёРѕРЅР°Р»СЊРЅР°СЏ СѓР»РёС†Р°, 67",
    toTopAria: "РќР°РІРµСЂС…",
    cartButton: "РљРѕСЂР·РёРЅР°",
    cartTitle: "Р’Р°С€ Р·Р°РєР°Р·",
    closeAria: "Р—Р°РєСЂС‹С‚СЊ",
    promoLabel: "РџСЂРѕРјРѕРєРѕРґ (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)",
    promoPlaceholder: "Р’РІРµРґРёС‚Рµ РїСЂРѕРјРѕРєРѕРґ",
    promoApply: "РџСЂРёРјРµРЅРёС‚СЊ",
    promoMissing: "РџСЂРѕРјРѕРєРѕРґ РЅРµ СѓРєР°Р·Р°РЅ",
    promoAppliedPercent: "РџСЂРѕРјРѕРєРѕРґ РїСЂРёРјРµРЅРµРЅ: СЃРєРёРґРєР° 10%",
    promoAppliedFixed: "РџСЂРѕРјРѕРєРѕРґ РїСЂРёРјРµРЅРµРЅ: СЃРєРёРґРєР° 200в‚ё",
    promoNotFound: "РџСЂРѕРјРѕРєРѕРґ РЅРµ РЅР°Р№РґРµРЅ",
    subtotal: "РЎСѓРјРјР°",
    discount: "РЎРєРёРґРєР°",
    total: "РС‚РѕРіРѕ",
    totalFull: "РћР±С‰Р°СЏ СЃСѓРјРјР°",
    deliveryTitle: "Р”Р°РЅРЅС‹Рµ РґР»СЏ РґРѕСЃС‚Р°РІРєРё",
    namePlaceholder: "Р’Р°С€Рµ РёРјСЏ",
    phonePlaceholder: "Р’Р°С€ С‚РµР»РµС„РѕРЅ",
    addressPlaceholder: "РђРґСЂРµСЃ РґРѕСЃС‚Р°РІРєРё",
    commentPlaceholder: "РљРѕРјРјРµРЅС‚Р°СЂРёР№ Рє Р·Р°РєР°Р·Сѓ (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)",
    orderButton: "РћС„РѕСЂРјРёС‚СЊ РІ WhatsApp",
    paymentNote: "РћРїР»Р°С‚Р° РІСЂРµРјРµРЅРЅРѕ РѕСЃСѓС‰РµСЃС‚РІР»СЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ С‡РµСЂРµР· СѓРґР°Р»С‘РЅРЅСѓСЋ РѕРїР»Р°С‚Сѓ Kaspi. РџСЂРёРЅРѕСЃРёРј РёР·РІРёРЅРµРЅРёСЏ Р·Р° РЅРµСѓРґРѕР±СЃС‚РІР°.",
    dishAbout: "Рћ Р±Р»СЋРґРµ",
    dishNoCategory: "Р‘РµР· РєР°С‚РµРіРѕСЂРёРё",
    dishDescriptionFallback: "РџРѕРґСЂРѕР±РЅРѕРµ РѕРїРёСЃР°РЅРёРµ СЃРєРѕСЂРѕ РїРѕСЏРІРёС‚СЃСЏ.",
    dishOpenAria: "РћС‚РєСЂС‹С‚СЊ {name}",
    dishCloseAria: "Р—Р°РєСЂС‹С‚СЊ РїСЂРѕСЃРјРѕС‚СЂ Р±Р»СЋРґР°",
    dishPrevPhotoAria: "РџСЂРµРґС‹РґСѓС‰РµРµ С„РѕС‚Рѕ",
    dishNextPhotoAria: "РЎР»РµРґСѓСЋС‰РµРµ С„РѕС‚Рѕ",
    dishPhotoSoon: "Р¤РѕС‚РѕРіСЂР°С„РёСЏ Р±Р»СЋРґР° СЃРєРѕСЂРѕ РїРѕСЏРІРёС‚СЃСЏ",
    thanksTitle: "РЎРїР°СЃРёР±Рѕ Р·Р° Р·Р°РєР°Р·!",
    thanksText: "РњС‹ СѓР¶Рµ РїРѕР»СѓС‡РёР»Рё РІР°С€Сѓ Р·Р°СЏРІРєСѓ. Р–РґРµРј РІР°СЃ СЃРЅРѕРІР°.",
    thanksButton: "РћС‚Р»РёС‡РЅРѕ",
    categoriesAll: "Р’СЃРµ",
    addButton: "Р”РѕР±Р°РІРёС‚СЊ",
    cartEmpty: "РљРѕСЂР·РёРЅР° РїРѕРєР° РїСѓСЃС‚Р°СЏ.",
    removeButton: "РЈРґР°Р»РёС‚СЊ",
    toastAdded: "{name} РґРѕР±Р°РІР»РµРЅРѕ РІ РєРѕСЂР·РёРЅСѓ",
    alertCartEmpty: "РљРѕСЂР·РёРЅР° РїСѓСЃС‚Р°СЏ. Р”РѕР±Р°РІСЊС‚Рµ Р±Р»СЋРґР°.",
    alertFillRequired: "Р—Р°РїРѕР»РЅРёС‚Рµ РёРјСЏ, С‚РµР»РµС„РѕРЅ Рё Р°РґСЂРµСЃ.",
    alertWhatsAppBlocked: "РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РєСЂС‹С‚СЊ WhatsApp. Р Р°Р·СЂРµС€РёС‚Рµ РІСЃРїР»С‹РІР°СЋС‰РёРµ РѕРєРЅР° Рё РїРѕРїСЂРѕР±СѓР№С‚Рµ СЃРЅРѕРІР°.",
    confirmWhatsAppSent: "WhatsApp РѕС‚РєСЂС‹С‚. РќР°Р¶РјРёС‚Рµ OK С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ С‚РѕРіРѕ, РєР°Рє РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ РѕС‚РїСЂР°РІРёС‚Рµ СЃРѕРѕР±С‰РµРЅРёРµ СЃ Р·Р°РєР°Р·РѕРј.",
    waGreeting: "Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ!",
    waIntro: "РҐРѕС‡Сѓ РѕС„РѕСЂРјРёС‚СЊ Р·Р°РєР°Р·.",
    waName: "РРјСЏ",
    waPhone: "РўРµР»РµС„РѕРЅ",
    waAddress: "РђРґСЂРµСЃ",
    waComment: "РљРѕРјРјРµРЅС‚Р°СЂРёР№",
    waPromo: "РџСЂРѕРјРѕРєРѕРґ",
    waOrder: "Р—Р°РєР°Р·",
    waTotal: "РС‚РѕРіРѕ"
  },
  kk: {
    siteTitle: "Р‘С–СЂС–РЅС€С–-Р•РєС–РЅС€С–",
    logoAlt: "Р‘С–СЂС–РЅС€С–-Р•РєС–РЅС€С–",
    settingsButtonAria: "Р‘Р°РїС‚Р°СѓР»Р°СЂРґС‹ Р°С€Сѓ",
    settingsKicker: "Р‘Р°РїС‚Р°СѓР»Р°СЂ",
    settingsTitle: "РРЅС‚РµСЂС„РµР№СЃ С‚С–Р»С–",
    settingsText: "",
    settingsGroupAria: "РўС–Р»РґС– С‚Р°ТЈРґР°Сѓ",
    languageRu: "РћСЂС‹СЃС€Р°",
    languageKk: "ТљР°Р·Р°Т›С€Р°",
    languageEn: "РђТ“С‹Р»С€С‹РЅС€Р°",
    settingsThemeTitle: "РўР°Т›С‹СЂС‹Рї",
    settingsThemeText: "РђРІС‚Рѕ Т›Т±СЂС‹Р»Т“С‹ С‚Р°Т›С‹СЂС‹Р±С‹РЅ Т›Р°Р№С‚Р°Р»Р°Р№РґС‹.",
    settingsThemeGroupAria: "РўР°Т›С‹СЂС‹РїС‚С‹ С‚Р°ТЈРґР°Сѓ",
    themeAuto: "РђРІС‚Рѕ",
    themeLight: "РђС€С‹Т›",
    themeDark: "ТљР°СЂР°ТЈТ“С‹",
    heroBannerCarouselAria: "РђТ›РїР°СЂР°С‚С‚С‹Т› Р±Р°РЅРЅРµСЂР»РµСЂ",
    heroBannerDotAria: "{index}-Р±Р°РЅРЅРµСЂРґС– Р°С€Сѓ",
    heroBannerClassicKicker: "РљТЇРЅ СЃР°Р№С‹РЅ Р¶РµС‚РєС–Р·Сѓ",
    heroBannerClassicTitle: "РўР°Т“Р°РјРґР°СЂРґС‹ С‚Р°ТЈРґР°ТЈС‹Р·, СЃРµР±РµС‚РєРµ Т›РѕСЃС‹ТЈС‹Р· Р¶У™РЅРµ С‚Р°РїСЃС‹СЂС‹СЃС‚С‹ WhatsApp Р°СЂТ›С‹Р»С‹ 1 РјРёРЅСѓС‚С‚Р° Р¶С–Р±РµСЂС–ТЈС–Р·.",
    heroBannerClassicSubtitle: "Р–РµС‚РєС–Р·Сѓ РєТЇРЅ СЃР°Р№С‹РЅ 9:00-РґРµРЅ 18:00-РіРµ РґРµР№С–РЅ Р¶Т±РјС‹СЃ С–СЃС‚РµР№РґС–.",
    heroBannerClassicBadgeFresh: "Р–Р°ТЈР° С‚Р°Т“Р°РјРґР°СЂ",
    heroBannerClassicBadgeFast: "Р–С‹Р»РґР°Рј Р¶РµС‚РєС–Р·Сѓ",
    heroBannerClassicBadgeFree: "РўС–СЂРєРµР»СѓСЃС–Р·",
    heroBannerInfoKicker: "РђТ›РїР°СЂР°С‚",
    heroBannerInstallKicker: "Р‘Р°СЃС‚С‹ СЌРєСЂР°РЅТ“Р° Т›РѕСЃСѓ",
    heroBannerInstallTitle: "ТљРѕСЃС‹РјС€Р°РЅС‹ iPhone-Т“Р° Т›Р°Р»Р°Р№ РѕСЂРЅР°С‚СѓТ“Р° Р±РѕР»Р°РґС‹",
    heroBannerInstallText: "РЎР°Р№С‚С‚С‹ Р±Р°СЃС‚С‹ СЌРєСЂР°РЅТ“Р° СЃР°Т›С‚Р°Рї, РѕРЅС‹ Т›РѕР»РґР°РЅР±Р° СЃРёСЏТ›С‚С‹ Р°С€С‹ТЈС‹Р·.",
    heroBannerInstallStep1: "РЎР°Р№С‚С‚С‹ Safari-РґРµ Р°С€С‹ТЈС‹Р·",
    heroBannerInstallStep2: "В«Р‘У©Р»С–СЃСѓВ» Р±Р°С‚С‹СЂРјР°СЃС‹РЅ Р±Р°СЃС‹ТЈС‹Р·",
    heroBannerInstallStep3: "В«Р‘Р°СЃС‚С‹ СЌРєСЂР°РЅТ“Р°В» С‚Р°СЂРјР°Т“С‹РЅ С‚Р°ТЈРґР°ТЈС‹Р·",
    heroBannerInstallNote: "РћСЃС‹РґР°РЅ РєРµР№С–РЅ Р±РµР»РіС–С€Рµ Р±Р°СЃС‚С‹ СЌРєСЂР°РЅРґР° РїР°Р№РґР° Р±РѕР»Р°РґС‹, Р°Р» СЃР°Р№С‚ Р±У©Р»РµРє Т›РѕСЃС‹РјС€Р° СЃРёСЏТ›С‚С‹ Р°С€С‹Р»Р°РґС‹.",
    searchPlaceholder: "РўР°Т“Р°РјРґР°СЂ Р±РѕР№С‹РЅС€Р° С–Р·РґРµСѓ",
    searchClearAria: "Р†Р·РґРµСѓРґС– С‚Р°Р·Р°СЂС‚Сѓ",
    loadingMenu: "РњУ™Р·С–СЂ Р¶ТЇРєС‚РµР»СѓРґРµ...",
    translatingMenu: "РњУ™Р·С–СЂ Р°СѓРґР°СЂС‹Р»С‹Рї Р¶Р°С‚С‹СЂ...",
    noResults: "Р•С€С‚РµТЈРµ С‚Р°Р±С‹Р»РјР°РґС‹. Р‘Р°СЃТ›Р° Р°С‚Р°СѓРґС‹ Т›РѕР»РґР°РЅС‹Рї РєУ©СЂС–ТЈС–Р·.",
    noAvailable: "ТљРѕР»Р¶РµС‚С–РјРґС– С‚Р°Т“Р°РјРґР°СЂ Р¶РѕТ›. ТљРѕР»Р¶РµС‚С–РјРґС–Р»С–Рє Р±Р°Т“Р°РЅС‹РЅ С‚РµРєСЃРµСЂС–ТЈС–Р· (РУ™/Р–РѕТ›).",
    loadErrorHeading: "РњУ™Р·С–СЂРґС– Р¶ТЇРєС‚РµСѓ РјТЇРјРєС–РЅ Р±РѕР»РјР°РґС‹",
    loadError: "РњУ™Р·С–СЂРґС– Р¶ТЇРєС‚РµСѓ Т›Р°С‚РµСЃС–: {message}",
    retryLoadButton: "ТљР°Р№С‚Р° РєУ©СЂСѓ",
    footerReview: "РџС–РєС–СЂР»РµСЂС–ТЈС–Р·РіРµ Т›СѓР°РЅС‹С€С‚С‹РјС‹Р·",
    address: "РџРµС‚СЂРѕРїР°РІР», РРЅС‚РµСЂРЅР°С†РёРѕРЅР°Р»СЊРЅР°СЏ РєУ©С€РµСЃС–, 67",
    toTopAria: "Р–РѕТ“Р°СЂС‹Т“Р°",
    cartButton: "РЎРµР±РµС‚",
    cartTitle: "РўР°РїСЃС‹СЂС‹СЃС‹ТЈС‹Р·",
    closeAria: "Р–Р°Р±Сѓ",
    promoLabel: "РџСЂРѕРјРѕРєРѕРґ (РјС–РЅРґРµС‚С‚С– РµРјРµСЃ)",
    promoPlaceholder: "РџСЂРѕРјРѕРєРѕРґС‚С‹ РµРЅРіС–Р·С–ТЈС–Р·",
    promoApply: "ТљРѕР»РґР°РЅСѓ",
    promoMissing: "РџСЂРѕРјРѕРєРѕРґ РµРЅРіС–Р·С–Р»РјРµРіРµРЅ",
    promoAppliedPercent: "РџСЂРѕРјРѕРєРѕРґ Т›РѕР»РґР°РЅС‹Р»РґС‹: 10% Р¶РµТЈС–Р»РґС–Рє",
    promoAppliedFixed: "РџСЂРѕРјРѕРєРѕРґ Т›РѕР»РґР°РЅС‹Р»РґС‹: 200в‚ё Р¶РµТЈС–Р»РґС–Рє",
    promoNotFound: "РџСЂРѕРјРѕРєРѕРґ С‚Р°Р±С‹Р»РјР°РґС‹",
    subtotal: "РЎРѕРјР°",
    discount: "Р–РµТЈС–Р»РґС–Рє",
    total: "Р‘Р°СЂР»С‹Т“С‹",
    totalFull: "Р–Р°Р»РїС‹ СЃРѕРјР°",
    deliveryTitle: "Р–РµС‚РєС–Р·Сѓ РґРµСЂРµРєС‚РµСЂС–",
    namePlaceholder: "РђС‚С‹ТЈС‹Р·",
    phonePlaceholder: "РўРµР»РµС„РѕРЅС‹ТЈС‹Р·",
    addressPlaceholder: "Р–РµС‚РєС–Р·Сѓ РјРµРєРµРЅР¶Р°Р№С‹",
    commentPlaceholder: "РўР°РїСЃС‹СЂС‹СЃТ›Р° РїС–РєС–СЂ (РјС–РЅРґРµС‚С‚С– РµРјРµСЃ)",
    orderButton: "WhatsApp Р°СЂТ›С‹Р»С‹ СЂУ™СЃС–РјРґРµСѓ",
    paymentNote: "ТљР°Р·С–СЂ С‚У©Р»РµРј С‚РµРє Kaspi Р°СЂТ›С‹Р»С‹ Т›Р°С€С‹Т›С‚Р°РЅ Т›Р°Р±С‹Р»РґР°РЅР°РґС‹. ТљРѕР»Р°Р№СЃС‹Р·РґС‹Т› ТЇС€С–РЅ РєРµС€С–СЂС–Рј СЃТ±СЂР°Р№РјС‹Р·.",
    dishAbout: "РўР°Т“Р°Рј С‚СѓСЂР°Р»С‹",
    dishNoCategory: "РЎР°РЅР°С‚СЃС‹Р·",
    dishDescriptionFallback: "РўРѕР»С‹Т› СЃРёРїР°С‚С‚Р°РјР° Р¶Р°Т›С‹РЅРґР° Т›РѕСЃС‹Р»Р°РґС‹.",
    dishOpenAria: "{name} Р°С€Сѓ",
    dishCloseAria: "РўР°Т“Р°Рј РєУ©СЂС–РЅС–СЃС–РЅ Р¶Р°Р±Сѓ",
    dishPrevPhotoAria: "РђР»РґС‹ТЈТ“С‹ С„РѕС‚Рѕ",
    dishNextPhotoAria: "РљРµР»РµСЃС– С„РѕС‚Рѕ",
    dishPhotoSoon: "РўР°Т“Р°Рј СЃСѓСЂРµС‚С– Р¶Р°Т›С‹РЅРґР° Т›РѕСЃС‹Р»Р°РґС‹",
    thanksTitle: "РўР°РїСЃС‹СЂС‹СЃС‹ТЈС‹Р·Т“Р° СЂР°С…РјРµС‚!",
    thanksText: "УЁС‚С–РЅС–РјС–ТЈС–Р· Т›Р°Р±С‹Р»РґР°РЅРґС‹. ТљР°Р№С‚Р° РєТЇС‚РµРјС–Р·.",
    thanksButton: "РўР°РјР°С€Р°",
    categoriesAll: "Р‘Р°СЂР»С‹Т“С‹",
    addButton: "ТљРѕСЃСѓ",
    cartEmpty: "РЎРµР±РµС‚ У™Р·С–СЂРіРµ Р±РѕСЃ.",
    removeButton: "Р–РѕСЋ",
    toastAdded: "{name} СЃРµР±РµС‚РєРµ Т›РѕСЃС‹Р»РґС‹",
    alertCartEmpty: "РЎРµР±РµС‚ Р±РѕСЃ. РўР°Т“Р°Рј Т›РѕСЃС‹ТЈС‹Р·.",
    alertFillRequired: "РђС‚С‹ТЈС‹Р·РґС‹, С‚РµР»РµС„РѕРЅС‹ТЈС‹Р·РґС‹ Р¶У™РЅРµ РјРµРєРµРЅР¶Р°Р№С‹ТЈС‹Р·РґС‹ С‚РѕР»С‚С‹СЂС‹ТЈС‹Р·.",
    alertWhatsAppBlocked: "WhatsApp Р°С€С‹Р»РјР°РґС‹. ТљР°Р»Т›С‹РјР°Р»С‹ С‚РµСЂРµР·РµР»РµСЂРіРµ СЂТ±Т›СЃР°С‚ Р±РµСЂС–Рї, Т›Р°Р№С‚Р° РєУ©СЂС–ТЈС–Р·.",
    confirmWhatsAppSent: "WhatsApp Р°С€С‹Р»РґС‹. РўР°РїСЃС‹СЂС‹СЃ С…Р°Р±Р°СЂР»Р°РјР°СЃС‹РЅ С€С‹РЅС‹РјРµРЅ Р¶С–Р±РµСЂРіРµРЅРЅРµРЅ РєРµР№С–РЅ Т“Р°РЅР° OK Р±Р°С‚С‹СЂРјР°СЃС‹РЅ Р±Р°СЃС‹ТЈС‹Р·.",
    waGreeting: "РЎУ™Р»РµРјРµС‚СЃС–Р· Р±Рµ!",
    waIntro: "РўР°РїСЃС‹СЂС‹СЃ Р±РµСЂРіС–Рј РєРµР»РµРґС–.",
    waName: "РђС‚С‹",
    waPhone: "РўРµР»РµС„РѕРЅ",
    waAddress: "РњРµРєРµРЅР¶Р°Р№",
    waComment: "РџС–РєС–СЂ",
    waPromo: "РџСЂРѕРјРѕРєРѕРґ",
    waOrder: "РўР°РїСЃС‹СЂС‹СЃ",
    waTotal: "Р‘Р°СЂР»С‹Т“С‹"
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
    promoAppliedFixed: "Promo code applied: 200в‚ё discount",
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
  const fallback = UI_TRANSLATIONS.ru[key] || key;
  const value = table[key] || fallback;
  return Object.entries(vars).reduce((text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement), value);
}

function money(value, lang = currentLanguage) {
  const locale = LANGUAGE_META[lang]?.locale || "ru-RU";
  return `${Number(value || 0).toLocaleString(locale)}в‚ё`;
}

function getLocalizedCalories(value, lang = currentLanguage) {
  if (!value) return "";
  if (lang === "en") return `${value} kcal`;
  return `${value} РєРєР°Р»`;
}

function getLocalizedWeight(value, lang = currentLanguage) {
  const weight = String(value || "").trim();
  if (!weight) return "";

  if (lang === "en") {
    return weight
      .replace(/РіСЂР°РјРј(?:Р°|РѕРІ)?/gi, "g")
      .replace(/РіСЂ\b/gi, "g")
      .replace(/Рі\b/gi, "g")
      .replace(/РєРёР»РѕРіСЂР°РјРј(?:Р°|РѕРІ)?/gi, "kg")
      .replace(/РєРі\b/gi, "kg")
      .replace(/РјРёР»Р»РёР»РёС‚СЂ(?:Р°|РѕРІ)?/gi, "ml")
      .replace(/РјР»\b/gi, "ml")
      .replace(/Р»РёС‚СЂ(?:Р°|РѕРІ)?/gi, "l")
      .replace(/Р»\b/gi, "l")
      .replace(/С€С‚\b/gi, "pcs");
  }

  if (lang === "kk") {
    return weight
      .replace(/С€С‚\b/gi, "РґР°РЅР°")
      .replace(/РіСЂР°РјРј(?:Р°|РѕРІ)?/gi, "Рі")
      .replace(/РіСЂ\b/gi, "Рі");
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

