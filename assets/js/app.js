/**
 * RAFAEL MUNARO ARQUITETURA - APLICATIVO PRINCIPAL
 * Sistema modular e otimizado para performance
 */

'use strict';

/**
 * Classe principal da aplicação
 * Gerencia inicialização e coordenação de módulos
 */
class RafaelMunaroApp {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
        this.init();
    }

    /**
     * Inicialização da aplicação
     */
    async init() {
        try {
            console.log('🚀 Inicializando Rafael Munaro Arquitetura...');

            // Inicializar módulos essenciais
            await this.initCore();
            await this.initModules();

            // Marcar como inicializado
            this.initialized = true;
            console.log('✅ Aplicação inicializada com sucesso!');

            // Disparar evento de inicialização completa
            this.emit('app:ready');

        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.handleError(error);
        }
    }

    /**
     * Inicializar módulos core
     */
    async initCore() {
        // Performance monitoring
        if ('performance' in window) {
            this.performance = new PerformanceMonitor();
        }

        // Accessibility manager
        this.accessibility = new AccessibilityManager();

        // Theme manager
        this.theme = new ThemeManager();

        // Notification system
        this.notifications = new NotificationManager();
    }

    /**
     * Inicializar módulos específicos
     */
    async initModules() {
        const modules = [
            { name: 'navigation', Module: NavigationManager },
            { name: 'portfolio', Module: PortfolioManager },
            { name: 'contact', Module: ContactManager },
            { name: 'animations', Module: AnimationManager },
            { name: 'lazyLoading', Module: LazyLoadingManager }
        ];

        // Carregar módulos assincronamente
        const modulePromises = modules.map(async ({ name, Module }) => {
            try {
                const instance = new Module();
                await instance.init();
                this.modules.set(name, instance);
                console.log(`📦 Módulo ${name} carregado`);
            } catch (error) {
                console.warn(`⚠️ Erro ao carregar módulo ${name}:`, error);
            }
        });

        await Promise.allSettled(modulePromises);
    }

    /**
     * Sistema de eventos da aplicação
     */
    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: { app: this, ...data }
        });
        document.dispatchEvent(event);
    }

    on(eventName, callback) {
        document.addEventListener(eventName, callback);
    }

    off(eventName, callback) {
        document.removeEventListener(eventName, callback);
    }

    /**
     * Registrar módulo
     */
    registerModule(name, module) {
        this.modules.set(name, module);
    }

    /**
     * Obter módulo
     */
    getModule(name) {
        return this.modules.get(name);
    }

    /**
     * Tratamento de erros
     */
    handleError(error) {
        console.error('Erro na aplicação:', error);

        // Notificar usuário se for erro crítico
        if (this.notifications) {
            this.notifications.show({
                type: 'error',
                title: 'Erro na aplicação',
                message: 'Ocorreu um erro inesperado. Recarregue a página.'
            });
        }
    }

    /**
     * Cleanup da aplicação
     */
    destroy() {
        // Destruir todos os módulos
        this.modules.forEach(module => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        this.modules.clear();
        this.initialized = false;
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.init();
    }

    init() {
        // Monitorar Core Web Vitals
        this.monitorCoreWebVitals();

        // Monitorar carregamento de recursos
        this.monitorResourceLoading();

        // Monitorar interações do usuário
        this.monitorInteractions();
    }

    monitorCoreWebVitals() {
        // LCP - Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.recordMetric('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID - First Input Delay
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                this.recordMetric('FID', entry.processingStart - entry.startTime);
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
            this.recordMetric('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    monitorResourceLoading() {
        // Monitorar carregamento de imagens
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                this.recordMetric('image_loaded', performance.now());
            });

            img.addEventListener('error', () => {
                console.warn('Erro ao carregar imagem:', img.src);
            });
        });
    }

    monitorInteractions() {
        // Monitorar cliques
        document.addEventListener('click', (e) => {
            this.recordInteraction('click', e.target);
        });

        // Monitorar scrolls
        let scrollTimeout;
        document.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                this.recordInteraction('scroll_start');
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.recordInteraction('scroll_end');
                scrollTimeout = null;
            }, 150);
        });
    }

    recordMetric(name, value) {
        this.metrics.set(name, {
            value,
            timestamp: Date.now()
        });

        // Log para desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 ${name}: ${value}`);
        }
    }

    recordInteraction(type, target = null) {
        const interaction = {
            type,
            timestamp: Date.now(),
            target: target ? target.tagName + (target.className ? '.' + target.className : '') : null
        };

        // Armazenar para análise
        const interactions = JSON.parse(localStorage.getItem('user_interactions') || '[]');
        interactions.push(interaction);

        // Manter apenas últimas 100 interações
        if (interactions.length > 100) {
            interactions.shift();
        }

        localStorage.setItem('user_interactions', JSON.stringify(interactions));
    }

    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
}

