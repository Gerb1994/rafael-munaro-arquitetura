/**
 * RAFAEL MUNARO ARQUITETURA - GERENCIADOR DE PORTFÓLIO
 * Sistema de galeria interativa com filtros e modal
 */

'use strict';

/**
 * Gerenciador de portfólio
 */
class PortfolioManager {
    constructor() {
        this.portfolioContainer = document.querySelector('.portfolio__container');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.modal = document.querySelector('.modal');
        this.currentFilter = 'all';
        this.projects = [];
        this.filteredProjects = [];
    }

    async init() {
        await this.loadProjects();
        this.setupFilters();
        this.setupModal();
        this.setupKeyboardNavigation();
        this.setupIntersectionObserver();
    }

    /**
     * Carregar projetos (simulado por enquanto)
     */
    async loadProjects() {
        // Simulação de carregamento de projetos
        this.projects = [
            {
                id: 'padaria-treze-maio',
                title: 'Padaria Treze de Maio',
                category: 'comercial',
                categoryText: 'Comercial',
                image: './assets/images/Projeto 1/PADARIA TREZE DE MAIO - img 02.jpg',
                description: `
                    <p class="mb-4">Projeto desenvolvido para modernizar e otimizar a Padaria Treze de Maio, criando um ambiente acolhedor e funcional para clientes e funcionários.</p>
                    <p>A área de vendas foi repensada com um layout que facilita a circulação dos clientes e valoriza os produtos. O uso de materiais como madeira clara e revestimentos cerâmicos confere personalidade e durabilidade ao espaço.</p>
                `,
                technologies: ['Design de Interiores', 'Layout Comercial', 'Materiais Sustentáveis']
            },
            {
                id: 'miguel-veiculos',
                title: 'Miguel Veículos',
                category: 'comercial',
                categoryText: 'Comercial',
                image: './assets/images/Projeto 2/MIGUEL VEÍCULOS - img  (1).jpg',
                description: `
                    <p class="mb-4">Revitalização completa da loja Miguel Veículos, focando na criação de um ambiente moderno e profissional que transmite confiança aos clientes.</p>
                    <p>O layout foi repensado para otimizar a exposição dos veículos e criar áreas distintas para atendimento. A identidade visual foi integrada ao projeto através de elementos gráficos e cores corporativas.</p>
                `,
                technologies: ['Arquitetura Comercial', 'Branding Integration', 'Iluminação LED']
            },
            {
                id: 'projeto-residencial-3',
                title: 'Projeto Residencial 3',
                category: 'interiores',
                categoryText: 'Design de Interiores',
                image: './assets/images/Projeto 3/Captura de tela 2025-09-11 183958.png',
                description: `
                    <p class="mb-4">Projeto de design de interiores para residência particular, focando na criação de ambientes integrados e funcionais.</p>
                    <p>O conceito desenvolve uma linguagem contemporânea com elementos que valorizam o conforto e a praticidade do dia a dia. A paleta de cores neutras e o uso inteligente da iluminação natural criam atmosferas acolhedoras.</p>
                `,
                technologies: ['Design de Interiores', 'Iluminação Natural', 'Materiais Premium']
            }
        ];

        this.filteredProjects = [...this.projects];
        this.renderProjects();
    }

    /**
     * Renderizar projetos
     */
    renderProjects() {
        if (!this.portfolioContainer) return;

        // Mostrar loading skeleton inicialmente
        if (this.projects.length === 0) {
            this.showLoadingState();
            return;
        }

        // Limpar container
        this.portfolioContainer.innerHTML = '';

        // Criar grid de projetos
        const grid = document.createElement('div');
        grid.className = 'portfolio__grid';
        grid.setAttribute('role', 'grid');
        grid.setAttribute('aria-label', 'Galeria de projetos');

        this.filteredProjects.forEach((project, index) => {
            const projectElement = this.createProjectElement(project, index);
            grid.appendChild(projectElement);
        });

        this.portfolioContainer.appendChild(grid);

        // Anunciar carregamento para leitores de tela
        if (window.app?.accessibility) {
            window.app.accessibility.announce(`${this.filteredProjects.length} projetos carregados`);
        }
    }

