function findItemByAnyName(name) {
  return menuData.find((item) => {
    const displayItem = getDisplayItem(item);
    return item.name === name || displayItem?.displayName === name;
  }) || null;
}

function getItemByName(name) {
  return menuData.find((item) => item.name === name) || null;
}

function getItemRawPhotos(item) {
  if (!item) return [];
  const rawPhotos = Array.isArray(item.rawPhotos) && item.rawPhotos.length
    ? item.rawPhotos
    : [item.rawPhoto, item.photo];
  return [...new Set(rawPhotos.map((value) => String(value || "").trim()).filter(Boolean))];
}

function getItemPhotos(item) {
  if (!item) return [];
  const rawPhotos = getItemRawPhotos(item);
  if (rawPhotos.length) {
    return [...new Set(rawPhotos.map(normalizePhotoUrl).filter(Boolean))];
  }
  const photos = Array.isArray(item.photos) && item.photos.length ? item.photos : [item.photo];
  return [...new Set(photos.map(normalizePhotoUrl).filter(Boolean))];
}

const DISH_CARD_PHOTO_WIDTH = 510;
const DISH_MODAL_PHOTO_WIDTH = 800;
const DISH_PREVIEW_PHOTO_WIDTH = 80;
const preloadedDishPhotoUrls = new Set();

function encodePhotoFallbacks(urls) {
  return urls.map((url) => encodeURIComponent(url)).join("|");
}

