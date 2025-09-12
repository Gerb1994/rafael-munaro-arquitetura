/**
 * RAFAEL MUNARO ARQUITETURA - OTIMIZAÇÃO SEO
 * Sistema avançado de SEO com Schema.org e metadados estruturados
 */

'use strict';

/**
 * Gerenciador de SEO
 */
class SEOManager {
    constructor() {
        this.structuredData = new Map();
        this.metaTags = new Map();
        this.canonicalUrl = this.getCanonicalUrl();
        this.pageData = {};
    }

    async init() {
        this.setupStructuredData();
        this.setupMetaTags();
        this.setupOpenGraph();
        this.setupTwitterCards();
        this.setupCanonicalURL();
        this.setupBreadcrumbs();
        this.setupSitemapIntegration();
        this.setupAnalytics();
    }

    /**
     * Obter URL canônica
     */
    getCanonicalUrl() {
        const link = document.querySelector('link[rel="canonical"]');
        return link ? link.href : window.location.origin + window.location.pathname;
    }

    /**
     * Configurar dados estruturados Schema.org
     */
    setupStructuredData() {
        // Dados básicos da organização
        const organizationData = {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "Rafael Munaro Arquitetura",
            "description": "Arquiteto e Designer de Interiores especialista em Porto Alegre. Projetos com alma, espaços com identidade.",
            "url": this.canonicalUrl,
            "logo": `${window.location.origin}/assets/images/Perfil Rafael Munaro.png`,
            "image": `${window.location.origin}/assets/images/Perfil Rafael Munaro.png`,
            "founder": {
                "@type": "Person",
                "name": "Rafael Munaro",
                "jobTitle": "Arquiteto e Designer de Interiores",
                "image": `${window.location.origin}/assets/images/Perfil Rafael Munaro.png`
            },
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rua Padre Fabiano, 1072",
                "addressLocality": "Capivari",
                "addressRegion": "SP",
                "postalCode": "13360-000",
                "addressCountry": "BR"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-22.9953",
                "longitude": "-47.4567"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+55-19-99690-8104",
                "contactType": "customer service",
                "availableLanguage": "Portuguese"
            },
            "sameAs": [
                "https://www.instagram.com/rafaelmunaro.arq/",
                "https://www.facebook.com/rafael.munaro.2025",
                "https://br.linkedin.com/in/rafael-soares-munaro"
            ],
            "areaServed": {
                "@type": "City",
                "name": "Porto Alegre",
                "addressRegion": "RS",
                "addressCountry": "BR"
            }
        };

        this.addStructuredData('organization', organizationData);

