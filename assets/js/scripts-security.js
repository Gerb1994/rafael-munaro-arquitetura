/**
 * RAFAEL MUNARO ARQUITETURA - SISTEMA DE SEGURANÇA
 * Proteções avançadas contra vulnerabilidades comuns
 */

'use strict'; // Strict mode para prevenir erros comuns

class SecurityManager {
    constructor() {
        this.init();
        this.csrfToken = this.generateCSRFToken();
        this.rateLimiter = new RateLimiter();
        this.inputValidator = new InputValidator();
        this.environmentDetector = new EnvironmentDetector();
    // Flag de ambiente para aplicar endurecimentos apenas em dev
    this.isDev = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    }

    init() {
        this.setupCSP();
        this.setupSecureHeaders();
        this.preventCommonAttacks();
        this.setupErrorHandling();
        this.validateEnvironment();
    }

    /**
     * CONFIGURAÇÃO DE CONTENT SECURITY POLICY
     */
    setupCSP() {
        // Adicionar meta tag CSP se não existir
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const cspMeta = document.createElement('meta');
            cspMeta.httpEquiv = 'Content-Security-Policy';
            cspMeta.content = `
                default-src 'self';
                script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com;
                style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
                font-src 'self' https://fonts.gstatic.com;
                img-src 'self' data: https: blob:;
                connect-src 'self' https://api.unsplash.com;
                frame-src 'none';
                object-src 'none';
                base-uri 'self';
                form-action 'self';
                upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim();
            document.head.appendChild(cspMeta);
        }
    }

    /**
     * CONFIGURAÇÃO DE HEADERS DE SEGURANÇA
     */
    setupSecureHeaders() {
        // Adicionar headers de segurança via meta tags
        const securityHeaders = [
            { name: 'X-Frame-Options', value: 'DENY' },
            { name: 'X-Content-Type-Options', value: 'nosniff' },
            { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { name: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' }
        ];

        securityHeaders.forEach(header => {
            if (!document.querySelector(`meta[name="${header.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = header.name;
                meta.content = header.value;
                document.head.appendChild(meta);
            }
        });
    }

    /**
     * PREVENÇÃO DE ATAQUES COMUNS
     */
    preventCommonAttacks() {
        // Prevenir clickjacking
        if (window.self !== window.top) {
            window.top.location = window.self.location;
        }

        // IMPORTANTE: Evitar modificar/deletar APIs nativas em produção, pois
        // isso pode quebrar bibliotecas (GSAP, Three.js) e gerar erros globais.
        // Em vez disso, aplicamos endurecimentos leves e somente em dev quando útil.

        if (this.isDev) {
            // Endurecimentos leves e seguros (protegidos por try/catch)
            try { /* eslint-disable no-new-func */
                // Bloquear uso ingênuo de new Function/execScript quando acessados via window
                // (não impede eval direto, mas ajuda durante depuração)
                if (typeof window.execScript === 'function') {
                    window.execScript = function() { console.warn('execScript bloqueado em dev'); };
                }
            } catch (e) {}

            // Evitar deletes/binds em strict mode que geram TypeError
            // NUNCA deletar window.Function/window.eval/toString (não-configuráveis)
            // Mantido propositalmente sem ação aqui.

            // Opcional: congelar protótipos apenas em dev para detectar mutações indevidas
            try { Object.freeze(Object.prototype); } catch (e) {}
            try { Object.freeze(Array.prototype); } catch (e) {}
            try { Object.freeze(Function.prototype); } catch (e) {}
        }

        // Prevenir data exfiltration via error messages
        this.preventErrorExfiltration();
    }

    /**
     * PREVENÇÃO DE EXFILTRAÇÃO DE DADOS VIA ERROS
     */
    preventErrorExfiltration() {
        const originalError = console.error;
        console.error = function(...args) {
            // Sanitizar mensagens de erro antes de logar
            const sanitizedArgs = args.map(arg => {
                if (typeof arg === 'string') {
                    // Remover informações sensíveis
                    return arg.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '[EMAIL REDACTED]')
                             .replace(/(password|token|key|secret)[\s]*[:=][\s]*[^\s]+/gi, '$1: [REDACTED]')
                             .replace(/(\d{4}[-]\d{4}[-]\d{4}[-]\d{4})/g, '[CARD REDACTED]');
                }
                return arg;
            });
            originalError.apply(console, sanitizedArgs);
        };
    }

    /**
     * TRATAMENTO SEGURO DE ERROS
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            // Não expor stack traces ou informações sensíveis
            console.error('Erro detectado:', event.message, 'em', event.filename, 'linha', event.lineno);

            // Ignorar erros de scripts externos bloqueados por rede/CORS e erros de animações comuns
            const msg = String(event.message || '').toLowerCase();
            if (msg.includes('script error') || msg.includes('resizeobserver') || msg.includes('gsap')) {
                return;
            }

            // Enviar relatório de erro anonimizado (se necessário)
            this.sendErrorReport({
                message: event.message,
                filename: event.filename.split('/').pop(), // Apenas nome do arquivo
                lineno: event.lineno,
                timestamp: Date.now(),
                userAgent: navigator.userAgent.substring(0, 100), // Limitar tamanho
                url: window.location.pathname // Apenas path, não query params
            });

            // Em dev, podemos prevenir o default; em produção, manter comportamento padrão
            if (this.isDev) {
                event.preventDefault();
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada:', event.reason);
            event.preventDefault();
        });
    }

    /**
     * GERAÇÃO DE TOKEN CSRF
     */
    generateCSRFToken() {
        const token = btoa(Math.random().toString() + Date.now().toString());
        sessionStorage.setItem('csrf_token', token);
        return token;
    }

    /**
     * VALIDAÇÃO DE AMBIENTE
     */
    validateEnvironment() {
        // Verificar se está rodando em HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            console.warn('Aviso: Site não está rodando em HTTPS. Algumas funcionalidades podem não funcionar corretamente.');
        }

        // Verificar se há tentativas de injection
        if (window.location.search.includes('<script>') ||
            window.location.hash.includes('<script>') ||
            document.cookie.includes('<script>')) {
            console.error('Tentativa de XSS detectada!');
            window.location.href = '/';
        }
    }

    /**
     * ENVIO SEGURO DE RELATÓRIO DE ERRO
     */
    sendErrorReport(errorData) {
        // Apenas enviar se o usuário permitiu analytics
        if (!localStorage.getItem('analytics_enabled')) return;

        // Usar uma abordagem segura para envio
        const reportUrl = '/api/error-report';

        fetch(reportUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken
            },
            body: JSON.stringify(errorData),
            credentials: 'same-origin'
        }).catch(() => {
            // Silently fail se não conseguir enviar
        });
    }

    /**
     * VALIDAÇÃO DE INTEGRIDADE DE SCRIPTS
     */
    validateScriptIntegrity() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src.includes('cdnjs.cloudflare.com') ||
                script.src.includes('fonts.googleapis.com')) {
                // Scripts externos confiáveis - adicionar SRI se possível
                if (!script.integrity) {
                    console.warn('Script externo sem integridade:', script.src);
                }
            }
        });
    }
}

