/**
 * RAFAEL MUNARO ARQUITETURA - ACESSIBILIDADE WCAG 2.1 AA
 * Sistema completo de acessibilidade para usuários com necessidades especiais
 */

'use strict';

/**
 * Gerenciador de Acessibilidade
 */
class AccessibilityManager {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.skipLinks = [];
        this.liveRegion = null;
        this.settings = {
            highContrast: false,
            reducedMotion: false,
            largeText: false,
            screenReader: false
        };
    }

    async init() {
        this.setupSkipLinks();
        this.setupKeyboardNavigation();
        this.setupARIA();
        this.setupLiveRegion();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupColorContrast();
        this.setupMotionPreferences();
        this.setupTextResize();
        this.setupErrorHandling();
        this.loadUserPreferences();
        this.setupAccessibilityMenu();
    }

    /**
     * Configurar skip links
     */
    setupSkipLinks() {
        const skipLinks = [
            { href: '#main-content', text: 'Pular para conteúdo principal' },
            { href: '#navigation', text: 'Pular para navegação' },
            { href: '#contact-form', text: 'Pular para formulário de contato' }
        ];

        skipLinks.forEach((link, index) => {
            const skipLink = document.createElement('a');
            skipLink.href = link.href;
            skipLink.className = 'skip-link';
            skipLink.textContent = link.text;
            skipLink.setAttribute('data-skip-index', index);

            document.body.insertBefore(skipLink, document.body.firstChild);
            this.skipLinks.push(skipLink);
        });

        // Mostrar skip links apenas quando focados
        this.skipLinks.forEach(link => {
            link.addEventListener('focus', () => this.showSkipLinks());
            link.addEventListener('blur', () => this.hideSkipLinks());
        });
    }

    showSkipLinks() {
        this.skipLinks.forEach(link => {
            link.style.top = '10px';
        });
    }

    hideSkipLinks() {
        // Esconder apenas se nenhum skip link estiver focado
        const hasFocusedSkipLink = this.skipLinks.some(link =>
            link === document.activeElement
        );

        if (!hasFocusedSkipLink) {
            this.skipLinks.forEach(link => {
                link.style.top = '-40px';
            });
        }
    }

    /**
     * Configurar navegação por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Prevenir tabulação em elementos não focáveis
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.updateFocusableElements();
            }
        });
    }

    handleKeyboardNavigation(e) {
        const { key, ctrlKey, altKey, shiftKey } = e;

        // Skip links navigation
        if (key === 'Tab' && !shiftKey) {
            this.handleTabNavigation(e);
        }

        // Escape key handling
        if (key === 'Escape') {
            this.handleEscapeKey(e);
        }

        // Arrow key navigation for custom components
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            this.handleArrowNavigation(e);
        }

        // Accessibility shortcuts
        if (altKey) {
            this.handleAccessibilityShortcuts(e);
        }
    }

    handleTabNavigation(e) {
        // Implementação personalizada se necessário
        this.updateFocusableElements();
    }

    handleEscapeKey(e) {
        // Fechar modais, dropdowns, etc.
        const openElements = document.querySelectorAll('[aria-expanded="true"]');

        openElements.forEach(element => {
            this.closeElement(element);
        });

        // Fechar menus mobile
        const mobileMenu = document.querySelector('.mobile-menu--open');
        if (mobileMenu) {
            this.closeMobileMenu();
        }

        // Retornar foco para o trigger se houver
        const trigger = document.querySelector('[data-trigger-for="' + e.target.id + '"]');
        if (trigger) {
            trigger.focus();
        }
    }

    handleArrowNavigation(e) {
        const target = e.target;

        // Portfolio grid navigation
        if (target.closest('.portfolio__grid')) {
            this.navigateGrid(e, target, '.portfolio__item');
        }

        // Menu navigation
        if (target.closest('.nav__list')) {
            this.navigateList(e, target, '.nav__link');
        }
    }

    handleAccessibilityShortcuts(e) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                this.toggleHighContrast();
                break;
            case '2':
                e.preventDefault();
                this.toggleLargeText();
                break;
            case '3':
                e.preventDefault();
                this.toggleReducedMotion();
                break;
        }
    }

    navigateGrid(e, currentElement, selector) {
        const grid = currentElement.closest('.portfolio__grid');
        const items = Array.from(grid.querySelectorAll(selector));
        const currentIndex = items.indexOf(currentElement.closest(selector));

        let newIndex;

        switch (e.key) {
            case 'ArrowUp':
                newIndex = Math.max(0, currentIndex - 3);
                break;
            case 'ArrowDown':
                newIndex = Math.min(items.length - 1, currentIndex + 3);
                break;
            case 'ArrowLeft':
                newIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                newIndex = Math.min(items.length - 1, currentIndex + 1);
                break;
        }

        if (newIndex !== undefined && newIndex !== currentIndex) {
            e.preventDefault();
            items[newIndex].focus();
        }
    }

    navigateList(e, currentElement, selector) {
        const list = currentElement.closest('.nav__list, .mobile-menu');
        const items = Array.from(list.querySelectorAll(selector));
        const currentIndex = items.indexOf(currentElement);

        let newIndex;

        switch (e.key) {
            case 'ArrowUp':
                newIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowDown':
                newIndex = Math.min(items.length - 1, currentIndex + 1);
                break;
        }

        if (newIndex !== undefined && newIndex !== currentIndex) {
            e.preventDefault();
            items[newIndex].focus();
        }
    }

    /**
     * Configurar atributos ARIA
     */
    setupARIA() {
        // Adicionar labels e descrições
        this.setupFormARIA();
        this.setupImageARIA();
        this.setupButtonARIA();
        this.setupNavigationARIA();
        this.setupModalARIA();
    }

    setupFormARIA() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            // Adicionar role se necessário
            if (!form.getAttribute('role')) {
                form.setAttribute('role', 'form');
            }

            // Configurar campos obrigatórios
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                field.setAttribute('aria-required', 'true');
                field.setAttribute('aria-describedby',
                    field.getAttribute('aria-describedby') ?
                    field.getAttribute('aria-describedby') + ' required-hint' :
                    'required-hint'
                );

                // Adicionar hint de obrigatório se não existir
                if (!document.getElementById('required-hint')) {
                    const hint = document.createElement('div');
                    hint.id = 'required-hint';
                    hint.className = 'sr-only';
                    hint.textContent = 'Campo obrigatório';
                    form.appendChild(hint);
                }
            });

            // Estados de validação
            const fields = form.querySelectorAll('input, textarea, select');
            fields.forEach(field => {
                field.addEventListener('invalid', () => {
                    field.setAttribute('aria-invalid', 'true');
                });

                field.addEventListener('input', () => {
                    if (field.checkValidity()) {
                        field.setAttribute('aria-invalid', 'false');
                    }
                });
            });
        });
    }

    setupImageARIA() {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            // Verificar se tem alt
            if (!img.hasAttribute('alt') || img.alt.trim() === '') {
                console.warn('Imagem sem atributo alt:', img.src);
                img.alt = 'Imagem decorativa';
            }

            // Adicionar role para imagens decorativas
            if (img.alt === 'Imagem decorativa' || img.alt === '') {
                img.setAttribute('role', 'presentation');
            }
        });
    }

    setupButtonARIA() {
        const buttons = document.querySelectorAll('button, [role="button"]');

        buttons.forEach(button => {
            // Verificar se tem texto acessível
            const hasText = button.textContent.trim() ||
                          button.getAttribute('aria-label') ||
                          button.getAttribute('aria-labelledby');

            if (!hasText) {
                console.warn('Botão sem texto acessível:', button);
                button.setAttribute('aria-label', 'Botão');
            }

            // Estados loading
            if (button.classList.contains('btn--loading')) {
                button.setAttribute('aria-busy', 'true');
                button.setAttribute('aria-describedby',
                    button.getAttribute('aria-describedby') ?
                    button.getAttribute('aria-describedby') + ' loading-status' :
                    'loading-status'
                );
            }
        });
    }

    setupNavigationARIA() {
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Navegação principal');
        }

        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.setAttribute('role', 'menu');
            mobileMenu.setAttribute('aria-label', 'Menu mobile');
        }
    }

    setupModalARIA() {
        const modals = document.querySelectorAll('.modal');

        modals.forEach(modal => {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');

            const title = modal.querySelector('.modal__title, h1, h2, h3');
            if (title) {
                modal.setAttribute('aria-labelledby', title.id || 'modal-title');
            }

            const content = modal.querySelector('.modal__content, .modal__body');
            if (content) {
                modal.setAttribute('aria-describedby', content.id || 'modal-content');
            }
        });
    }

    /**
     * Configurar live region para anúncios dinâmicos
     */
    setupLiveRegion() {
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.id = 'live-region';

        document.body.appendChild(this.liveRegion);
    }

    /**
     * Anunciar mudanças para leitores de tela
     */
    announce(message, priority = 'polite') {
        if (!this.liveRegion) return;

        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;

        // Limpar após anúncio
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 1000);
    }

    /**
     * Suporte a leitores de tela
     */
    setupScreenReaderSupport() {
        // Detectar se é um screen reader
        this.detectScreenReader();

        // Adicionar landmarks semânticos
        this.addSemanticLandmarks();

        // Suporte a navegação por headings
        this.setupHeadingNavigation();
    }

    detectScreenReader() {
        // Detectar uso de screen reader através de eventos
        let screenReaderDetected = false;

        const detectEvents = ['keydown', 'click', 'focus', 'blur'];

        detectEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                // Se o usuário está navegando com teclado, pode estar usando screen reader
                if (eventType === 'keydown' && !screenReaderDetected) {
                    screenReaderDetected = true;
                    this.settings.screenReader = true;
                    document.documentElement.classList.add('screen-reader-active');
                    this.announce('Modo de navegação por teclado ativado');
                }
            }, { once: true });
        });
    }

    addSemanticLandmarks() {
        // Banner
        const header = document.querySelector('header');
        if (header && !header.hasAttribute('role')) {
            header.setAttribute('role', 'banner');
        }

        // Main content
        const main = document.querySelector('main');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
        }

        // Footer
        const footer = document.querySelector('footer');
        if (footer && !footer.hasAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }

        // Aside content
        const asides = document.querySelectorAll('aside');
        asides.forEach(aside => {
            if (!aside.hasAttribute('role')) {
                aside.setAttribute('role', 'complementary');
            }
        });
    }

    setupHeadingNavigation() {
        // Adicionar navegação por headings para screen readers
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }

            // Adicionar aria-level se não for heading semântico
            if (!heading.tagName.match(/^H[1-6]$/)) {
                heading.setAttribute('aria-level', heading.tagName.charAt(1));
            }
        });
    }

    /**
     * Gerenciamento de foco
     */
    setupFocusManagement() {
        // Focus trap para modais
        this.setupFocusTrap();

        // Gerenciamento de foco em navegação
        this.setupFocusNavigation();

        // Indicadores visuais de foco
        this.setupFocusIndicators();
    }

    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal--open');
                if (modal) {
                    this.trapFocusInModal(e, modal);
                }
            }
        });
    }

    trapFocusInModal(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    setupFocusNavigation() {
        // Restauração de foco após operações assíncronas
        this.setupFocusRestoration();
    }

    setupFocusRestoration() {
        let lastFocusedElement = null;

        document.addEventListener('focusin', (e) => {
            lastFocusedElement = e.target;
        });

        // Restauração após loading
        document.addEventListener('contentLoaded', () => {
            if (lastFocusedElement && lastFocusedElement.focus) {
                lastFocusedElement.focus();
            }
        });
    }

    setupFocusIndicators() {
        // Melhorar indicadores visuais de foco
        const style = document.createElement('style');
        style.textContent = `
            *:focus-visible {
                outline: 3px solid var(--color-accent);
                outline-offset: 2px;
                border-radius: var(--border-radius-sm);
            }

            .focus-ring {
                position: relative;
            }

            .focus-ring:focus-visible::after {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border: 2px solid var(--color-accent);
                border-radius: var(--border-radius-md);
                z-index: 1;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Contraste de cores
     */
    setupColorContrast() {
        // Verificar contraste automático
        this.checkColorContrast();

        // Toggle high contrast
        this.setupHighContrastToggle();
    }

    checkColorContrast() {
        // Implementar verificação de contraste WCAG
        const checkContrast = (foreground, background) => {
            // Algoritmo de luminância relativa
            const getLuminance = (color) => {
                const rgb = color.match(/\d+/g);
                const [r, g, b] = rgb.map(c => {
                    c = parseInt(c) / 255;
                    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };

            const lum1 = getLuminance(foreground);
            const lum2 = getLuminance(background);
            const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

            return {
                ratio: Math.round(ratio * 100) / 100,
                aa: ratio >= 4.5,
                aaa: ratio >= 7
            };
        };

        // Verificar elementos críticos
        const criticalElements = document.querySelectorAll('h1, h2, h3, a, button');
        criticalElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;

            if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                const contrast = checkContrast(color, backgroundColor);
                element.setAttribute('data-contrast-ratio', contrast.ratio);
                element.setAttribute('data-wcag-aa', contrast.aa);
                element.setAttribute('data-wcag-aaa', contrast.aaa);
            }
        });
    }

    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;

        document.documentElement.classList.toggle('high-contrast', this.settings.highContrast);

        this.saveUserPreferences();
        this.announce(this.settings.highContrast ?
            'Alto contraste ativado' :
            'Alto contraste desativado'
        );
    }

    setupHighContrastToggle() {
        // Adicionar estilos de alto contraste
        const highContrastStyles = `
            .high-contrast {
                --color-primary: #000000;
                --color-secondary: #000000;
                --color-accent: #000000;
                --color-neutral-900: #000000;
                --color-neutral-50: #ffffff;
            }

            .high-contrast * {
                border-color: currentColor !important;
            }

            .high-contrast a {
                text-decoration: underline !important;
            }

            .high-contrast button {
                border: 2px solid !important;
            }
        `;

        const style = document.createElement('style');
        style.textContent = highContrastStyles;
        document.head.appendChild(style);
    }

    /**
     * Preferências de movimento reduzido
     */
    setupMotionPreferences() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleReducedMotion = (e) => {
            this.settings.reducedMotion = e.matches;
            document.documentElement.classList.toggle('reduced-motion', e.matches);

            if (e.matches) {
                this.disableAnimations();
            }
        };

        prefersReducedMotion.addEventListener('change', handleReducedMotion);
        handleReducedMotion(prefersReducedMotion);
    }

    disableAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate], .animate, [class*="animate"]');

        animatedElements.forEach(element => {
            element.style.animation = 'none';
            element.style.transition = 'none';
        });
    }

    toggleReducedMotion() {
        this.settings.reducedMotion = !this.settings.reducedMotion;
        document.documentElement.classList.toggle('reduced-motion', this.settings.reducedMotion);

        if (this.settings.reducedMotion) {
            this.disableAnimations();
        }

        this.saveUserPreferences();
        this.announce(this.settings.reducedMotion ?
            'Animações desabilitadas' :
            'Animações habilitadas'
        );
    }

    /**
     * Redimensionamento de texto
     */
    setupTextResize() {
        // Detectar zoom do navegador
        const detectZoom = () => {
            const zoom = Math.round((window.devicePixelRatio || 1) * 100);
            document.documentElement.setAttribute('data-zoom-level', zoom);

            if (zoom > 150) {
                this.settings.largeText = true;
                document.documentElement.classList.add('large-text');
            } else {
                this.settings.largeText = false;
                document.documentElement.classList.remove('large-text');
            }
        };

        window.addEventListener('resize', detectZoom);
        detectZoom();
    }

    toggleLargeText() {
        this.settings.largeText = !this.settings.largeText;
        document.documentElement.classList.toggle('large-text', this.settings.largeText);

        this.saveUserPreferences();
        this.announce(this.settings.largeText ?
            'Texto grande ativado' :
            'Texto grande desativado'
        );
    }

    /**
     * Tratamento de erros de acessibilidade
     */
    setupErrorHandling() {
        // Interceptar erros de JavaScript
        window.addEventListener('error', (e) => {
            console.error('Erro de acessibilidade:', e.error);
            this.announce('Ocorreu um erro na página. Tente recarregar.', 'assertive');
        });

        // Interceptar erros de carregamento
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Erro não tratado:', e.reason);
            this.announce('Ocorreu um erro inesperado.', 'assertive');
        });
    }

    /**
     * Carregar preferências do usuário
     */
    loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('accessibility_preferences') || '{}');

            Object.assign(this.settings, preferences);

            // Aplicar preferências
            if (this.settings.highContrast) {
                document.documentElement.classList.add('high-contrast');
            }

            if (this.settings.reducedMotion) {
                document.documentElement.classList.add('reduced-motion');
            }

            if (this.settings.largeText) {
                document.documentElement.classList.add('large-text');
            }
        } catch (error) {
            console.warn('Erro ao carregar preferências de acessibilidade:', error);
        }
    }

    /**
     * Salvar preferências do usuário
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('accessibility_preferences', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Erro ao salvar preferências de acessibilidade:', error);
        }
    }

    /**
     * Menu de acessibilidade
     */
    setupAccessibilityMenu() {
        const menu = this.createAccessibilityMenu();
        document.body.appendChild(menu);

        // Toggle menu
        const toggle = menu.querySelector('.accessibility-toggle');
        toggle.addEventListener('click', () => {
            menu.classList.toggle('accessibility-menu--open');
        });
    }

    createAccessibilityMenu() {
        const menu = document.createElement('div');
        menu.className = 'accessibility-menu';
        menu.innerHTML = `
            <button class="accessibility-toggle" aria-label="Menu de acessibilidade">
                ♿
            </button>
            <div class="accessibility-panel">
                <h3>Opções de Acessibilidade</h3>
                <div class="accessibility-options">
                    <label>
                        <input type="checkbox" id="high-contrast-toggle">
                        Alto Contraste
                    </label>
                    <label>
                        <input type="checkbox" id="large-text-toggle">
                        Texto Grande
                    </label>
                    <label>
                        <input type="checkbox" id="reduced-motion-toggle">
                        Movimento Reduzido
                    </label>
                </div>
            </div>
        `;

        // Conectar toggles
        const highContrastToggle = menu.querySelector('#high-contrast-toggle');
        const largeTextToggle = menu.querySelector('#large-text-toggle');
        const reducedMotionToggle = menu.querySelector('#reduced-motion-toggle');

        highContrastToggle.checked = this.settings.highContrast;
        largeTextToggle.checked = this.settings.largeText;
        reducedMotionToggle.checked = this.settings.reducedMotion;

        highContrastToggle.addEventListener('change', () => this.toggleHighContrast());
        largeTextToggle.addEventListener('change', () => this.toggleLargeText());
        reducedMotionToggle.addEventListener('change', () => this.toggleReducedMotion());

        return menu;
    }

    /**
     * Atualizar elementos focáveis
     */
    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(element =>
            element.offsetWidth > 0 &&
            element.offsetHeight > 0 &&
            !element.disabled &&
            !element.hidden &&
            element.style.display !== 'none' &&
            element.style.visibility !== 'hidden'
        );
    }

    /**
     * Fechar elemento
     */
    closeElement(element) {
        element.setAttribute('aria-expanded', 'false');

        // Anunciar fechamento
        const label = element.getAttribute('aria-label') || element.textContent;
        this.announce(`${label} fechado`);
    }

    /**
     * Fechar menu mobile
     */
    closeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('mobile-menu--open');
            this.announce('Menu mobile fechado');
        }
    }

    /**
     * Utilitários
     */
    isFocusable(element) {
        return this.focusableElements.includes(element);
    }

    getFocusableElements() {
        this.updateFocusableElements();
        return this.focusableElements;
    }

    /**
     * API pública
     */
    getSettings() {
        return { ...this.settings };
    }

    setSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.saveUserPreferences();

            // Aplicar mudança
            switch (key) {
                case 'highContrast':
                    document.documentElement.classList.toggle('high-contrast', value);
                    break;
                case 'largeText':
                    document.documentElement.classList.toggle('large-text', value);
                    break;
                case 'reducedMotion':
                    document.documentElement.classList.toggle('reduced-motion', value);
                    break;
            }

            this.announce(`Configuração ${key} ${value ? 'ativada' : 'desativada'}`);
        }
    }

    /**
     * Teste de acessibilidade
     */
    runAccessibilityTest() {
        const results = {
            score: 0,
            issues: [],
            passed: [],
            total: 0
        };

        // Testar imagens sem alt
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');
        results.total += imagesWithoutAlt.length;
        if (imagesWithoutAlt.length > 0) {
            results.issues.push(`${imagesWithoutAlt.length} imagens sem atributo alt`);
        } else {
            results.passed.push('Todas as imagens têm atributo alt');
            results.score += 25;
        }

        // Testar botões sem label
        const buttonsWithoutLabel = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby]):empty');
        results.total += buttonsWithoutLabel.length;
        if (buttonsWithoutLabel.length > 0) {
            results.issues.push(`${buttonsWithoutLabel.length} botões sem label acessível`);
        } else {
            results.passed.push('Todos os botões têm label acessível');
            results.score += 25;
        }

        // Testar formulários
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const requiredFields = form.querySelectorAll('[required]');
            const fieldsWithAriaDescribedby = form.querySelectorAll('[required][aria-describedby]');

            if (requiredFields.length === fieldsWithAriaDescribedby.length) {
                results.passed.push('Campos obrigatórios têm descrição acessível');
                results.score += 25;
            } else {
                results.issues.push('Alguns campos obrigatórios não têm descrição acessível');
            }
        });

        // Testar estrutura de headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
        const hasProperStructure = headingLevels.every((level, index) => {
            if (index === 0) return level === 1;
            return level <= headingLevels[index - 1] + 1;
        });

        if (hasProperStructure) {
            results.passed.push('Estrutura de headings adequada');
            results.score += 25;
        } else {
            results.issues.push('Estrutura de headings inadequada');
        }

        results.score = Math.min(100, results.score);

        console.log('🧪 Teste de Acessibilidade:', results);
        return results;
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners se necessário
        this.skipLinks.forEach(link => {
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});

// Exportar para uso global
window.AccessibilityManager = AccessibilityManager;
