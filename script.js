let menuData = [];
let cart = [];
let activeCategory = "Все";
let searchQuery = "";
let toastTimer = null;
let promo = { code: "", discount: 0 };
let categoryOrderList = [];
let activeDishName = "";
let activeDishSlide = 0;
let activeDishPhotoKey = "";
let activeDishPointerId = null;
let activeDishDragStartX = 0;
let activeDishDragOffsetX = 0;
let activeDishIsDragging = false;

const CART_KEY = "pervoe-vtoroe-cart";
const PROMO_KEY = "pervoe-vtoroe-promo";
const DISH_CAROUSEL_TRANSITION = "transform .34s cubic-bezier(.22, 1, .36, 1)";
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

function money(value) {
  return `${Number(value || 0).toLocaleString("ru-RU")}₸`;
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
  if (photoUrl) {
    return `<img class="${className}" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" />`;
  }
  return `<div class="food-image-placeholder">Фотография блюда скоро появится</div>`;
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

  if (track.dataset.photoKey !== photoKey) {
    track.innerHTML = photos.length
      ? photos.map((photoUrl, index) => (
        `<div class="dish-modal-slide">
          <img class="dish-modal-image" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(`${item.name} ${index + 1}`)}" loading="eager" decoding="async" draggable="false" />
        </div>`
      )).join("")
      : `<div class="dish-modal-slide"><div class="dish-modal-image-placeholder">Фотография блюда скоро появится</div></div>`;

    track.dataset.photoKey = photoKey;
  }

  activeDishPhotoKey = photoKey;
  return totalSlides;
}

