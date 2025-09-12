/**
 * RAFAEL MUNARO ARQUITETURA - GERENCIADOR DE NAVEGAÇÃO
 * Sistema de navegação acessível e otimizado
 */

'use strict';

/**
 * Gerenciador de navegação principal
 */
class NavigationManager {
    constructor() {
        this.header = document.querySelector('.header');
        this.nav = document.querySelector('.nav');
        this.mobileMenuToggle = document.querySelector('.nav__toggle');
        this.mobileMenu = document.querySelector('.mobile-menu');
        this.navLinks = document.querySelectorAll('.nav__link');
        this.lastScrollTop = 0;
        this.scrollThreshold = 50;
    }

    async init() {
        this.setupScrollBehavior();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveLinkTracking();
        this.setupKeyboardNavigation();
    }

    /**
     * Configurar comportamento do scroll
     */
    setupScrollBehavior() {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Header transparente no topo
            if (scrollTop > this.scrollThreshold) {
                this.header.classList.add('header--scrolled');
                document.documentElement.style.setProperty('--header-bg-opacity', '0.95');
            } else {
                this.header.classList.remove('header--scrolled');
                document.documentElement.style.setProperty('--header-bg-opacity', '0.85');
            }

            // Esconder/mostrar header baseado na direção do scroll
            if (scrollTop > this.lastScrollTop && scrollTop > 200) {
                // Scrolling down
                this.header.classList.add('header--hidden');
            } else {
                // Scrolling up
                this.header.classList.remove('header--hidden');
            }

            this.lastScrollTop = scrollTop;
        };

        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                requestAnimationFrame(handleScroll);
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
            }, 16); // ~60fps
        }, { passive: true });
    }

    /**
     * Configurar menu mobile
     */
    setupMobileMenu() {
        if (!this.mobileMenuToggle || !this.mobileMenu) return;

        this.mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.header.contains(e.target) && this.mobileMenu.classList.contains('mobile-menu--open')) {
                this.closeMobileMenu();
            }
        });

        // Fechar menu com Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenu.classList.contains('mobile-menu--open')) {
                this.closeMobileMenu();
            }
        });

        // Fechar menu ao clicar em links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        const isOpen = this.mobileMenu.classList.contains('mobile-menu--open');

        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.mobileMenu.classList.add('mobile-menu--open');
        this.mobileMenuToggle.classList.add('nav__toggle--active');
        this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
        this.mobileMenu.setAttribute('aria-hidden', 'false');

        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';

        // Anunciar para leitores de tela
        if (window.app?.accessibility) {
            window.app.accessibility.announce('Menu de navegação aberto');
        }
    }

    closeMobileMenu() {
        this.mobileMenu.classList.remove('mobile-menu--open');
        this.mobileMenuToggle.classList.remove('nav__toggle--active');
        this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        this.mobileMenu.setAttribute('aria-hidden', 'true');

        // Restaurar scroll do body
        document.body.style.overflow = '';

        // Anunciar para leitores de tela
        if (window.app?.accessibility) {
            window.app.accessibility.announce('Menu de navegação fechado');
        }
    }

    /**
     * Configurar scroll suave
     */
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (href.startsWith('#')) {
                    e.preventDefault();
                    this.scrollToSection(href.substring(1));
                }
            });
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);

        if (section) {
            const headerHeight = this.header.offsetHeight;
            const sectionTop = section.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });

            // Atualizar URL sem reload
            history.pushState(null, null, `#${sectionId}`);

            // Anunciar navegação para leitores de tela
            if (window.app?.accessibility) {
                const sectionTitle = section.querySelector('h2')?.textContent || sectionId;
                window.app.accessibility.announce(`Navegando para ${sectionTitle}`);
            }
        }
    }

    /**
     * Rastrear link ativo baseado na posição do scroll
     */
    setupActiveLinkTracking() {
        const sections = document.querySelectorAll('section[id]');
        const navHeight = this.header.offsetHeight;

        const updateActiveLink = () => {
            const scrollPosition = window.scrollY + navHeight + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    this.setActiveLink(sectionId);
                }
            });
        };

        // Throttle updates
        let updateTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(updateActiveLink, 100);
        }, { passive: true });

        // Update inicial
        updateActiveLink();
    }

    setActiveLink(sectionId) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');

            if (href === `#${sectionId}`) {
                link.classList.add('nav__link--active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('nav__link--active');
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Configurar navegação por teclado
     */
    setupKeyboardNavigation() {
        // Navegação por teclado nos links
        this.navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                const links = Array.from(this.navLinks);
                const currentIndex = links.indexOf(link);

                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextIndex = (currentIndex + 1) % links.length;
                        links[nextIndex].focus();
                        break;

                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevIndex = currentIndex === 0 ? links.length - 1 : currentIndex - 1;
                        links[prevIndex].focus();
                        break;

                    case 'Home':
                        e.preventDefault();
                        links[0].focus();
                        break;

                    case 'End':
                        e.preventDefault();
                        links[links.length - 1].focus();
                        break;
                }
            });
        });
    }

    /**
     * API pública para controle externo
     */
    scrollTo(target) {
        if (typeof target === 'string') {
            if (target.startsWith('#')) {
                this.scrollToSection(target.substring(1));
            } else {
                this.scrollToSection(target);
            }
        } else if (target instanceof Element) {
            const headerHeight = this.header.offsetHeight;
            const targetTop = target.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        // Remove event listeners se necessário
        this.closeMobileMenu();
    }
}

// Exportar para uso global
window.NavigationManager = NavigationManager;