/**
 * Accessibility Manager
 */
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupReducedMotion();
        this.setupHighContrast();
    }

    setupKeyboardNavigation() {
        // Skip links
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    skipLink.style.top = e.shiftKey ? '-40px' : '6px';
                }
            });
        }

        // Focus management
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Fechar modais, dropdowns, etc.
                this.closeOverlays();
            }
        });
    }

    setupScreenReaderSupport() {
        // Anunciar mudanças dinâmicas
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        document.body.appendChild(this.liveRegion);
    }

    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleReducedMotion = (e) => {
            document.documentElement.classList.toggle('reduced-motion', e.matches);
        };

        prefersReducedMotion.addEventListener('change', handleReducedMotion);
        handleReducedMotion(prefersReducedMotion);
    }

    setupHighContrast() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');

        const handleHighContrast = (e) => {
            document.documentElement.classList.toggle('high-contrast', e.matches);
        };

        prefersHighContrast.addEventListener('change', handleHighContrast);
        handleHighContrast(prefersHighContrast);
    }

    announce(message, priority = 'polite') {
        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;

        // Limpar após anúncio
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 1000);
    }

    closeOverlays() {
        // Fechar modais
        const modals = document.querySelectorAll('.modal--open');
        modals.forEach(modal => {
            modal.classList.remove('modal--open');
        });

        // Fechar dropdowns
        const dropdowns = document.querySelectorAll('.dropdown--open');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('dropdown--open');
        });
    }
}

/**
 * Theme Manager
 */
class ThemeManager {
    constructor() {
        this.currentTheme = this.getSavedTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
        this.setupSystemThemeListener();
    }

    getSavedTheme() {
        return localStorage.getItem('theme');
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);

        // Anunciar mudança para leitores de tela
        const accessibility = window.app?.accessibility;
        if (accessibility) {
            accessibility.announce(`Tema ${theme === 'dark' ? 'escuro' : 'claro'} aplicado`);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupThemeToggle() {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (e) => {
            // Só mudar se não há tema salvo
            if (!this.getSavedTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

/**
 * Notification Manager
 */
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
        this.notifications = new Map();
        this.init();
    }

    init() {
        document.body.appendChild(this.container);
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        return container;
    }

    show(options) {
        const id = Date.now().toString();
        const notification = this.createNotification(id, options);
        this.notifications.set(id, notification);

        this.container.appendChild(notification.element);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.element.classList.add('notification--visible');
        });

        // Auto-remover
        if (options.duration !== false) {
            setTimeout(() => {
                this.remove(id);
            }, options.duration || 5000);
        }

        return id;
    }

    createNotification(id, options) {
        const element = document.createElement('div');
        element.className = `notification notification--${options.type || 'info'}`;
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'assertive');

        element.innerHTML = `
            <div class="notification__content">
                ${options.title ? `<div class="notification__title">${options.title}</div>` : ''}
                <div class="notification__message">${options.message}</div>
            </div>
            <button class="notification__close" aria-label="Fechar notificação">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        const closeBtn = element.querySelector('.notification__close');
        closeBtn.addEventListener('click', () => this.remove(id));

        return {
            element,
            options,
            created: Date.now()
        };
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.element.classList.remove('notification--visible');

            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RafaelMunaroApp();
});

// Exportar para uso global
window.RafaelMunaroApp = RafaelMunaroApp;
