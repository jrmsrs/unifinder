/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `unifinder-${version}`;
const ASSETS = [...build, ...files];

console.log('Service worker is running. Version:', version);

/** Instala service worker */
self.addEventListener('install', (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }
  self.skipWaiting();
  event.waitUntil(addFilesToCache());
});

/** Ativa service worker */
self.addEventListener('activate', (event) => {
  async function clearOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) {
        await caches.delete(key);
      }
    }
  }
  self.clients.claim();
  event.waitUntil(clearOldCaches());
});

/** Intercepta requisições */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    /** Tenta servir do cache */
    if (ASSETS.includes(url.pathname)) {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    /** Busca da rede e atualiza cache */
    try {
      const response = await fetch(event.request);
      const isNotExtension = url.protocol === 'http:';
      const isSuccess = response.status === 200;

      if (isNotExtension && isSuccess) {
        cache.put(event.request, response.clone());
      } else {
        console.log('Not caching response:', url.pathname, response.status);
      }
      return response;
    } catch (error) {
      if (event.request.destination === 'document') {
        const fallback = await cache.match('/offline.html');
        if (fallback) return fallback;
      }
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        console.log('Serving from cache due to fetch error:', url.pathname);
        return cachedResponse;
      }
      return new Response('Not Found', { status: 404 });
    }
  }
  event.respondWith(respond());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