        // Serviços oferecidos
        const servicesData = {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            "name": "Serviços de Arquitetura",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Projetos Arquitetônicos",
                        "description": "Criação de projetos residenciais e comerciais completos, desde o conceito até o executivo."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Design de Interiores",
                        "description": "Elaboração de ambientes internos que aliam beleza, conforto e personalidade."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Acompanhamento de Obra",
                        "description": "Gerenciamento e supervisão para garantir que o projeto seja executado com fidelidade e qualidade."
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Consultoria",
                        "description": "Orientação especializada para ajudar você a tomar as melhores decisões para seu espaço."
                    }
                }
            ]
        };

        this.addStructuredData('services', servicesData);

        // Dados da página atual
        const webpageData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": document.title,
            "description": this.getMetaDescription(),
            "url": this.canonicalUrl,
            "isPartOf": {
                "@type": "WebSite",
                "name": "Rafael Munaro Arquitetura",
                "url": window.location.origin
            },
            "primaryImageOfPage": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/assets/images/Perfil Rafael Munaro.png`
            },
            "datePublished": "2024-01-01",
            "dateModified": new Date().toISOString().split('T')[0]
        };

        this.addStructuredData('webpage', webpageData);
    }

    /**
     * Adicionar dados estruturados
     */
    addStructuredData(key, data) {
        this.structuredData.set(key, data);
        this.injectStructuredData(key, data);
    }

    /**
     * Injetar dados estruturados no DOM
     */
    injectStructuredData(key, data) {
        // Remover dados existentes se houver
        const existingScript = document.querySelector(`script[data-structured="${key}"]`);
        if (existingScript) {
            existingScript.remove();
        }

        // Criar novo script
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-structured', key);
        script.textContent = JSON.stringify(data, null, 2);

        document.head.appendChild(script);
    }

    /**
     * Configurar meta tags
     */
    setupMetaTags() {
        const metaTags = [
            { name: 'description', content: this.getMetaDescription() },
            { name: 'keywords', content: 'arquiteto, design de interiores, porto alegre, arquitetura residencial, arquitetura comercial, projeto arquitetônico' },
            { name: 'author', content: 'Rafael Munaro' },
            { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
            { name: 'language', content: 'pt-BR' },
            { name: 'geo.region', content: 'BR-RS' },
            { name: 'geo.placename', content: 'Porto Alegre' },
            { name: 'theme-color', content: '#545943' },
            { name: 'msapplication-TileColor', content: '#545943' }
        ];

        metaTags.forEach(tag => {
            this.setMetaTag(tag.name, tag.content);
        });
    }

    /**
     * Definir meta tag
     */
    setMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);

        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }

        meta.content = content;
        this.metaTags.set(name, content);
    }

    /**
     * Obter descrição da meta tag
     */
    getMetaDescription() {
        const metaDesc = document.querySelector('meta[name="description"]');
        return metaDesc ? metaDesc.content : 'Rafael Munaro - Arquiteto e Designer de Interiores. Projetos com alma, espaços com identidade em Porto Alegre.';
    }

    /**
     * Configurar Open Graph
     */
    setupOpenGraph() {
        const ogTags = [
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: this.canonicalUrl },
            { property: 'og:title', content: 'Rafael Munaro | Arquiteto e Designer de Interiores' },
            { property: 'og:description', content: this.getMetaDescription() },
            { property: 'og:image', content: `${window.location.origin}/assets/images/Perfil Rafael Munaro.png` },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:image:alt', content: 'Foto profissional de Rafael Munaro, arquiteto e designer de interiores' },
            { property: 'og:site_name', content: 'Rafael Munaro Arquitetura' },
            { property: 'og:locale', content: 'pt_BR' }
        ];

        ogTags.forEach(tag => {
            this.setMetaTag(tag.property, tag.content);
        });
    }

    /**
     * Configurar Twitter Cards
     */
    setupTwitterCards() {
        const twitterTags = [
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:url', content: this.canonicalUrl },
            { name: 'twitter:title', content: 'Rafael Munaro | Arquiteto e Designer de Interiores' },
            { name: 'twitter:description', content: this.getMetaDescription() },
            { name: 'twitter:image', content: `${window.location.origin}/assets/images/Perfil Rafael Munaro.png` },
            { name: 'twitter:image:alt', content: 'Foto profissional de Rafael Munaro, arquiteto e designer de interiores' }
        ];

        twitterTags.forEach(tag => {
            this.setMetaTag(tag.name, tag.content);
        });
    }

    /**
     * Configurar URL canônica
     */
    setupCanonicalURL() {
        let canonical = document.querySelector('link[rel="canonical"]');

        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }

        canonical.href = this.canonicalUrl;
    }

    /**
     * Configurar breadcrumbs Schema.org
     */
    setupBreadcrumbs() {
        const breadcrumbs = [
            { name: 'Início', url: window.location.origin },
            { name: 'Sobre', url: `${window.location.origin}#sobre` },
            { name: 'Projetos', url: `${window.location.origin}#projetos` },
            { name: 'Serviços', url: `${window.location.origin}#servicos` },
            { name: 'Contato', url: `${window.location.origin}#contato` }
        ];

        const breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": crumb.url
            }))
        };

        this.addStructuredData('breadcrumbs', breadcrumbData);
    }

    /**
     * Integrar com sitemap
     */
    setupSitemapIntegration() {
        // Verificar se página está no sitemap
        const currentPath = window.location.pathname;
        this.checkSitemapInclusion(currentPath);
    }

    /**
     * Verificar inclusão no sitemap
     */
    async checkSitemapInclusion(path) {
        try {
            const sitemapUrl = `${window.location.origin}/sitemap.xml`;
            const response = await fetch(sitemapUrl);
            const sitemapText = await response.text();

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(sitemapText, 'text/xml');
            const urls = xmlDoc.querySelectorAll('url > loc');

            const isIncluded = Array.from(urls).some(url => {
                const urlPath = new URL(url.textContent).pathname;
                return urlPath === path;
            });

            if (isIncluded) {
                console.log('✅ Página incluída no sitemap');
            } else {
                console.warn('⚠️ Página não encontrada no sitemap');
            }
        } catch (error) {
            console.warn('Erro ao verificar sitemap:', error);
        }
    }

    /**
     * Configurar analytics e tracking
     */
    setupAnalytics() {
        // Google Analytics 4
        this.setupGoogleAnalytics();

        // Track page views
        this.trackPageView();

        // Track user interactions
        this.setupInteractionTracking();
    }

    /**
     * Configurar Google Analytics
     */
    setupGoogleAnalytics() {
        // Google Analytics 4 - substitua pela sua GA4 ID
        const GA4_ID = 'G-XXXXXXXXXX';

        // Global site tag
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
        document.head.appendChild(gtagScript);

        // Configuração
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', GA4_ID, {
            'page_title': document.title,
            'page_location': this.canonicalUrl
        });
    }

    /**
     * Rastrear visualização de página
     */
    trackPageView() {
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: document.title,
                page_location: this.canonicalUrl
            });
        }
    }

    /**
     * Configurar rastreamento de interações
     */
    setupInteractionTracking() {
        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (window.gtag) {
                window.gtag('event', 'form_submit', {
                    form_name: e.target.name || e.target.id || 'contact_form'
                });
            }
        });

        // Track project views
        document.addEventListener('click', (e) => {
            const projectItem = e.target.closest('.portfolio__item');
            if (projectItem && window.gtag) {
                const projectId = projectItem.getAttribute('data-project-id');
                window.gtag('event', 'project_view', {
                    project_id: projectId
                });
            }
        });

        // Track social media clicks
        document.addEventListener('click', (e) => {
            const socialLink = e.target.closest('a[href*="instagram"], a[href*="facebook"], a[href*="linkedin"]');
            if (socialLink && window.gtag) {
                const platform = socialLink.href.includes('instagram') ? 'instagram' :
                                socialLink.href.includes('facebook') ? 'facebook' : 'linkedin';

                window.gtag('event', 'social_click', {
                    social_platform: platform
                });
            }
        });
    }

    /**
     * Atualizar dados estruturados dinamicamente
     */
    updateStructuredData(key, updates) {
        const existingData = this.structuredData.get(key);
        if (existingData) {
            const updatedData = { ...existingData, ...updates };
            this.structuredData.set(key, updatedData);
            this.injectStructuredData(key, updatedData);
        }
    }

    /**
     * Adicionar FAQ Schema
     */
    addFAQSchema(faqs) {
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };

        this.addStructuredData('faq', faqData);
    }

    /**
     * Adicionar Schema de artigo/blog
     */
    addArticleSchema(articleData) {
        const articleSchema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": articleData.title,
            "description": articleData.description,
            "image": articleData.image,
            "datePublished": articleData.datePublished,
            "dateModified": articleData.dateModified,
            "author": {
                "@type": "Person",
                "name": "Rafael Munaro"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Rafael Munaro Arquitetura",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${window.location.origin}/assets/images/logo.png`
                }
            }
        };

        this.addStructuredData('article', articleSchema);
    }

    /**
     * Gerar relatório SEO
     */
    generateSEOReport() {
        const report = {
            title: document.title,
            description: this.getMetaDescription(),
            canonical: this.canonicalUrl,
            structuredData: Array.from(this.structuredData.keys()),
            metaTags: Array.from(this.metaTags.entries()),
            images: this.checkImageOptimization(),
            headings: this.analyzeHeadings(),
            links: this.analyzeLinks()
        };

        console.table(report);
        return report;
    }

    /**
     * Verificar otimização de imagens
     */
    checkImageOptimization() {
        const images = document.querySelectorAll('img');
        const report = [];

        images.forEach(img => {
            const hasAlt = img.hasAttribute('alt') && img.alt.trim() !== '';
            const hasLazy = img.hasAttribute('loading') && img.loading === 'lazy';
            const hasWidth = img.hasAttribute('width');
            const hasHeight = img.hasAttribute('height');

            report.push({
                src: img.src,
                alt: hasAlt,
                lazy: hasLazy,
                dimensions: hasWidth && hasHeight,
                score: (hasAlt ? 1 : 0) + (hasLazy ? 1 : 0) + (hasWidth && hasHeight ? 1 : 0)
            });
        });

        return report;
    }

    /**
     * Analisar estrutura de headings
     */
    analyzeHeadings() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const structure = [];

        headings.forEach(heading => {
            structure.push({
                level: parseInt(heading.tagName.charAt(1)),
                text: heading.textContent.trim(),
                id: heading.id || null
            });
        });

        return structure;
    }

    /**
     * Analisar links
     */
    analyzeLinks() {
        const links = document.querySelectorAll('a');
        const report = {
            internal: 0,
            external: 0,
            broken: []
        };

        links.forEach(link => {
            const href = link.getAttribute('href');

            if (!href) return;

            if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                report.external++;
            } else if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../') || href.includes(window.location.hostname)) {
                report.internal++;
            }

            // Verificar links quebrados (simples check)
            if (href === '#') {
                report.broken.push(href);
            }
        });

        return report;
    }

    /**
     * Atualizar title dinamicamente
     */
    updateTitle(newTitle) {
        document.title = newTitle;

        // Atualizar dados estruturados
        this.updateStructuredData('webpage', {
            name: newTitle,
            dateModified: new Date().toISOString().split('T')[0]
        });

        // Atualizar analytics
        if (window.gtag) {
            window.gtag('config', 'G-XXXXXXXXXX', {
                page_title: newTitle
            });
        }
    }

    /**
     * Atualizar meta description
     */
    updateMetaDescription(description) {
        this.setMetaTag('description', description);

        // Atualizar dados estruturados
        this.updateStructuredData('webpage', {
            description: description
        });

        // Atualizar Open Graph
        this.setMetaTag('og:description', description);
        this.setMetaTag('twitter:description', description);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.seoManager = new SEOManager();
});

// Exportar para uso global
window.SEOManager = SEOManager;
