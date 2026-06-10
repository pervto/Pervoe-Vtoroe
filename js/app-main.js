document.getElementById("cart-button").addEventListener("click", openCart);
document.getElementById("to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
document.getElementById("thanks-close").addEventListener("click", hideThanksModal);
document.getElementById("thanks-modal").addEventListener("click", (e) => { if (e.target.id === "thanks-modal") hideThanksModal(); });
document.getElementById("order-confirm-close").addEventListener("click", () => dismissPendingOrderConfirmation({ reopenCart: true }));
document.getElementById("order-confirm-no").addEventListener("click", () => dismissPendingOrderConfirmation({ reopenCart: true }));
document.getElementById("order-confirm-yes").addEventListener("click", confirmPendingOrderCompletion);
document.getElementById("order-confirm-modal").addEventListener("click", (e) => {
  if (e.target.id === "order-confirm-modal") dismissPendingOrderConfirmation({ reopenCart: true });
});
document.getElementById("close-modal").addEventListener("click", closeCart);
document.getElementById("cart-modal").addEventListener("click", (e) => { if (e.target.id === "cart-modal") closeCart(); });
document.getElementById("privacy-policy-link").addEventListener("click", (e) => {
  e.preventDefault();
  openPrivacyPolicy();
});
document.getElementById("privacy-policy-close").addEventListener("click", closePrivacyPolicy);
document.getElementById("privacy-policy-modal").addEventListener("click", (e) => {
  if (e.target.id === "privacy-policy-modal") closePrivacyPolicy();
});
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

let whatsappReturnPending = false;
let whatsappPageBackgrounded = false;

function resetWhatsAppReturnState() {
  whatsappReturnPending = false;
  whatsappPageBackgrounded = false;
}

function tryShowPendingOrderConfirmation() {
  if (!hasPendingOrder()) {
    resetWhatsAppReturnState();
    return;
  }

  if (document.visibilityState === "hidden") return;
  if (whatsappReturnPending && !whatsappPageBackgrounded) return;

  promptPendingOrderConfirmation();
  whatsappReturnPending = false;
}

document.getElementById("promo-apply").addEventListener("click", applyPromoCode);
document.getElementById("promo-code").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    applyPromoCode();
  }
});
const promoBlock = document.getElementById("promo-block");
const promoCodeInput = document.getElementById("promo-code");
if (promoBlock && promoCodeInput) {
  promoBlock.addEventListener("click", (event) => {
    if (!promoBlock.classList.contains("is-expanded") && !promoBlock.classList.contains("has-hint")) {
      expandPromoBlock({ focusInput: !event.target.closest("input, button") });
    }
  });
  promoBlock.addEventListener("focusin", () => {
    isPromoExpanded = true;
    updatePromoBlockState();
  });
  promoBlock.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!promoBlock.contains(document.activeElement) && !hasPromoUiContent()) {
        isPromoExpanded = false;
      }
      updatePromoBlockState();
    }, 0);
  });
}
const utensilsMinusButton = document.getElementById("utensils-minus");
const utensilsPlusButton = document.getElementById("utensils-plus");
if (utensilsMinusButton) utensilsMinusButton.addEventListener("click", () => changeUtensilsQty(-1));
if (utensilsPlusButton) utensilsPlusButton.addEventListener("click", () => changeUtensilsQty(1));
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

const brandLogo = document.querySelector(".brand-logo");
const searchTomatoClip = document.querySelector(".search-tomato-clip");
const searchTomato = document.querySelector(".search-tomato-image");
const isSearchTomatoEnabled = document.documentElement.dataset.searchTomato !== "off";
let brandLogoLastTouchAt = 0;
let searchTomatoLastTouchAt = 0;

function pulseBrandLogo() {
  if (!brandLogo) return;
  brandLogo.classList.remove("is-pulsing");
  void brandLogo.offsetWidth;
  brandLogo.classList.add("is-pulsing");
}

if (brandLogo) {
  brandLogo.addEventListener("touchstart", () => {
    brandLogoLastTouchAt = Date.now();
    pulseBrandLogo();
  }, { passive: true });

  brandLogo.addEventListener("click", () => {
    if (Date.now() - brandLogoLastTouchAt < 500) return;
    pulseBrandLogo();
  });
}

