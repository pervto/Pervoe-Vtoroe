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
loadPendingOrder();
restorePendingOrderDraft();
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
tryShowPendingOrderConfirmation();

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
