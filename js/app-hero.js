function splitHeroBannerCopy(source) {
  const rawText = String(source || "").trim().replace(/\s+/g, " ");
  if (!rawText) return { title: "", body: "" };

  const separators = [" || ", " | ", " вЂ” ", " - ", ": "];
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

function isHeroBannerImageSource(value) {
  const source = String(value || "").trim();
  if (!source) return false;
  if (!/^https?:\/\//i.test(source)) return false;

  if (/drive\.google\.com/i.test(source)) return true;
  if (/\.(png|jpe?g|webp|gif|avif|svg)(?:[?#].*)?$/i.test(source)) return true;

  try {
    const url = new URL(source);
    const pathname = url.pathname.toLowerCase();
    if (/\.(png|jpe?g|webp|gif|avif|svg)$/.test(pathname)) return true;
  } catch {}

  return false;
}

function createHeroBanner(rawValue, index) {
  const value = String(rawValue || "").trim();
  if (!value) return null;
  const bannerKey = encodeURIComponent(value.toLowerCase()).replace(/%/g, "").slice(0, 72) || String(index);

  if (isHeroBannerImageSource(value)) {
    return {
      id: `hero-banner-image-${bannerKey}-${index}`,
      type: "image",
      raw: value,
      imageUrl: normalizePhotoUrl(value)
    };
  }

  const normalized = value.toLowerCase().replace(/\s+/g, " ");
  if (
    normalized.includes("РєР°Рє СЃРєР°С‡Р°С‚СЊ РїСЂРёР»РѕР¶РµРЅРёРµ РЅР° ios") ||
    normalized.includes("РєР°Рє СЃРєР°С‡Р°С‚СЊ РїСЂРёР»РѕР¶РµРЅРёРµ РЅР° iphone") ||
    normalized.includes("СЃРєР°С‡Р°С‚СЊ РїСЂРёР»РѕР¶РµРЅРёРµ РЅР° ios") ||
    normalized.includes("СЃРєР°С‡Р°С‚СЊ РїСЂРёР»РѕР¶РµРЅРёРµ РЅР° iphone")
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
  if (banner.type === "image") return `image::${banner.imageUrl || banner.raw || ""}`;
  return `${banner.type || "text"}::${banner.title || ""}::${banner.body || ""}`;
}

function getDefaultHeroBanners() {
  return [];
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

  if (banner.type === "image") {
    return {
      ...banner,
      displayTitle: ""
    };
  }

  if (banner.type === "classic") {
    return {
      ...banner,
      displayKicker: t("heroBannerClassicKicker"),
      displayTitle: t("heroBannerClassicTitle"),
      displayBody: t("heroBannerClassicSubtitle"),
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

function buildHeroBannerStepIconMarkup(iconName) {
  const icons = {
    language: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm6.93 9h-3.1a15.727 15.727 0 0 0-1.37-5.02A8.018 8.018 0 0 1 18.93 11ZM12 4.04c.83 1.12 1.82 3.54 2.06 6.96H9.94C10.18 7.58 11.17 5.16 12 4.04ZM4.07 13h3.1a15.727 15.727 0 0 0 1.37 5.02A8.018 8.018 0 0 1 4.07 13Zm3.1-2h-3.1a8.018 8.018 0 0 1 4.47-5.02A15.727 15.727 0 0 0 7.17 11Zm4.83 8.96c-.83-1.12-1.82-3.54-2.06-6.96h4.12C13.82 16.42 12.83 18.84 12 19.96ZM14.46 18.02A15.727 15.727 0 0 0 15.83 13h3.1a8.018 8.018 0 0 1-4.47 5.02Z"/></svg>',
    ios_share: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3a1 1 0 0 1 1 1v7.59l2.3-2.29a1 1 0 1 1 1.4 1.41l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.41L11 11.59V4a1 1 0 0 1 1-1Zm-6 9a1 1 0 0 1 1 1v5h10v-5a1 1 0 1 1 2 0v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5a1 1 0 0 1 1-1Z"/></svg>',
    add_box: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7Zm5 4a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 0 1 1-1Z"/></svg>'
  };

  return icons[iconName] || icons.add_box;
}

function buildHeroBannerSkeletonHtml() {
  return `<article class="hero-banner-slide hero-banner-slide--skeleton" aria-hidden="true">
    <div class="hero-banner hero-banner--skeleton">
      <div class="hero-banner-skeleton-media"></div>
      <div class="hero-banner-skeleton-copy">
        <span class="hero-banner-skeleton-pill"></span>
        <span class="hero-banner-skeleton-line hero-banner-skeleton-line--title"></span>
        <span class="hero-banner-skeleton-line"></span>
        <span class="hero-banner-skeleton-line hero-banner-skeleton-line--short"></span>
      </div>
    </div>
  </article>`;
}

function renderHeroBannerSkeleton() {
  const heroBand = document.getElementById("hero-band");
  const hero = document.getElementById("hero");
  const carousel = document.getElementById("hero-banner-carousel");
  const track = document.getElementById("hero-banner-track");
  const dots = document.getElementById("hero-banner-dots");
  if (!heroBand || !hero || !carousel || !track || !dots) return;

  heroBand.hidden = false;
  heroBand.classList.remove("is-hidden");
  hero.classList.remove("hero--image-mode");
  carousel.classList.remove("is-desktop-lane");
  carousel.dataset.loading = "true";

  track.innerHTML = Array.from({ length: 4 }, () => buildHeroBannerSkeletonHtml()).join("");
  dots.classList.remove("is-hidden");
  dots.classList.add("is-skeleton");
  dots.innerHTML = Array.from({ length: 3 }, (_, index) => (
    `<span class="hero-banner-skeleton-dot${index === 0 ? " is-active" : ""}" aria-hidden="true"></span>`
  )).join("");
}

function buildHeroBannerHtml(banner, index) {
  const displayBanner = getDisplayHeroBanner(banner) || banner;

  if (banner.type === "image") {
    return `<article class="hero-banner-slide hero-banner-slide--image" aria-roledescription="slide" aria-label="${escapeHtml(`${index + 1}`)}">
      <div class="hero-banner hero-banner--image">
        <img class="hero-banner-image" src="${escapeHtml(displayBanner.imageUrl || banner.raw)}" alt="" loading="lazy" decoding="async" draggable="false" />
      </div>
    </article>`;
  }

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
      </div>
    </article>`;
  }

  if (banner.type === "ios-install") {
    return `<article class="hero-banner-slide" aria-roledescription="slide" aria-label="${escapeHtml(`${index + 1}`)}">
      <div class="hero-banner hero-banner--ios">
        <div class="hero-banner-content">
          <p class="hero-banner-kicker">${escapeHtml(displayBanner.displayKicker)}</p>
          <h2 class="hero-banner-title">${escapeHtml(displayBanner.displayTitle)}</h2>
          <p class="hero-banner-text">${escapeHtml(displayBanner.displayBody)}</p>
          <div class="hero-banner-steps">
            ${displayBanner.steps.map((step) => `<div class="hero-banner-step"><span class="hero-banner-step-icon" aria-hidden="true">${buildHeroBannerStepIconMarkup(step.icon)}</span><span class="hero-banner-step-text">${escapeHtml(step.text)}</span></div>`).join("")}
          </div>
          <p class="hero-banner-note">${escapeHtml(displayBanner.displayNote)}</p>
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

function syncHeroBannerFrameState() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const activeBanner = heroBanners[activeHeroBanner] || null;
  hero.classList.toggle("hero--image-mode", Boolean(activeBanner && activeBanner.type === "image"));
}

function syncHeroBannerTrack(options = {}) {
  const carousel = document.getElementById("hero-banner-carousel");
  const track = document.getElementById("hero-banner-track");
  if (!carousel || !track) return;

  if (isDesktopHeroBannerLane()) {
    track.style.transition = "none";
    track.style.transform = "none";
    return;
  }

  const width = carousel.clientWidth || 1;
  const offsetX = Number(options.offsetX || 0);
  const withTransition = options.withTransition !== false;

  track.style.transition = withTransition ? HERO_CAROUSEL_TRANSITION : "none";
  track.style.transform = `translateX(${(-activeHeroBanner * width) + offsetX}px)`;
}

function updateHeroBannerCarousel() {
  const carousel = document.getElementById("hero-banner-carousel");
  const track = document.getElementById("hero-banner-track");
  const dots = document.getElementById("hero-banner-dots");
  if (!carousel || !track || !dots || !heroBanners.length) return;

  activeHeroBanner = ((activeHeroBanner % heroBanners.length) + heroBanners.length) % heroBanners.length;
  syncHeroBannerFrameState();
  const isDesktopLane = isDesktopHeroBannerLane();
  carousel.classList.toggle("is-desktop-lane", isDesktopLane);
  dots.classList.toggle("is-hidden", isDesktopLane || heroBanners.length <= 1);

  if (isDesktopLane) {
    activeHeroPointerId = null;
    activeHeroDragStartX = 0;
    activeHeroDragOffsetX = 0;
    activeHeroIsDragging = false;
    track.style.transition = "none";
    track.style.transform = "none";
    return;
  }

  syncHeroBannerTrack({
    withTransition: !activeHeroIsDragging,
    offsetX: activeHeroIsDragging ? activeHeroDragOffsetX : 0
  });

  dots.querySelectorAll("[data-hero-slide-index]").forEach((button, index) => {
    const isActive = index === activeHeroBanner;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", String(isActive));
  });

}

function renderHeroBanners() {
  const heroBand = document.getElementById("hero-band");
  const carousel = document.getElementById("hero-banner-carousel");
  const track = document.getElementById("hero-banner-track");
  const dots = document.getElementById("hero-banner-dots");
  if (!carousel || !track || !dots) return;

  const banners = heroBanners.length ? heroBanners : getDefaultHeroBanners();
  if (heroBand) heroBand.hidden = banners.length === 0;
  if (!banners.length) {
    heroBanners = [];
    activeHeroBanner = 0;
    carousel.dataset.loading = "false";
    dots.classList.remove("is-skeleton");
    syncHeroBannerFrameState();
    track.innerHTML = "";
    dots.innerHTML = "";
    return;
  }
  heroBanners = banners;
  activeHeroBanner = Math.min(Math.max(activeHeroBanner, 0), banners.length - 1);

  carousel.setAttribute("aria-label", t("heroBannerCarouselAria"));
  carousel.dataset.loading = "false";
  track.innerHTML = banners.map((banner, index) => buildHeroBannerHtml(banner, index)).join("");
  dots.classList.remove("is-skeleton");
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
    if (isDesktopHeroBannerLane()) return;
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

