const SITE_VERSION = "1.58";
const APP_CACHE = `pervoe-vtoroe-app-v${SITE_VERSION}`;
const DATA_CACHE = "pervoe-vtoroe-data-v2";
const PHOTO_CACHE = "pervoe-vtoroe-photo-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=140",
  "./config.js?v=32",
  "./js/app-state.js?v=13",
  "./js/app-hero.js?v=4",
  "./js/app-ui.js?v=60",
  "./js/app-main.js?v=24",
  "./manifest.webmanifest?v=2",
  "./icons/logo.svg",
  "./icons/logo-dark.svg",
  "./icons/logo.svg?v=20260517-theme",
  "./icons/logo-dark.svg?v=20260517-theme",
  "./icons/icon%20site.svg",
  "./icons/pattern.svg",
  "./icons/Mask%20group.svg",
  "./icons/tomat.svg",
  "./icons/icon.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

function isCacheableResponse(response) {
  return Boolean(response) && (response.ok || response.type === "opaque");
}

async function putInCache(cacheName, request, response) {
  if (!isCacheableResponse(response)) return response;
  const cache = await caches.open(cacheName);
  cache.put(request, response.clone());
  return response;
}

function isCacheablePhotoResponse(response) {
  if (!response) return false;
  if (response.type === "opaque") return true;
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  return response.ok && (
    contentType.startsWith("image/") ||
    contentType.includes("application/octet-stream")
  );
}

async function putPhotoInCache(request, response) {
  if (!isCacheablePhotoResponse(response)) return response;
  const cache = await caches.open(PHOTO_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => putInCache(cacheName, request, response))
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;
  throw new Error("No cached response available.");
}

async function staleWhileRevalidatePhoto(request) {
  const cache = await caches.open(PHOTO_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => putPhotoInCache(request, response))
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;
  throw new Error("No cached response available.");
}

async function networkFirst(cacheName, request, fallbackRequest) {
  try {
    const response = await fetch(request);
    return await putInCache(cacheName, request, response);
  } catch {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackRequest) {
      const fallback = await caches.match(fallbackRequest);
      if (fallback) return fallback;
    }
    throw new Error("Network request failed.");
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => ![APP_CACHE, DATA_CACHE, PHOTO_CACHE].includes(key))
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isDriveImageRequest =
    url.hostname === "drive.google.com" ||
    url.hostname === "lh3.googleusercontent.com" ||
    url.hostname === "drive.usercontent.google.com" ||
    url.hostname === "work.fife.usercontent.google.com";

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(APP_CACHE, request, "./index.html"));
    return;
  }

  if (isDriveImageRequest) {
    event.respondWith(staleWhileRevalidatePhoto(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(APP_CACHE, request));
    return;
  }

  const isMenuCsvRequest =
    url.hostname === "docs.google.com" &&
    url.pathname.includes("/spreadsheets/") &&
    (url.searchParams.get("output") === "csv" || url.pathname.includes("/gviz/tq"));

  const isFontRequest =
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";

  if (isMenuCsvRequest) {
    event.respondWith(fetch(request));
    return;
  }

  if (isFontRequest) {
    event.respondWith(networkFirst(DATA_CACHE, request));
  }
});
