/**
 * PERFORMANCE OPTIMIZER - RAFAEL MUNARO ARQUITETURA
 * Otimizações avançadas de performance e carregamento
 */

class PerformanceOptimizer {
    constructor() {
        this.observerOptions = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };
        this.init();
    }

    init() {
        this.setupResourceHints();
        this.setupImageLazyLoading();
        this.setupFontLoading();
        this.setupCriticalResourceLoading();
        this.setupPerformanceMonitoring();
        this.setupMemoryManagement();
    }

    /**
     * CONFIGURAÇÃO DE RESOURCE HINTS AVANÇADOS
     */
    setupResourceHints() {
        // DNS prefetch para recursos externos
        const dnsPrefetchDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdnjs.cloudflare.com',
            'unpkg.com',
            'api.unsplash.com'
        ];

        dnsPrefetchDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });

        // Preconnect para recursos críticos
        const preconnectDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        preconnectDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    /**
     * LAZY LOADING AVANÇADO DE IMAGENS
     */
    setupImageLazyLoading() {
        // Intersection Observer para lazy loading
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.imageObserver.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);

            // Observar todas as imagens com lazy loading
            this.observeLazyImages();
        } else {
            // Fallback para browsers sem Intersection Observer
            this.loadAllImages();
        }

        // WebP support detection
        this.webpSupported = this.detectWebPSupport();
    }

    observeLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');

        if (src) {
            // Criar nova imagem para preload
            const preloadImg = new Image();

            preloadImg.onload = () => {
                img.src = src;
                if (srcset) img.srcset = srcset;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
                img.removeAttribute('data-srcset');

                // Trigger de evento personalizado
                img.dispatchEvent(new CustomEvent('imageLoaded', {
                    detail: { src, img }
                }));
            };

            preloadImg.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                img.classList.add('error');
            };

            preloadImg.src = src;
        }
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }

    detectWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('webp') > -1;
    }

    /**
     * OTIMIZAÇÃO DE CARREGAMENTO DE FONTES
     */
    setupFontLoading() {
        // Font loading API se disponível
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                document.documentElement.classList.add('fonts-loaded');
            });
        }

        // Font Display Optimization
        const fontCSS = `
            @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 300 800;
                font-display: swap;
                src: url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2') format('woff2');
            }
        `;

        const style = document.createElement('style');
        style.textContent = fontCSS;
        document.head.appendChild(style);
    }

    /**
     * CARREGAMENTO DE RECURSOS CRÍTICOS
     */
    setupCriticalResourceLoading() {
        // Critical CSS inlining (simulação)
        this.loadCriticalCSS();

        // Script loading optimization
        this.optimizeScriptLoading();
    }

    loadCriticalCSS() {
        // Above the fold CSS
        const criticalCSS = `
            .hero { min-height: 100vh; display: flex; align-items: center; }
            .hero__content { text-align: center; color: white; }
            .hero__title { font-size: 3rem; font-weight: 800; }
            .btn { padding: 12px 24px; background: #B66C48; color: white; border-radius: 8px; }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }

    optimizeScriptLoading() {
        // Defer non-critical scripts
        const scripts = document.querySelectorAll('script[data-defer]');
        scripts.forEach(script => {
            script.defer = true;
        });

        // Async loading para scripts não críticos
        const asyncScripts = document.querySelectorAll('script[data-async]');
        asyncScripts.forEach(script => {
            script.async = true;
        });
    }

    /**
     * MONITORAMENTO DE PERFORMANCE
     */
    setupPerformanceMonitoring() {
        // Performance Observer para LCP, FID, CLS
        if ('PerformanceObserver' in window) {
            this.setupCoreWebVitals();
            this.setupResourceTiming();
        }

        // Page load timing
        window.addEventListener('load', () => {
            this.logPerformanceMetrics();
        });

        // Navigation timing
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.logNavigationTiming();
                }, 0);
            });
        }
    }

    setupCoreWebVitals() {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    setupResourceTiming() {
        const resourceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.duration > 1000) { // Recursos que demoram mais de 1s
                    console.warn('Slow resource:', entry.name, entry.duration + 'ms');
                }
            });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
    }

    logPerformanceMetrics() {
        const perfData = performance.getEntriesByType('navigation')[0];

        console.log('Performance Metrics:', {
            'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
            'TCP Connect': perfData.connectEnd - perfData.connectStart,
            'Server Response': perfData.responseEnd - perfData.requestStart,
            'Page Load': perfData.loadEventEnd - perfData.loadEventStart,
            'DOM Ready': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart
        });
    }

    logNavigationTiming() {
        const navigation = performance.getEntriesByType('navigation')[0];

        const metrics = {
            'Redirect Time': navigation.redirectEnd - navigation.redirectStart,
            'Cache Time': navigation.domainLookupStart - navigation.fetchStart,
            'DNS Time': navigation.domainLookupEnd - navigation.domainLookupStart,
            'TCP Time': navigation.connectEnd - navigation.connectStart,
            'Server Time': navigation.responseStart - navigation.requestStart,
            'Response Time': navigation.responseEnd - navigation.responseStart,
            'Processing Time': navigation.loadEventStart - navigation.responseEnd,
            'Load Time': navigation.loadEventEnd - navigation.loadEventStart
        };

        console.table(metrics);
    }

    /**
     * GERENCIAMENTO DE MEMÓRIA
     */
    setupMemoryManagement() {
        // Limpeza periódica de event listeners
        this.setupEventCleanup();

        // Monitoramento de uso de memória
        if ('memory' in performance) {
            setInterval(() => {
                this.logMemoryUsage();
            }, 30000); // A cada 30 segundos
        }
    }

    setupEventCleanup() {
        // WeakMap para armazenar event listeners
        this.eventListeners = new WeakMap();

        // Método para adicionar listeners com cleanup automático
        window.addOptimizedEventListener = (element, event, handler, options = {}) => {
            element.addEventListener(event, handler, options);

            if (!this.eventListeners.has(element)) {
                this.eventListeners.set(element, new Map());
            }

            const listeners = this.eventListeners.get(element);
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }

            listeners.get(event).add(handler);
        };
    }

    logMemoryUsage() {
        const memInfo = performance.memory;
        console.log('Memory Usage:', {
            'Used JS Heap': Math.round(memInfo.usedJSHeapSize / 1048576) + ' MB',
            'Total JS Heap': Math.round(memInfo.totalJSHeapSize / 1048576) + ' MB',
            'Heap Limit': Math.round(memInfo.jsHeapSizeLimit / 1048576) + ' MB'
        });
    }

    /**
     * OTIMIZAÇÕES DE RUNTIME
     */
    optimizeRuntime() {
        // Debounce para resize events
        this.debounceResize();

        // Throttle para scroll events
        this.throttleScroll();

        // RequestAnimationFrame para animações
        this.setupRAF();
    }

    debounceResize() {
        let timeout;
        window.addEventListener('resize', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Resize handling logic
                console.log('Resize optimized');
            }, 250);
        }, { passive: true });
    }

    throttleScroll() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Scroll handling logic
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    setupRAF() {
        // Polyfill para requestAnimationFrame
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (callback) => {
                return setTimeout(callback, 16); // ~60fps
            };
        }
    }

    /**
     * MÉTODOS PÚBLICOS
     */
    preloadResource(url, as = 'fetch') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = as;
        document.head.appendChild(link);
    }

    prefetchResource(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    lazyLoadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;

        if (callback) {
            script.onload = callback;
        }

        document.head.appendChild(script);
    }
}

// Inicializar otimizador de performance
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    console.log('⚡ Performance Optimizer inicializado');
});

// Export para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
