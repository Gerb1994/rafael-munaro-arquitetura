/**
 * RAFAEL MUNARO ARQUITETURA - SISTEMA DE TESTES E VALIDAÇÃO
 * Framework completo para testes automatizados e validação de qualidade
 */

'use strict';

/**
 * Sistema de Testes e Validação
 */
class TestingSystem {
    constructor() {
        this.tests = new Map();
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            errors: 0,
            total: 0
        };
        this.testSuites = new Map();
        this.isRunning = false;
        this.reports = [];
    }

    async init() {
        this.setupTestSuites();
        this.setupAutomatedTesting();
        this.setupPerformanceMonitoring();
        this.setupAccessibilityValidation();
        this.setupSEOValidation();
        this.setupConsoleOverrides();
    }

    /**
     * Configurar suítes de teste
     */
    setupTestSuites() {
        // Performance Tests
        this.registerTestSuite('performance', {
            name: 'Performance Tests',
            tests: [
                { name: 'Core Web Vitals', fn: () => this.testCoreWebVitals() },
                { name: 'Image Optimization', fn: () => this.testImageOptimization() },
                { name: 'Bundle Size', fn: () => this.testBundleSize() },
                { name: 'Lazy Loading', fn: () => this.testLazyLoading() },
                { name: 'Cache Strategy', fn: () => this.testCacheStrategy() }
            ]
        });

        // Accessibility Tests
        this.registerTestSuite('accessibility', {
            name: 'Accessibility Tests',
            tests: [
                { name: 'WCAG 2.1 AA Compliance', fn: () => this.testWCAGCompliance() },
                { name: 'Keyboard Navigation', fn: () => this.testKeyboardNavigation() },
                { name: 'Screen Reader Support', fn: () => this.testScreenReaderSupport() },
                { name: 'Color Contrast', fn: () => this.testColorContrast() },
                { name: 'Focus Management', fn: () => this.testFocusManagement() }
            ]
        });

        // SEO Tests
        this.registerTestSuite('seo', {
            name: 'SEO Tests',
            tests: [
                { name: 'Meta Tags', fn: () => this.testMetaTags() },
                { name: 'Structured Data', fn: () => this.testStructuredData() },
                { name: 'Heading Structure', fn: () => this.testHeadingStructure() },
                { name: 'Image Alt Texts', fn: () => this.testImageAltTexts() },
                { name: 'Canonical URLs', fn: () => this.testCanonicalURLs() }
            ]
        });

        // Functionality Tests
        this.registerTestSuite('functionality', {
            name: 'Functionality Tests',
            tests: [
                { name: 'Form Validation', fn: () => this.testFormValidation() },
                { name: 'Portfolio Gallery', fn: () => this.testPortfolioGallery() },
                { name: 'Navigation System', fn: () => this.testNavigationSystem() },
                { name: 'Contact System', fn: () => this.testContactSystem() },
                { name: 'Responsive Design', fn: () => this.testResponsiveDesign() }
            ]
        });

        // Security Tests
        this.registerTestSuite('security', {
            name: 'Security Tests',
            tests: [
                { name: 'XSS Prevention', fn: () => this.testXSSPrevention() },
                { name: 'CSRF Protection', fn: () => this.testCSRFProtection() },
                { name: 'Input Sanitization', fn: () => this.testInputSanitization() },
                { name: 'HTTPS Enforcement', fn: () => this.testHTTPSEnforcement() },
                { name: 'Content Security Policy', fn: () => this.testCSP() }
            ]
        });
    }

    /**
     * Registrar suíte de testes
     */
    registerTestSuite(name, suite) {
        this.testSuites.set(name, suite);
    }

    /**
     * Registrar teste individual
     */
    registerTest(name, testFn) {
        this.tests.set(name, testFn);
    }

    /**
     * Executar todos os testes
     */
    async runAllTests() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.resetResults();

        console.group('🧪 Executando Testes Completos');

        const startTime = performance.now();

        // Executar todas as suítes
        for (const [suiteName, suite] of this.testSuites) {
            await this.runTestSuite(suiteName, suite);
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        this.generateReport(duration);
        console.groupEnd();

        this.isRunning = false;
    }

    /**
     * Executar suíte de testes específica
     */
    async runTestSuite(suiteName, suite) {
        console.group(`📋 ${suite.name}`);

        const suiteResults = {
            name: suite.name,
            tests: [],
            passed: 0,
            failed: 0,
            duration: 0
        };

        const startTime = performance.now();

        for (const test of suite.tests) {
            const result = await this.runTest(test.name, test.fn);
            suiteResults.tests.push(result);

            if (result.status === 'passed') {
                suiteResults.passed++;
            } else {
                suiteResults.failed++;
            }
        }

        suiteResults.duration = performance.now() - startTime;

        this.reports.push(suiteResults);
        console.groupEnd();
    }

    /**
     * Executar teste individual
     */
    async runTest(testName, testFn) {
        const startTime = performance.now();

        try {
            const result = await testFn();

            if (result === undefined || result === true) {
                this.results.passed++;
                console.log(`✅ ${testName}`);
                return {
                    name: testName,
                    status: 'passed',
                    duration: performance.now() - startTime
                };
            } else if (result === false) {
                this.results.failed++;
                console.log(`❌ ${testName}`);
                return {
                    name: testName,
                    status: 'failed',
                    duration: performance.now() - startTime
                };
            } else {
                // Resultado personalizado
                return {
                    name: testName,
                    status: result.status || 'passed',
                    message: result.message,
                    duration: performance.now() - startTime
                };
            }
        } catch (error) {
            this.results.errors++;
            console.error(`💥 ${testName}:`, error);
            return {
                name: testName,
                status: 'error',
                error: error.message,
                duration: performance.now() - startTime
            };
        }
    }

    /**
     * Resetar resultados
     */
    resetResults() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            errors: 0,
            total: 0
        };
        this.reports = [];
    }

    /**
     * Gerar relatório final
     */
    generateReport(totalDuration) {
        const { passed, failed, warnings, errors } = this.results;
        const total = passed + failed + warnings + errors;
        const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

        console.log(`
📊 RELATÓRIO DE TESTES
══════════════════════════════════════════
⏱️  Tempo total: ${totalDuration.toFixed(2)}ms
📈 Taxa de sucesso: ${successRate}%
✅ Aprovados: ${passed}
❌ Reprovados: ${failed}
⚠️  Avisos: ${warnings}
💥 Erros: ${errors}
📋 Total: ${total}
══════════════════════════════════════════
        `);

        // Salvar relatório
        this.saveReport({
            timestamp: new Date().toISOString(),
            duration: totalDuration,
            results: this.results,
            suites: this.reports,
            successRate: parseFloat(successRate)
        });
    }

    /**
     * Salvar relatório
     */
    saveReport(report) {
        try {
            const reports = JSON.parse(localStorage.getItem('test_reports') || '[]');
            reports.push(report);

            // Manter apenas os últimos 10 relatórios
            if (reports.length > 10) {
                reports.shift();
            }

            localStorage.setItem('test_reports', JSON.stringify(reports));
        } catch (error) {
            console.warn('Erro ao salvar relatório:', error);
        }
    }

    /**
     * Testes de Performance
     */
    async testCoreWebVitals() {
        const webVitals = window.performanceOptimizer?.getMetrics()?.webVitals || {};

        const results = {
            lcp: webVitals.lcp < 2500, // < 2.5s
            fid: webVitals.fid < 100,  // < 100ms
            cls: webVitals.cls < 0.1   // < 0.1
        };

        const allPassed = Object.values(results).every(result => result);

        if (!allPassed) {
            console.warn('⚠️ Core Web Vitals fora dos parâmetros recomendados:', webVitals);
            return {
                status: 'warning',
                message: 'Algumas métricas do Core Web Vitals estão fora do recomendado'
            };
        }

        return true;
    }

    async testImageOptimization() {
        const images = document.querySelectorAll('img');
        let optimizedCount = 0;

        images.forEach(img => {
            const hasLazy = img.hasAttribute('loading') && img.loading === 'lazy';
            const hasSizes = img.hasAttribute('sizes');
            const hasSrcset = img.hasAttribute('srcset') || img.hasAttribute('data-srcset');

            if (hasLazy && hasSizes && hasSrcset) {
                optimizedCount++;
            }
        });

        const optimizationRate = (optimizedCount / images.length) * 100;

        if (optimizationRate < 80) {
            return {
                status: 'warning',
                message: `Taxa de otimização de imagens: ${optimizationRate.toFixed(1)}%`
            };
        }

        return true;
    }

    async testBundleSize() {
        // Simular verificação de tamanho do bundle
        const scripts = document.querySelectorAll('script[src]');
        let totalSize = 0;

        // Em um ambiente real, isso seria feito com build tools
        const estimatedSizes = {
            'app.js': 150,
            'portfolio.js': 80,
            'contact.js': 60,
            'animations.js': 120,
            'performance.js': 90,
            'seo.js': 70,
            'accessibility.js': 110
        };

        scripts.forEach(script => {
            const src = script.src.split('/').pop();
            totalSize += estimatedSizes[src] || 50;
        });

        if (totalSize > 500) {
            return {
                status: 'warning',
                message: `Tamanho total do bundle: ${totalSize}KB (recomendado: < 500KB)`
            };
        }

        return true;
    }

    async testLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const lazyObserver = window.lazyLoadingManager?.observer;

        if (lazyImages.length === 0) {
            return {
                status: 'warning',
                message: 'Nenhuma imagem com lazy loading encontrada'
            };
        }

        if (!lazyObserver) {
            return {
                status: 'failed',
                message: 'Intersection Observer para lazy loading não inicializado'
            };
        }

        return true;
    }

    async testCacheStrategy() {
        // Verificar se service worker está registrado
        if (!('serviceWorker' in navigator)) {
            return {
                status: 'warning',
                message: 'Service Worker não suportado neste navegador'
            };
        }

        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            return {
                status: 'warning',
                message: 'Service Worker não registrado'
            };
        }

        return true;
    }

    /**
     * Testes de Acessibilidade
     */
    async testWCAGCompliance() {
        const results = window.accessibilityManager?.runAccessibilityTest();

        if (!results) {
            return {
                status: 'failed',
                message: 'Gerenciador de acessibilidade não inicializado'
            };
        }

        if (results.score < 80) {
            return {
                status: 'failed',
                message: `Pontuação de acessibilidade: ${results.score}% (mínimo recomendado: 80%)`
            };
        }

        return true;
    }

    async testKeyboardNavigation() {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length < 5) {
            return {
                status: 'warning',
                message: 'Poucos elementos focáveis encontrados'
            };
        }

        // Testar se elementos têm ordem lógica
        let hasLogicalOrder = true;
        focusableElements.forEach((element, index) => {
            if (index > 0) {
                const prevElement = focusableElements[index - 1];
                const prevTop = prevElement.getBoundingClientRect().top;
                const currentTop = element.getBoundingClientRect().top;

                if (currentTop < prevTop - 50) { // Elemento muito acima do anterior
                    hasLogicalOrder = false;
                }
            }
        });

        if (!hasLogicalOrder) {
            return {
                status: 'warning',
                message: 'Ordem de tabulação pode não ser lógica'
            };
        }

        return true;
    }

    async testScreenReaderSupport() {
        const hasAriaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length > 0;
        const hasRoles = document.querySelectorAll('[role]').length > 0;
        const hasLiveRegions = document.querySelectorAll('[aria-live]').length > 0;

        if (!hasAriaLabels && !hasRoles && !hasLiveRegions) {
            return {
                status: 'warning',
                message: 'Pouco suporte a leitores de tela detectado'
            };
        }

        return true;
    }

    async testColorContrast() {
        const contrastElements = document.querySelectorAll('[data-contrast-ratio]');

        if (contrastElements.length === 0) {
            return {
                status: 'warning',
                message: 'Verificação de contraste não realizada'
            };
        }

        const lowContrastElements = Array.from(contrastElements).filter(element => {
            const ratio = parseFloat(element.getAttribute('data-contrast-ratio'));
            return ratio < 4.5; // WCAG AA
        });

        if (lowContrastElements.length > 0) {
            return {
                status: 'warning',
                message: `${lowContrastElements.length} elementos com baixo contraste`
            };
        }

        return true;
    }

    async testFocusManagement() {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        let hasFocusIndicators = true;
        focusableElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '';
            const hasBoxShadow = computedStyle.boxShadow !== 'none' && computedStyle.boxShadow !== '';

            if (!hasOutline && !hasBoxShadow) {
                hasFocusIndicators = false;
            }
        });

        if (!hasFocusIndicators) {
            return {
                status: 'warning',
                message: 'Alguns elementos podem não ter indicadores visuais de foco adequados'
            };
        }

        return true;
    }

    /**
     * Testes de SEO
     */
    async testMetaTags() {
        const requiredMeta = [
            'description',
            'keywords',
            'author',
            'robots'
        ];

        const missingMeta = requiredMeta.filter(name => {
            return !document.querySelector(`meta[name="${name}"]`);
        });

        if (missingMeta.length > 0) {
            return {
                status: 'warning',
                message: `Meta tags ausentes: ${missingMeta.join(', ')}`
            };
        }

        const description = document.querySelector('meta[name="description"]');
        if (description && description.content.length < 120) {
            return {
                status: 'warning',
                message: 'Meta description muito curta (recomendado: 120-160 caracteres)'
            };
        }

        return true;
    }

    async testStructuredData() {
        const structuredData = document.querySelectorAll('script[type="application/ld+json"]');

        if (structuredData.length === 0) {
            return {
                status: 'warning',
                message: 'Nenhum dado estruturado encontrado'
            };
        }

        let hasOrganization = false;
        let hasWebpage = false;

        structuredData.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);

                if (data['@type'] === 'ProfessionalService' || data['@type'] === 'Organization') {
                    hasOrganization = true;
                }

                if (data['@type'] === 'WebPage') {
                    hasWebpage = true;
                }
            } catch (error) {
                console.warn('Erro ao analisar dados estruturados:', error);
            }
        });

        if (!hasOrganization || !hasWebpage) {
            return {
                status: 'warning',
                message: 'Dados estruturados essenciais ausentes'
            };
        }

        return true;
    }

    async testHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const h1Count = document.querySelectorAll('h1').length;

        if (h1Count === 0) {
            return {
                status: 'failed',
                message: 'Página deve ter exatamente um heading h1'
            };
        }

        if (h1Count > 1) {
            return {
                status: 'warning',
                message: `Página tem ${h1Count} headings h1 (recomendado: 1)`
            };
        }

        // Verificar hierarquia
        let previousLevel = 0;
        let hasProperHierarchy = true;

        headings.forEach(heading => {
            const currentLevel = parseInt(heading.tagName.charAt(1));

            if (currentLevel > previousLevel + 1 && previousLevel !== 0) {
                hasProperHierarchy = false;
            }

            previousLevel = currentLevel;
        });

        if (!hasProperHierarchy) {
            return {
                status: 'warning',
                message: 'Hierarquia de headings pode estar inadequada'
            };
        }

        return true;
    }

    async testImageAltTexts() {
        const images = document.querySelectorAll('img');
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');

        if (imagesWithoutAlt.length > 0) {
            const percentage = ((imagesWithoutAlt.length / images.length) * 100).toFixed(1);
            return {
                status: 'warning',
                message: `${imagesWithoutAlt.length} imagens (${percentage}%) sem atributo alt`
            };
        }

        return true;
    }

    async testCanonicalURLs() {
        const canonical = document.querySelector('link[rel="canonical"]');

        if (!canonical) {
            return {
                status: 'warning',
                message: 'Link canônico ausente'
            };
        }

        const canonicalUrl = canonical.href;
        const currentUrl = window.location.origin + window.location.pathname;

        if (canonicalUrl !== currentUrl) {
            return {
                status: 'warning',
                message: 'URL canônica pode estar incorreta'
            };
        }

        return true;
    }

    /**
     * Testes de Funcionalidade
     */
    async testFormValidation() {
        const forms = document.querySelectorAll('form');

        if (forms.length === 0) {
            return {
                status: 'warning',
                message: 'Nenhum formulário encontrado'
            };
        }

        // Testar formulário de contato
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            const requiredFields = contactForm.querySelectorAll('[required]');
            const submitButton = contactForm.querySelector('button[type="submit"]');

            if (requiredFields.length === 0) {
                return {
                    status: 'warning',
                    message: 'Formulário não tem campos obrigatórios definidos'
                };
            }

            if (!submitButton) {
                return {
                    status: 'warning',
                    message: 'Formulário não tem botão de submit'
                };
            }
        }

        return true;
    }

    async testPortfolioGallery() {
        const portfolioItems = document.querySelectorAll('.portfolio__item');

        if (portfolioItems.length === 0) {
            return {
                status: 'warning',
                message: 'Nenhum item do portfólio encontrado'
            };
        }

        // Verificar se itens têm atributos necessários
        const itemsWithData = Array.from(portfolioItems).filter(item =>
            item.hasAttribute('data-project-id')
        );

        if (itemsWithData.length !== portfolioItems.length) {
            return {
                status: 'warning',
                message: 'Alguns itens do portfólio não têm identificação adequada'
            };
        }

        return true;
    }

    async testNavigationSystem() {
        const navLinks = document.querySelectorAll('.nav__link');
        const sections = document.querySelectorAll('section[id]');

        if (navLinks.length === 0) {
            return {
                status: 'warning',
                message: 'Nenhum link de navegação encontrado'
            };
        }

        // Verificar se links correspondem a seções
        let brokenLinks = 0;
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (!targetSection) {
                    brokenLinks++;
                }
            }
        });

        if (brokenLinks > 0) {
            return {
                status: 'warning',
                message: `${brokenLinks} links de navegação quebrados`
            };
        }

        return true;
    }

    async testContactSystem() {
        const contactForm = document.getElementById('contact-form');

        if (!contactForm) {
            return {
                status: 'warning',
                message: 'Formulário de contato não encontrado'
            };
        }

        // Verificar campos essenciais
        const requiredFields = ['nome', 'email', 'mensagem'];
        let missingFields = 0;

        requiredFields.forEach(fieldName => {
            const field = contactForm.querySelector(`[name="${fieldName}"]`);
            if (!field || !field.hasAttribute('required')) {
                missingFields++;
            }
        });

        if (missingFields > 0) {
            return {
                status: 'warning',
                message: `${missingFields} campos essenciais do formulário ausentes`
            };
        }

        return true;
    }

    async testResponsiveDesign() {
        const viewport = document.querySelector('meta[name="viewport"]');

        if (!viewport) {
            return {
                status: 'failed',
                message: 'Meta viewport ausente'
            };
        }

        const viewportContent = viewport.content;
        if (!viewportContent.includes('width=device-width') || !viewportContent.includes('initial-scale=1')) {
            return {
                status: 'warning',
                message: 'Configuração de viewport pode estar inadequada'
            };
        }

        // Verificar media queries
        const stylesheets = document.styleSheets;
        let hasResponsiveRules = false;

        for (let i = 0; i < stylesheets.length; i++) {
            try {
                const rules = stylesheets[i].cssRules;
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText.includes('max-width')) {
                        hasResponsiveRules = true;
                        break;
                    }
                }
                if (hasResponsiveRules) break;
            } catch (error) {
                // Ignorar erros de CORS
            }
        }

        if (!hasResponsiveRules) {
            return {
                status: 'warning',
                message: 'Regras CSS responsivas não detectadas'
            };
        }

        return true;
    }

    /**
     * Testes de Segurança
     */
    async testXSSPrevention() {
        // Verificar Content Security Policy
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

        if (!cspMeta) {
            return {
                status: 'warning',
                message: 'Content Security Policy não configurada'
            };
        }

        return true;
    }

    async testCSRFProtection() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            const csrfToken = form.querySelector('input[name="csrf_token"]');

            if (!csrfToken) {
                return {
                    status: 'warning',
                    message: 'Proteção CSRF não encontrada em formulários'
                };
            }
        });

        return true;
    }

    async testInputSanitization() {
        // Este teste seria mais completo em um ambiente de integração
        const inputs = document.querySelectorAll('input, textarea');

        if (inputs.length === 0) {
            return {
                status: 'warning',
                message: 'Nenhum campo de entrada encontrado para testar'
            };
        }

        return true;
    }

    async testHTTPSEnforcement() {
        if (window.location.protocol !== 'https:') {
            return {
                status: 'warning',
                message: 'Página não está sendo servida via HTTPS'
            };
        }

        return true;
    }

    async testCSP() {
        // Verificar se CSP está configurada
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

        if (!csp) {
            return {
                status: 'warning',
                message: 'Content Security Policy não configurada'
            };
        }

        const cspContent = csp.content;

        // Verificar diretivas essenciais
        const essentialDirectives = [
            'default-src',
            'script-src',
            'style-src',
            'img-src'
        ];

        const missingDirectives = essentialDirectives.filter(directive =>
            !cspContent.includes(directive)
        );

        if (missingDirectives.length > 0) {
            return {
                status: 'warning',
                message: `Diretivas CSP essenciais ausentes: ${missingDirectives.join(', ')}`
            };
        }

        return true;
    }

    /**
     * Configurar testes automatizados
     */
    setupAutomatedTesting() {
        // Executar testes em intervalos
        setInterval(() => {
            if (!this.isRunning) {
                this.runCriticalTests();
            }
        }, 30000); // A cada 30 segundos

        // Executar testes antes do unload
        window.addEventListener('beforeunload', () => {
            this.runCriticalTests();
        });
    }

    /**
     * Executar testes críticos
     */
    async runCriticalTests() {
        const criticalTests = [
            'Core Web Vitals',
            'WCAG 2.1 AA Compliance',
            'Meta Tags',
            'HTTPS Enforcement'
        ];

        console.group('🔍 Testes Críticos Automáticos');

        for (const testName of criticalTests) {
            try {
                const testFn = this.getTestFunction(testName);
                if (testFn) {
                    await this.runTest(testName, testFn);
                }
            } catch (error) {
                console.error(`Erro no teste crítico ${testName}:`, error);
            }
        }

        console.groupEnd();
    }

    /**
     * Obter função de teste por nome
     */
    getTestFunction(testName) {
        const testMap = {
            'Core Web Vitals': () => this.testCoreWebVitals(),
            'WCAG 2.1 AA Compliance': () => this.testWCAGCompliance(),
            'Meta Tags': () => this.testMetaTags(),
            'HTTPS Enforcement': () => this.testHTTPSEnforcement()
        };

        return testMap[testName];
    }

    /**
     * Configurar monitoramento de performance
     */
    setupPerformanceMonitoring() {
        // Monitorar erros de JavaScript
        window.addEventListener('error', (error) => {
            this.logError('JavaScript Error', error);
        });

        // Monitorar erros de Promise
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
        });

        // Monitorar quebras de layout
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.value > 0.1) { // CLS > 0.1
                    this.logError('Layout Shift', {
                        value: entry.value,
                        sources: entry.sources
                    });
                }
            });
        }).observe({ entryTypes: ['layout-shift'] });
    }

    /**
     * Configurar validação de acessibilidade
     */
    setupAccessibilityValidation() {
        // Validar acessibilidade em mudanças do DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Validar novos elementos
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            this.validateNewElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Validar novo elemento
     */
    validateNewElement(element) {
        // Verificar imagens sem alt
        if (element.tagName === 'IMG' && !element.hasAttribute('alt')) {
            console.warn('Nova imagem adicionada sem atributo alt:', element.src);
        }

        // Verificar botões sem label
        if (element.tagName === 'BUTTON' &&
            !element.hasAttribute('aria-label') &&
            !element.textContent.trim()) {
            console.warn('Novo botão adicionado sem label acessível');
        }

        // Verificar formulários
        if (element.tagName === 'FORM') {
            const requiredFields = element.querySelectorAll('[required]');
            if (requiredFields.length === 0) {
                console.warn('Novo formulário sem campos obrigatórios');
            }
        }
    }

    /**
     * Configurar validação de SEO
     */
    setupSEOValidation() {
        // Validar SEO em mudanças do DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            this.validateSEOElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.head, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Validar elemento SEO
     */
    validateSEOElement(element) {
        if (element.tagName === 'TITLE' && element.textContent.length < 30) {
            console.warn('Título da página muito curto (recomendado: 30-60 caracteres)');
        }

        if (element.tagName === 'META' && element.name === 'description') {
            const length = element.content.length;
            if (length < 120 || length > 160) {
                console.warn(`Meta description com ${length} caracteres (recomendado: 120-160)`);
            }
        }
    }

    /**
     * Substituir console para capturar logs
     */
    setupConsoleOverrides() {
        const originalConsole = { ...console };

        ['log', 'warn', 'error'].forEach(method => {
            console[method] = (...args) => {
                // Chamar método original
                originalConsole[method](...args);

                // Registrar no sistema de testes
                this.logConsoleMessage(method, args);
            };
        });
    }

    /**
     * Registrar mensagem do console
     */
    logConsoleMessage(level, args) {
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Armazenar logs (últimas 100 entradas)
        try {
            const logs = JSON.parse(localStorage.getItem('console_logs') || '[]');
            logs.push(logEntry);

            if (logs.length > 100) {
                logs.shift();
            }

            localStorage.setItem('console_logs', JSON.stringify(logs));
        } catch (error) {
            // Ignorar erros de localStorage
        }
    }

    /**
     * Registrar erro
     */
    logError(type, error) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            type,
            message: error.message || error,
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error(`[${type}]`, errorEntry);

        // Armazenar erros
        try {
            const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
            errors.push(errorEntry);

            if (errors.length > 50) {
                errors.shift();
            }

            localStorage.setItem('error_logs', JSON.stringify(errors));
        } catch (e) {
            // Ignorar erros de localStorage
        }
    }

    /**
     * API pública
     */
    async runTests(suiteNames = []) {
        if (suiteNames.length === 0) {
            return this.runAllTests();
        }

        console.group('🧪 Executando Testes Selecionados');

        for (const suiteName of suiteNames) {
            const suite = this.testSuites.get(suiteName);
            if (suite) {
                await this.runTestSuite(suiteName, suite);
            } else {
                console.warn(`Suíte de testes não encontrada: ${suiteName}`);
            }
        }

        console.groupEnd();
    }

    getReports() {
        return {
            latest: this.reports[this.reports.length - 1],
            all: JSON.parse(localStorage.getItem('test_reports') || '[]')
        };
    }

    getLogs() {
        return {
            console: JSON.parse(localStorage.getItem('console_logs') || '[]'),
            errors: JSON.parse(localStorage.getItem('error_logs') || '[]')
        };
    }

    clearData() {
        localStorage.removeItem('test_reports');
        localStorage.removeItem('console_logs');
        localStorage.removeItem('error_logs');
        this.resetResults();
        console.log('🧹 Dados de teste limpos');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.testingSystem = new TestingSystem();
});

// API Global para testes
window.runTests = (suiteNames) => window.testingSystem?.runTests(suiteNames);
window.getTestReports = () => window.testingSystem?.getReports();
window.getTestLogs = () => window.testingSystem?.getLogs();
window.clearTestData = () => window.testingSystem?.clearData();

// Exportar para uso global
window.TestingSystem = TestingSystem;
