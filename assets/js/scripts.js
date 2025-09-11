document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    navMenu.addEventListener('click', (e) => {
        if (e.target === navMenu) {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const filterButtons = document.querySelectorAll('.filter__btn');
    const portfolioItems = document.querySelectorAll('.portfolio__item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('filter__btn--active'));
            button.classList.add('filter__btn--active');

            const filterValue = button.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                if (filterValue === '*' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    const contactForm = document.querySelector('.contact__form');
    // Evitar conflito: se o sistema seguro estiver ativo, ele gerencia o formulário
    if (contactForm && !window.securityManager) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const nome = formData.get('nome');
            const email = formData.get('email');
            const mensagem = formData.get('mensagem');

            if (!nome || !email || !mensagem) {
                showNotification('Por favor, preencha todos os campos.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Por favor, insira um e-mail válido.', 'error');
                return;
            }

            showNotification('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
            contactForm.reset();
        });
    }

    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
        '.portfolio__item, .process__step, .area__item, .about__content, .section__header'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

        observer.observe(el);
    });

    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('filter__btn')) {
            e.preventDefault();
            e.target.click();
        }
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    let scrollTimeout;
    
    function debounceScroll(func, delay) {
        return function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(func, delay);
        };
    }
    
    const debouncedScrollHandler = debounceScroll(() => {
    }, 10);

    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            zIndex: '10000',
            fontFamily: 'var(--font-primary)',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '300px',
            wordWrap: 'break-word',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out'
        });
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);

        notification.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }
    console.log('Rafael Munaro Arquitetura - Site carregado com sucesso! ✨');
    document.body.classList.add('loaded');

    // Lightbox básico (abre imagens do portfólio)
    (function setupLightbox(){
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        const overlay = lightbox.querySelector('.lightbox__overlay');
        const closeBtn = lightbox.querySelector('.lightbox__close');
        const imgEl = lightbox.querySelector('#lightbox-image');
        const titleEl = lightbox.querySelector('#lightbox-title');
        const descEl = lightbox.querySelector('#lightbox-description');

        let lastFocused = null;

        const open = (src, title = '', desc = '') => {
            if (!src) return;
            lastFocused = document.activeElement;
            imgEl.src = src;
            imgEl.alt = title || 'Imagem do portfólio';
            titleEl.textContent = title;
            descEl.textContent = desc;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        const close = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
            imgEl.src = '';
            if (lastFocused) lastFocused.focus();
        };

        overlay.addEventListener('click', close);
        closeBtn.addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex' && e.key === 'Escape') close();
        });

        // Delegação: itens do portfólio devem ter data-lightbox-src, data-title, data-desc
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-lightbox-src]');
            if (!trigger) return;
            e.preventDefault();
            const src = trigger.getAttribute('data-lightbox-src');
            const title = trigger.getAttribute('data-title') || '';
            const desc = trigger.getAttribute('data-desc') || '';
            open(src, title, desc);
        });
    })();
});

document.addEventListener('touchstart', function() {}, { passive: true });

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        window.dispatchEvent(new Event('optimizedResize'));
    }, 250);
}, { passive: true });
// Service worker é registrado em index.html com gerenciamento de atualização