function pulseSearchTomato() {
  if (!searchTomato) return;
  searchTomato.classList.remove("is-pulsing");
  void searchTomato.offsetWidth;
  searchTomato.classList.add("is-pulsing");
}

function blockSearchFocusFromTomato(event) {
  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === "function") {
    event.stopImmediatePropagation();
  }
  const currentSearchInput = document.getElementById("menu-search");
  if (currentSearchInput && document.activeElement === currentSearchInput) {
    currentSearchInput.blur();
  }
}

if (!isSearchTomatoEnabled && searchTomatoClip) {
  searchTomatoClip.hidden = true;
}

if (isSearchTomatoEnabled && searchTomatoClip) {
  searchTomatoClip.addEventListener("pointerdown", blockSearchFocusFromTomato);
  searchTomatoClip.addEventListener("mousedown", blockSearchFocusFromTomato);
  searchTomatoClip.addEventListener("touchstart", (event) => {
    blockSearchFocusFromTomato(event);
    searchTomatoLastTouchAt = Date.now();
    pulseSearchTomato();
  }, { passive: false });

  searchTomatoClip.addEventListener("touchend", blockSearchFocusFromTomato, { passive: false });
  searchTomatoClip.addEventListener("click", (event) => {
    blockSearchFocusFromTomato(event);
    if (Date.now() - searchTomatoLastTouchAt < 500) return;
    pulseSearchTomato();
  });
}

const searchInput = document.getElementById("menu-search");
const searchClear = document.getElementById("search-clear");
const searchWrap = document.querySelector(".search-wrap");
let searchViewportSyncTimer = null;

function isCompactSearchLayout() {
  return window.matchMedia("(max-width: 860px)").matches;
}

function clearSearchViewportSyncTimer() {
  if (!searchViewportSyncTimer) return;
  window.clearTimeout(searchViewportSyncTimer);
  searchViewportSyncTimer = null;
}

function updateSearchInputActiveState(isFocused = document.activeElement === searchInput) {
  document.body.classList.toggle("search-input-active", Boolean(isFocused) && isCompactSearchLayout());
}

function keepSearchInputVisible() {
  if (!searchInput || !searchWrap) return;
  if (document.activeElement !== searchInput || !isCompactSearchLayout()) return;

  const header = document.getElementById("site-header");
  const viewport = window.visualViewport;
  const viewportTop = viewport ? viewport.offsetTop : 0;
  const viewportHeight = viewport ? viewport.height : window.innerHeight;
  const visibleTop = viewportTop + (header ? header.getBoundingClientRect().height : 0) + 8;
  const visibleBottom = viewportTop + viewportHeight - 12;
  const rect = searchWrap.getBoundingClientRect();

  let scrollDelta = 0;
  if (rect.top < visibleTop) {
    scrollDelta = rect.top - visibleTop;
  } else if (rect.bottom > visibleBottom) {
    scrollDelta = rect.bottom - visibleBottom;
  }

  if (scrollDelta !== 0) {
    window.scrollTo({
      top: Math.max(window.scrollY + scrollDelta, 0),
      behavior: "auto"
    });
  }
}

function scheduleSearchViewportSync(delay = 0) {
  clearSearchViewportSyncTimer();
  searchViewportSyncTimer = window.setTimeout(() => {
    searchViewportSyncTimer = null;
    requestAnimationFrame(() => {
      syncStickyOffsets();
      updateSearchInputActiveState();
      keepSearchInputVisible();
    });
  }, delay);
}

function handleSearchFocusStateChange() {
  requestAnimationFrame(() => {
    const isFocused = document.activeElement === searchInput;
    updateSearchInputActiveState(isFocused);
    updateHeroSearchState();
    if (isFocused) {
      scheduleSearchViewportSync(40);
      scheduleSearchViewportSync(220);
    } else {
      clearSearchViewportSyncTimer();
    }
  });
}

