let menuData = [];
let cart = [];
let activeCategory = "Все";
let searchQuery = "";
let toastTimer = null;
let promo = { code: "", discount: 0 };
let categoryOrderList = [];

const CART_KEY = "pervoe-vtoroe-cart";
const PROMO_KEY = "pervoe-vtoroe-promo";
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

function openCart() {
  document.getElementById("cart-modal").classList.add("show");
  document.body.classList.add("no-scroll");
  document.getElementById("cart-button").classList.add("is-hidden");
}

function closeCart() {
  document.getElementById("cart-modal").classList.remove("show");
  document.body.classList.remove("no-scroll");
  document.getElementById("cart-button").classList.remove("is-hidden");
}

function showThanksModal() {
  const el = document.getElementById("thanks-modal");
  if (el) el.classList.add("show");
}

function hideThanksModal() {
  const el = document.getElementById("thanks-modal");
  if (el) el.classList.remove("show");
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

  document.getElementById("subtotal-amount").textContent = money(subtotal);
  document.getElementById("discount-amount").textContent = money(discountAmount);
  document.getElementById("total-amount").textContent = Number(finalTotal).toLocaleString("ru-RU");
  return { finalTotal };
}

function updateSearchClearVisibility() {
  const clearBtn = document.getElementById("search-clear");
  if (!clearBtn) return;
  if (searchQuery.trim()) clearBtn.classList.add("show");
  else clearBtn.classList.remove("show");
}

function updateMenuControls() {
  document.querySelectorAll("[data-item-name]").forEach((card) => {
    const name = card.dataset.itemName;
    const controls = card.querySelector(".item-controls");
    if (!controls) return;
    const qty = getCartQty(name);
    const previousState = controls.dataset.state || "add";
    const nextState = qty > 0 ? "qty" : "add";

    controls.dataset.state = nextState;
    controls.innerHTML = buildControlsHtml(name, {
      animate: previousState !== nextState,
      state: nextState
    });
  });

  bindMenuControlEvents();
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
      const menuDock = document.getElementById("menu-dock");
      if (menuGrid) {
        const headerHeight = menuDock ? menuDock.offsetHeight : 0;
        const top = menuGrid.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
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
    : `<button class="btn-add${animationClass}" data-state="${state}" data-name="${escapeHtml(name)}"><span class="btn-add-label">Добавить</span></button>`;
}

function bindMenuControlEvents() {
  const grid = document.getElementById("menu-grid");

  grid.querySelectorAll(".btn-add").forEach((btn) => {
    btn.onclick = () => {
      const item = menuData.find((x) => x.name === btn.dataset.name);
      if (item) addToCart(item);
    };
  });

  grid.querySelectorAll(".card-plus").forEach((btn) => {
    btn.onclick = () => changeQty(btn.dataset.name, 1);
  });

  grid.querySelectorAll(".card-minus").forEach((btn) => {
    btn.onclick = () => changeQty(btn.dataset.name, -1);
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
      if (item.weight) metaParts.push(item.weight);
      if (item.calories) metaParts.push(`${item.calories} ккал`);
      const categoryHtml = `<p class="food-category${item.category ? "" : " is-empty"}">${item.category ? escapeHtml(item.category) : "&nbsp;"}</p>`;
      const metaHtml = `<p class="food-meta${metaParts.length ? "" : " is-empty"}">${metaParts.length ? escapeHtml(metaParts.join(" • ")) : "&nbsp;"}</p>`;
      const descriptionHtml = `<p class="food-description${item.description ? "" : " is-empty"}">${item.description ? escapeHtml(item.description) : "&nbsp;"}</p>`;
      const photoUrl = normalizePhotoUrl(item.photo);
      const imageHtml = photoUrl
        ? `<img class="food-image" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.display='none'; this.insertAdjacentHTML('afterend','<div class=&quot;food-image-placeholder&quot;>Фотография блюда скоро появится</div>');" />`
        : `<div class="food-image-placeholder">Фотография блюда скоро появится</div>`;

      return `<article class="food-card" data-item-name="${escapeHtml(item.name)}" style="animation-delay:${index * 0.06}s">${imageHtml}<div class="food-copy"><h3 class="food-title">${escapeHtml(item.name)}</h3>${categoryHtml}${metaHtml}${descriptionHtml}</div><div class="food-footer"><div class="food-price">${money(item.price)}</div><div class="item-controls" data-state="${getCartQty(item.name) > 0 ? "qty" : "add"}">${buildControlsHtml(item.name)}</div></div></article>`;
    })
    .join("");

  bindMenuControlEvents();
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

function updateHeroSearchState() {
  const header = document.getElementById("site-header");
  const searchInput = document.getElementById("menu-search");
  if (!header || !searchInput) return;
  const headerRect = header.getBoundingClientRect();
  const headerCanBeSeen = headerRect.bottom > 0;
  const searchActive = document.activeElement === searchInput || searchQuery.trim().length > 0;
  const shouldHide = searchActive && headerCanBeSeen;
  header.classList.toggle("hero-search-hidden", shouldHide);
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
      photo: ["photo", "фото", "фото 1", "image", "картинка"],
      description: ["description", "описание"],
      weight: ["weight", "граммовка", "вес", "граммы"],
      calories: ["calories", "калории", "ккал"],
      categoryOrder: ["category order", "category_order", "порядок категорий", "порядок категории"]
    };

    const findIndexByAliases = (key) => cleanHeaders.findIndex((header) => aliases[key].includes(header));

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
      .map((cols) => ({
        name: cols[iName] || "",
        price: Number(cols[iPrice]) || 0,
        category: cols[iCategory] || "",
        available: ["true", "да", "yes", "1"].includes(String(cols[iAvailable] || "").trim().toLowerCase()),
        photo: iPhoto >= 0 ? cols[iPhoto] : "",
        description: iDescription >= 0 ? cols[iDescription] : "",
        weight: iWeight >= 0 ? cols[iWeight] : "",
        calories: iCalories >= 0 ? cols[iCalories] : ""
      }))
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
  if (!window.__heroSearchTicking) {
    window.__heroSearchTicking = true;
    requestAnimationFrame(() => {
      updateHeroSearchState();
      window.__heroSearchTicking = false;
    });
  }
}, { passive: true });

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
updateHeroSearchState();
if (promo.code) {
  document.getElementById("promo-code").value = promo.code;
  document.getElementById("promo-hint").textContent = "Промокод применен";
}
