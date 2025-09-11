/**
 * SERVICE WORKER - RAFAEL MUNARO ARQUITETURA
 * Progressive Web App com cache inteligente e funcionalidades offline
 */

const CACHE_NAME = 'rafael-munaro-v1.0.0';
const STATIC_CACHE = 'rafael-munaro-static-v1.0.0';
const DYNAMIC_CACHE = 'rafael-munaro-dynamic-v1.0.0';
const IMAGE_CACHE = 'rafael-munaro-images-v1.0.0';

// Recursos críticos para cache imediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/css/accessibility.css',
  '/assets/js/scripts.js',
  '/assets/js/scripts-modern-secure.js',
  '/assets/js/security-monitor.js',
  '/assets/js/form-validation.js',
  '/assets/js/structured-data.js',
  '/site.webmanifest',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/apple-touch-icon.png'
];

// Recursos externos confiáveis para cache
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
  'https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggexSvfedN5Jw.woff2'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
};

class RafaelMunaroServiceWorker {
  constructor() {
    this.cacheStrategies = CACHE_STRATEGIES;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupPeriodicTasks();
  }

  setupEventListeners() {
    // Install event
    self.addEventListener('install', (event) => {
      console.log('🔧 Service Worker: Instalando...');
      event.waitUntil(this.handleInstall());
    });

    // Activate event
    self.addEventListener('activate', (event) => {
      console.log('🚀 Service Worker: Ativando...');
      event.waitUntil(this.handleActivate());
    });

    // Fetch event
    self.addEventListener('fetch', (event) => {
      event.respondWith(this.handleFetch(event));
    });

    // Message event para comunicação com a página
    self.addEventListener('message', (event) => {
      this.handleMessage(event);
    });

    // Background sync
    self.addEventListener('sync', (event) => {
      if (event.tag === 'background-sync') {
        event.waitUntil(this.handleBackgroundSync());
      }
    });

    // Push notifications (futuro)
    self.addEventListener('push', (event) => {
      this.handlePush(event);
    });
  }

  async handleInstall() {
    try {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(STATIC_ASSETS);
      console.log('✅ Service Worker: Recursos estáticos cacheados');

      // Cache de recursos externos
      const externalCache = await caches.open('external-cache');
      await externalCache.addAll(EXTERNAL_ASSETS);
      console.log('✅ Service Worker: Recursos externos cacheados');

      // Forçar ativação imediata
      self.skipWaiting();
    } catch (error) {
      console.error('❌ Service Worker: Erro na instalação:', error);
    }
  }

  async handleActivate() {
    try {
      // Limpar caches antigos
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name =>
        name !== STATIC_CACHE &&
        name !== DYNAMIC_CACHE &&
        name !== IMAGE_CACHE &&
        name !== 'external-cache'
      );

      await Promise.all(oldCaches.map(cache => caches.delete(cache)));
      console.log('🧹 Service Worker: Caches antigos limpos');

      // Tomar controle de todas as páginas
      self.clients.claim();
    } catch (error) {
      console.error('❌ Service Worker: Erro na ativação:', error);
    }
  }

  async handleFetch(event) {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
      return fetch(request);
    }

    // Estratégia baseada no tipo de recurso
    if (this.isImageRequest(request)) {
      return this.handleImageRequest(request);
    }

    if (this.isApiRequest(request)) {
      return this.handleApiRequest(request);
    }

    if (this.isStaticAsset(request)) {
      return this.cacheFirst(request);
    }

    if (this.isExternalResource(request)) {
      return this.staleWhileRevalidate(request);
    }

    // Páginas HTML - Network First
    if (request.destination === 'document') {
      return this.networkFirst(request);
    }

    // Estratégia padrão
    return this.cacheFirst(request);
  }

  async cacheFirst(request) {
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    } catch (error) {
      console.warn('Cache First fallback:', error);
      return this.offlineFallback();
    }
  }

  async networkFirst(request) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return this.offlineFallback();
    }
  }

  async staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
  }

  async handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Atualizar cache em background
      fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse);
        }
      }).catch(() => {});

      return cachedResponse;
    }

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return this.imageFallback();
    }
  }

  async handleApiRequest(request) {
    // Para APIs, sempre tentar network first
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      // Se falhar, tentar cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  }

  async offlineFallback() {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/offline.html') || new Response(
      '<h1>Offline</h1><p>Você está offline. Tente novamente quando reconectar.</p>',
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }

  imageFallback() {
    // Retornar uma imagem placeholder ou do cache
    return caches.match('/placeholder-image.png') ||
           new Response('', { status: 404 });
  }

  // Utilitários para identificar tipos de requisição
  isImageRequest(request) {
    return request.destination === 'image' ||
           request.url.includes('.jpg') ||
           request.url.includes('.png') ||
           request.url.includes('.webp') ||
           request.url.includes('.svg');
  }

  isApiRequest(request) {
    return request.url.includes('/api/') ||
           request.url.includes('unsplash.com');
  }

  isStaticAsset(request) {
    const url = request.url;
    return url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.woff') ||
           url.includes('.woff2') ||
           STATIC_ASSETS.some(asset => url.endsWith(asset));
  }

  isExternalResource(request) {
    return request.url.includes('fonts.googleapis.com') ||
           request.url.includes('fonts.gstatic.com') ||
           request.url.includes('cdnjs.cloudflare.com');
  }

  // Background sync para formulários offline
  async handleBackgroundSync() {
    try {
      const cache = await caches.open('form-data-cache');
      const requests = await cache.keys();

      for (const request of requests) {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.error('Background sync failed:', error);
        }
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }

  // Push notifications (placeholder para futuro)
  handlePush(event) {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon-32x32.png',
      badge: '/favicon-32x32.png',
      vibrate: [200, 100, 200],
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }

  // Comunicação com a página principal
  handleMessage(event) {
    const { type, data } = event.data;

    switch (type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;

      case 'GET_CACHE_INFO':
        this.sendCacheInfo(event.source);
        break;

      case 'CLEAR_CACHE':
        this.clearAllCaches();
        break;

      case 'UPDATE_CACHE':
        this.updateCache(data.urls);
        break;

      default:
        console.log('Unknown message type:', type);
    }
  }

  async sendCacheInfo(client) {
    try {
      const cacheNames = await caches.keys();
      const cacheInfo = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = keys.length;
      }

      client.postMessage({
        type: 'CACHE_INFO',
        data: cacheInfo
      });
    } catch (error) {
      console.error('Error getting cache info:', error);
    }
  }

  async clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🧹 All caches cleared');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  async updateCache(urls) {
    try {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.addAll(urls);
      console.log('✅ Cache updated with new URLs');
    } catch (error) {
      console.error('Error updating cache:', error);
    }
  }

  setupPeriodicTasks() {
    // Limpeza automática de cache antigo a cada hora
    setInterval(async () => {
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const keys = await cache.keys();

        // Remover entradas antigas (mais de 1 dia)
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        let removedCount = 0;

        for (const request of keys) {
          // Esta é uma simplificação - em produção, você verificaria timestamps
          if (Math.random() > 0.8) { // 20% chance de limpeza por performance
            await cache.delete(request);
            removedCount++;
          }
        }

        if (removedCount > 0) {
          console.log(`🧹 Cleaned ${removedCount} old cache entries`);
        }
      } catch (error) {
        console.error('Cache cleanup error:', error);
      }
    }, 60 * 60 * 1000); // A cada hora
  }
}

// Inicializar Service Worker
new RafaelMunaroServiceWorker();

// Export para testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RafaelMunaroServiceWorker;
}
