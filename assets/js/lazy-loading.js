/**
 * RAFAEL MUNARO ARQUITETURA - GERENCIADOR DE CARREGAMENTO PREGUIÇOSO
 * Sistema otimizado para carregamento de imagens e recursos
 */

'use strict';

/**
 * Gerenciador de carregamento preguiçoso
 */
class LazyLoadingManager {
    constructor() {
        this.imageObserver = null;
        this.resourceObserver = null;
        this.loadedImages = new Set();
        this.loadedResources = new Set();
        this.performanceMetrics = {
            imagesLoaded: 0,
            resourcesLoaded: 0,
            loadTime: 0
        };
    }

    async init() {
        this.setupImageObserver();
        this.setupResourceObserver();
        this.setupPerformanceMonitoring();
        this.preloadCriticalResources();
    }

    /**
     * Configurar observer para imagens
     */
    setupImageObserver() {
        const options = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, options);

        // Observar todas as imagens com data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    /**
     * Configurar observer para recursos
     */
    setupResourceObserver() {
        const options = {
            rootMargin: '100px 0px',
            threshold: 0.01
        };

        this.resourceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadResource(entry.target);
                }
            });
        }, options);

        // Observar elementos que precisam carregar recursos
        document.querySelectorAll('[data-lazy-resource]').forEach(element => {
            this.resourceObserver.observe(element);
        });
    }

    /**
     * Carregar imagem
     */
    loadImage(img) {
        if (this.loadedImages.has(img)) return;

        const startTime = performance.now();
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        const sizes = img.getAttribute('data-sizes');

        if (!src) return;

        // Configurar listeners
        const handleLoad = () => {
            const loadTime = performance.now() - startTime;

            img.classList.add('loaded');
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            img.removeAttribute('data-sizes');

            this.loadedImages.add(img);
            this.performanceMetrics.imagesLoaded++;
            this.performanceMetrics.loadTime += loadTime;

            // Anunciar carregamento para acessibilidade
            if (window.app?.accessibility) {
                window.app.accessibility.announce('Imagem carregada', 'polite');
            }

            // Log para desenvolvimento
            if (process.env.NODE_ENV === 'development') {
                console.log(`🖼️ Imagem carregada: ${src} (${loadTime.toFixed(2)}ms)`);
            }
        };

        const handleError = () => {
            console.warn(`Erro ao carregar imagem: ${src}`);
            img.classList.add('error');

            // Imagem de fallback
            if (img.hasAttribute('data-fallback')) {
                img.src = img.getAttribute('data-fallback');
            }
        };

        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleError, { once: true });

        // Carregar imagem
        img.src = src;
        if (srcset) img.srcset = srcset;
        if (sizes) img.sizes = sizes;

        // Parar de observar
        this.imageObserver.unobserve(img);
    }

    /**
     * Carregar recurso
     */
    loadResource(element) {
        if (this.loadedResources.has(element)) return;

        const resourceType = element.getAttribute('data-lazy-resource');
        const resourceUrl = element.getAttribute('data-resource-url');

        if (!resourceType || !resourceUrl) return;

        const startTime = performance.now();

        switch (resourceType) {
            case 'script':
                this.loadScript(resourceUrl, startTime);
                break;
            case 'style':
                this.loadStylesheet(resourceUrl, startTime);
                break;
            case 'iframe':
                this.loadIframe(element, resourceUrl, startTime);
                break;
            case 'video':
                this.loadVideo(element, resourceUrl, startTime);
                break;
        }

        this.loadedResources.add(element);
        this.resourceObserver.unobserve(element);
    }

    /**
     * Carregar script
     */
    loadScript(url, startTime) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;

            script.onload = () => {
                const loadTime = performance.now() - startTime;
                this.performanceMetrics.resourcesLoaded++;
                console.log(`📜 Script carregado: ${url} (${loadTime.toFixed(2)}ms)`);
                resolve();
            };

            script.onerror = () => {
                console.warn(`Erro ao carregar script: ${url}`);
                reject(new Error(`Failed to load script: ${url}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Carregar stylesheet
     */
    loadStylesheet(url, startTime) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;

            link.onload = () => {
                const loadTime = performance.now() - startTime;
                this.performanceMetrics.resourcesLoaded++;
                console.log(`🎨 Stylesheet carregado: ${url} (${loadTime.toFixed(2)}ms)`);
                resolve();
            };

            link.onerror = () => {
                console.warn(`Erro ao carregar stylesheet: ${url}`);
                reject(new Error(`Failed to load stylesheet: ${url}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Carregar iframe
     */
    loadIframe(element, url, startTime) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.loading = 'lazy';
        iframe.setAttribute('title', element.getAttribute('data-title') || 'Conteúdo incorporado');

        // Copiar atributos
        ['width', 'height', 'frameborder', 'allowfullscreen'].forEach(attr => {
            const value = element.getAttribute(attr);
            if (value) iframe.setAttribute(attr, value);
        });

        iframe.onload = () => {
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.resourcesLoaded++;
            console.log(`📺 Iframe carregado: ${url} (${loadTime.toFixed(2)}ms)`);
        };

        iframe.onerror = () => {
            console.warn(`Erro ao carregar iframe: ${url}`);
        };

        element.parentNode.replaceChild(iframe, element);
    }

    /**
     * Carregar vídeo
     */
    loadVideo(element, url, startTime) {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.preload = 'metadata';

        // Copiar atributos
        ['poster', 'width', 'height', 'autoplay', 'muted', 'loop'].forEach(attr => {
            const value = element.getAttribute(attr);
            if (value !== null) video.setAttribute(attr, value);
        });

        video.onload = () => {
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.resourcesLoaded++;
            console.log(`🎬 Vídeo carregado: ${url} (${loadTime.toFixed(2)}ms)`);
        };

        video.onerror = () => {
            console.warn(`Erro ao carregar vídeo: ${url}`);
        };

        element.parentNode.replaceChild(video, element);
    }

    /**
     * Pré-carregar recursos críticos
     */
    preloadCriticalResources() {
        // Pré-carregar imagens críticas
        const criticalImages = document.querySelectorAll('img[data-critical]');
        criticalImages.forEach(img => {
            const src = img.getAttribute('data-src') || img.src;
            if (src) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = src;
                link.as = 'image';
                document.head.appendChild(link);
            }
        });

        // Pré-carregar fonts críticas
        const criticalFonts = [
            { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap', type: 'style' }
        ];

        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font.href;
            link.as = font.type;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    /**
     * Configurar monitoramento de performance
     */
    setupPerformanceMonitoring() {
        // Monitorar Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                console.log(`📊 LCP: ${entry.startTime}ms`);
            });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitorar carregamento de recursos
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.initiatorType === 'img' || entry.initiatorType === 'css' || entry.initiatorType === 'script') {
                    console.log(`📦 ${entry.initiatorType}: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                }
            });
        }).observe({ entryTypes: ['resource'] });
    }

    /**
     * API para carregamento manual
     */
    load(selector) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            if (element.tagName === 'IMG' && element.hasAttribute('data-src')) {
                this.loadImage(element);
            } else if (element.hasAttribute('data-lazy-resource')) {
                this.loadResource(element);
            }
        });
    }

    /**
     * Obter métricas de performance
     */
    getMetrics() {
        return {
            ...this.performanceMetrics,
            averageLoadTime: this.performanceMetrics.loadTime / Math.max(this.performanceMetrics.imagesLoaded, 1)
        };
    }

    /**
     * Verificar se um elemento está carregado
     */
    isLoaded(element) {
        if (element.tagName === 'IMG') {
            return this.loadedImages.has(element);
        }

        return this.loadedResources.has(element);
    }

    /**
     * Forçar carregamento de todos os recursos
     */
    loadAll() {
        // Carregar todas as imagens
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img);
        });

        // Carregar todos os recursos
        document.querySelectorAll('[data-lazy-resource]').forEach(element => {
            this.loadResource(element);
        });
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }

        if (this.resourceObserver) {
            this.resourceObserver.disconnect();
        }

        this.loadedImages.clear();
        this.loadedResources.clear();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoadingManager = new LazyLoadingManager();
});

// Exportar para uso global
window.LazyLoadingManager = LazyLoadingManager;
