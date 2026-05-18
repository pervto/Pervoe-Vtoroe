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

let pendingOrder = null;
let pageScrollLockY = 0;

function orderFlowText(key) {
  const table = ORDER_FLOW_TEXT[currentLanguage] || ORDER_FLOW_TEXT.ru;
  return table[key] || ORDER_FLOW_TEXT.ru[key] || key;
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

function setPageScrollLock(locked) {
  if (locked) {
    if (!document.body.classList.contains("no-scroll")) {
      pageScrollLockY = window.scrollY || window.pageYOffset || 0;
      document.body.style.top = `-${pageScrollLockY}px`;
    }

    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
    return;
  }

  const shouldRestoreScroll = document.body.classList.contains("no-scroll");
  document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
  document.body.style.top = "";

  if (shouldRestoreScroll) {
    window.scrollTo(0, pageScrollLockY);
  }
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

  const hasOverlayOpen = Boolean(
    isOverlayActive(cartModal) ||
    isOverlayActive(dishModal) ||
    isOverlayActive(orderConfirmModal) ||
    isOverlayActive(thanksModal)
  );

  setPageScrollLock(hasOverlayOpen);

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
    if (hasPendingOrder()) renderPendingOrderConfirmation();
  } catch (error) {
    renderMenuErrorState(error.message);
  } finally {
    document.body.classList.remove("menu-loading");
    updateCartButton();
  }
}

