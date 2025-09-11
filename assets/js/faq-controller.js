/**
 * FAQ CONTROLLER - RAFAEL MUNARO ARQUITETURA
 * Controla a funcionalidade interativa da seção FAQ
 */

class FAQController {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq__item');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupAnimations();
    }

    setupEventListeners() {
        this.faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');

            question.addEventListener('click', () => {
                this.toggleFAQ(item, question, answer);
            });

            // Pré-calcular altura para animações suaves
            this.calculateAnswerHeight(answer);
        });
    }

    setupKeyboardNavigation() {
        this.faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq__question');

            question.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        question.click();
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.focusNextItem(index);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.focusPreviousItem(index);
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.focusFirstItem();
                        break;
                    case 'End':
                        e.preventDefault();
                        this.focusLastItem();
                        break;
                }
            });
        });
    }

    setupAnimations() {
        // Intersection Observer para animações de entrada
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Delay escalonado para cada item
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);

                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Aplicar estilos iniciais e observar
        this.faqItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(item);
        });
    }

    toggleFAQ(item, question, answer) {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.collapseFAQ(item, question, answer);
        } else {
            this.expandFAQ(item, question, answer);
        }
    }

    expandFAQ(item, question, answer) {
        // Fechar outros FAQs se necessário
        this.closeAllFAQs();

        // Expandir FAQ atual
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';

        // Animações GSAP se disponíveis
        if (typeof gsap !== 'undefined') {
            gsap.to(item, {
                backgroundColor: 'rgba(155, 161, 135, 0.05)',
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(question.querySelector('.faq__icon'), {
                rotation: 180,
                duration: 0.3,
                ease: "power2.out"
            });
        }

        // Scroll suave para o FAQ expandido em mobile
        if (window.innerWidth < 768) {
            setTimeout(() => {
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }, 300);
        }
    }

    collapseFAQ(item, question, answer) {
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';

        // Animações GSAP se disponíveis
        if (typeof gsap !== 'undefined') {
            gsap.to(item, {
                backgroundColor: 'white',
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(question.querySelector('.faq__icon'), {
                rotation: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }

    closeAllFAQs() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');

            if (question.getAttribute('aria-expanded') === 'true') {
                this.collapseFAQ(item, question, answer);
            }
        });
    }

    calculateAnswerHeight(answer) {
        // Forçar cálculo da altura para animações suaves
        const content = answer.querySelector('p');
        if (content) {
            answer.style.maxHeight = 'none';
            answer.dataset.calculatedHeight = answer.scrollHeight + 'px';
            answer.style.maxHeight = '0';
        }
    }

    focusNextItem(currentIndex) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < this.faqItems.length) {
            const nextQuestion = this.faqItems[nextIndex].querySelector('.faq__question');
            nextQuestion.focus();
        }
    }

    focusPreviousItem(currentIndex) {
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            const prevQuestion = this.faqItems[prevIndex].querySelector('.faq__question');
            prevQuestion.focus();
        }
    }

    focusFirstItem() {
        const firstQuestion = this.faqItems[0].querySelector('.faq__question');
        firstQuestion.focus();
    }

    focusLastItem() {
        const lastQuestion = this.faqItems[this.faqItems.length - 1].querySelector('.faq__question');
        lastQuestion.focus();
    }

    // Método público para expandir FAQ específico
    expandFAQByIndex(index) {
        if (index >= 0 && index < this.faqItems.length) {
            const item = this.faqItems[index];
            const question = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');
            this.expandFAQ(item, question, answer);
        }
    }

    // Método público para verificar se FAQ está expandido
    isFAQExpanded(index) {
        if (index >= 0 && index < this.faqItems.length) {
            const question = this.faqItems[index].querySelector('.faq__question');
            return question.getAttribute('aria-expanded') === 'true';
        }
        return false;
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.faq__container')) {
        window.faqController = new FAQController();
        console.log('🎯 FAQ Controller inicializado');
    }
});

// Export para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FAQController;
}
