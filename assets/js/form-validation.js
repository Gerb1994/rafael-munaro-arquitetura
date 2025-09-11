/**
 * RAFAEL MUNARO ARQUITETURA - VALIDAÇÃO AVANÇADA DE FORMULÁRIOS
 * Sistema de validação seguro com sanitização e proteção CSRF
 */

'use strict';

class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.csrfToken = this.generateCSRFToken();
        this.rateLimiter = new RateLimiter();
        this.inputValidator = new InputValidator();
        this.init();
    }

    init() {
        this.setupCSRFProtection();
        this.setupValidation();
        this.setupSecurityMonitoring();
        this.bindEvents();
    }

    /**
     * CONFIGURAÇÃO DE PROTEÇÃO CSRF
     */
    setupCSRFProtection() {
        // Adicionar token CSRF ao formulário
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf_token';
        csrfInput.value = this.csrfToken;
        this.form.appendChild(csrfInput);

        // Armazenar token no sessionStorage
        sessionStorage.setItem('csrf_token', this.csrfToken);
    }

    /**
     * GERAÇÃO DE TOKEN CSRF SEGURO
     */
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * CONFIGURAÇÃO DE VALIDAÇÃO
     */
    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Validação em tempo real
            input.addEventListener('input', (e) => {
                this.validateField(e.target);
            });

            // Validação ao perder foco
            input.addEventListener('blur', (e) => {
                this.validateField(e.target, true);
            });

            // Prevenção de colagem de conteúdo malicioso
            input.addEventListener('paste', (e) => {
                setTimeout(() => {
                    this.sanitizeField(e.target);
                }, 0);
            });
        });
    }

    /**
     * VALIDAÇÃO INDIVIDUAL DE CAMPO
     */
    validateField(field, showErrors = false) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Sanitização primeiro
        field.value = this.inputValidator.sanitize(value);

        // Validações específicas por campo
        switch (fieldName) {
            case 'nome':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Nome é obrigatório';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                } else if (!this.inputValidator.validateName(value)) {
                    isValid = false;
                    errorMessage = 'Nome contém caracteres inválidos';
                }
                break;

            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'E-mail é obrigatório';
                } else if (!this.inputValidator.validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'E-mail inválido';
                }
                break;

            case 'telefone':
                if (value && !this.inputValidator.validatePhone(value)) {
                    isValid = false;
                    errorMessage = 'Telefone inválido';
                }
                break;

            case 'mensagem':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Mensagem é obrigatória';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Mensagem deve ter pelo menos 10 caracteres';
                } else if (!this.inputValidator.validateMessage(value)) {
                    isValid = false;
                    errorMessage = 'Mensagem contém caracteres inválidos';
                }
                break;
        }

        // Atualizar estado visual do campo
        this.updateFieldState(field, isValid, showErrors ? errorMessage : '');

        return isValid;
    }

    /**
     * ATUALIZAÇÃO DO ESTADO VISUAL DO CAMPO
     */
    updateFieldState(field, isValid, errorMessage) {
        const formGroup = field.closest('.form__group');
        const errorElement = formGroup.querySelector('.form__error');

        // Remover classes anteriores
        field.classList.remove('form__input--valid', 'form__input--invalid');
        formGroup.classList.remove('form__group--error');

        if (!isValid && errorMessage) {
            field.classList.add('form__input--invalid');
            formGroup.classList.add('form__group--error');

            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            }
        } else if (field.value.trim() && isValid) {
            field.classList.add('form__input--valid');

            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    }

    /**
     * SANITIZAÇÃO DE CAMPO
     */
    sanitizeField(field) {
        const sanitized = this.inputValidator.sanitize(field.value);
        field.value = sanitized;
    }

    /**
     * CONFIGURAÇÃO DE MONITORAMENTO DE SEGURANÇA
     */
    setupSecurityMonitoring() {
        // Monitorar tentativas de injeção
        this.form.addEventListener('submit', (e) => {
            const formData = new FormData(this.form);
            const suspiciousPatterns = [
                /<script/i,
                /javascript:/i,
                /on\w+\s*=/i,
                /<iframe/i,
                /<object/i,
                /<embed/i
            ];

            for (const [key, value] of formData.entries()) {
                const stringValue = String(value);
                if (suspiciousPatterns.some(pattern => pattern.test(stringValue))) {
                    console.warn(`Tentativa de injeção detectada no campo ${key}`);
                    this.logSecurityEvent('injection_attempt', { field: key, value: stringValue });
                    e.preventDefault();
                    this.showSecurityAlert();
                    return false;
                }
            }
        });
    }

    /**
     * VINCULAÇÃO DE EVENTOS
     */
    bindEvents() {
        // Submissão do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Prevenção de múltiplas submissões
        let submitting = false;
        this.form.addEventListener('submit', (e) => {
            if (submitting) {
                e.preventDefault();
                return false;
            }
            submitting = true;

            setTimeout(() => {
                submitting = false;
            }, 3000);
        });
    }

    /**
     * TRATAMENTO DE SUBMISSÃO
     */
    async handleSubmit() {
        // Verificar rate limiting
        if (!this.rateLimiter.canProceed('form_submission')) {
            this.showRateLimitError();
            return;
        }

        // Validar todos os campos
        const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        let allValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input, true)) {
                allValid = false;
            }
        });

        if (!allValid) {
            this.showValidationError();
            return;
        }

        // Verificar checkbox de privacidade se existir
        const privacyCheckbox = this.form.querySelector('input[name="privacidade"]');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            this.showNotification('Você deve aceitar a política de privacidade', 'error');
            return;
        }

        // Mostrar loading
        this.setLoadingState(true);

        try {
            // Preparar dados sanitizados
            const formData = new FormData(this.form);
            const sanitizedData = this.inputValidator.validateFormData(formData);

            if (!sanitizedData) {
                throw new Error('Dados do formulário inválidos');
            }

            // Enviar formulário (simulado por enquanto)
            await this.submitForm(sanitizedData);

            // Sucesso
            this.showSuccessMessage();
            this.form.reset();
            this.clearValidationStates();

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            this.showErrorMessage(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * ENVIO DO FORMULÁRIO
     */
    async submitForm(data) {
        // Simulação de envio - substitua pela integração real
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular sucesso (90% das vezes)
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Erro no servidor'));
                }
            }, 2000);
        });
    }

    /**
     * UTILITÁRIOS DE INTERFACE
     */
    setLoadingState(loading) {
        const submitBtn = this.form.querySelector('.form__submit');
        const btnText = submitBtn.querySelector('.btn__text');

        if (loading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Enviando...';
            submitBtn.classList.add('btn--loading');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Enviar Mensagem';
            submitBtn.classList.remove('btn--loading');
        }
    }

    showNotification(message, type = 'info') {
        // Utilizar o sistema de notificações existente
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    showSuccessMessage() {
        this.showNotification('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message || 'Erro ao enviar mensagem. Tente novamente.', 'error');
    }

    showValidationError() {
        this.showNotification('Por favor, corrija os erros no formulário.', 'error');
    }

    showRateLimitError() {
        const remainingTime = Math.ceil(this.rateLimiter.getRemainingTime('form_submission') / 1000 / 60);
        this.showNotification(`Muitas tentativas. Tente novamente em ${remainingTime} minutos.`, 'error');
    }

    showSecurityAlert() {
        this.showNotification('Tentativa de segurança detectada. Operação cancelada.', 'error');
    }

    clearValidationStates() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('form__input--valid', 'form__input--invalid');
            const formGroup = input.closest('.form__group');
            formGroup.classList.remove('form__group--error');
            const errorElement = formGroup.querySelector('.form__error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    }

    /**
     * LOGGING DE EVENTOS DE SEGURANÇA
     */
    logSecurityEvent(eventType, details) {
        const eventData = {
            type: eventType,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            details: details
        };

        // Enviar para sistema de monitoramento (se disponível)
        if (window.securityManager && window.securityManager.sendErrorReport) {
            window.securityManager.sendErrorReport(eventData);
        }

        // Log local para debug
        console.warn('Security Event:', eventData);
    }
}

/**
 * RATE LIMITER PARA FORMULÁRIOS
 */
class RateLimiter {
    constructor() {
        this.attempts = new Map();
        this.maxAttempts = 3; // 3 tentativas por hora para formulários
        this.timeWindow = 60 * 60 * 1000; // 1 hora
    }

    canProceed(identifier) {
        const now = Date.now();
        const userAttempts = this.attempts.get(identifier) || [];

        // Limpar tentativas antigas
        const recentAttempts = userAttempts.filter(attempt => now - attempt < this.timeWindow);

        if (recentAttempts.length >= this.maxAttempts) {
            return false;
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

        if (timeSinceLastAttempt < this.timeWindow) {
            return this.timeWindow - timeSinceLastAttempt;
        }

        return 0;
    }
}

/**
 * VALIDADOR DE ENTRADAS AVANÇADO
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
            .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
            .replace(/<input\b[^<]*(?:(?!<\/input>)<[^<]*)*\/?>/gi, '')
            .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*\/?>/gi, '')
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
            const stringValue = String(value);
            switch (key) {
                case 'nome':
                    validated[key] = this.validateName(stringValue);
                    break;
                case 'email':
                    validated[key] = this.validateEmail(stringValue);
                    break;
                case 'telefone':
                    validated[key] = this.validatePhone(stringValue) || '';
                    break;
                case 'mensagem':
                    validated[key] = this.validateMessage(stringValue);
                    break;
                case 'tipo-projeto':
                    validated[key] = this.sanitize(stringValue);
                    break;
                case 'csrf_token':
                    validated[key] = stringValue; // Não sanitizar token CSRF
                    break;
                default:
                    validated[key] = this.sanitize(stringValue);
            }

            if (key !== 'telefone' && key !== 'csrf_token' && !validated[key]) {
                isValid = false;
                console.warn(`Campo ${key} contém dados inválidos`);
            }
        }

        return isValid ? validated : false;
    }
}

// Inicializar validação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        new FormValidator(contactForm);
    }
});

// Exportar para uso global
window.FormValidator = FormValidator;
window.InputValidator = InputValidator;
window.RateLimiter = RateLimiter;
