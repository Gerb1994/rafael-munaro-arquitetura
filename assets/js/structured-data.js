/**
 * RAFAEL MUNARO ARQUITETURA - DADOS ESTRUTURADOS SEO
 * Implementação de Schema.org para melhor indexação
 */

'use strict';

class StructuredDataManager {
    constructor() {
        this.init();
    }

    init() {
        this.addOrganizationSchema();
        this.addLocalBusinessSchema();
        this.addWebSiteSchema();
        this.addBreadcrumbSchema();
        this.addServiceSchemas();
    }

    /**
     * SCHEMA PARA ORGANIZAÇÃO
     */
    addOrganizationSchema() {
        const organizationSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Rafael Munaro Arquitetura",
            "alternateName": "RM Arquitetura",
            "url": "https://rafaelmunaro.com",
            "logo": "https://rafaelmunaro.com/logo.png",
            "description": "Especialistas em arquitetura e design de interiores em Porto Alegre. Transformando espaços com criatividade e excelência.",
            "foundingDate": "2009",
            "founder": {
                "@type": "Person",
                "name": "Rafael Munaro",
                "jobTitle": "Arquiteto",
                "image": "https://rafaelmunaro.com/rafael-munaro.jpg"
            },
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Endereço completo",
                "addressLocality": "Porto Alegre",
                "addressRegion": "RS",
                "postalCode": "90000-000",
                "addressCountry": "BR"
            },
            "contactPoint": [
                {
                    "@type": "ContactPoint",
                    "telephone": "+55-51-99999-9999",
                    "contactType": "customer service",
                    "availableLanguage": "Portuguese"
                },
                {
                    "@type": "ContactPoint",
                    "email": "contato@rafaelmunaro.com",
                    "contactType": "customer service",
                    "availableLanguage": "Portuguese"
                }
            ],
            "sameAs": [
                "https://www.instagram.com/rafaelmunaro",
                "https://www.linkedin.com/in/rafaelmunaro",
                "https://www.facebook.com/rafaelmunaro"
            ],
            "areaServed": [
                {
                    "@type": "City",
                    "name": "Porto Alegre",
                    "addressRegion": "RS",
                    "addressCountry": "BR"
                },
                {
                    "@type": "City",
                    "name": "Canoas",
                    "addressRegion": "RS",
                    "addressCountry": "BR"
                },
                {
                    "@type": "City",
                    "name": "São Leopoldo",
                    "addressRegion": "RS",
                    "addressCountry": "BR"
                }
            ],
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Serviços de Arquitetura",
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Projetos Arquitetônicos",
                            "description": "Desenvolvimento completo de projetos arquitetônicos residenciais e comerciais"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Design de Interiores",
                            "description": "Criação de ambientes únicos e personalizados"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Reformas e Restaurações",
                            "description": "Modernização e revitalização de espaços existentes"
                        }
                    }
                ]
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "98",
                "bestRating": "5",
                "worstRating": "1"
            }
        };

        this.injectSchema(organizationSchema, 'organization-schema');
    }

    /**
     * SCHEMA PARA NEGÓCIO LOCAL
     */
    addLocalBusinessSchema() {
        const localBusinessSchema = {
            "@context": "https://schema.org",
            "@type": "ArchitecturalService",
            "name": "Rafael Munaro Arquitetura",
            "image": "https://rafaelmunaro.com/og-image.jpg",
            "description": "Escritório de arquitetura especializado em projetos residenciais e comerciais em Porto Alegre",
            "url": "https://rafaelmunaro.com",
            "telephone": "+55-51-99999-9999",
            "email": "contato@rafaelmunaro.com",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rua Exemplo, 123",
                "addressLocality": "Porto Alegre",
                "addressRegion": "RS",
                "postalCode": "90000-000",
                "addressCountry": "BR"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-30.0346",
                "longitude": "-51.2177"
            },
            "openingHours": [
                "Mo-Fr 08:00-18:00",
                "Sa 08:00-12:00"
            ],
            "priceRange": "$$$",
            "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
            "currenciesAccepted": "BRL",
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": "-30.0346",
                    "longitude": "-51.2177"
                },
                "geoRadius": "50000"
            },
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Serviços Arquitetônicos",
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": "Consultoria Arquitetônica",
                            "description": "Assessoria especializada em todas as fases do projeto"
                        },
                        "priceSpecification": {
                            "@type": "PriceSpecification",
                            "price": "150",
                            "priceCurrency": "BRL"
                        }
                    }
                ]
            },
            "review": [
                {
                    "@type": "Review",
                    "author": {
                        "@type": "Person",
                        "name": "Cliente Satisfeito"
                    },
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5"
                    },
                    "reviewBody": "Excelente trabalho! Superou todas as expectativas."
                }
            ]
        };

        this.injectSchema(localBusinessSchema, 'local-business-schema');
    }

    /**
     * SCHEMA PARA WEBSITE
     */
    addWebSiteSchema() {
        const websiteSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Rafael Munaro Arquitetura",
            "url": "https://rafaelmunaro.com",
            "description": "Portfólio digital de arquitetura e design de interiores",
            "inLanguage": "pt-BR",
            "copyrightHolder": {
                "@type": "Organization",
                "name": "Rafael Munaro Arquitetura"
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://rafaelmunaro.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Rafael Munaro Arquitetura",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://rafaelmunaro.com/logo.png"
                }
            }
        };

        this.injectSchema(websiteSchema, 'website-schema');
    }

    /**
     * SCHEMA PARA BREADCRUMB
     */
    addBreadcrumbSchema() {
        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Início",
                    "item": "https://rafaelmunaro.com/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Sobre",
                    "item": "https://rafaelmunaro.com/#about"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Portfólio",
                    "item": "https://rafaelmunaro.com/#portfolio"
                },
                {
                    "@type": "ListItem",
                    "position": 4,
                    "name": "Serviços",
                    "item": "https://rafaelmunaro.com/#services"
                },
                {
                    "@type": "ListItem",
                    "position": 5,
                    "name": "Contato",
                    "item": "https://rafaelmunaro.com/#contact"
                }
            ]
        };

        this.injectSchema(breadcrumbSchema, 'breadcrumb-schema');
    }

    /**
     * SCHEMAS PARA SERVIÇOS
     */
    addServiceSchemas() {
        const services = [
            {
                "@context": "https://schema.org",
                "@type": "Service",
                "@id": "https://rafaelmunaro.com/#arquitetonico",
                "name": "Projetos Arquitetônicos",
                "description": "Desenvolvimento completo de projetos arquitetônicos residenciais e comerciais, desde concepção até execução",
                "provider": {
                    "@type": "Organization",
                    "name": "Rafael Munaro Arquitetura"
                },
                "areaServed": {
                    "@type": "City",
                    "name": "Porto Alegre",
                    "addressRegion": "RS",
                    "addressCountry": "BR"
                },
                "serviceType": "Arquitetura",
                "offers": {
                    "@type": "Offer",
                    "priceSpecification": {
                        "@type": "PriceSpecification",
                        "priceCurrency": "BRL"
                    }
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "Service",
                "@id": "https://rafaelmunaro.com/#interiores",
                "name": "Design de Interiores",
                "description": "Criação de ambientes únicos e personalizados que refletem o estilo de vida dos clientes",
                "provider": {
                    "@type": "Organization",
                    "name": "Rafael Munaro Arquitetura"
                },
                "areaServed": {
                    "@type": "City",
                    "name": "Porto Alegre",
                    "addressRegion": "RS",
                    "addressCountry": "BR"
                },
                "serviceType": "Design de Interiores"
            },
            {
                "@context": "https://schema.org",
                "@type": "Service",
                "@id": "https://rafaelmunaro.com/#reformas",
                "name": "Reformas e Restaurações",
                "description": "Modernização e revitalização de espaços existentes com técnicas inovadoras",
                "provider": {
                    "@type": "Organization",
                    "name": "Rafael Munaro Arquitetura"
                },
                "areaServed": {
                    "@type": "City",
                    "name": "Porto Alegre",
                    "addressRegion": "RS",
                    "addressCountry": "BR"
                },
                "serviceType": "Reformas"
            }
        ];

        services.forEach((service, index) => {
            this.injectSchema(service, `service-schema-${index}`);
        });
    }

    /**
     * INJETAR SCHEMA NO DOCUMENTO
     */
    injectSchema(schema, id) {
        // Verificar se já existe
        if (document.getElementById(id)) {
            return;
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify(schema, null, 2);

        // Adicionar no head
        document.head.appendChild(script);

        console.log(`Schema injetado: ${id}`);
    }

    /**
     * ATUALIZAR SCHEMA DINAMICAMENTE
     */
    updateDynamicSchemas() {
        // Atualizar schema baseado na página atual
        const currentPage = window.location.pathname;

        if (currentPage.includes('#portfolio')) {
            this.addPortfolioSchemas();
        }

        if (currentPage.includes('#contact')) {
            this.addContactSchemas();
        }
    }

    /**
     * SCHEMA PARA PORTFÓLIO
     */
    addPortfolioSchemas() {
        const portfolioSchema = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Portfólio de Projetos",
            "description": "Explore nossa galeria de projetos arquitetônicos residenciais e comerciais",
            "url": "https://rafaelmunaro.com/#portfolio",
            "mainEntity": {
                "@type": "ItemList",
                "name": "Projetos em Destaque",
                "numberOfItems": "150",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@type": "CreativeWork",
                            "name": "Casa Moderna Vila Nova",
                            "description": "Projeto residencial moderno com 300m²",
                            "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
                            "datePublished": "2024-01-15"
                        }
                    }
                ]
            }
        };

        this.injectSchema(portfolioSchema, 'portfolio-schema');
    }

    /**
     * SCHEMA PARA CONTATO
     */
    addContactSchemas() {
        const contactSchema = {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Entre em Contato",
            "description": "Fale conosco para transformar seu projeto em realidade",
            "url": "https://rafaelmunaro.com/#contact",
            "mainEntity": {
                "@type": "Organization",
                "name": "Rafael Munaro Arquitetura",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+55-51-99999-9999",
                    "email": "contato@rafaelmunaro.com",
                    "contactType": "customer service",
                    "availableLanguage": "Portuguese",
                    "hoursAvailable": {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        "opens": "08:00",
                        "closes": "18:00"
                    }
                }
            }
        };

        this.injectSchema(contactSchema, 'contact-schema');
    }

    /**
     * GERAR SITEMAP DINÂMICO
     */
    generateSitemap() {
        const sitemap = {
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            "name": "Navegação do Site",
            "url": "https://rafaelmunaro.com",
            "potentialAction": [
                {
                    "@type": "ReadAction",
                    "target": [
                        "https://rafaelmunaro.com/",
                        "https://rafaelmunaro.com/#about",
                        "https://rafaelmunaro.com/#portfolio",
                        "https://rafaelmunaro.com/#services",
                        "https://rafaelmunaro.com/#contact"
                    ]
                }
            ]
        };

        return sitemap;
    }
}

// Inicializar dados estruturados quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.structuredDataManager = new StructuredDataManager();

    // Atualizar schemas dinâmicos baseado na navegação
    window.addEventListener('hashchange', () => {
        setTimeout(() => {
            window.structuredDataManager.updateDynamicSchemas();
        }, 100);
    });

    console.log('📊 Dados estruturados SEO inicializados');
});

// Exportar para uso global
window.StructuredDataManager = StructuredDataManager;