function renderDishModalDots(totalSlides) {
  const dots = document.getElementById("dish-modal-dots");
  if (!dots) return;

  dots.innerHTML = Array.from({ length: totalSlides }, (_, index) => (
    `<button class="dish-modal-dot${index === activeDishSlide ? " is-active" : ""}" type="button" data-slide-index="${index}" aria-label="Перейти к фото ${index + 1}" aria-current="${index === activeDishSlide ? "true" : "false"}"></button>`
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
    hint.textContent = "Промокод не указан";
    savePromo();
    updateTotals();
    return;
  }

  if (code === "SKIDKA10") {
    promo = { code, discount: 10 };
    hint.textContent = "Промокод применен: скидка 10%";
  } else if (code === "FIRST200") {
    promo = { code, discount: 200 };
    hint.textContent = "Промокод применен: скидка 200₸";
  } else {
    promo = { code: "", discount: 0 };
    hint.textContent = "Промокод не найден";
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
  const hasOverlayOpen = Boolean(
    (cartModal && cartModal.classList.contains("show")) ||
    (dishModal && dishModal.classList.contains("show"))
  );

  document.body.classList.toggle("no-scroll", hasOverlayOpen);

  const cartButton = document.getElementById("cart-button");
  if (cartButton) cartButton.classList.toggle("is-hidden", hasOverlayOpen);
}

function openCart() {
  document.getElementById("cart-modal").classList.add("show");
  syncOverlayState();
}

function closeCart() {
  document.getElementById("cart-modal").classList.remove("show");
  syncOverlayState();
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
  const title = document.getElementById("dish-modal-title");
  const price = document.getElementById("dish-modal-price");
  const weight = document.getElementById("dish-modal-weight");
  const category = document.getElementById("dish-modal-category");
  const meta = document.getElementById("dish-modal-meta");
  const description = document.getElementById("dish-modal-description");

  const metaParts = [];
  if (item.calories) metaParts.push(`${item.calories} ккал`);

  title.textContent = item.name;
  price.textContent = money(item.price);
  weight.textContent = item.weight || "";
  weight.classList.toggle("is-empty", !item.weight);
  category.textContent = item.category || "Без категории";
  category.classList.toggle("is-empty", !item.category);
  meta.textContent = metaParts.join(" • ");
  meta.classList.toggle("is-empty", !metaParts.length);
  description.textContent = item.description || "Подробное описание скоро появится.";
  description.classList.toggle("is-empty", !item.description);

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
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  syncOverlayState();
}

function closeDishModal() {
  const modal = document.getElementById("dish-modal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  activeDishName = "";
  activeDishSlide = 0;
  activeDishPointerId = null;
  activeDishDragStartX = 0;
  activeDishDragOffsetX = 0;
  activeDishIsDragging = false;
  syncOverlayState();
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
  document.getElementById("total-amount").textContent = Number(finalTotal).toLocaleString("ru-RU");
  if (subtotalRow) subtotalRow.classList.toggle("is-hidden", !hasDiscount);
  if (discountRow) discountRow.classList.toggle("is-hidden", !hasDiscount);
  if (totalLabel) totalLabel.textContent = hasDiscount ? "Итого" : "Общая сумма";
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
  showToast(`${item.name} добавлено в корзину`);
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
  const categories = ["Все", ...orderedFromSheet, ...notInSheetOrder];

  categoriesEl.innerHTML = categories
    .map((cat) => `<button class="category-btn ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${cat}</button>`)
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
    : `<button class="btn-add${animationClass}" data-state="${state}" data-name="${escapeHtml(name)}"><span class="btn-add-main"><span class="btn-add-label">Добавить</span></span></button>`;
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
  const byCategory = activeCategory === "Все" ? menuData : menuData.filter((item) => item.category === activeCategory);
  const filtered = byCategory.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="status">Ничего не найдено. Попробуйте другое название.</p>';
    return;
  }

  grid.innerHTML = filtered
    .map((item, index) => {
      const metaParts = [];
      if (item.calories) metaParts.push(`${item.calories} ккал`);
      const categoryHtml = `<p class="food-category${item.category ? "" : " is-empty"}">${item.category ? escapeHtml(item.category) : "&nbsp;"}</p>`;
      const metaHtml = `<p class="food-meta${metaParts.length ? "" : " is-empty"}">${metaParts.length ? escapeHtml(metaParts.join(" • ")) : "&nbsp;"}</p>`;
      const descriptionHtml = `<p class="food-description${item.description ? "" : " is-empty"}">${item.description ? escapeHtml(item.description) : "&nbsp;"}</p>`;
      const weightHtml = `<span class="food-weight${item.weight ? "" : " is-empty"}">${item.weight ? escapeHtml(item.weight) : "&nbsp;"}</span>`;
      const imageHtml = buildDishPhotoHtml(item);

      return `<article class="food-card" data-item-name="${escapeHtml(item.name)}" data-cart-state="${getCartQty(item.name) > 0 ? "qty" : "add"}" tabindex="0" role="button" aria-label="Открыть ${escapeHtml(item.name)}" style="animation-delay:${index * 0.06}s">${imageHtml}<div class="food-copy"><div class="food-topline"><div class="food-price">${money(item.price)}</div>${weightHtml}</div><h3 class="food-title">${escapeHtml(item.name)}</h3><div class="food-details">${categoryHtml}${metaHtml}${descriptionHtml}</div></div><div class="food-footer"><div class="item-controls" data-state="${getCartQty(item.name) > 0 ? "qty" : "add"}">${buildControlsHtml(item.name)}</div></div></article>`;
    })
    .join("");

  bindMenuControlEvents();
  bindMenuCardEvents();
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="status">Корзина пока пустая.</p>';
    document.getElementById("subtotal-amount").textContent = money(0);
    document.getElementById("discount-amount").textContent = money(0);
    document.getElementById("total-amount").textContent = "0";
    updateCartButton();
    return;
  }

  cartItems.innerHTML = cart
    .map((item) => {
      const sum = item.price * item.qty;
      return `<div class="cart-item"><div class="cart-item-top"><span class="cart-item-name">${item.name}</span><strong>${money(sum)}</strong></div><div class="cart-controls"><div class="qty-box"><button class="qty-btn" data-action="minus" data-name="${item.name}">-</button><span>${item.qty}</span><button class="qty-btn" data-action="plus" data-name="${item.name}">+</button></div><button class="remove-btn" data-action="remove" data-name="${item.name}">Удалить</button></div></div>`;
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
  const orderLines = cart.map((item) => `- ${item.name} x${item.qty} \"${money(item.price * item.qty)}\"`).join("\n");
  const promoText = promo.code ? `\nПромокод: ${promo.code}` : "";
  const commentText = orderComment ? `\nКомментарий: ${orderComment}` : "";
  return `Здравствуйте!\nХочу оформить заказ.\nИмя: ${userName}\nТелефон: ${userPhone}\nАдрес: ${userAddress}${commentText}${promoText}\nЗаказ:\n${orderLines}\n\nИтого: ${money(finalTotal)}`;
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

async function loadMenu() {
  const grid = document.getElementById("menu-grid");
  document.body.classList.add("menu-loading");
  renderCategoriesSkeleton();
  grid.innerHTML = '<div class="ios-loader-wrap"><div class="ios-loader"></div><p class="status">Загружаем меню...</p></div>';
  try {
    const response = await fetch(CONFIG.csvUrl, { redirect: "follow" });
    if (!response.ok) throw new Error(`Не удалось загрузить CSV (код ${response.status})`);

    const text = await response.text();
    const rows = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (rows.length < 2) throw new Error("CSV пустой или нет строк с блюдами");

    const headers = parseCsvLine(rows[0]).map((h) => h.trim().toLowerCase());
    const cleanHeaders = headers.map((h) => h.replace(/\s+/g, " "));

    const aliases = {
      name: ["name", "наименование", "название"],
      price: ["price", "цена"],
      category: ["category", "категория"],
      available: ["available", "наличие (да/нет)", "наличие"],
      photo: ["photo", "photo 1", "photo 2", "фото", "фото 1", "фото 2", "image", "image 1", "image 2", "картинка", "картинка 1", "картинка 2"],
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
    const iDescription = findIndexByAliases("description");
    const iWeight = findIndexByAliases("weight");
    const iCalories = findIndexByAliases("calories");
    const iCategoryOrder = findIndexByAliases("categoryOrder");

    if ([iName, iPrice, iCategory, iAvailable].some((i) => i === -1)) {
      throw new Error("В CSV нужны колонки: name/Наименование, price/Цена, category/Категория, available/Наличие (Да/Нет)");
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

    menuData = rows
      .slice(1)
      .map((line) => parseCsvLine(line))
      .map((cols) => {
        const photos = photoIndexes
          .map((index) => cols[index] || "")
          .map((value) => normalizePhotoUrl(value))
          .filter(Boolean);

        return {
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
      grid.innerHTML = '<p class="status">Нет доступных блюд. Проверьте колонку Наличие (Да/Нет).</p>';
      return;
    }

    renderCategories();
    renderMenu();
  } catch (error) {
    grid.innerHTML = `<p class="status">Ошибка загрузки меню: ${error.message}</p>`;
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

document.getElementById("promo-apply").addEventListener("click", applyPromoCode);
document.getElementById("promo-code").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyPromoCode();
  }
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
      window.__stickyMetricsTicking = false;
    });
  }
}, { passive: true });

window.addEventListener("load", syncStickyOffsets);
window.addEventListener("keydown", (event) => {
  const dishModal = document.getElementById("dish-modal");
  const cartModal = document.getElementById("cart-modal");
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
  if (dishModal && dishModal.classList.contains("show")) {
    closeDishModal();
    return;
  }
  if (cartModal && cartModal.classList.contains("show")) closeCart();
});

document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!cart.length) return alert("Корзина пустая. Добавьте блюда.");

  const userName = document.getElementById("user-name").value.trim();
  const userPhone = document.getElementById("user-phone").value.trim();
  const userAddress = document.getElementById("user-address").value.trim();
  const orderComment = document.getElementById("order-comment").value.trim();
  if (!userName || !userPhone || !userAddress) return alert("Заполните имя, телефон и адрес.");

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
loadMenu();
renderCart();
updateSearchClearVisibility();
syncStickyOffsets();
updateHeroSearchState();
if (promo.code) {
  document.getElementById("promo-code").value = promo.code;
  document.getElementById("promo-hint").textContent = "Промокод применен";
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(syncStickyOffsets);
}