    createProjectElement(project, index) {
        const article = document.createElement('article');
        article.className = 'portfolio__item';
        article.setAttribute('role', 'gridcell');
        article.setAttribute('tabindex', '0');
        article.setAttribute('aria-label', `${project.title} - ${project.categoryText}`);
        article.setAttribute('data-project-id', project.id);

        article.innerHTML = `
            <div class="portfolio__figure">
                <img
                    src="${project.image}"
                    alt="${project.title} - ${project.categoryText}"
                    class="portfolio__image"
                    loading="lazy"
                    width="400"
                    height="300"
                >
                <div class="portfolio__caption">
                    <h3 class="portfolio__title">${project.title}</h3>
                    <p class="portfolio__category">${project.categoryText}</p>
                </div>
            </div>
        `;

        // Eventos
        article.addEventListener('click', () => this.openModal(project));
        article.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openModal(project);
            }
        });

        return article;
    }

    showLoadingState() {
        this.portfolioContainer.innerHTML = `
            <div class="portfolio__grid">
                ${Array(6).fill().map(() => `
                    <div class="portfolio__item loading-skeleton" role="presentation">
                        <div class="portfolio__figure">
                            <div class="portfolio__image" style="background: var(--color-neutral-200);"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Configurar filtros
     */
    setupFilters() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setActiveFilter(button.dataset.filter);
            });

            // Suporte a teclado
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.setActiveFilter(button.dataset.filter);
                }
            });
        });
    }

    setActiveFilter(filter) {
        // Atualizar botões ativos
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('filter-btn--active', btn.dataset.filter === filter);
            btn.setAttribute('aria-pressed', btn.dataset.filter === filter);
        });

        // Filtrar projetos
        this.currentFilter = filter;
        if (filter === 'all') {
            this.filteredProjects = [...this.projects];
        } else {
            this.filteredProjects = this.projects.filter(project => project.category === filter);
        }

        // Re-renderizar
        this.renderProjects();

        // Anunciar filtro para leitores de tela
        const filterText = filter === 'all' ? 'todos os projetos' : `projetos ${filter}`;
        if (window.app?.accessibility) {
            window.app.accessibility.announce(`Filtrando por ${filterText}`);
        }
    }

    /**
     * Configurar modal
     */
    setupModal() {
        if (!this.modal) return;

        // Overlay click
        const overlay = this.modal.querySelector('.modal__overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal());
        }

        // Close button
        const closeBtn = this.modal.querySelector('.modal__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('modal--open')) {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            }
        });

        // Focus trap
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.trapFocus(e);
            }
        });
    }

    openModal(project) {
        if (!this.modal) return;

        const modalContent = this.modal.querySelector('.modal__body');
        if (!modalContent) return;

        modalContent.innerHTML = this.createModalContent(project);

        this.modal.classList.add('modal--open');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus no modal
        const firstFocusable = modalContent.querySelector('button, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Anunciar modal para leitores de tela
        if (window.app?.accessibility) {
            window.app.accessibility.announce(`Modal aberto: ${project.title}`);
        }
    }

    createModalContent(project) {
        return `
            <div class="modal__header">
                <h2 class="modal__title" id="modal-title">${project.title}</h2>
                <span class="modal__category category-${project.category}">${project.categoryText}</span>
            </div>

            <div class="modal__content">
                <div class="modal__image">
                    <img
                        src="${project.image}"
                        alt="${project.title}"
                        loading="lazy"
                        width="600"
                        height="400"
                    >
                </div>

                <div class="modal__description">
                    ${project.description}

                    <div class="modal__technologies">
                        <h3>Tecnologias Utilizadas:</h3>
                        <ul>
                            ${project.technologies.map(tech => `<li>${tech}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="modal__actions">
                <button class="btn btn--primary" onclick="window.open('${project.image}', '_blank')">
                    Ver Imagem Completa
                </button>
                <button class="btn" onclick="window.portfolioManager.closeModal()">
                    Fechar
                </button>
            </div>
        `;
    }

    closeModal() {
        if (!this.modal) return;

        this.modal.classList.remove('modal--open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Retornar focus
        const lastFocused = document.querySelector('.portfolio__item[tabindex="0"]');
        if (lastFocused) {
            lastFocused.focus();
        }

        // Anunciar fechamento
        if (window.app?.accessibility) {
            window.app.accessibility.announce('Modal fechado');
        }
    }

    trapFocus(e) {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    /**
     * Configurar navegação por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const items = document.querySelectorAll('.portfolio__item');
            const currentItem = document.activeElement;

            if (!currentItem.classList.contains('portfolio__item')) return;

            const currentIndex = Array.from(items).indexOf(currentItem);

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % items.length;
                    items[nextIndex].focus();
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
                    items[prevIndex].focus();
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    const upIndex = Math.max(0, currentIndex - 3);
                    items[upIndex].focus();
                    break;

                case 'ArrowDown':
                    e.preventDefault();
                    const downIndex = Math.min(items.length - 1, currentIndex + 3);
                    items[downIndex].focus();
                    break;
            }
        });
    }

    /**
     * Intersection Observer para animações
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('portfolio__item--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observar itens do portfólio
        document.querySelectorAll('.portfolio__item').forEach(item => {
            observer.observe(item);
        });
    }

    /**
     * API pública
     */
    filterByCategory(category) {
        this.setActiveFilter(category);
    }

    getProjectById(id) {
        return this.projects.find(project => project.id === id);
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.modal) {
            this.closeModal();
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioManager = new PortfolioManager();
});

// Exportar para uso global
window.PortfolioManager = PortfolioManager;
