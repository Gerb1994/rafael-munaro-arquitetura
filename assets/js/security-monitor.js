/**
 * RAFAEL MUNARO ARQUITETURA - SISTEMA DE MONITORAMENTO DE SEGURANÇA
 * Monitora tentativas de ataque e anomalias em tempo real
 */

'use strict';

class SecurityMonitor {
    constructor() {
        this.events = [];
        this.maxEvents = 100;
        this.alerts = new Map();
    this.isDev = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPeriodicChecks();
        this.loadStoredEvents();
        this.createSecurityDashboard();
    }

    /**
     * CONFIGURAÇÃO DE EVENT LISTENERS
     */
    setupEventListeners() {
        // Monitorar erros JavaScript
        window.addEventListener('error', (event) => {
            this.logEvent('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        // Monitorar promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logEvent('unhandled_promise_rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        // Monitorar tentativas de injeção XSS
        document.addEventListener('input', (event) => {
            if (this.detectXSSAttempt(event.target.value)) {
                this.logEvent('xss_attempt', {
                    field: event.target.name,
                    value: event.target.value,
                    element: event.target.tagName
                });
            }
        });

        // Monitorar mudanças no DOM suspeitas
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (this.detectDOMInjection(mutation)) {
                    this.logEvent('dom_injection_attempt', {
                        type: mutation.type,
                        target: mutation.target.tagName,
                        addedNodes: mutation.addedNodes.length
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'href', 'onclick']
        });

        // Monitorar tentativas de clickjacking
        if (window.self !== window.top) {
            this.logEvent('clickjacking_attempt', {
                topLocation: window.top.location.href,
                selfLocation: window.self.location.href
            });
        }

        // Monitorar CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            this.logEvent('csp_violation', {
                violatedDirective: event.violatedDirective,
                blockedURI: event.blockedURI,
                sourceFile: event.sourceFile,
                lineNumber: event.lineNumber
            });
        });
    }

    /**
     * VERIFICAÇÕES PERIÓDICAS
     */
    setupPeriodicChecks() {
        // Verificar integridade a cada 5 minutos
        setInterval(() => {
            this.performSecurityCheck();
        }, 5 * 60 * 1000);

        // Limpar eventos antigos a cada hora
        setInterval(() => {
            this.cleanupOldEvents();
        }, 60 * 60 * 1000);
    }

    /**
     * VERIFICAÇÃO DE SEGURANÇA PERIÓDICA
     */
    performSecurityCheck() {
        const checks = {
            https: window.location.protocol === 'https:',
            mixedContent: this.checkMixedContent(),
            externalScripts: this.checkExternalScripts(),
            insecureCookies: this.checkInsecureCookies(),
            evalUsage: this.detectEvalUsage()
        };

        const failedChecks = Object.entries(checks)
            .filter(([check, passed]) => !passed)
            .map(([check]) => check);

        if (failedChecks.length > 0) {
            this.logEvent('security_check_failed', {
                failedChecks: failedChecks,
                timestamp: new Date().toISOString()
            });
        }

        // Atualizar dashboard se existir
        this.updateSecurityDashboard(checks);
    }

    /**
     * FUNÇÕES DE DETECÇÃO
     */
    detectXSSAttempt(value) {
        if (typeof value !== 'string') return false;

        const patterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
            /eval\s*\(/gi,
            /Function\s*\(/gi
        ];

        return patterns.some(pattern => pattern.test(value));
    }

    detectDOMInjection(mutation) {
        if (mutation.type === 'childList') {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (this.detectXSSAttempt(node.outerHTML)) {
                        return true;
                    }
                }
            }
        }

        if (mutation.type === 'attributes') {
            const attributeValue = mutation.target.getAttribute(mutation.attributeName);
            if (this.detectXSSAttempt(attributeValue)) {
                return true;
            }
        }

        return false;
    }

    checkMixedContent() {
        const scripts = document.querySelectorAll('script[src]');
        const links = document.querySelectorAll('link[href]');
        const imgs = document.querySelectorAll('img[src]');

        const checkSources = (elements, attr) => {
            return Array.from(elements).some(el => {
                const src = el.getAttribute(attr);
                return src && src.startsWith('http://') && window.location.protocol === 'https:';
            });
        };

        return !(checkSources(scripts, 'src') || checkSources(links, 'href') || checkSources(imgs, 'src'));
    }

    checkExternalScripts() {
        const scripts = document.querySelectorAll('script[src]');
        return Array.from(scripts).every(script => {
            const src = script.getAttribute('src');
            if (!src) return true;

            // Verificar se tem SRI
            const hasIntegrity = script.hasAttribute('integrity');
            const hasCrossorigin = script.hasAttribute('crossorigin');

            if (src.includes('cdnjs.cloudflare.com') || src.includes('fonts.googleapis.com')) {
                return hasIntegrity && hasCrossorigin;
            }

            return true;
        });
    }

    checkInsecureCookies() {
        return document.cookie.split(';').every(cookie => {
            const [nameValue] = cookie.trim().split('=');
            return !nameValue.includes('session') || cookie.includes('Secure');
        });
    }

    detectEvalUsage() {
        // Verificar se eval foi redefinido
        return typeof window.eval === 'function' && window.eval !== eval;
    }

    /**
     * LOGGING DE EVENTOS
     */
    logEvent(type, details) {
        const event = {
            id: this.generateEventId(),
            type: type,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId(),
            details: details
        };

        this.events.unshift(event);

        // Manter apenas os eventos mais recentes
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(0, this.maxEvents);
        }

        // Armazenar localmente
        this.storeEvent(event);

        // Alertar se for evento crítico
    if (this.isCriticalEvent(type)) {
            this.handleCriticalEvent(event);
        }

        console.warn('Security Event Logged:', event);
    }

    isCriticalEvent(type) {
        const criticalEvents = [
            'xss_attempt',
            'dom_injection_attempt',
            'csp_violation',
            'clickjacking_attempt',
            'javascript_error'
        ];

        return criticalEvents.includes(type);
    }

    handleCriticalEvent(event) {
        // Mostrar alerta visual apenas em desenvolvimento para não impactar usuários
        if (this.isDev) {
            this.showSecurityAlert(event);
        }

        // Enviar relatório se disponível
        if (window.securityManager && window.securityManager.sendErrorReport) {
            window.securityManager.sendErrorReport(event);
        }
    }

    /**
     * DASHBOARD DE SEGURANÇA
     */
    createSecurityDashboard() {
        // Criar dashboard apenas em desenvolvimento
    if (this.isDev) {
            this.createDevDashboard();
        }
    }

    createDevDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'security-dashboard';
        dashboard.innerHTML = `
            <div class="security-dashboard-header">
                <h3>🛡️ Security Monitor</h3>
                <button class="security-dashboard-toggle">▼</button>
            </div>
            <div class="security-dashboard-content">
                <div class="security-status">
                    <div class="status-item">
                        <span class="status-label">HTTPS:</span>
                        <span class="status-value" id="https-status">Checking...</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">CSP:</span>
                        <span class="status-value" id="csp-status">Checking...</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Events:</span>
                        <span class="status-value" id="events-count">0</span>
                    </div>
                </div>
                <div class="security-events">
                    <h4>Recent Events:</h4>
                    <div id="events-list"></div>
                </div>
            </div>
        `;

        Object.assign(dashboard.style, {
            position: 'fixed',
            bottom: '0',
            right: '0',
            width: '300px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: '9999',
            border: '1px solid #333'
        });

        document.body.appendChild(dashboard);

        // Funcionalidade de toggle
        const toggleBtn = dashboard.querySelector('.security-dashboard-toggle');
        const content = dashboard.querySelector('.security-dashboard-content');

        toggleBtn.addEventListener('click', () => {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? '▼' : '▶';
        });
    }

    updateSecurityDashboard(checks) {
        const dashboard = document.getElementById('security-dashboard');
        if (!dashboard) return;

        const httpsStatus = dashboard.querySelector('#https-status');
        const cspStatus = dashboard.querySelector('#csp-status');
        const eventsCount = dashboard.querySelector('#events-count');
        const eventsList = dashboard.querySelector('#events-list');

        if (httpsStatus) httpsStatus.textContent = checks.https ? '✅' : '❌';
        if (cspStatus) cspStatus.textContent = this.hasCSP() ? '✅' : '❌';
        if (eventsCount) eventsCount.textContent = this.events.length;

        if (eventsList) {
            eventsList.innerHTML = this.events.slice(0, 5).map(event =>
                `<div class="event-item">
                    <span class="event-type">${event.type}</span>
                    <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>`
            ).join('');
        }
    }

    hasCSP() {
        return document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
    }

    /**
     * UTILITÁRIOS
     */
    generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('security_session_id');
        if (!sessionId) {
            sessionId = this.generateEventId();
            sessionStorage.setItem('security_session_id', sessionId);
        }
        return sessionId;
    }

    storeEvent(event) {
        try {
            const stored = JSON.parse(localStorage.getItem('security_events') || '[]');
            stored.unshift(event);
            if (stored.length > this.maxEvents) {
                stored.splice(this.maxEvents);
            }
            localStorage.setItem('security_events', JSON.stringify(stored));
        } catch (error) {
            console.warn('Failed to store security event:', error);
        }
    }

    loadStoredEvents() {
        try {
            const stored = JSON.parse(localStorage.getItem('security_events') || '[]');
            this.events = stored.concat(this.events);
            if (this.events.length > this.maxEvents) {
                this.events.splice(this.maxEvents);
            }
        } catch (error) {
            console.warn('Failed to load stored security events:', error);
        }
    }

    cleanupOldEvents() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        this.events = this.events.filter(event =>
            new Date(event.timestamp).getTime() > oneHourAgo
        );

        // Atualizar localStorage
        try {
            localStorage.setItem('security_events', JSON.stringify(this.events));
        } catch (error) {
            console.warn('Failed to cleanup security events:', error);
        }
    }

    showSecurityAlert(event) {
        const alert = document.createElement('div');
        alert.className = 'security-alert';
        alert.innerHTML = `
            <div class="security-alert-content">
                <span class="security-alert-icon">⚠️</span>
                <span class="security-alert-message">
                    Evento de segurança detectado: ${event.type}
                </span>
                <button class="security-alert-close">&times;</button>
            </div>
        `;

        Object.assign(alert.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '10000',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            maxWidth: '300px'
        });

        document.body.appendChild(alert);

        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 10000);

        // Botão de fechar
        const closeBtn = alert.querySelector('.security-alert-close');
        closeBtn.addEventListener('click', () => {
            alert.remove();
        });
    }

    /**
     * RELATÓRIO DE SEGURANÇA
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            totalEvents: this.events.length,
            eventsByType: this.events.reduce((acc, event) => {
                acc[event.type] = (acc[event.type] || 0) + 1;
                return acc;
            }, {}),
            recentEvents: this.events.slice(0, 10),
            securityStatus: {
                https: window.location.protocol === 'https:',
                csp: this.hasCSP(),
                mixedContent: this.checkMixedContent(),
                externalScripts: this.checkExternalScripts()
            }
        };

        console.log('Security Report:', report);
        return report;
    }
}

// Inicializar monitoramento quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.securityMonitor = new SecurityMonitor();

    // Adicionar função global para relatório
    window.generateSecurityReport = () => window.securityMonitor.generateReport();
});

// Exportar para uso global
window.SecurityMonitor = SecurityMonitor;
