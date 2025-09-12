/**
 * RAFAEL MUNARO ARQUITETURA - OTIMIZAÇÃO DE PERFORMANCE
 * Sistema avançado de cache, service worker e otimização de recursos
 */

'use strict';

/**
 * Otimizador de Performance
 */
class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.serviceWorker = null;
        this.webVitals = {};
        this.isOnline = navigator.onLine;
    }

    async init() {
        this.setupServiceWorker();
        this.setupNetworkMonitoring();
        this.setupResourceHints();
        this.setupCriticalResourceLoading();
        this.setupWebVitalsMonitoring();
        this.optimizeImages();
    }

    /**
     * Configurar Service Worker
     */
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorker = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                this.serviceWorker.addEventListener('updatefound', () => {
                    const newWorker = this.serviceWorker.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                console.log('✅ Service Worker registrado');
            } catch (error) {
                console.warn('❌ Falha ao registrar Service Worker:', error);
            }
        }
    }

    /**
     * Mostrar notificação de atualização
     */
    showUpdateNotification() {
        if (window.app?.notifications) {
            window.app.notifications.show({
                title: 'Atualização Disponível',
                message: 'Uma nova versão está disponível. Atualizar agora?',
                type: 'info',
                duration: false,
                actions: [
                    {
                        text: 'Atualizar',
                        action: () => this.updateServiceWorker()
                    },
                    {
                        text: 'Depois',
                        action: () => {}
                    }
                ]
            });
        }
    }

    /**
     * Atualizar Service Worker
     */
    async updateServiceWorker() {
        if (this.serviceWorker) {
            const registration = await navigator.serviceWorker.ready;
            await registration.update();
            window.location.reload();
        }
    }

    /**
     * Monitorar status da rede
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleNetworkChange(true);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleNetworkChange(false);
        });

        // Monitorar qualidade da conexão
        if ('connection' in navigator) {
            const connection = navigator.connection;
            connection.addEventListener('change', () => {
                this.handleConnectionChange(connection);
            });
        }
    }

    /**
     * Manipular mudança de status da rede
     */
    handleNetworkChange(isOnline) {
        const message = isOnline
            ? 'Conexão restabelecida'
            : 'Você está offline. Algumas funcionalidades podem não funcionar.';

        if (window.app?.notifications) {
            window.app.notifications.show({
                message,
                type: isOnline ? 'success' : 'warning',
                duration: 3000
            });
        }

        // Emitir evento para outros módulos
        window.dispatchEvent(new CustomEvent('network:change', {
            detail: { online: isOnline }
        }));
    }

    /**
     * Manipular mudança na qualidade da conexão
     */
    handleConnectionChange(connection) {
        const { effectiveType, downlink, rtt } = connection;

        // Ajustar estratégias baseado na qualidade da conexão
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            this.enableLowBandwidthMode();
        } else if (effectiveType === '3g') {
            this.enableMediumBandwidthMode();
        } else {
            this.enableHighBandwidthMode();
        }

        console.log(`📡 Conexão: ${effectiveType}, ${downlink} Mbps, ${rtt}ms RTT`);
    }

    /**
     * Modo baixa largura de banda
     */
    enableLowBandwidthMode() {
        document.documentElement.classList.add('low-bandwidth');

        // Desabilitar animações pesadas
        if (window.animationManager) {
            window.animationManager.disable();
        }

        // Reduzir qualidade de imagens
        this.setImageQuality('low');

        console.log('🐌 Modo baixa largura de banda ativado');
    }

    /**
     * Modo média largura de banda
     */
    enableMediumBandwidthMode() {
        document.documentElement.classList.remove('low-bandwidth');
        document.documentElement.classList.add('medium-bandwidth');

        this.setImageQuality('medium');
    }

    /**
     * Modo alta largura de banda
     */
    enableHighBandwidthMode() {
        document.documentElement.classList.remove('low-bandwidth', 'medium-bandwidth');
        this.setImageQuality('high');
    }

    /**
     * Definir qualidade das imagens
     */
    setImageQuality(quality) {
        const images = document.querySelectorAll('img[data-src]');

        images.forEach(img => {
            const baseSrc = img.getAttribute('data-src');
            if (baseSrc) {
                let qualitySrc = baseSrc;

                switch (quality) {
                    case 'low':
                        qualitySrc = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/, '_low.$1');
                        break;
                    case 'medium':
                        qualitySrc = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/, '_medium.$1');
                        break;
                    case 'high':
                        qualitySrc = baseSrc; // Original
                        break;
                }

                img.setAttribute('data-src', qualitySrc);
            }
        });
    }

    /**
     * Configurar resource hints
     */
    setupResourceHints() {
        // DNS prefetch
        const dnsPrefetch = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://images.unsplash.com',
            'https://cdnjs.cloudflare.com'
        ];

        dnsPrefetch.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = url;
            document.head.appendChild(link);
        });

        // Preconnect
        const preconnect = [
            'https://fonts.googleapis.com',
            'https://images.unsplash.com'
        ];

        preconnect.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    /**
     * Carregar recursos críticos primeiro
     */
    setupCriticalResourceLoading() {
        // Carregar CSS crítico inline (já feito no HTML)
        // Carregar JavaScript crítico
        this.loadCriticalJS();

        // Pré-carregar recursos importantes
        this.preloadCriticalResources();
    }

    /**
     * Carregar JavaScript crítico
     */
    loadCriticalJS() {
        const criticalScripts = [
            '/assets/js/app.js'
        ];

        criticalScripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            document.head.appendChild(script);
        });
    }

    /**
     * Pré-carregar recursos críticos
     */
    preloadCriticalResources() {
        const criticalResources = [
            { href: '/assets/images/Perfil Rafael Munaro.png', as: 'image' },
            { href: '/assets/css/styles.css', as: 'style' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'font') {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }

    /**
     * Monitorar Web Vitals
     */
    setupWebVitalsMonitoring() {
        // LCP - Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.webVitals.lcp = lastEntry.startTime;
            this.reportWebVital('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID - First Input Delay
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                this.webVitals.fid = entry.processingStart - entry.startTime;
                this.reportWebVital('FID', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // CLS - Cumulative Layout Shift
        new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            this.webVitals.cls = clsValue;
            this.reportWebVital('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });

        // FCP - First Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                this.webVitals.fcp = entry.startTime;
                this.reportWebVital('FCP', entry.startTime);
            });
        }).observe({ entryTypes: ['paint'] });
    }

    /**
     * Reportar Web Vital
     */
    reportWebVital(name, value) {
        const thresholds = {
            LCP: { good: 2500, poor: 4000 },
            FID: { good: 100, poor: 300 },
            CLS: { good: 0.1, poor: 0.25 },
            FCP: { good: 1800, poor: 3000 }
        };

        const threshold = thresholds[name];
        let rating = 'good';

        if (value > threshold.poor) {
            rating = 'poor';
        } else if (value > threshold.good) {
            rating = 'needs-improvement';
        }

        console.log(`📊 ${name}: ${value.toFixed(2)}ms (${rating})`);

        // Enviar para analytics se disponível
        if (window.gtag) {
            window.gtag('event', name, {
                value: Math.round(value),
                metric_rating: rating
            });
        }
    }

    /**
     * Otimizar imagens
     */
    optimizeImages() {
        // Lazy loading para imagens
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadOptimizedImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Carregar imagem otimizada
     */
    loadOptimizedImage(img) {
        const src = img.getAttribute('data-src');
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');

        // Verificar suporte a WebP
        const supportsWebP = this.checkWebPSupport();

        if (supportsWebP) {
            // Tentar WebP primeiro, fallback para original
            img.srcset = `${webpSrc} 1x, ${src} 2x`;
        } else {
            img.src = src;
        }

        img.classList.add('loading');

        img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        };

        img.onerror = () => {
            // Fallback para imagem original se WebP falhar
            if (img.src.includes('.webp')) {
                img.src = src;
            }
        };
    }

    /**
     * Verificar suporte a WebP
     */
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        return canvas.toDataURL('image/webp').indexOf('webp') > -1;
    }

    /**
     * Cache de recursos
     */
    cacheResource(key, data, ttl = 3600000) { // 1 hora por padrão
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            ttl
        };

        this.cache.set(key, cacheEntry);

        // Persistir no localStorage se suportado
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
        } catch (error) {
            console.warn('Erro ao salvar cache:', error);
        }
    }

    /**
     * Obter recurso do cache
     */
    getCachedResource(key) {
        // Verificar cache em memória
        let cacheEntry = this.cache.get(key);

        // Verificar localStorage se não estiver em memória
        if (!cacheEntry) {
            try {
                const stored = localStorage.getItem(`cache_${key}`);
                if (stored) {
                    cacheEntry = JSON.parse(stored);
                    this.cache.set(key, cacheEntry);
                }
            } catch (error) {
                console.warn('Erro ao recuperar cache:', error);
            }
        }

        // Verificar se não expirou
        if (cacheEntry && (Date.now() - cacheEntry.timestamp) < cacheEntry.ttl) {
            return cacheEntry.data;
        }

        // Remover cache expirado
        this.cache.delete(key);
        localStorage.removeItem(`cache_${key}`);

        return null;
    }

    /**
     * Limpar cache
     */
    clearCache() {
        this.cache.clear();

        // Limpar localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Obter métricas de performance
     */
    getMetrics() {
        return {
            webVitals: this.webVitals,
            cacheSize: this.cache.size,
            isOnline: this.isOnline,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }

    /**
     * API para debug
     */
    debug() {
        console.group('🚀 Performance Debug');
        console.log('Web Vitals:', this.webVitals);
        console.log('Cache size:', this.cache.size);
        console.log('Online:', this.isOnline);
        console.log('Connection:', navigator.connection);
        console.groupEnd();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// Exportar para uso global
window.PerformanceOptimizer = PerformanceOptimizer;