/**
 * VALIDADOR DE ENTRADAS
 */
class InputValidator {
    constructor() {
        this.patterns = {
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            phone: /^\+?[\d\s\-\(\)]{10,}$/,
            name: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
            message: /^[\w\sÀ-ÿ.,!?\-\n]{10,1000}$/
        };
    }

    sanitize(input) {
        if (typeof input !== 'string') return '';

        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
            .trim();
    }

    validateEmail(email) {
        const sanitized = this.sanitize(email);
        return this.patterns.email.test(sanitized) ? sanitized : false;
    }

    validatePhone(phone) {
        const sanitized = this.sanitize(phone);
        return this.patterns.phone.test(sanitized) ? sanitized : false;
    }

    validateName(name) {
        const sanitized = this.sanitize(name);
        return this.patterns.name.test(sanitized) ? sanitized : false;
    }

    validateMessage(message) {
        const sanitized = this.sanitize(message);
        return this.patterns.message.test(sanitized) ? sanitized : false;
    }

    validateFormData(formData) {
        const validated = {};
        let isValid = true;

        for (const [key, value] of formData.entries()) {
            switch (key) {
                case 'nome':
                    validated[key] = this.validateName(value);
                    break;
                case 'email':
                    validated[key] = this.validateEmail(value);
                    break;
                case 'telefone':
                    validated[key] = this.validatePhone(value);
                    break;
                case 'mensagem':
                    validated[key] = this.validateMessage(value);
                    break;
                default:
                    validated[key] = this.sanitize(value);
            }

            if (!validated[key]) {
                isValid = false;
                console.warn(`Campo ${key} contém dados inválidos`);
            }
        }

        return isValid ? validated : false;
    }
}

