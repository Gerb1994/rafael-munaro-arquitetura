/**
 * BUILD CONFIGURATION - RAFAEL MUNARO ARQUITETURA
 * Configurações de otimização e build para produção
 */

const BuildConfig = {
    // Configurações de performance
    performance: {
        // Tamanho máximo de bundles
        maxBundleSize: '200kb',
        maxBundleSizeGzipped: '50kb',

        // Thresholds de performance
        performanceThresholds: {
            lighthouse: {
                performance: 90,
                accessibility: 95,
                'best-practices': 90,
                seo: 95
            }
        },

        // Recursos críticos
        criticalResources: [
            '/assets/css/styles.css',
            '/assets/js/scripts.js',
            '/assets/js/scripts-modern-secure.js',
            '/site.webmanifest'
        ],

        // Recursos que podem ser lazy loaded
        lazyResources: [
            '/assets/js/faq-controller.js',
            '/assets/js/performance-optimizer.js',
            '/assets/js/scripts-security.js',
            '/assets/js/security-monitor.js'
        ]
    },

    // Configurações de otimização de imagens
    images: {
        // Formatos suportados
        formats: ['webp', 'avif', 'jpg', 'png'],

        // Tamanhos responsivos
        sizes: {
            thumbnail: 300,
            medium: 600,
            large: 900,
            xlarge: 1200
        },

        // Qualidade por formato
        quality: {
            webp: 85,
            avif: 80,
            jpg: 85,
            png: 90
        },

        // Configurações de lazy loading
        lazyLoading: {
            rootMargin: '50px 0px',
            threshold: 0.1,
            placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIiBmaWxsPSIjOUI5QkE0IiBmb250LXNpemU9IjE0Ij5JbWFnZW0gY2FycmVnYW5kby4uLjwvdGV4dD4KPHN2Zz4='
        }
    },

    // Configurações de compressão
    compression: {
        // Algoritmos suportados
        algorithms: ['gzip', 'brotli', 'deflate'],

        // Níveis de compressão
        levels: {
            gzip: 6,
            brotli: 4
        },

        // Arquivos a comprimir
        files: [
            '**/*.html',
            '**/*.css',
            '**/*.js',
            '**/*.json',
            '**/*.xml',
            '**/*.svg'
        ],

        // Arquivos a excluir da compressão
        exclude: [
            '**/*.gz',
            '**/*.br',
            '**/*.woff',
            '**/*.woff2',
            '**/*.ttf',
            '**/*.eot'
        ]
    },

    // Configurações de cache
    caching: {
        // Estratégias de cache por tipo de arquivo
        strategies: {
            'static': {
                pattern: '**/*.{css,js}',
                strategy: 'cache-first',
                maxAge: '1y',
                immutable: true
            },
            'images': {
                pattern: '**/*.{jpg,jpeg,png,gif,webp,avif,svg}',
                strategy: 'cache-first',
                maxAge: '6m'
            },
            'fonts': {
                pattern: '**/*.{woff,woff2,ttf,eot}',
                strategy: 'cache-first',
                maxAge: '1y',
                immutable: true
            },
            'documents': {
                pattern: '**/*.{pdf,doc,docx,xls,xlsx}',
                strategy: 'network-first',
                maxAge: '1d'
            },
            'api': {
                pattern: '/api/**',
                strategy: 'network-first',
                maxAge: '5m'
            }
        },

        // Headers de cache
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'ETag': true,
            'Last-Modified': true
        }
    },

    // Configurações de CDN
    cdn: {
        // URLs base para diferentes ambientes
        urls: {
            development: '/',
            staging: 'https://staging.rafaelmunaro.com/',
            production: 'https://rafaelmunaro.com/'
        },

        // Distribuição de recursos por CDN
        distribution: {
            images: 'https://cdn.rafaelmunaro.com/images/',
            fonts: 'https://fonts.googleapis.com/',
            scripts: 'https://cdnjs.cloudflare.com/ajax/libs/'
        }
    },

    // Configurações de minificação
    minification: {
        // Opções de minificação CSS
        css: {
            level: 2,
            removeUnused: true,
            mergeRules: true,
            restructure: true
        },

        // Opções de minificação JavaScript
        js: {
            compress: {
                dead_code: true,
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug']
            },
            mangle: {
                safari10: true
            }
        },

        // Opções de minificação HTML
        html: {
            removeComments: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            removeEmptyAttributes: true
        }
    },

    // Configurações de análise
    analytics: {
        // Métricas a rastrear
        metrics: [
            'page-views',
            'user-sessions',
            'bounce-rate',
            'conversion-rate',
            'performance-metrics',
            'error-tracking'
        ],

        // Configurações do Google Analytics
        googleAnalytics: {
            trackingId: 'GA_MEASUREMENT_ID',
            anonymizeIp: true,
            allowAdFeatures: false
        },

        // Configurações do Google Tag Manager
        googleTagManager: {
            containerId: 'GTM_CONTAINER_ID',
            dataLayer: 'dataLayer'
        }
    },

    // Configurações de segurança
    security: {
        // Headers de segurança
        headers: {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), accelerometer=(), payment=(), usb=(), autoplay=()',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.unsplash.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; report-uri /csp-report;"
        },

        // Configurações de CSP
        csp: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.unsplash.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: true,
            blockAllMixedContent: true,
            reportUri: "/csp-report"
        }
    },

    // Configurações de testes
    testing: {
        // Configurações de Lighthouse
        lighthouse: {
            extends: 'lighthouse:default',
            settings: {
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                skipAudits: ['uses-http2']
            }
        },

        // Configurações de testes unitários
        unitTests: {
            pattern: '**/*.test.js',
            setupFiles: ['<rootDir>/test-setup.js'],
            collectCoverageFrom: [
                '**/*.{js,jsx}',
                '!**/node_modules/**',
                '!**/vendor/**',
                '!**/*.config.js'
            ]
        }
    },

    // Configurações de deploy
    deploy: {
        // Estratégias de deploy
        strategies: {
            'netlify': {
                buildCommand: 'npm run build',
                publishDirectory: 'dist',
                redirects: [
                    { from: '/api/*', to: '/.netlify/functions/:splat', status: 200 }
                ]
            },
            'vercel': {
                buildCommand: 'npm run build',
                outputDirectory: 'dist',
                functions: {
                    'api/*.js': {
                        runtime: 'nodejs18.x'
                    }
                }
            },
            'github-pages': {
                buildCommand: 'npm run build',
                outputDirectory: 'dist',
                cname: 'rafaelmunaro.com'
            }
        },

        // Configurações de CI/CD
        ci: {
            nodeVersion: '18',
            npmVersion: '9',
            cacheDirectories: ['node_modules', '.cache']
        }
    },

    // Métodos utilitários
    utils: {
        // Verificar se está em produção
        isProduction: () => process.env.NODE_ENV === 'production',

        // Obter URL base
        getBaseUrl: () => {
            return BuildConfig.cdn.urls[process.env.NODE_ENV || 'development'];
        },

        // Gerar hash de arquivo
        generateFileHash: (content) => {
            const crypto = require('crypto');
            return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
        },

        // Validar configuração
        validateConfig: () => {
            const requiredFields = ['performance', 'images', 'caching'];
            const missingFields = requiredFields.filter(field => !BuildConfig[field]);

            if (missingFields.length > 0) {
                throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
            }

            return true;
        }
    }
};

// Validar configuração na inicialização
if (typeof module !== 'undefined' && module.exports) {
    BuildConfig.utils.validateConfig();
    module.exports = BuildConfig;
} else {
    // Em ambiente browser
    window.BuildConfig = BuildConfig;
}
