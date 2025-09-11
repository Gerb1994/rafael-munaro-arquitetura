/**
 * RAFAEL MUNARO ARQUITETURA - SCRIPTS
 * Funcionalidades interativas minimalistas
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // NAVEGAÇÃO MÓVEL
    // ============================================
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');

    // Abrir menu mobile
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Fechar menu mobile
    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Fechar menu ao clicar em link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Fechar menu ao clicar fora
    navMenu.addEventListener('click', (e) => {
        if (e.target === navMenu) {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ============================================
    // FILTROS DO PORTFÓLIO
    // ============================================
    const filterButtons = document.querySelectorAll('.filter__btn');
    const portfolioItems = document.querySelectorAll('.portfolio__item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('filter__btn--active'));
            // Adiciona active ao botão clicado
            button.classList.add('filter__btn--active');
            
            const filterValue = button.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                if (filterValue === '*' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Animação de entrada
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

    // ============================================
    // FORMULÁRIO DE CONTATO
    // ============================================
    const contactForm = document.querySelector('.contact__form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Pega os dados do formulário
            const formData = new FormData(contactForm);
            const nome = formData.get('nome');
            const email = formData.get('email');
            const mensagem = formData.get('mensagem');
            
            // Validação básica
            if (!nome || !email || !mensagem) {
                showNotification('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Por favor, insira um e-mail válido.', 'error');
                return;
            }
            
            // Simula envio (aqui você integraria com seu backend)
            showNotification('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
            contactForm.reset();
        });
    }

    // ============================================
    // SMOOTH SCROLL PARA LINKS INTERNOS
    // ============================================
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80; // Altura do header
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // OBSERVADOR DE INTERSEÇÃO PARA ANIMAÇÕES
    // ============================================
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

    // Observa elementos que devem animar na entrada
    const animatedElements = document.querySelectorAll(
        '.portfolio__item, .process__step, .area__item, .about__content, .section__header'
    );
    
    animatedElements.forEach(el => {
        // Define estado inicial
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        
        observer.observe(el);
    });

    // ============================================
    // LOADING DE IMAGENS LAZY
    // ============================================
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

    // ============================================
    // NAVEGAÇÃO POR TECLADO MELHORADA
    // ============================================
    document.addEventListener('keydown', function(e) {
        // ESC para fechar menu mobile
        if (e.key === 'Escape') {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Enter/Space para botões de filtro
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('filter__btn')) {
            e.preventDefault();
            e.target.click();
        }
    });

    // ============================================
    // DETECÇÃO DE PREFERÊNCIAS DO USUÁRIO
    // ============================================
    // Respeita preferência de movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Remove animações para usuários que preferem movimento reduzido
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

    // ============================================
    // PERFORMANCE - DEBOUNCE PARA SCROLL
    // ============================================
    let scrollTimeout;
    
    function debounceScroll(func, delay) {
        return function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(func, delay);
        };
    }
    
    const debouncedScrollHandler = debounceScroll(() => {
        // Adicione handlers de scroll adicionais aqui se necessário
    }, 10);
    
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

    // ============================================
    // FUNÇÕES UTILITÁRIAS
    // ============================================
    
    /**
     * Valida formato de e-mail
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Exibe notificações para o usuário
     */
    function showNotification(message, type = 'info') {
        // Remove notificação existente se houver
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Cria nova notificação
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        // Estilos inline para a notificação
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
        
        // Animação de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
        // Permite fechar clicando
        notification.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }

    // ============================================
    // INICIALIZAÇÃO FINAL
    // ============================================
    console.log('Rafael Munaro Arquitetura - Site carregado com sucesso! ✨');
    
    // Analytics/tracking seria adicionado aqui se necessário
    
    // Remove loading states se existirem
    document.body.classList.add('loaded');
});

// ============================================
// EVENT LISTENERS GLOBAIS
// ============================================

// Previne zoom em inputs em iOS
document.addEventListener('touchstart', function() {}, { passive: true });

// Otimização para resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        // Força re-layout se necessário
        window.dispatchEvent(new Event('optimizedResize'));
    }, 250);
}, { passive: true });

// Service Worker (opcional - para PWA futuro)
if ('serviceWorker' in navigator) {
    // Descomente quando tiver um service worker
    // navigator.serviceWorker.register('/sw.js');
}
