/**
 * ADVANCED ANIMATIONS - RAFAEL MUNARO ARQUITETURA
 * Sistema avançado de animações e micro-interações
 */

class AdvancedAnimations {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.isReducedMotion = this.checkReducedMotion();
        this.init();
    }

    init() {
        if (this.isReducedMotion) {
            console.log('🎭 Reduced motion detected - minimizing animations');
            return;
        }

        this.setupIntersectionObservers();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupClickEffects();
        this.setupLoadingAnimations();
        this.setupParallaxEffects();
    }

    checkReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * OBSERVADORES DE INTERSEÇÃO PARA ANIMAÇÕES
     */
    setupIntersectionObservers() {
        // Observer para animações de entrada
        this.entryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerEntryAnimation(entry.target);
                    this.entryObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observer para animações de saída
        this.exitObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    this.triggerExitAnimation(entry.target);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '0px 0px 0px 0px'
        });

        // Registrar elementos para animação
        this.registerAnimatedElements();
    }

    registerAnimatedElements() {
        // Elementos que devem animar na entrada
        const entryElements = document.querySelectorAll(
            '.section__header, .service__card, .process__step, ' +
            '.about__content, .portfolio__item, .faq__item, ' +
            '.contact__info, .footer__content'
        );

        entryElements.forEach(element => {
            this.entryObserver.observe(element);
        });

        // Elementos que devem animar na saída
        const exitElements = document.querySelectorAll('.hero, .section');
        exitElements.forEach(element => {
            this.exitObserver.observe(element);
        });
    }

    /**
     * ANIMAÇÕES DE ENTRADA
     */
    triggerEntryAnimation(element) {
        const animationType = this.getAnimationType(element);
        this.playEntryAnimation(element, animationType);
    }

    getAnimationType(element) {
        if (element.classList.contains('section__header')) return 'fadeInUp';
        if (element.classList.contains('service__card')) return 'slideInLeft';
        if (element.classList.contains('process__step')) return 'scaleIn';
        if (element.classList.contains('portfolio__item')) return 'fadeInScale';
        if (element.classList.contains('faq__item')) return 'slideInRight';
        if (element.classList.contains('about__content')) return 'fadeInUp';
        return 'fadeInUp'; // Default
    }

    playEntryAnimation(element, type) {
        if (typeof gsap === 'undefined') return;

        const timeline = gsap.timeline();

        switch (type) {
            case 'fadeInUp':
                timeline.from(element, {
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
                break;

            case 'slideInLeft':
                timeline.from(element, {
                    x: -50,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
                break;

            case 'slideInRight':
                timeline.from(element, {
                    x: 50,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
                break;

            case 'scaleIn':
                timeline.from(element, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.8,
                    ease: "back.out(1.7)"
                });
                break;

            case 'fadeInScale':
                timeline.from(element, {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out"
                });
                break;
        }

        // Animação escalonada para filhos
        const children = element.children;
        if (children.length > 1) {
            timeline.from(children, {
                y: 20,
                opacity: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.4");
        }
    }

    triggerExitAnimation(element) {
        // Animações de saída mais sutis
        if (typeof gsap === 'undefined') return;

        gsap.to(element, {
            opacity: 0.7,
            scale: 0.98,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    /**
     * ANIMAÇÕES DE SCROLL
     */
    setupScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // Animação do header no scroll
        ScrollTrigger.create({
            start: "top -80",
            end: 99999,
            toggleClass: {
                className: "scrolled",
                targets: ".header"
            }
        });

        // Animação parallax para elementos flutuantes
        gsap.utils.toArray('.floating-element').forEach((element, index) => {
            gsap.to(element, {
                y: -100,
                rotation: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });

        // Animação de reveal para seções
        gsap.utils.toArray('.section').forEach(section => {
            gsap.from(section, {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    /**
     * EFEITOS DE HOVER AVANÇADOS
     */
    setupHoverEffects() {
        // Efeitos de hover para botões
        const buttons = document.querySelectorAll('.btn, .nav__link, .filter__btn');
        buttons.forEach(button => {
            this.addMagneticEffect(button);
            this.addRippleEffect(button);
        });

        // Efeitos de hover para cards
        const cards = document.querySelectorAll('.service__card, .portfolio__item, .process__step');
        cards.forEach(card => {
            this.addCardHoverEffect(card);
        });

        // Efeitos de hover para imagens
        const images = document.querySelectorAll('.portfolio__image, .about__photo');
        images.forEach(image => {
            this.addImageHoverEffect(image);
        });
    }

    addMagneticEffect(element) {
        element.addEventListener('mousemove', (e) => {
            if (typeof gsap === 'undefined') return;

            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) / 10;
            const deltaY = (e.clientY - centerY) / 10;

            gsap.to(element, {
                x: deltaX,
                y: deltaY,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        element.addEventListener('mouseleave', () => {
            if (typeof gsap === 'undefined') return;

            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    addRippleEffect(element) {
        element.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            Object.assign(ripple.style, {
                position: 'absolute',
                top: y + 'px',
                left: x + 'px',
                width: size + 'px',
                height: size + 'px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                transform: 'scale(0)',
                transition: 'transform 0.6s, opacity 0.6s',
                pointerEvents: 'none',
                zIndex: '1'
            });

            element.style.position = 'relative';
            element.appendChild(ripple);

            // Trigger animation
            requestAnimationFrame(() => {
                ripple.style.transform = 'scale(4)';
                ripple.style.opacity = '0';
            });

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    addCardHoverEffect(card) {
        card.addEventListener('mouseenter', () => {
            if (typeof gsap === 'undefined') return;

            gsap.to(card, {
                y: -10,
                rotationY: 5,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            if (typeof gsap === 'undefined') return;

            gsap.to(card, {
                y: 0,
                rotationY: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    addImageHoverEffect(image) {
        image.addEventListener('mouseenter', () => {
            if (typeof gsap === 'undefined') return;

            gsap.to(image, {
                scale: 1.05,
                duration: 0.4,
                ease: "power2.out"
            });
        });

        image.addEventListener('mouseleave', () => {
            if (typeof gsap === 'undefined') return;

            gsap.to(image, {
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    }

    /**
     * EFEITOS DE CLICK
     */
    setupClickEffects() {
        // Efeitos de click para todos os elementos interativos
        const interactiveElements = document.querySelectorAll(
            'button, a, input[type="submit"], .btn, [role="button"]'
        );

        interactiveElements.forEach(element => {
            element.addEventListener('click', () => {
                this.playClickEffect(element);
            });
        });
    }

    playClickEffect(element) {
        if (typeof gsap === 'undefined') return;

        // Animação de scale
        gsap.to(element, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });

        // Animação de brilho
        if (element.classList.contains('btn--primary')) {
            gsap.to(element, {
                boxShadow: '0 0 20px rgba(182, 108, 72, 0.4)',
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        }
    }

    /**
     * ANIMAÇÕES DE LOADING
     */
    setupLoadingAnimations() {
        // Animação de loading para botões
        const loadingButtons = document.querySelectorAll('.btn--loading');
        loadingButtons.forEach(button => {
            this.animateLoadingButton(button);
        });

        // Animação de skeleton loading
        this.setupSkeletonLoading();
    }

    animateLoadingButton(button) {
        if (typeof gsap === 'undefined') return;

        const originalText = button.textContent;
        button.innerHTML = `
            <span class="loading-spinner" style="
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 8px;
            "></span>
            Carregando...
        `;

        return () => {
            button.innerHTML = originalText;
        };
    }

    setupSkeletonLoading() {
        // Adicionar estilos de skeleton loading
        const style = document.createElement('style');
        style.textContent = `
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
            }

            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * EFEITOS DE PARALLAX
     */
    setupParallaxEffects() {
        if (this.isReducedMotion) return;

        // Parallax para background da hero
        const heroBg = document.querySelector('.hero__bg');
        if (heroBg) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroBg.style.transform = `translateY(${rate}px)`;
            });
        }

        // Parallax para elementos flutuantes
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.1;
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * speed;
                element.style.transform = `translateY(${rate}px) rotate(${scrolled * 0.01}deg)`;
            });
        });
    }

    /**
     * ANIMAÇÕES DE TEXTO
     */
    setupTextAnimations() {
        // Animação de typewriter para títulos
        const typewriterElements = document.querySelectorAll('.typewriter-text');
        typewriterElements.forEach(element => {
            this.animateTypewriter(element);
        });

        // Animação de texto que revela palavra por palavra
        const revealElements = document.querySelectorAll('.text-reveal');
        revealElements.forEach(element => {
            this.animateTextReveal(element);
        });
    }

    animateTypewriter(element) {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid var(--rm-rust)';

        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 500);
            }
        }, 50);
    }

    animateTextReveal(element) {
        if (typeof gsap === 'undefined') return;

        const words = element.textContent.split(' ');
        element.innerHTML = words.map(word =>
            `<span class="word" style="display: inline-block; opacity: 0;">${word}</span>`
        ).join(' ');

        gsap.to('.word', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
        });
    }

    /**
     * MICRO-INTERAÇÕES AVANÇADAS
     */
    setupMicroInteractions() {
        // Feedback visual para inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.addInputFeedback(input);
        });

        // Animações de sucesso/erro
        this.setupStatusAnimations();

        // Animações de notificação
        this.setupNotificationAnimations();
    }

    addInputFeedback(input) {
        input.addEventListener('focus', () => {
            if (typeof gsap === 'undefined') return;

            gsap.to(input, {
                borderColor: 'var(--rm-rust)',
                boxShadow: '0 0 0 3px rgba(182, 108, 72, 0.1)',
                duration: 0.3,
                ease: "power2.out"
            });
        });

        input.addEventListener('blur', () => {
            if (typeof gsap === 'undefined') return;

            gsap.to(input, {
                borderColor: '#e5e7eb',
                boxShadow: 'none',
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    setupStatusAnimations() {
        // Animações para estados de sucesso
        const successElements = document.querySelectorAll('.success');
        successElements.forEach(element => {
            if (typeof gsap === 'undefined') return;

            gsap.from(element, {
                scale: 0,
                rotation: -180,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        });

        // Animações para estados de erro
        const errorElements = document.querySelectorAll('.error');
        errorElements.forEach(element => {
            if (typeof gsap === 'undefined') return;

            gsap.from(element, {
                x: -20,
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    setupNotificationAnimations() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            if (typeof gsap === 'undefined') return;

            gsap.from(notification, {
                x: 100,
                opacity: 0,
                duration: 0.5,
                ease: "power3.out"
            });

            // Auto-remover com animação
            setTimeout(() => {
                gsap.to(notification, {
                    x: 100,
                    opacity: 0,
                    duration: 0.5,
                    ease: "power3.in",
                    onComplete: () => notification.remove()
                });
            }, 5000);
        });
    }

    /**
     * CONTROLE DE PERFORMANCE
     */
    setupPerformanceControls() {
        // Pausar animações em baixa performance
        this.performanceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const avgFPS = entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length;

            if (avgFPS < 30) {
                this.reduceAnimations();
            }
        });

        if ('PerformanceObserver' in window) {
            this.performanceObserver.observe({ entryTypes: ['measure'] });
        }
    }

    reduceAnimations() {
        console.log('🎭 Reducing animations for better performance');
        document.documentElement.style.setProperty('--transition-base', '0.1s');
        document.documentElement.style.setProperty('--transition-fast', '0.05s');
    }

    /**
     * MÉTODOS PÚBLICOS
     */
    pauseAnimations() {
        this.animations.forEach(animation => animation.pause());
    }

    resumeAnimations() {
        this.animations.forEach(animation => animation.resume());
    }

    destroy() {
        this.pauseAnimations();
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animations.clear();
    }
}

// Inicializar animações avançadas
document.addEventListener('DOMContentLoaded', () => {
    window.advancedAnimations = new AdvancedAnimations();
    console.log('🎨 Advanced Animations initialized');
});

// Export para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAnimations;
}