function consumePhotoFallback(image) {
  if (!image) return false;

  const encodedFallbacks = String(image.dataset.photoFallbacks || "");
  const fallbacks = encodedFallbacks
    .split("|")
    .map((value) => {
      try {
        return decodeURIComponent(value);
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  while (fallbacks.length) {
    const nextUrl = fallbacks.shift();
    if (!nextUrl || image.currentSrc === nextUrl || image.src === nextUrl) continue;
    image.dataset.photoFallbacks = encodePhotoFallbacks(fallbacks);
    image.src = nextUrl;
    return true;
  }

  image.removeAttribute("data-photo-fallbacks");
  return false;
}

window.handleDishImageError = function handleDishImageError(image) {
  if (consumePhotoFallback(image)) return;

  const shell = image.closest(".dish-photo-shell");
  if (!shell) {
    const placeholder = createDishPhotoPlaceholderElement(
      image.classList.contains("dish-modal-image")
        ? "dish-modal-image-placeholder"
        : "food-image-placeholder"
    );
    image.replaceWith(placeholder);
    return;
  }

  if (image.dataset.photoStage === "preview") {
    image.remove();
    return;
  }

  shell.replaceWith(createDishPhotoPlaceholderElement(shell.dataset.placeholderClass || "food-image-placeholder"));
};

window.handleDishImageLoad = function handleDishImageLoad(image) {
  if (!image || image.dataset.photoStage !== "full") return;

  const shell = image.closest(".dish-photo-shell");
  if (!shell) return;
  shell.classList.add("is-full-loaded");
};

function buildDishPhotoPlaceholderHtml(className) {
  return `<div class="${className}">${escapeHtml(t("dishPhotoSoon"))}</div>`;
}

function createDishPhotoPlaceholderElement(className) {
  const placeholder = document.createElement("div");
  placeholder.className = className;
  placeholder.textContent = t("dishPhotoSoon");
  return placeholder;
}

function buildResponsiveDishImage(rawUrl, className, altText, options = {}) {
  const fullCandidates = buildPhotoUrlCandidates(rawUrl, {
    targetWidth: options.targetWidth
  });
  if (!fullCandidates.length) return "";

  const previewCandidates = buildPhotoUrlCandidates(rawUrl, {
    targetWidth: options.previewTargetWidth || DISH_PREVIEW_PHOTO_WIDTH
  });

  const isMobileViewport = window.matchMedia && window.matchMedia("(max-width: 860px)").matches;
  const loading = options.loading || (isMobileViewport ? "eager" : "lazy");
  const decoding = options.decoding || "async";
  const fetchPriorityValue = options.fetchPriority || "high";
  const fetchPriority = fetchPriorityValue ? ` fetchpriority="${fetchPriorityValue}"` : "";
  const draggable = options.draggable === false ? ` draggable="false"` : "";
  const previewFallbackAttr = previewCandidates.length > 1
    ? ` data-photo-fallbacks="${encodePhotoFallbacks(previewCandidates.slice(1))}"`
    : "";
  const fullFallbackAttr = fullCandidates.length > 1
    ? ` data-photo-fallbacks="${encodePhotoFallbacks(fullCandidates.slice(1))}"`
    : "";
  const previewUrl = previewCandidates[0] || fullCandidates[0];
  const fullUrl = fullCandidates[0];

  if (!previewUrl && !fullUrl) return "";

  const previewMarkup = previewUrl && previewUrl !== fullUrl
    ? `<img class="dish-photo-layer dish-photo-layer--preview" src="${escapeHtml(previewUrl)}" alt="" aria-hidden="true" loading="eager" decoding="async" fetchpriority="high" data-photo-stage="preview" onerror="window.handleDishImageError && window.handleDishImageError(this)"${previewFallbackAttr} />`
    : "";

  return `<div class="${className} dish-photo-shell" data-placeholder-class="${escapeHtml(options.placeholderClassName || "food-image-placeholder")}">${previewMarkup}<img class="dish-photo-layer dish-photo-layer--full" src="${escapeHtml(fullUrl)}" alt="${escapeHtml(altText)}" loading="${loading}" decoding="${decoding}"${fetchPriority} data-photo-stage="full" onload="window.handleDishImageLoad && window.handleDishImageLoad(this)" onerror="window.handleDishImageError && window.handleDishImageError(this)"${fullFallbackAttr}${draggable} /></div>`;
}

function bindDishPhotoFallbacks(root = document) {
  if (!root || typeof root.querySelectorAll !== "function") return;

  root.querySelectorAll("img[data-photo-fallbacks]").forEach((image) => {
    if (image.dataset.photoFallbackBound === "true") return;
    image.dataset.photoFallbackBound = "true";

    image.addEventListener("error", () => {
      consumePhotoFallback(image);
    });
  });
}

function buildDishPhotoHtml(item, className = "food-image", altText = "") {
  const [rawPhotoUrl] = getItemRawPhotos(item);
  const imageAlt = altText || item?.name || "";
  if (rawPhotoUrl) {
    return buildResponsiveDishImage(rawPhotoUrl, className, imageAlt, {
      targetWidth: DISH_CARD_PHOTO_WIDTH,
      previewTargetWidth: DISH_PREVIEW_PHOTO_WIDTH,
      placeholderClassName: "food-image-placeholder",
      loading: "eager",
      decoding: "async",
      fetchPriority: "high"
    });
  }
  return buildDishPhotoPlaceholderHtml("food-image-placeholder");
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

  const rawPhotos = getItemRawPhotos(item);
  const photos = getItemPhotos(item);
  const totalSlides = getDishSlideCount(item);
  const photoKey = photos.length ? photos.join("|") : "__empty__";
  const displayItem = getDisplayItem(item) || item;

  if (track.dataset.photoKey !== photoKey) {
    track.innerHTML = rawPhotos.length
      ? rawPhotos.map((photoUrl, index) => (
        `<div class="dish-modal-slide">
          ${buildResponsiveDishImage(photoUrl, "dish-modal-image", `${displayItem.displayName || item.name} ${index + 1}`, {
            targetWidth: DISH_MODAL_PHOTO_WIDTH,
            previewTargetWidth: DISH_PREVIEW_PHOTO_WIDTH,
            placeholderClassName: "dish-modal-image-placeholder",
            loading: "eager",
            decoding: "async",
            fetchPriority: "high",
            draggable: false
          })}
        </div>`
      )).join("")
      : `<div class="dish-modal-slide">${buildDishPhotoPlaceholderHtml("dish-modal-image-placeholder")}</div>`;

    track.dataset.photoKey = photoKey;
    bindDishPhotoFallbacks(track);
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

function preloadDishPhotos(item, options = {}) {
  const targetWidth = Number(options.targetWidth) > 0 ? Number(options.targetWidth) : DISH_MODAL_PHOTO_WIDTH;

  getItemRawPhotos(item).forEach((photoUrl) => {
    const primaryUrl = normalizePhotoUrl(photoUrl, { targetWidth });
    if (!primaryUrl) return;
    if (preloadedDishPhotoUrls.has(primaryUrl)) return;
    preloadedDishPhotoUrls.add(primaryUrl);

    const image = new Image();
    image.loading = "eager";
    image.decoding = "async";
    image.fetchPriority = "high";
    image.src = primaryUrl;
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

const PENDING_ORDER_KEY = "pervoe-vtoroe-pending-order-v2";
const ORDER_FLOW_TEXT = {
  ru: {
    confirmTitle: "Подтвердите заказ",
    confirmText: "Мы сохранили ваш заказ и подготовили сообщение для WhatsApp. Подскажите, удалось ли отправить его?",
    summaryTitle: "Состав заказа",
    confirmQuestion: "Удалось оформить именно этот заказ?",
    confirmYes: "Да, заказ оформлен",
    confirmNo: "Нет, вернуться в корзину",
    successTitle: "Спасибо, заказ подтвержден",
    successText: "Приятного аппетита и спасибо, что выбрали «Первое-Второе». Будем рады вашему следующему заказу.",
    successButton: "Понятно"
  },
  kk: {
    confirmTitle: "Тапсырысты растаңыз",
    confirmText: "Біз тапсырысыңызды сақтап, WhatsApp үшін хабарламаны дайындадық. Оны жіберу сәтті болды ма?",
    summaryTitle: "Тапсырыс құрамы",
    confirmQuestion: "Дәл осы тапсырысты рәсімдей алдыңыз ба?",
    confirmYes: "Иә, тапсырыс рәсімделді",
    confirmNo: "Жоқ, себетке оралу",
    successTitle: "Рақмет, тапсырыс расталды",
    successText: "Асыңыз дәмді болсын. «Бірінші-Екінші» таңдағаныңыз үшін рақмет. Қайта күтеміз.",
    successButton: "Түсінікті"
  },
  en: {
    confirmTitle: "Confirm your order",
    confirmText: "We saved your order and prepared the WhatsApp message. Were you able to send it?",
    summaryTitle: "Order summary",
    confirmQuestion: "Were you able to place this exact order?",
    confirmYes: "Yes, the order was placed",
    confirmNo: "No, return to cart",
    successTitle: "Thank you, your order is confirmed",
    successText: "Enjoy your meal, and thank you for choosing First-Second. We will be happy to see you again.",
    successButton: "Understood"
  }
};

const WORK_SCHEDULE = {
  timezone: "Asia/Almaty",
  startMinutes: 9 * 60,
  endMinutes: 18 * 60,
  refreshMs: 5 * 60 * 1000,
  requestTimeoutMs: 5000
};

const WORK_SCHEDULE_TEXT = {
  ru: {
    closedBanner: "Сейчас мы не работаем. Заказы принимаем ежедневно с 9:00 до 18:00.",
    closedNote: "Меню и корзина доступны в любое время. Отправить заказ можно только с 9:00 до 18:00 (UTC+5).",
    closedButton: "Заказы с 9:00 до 18:00",
    closedAlert: "Сейчас мы не работаем. Отправить заказ можно с 9:00 до 18:00 (UTC+5).",
    checkingNote: "Проверяем рабочее время. Кнопка заказа откроется автоматически.",
    checkingButton: "Проверяем время...",
    checkingAlert: "Сейчас проверяем рабочее время. Попробуйте еще раз через пару секунд.",
    errorNote: "Не удалось проверить рабочее время. Отправка заказа временно недоступна, попробуйте чуть позже.",
    errorButton: "Временная проверка времени",
    errorAlert: "Не удалось проверить рабочее время. Попробуйте отправить заказ чуть позже."
  },
  kk: {
    closedBanner: "Қазір біз жұмыс істемейміз. Тапсырыстар күн сайын 9:00-ден 18:00-ге дейін қабылданады.",
    closedNote: "Мәзір мен себет әрқашан қолжетімді. Тапсырысты тек 9:00-ден 18:00-ге дейін жіберуге болады (UTC+5).",
    closedButton: "Тапсырыс 9:00-ден 18:00-ге дейін",
    closedAlert: "Қазір біз жұмыс істемейміз. Тапсырысты 9:00-ден 18:00-ге дейін жіберуге болады (UTC+5).",
    checkingNote: "Жұмыс уақытын тексеріп жатырмыз. Тапсырыс батырмасы автоматты түрде ашылады.",
    checkingButton: "Уақыт тексерілуде...",
    checkingAlert: "Қазір жұмыс уақытын тексеріп жатырмыз. Бірнеше секундтан кейін қайталап көріңіз.",
    errorNote: "Жұмыс уақытын тексеру мүмкін болмады. Тапсырыс жіберу уақытша қолжетімсіз, кейінірек қайталап көріңіз.",
    errorButton: "Уақыт тексерілуде",
    errorAlert: "Жұмыс уақытын тексеру мүмкін болмады. Тапсырысты сәл кейінірек жіберіп көріңіз."
  },
  en: {
    closedBanner: "We are currently closed. Orders are accepted daily from 9:00 to 18:00.",
    closedNote: "You can browse the menu and build your cart at any time. Orders can be sent only from 9:00 to 18:00 (UTC+5).",
    closedButton: "Orders from 9:00 to 18:00",
    closedAlert: "We are currently closed. Orders can be sent from 9:00 to 18:00 (UTC+5).",
    checkingNote: "Checking business hours. The order button will unlock automatically.",
    checkingButton: "Checking time...",
    checkingAlert: "We are checking business hours now. Please try again in a couple of seconds.",
    errorNote: "We could not verify business hours right now. Order sending is temporarily unavailable, please try again later.",
    errorButton: "Time check in progress",
    errorAlert: "We could not verify business hours right now. Please try sending the order a little later."
  }
};

const WORK_SCHEDULE_SOURCES = [
  {
    name: "timeapi.io",
    url: `https://timeapi.io/api/Time/current/zone?timeZone=${encodeURIComponent(WORK_SCHEDULE.timezone)}`,
    parse(data) {
      const hour = Number(data?.hour);
      const minute = Number(data?.minute);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) throw new Error("Invalid timeapi.io response");
      return { hour, minute };
    }
  },
  {
    name: "worldtimeapi.org",
    url: `https://worldtimeapi.org/api/timezone/${WORK_SCHEDULE.timezone}`,
    parse(data) {
      const match = String(data?.datetime || "").match(/T(\d{2}):(\d{2})/);
      if (!match) throw new Error("Invalid worldtimeapi.org response");
      return { hour: Number(match[1]), minute: Number(match[2]) };
    }
  }
];

const MENU_SYNC = {
  intervalMs: 8000,
  focusThrottleMs: 2000,
  fullReloadMs: 20000,
  cacheBucketMs: 12000,
  requestTimeoutMs: 15000,
  retryAttempts: 5,
  retryDelayMs: 900
};

const MENU_ERROR_COPY = {
  ru: {
    description: "Мы временно не можем получить данные из меню. Обычно помогает повторная загрузка через несколько секунд.",
    retryHint: "Если проблема повторяется, проверьте интернет и попробуйте ещё раз."
  },
  kk: {
    description: "Қазір мәзір деректерін ала алмай тұрмыз. Әдетте бірнеше секундтан кейін қайта жүктеу көмектеседі.",
    retryHint: "Қате қайталанса, интернетті тексеріп, қайтадан көріңіз."
  },
  en: {
    description: "We cannot get the menu data right now. In most cases, trying again in a few seconds helps.",
    retryHint: "If it keeps happening, check your connection and try again."
  }
};

const MENU_HEADER_ALIASES = {
  name: ["name", "\u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435", "\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435"],
  price: ["price", "\u0446\u0435\u043d\u0430"],
  category: ["category", "\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f"],
  available: ["available", "\u043d\u0430\u043b\u0438\u0447\u0438\u0435 (\u0434\u0430/\u043d\u0435\u0442)", "\u043d\u0430\u043b\u0438\u0447\u0438\u0435"],
  photo: ["photo", "photo 1", "photo 2", "\u0444\u043e\u0442\u043e", "\u0444\u043e\u0442\u043e 1", "\u0444\u043e\u0442\u043e 2", "image", "image 1", "image 2", "\u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430", "\u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 1", "\u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 2"],
  banner: ["banner", "banners", "\u0431\u0430\u043d\u043d\u0435\u0440", "\u0431\u0430\u043d\u043d\u0435\u0440\u044b"],
  description: ["description", "\u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"],
  weight: ["weight", "\u0433\u0440\u0430\u043c\u043c\u043e\u0432\u043a\u0430", "\u0432\u0435\u0441", "\u0433\u0440\u0430\u043c\u043c\u044b"],
  calories: ["calories", "\u043a\u0430\u043b\u043e\u0440\u0438\u0438", "\u043a\u043a\u0430\u043b"],
  categoryOrder: ["category order", "category_order", "\u043f\u043e\u0440\u044f\u0434\u043e\u043a \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0439", "\u043f\u043e\u0440\u044f\u0434\u043e\u043a \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438"],
  categoryIcon: ["category icon", "category icons", "\u0437\u043d\u0430\u0447\u043a\u0438 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0439", "\u0437\u043d\u0430\u0447\u043e\u043a \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438", "\u0438\u043a\u043e\u043d\u043a\u0430 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438", "\u0438\u043a\u043e\u043d\u043a\u0438 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0439"]
};

const MENU_PHOTO_HEADER_RE = /^(photo|image|\u0444\u043e\u0442\u043e|\u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430)(\s*\d+)?$/i;
const MENU_AVAILABLE_TRUE_VALUES = new Set([
  "true",
  "yes",
  "1",
  "\u0434\u0430",
  "\u0435\u0441\u0442\u044c",
  "\u0432 \u043d\u0430\u043b\u0438\u0447\u0438\u0438"
]);

const MENU_SYNC_TEXT = {
  ru: {
    unavailableRemoved: "Некоторые блюда закончились и были убраны из корзины."
  },
  kk: {
    unavailableRemoved: "Кейбір тағамдар бітіп қалды және себеттен алынып тасталды."
  },
  en: {
    unavailableRemoved: "Some dishes are no longer available and were removed from the cart."
  }
};

let pendingOrder = null;
let workScheduleState = {
  status: "checking",
  isOpen: false,
  source: "",
  checkedAt: 0,
  error: ""
};
let workScheduleRefreshTimer = null;
let workScheduleRequestToken = 0;
let workScheduleMonitoringStarted = false;
let menuSyncTimer = null;
let menuSyncMonitoringStarted = false;
let menuSyncInFlight = null;
let menuLastSyncAt = 0;
let menuLastFullLoadAt = 0;
let menuLastCsvSnapshot = "";
let menuLastAvailabilitySnapshot = "";
const menuFetchInFlight = new Map();
let backgroundTranslationToken = 0;
let menuRenderToken = 0;
let menuRenderItems = [];
let menuRenderedCount = 0;
let menuRenderObserver = null;
let categoryTilesObserver = null;
let categoryRibbonSyncTimer = 0;
let scheduledBackgroundTranslationId = 0;
const OVERLAY_SCROLL_CONTAINER_SELECTOR = ".modal-content, .dish-modal-shell, .thanks-card";

function orderFlowText(key) {
  const table = ORDER_FLOW_TEXT[currentLanguage] || ORDER_FLOW_TEXT.ru;
  return table[key] || ORDER_FLOW_TEXT.ru[key] || key;
}

function scheduleText(key) {
  const table = WORK_SCHEDULE_TEXT[currentLanguage] || WORK_SCHEDULE_TEXT.ru;
  return table[key] || WORK_SCHEDULE_TEXT.ru[key] || key;
}

function menuSyncText(key) {
  const table = MENU_SYNC_TEXT[currentLanguage] || MENU_SYNC_TEXT.ru;
  return table[key] || MENU_SYNC_TEXT.ru[key] || key;
}

function menuErrorText(key) {
  const table = MENU_ERROR_COPY[currentLanguage] || MENU_ERROR_COPY.ru;
  return table[key] || MENU_ERROR_COPY.ru[key] || "";
}

function normalizeMenuHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function findMenuHeaderIndex(headers, key) {
  return headers.findIndex((header) => MENU_HEADER_ALIASES[key].includes(header));
}

function getOrderedMenuCategories() {
  const uniqueCategories = [...new Set(menuData.map((item) => item.category).filter(Boolean))];
  const orderedFromSheet = categoryOrderList.filter((cat) => uniqueCategories.includes(cat));
  const notInSheetOrder = uniqueCategories.filter((cat) => !orderedFromSheet.includes(cat));
  return [...orderedFromSheet, ...notInSheetOrder];
}

function buildCategoryOrderListFromRows(rows, categoryOrderIndex) {
  if (!Array.isArray(rows) || categoryOrderIndex < 0) return [];

  return rows
    .map((line) => (Array.isArray(line) ? line : parseCsvLine(line)))
    .map((cols) => String(cols[categoryOrderIndex] || "").trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);
}

function buildCategoryIconMapFromRows(rows, categoryOrderIndex, categoryIconIndex) {
  if (!Array.isArray(rows) || categoryOrderIndex < 0 || categoryIconIndex < 0) return {};

  return rows.reduce((acc, line) => {
    const cols = Array.isArray(line) ? line : parseCsvLine(line);
    const categoryName = String(cols[categoryOrderIndex] || "").trim();
    const rawIcon = String(cols[categoryIconIndex] || "").trim();
    const categoryIcon = rawIcon ? normalizePhotoUrl(rawIcon, { targetWidth: 100 }) : "";

    if (categoryName && categoryIcon && !acc[categoryName]) {
      acc[categoryName] = categoryIcon;
    }

    return acc;
  }, {});
}

function isAvailableMenuValue(value) {
  return MENU_AVAILABLE_TRUE_VALUES.has(normalizeMenuHeader(value));
}

function getConfiguredSheetId() {
  const explicitId = String(CONFIG.sheetId || "").trim();
  if (explicitId) return explicitId;

  const sheetUrl = String(CONFIG.sheetUrl || "").trim();
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  return match ? match[1] : "";
}

function getConfiguredSheetGid() {
  const explicitGid = String(CONFIG.sheetGid || "").trim();
  if (explicitGid) return explicitGid;

  const sheetUrl = String(CONFIG.sheetUrl || "").trim();
  if (!sheetUrl) return "0";

  const hashMatch = sheetUrl.match(/gid=(\d+)/i);
  if (hashMatch && hashMatch[1]) return hashMatch[1];

  try {
    const url = new URL(sheetUrl);
    return url.searchParams.get("gid") || "0";
  } catch {
    return "0";
  }
}

function buildDirectSheetCsvUrl(options = {}) {
  const sheetId = getConfiguredSheetId();
  if (!sheetId) return "";

  const gid = getConfiguredSheetGid();
  const query = String(options.query || "").trim();
  const url = new URL(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`);
  url.searchParams.set("tqx", "out:csv");
  if (gid) url.searchParams.set("gid", gid);
  if (query) url.searchParams.set("tq", query);
  return url.toString();
}

function getMenuRequestUrls(options = {}) {
  const urls = [];
  const directUrl = buildDirectSheetCsvUrl(options);
  const csvUrl = String(CONFIG.csvUrl || "").trim();

  if (directUrl) urls.push(directUrl);
  if (csvUrl) urls.push(csvUrl);

  return [...new Set(urls.filter(Boolean))];
}

function buildFreshMenuRequestUrl(url) {
  try {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set("_menuSync", String(Math.floor(Date.now() / MENU_SYNC.cacheBucketMs)));
    return nextUrl.toString();
  } catch {
    const separator = String(url).includes("?") ? "&" : "?";
    return `${url}${separator}_menuSync=${Math.floor(Date.now() / MENU_SYNC.cacheBucketMs)}`;
  }
}

function buildMenuRequestKey(url) {
  try {
    const nextUrl = new URL(url, window.location.href);
    nextUrl.searchParams.delete("_menuSync");
    return nextUrl.toString();
  } catch {
    return String(url || "").replace(/([?&])_menuSync=[^&]*/g, "$1").replace(/[?&]$/, "");
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createMenuLoadError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeMenuLoadError(error) {
  if (error?.name === "AbortError") {
    return createMenuLoadError("timeout", "Menu request timed out");
  }

  if (error instanceof TypeError) {
    return createMenuLoadError("network", "Network error while loading menu");
  }

  if (error instanceof Error) {
    return error;
  }

  return createMenuLoadError("unknown", String(error));
}

function shouldRetryMenuLoad(error) {
  const code = String(error?.code || "");
  return ["timeout", "network", "http_429", "http_500", "http_502", "http_503", "http_504"].includes(code);
}

async function fetchCsvTextFromUrl(url) {
  const requestKey = buildMenuRequestKey(url);
  if (menuFetchInFlight.has(requestKey)) {
    return menuFetchInFlight.get(requestKey);
  }

  const requestPromise = (async () => {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), MENU_SYNC.requestTimeoutMs)
      : null;

    try {
      const response = await fetch(buildFreshMenuRequestUrl(url), {
        redirect: "follow",
        cache: "no-cache",
        signal: controller ? controller.signal : undefined
      });
      if (!response.ok) throw createMenuLoadError(`http_${response.status}`, `CSV load failed (${response.status})`);
      const text = await response.text();
      if (!String(text || "").trim()) throw createMenuLoadError("empty", "CSV response is empty");
      return text;
    } catch (error) {
      throw normalizeMenuLoadError(error);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  })();

  menuFetchInFlight.set(requestKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    if (menuFetchInFlight.get(requestKey) === requestPromise) {
      menuFetchInFlight.delete(requestKey);
    }
  }
}

async function fetchMenuCsvText(options = {}) {
  const urls = getMenuRequestUrls(options);
  let lastError = createMenuLoadError("network", "CSV load failed");

  for (const url of urls) {
    for (let attempt = 0; attempt < MENU_SYNC.retryAttempts; attempt += 1) {
      try {
        return await fetchCsvTextFromUrl(url);
      } catch (error) {
        lastError = normalizeMenuLoadError(error);
        const isLastAttempt = attempt >= (MENU_SYNC.retryAttempts - 1);
        if (isLastAttempt || !shouldRetryMenuLoad(lastError)) break;
        await wait(MENU_SYNC.retryDelayMs * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function parseMenuCsvDataset(text) {
  const lines = String(text || "").split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) throw new Error("CSV empty");

  const parsedRows = lines.map((line) => parseCsvLine(line));
  const headers = parsedRows[0].map(normalizeMenuHeader);
  const photoIndexes = headers.reduce((acc, header, index) => {
    const isPhotoColumn = MENU_HEADER_ALIASES.photo.includes(header) || MENU_PHOTO_HEADER_RE.test(header);
    if (isPhotoColumn) acc.push(index);
    return acc;
  }, []);

  const indexes = {
    name: findMenuHeaderIndex(headers, "name"),
    price: findMenuHeaderIndex(headers, "price"),
    category: findMenuHeaderIndex(headers, "category"),
    available: findMenuHeaderIndex(headers, "available"),
    photo: findMenuHeaderIndex(headers, "photo"),
    banner: findMenuHeaderIndex(headers, "banner"),
    description: findMenuHeaderIndex(headers, "description"),
    weight: findMenuHeaderIndex(headers, "weight"),
    calories: findMenuHeaderIndex(headers, "calories"),
    categoryOrder: findMenuHeaderIndex(headers, "categoryOrder"),
    categoryIcon: findMenuHeaderIndex(headers, "categoryIcon")
  };

  if ([indexes.name, indexes.price, indexes.category, indexes.available].some((index) => index === -1)) {
    throw new Error("Missing required CSV columns");
  }

  const dataRows = parsedRows.slice(1);
  const nextCategoryOrderList = buildCategoryOrderListFromRows(dataRows, indexes.categoryOrder);
  const nextCategoryIconMap = buildCategoryIconMapFromRows(dataRows, indexes.categoryOrder, indexes.categoryIcon);

  const nextHeroBanners = buildHeroBannersFromRows(parsedRows, indexes.banner);
  const nextMenuData = dataRows
    .map((cols, index) => {
      const rawPhotos = photoIndexes
        .map((photoIndex) => cols[photoIndex] || "")
        .map((value) => String(value || "").trim())
        .filter(Boolean);
      const photos = rawPhotos
        .map((value) => normalizePhotoUrl(value))
        .filter(Boolean);

      return {
        id: `item-${index}`,
        name: String(cols[indexes.name] || "").trim(),
        price: Number(cols[indexes.price]) || 0,
        category: String(cols[indexes.category] || "").trim(),
        available: isAvailableMenuValue(cols[indexes.available]),
        rawPhoto: rawPhotos[0] || (indexes.photo >= 0 ? String(cols[indexes.photo] || "").trim() : ""),
        rawPhotos,
        photo: photos[0] || (indexes.photo >= 0 ? normalizePhotoUrl(cols[indexes.photo]) : ""),
        photos,
        description: indexes.description >= 0 ? cols[indexes.description] : "",
        weight: indexes.weight >= 0 ? cols[indexes.weight] : "",
        calories: indexes.calories >= 0 ? cols[indexes.calories] : ""
      };
    })
    .filter((item) => item.name && item.available);

  return {
    rawText: String(text || ""),
    menuItems: nextMenuData,
    categoryOrderList: nextCategoryOrderList,
    categoryIconMap: nextCategoryIconMap,
    heroBanners: nextHeroBanners
  };
}

function parseMenuAvailabilitySnapshot(text) {
  const lines = String(text || "").split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) throw new Error("CSV empty");

  const parsedRows = lines.map((line) => parseCsvLine(line));
  const headers = parsedRows[0].map(normalizeMenuHeader);
  const iName = findMenuHeaderIndex(headers, "name");
  const iAvailable = findMenuHeaderIndex(headers, "available");

  if (iName === -1 || iAvailable === -1) {
    throw new Error("Missing required CSV columns");
  }

  return parsedRows
    .slice(1)
    .map((cols) => ({
      name: String(cols[iName] || "").trim(),
      available: isAvailableMenuValue(cols[iAvailable])
    }))
    .filter((row) => row.name);
}

function syncCartWithAvailableMenu(showNotice = false) {
  const availableNames = new Set(menuData.map((item) => item.name));
  const nextCart = cart.filter((item) => availableNames.has(item.name));

  if (nextCart.length === cart.length) return false;

  cart = nextCart;
  saveCart();
  if (showNotice) showToast(menuSyncText("unavailableRemoved"));
  return true;
}

function applyMenuDataset(dataset, options = {}) {
  categoryOrderList = Array.isArray(dataset.categoryOrderList) ? dataset.categoryOrderList : [];
  categoryIconMap = dataset.categoryIconMap && typeof dataset.categoryIconMap === "object"
    ? { ...dataset.categoryIconMap }
    : {};
  heroBanners = Array.isArray(dataset.heroBanners) ? dataset.heroBanners : [];
  menuData = Array.isArray(dataset.menuItems) ? dataset.menuItems : [];
  menuLastCsvSnapshot = String(dataset.rawText || "");
  menuLastFullLoadAt = Date.now();
  menuLastAvailabilitySnapshot = "";

  if (activeHeroBanner >= heroBanners.length) activeHeroBanner = 0;
  if (activeCategory !== ALL_CATEGORY && !menuData.some((item) => item.category === activeCategory)) {
    activeCategory = ALL_CATEGORY;
  }
  if (activeDishName && !getItemByName(activeDishName)) {
    closeDishModal();
  }

  return syncCartWithAvailableMenu(options.showRemovedToast === true);
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

function savePendingOrder(order) {
  pendingOrder = order && Array.isArray(order.items) && order.items.length ? order : null;
  if (!pendingOrder) {
    localStorage.removeItem(PENDING_ORDER_KEY);
    return;
  }

  localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pendingOrder));
}

function loadPendingOrder() {
  try {
    const raw = localStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) {
      pendingOrder = null;
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items) || !parsed.items.length) {
      pendingOrder = null;
      localStorage.removeItem(PENDING_ORDER_KEY);
      return null;
    }

    pendingOrder = parsed;
    return pendingOrder;
  } catch {
    pendingOrder = null;
    localStorage.removeItem(PENDING_ORDER_KEY);
    return null;
  }
}

function clearPendingOrder() {
  pendingOrder = null;
  localStorage.removeItem(PENDING_ORDER_KEY);
}

function restorePendingOrderDraft(order = pendingOrder) {
  if (!order || !order.customer) return;

  const nameInput = document.getElementById("user-name");
  const phoneInput = document.getElementById("user-phone");
  const addressInput = document.getElementById("user-address");
  const commentInput = document.getElementById("order-comment");
  if (nameInput) nameInput.value = order.customer.name || "";
  if (phoneInput) phoneInput.value = order.customer.phone || "";
  if (addressInput) addressInput.value = order.customer.address || "";
  if (commentInput) commentInput.value = order.customer.comment || "";
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

function isInsideOverlayScrollContainer(target) {
  return target instanceof Element && Boolean(target.closest(OVERLAY_SCROLL_CONTAINER_SELECTOR));
}

function preventBackgroundOverlayScroll(event) {
  if (!document.body.classList.contains("no-scroll")) return;
  if (isInsideOverlayScrollContainer(event.target)) return;
  event.preventDefault();
}

document.addEventListener("wheel", preventBackgroundOverlayScroll, { passive: false });
document.addEventListener("touchmove", preventBackgroundOverlayScroll, { passive: false });

function setPageScrollLock(locked) {
  document.documentElement.classList.toggle("no-scroll", locked);
  document.body.classList.toggle("no-scroll", locked);
}

function syncOverlayState() {
  const cartModal = document.getElementById("cart-modal");
  const dishModal = document.getElementById("dish-modal");
  const orderConfirmModal = document.getElementById("order-confirm-modal");
  const thanksModal = document.getElementById("thanks-modal");

  const isOverlayActive = (element) => Boolean(
    element &&
    (element.classList.contains("show") || element.classList.contains("is-closing"))
  );
  const isOverlayShown = (element) => Boolean(element && element.classList.contains("show"));

  const hasOverlayOpen = Boolean(
    isOverlayActive(cartModal) ||
    isOverlayActive(dishModal) ||
    isOverlayActive(orderConfirmModal) ||
    isOverlayActive(thanksModal)
  );
  const hasVisibleOverlay = Boolean(
    isOverlayShown(cartModal) ||
    isOverlayShown(dishModal) ||
    isOverlayShown(orderConfirmModal) ||
    isOverlayShown(thanksModal)
  );

  setPageScrollLock(hasOverlayOpen);

  const cartButton = document.getElementById("cart-button");
  if (cartButton) cartButton.classList.toggle("is-hidden", hasVisibleOverlay);
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
  requestAnimationFrame(() => {
    element.classList.add("show");
    syncOverlayState();
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
  if (!el) return;
  el.setAttribute("aria-hidden", "false");
  el.classList.add("show");
  syncOverlayState();
}

function hideThanksModal() {
  const el = document.getElementById("thanks-modal");
  if (!el) return;
  el.classList.remove("show");
  el.setAttribute("aria-hidden", "true");
  syncOverlayState();
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

  updateDishModalCarousel(item);
  updateDishModalControls();
}

function openDishModal(name) {
  const item = getItemByName(name);
  const modal = document.getElementById("dish-modal");
  if (!item || !modal) return;
  preloadDishPhotos(item, { targetWidth: DISH_MODAL_PHOTO_WIDTH });
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

function renderCategoryTiles(categories = getOrderedMenuCategories()) {
  const tilesBand = document.getElementById("category-tiles-band");
  const tilesEl = document.getElementById("category-tiles");
  if (!tilesBand || !tilesEl) return;

  if (!categories.length) {
    tilesBand.hidden = true;
    tilesEl.innerHTML = "";
    refreshCategoryTilesObserver();
    return;
  }

  tilesBand.hidden = false;
  tilesEl.innerHTML = categories
    .map((cat) => {
      const translatedCategory = getDisplayCategoryLabel(cat);
      const categoryIcon = String(categoryIconMap[cat] || "").trim();
      const iconMarkup = categoryIcon
        ? `<img class="category-tile-icon" src="${escapeHtml(categoryIcon)}" alt="" aria-hidden="true" loading="lazy" decoding="async" onerror="this.remove()" />`
        : `<span class="category-tile-icon category-tile-icon--fallback" aria-hidden="true">${escapeHtml(translatedCategory.slice(0, 1).toUpperCase())}</span>`;
      return `<button class="category-tile ${cat === activeCategory ? "active" : ""}" data-category="${cat}" type="button" aria-pressed="${cat === activeCategory ? "true" : "false"}"><span class="category-tile-art">${iconMarkup}</span><span class="category-tile-label">${escapeHtml(translatedCategory)}</span></button>`;
    })
    .join("");

  refreshCategoryTilesObserver();
}

function renderCategories() {
  const categoriesEl = document.getElementById("categories");
  const orderedCategories = getOrderedMenuCategories();
  const categories = [ALL_CATEGORY, ...orderedCategories];

  categoriesEl.innerHTML = categories
    .map((cat) => {
      const translatedCategory = cat === ALL_CATEGORY
        ? t("categoriesAll")
        : getDisplayCategoryLabel(cat);
      const categoryIcon = cat === ALL_CATEGORY ? "" : String(categoryIconMap[cat] || "").trim();
      const withIconClass = categoryIcon ? " category-btn--with-icon" : "";
      const iconMarkup = categoryIcon
        ? `<img class="category-btn-icon" src="${escapeHtml(categoryIcon)}" alt="" aria-hidden="true" loading="lazy" decoding="async" onerror="this.remove()" />`
        : "";
      return `<button class="category-btn${withIconClass} ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${iconMarkup}<span class="category-btn-label">${escapeHtml(translatedCategory)}</span></button>`;
    })
    .join("");

  renderCategoryTiles(orderedCategories);
}

function renderCategoriesSkeleton() {
  const tilesBand = document.getElementById("category-tiles-band");
  const tilesEl = document.getElementById("category-tiles");
  const categoriesEl = document.getElementById("categories");
  if (!categoriesEl) return;
  if (tilesBand && tilesEl) {
    tilesBand.hidden = false;
    tilesEl.innerHTML = Array.from({ length: 6 }, () => (
      `<span class="category-tile-skeleton" aria-hidden="true"><span class="category-tile-skeleton-icon"></span><span class="category-tile-skeleton-label"></span></span>`
    )).join("");
  }
  const skeletonItems = [88, 126, 114, 98, 108, 92];
  categoriesEl.innerHTML = skeletonItems
    .map((width) => `<span class="category-skeleton" style="width:${width}px" aria-hidden="true"></span>`)
    .join("");

  refreshCategoryTilesObserver();
}

function scrollMenuToFilteredResults() {
  const menuGrid = document.getElementById("menu-grid");
  const header = document.getElementById("site-header");
  const menuDock = document.getElementById("menu-dock");
  const categoriesRibbon = document.getElementById("categories-ribbon");
  if (!menuGrid) return;

  const headerHeight = header ? header.offsetHeight : 0;
  const dockHeight = menuDock ? menuDock.offsetHeight : 0;
  const hiddenRibbonHeight = menuDock && categoriesRibbon && menuDock.classList.contains("menu-dock--tiles-visible")
    ? categoriesRibbon.scrollHeight
    : 0;
  const top = menuGrid.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
  window.scrollTo({ top: Math.max(top - dockHeight - hiddenRibbonHeight, 0), behavior: "smooth" });
}

function selectCategory(category) {
  if (!category) return;
  activeCategory = category;
  renderCategories();
  renderMenu();
  scrollMenuToFilteredResults();
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
  bindMenuGridEvents();

  const modalControls = document.getElementById("dish-modal-controls");
  if (!modalControls) return;

  modalControls.querySelectorAll(".btn-add").forEach((btn) => {
    btn.onclick = () => {
      const item = getItemByName(btn.dataset.name);
      if (item) addToCart(item);
    };
  });

  modalControls.querySelectorAll(".card-plus").forEach((btn) => {
    btn.onclick = () => {
      changeQty(btn.dataset.name, 1);
    };
  });

  modalControls.querySelectorAll(".card-minus").forEach((btn) => {
    btn.onclick = () => {
      changeQty(btn.dataset.name, -1);
    };
  });
}

function bindMenuCardEvents() {
  bindMenuGridEvents();
}

function bindCategoryEvents() {
  const categoriesEl = document.getElementById("categories");
  if (!categoriesEl || categoriesEl.dataset.bound === "true") return;
  categoriesEl.dataset.bound = "true";

  categoriesEl.addEventListener("click", (event) => {
    const button = event.target.closest(".category-btn[data-category]");
    if (!button || !categoriesEl.contains(button)) return;
    selectCategory(button.dataset.category);
  });
}

function bindCategoryTileEvents() {
  const tilesEl = document.getElementById("category-tiles");
  if (!tilesEl || tilesEl.dataset.bound === "true") return;
  tilesEl.dataset.bound = "true";

  tilesEl.addEventListener("click", (event) => {
    const button = event.target.closest(".category-tile[data-category]");
    if (!button || !tilesEl.contains(button)) return;
    selectCategory(button.dataset.category);
  });
}

function bindMenuGridEvents() {
  const grid = document.getElementById("menu-grid");
  if (!grid || grid.dataset.bound === "true") return;
  grid.dataset.bound = "true";

  grid.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".btn-add[data-name], .card-plus[data-name], .card-minus[data-name]")) return;

    const card = event.target.closest(".food-card[data-item-name]");
    if (!card || !grid.contains(card)) return;

    const item = getItemByName(card.dataset.itemName);
    if (item) preloadDishPhotos(item, { targetWidth: DISH_MODAL_PHOTO_WIDTH });
  }, { passive: true });

  grid.addEventListener("click", (event) => {
    const addButton = event.target.closest(".btn-add[data-name]");
    if (addButton && grid.contains(addButton)) {
      const item = getItemByName(addButton.dataset.name);
      if (item) addToCart(item);
      return;
    }

    const plusButton = event.target.closest(".card-plus[data-name]");
    if (plusButton && grid.contains(plusButton)) {
      changeQty(plusButton.dataset.name, 1);
      return;
    }

    const minusButton = event.target.closest(".card-minus[data-name]");
    if (minusButton && grid.contains(minusButton)) {
      changeQty(minusButton.dataset.name, -1);
      return;
    }

    const card = event.target.closest(".food-card[data-item-name]");
    if (card && grid.contains(card)) {
      openDishModal(card.dataset.itemName);
    }
  });

  grid.addEventListener("keydown", (event) => {
    const card = event.target.closest(".food-card[data-item-name]");
    if (!card || event.target !== card) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDishModal(card.dataset.itemName);
    }
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

function cancelPendingMenuRender() {
  menuRenderToken += 1;
  menuRenderItems = [];
  menuRenderedCount = 0;
  if (menuRenderObserver) {
    menuRenderObserver.disconnect();
    menuRenderObserver = null;
  }
  document.body.classList.remove("menu-rendering");
}

function getFilteredMenuItems() {
  const query = normalizeSearchText(searchQuery);
  const byCategory = activeCategory === ALL_CATEGORY
    ? menuData
    : menuData.filter((item) => item.category === activeCategory);

  if (!query) return byCategory;
  const itemsForSearch = menuData;
  if (currentLanguage === "ru") {
    return itemsForSearch.filter((item) => {
      const name = normalizeSearchText(item.name);
      const description = normalizeSearchText(item.description);
      return name.includes(query) || description.includes(query);
    });
  }

  return itemsForSearch.filter((item) => {
    const displayItem = getDisplayItem(item);
    const name = normalizeSearchText(item.name);
    const displayName = normalizeSearchText(displayItem.displayName || "");
    const description = normalizeSearchText(item.description);
    const displayDescription = normalizeSearchText(displayItem.displayDescription || "");
    return name.includes(query) ||
      displayName.includes(query) ||
      description.includes(query) ||
      displayDescription.includes(query);
  });
}

function replaceSearchSeparators(value) {
  return String(value || "").replace(/[-–—]/g, " ");
}

const SEARCH_ALLOWED_CHARS_PATTERN = /[^0-9a-z\u0400-\u04FF\s]+/gi;
const SEARCH_STOP_WORDS = new Set([
  "\u043f\u043e",
  "\u0441",
  "\u0438",
  "\u0432",
  "\u0430",
  "\u043d\u0430",
  "\u0438\u0437",
  "\u0441\u043e",
  "\u0448\u0442",
  "\u0433",
  "\u043c\u043b"
]);
function normalizeSearchText(value) {
  return replaceSearchSeparators(value)
    .toLowerCase()
    .replace(SEARCH_ALLOWED_CHARS_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchWords(value) {
  const normalized = normalizeSearchText(value);
  return normalized
    ? normalized
      .split(" ")
      .filter((word) => word.length >= 3)
      .filter((word) => !SEARCH_STOP_WORDS.has(word))
    : [];
}

function buildSearchKey(words) {
  return words.join(" ");
}

function getSearchKeys(textList) {
  return textList
    .map((text) => buildSearchKey(getSearchWords(text)))
    .filter(Boolean);
}

function getSearchWordSets(textList) {
  return textList
    .map((text) => getSearchWords(text))
    .filter((words) => words.length)
    .map((words) => new Set(words));
}

function wordSetsContainAllQueryWords(wordSets, queryWords) {
  return wordSets.some((wordSet) => queryWords.every((word) => wordSet.has(word)));
}

function buildMenuCardHtml(item, index) {
  const displayItem = getDisplayItem(item);
  const categoryHtml = `<p class="food-category${displayItem.displayCategory ? "" : " is-empty"}">${displayItem.displayCategory ? escapeHtml(displayItem.displayCategory) : "&nbsp;"}</p>`;
  const weightHtml = `<span class="food-weight${displayItem.displayWeight ? "" : " is-empty"}">${displayItem.displayWeight ? escapeHtml(displayItem.displayWeight) : "&nbsp;"}</span>`;
  const imageHtml = buildDishPhotoHtml(item, "food-image", displayItem.displayName || item.name);
  const animationDelay = Math.min(index, 4) * 0.04;

  return `<article class="food-card" data-item-name="${escapeHtml(item.name)}" data-cart-state="${getCartQty(item.name) > 0 ? "qty" : "add"}" tabindex="0" role="button" aria-label="${escapeHtml(t("dishOpenAria", { name: displayItem.displayName || item.name }))}" style="animation-delay:${animationDelay}s">${imageHtml}<div class="food-copy"><div class="food-topline"><div class="food-price">${money(item.price)}</div>${weightHtml}</div><h3 class="food-title">${escapeHtml(displayItem.displayName || item.name)}</h3><div class="food-details">${categoryHtml}</div></div><div class="food-footer"><div class="item-controls" data-state="${getCartQty(item.name) > 0 ? "qty" : "add"}">${buildControlsHtml(item.name)}</div></div></article>`;
}

function getMenuChunkSize(isInitialChunk = false) {
  const isMobileMenu = window.matchMedia && window.matchMedia("(max-width: 860px)").matches;
  if (isInitialChunk) return isMobileMenu ? 6 : 12;
  return isMobileMenu ? 6 : 10;
}

function observeMenuRenderSentinel(sentinel, renderToken) {
  if (!sentinel) return;
  if (menuRenderObserver) {
    menuRenderObserver.disconnect();
  }

  menuRenderObserver = new IntersectionObserver((entries) => {
    const isVisible = entries.some((entry) => entry.isIntersecting);
    if (!isVisible) return;

    if (menuRenderObserver) {
      menuRenderObserver.disconnect();
      menuRenderObserver = null;
    }

    renderNextMenuChunk(renderToken);
  }, {
    root: null,
    rootMargin: "900px 0px"
  });

  menuRenderObserver.observe(sentinel);
}

function renderNextMenuChunk(renderToken) {
  if (renderToken !== menuRenderToken) return;

  const grid = document.getElementById("menu-grid");
  if (!grid || !menuRenderItems.length) return;
  if (menuRenderedCount >= menuRenderItems.length) {
    document.body.classList.remove("menu-rendering");
    return;
  }

  const sentinel = grid.querySelector(".menu-grid-sentinel");
  if (sentinel) sentinel.remove();

  const isInitialChunk = menuRenderedCount === 0;
  const chunkSize = getMenuChunkSize(isInitialChunk);
  const html = menuRenderItems
    .slice(menuRenderedCount, menuRenderedCount + chunkSize)
    .map((item, index) => buildMenuCardHtml(item, menuRenderedCount + index))
    .join("");
  const appendedCount = Math.min(chunkSize, Math.max(menuRenderItems.length - menuRenderedCount, 0));

  document.body.classList.add("menu-rendering");
  grid.insertAdjacentHTML("beforeend", html);
  bindDishPhotoFallbacks(grid);
  menuRenderedCount += appendedCount;
  document.body.classList.remove("menu-rendering");

  if (menuRenderedCount >= menuRenderItems.length) return;

  const nextSentinel = document.createElement("div");
  nextSentinel.className = "menu-grid-sentinel";
  nextSentinel.setAttribute("aria-hidden", "true");
  grid.appendChild(nextSentinel);
  observeMenuRenderSentinel(nextSentinel, renderToken);
}

function syncCategoryRibbonOffsetsSoon() {
  syncStickyOffsets();
  updateTomatoLayerState();
  if (categoryRibbonSyncTimer) {
    window.clearTimeout(categoryRibbonSyncTimer);
  }
  categoryRibbonSyncTimer = window.setTimeout(() => {
    categoryRibbonSyncTimer = 0;
    syncStickyOffsets();
    updateTomatoLayerState();
  }, 320);
}

function setCategoryRibbonHiddenByTiles(isHidden) {
  const menuDock = document.getElementById("menu-dock");
  const categoriesRibbon = document.getElementById("categories-ribbon");
  if (!menuDock || !categoriesRibbon) return;

  const shouldHide = Boolean(isHidden);
  const hasHiddenClass = menuDock.classList.contains("menu-dock--tiles-visible");
  if (hasHiddenClass === shouldHide) return;

  menuDock.classList.toggle("menu-dock--tiles-visible", shouldHide);
  categoriesRibbon.setAttribute("aria-hidden", shouldHide ? "true" : "false");
  syncCategoryRibbonOffsetsSoon();
}

function getCategoryTilesObserverRootMargin() {
  const header = document.getElementById("site-header");
  const searchWrap = document.querySelector(".menu-dock .search-wrap");
  const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  const searchHeight = searchWrap ? Math.ceil(searchWrap.getBoundingClientRect().height) : 0;
  const topOffset = headerHeight + searchHeight + 10;
  return `-${topOffset}px 0px 0px 0px`;
}

function refreshCategoryTilesObserver() {
  if (categoryTilesObserver) {
    categoryTilesObserver.disconnect();
    categoryTilesObserver = null;
  }

  const tilesBand = document.getElementById("category-tiles-band");
  if (!tilesBand || tilesBand.hidden) {
    setCategoryRibbonHiddenByTiles(false);
    return;
  }

  categoryTilesObserver = new IntersectionObserver((entries) => {
    const tilesVisible = entries.some((entry) => entry.isIntersecting);
    setCategoryRibbonHiddenByTiles(tilesVisible);
  }, {
    root: null,
    threshold: 0.02,
    rootMargin: getCategoryTilesObserverRootMargin()
  });

  categoryTilesObserver.observe(tilesBand);
}

function renderMenu() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;

  cancelPendingMenuRender();
  const filtered = getFilteredMenuItems();

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="status">${escapeHtml(t("noResults"))}</p>`;
    return;
  }

  const renderToken = ++menuRenderToken;
  menuRenderItems = filtered;
  menuRenderedCount = 0;

  grid.innerHTML = "";
  bindMenuControlEvents();
  bindMenuCardEvents();
  renderNextMenuChunk(renderToken);
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="status">${escapeHtml(t("cartEmpty"))}</p>`;
    document.getElementById("subtotal-amount").textContent = money(0);
    document.getElementById("discount-amount").textContent = money(0);
    document.getElementById("total-amount").textContent = "0";
    updateCartButton();
    updateOrderAvailabilityUi();
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
  updateOrderAvailabilityUi();
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

function createPendingOrderSnapshot(userName, userPhone, userAddress, orderComment) {
  const { finalTotal } = updateTotals();
  return {
    items: cart.map((item) => ({ ...item })),
    promo: { ...promo },
    total: finalTotal,
    customer: {
      name: userName,
      phone: userPhone,
      address: userAddress,
      comment: orderComment
    },
    createdAt: Date.now()
  };
}

function resetOrderStateAfterSubmit() {
  cart = [];
  promo = { code: "", discount: 0 };
  saveCart();
  savePromo();
  renderCart();
  updateMenuControls();
  document.getElementById("promo-code").value = "";
  document.getElementById("promo-hint").textContent = "";
  document.getElementById("order-form").reset();
}

function hasPendingOrder() {
  return Boolean(pendingOrder && Array.isArray(pendingOrder.items) && pendingOrder.items.length);
}

function renderPendingOrderConfirmation() {
  const itemsWrap = document.getElementById("order-confirm-items");
  const totalAmount = document.getElementById("order-confirm-total-amount");
  if (!itemsWrap || !totalAmount || !hasPendingOrder()) return;

  itemsWrap.innerHTML = pendingOrder.items.map((item) => {
    const menuItem = getItemByName(item.name) || findItemByAnyName(item.name);
    const displayItem = menuItem
      ? getDisplayItemForLanguage(menuItem, currentLanguage)
      : { displayName: item.name, displayWeight: getLocalizedWeight(item.weight, currentLanguage) };
    const sum = Number(item.price || 0) * Number(item.qty || 0);
    const weightText = displayItem.displayWeight ? ` (${displayItem.displayWeight})` : "";

    return `<div class="cart-item">
      <div class="cart-item-top">
        <span class="cart-item-name">${escapeHtml(`${displayItem.displayName || item.name}${weightText}`)}</span>
        <strong>${money(sum)}</strong>
      </div>
      <div class="cart-controls">
        <span>${escapeHtml(`x${item.qty}`)}</span>
      </div>
    </div>`;
  }).join("");

  totalAmount.textContent = Number(pendingOrder.total || 0).toLocaleString(getLocale());
}

function showPendingOrderConfirmation() {
  if (!hasPendingOrder()) return;
  restorePendingOrderDraft();
  renderPendingOrderConfirmation();
  openOverlay(document.getElementById("order-confirm-modal"));
}

function dismissPendingOrderConfirmation(options = {}) {
  const reopenCart = options.reopenCart === true;
  const draftOrder = pendingOrder;
  clearPendingOrder();
  restorePendingOrderDraft(draftOrder);
  closeOverlay(document.getElementById("order-confirm-modal"));

  if (reopenCart) {
    window.setTimeout(() => {
      restorePendingOrderDraft(draftOrder);
      openCart();
    }, OVERLAY_CLOSE_DURATION);
  }
}

function confirmPendingOrderCompletion() {
  clearPendingOrder();
  resetOrderStateAfterSubmit();

  const modal = document.getElementById("order-confirm-modal");
  if (modal && (modal.classList.contains("show") || modal.classList.contains("is-closing"))) {
    closeOverlay(modal);
    window.setTimeout(showThanksModal, OVERLAY_CLOSE_DURATION);
    return;
  }

  showThanksModal();
}

function promptPendingOrderConfirmation() {
  if (!hasPendingOrder()) return;
  if (document.visibilityState === "hidden") return;

  const modal = document.getElementById("order-confirm-modal");
  if (!modal || modal.classList.contains("show") || modal.classList.contains("is-closing")) return;
  showPendingOrderConfirmation();
}

function cleanPhone(phone) {
  return String(phone).replace(/\D/g, "");
}

function setWorkScheduleState(nextState) {
  workScheduleState = { ...workScheduleState, ...nextState };
  updateOrderAvailabilityUi();
}

function isWithinWorkingHours(hour, minute) {
  const totalMinutes = (Number(hour) * 60) + Number(minute);
  return totalMinutes >= WORK_SCHEDULE.startMinutes && totalMinutes < WORK_SCHEDULE.endMinutes;
}

async function fetchTimePayload(url) {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), WORK_SCHEDULE.requestTimeoutMs)
    : null;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller ? controller.signal : undefined
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

async function refreshWorkingHoursStatus(options = {}) {
  const requestToken = ++workScheduleRequestToken;
  const silent = options.silent === true;

  if (!silent) {
    setWorkScheduleState({
      status: "checking",
      isOpen: false,
      source: "",
      error: ""
    });
  }

  let lastError = new Error("Working hours check failed");

  for (const source of WORK_SCHEDULE_SOURCES) {
    try {
      const payload = await fetchTimePayload(source.url);
      const parsed = source.parse(payload);
      const isOpen = isWithinWorkingHours(parsed.hour, parsed.minute);

      if (requestToken !== workScheduleRequestToken) return false;

      setWorkScheduleState({
        status: isOpen ? "open" : "closed",
        isOpen,
        source: source.name,
        checkedAt: Date.now(),
        error: ""
      });
      return true;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  if (requestToken !== workScheduleRequestToken) return false;

  setWorkScheduleState({
    status: "error",
    isOpen: false,
    source: "",
    checkedAt: Date.now(),
    error: lastError.message || "Working hours check failed"
  });
  return false;
}

function getOrderAvailabilityTextState() {
  if (workScheduleState.status === "closed") return "closed";
  if (workScheduleState.status === "error") return "error";
  if (workScheduleState.status === "open") return "open";
  return "checking";
}

function updateOrderAvailabilityUi() {
  const banner = document.getElementById("schedule-status-banner");
  const bannerText = document.getElementById("schedule-status-text");
  const orderButton = document.getElementById("order-submit-button");
  const orderButtonText = document.getElementById("btn-order-text");
  const orderNote = document.getElementById("order-availability-note");
  const state = getOrderAvailabilityTextState();
  const isOpen = state === "open";

  if (banner && bannerText) {
    const showBanner = state === "closed";
    bannerText.textContent = showBanner ? scheduleText("closedBanner") : "";
    banner.classList.toggle("is-hidden", !showBanner);
    banner.setAttribute("aria-hidden", String(!showBanner));
  }

  if (orderButton) {
    orderButton.disabled = !isOpen;
    orderButton.classList.toggle("is-disabled", !isOpen);
  }

  if (orderButtonText) {
    if (state === "closed") orderButtonText.textContent = scheduleText("closedButton");
    else if (state === "error") orderButtonText.textContent = scheduleText("errorButton");
    else if (state === "checking") orderButtonText.textContent = scheduleText("checkingButton");
    else orderButtonText.textContent = t("orderButton");
  }

  if (orderNote) {
    orderNote.textContent = "";
    orderNote.hidden = true;
  }

  syncStickyOffsets();
}

function canSubmitOrderNow() {
  return workScheduleState.status === "open" && workScheduleState.isOpen === true;
}

function getOrderAvailabilityAlertText() {
  if (workScheduleState.status === "closed") return scheduleText("closedAlert");
  if (workScheduleState.status === "error") return scheduleText("errorAlert");
  return scheduleText("checkingAlert");
}

function handleWorkingHoursRefreshTrigger() {
  if (document.visibilityState === "hidden") return;
  const justChecked = workScheduleState.checkedAt && (Date.now() - workScheduleState.checkedAt) < 60 * 1000;
  if (justChecked) return;
  refreshWorkingHoursStatus({ silent: true });
}

function startWorkingHoursMonitoring() {
  if (workScheduleMonitoringStarted) return;
  workScheduleMonitoringStarted = true;
  refreshWorkingHoursStatus();

  if (workScheduleRefreshTimer) {
    window.clearInterval(workScheduleRefreshTimer);
  }
  workScheduleRefreshTimer = window.setInterval(() => {
    refreshWorkingHoursStatus({ silent: true });
  }, WORK_SCHEDULE.refreshMs);

  window.addEventListener("focus", handleWorkingHoursRefreshTrigger);
  window.addEventListener("pageshow", handleWorkingHoursRefreshTrigger);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") handleWorkingHoursRefreshTrigger();
  });
}

function getVersionTokenFromHref(selector, marker) {
  const element = document.querySelector(selector);
  const href = element?.getAttribute("href") || element?.getAttribute("src") || "";
  const match = href.match(new RegExp(`${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=(\\d+)`));
  return match ? match[1] : "";
}

async function updateSiteVersionLabel() {
  const versionLabel = document.getElementById("site-version");
  const settingsVersionLabel = document.getElementById("settings-version");
  if (!versionLabel && !settingsVersionLabel) return;

  let siteVersion = "";
  try {
    const response = await fetch(`./service-worker.js?siteVersion=${Date.now()}`, { cache: "no-store" });
    const text = await response.text();
    const directMatch = text.match(/SITE_VERSION\s*=\s*"([^"]+)"/);
    const cacheMatch = text.match(/APP_CACHE\s*=\s*`pervoe-vtoroe-app-v\$\{SITE_VERSION\}`|APP_CACHE\s*=\s*"pervoe-vtoroe-app-v([^"]+)"/);
    if (directMatch && directMatch[1]) {
      siteVersion = directMatch[1];
    } else if (cacheMatch && cacheMatch[1]) {
      siteVersion = cacheMatch[1];
    }
  } catch {}

  const footerText = siteVersion
    ? `Номер версии сайта - ${siteVersion}`
    : "Номер версии сайта - автоматически";
  const settingsText = siteVersion
    ? `Версия сайта ${siteVersion}`
    : "Версия сайта - автоматически";

  if (versionLabel) versionLabel.textContent = footerText;
  if (settingsVersionLabel) settingsVersionLabel.textContent = settingsText;
}

function syncStickyOffsets() {
  const header = document.getElementById("site-header");
  const menuDock = document.getElementById("menu-dock");
  if (!header) return;
  document.documentElement.style.setProperty("--logo-bar-height", `${Math.ceil(header.offsetHeight)}px`);
  if (menuDock) {
    document.documentElement.style.setProperty("--menu-dock-height", `${Math.ceil(menuDock.offsetHeight)}px`);
  }
}

function updateTomatoLayerState() {
  const isSearchTomatoEnabled = document.documentElement.dataset.searchTomato !== "off";
  if (!isSearchTomatoEnabled) {
    document.body.classList.remove("tomato-over-header");
    return;
  }

  const heroBand = document.getElementById("hero-band");
  const header = document.getElementById("site-header");
  const menuDock = document.getElementById("menu-dock");
  if (!heroBand || !header || !menuDock) return;

  const heroHiddenByState = heroBand.classList.contains("is-hidden");
  const headerHeight = Math.ceil(header.getBoundingClientRect().height);
  const dockHeight = Math.ceil(menuDock.getBoundingClientRect().height);
  const heroBottom = heroBand.getBoundingClientRect().bottom;
  const heroStillVisibleBehindSearch = !heroHiddenByState && heroBottom > (headerHeight + Math.min(dockHeight, 40));

  document.body.classList.toggle("tomato-over-header", !heroStillVisibleBehindSearch);
}

function updateHeroSearchState() {
  const heroBand = document.getElementById("hero-band");
  const searchWrap = document.querySelector(".search-wrap");
  const searchInput = document.getElementById("menu-search");
  if (!searchInput) return;
  const isSearchFocused = document.activeElement === searchInput;
  if (searchWrap) searchWrap.classList.toggle("search-focused", isSearchFocused);
  if (!heroBand) return;
  const shouldHide = isSearchFocused || searchQuery.trim().length > 0;
  window.clearTimeout(window.__heroSearchStateTimer);

  const applyHeroState = () => {
    heroBand.classList.toggle("is-hidden", shouldHide);
    updateTomatoLayerState();
    window.__heroSearchStateTimer = null;
  };

  if (shouldHide && isSearchFocused && !searchQuery.trim()) {
    window.__heroSearchStateTimer = window.setTimeout(applyHeroState, 110);
    return;
  }

  applyHeroState();
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
  setText("#settings-popover-text", "");
  const settingsPopoverText = document.getElementById("settings-popover-text");
  if (settingsPopoverText) settingsPopoverText.hidden = true;
  const languageGroup = document.querySelector(".settings-language-list");
  if (languageGroup) languageGroup.setAttribute("aria-label", t("settingsGroupAria"));
  const settingsIntro = t("settingsText");
  const shortSettingsIntro = settingsIntro
    .replace(" и в следующий раз откроется уже на нём.", ".")
    .replace(" и сайт откроется на нем при следующем визите.", ".")
    .replace(" and open in it next time.", ".")
    .replace(" және келесі жолы сол тілде ашылады.", ".");
  setText("#settings-popover-text", "");
  setText("#settings-theme-title", t("settingsThemeTitle"));
  setText("#settings-theme-text", "");
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
  setText("#thanks-review-text", t("footerReview"));
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
  updateOrderAvailabilityUi();

  setAriaLabel("#dish-modal-close", t("dishCloseAria"));
  setAriaLabel("#dish-modal-prev", t("dishPrevPhotoAria"));
  setAriaLabel("#dish-modal-next", t("dishNextPhotoAria"));
  setText("#dish-modal-copy-label", t("dishAbout"));

  setText("#thanks-title", orderFlowText("successTitle"));
  setText("#thanks-text", orderFlowText("successText"));
  setText("#thanks-close", orderFlowText("successButton"));
  setText("#order-confirm-title", orderFlowText("confirmTitle"));
  setAriaLabel("#order-confirm-close", t("closeAria"));
  setText("#order-confirm-text", orderFlowText("confirmText"));
  setText("#order-confirm-list-title", orderFlowText("summaryTitle"));
  setText("#order-confirm-total-label", t("total"));
  setText("#order-confirm-question", orderFlowText("confirmQuestion"));
  setText("#order-confirm-no", orderFlowText("confirmNo"));
  setText("#order-confirm-yes", orderFlowText("confirmYes"));

  const promoHint = document.getElementById("promo-hint");
  if (promoHint) {
    if (!promo.code) promoHint.textContent = "";
    else if (promo.code === "SKIDKA10") promoHint.textContent = t("promoAppliedPercent");
    else if (promo.code === "FIRST200") promoHint.textContent = t("promoAppliedFixed");
  }

  if (hasPendingOrder()) {
    restorePendingOrderDraft();
    renderPendingOrderConfirmation();
  }

  renderHeroBanners();
  if (lastMenuLoadError && !menuData.length) renderMenuErrorState(lastMenuLoadError);
}

function showMenuTranslatingState() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  cancelPendingMenuRender();
  grid.innerHTML = `<div class="ios-loader-wrap"><div class="ios-loader"></div><p class="status">${t("translatingMenu")}</p></div>`;
}

function renderMenuErrorState(errorMessage) {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  cancelPendingMenuRender();
  lastMenuLoadError = String(errorMessage || "");

  grid.innerHTML = `<div class="status-card status-card--menu-error">
    <div class="status-card-badge" aria-hidden="true">Меню</div>
    <p class="status-card-title">${escapeHtml(t("loadErrorHeading"))}</p>
    <p class="status-card-copy">${escapeHtml(menuErrorText("description"))}</p>
    <p class="status-card-hint">${escapeHtml(menuErrorText("retryHint"))}</p>
    <button id="menu-retry-button" class="status-retry-btn" type="button">${escapeHtml(t("retryLoadButton"))}</button>
  </div>`;

  const retryButton = document.getElementById("menu-retry-button");
  if (retryButton) {
    retryButton.addEventListener("click", () => {
      loadMenu();
    });
  }
}

function rerenderMenuSurface() {
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

  if (hasPendingOrder()) {
    renderPendingOrderConfirmation();
  }
}

function renderMenuErrorState(errorMessage) {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  cancelPendingMenuRender();
  lastMenuLoadError = String(errorMessage || "");

  const errorTitle = escapeHtml(t("loadErrorHeading"));
  const errorCopy = escapeHtml(menuErrorText("description"));
  const errorHint = escapeHtml(menuErrorText("retryHint"));
  const retryLabel = escapeHtml(t("retryLoadButton"));

  grid.innerHTML = `
    <div class="status-card status-card--menu-error">
      <div class="status-card-menu-error-shell">
        <div class="status-card-badge-row">
          <span class="status-card-icon" aria-hidden="true">!</span>
          <div class="status-card-badge">Меню</div>
        </div>
        <p class="status-card-title">${errorTitle}</p>
        <p class="status-card-copy">${errorCopy}</p>
        <p class="status-card-hint">${errorHint}</p>
        <button id="menu-retry-button" class="status-retry-btn" type="button">${retryLabel}</button>
      </div>
    </div>`;

  const retryButton = document.getElementById("menu-retry-button");
  if (retryButton) {
    retryButton.addEventListener("click", () => {
      loadMenu();
    });
  }
}

function clearScheduledBackgroundTranslations() {
  if (!scheduledBackgroundTranslationId) return;

  if (typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(scheduledBackgroundTranslationId);
  } else {
    window.clearTimeout(scheduledBackgroundTranslationId);
  }

  scheduledBackgroundTranslationId = 0;
}

function scheduleBackgroundTranslations(lang = currentLanguage) {
  if (lang === "ru" || !menuData.length) return Promise.resolve(false);

  clearScheduledBackgroundTranslations();

  return new Promise((resolve) => {
    const runTranslations = () => {
      scheduledBackgroundTranslationId = 0;
      startBackgroundTranslations(lang).then(resolve);
    };

    if (typeof window.requestIdleCallback === "function") {
      scheduledBackgroundTranslationId = window.requestIdleCallback(runTranslations, { timeout: 1800 });
    } else {
      scheduledBackgroundTranslationId = window.setTimeout(runTranslations, 400);
    }
  });
}

function startBackgroundTranslations(lang = currentLanguage) {
  if (lang === "ru" || !menuData.length) return Promise.resolve(false);

  const translationToken = ++backgroundTranslationToken;

  return Promise.all([
    ensureMenuTranslations(lang),
    ensureHeroBannerTranslations(lang)
  ])
    .then(() => {
      flushTranslationCache();

      if (translationToken !== backgroundTranslationToken) return false;
      if (currentLanguage !== lang) return false;

      rerenderMenuSurface();
      return true;
    })
    .catch(() => false);
}

async function setLanguage(lang) {
  if (!LANGUAGE_META[lang] || lang === currentLanguage) return;
  clearScheduledBackgroundTranslations();
  currentLanguage = lang;
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  applyStaticTranslations();
  updateSettingsLanguageButtons(true);
  rerenderMenuSurface();

  if (menuData.length && currentLanguage !== "ru") {
    startBackgroundTranslations(currentLanguage).finally(() => {
      updateSettingsLanguageButtons(false);
      updateThemeButtons(false);
    });
    return;
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
  document.body.classList.add("settings-popover-open");
  updateTomatoLayerState();
}

function closeSettingsPopover() {
  const popover = document.getElementById("settings-popover");
  const toggle = document.getElementById("settings-toggle");
  if (!popover || !toggle) return;
  popover.classList.remove("show");
  popover.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("settings-popover-open");
  updateTomatoLayerState();
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
  renderHeroBannerSkeleton();
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
    if (hasPendingOrder()) renderPendingOrderConfirmation();
  } catch (error) {
    renderHeroBanners();
    renderMenuErrorState(error.message);
  } finally {
    document.body.classList.remove("menu-loading");
    updateCartButton();
  }
}

async function loadMenu(options = {}) {
  const silent = options.silent === true;
  const grid = document.getElementById("menu-grid");

  if (!silent) {
    cancelPendingMenuRender();
    clearScheduledBackgroundTranslations();
    lastMenuLoadError = "";
    document.body.classList.add("menu-loading");
    renderHeroBannerSkeleton();
    renderCategoriesSkeleton();
    grid.innerHTML = `<div class="ios-loader-wrap"><div class="ios-loader"></div><p class="status">${escapeHtml(t("loadingMenu"))}</p></div>`;
  }

  try {
    const text = options.csvText || await fetchMenuCsvText({
      allowCacheFallback: !silent && !menuData.length
    });
    if (silent && menuLastCsvSnapshot && text === menuLastCsvSnapshot) {
      menuLastSyncAt = Date.now();
      return false;
    }

    const dataset = parseMenuCsvDataset(text);
    lastMenuLoadError = "";
    const removedFromCart = applyMenuDataset(dataset, { showRemovedToast: silent });

    if (!menuData.length) {
      cancelPendingMenuRender();
      renderHeroBanners();
      renderCategories();
      grid.innerHTML = `<p class="status">${escapeHtml(t("noAvailable"))}</p>`;
      renderCart();
      if (hasPendingOrder()) renderPendingOrderConfirmation();
      menuLastSyncAt = Date.now();
      startMenuSyncMonitoring();
      return true;
    }

    rerenderMenuSurface();

    if (currentLanguage !== "ru") {
      scheduleBackgroundTranslations(currentLanguage);
    }

    if (!silent && removedFromCart) updateTotals();
    menuLastSyncAt = Date.now();
    startMenuSyncMonitoring();
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lastMenuLoadError = message;
    if (!silent || !menuData.length) {
      renderHeroBanners();
      renderMenuErrorState(message);
    }
    return false;
  } finally {
    if (!silent) {
      document.body.classList.remove("menu-loading");
    }
    updateCartButton();
  }
}

async function syncMenuAvailability() {
  const availabilityText = await fetchMenuCsvText({ query: "select A, D" });
  if (availabilityText === menuLastAvailabilitySnapshot) return false;

  const rows = parseMenuAvailabilitySnapshot(availabilityText);
  const availableNames = new Set(rows.filter((row) => row.available).map((row) => row.name));
  const currentNames = new Set(menuData.map((item) => item.name));
  const hasRemovedItems = menuData.some((item) => !availableNames.has(item.name));
  const hasNewItems = [...availableNames].some((name) => !currentNames.has(name));

  menuLastAvailabilitySnapshot = availabilityText;

  if (!hasRemovedItems && !hasNewItems) return false;
  if (hasNewItems || availableNames.size === 0) {
    return loadMenu({ silent: true });
  }

  menuData = menuData.filter((item) => availableNames.has(item.name));
  if (activeCategory !== ALL_CATEGORY && !menuData.some((item) => item.category === activeCategory)) {
    activeCategory = ALL_CATEGORY;
  }
  if (activeDishName && !getItemByName(activeDishName)) {
    closeDishModal();
  }

  syncCartWithAvailableMenu(true);
  renderCategories();
  renderMenu();
  renderCart();
  if (hasPendingOrder()) renderPendingOrderConfirmation();
  return true;
}

async function refreshMenuSync(options = {}) {
  if (menuSyncInFlight) return menuSyncInFlight;

  menuSyncInFlight = (async () => {
    try {
      const needsFullReload =
        options.forceFull === true ||
        !menuLastFullLoadAt ||
        (Date.now() - menuLastFullLoadAt) >= MENU_SYNC.fullReloadMs;

      const result = needsFullReload
        ? await loadMenu({ silent: true })
        : await syncMenuAvailability();

      menuLastSyncAt = Date.now();
      return result;
    } catch {
      return false;
    } finally {
      menuSyncInFlight = null;
    }
  })();

  return menuSyncInFlight;
}

function handleMenuSyncRefreshTrigger(forceFull = false) {
  if (document.visibilityState === "hidden") return;

  const justSynced = menuLastSyncAt && (Date.now() - menuLastSyncAt) < MENU_SYNC.focusThrottleMs;
  if (!forceFull && justSynced) return;

  refreshMenuSync({ forceFull });
}

function startMenuSyncMonitoring() {
  if (menuSyncTimer) {
    window.clearInterval(menuSyncTimer);
    menuSyncTimer = null;
  }
  menuSyncMonitoringStarted = false;
}

function startMenuSyncMonitoring() {
  if (menuSyncMonitoringStarted) return;

  if (menuSyncTimer) {
    window.clearInterval(menuSyncTimer);
  }

  menuSyncMonitoringStarted = true;
  menuSyncTimer = window.setInterval(() => {
    handleMenuSyncRefreshTrigger(false);
  }, MENU_SYNC.intervalMs);

  window.addEventListener("focus", () => {
    handleMenuSyncRefreshTrigger(false);
  });
  window.addEventListener("pageshow", () => {
    handleMenuSyncRefreshTrigger(false);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      handleMenuSyncRefreshTrigger(false);
    }
  });
}

bindCategoryEvents();
bindMenuGridEvents();