/**
 * RATE LIMITER PARA PREVENIR ATAQUES DE FORÇA BRUTA
 */
class RateLimiter {
    constructor() {
        this.attempts = new Map();
        this.maxAttempts = 5;
        this.timeWindow = 15 * 60 * 1000; // 15 minutos
        this.blockDuration = 30 * 60 * 1000; // 30 minutos
    }

    canProceed(identifier) {
        const now = Date.now();
        const userAttempts = this.attempts.get(identifier) || [];

        // Limpar tentativas antigas
        const recentAttempts = userAttempts.filter(attempt => now - attempt < this.timeWindow);

        if (recentAttempts.length >= this.maxAttempts) {
            const lastAttempt = Math.max(...recentAttempts);
            if (now - lastAttempt < this.blockDuration) {
                return false; // Bloqueado
            }
        }

        // Registrar nova tentativa
        recentAttempts.push(now);
        this.attempts.set(identifier, recentAttempts);

        return true;
    }

    getRemainingTime(identifier) {
        const userAttempts = this.attempts.get(identifier) || [];
        if (userAttempts.length === 0) return 0;

        const lastAttempt = Math.max(...userAttempts);
        const now = Date.now();
        const timeSinceLastAttempt = now - lastAttempt;

        if (timeSinceLastAttempt < this.blockDuration) {
            return this.blockDuration - timeSinceLastAttempt;
        }

        return 0;
    }

    reset(identifier) {
        this.attempts.delete(identifier);
    }
}

/**
 * DETECTOR DE AMBIENTE
 */
class EnvironmentDetector {
    constructor() {
        this.isSecure = this.checkSecurity();
        this.isTrusted = this.checkTrust();
        this.environment = this.detectEnvironment();
    }

    checkSecurity() {
        return {
            https: window.location.protocol === 'https:',
            secureContext: window.isSecureContext,
            contentSecurityPolicy: this.hasCSP(),
            noMixedContent: !this.hasMixedContent()
        };
    }

    checkTrust() {
        const trustedDomains = [
            'rafaelmunaro.com',
            'localhost',
            '127.0.0.1'
        ];

        const currentDomain = window.location.hostname;
        return trustedDomains.some(domain =>
            currentDomain === domain || currentDomain.endsWith('.' + domain)
        );
    }

    hasCSP() {
        return document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
    }

    hasMixedContent() {
        const scripts = document.querySelectorAll('script[src]');
        return Array.from(scripts).some(script =>
            script.src.startsWith('http://') && window.location.protocol === 'https:'
        );
    }

    detectEnvironment() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'development';
        }
        if (window.location.hostname.includes('staging') || window.location.hostname.includes('dev')) {
            return 'staging';
        }
        return 'production';
    }

    getSecurityReport() {
        return {
            environment: this.environment,
            security: this.isSecure,
            trusted: this.isTrusted,
            recommendations: this.getRecommendations()
        };
    }

    getRecommendations() {
        const recommendations = [];

        if (!this.isSecure.https) {
            recommendations.push('Considere usar HTTPS para proteger dados sensíveis');
        }

        if (!this.isSecure.contentSecurityPolicy) {
            recommendations.push('Implemente Content Security Policy (CSP)');
        }

        if (this.isSecure.noMixedContent === false) {
            recommendations.push('Remova conteúdo misto (HTTP em HTTPS)');
        }

        if (!this.isTrusted) {
            recommendations.push('Verifique se o domínio é confiável');
        }

        return recommendations;
    }
}

/**
 * UTILITÁRIOS DE SEGURANÇA
 */
class SecurityUtils {
    static generateSecureId(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static hashString(str) {
        // Simple hash for client-side use (not for passwords!)
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }

    static encodeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static decodeHTML(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    }

    static validateOrigin(origin) {
        const allowedOrigins = [
            window.location.origin,
            'https://rafaelmunaro.com',
            'https://www.rafaelmunaro.com'
        ];

        return allowedOrigins.includes(origin);
    }

    static sanitizeURL(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                throw new Error('Protocolo inválido');
            }
            return parsed.href;
        } catch {
            return null;
        }
    }
}

// Inicializar sistema de segurança quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
    console.log('🛡️ Sistema de segurança inicializado');
});

// Exportar classes para uso global (se necessário)
window.SecurityManager = SecurityManager;
window.InputValidator = InputValidator;
window.RateLimiter = RateLimiter;
window.EnvironmentDetector = EnvironmentDetector;
window.SecurityUtils = SecurityUtils;