if (searchInput && searchClear) {
  searchInput.addEventListener("focus", handleSearchFocusStateChange);
  searchInput.addEventListener("blur", handleSearchFocusStateChange);

  searchInput.addEventListener("input", () => {
    const preparedValue = replaceSearchSeparators(searchInput.value);
    if (preparedValue !== searchInput.value) {
      searchInput.value = preparedValue;
    }
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
  updateTomatoLayerState();
}, { passive: true });

window.addEventListener("resize", () => {
  if (!window.__stickyMetricsTicking) {
    window.__stickyMetricsTicking = true;
    requestAnimationFrame(() => {
      syncStickyOffsets();
      updateTomatoLayerState();
      if (activeDishName) syncDishModalTrack({ withTransition: false, offsetX: 0 });
      if (heroBanners.length) syncHeroBannerTrack({ withTransition: false, offsetX: 0 });
      if (document.activeElement === searchInput) {
        scheduleSearchViewportSync();
      }
      window.__stickyMetricsTicking = false;
    });
  }
}, { passive: true });

if (window.visualViewport) {
  const handleVisualViewportChange = () => {
    if (document.activeElement === searchInput) {
      scheduleSearchViewportSync();
    }
  };

  window.visualViewport.addEventListener("resize", handleVisualViewportChange, { passive: true });
  window.visualViewport.addEventListener("scroll", handleVisualViewportChange, { passive: true });
}

window.addEventListener("load", () => {
  syncStickyOffsets();
  updateTomatoLayerState();
});
window.addEventListener("keydown", (event) => {
  const dishModal = document.getElementById("dish-modal");
  const cartModal = document.getElementById("cart-modal");
  const privacyPolicyModal = document.getElementById("privacy-policy-modal");
  const orderConfirmModal = document.getElementById("order-confirm-modal");
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
  if (privacyPolicyModal && privacyPolicyModal.classList.contains("show")) {
    closePrivacyPolicy();
    return;
  }
  if (orderConfirmModal && orderConfirmModal.classList.contains("show")) {
    dismissPendingOrderConfirmation({ reopenCart: true });
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
  if (wrap && popover && popover.classList.contains("show") && !wrap.contains(event.target)) {
    closeSettingsPopover();
  }

  if (promoBlock && !promoBlock.contains(event.target) && !hasPromoUiContent()) {
    isPromoExpanded = false;
    updatePromoBlockState();
  }
});

document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!cart.length) return alert(t("alertCartEmpty"));
  if (!canSubmitOrderNow()) return alert(getOrderAvailabilityAlertText());

  const userName = document.getElementById("user-name").value.trim();
  const userPhone = document.getElementById("user-phone").value.trim();
  const userAddress = document.getElementById("user-address").value.trim();
  const orderComment = document.getElementById("order-comment").value.trim();
  if (!userName || !userPhone || !userAddress) return alert(t("alertFillRequired"));

  const message = createWhatsAppMessage(userName, userPhone, userAddress, orderComment);
  const encoded = encodeURIComponent(message);
  const whatsappNumber = cleanPhone(CONFIG.whatsappNumber);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;

  savePendingOrder(createPendingOrderSnapshot(userName, userPhone, userAddress, orderComment));
  whatsappReturnPending = true;
  whatsappPageBackgrounded = false;
  closeCart();
  window.open(whatsappUrl, "_blank");
});

window.addEventListener("pageshow", tryShowPendingOrderConfirmation);
window.addEventListener("focus", tryShowPendingOrderConfirmation);
window.addEventListener("blur", () => {
  if (whatsappReturnPending && hasPendingOrder()) {
    whatsappPageBackgrounded = true;
  }
});
document.addEventListener("visibilitychange", () => {
  if (!hasPendingOrder()) {
    resetWhatsAppReturnState();
    return;
  }

  if (document.visibilityState === "hidden") {
    whatsappPageBackgrounded = true;
    return;
  }

  tryShowPendingOrderConfirmation();
});

loadCart();
loadPromo();
loadUtensilsQty();
loadPendingOrder();
restorePendingOrderDraft();
heroBanners = getDefaultHeroBanners();
applyTheme(currentThemeMode);
applyStaticTranslations();
startWorkingHoursMonitoring();
renderHeroBannerSkeleton();
updateSettingsLanguageButtons(false);
loadMenu();
renderCart();
updateSearchClearVisibility();
syncStickyOffsets();
updateSearchInputActiveState(false);
updateHeroSearchState();
updateTomatoLayerState();
updateSiteVersionLabel();
if (promo.code) {
  document.getElementById("promo-code").value = promo.code;
}
updatePromoBlockState();
tryShowPendingOrderConfirmation();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    syncStickyOffsets();
    updateTomatoLayerState();
  });
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
