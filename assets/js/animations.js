/**
 * RAFAEL MUNARO ARQUITETURA - GERENCIADOR DE ANIMAÇÕES
 * Sistema de animações otimizado com Intersection Observer
 */

'use strict';

/**
 * Gerenciador de animações
 */
class AnimationManager {
    constructor() {
        this.observer = null;
        this.animatedElements = new Set();
        this.isEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    async init() {
        if (!this.isEnabled) {
            console.log('🎨 Animações desabilitadas por preferência do usuário');
            return;
        }

        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupLoadingAnimations();
    }

    /**
     * Configurar Intersection Observer
     */
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observar elementos que precisam de animação
        this.observeElements();
    }

    /**
     * Observar elementos animáveis
     */
    observeElements() {
        // Elementos com classes de animação
        const selectors = [
            '.section__title',
            '.section__subtitle',
            '.service-card',
            '.portfolio__item',
            '.about__content',
            '.contact__content',
            '[data-animate]'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (!this.animatedElements.has(element)) {
                    this.prepareElement(element);
                    this.observer.observe(element);
                    this.animatedElements.add(element);
                }
            });
        });
    }

    /**
     * Preparar elemento para animação
     */
    prepareElement(element) {
        // Adicionar classe base de animação
        element.classList.add('animate-ready');

        // Definir animação baseada no tipo de elemento
        const animationType = this.getAnimationType(element);
        element.setAttribute('data-animation-type', animationType);

        // Estado inicial
        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(animationType);
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    }

    /**
     * Determinar tipo de animação baseado no elemento
     */
    getAnimationType(element) {
        if (element.classList.contains('section__title')) return 'fadeInUp';
        if (element.classList.contains('section__subtitle')) return 'fadeInUp';
        if (element.classList.contains('service-card')) return 'scaleIn';
        if (element.classList.contains('portfolio__item')) return 'slideUp';
        if (element.classList.contains('about__content')) return 'slideLeft';
        if (element.classList.contains('contact__content')) return 'slideRight';

        // Animação padrão
        return 'fadeIn';
    }

    /**
     * Obter transformação inicial
     */
    getInitialTransform(type) {
        const transforms = {
            fadeInUp: 'translateY(30px)',
            fadeIn: 'translateY(20px)',
            scaleIn: 'scale(0.9)',
            slideUp: 'translateY(40px)',
            slideLeft: 'translateX(-40px)',
            slideRight: 'translateX(40px)',
            slideDown: 'translateY(-40px)'
        };

        return transforms[type] || 'translateY(20px)';
    }

    /**
     * Animar elemento
     */
    animateElement(element) {
        // Forçar reflow para garantir que a transição funcione
        element.offsetHeight;

        // Aplicar animação
        element.style.opacity = '1';
        element.style.transform = 'translate(0) scale(1)';

        // Adicionar classe de animado
        element.classList.add('animate-complete');

        // Animações especiais
        this.applySpecialAnimations(element);
    }

    /**
     * Aplicar animações especiais
     */
    applySpecialAnimations(element) {
        // Animação de contador para números
        if (element.hasAttribute('data-counter')) {
            this.animateCounter(element);
        }

        // Animação de progresso
        if (element.hasAttribute('data-progress')) {
            this.animateProgress(element);
        }

        // Animação de texto typewriter
        if (element.hasAttribute('data-typewriter')) {
            this.animateTypewriter(element);
        }
    }

    /**
     * Animação de contador
     */
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-counter'));
        const duration = parseInt(element.getAttribute('data-duration')) || 2000;
        const start = parseInt(element.getAttribute('data-start')) || 0;

        let current = start;
        const increment = (target - start) / (duration / 16); // 60fps

        const animate = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Animação de progresso
     */
    animateProgress(element) {
        const targetWidth = element.getAttribute('data-progress') || '100%';
        const duration = parseInt(element.getAttribute('data-duration')) || 1500;

        element.style.width = '0%';
        element.style.transition = `width ${duration}ms ease-out`;

        requestAnimationFrame(() => {
            element.style.width = targetWidth;
        });
    }

    /**
     * Animação typewriter
     */
    animateTypewriter(element) {
        const text = element.textContent;
        const speed = parseInt(element.getAttribute('data-speed')) || 100;

        element.textContent = '';
        element.style.borderRight = '2px solid var(--color-accent)';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Piscar cursor
                setInterval(() => {
                    element.style.borderRight = element.style.borderRight === 'none'
                        ? '2px solid var(--color-accent)'
                        : 'none';
                }, 500);
            }
        };

        typeWriter();
    }

    /**
     * Configurar animações de scroll
     */
    setupScrollAnimations() {
        // Parallax effect para elementos com data-parallax
        document.querySelectorAll('[data-parallax]').forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;

            const handleScroll = () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -speed;
                element.style.transform = `translateY(${rate}px)`;
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
        });

        // Elementos que aparecem no scroll
        document.querySelectorAll('[data-scroll-reveal]').forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = parseInt(element.getAttribute('data-delay')) || 0;
                        setTimeout(() => {
                            element.classList.add('scroll-reveal--visible');
                        }, delay);
                        observer.unobserve(element);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });

            observer.observe(element);
        });
    }

    /**
     * Configurar efeitos hover
     */
    setupHoverEffects() {
        // Efeitos magnéticos
        document.querySelectorAll('[data-magnetic]').forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) / rect.width;
                const deltaY = (e.clientY - centerY) / rect.height;

                const strength = 0.3;
                element.style.transform = `translate(${deltaX * strength}rem, ${deltaY * strength}rem)`;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0, 0)';
            });
        });

        // Efeitos de brilho
        document.querySelectorAll('[data-glow]').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.boxShadow = '0 0 20px rgba(182, 108, 72, 0.5)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.boxShadow = '';
            });
        });
    }

    /**
     * Configurar animações de loading
     */
    setupLoadingAnimations() {
        // Animações de entrada para elementos carregados dinamicamente
        const handleDynamicContent = (mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Verificar se é um elemento animável
                        if (node.matches('[data-animate], .service-card, .portfolio__item')) {
                            this.prepareElement(node);
                            this.animateElement(node);
                        }

                        // Verificar filhos
                        node.querySelectorAll('[data-animate], .service-card, .portfolio__item').forEach(child => {
                            this.prepareElement(child);
                            this.animateElement(child);
                        });
                    }
                });
            });
        };

        const observer = new MutationObserver(handleDynamicContent);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * API pública para controlar animações
     */
    animate(target, type = 'fadeIn', options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;

        if (!element) return;

        const {
            delay = 0,
            duration = 600,
            easing = 'ease-out'
        } = options;

        element.style.transition = `all ${duration}ms ${easing}`;
        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(type);

        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translate(0) scale(1)';
        }, delay);
    }

    /**
     * Pausar todas as animações
     */
    pause() {
        document.documentElement.style.setProperty('--animation-play-state', 'paused');
    }

    /**
     * Retomar todas as animações
     */
    resume() {
        document.documentElement.style.setProperty('--animation-play-state', 'running');
    }

    /**
     * Desabilitar animações
     */
    disable() {
        this.isEnabled = false;
        document.documentElement.classList.add('animations-disabled');
    }

    /**
     * Habilitar animações
     */
    enable() {
        this.isEnabled = true;
        document.documentElement.classList.remove('animations-disabled');
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.animatedElements.clear();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
});

// Exportar para uso global
window.AnimationManager = AnimationManager;
