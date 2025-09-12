/**
 * RAFAEL MUNARO ARQUITETURA - GERENCIADOR DE CONTATO
 * Sistema de formulário avançado com validação e segurança
 */

'use strict';

/**
 * Gerenciador de formulário de contato
 */
class ContactManager {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = this.form?.querySelector('.btn-submit');
        this.isSubmitting = false;
        this.validationRules = {};
        this.rateLimiter = new RateLimiter();
    }

    async init() {
        if (!this.form) return;

        this.setupValidation();
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupSecurity();
    }

    /**
     * Configurar validação
     */
    setupValidation() {
        this.validationRules = {
            nome: {
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[A-Za-zÀ-ÿ\s]+$/,
                message: {
                    required: 'Nome é obrigatório',
                    minLength: 'Nome deve ter pelo menos 2 caracteres',
                    maxLength: 'Nome deve ter no máximo 100 caracteres',
                    pattern: 'Nome deve conter apenas letras'
                }
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: {
                    required: 'E-mail é obrigatório',
                    pattern: 'Digite um e-mail válido'
                }
            },
            mensagem: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                message: {
                    required: 'Mensagem é obrigatória',
                    minLength: 'Mensagem deve ter pelo menos 10 caracteres',
                    maxLength: 'Mensagem deve ter no máximo 1000 caracteres'
                }
            },
            privacidade: {
                required: true,
                message: {
                    required: 'Você deve aceitar a política de privacidade'
                }
            }
        };
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Submissão do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Validação em tempo real
        this.form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('input', () => this.validateField(field));
            field.addEventListener('blur', () => this.validateField(field, true));
        });

        // Prevenção de colagem de conteúdo malicioso
        this.form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('paste', (e) => {
                setTimeout(() => this.sanitizeField(e.target), 0);
            });
        });

        // Checkbox de privacidade
        const privacyCheckbox = this.form.querySelector('input[name="privacidade"]');
        if (privacyCheckbox) {
            privacyCheckbox.addEventListener('change', () => this.updateSubmitButton());
        }
    }

    /**
     * Configurar acessibilidade
     */
    setupAccessibility() {
        // Labels e descrições
        this.form.querySelectorAll('input, textarea').forEach(field => {
            const label = this.form.querySelector(`label[for="${field.id}"]`);
            if (label) {
                field.setAttribute('aria-labelledby', label.id);
            }

            // Adicionar descrições de ajuda
            const helpText = field.getAttribute('aria-describedby');
            if (helpText) {
                const helpElement = document.getElementById(helpText);
                if (helpElement) {
                    field.setAttribute('aria-describedby', helpText);
                }
            }
        });

        // Estados de erro
        this.form.addEventListener('invalid', (e) => {
            e.preventDefault();
            this.showFieldError(e.target, 'Campo obrigatório ou inválido');
        });
    }

    /**
     * Configurar segurança
     */
    setupSecurity() {
        // Adicionar token CSRF
        this.csrfToken = this.generateCSRFToken();
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf_token';
        csrfInput.value = this.csrfToken;
        this.form.appendChild(csrfInput);

        // Monitorar tentativas de injeção
        this.form.addEventListener('submit', (e) => {
            if (this.detectInjectionAttempt()) {
                e.preventDefault();
                this.showSecurityError();
                return false;
            }
        });
    }

    /**
     * Gerar token CSRF
     */
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Detectar tentativas de injeção
     */
    detectInjectionAttempt() {
        const formData = new FormData(this.form);
        const suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
        ];

        for (const [key, value] of formData.entries()) {
            const stringValue = String(value);
            if (suspiciousPatterns.some(pattern => pattern.test(stringValue))) {
                console.warn(`Tentativa de injeção detectada no campo ${key}`);
                return true;
            }
        }

        return false;
    }

    /**
     * Sanitizar campo
     */
    sanitizeField(field) {
        const value = field.value;
        const sanitized = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
            .trim();

        if (sanitized !== value) {
            field.value = sanitized;
        }

        return sanitized;
    }

    /**
     * Validar campo individual
     */
    validateField(field, showErrors = false) {
        const rules = this.validationRules[field.name];
        if (!rules) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Sanitizar primeiro
        field.value = this.sanitizeField(field);

        // Verificar required
        if (rules.required && !value) {
            isValid = false;
            errorMessage = rules.message.required;
        }
        // Verificar minLength
        else if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message.minLength;
        }
        // Verificar maxLength
        else if (rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = rules.message.maxLength;
        }
        // Verificar pattern
        else if (rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message.pattern;
        }

        // Atualizar estado visual
        this.updateFieldState(field, isValid, showErrors ? errorMessage : '');

        return isValid;
    }

    /**
     * Atualizar estado visual do campo
     */
    updateFieldState(field, isValid, errorMessage = '') {
        const formGroup = field.closest('.form-group') || field.parentElement;
        const errorElement = formGroup.querySelector('.form-error');

        // Remover classes anteriores
        field.classList.remove('form-input--valid', 'form-input--invalid');
        formGroup.classList.remove('form-group--error');

        if (!isValid && errorMessage) {
            field.classList.add('form-input--invalid');
            formGroup.classList.add('form-group--error');

            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            }

            field.setAttribute('aria-invalid', 'true');
        } else if (field.value.trim() && isValid) {
            field.classList.add('form-input--valid');

            if (errorElement) {
                errorElement.style.display = 'none';
            }

            field.setAttribute('aria-invalid', 'false');
        }

        this.updateSubmitButton();
    }

    /**
     * Atualizar botão de submit
     */
    updateSubmitButton() {
        if (!this.submitButton) return;

        const allFieldsValid = this.validateAllFields();
        const privacyAccepted = this.isPrivacyAccepted();

        this.submitButton.disabled = !allFieldsValid || !privacyAccepted;

        if (!allFieldsValid || !privacyAccepted) {
            this.submitButton.setAttribute('aria-describedby', 'submit-help');
        } else {
            this.submitButton.removeAttribute('aria-describedby');
        }
    }

    /**
     * Validar todos os campos
     */
    validateAllFields() {
        const fields = this.form.querySelectorAll('input[required], textarea[required]');
        return Array.from(fields).every(field => this.validateField(field));
    }

    /**
     * Verificar se privacidade foi aceita
     */
    isPrivacyAccepted() {
        const privacyCheckbox = this.form.querySelector('input[name="privacidade"]');
        return privacyCheckbox ? privacyCheckbox.checked : true;
    }

    /**
     * Manipular submissão do formulário
     */
    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        // Verificar rate limiting
        if (!this.rateLimiter.canProceed('form_submission')) {
            this.showRateLimitError();
            return;
        }

        // Validar todos os campos
        if (!this.validateAllFields()) {
            this.showNotification('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        // Verificar privacidade
        if (!this.isPrivacyAccepted()) {
            this.showNotification('Você deve aceitar a política de privacidade.', 'error');
            return;
        }

        this.isSubmitting = true;
        this.setFormState('loading');

        try {
            const formData = this.getFormData();
            const response = await this.submitForm(formData);

            if (response.success) {
                this.showSuccess();
            } else {
                throw new Error(response.message || 'Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('Erro no formulário:', error);
            this.showError(error.message);
        } finally {
            this.isSubmitting = false;
            this.setFormState('idle');
        }
    }

    /**
     * Obter dados do formulário
     */
    getFormData() {
        const formData = new FormData(this.form);
        return {
            nome: formData.get('nome')?.trim(),
            email: formData.get('email')?.trim(),
            mensagem: formData.get('mensagem')?.trim(),
            privacidade: formData.get('privacidade') === 'on',
            csrf_token: formData.get('csrf_token')
        };
    }

    /**
     * Enviar formulário
     */
    async submitForm(data) {
        // Simulação de envio - substitua pela implementação real
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular sucesso (90% das vezes)
                if (Math.random() > 0.1) {
                    resolve({
                        success: true,
                        message: 'Mensagem enviada com sucesso!'
                    });
                } else {
                    reject(new Error('Erro no servidor. Tente novamente.'));
                }
            }, 2000);
        });
    }

    /**
     * Atualizar estado do formulário
     */
    setFormState(state) {
        const btnText = this.submitButton.querySelector('.btn-text');
        const btnLoading = this.submitButton.querySelector('.btn-loading');

        switch (state) {
            case 'loading':
                this.submitButton.disabled = true;
                btnText.style.opacity = '0';
                btnLoading.style.display = 'inline-flex';
                this.submitButton.setAttribute('aria-describedby', 'loading-status');
                break;

            case 'idle':
                this.submitButton.disabled = false;
                btnText.style.opacity = '1';
                btnLoading.style.display = 'none';
                this.submitButton.removeAttribute('aria-describedby');
                break;
        }
    }

    /**
     * Mostrar sucesso
     */
    showSuccess() {
        this.showNotification('Mensagem enviada com sucesso! Retornaremos em breve.', 'success');
        this.form.reset();
        this.clearAllErrors();
        this.updateSubmitButton();
    }

    /**
     * Mostrar erro
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Mostrar erro de rate limit
     */
    showRateLimitError() {
        const remainingTime = Math.ceil(this.rateLimiter.getRemainingTime('form_submission') / 1000 / 60);
        this.showNotification(`Muitas tentativas. Tente novamente em ${remainingTime} minutos.`, 'error');
    }

    /**
     * Mostrar erro de segurança
     */
    showSecurityError() {
        this.showNotification('Tentativa de segurança detectada. Operação cancelada.', 'error');
    }

    /**
     * Limpar todos os erros
     */
    clearAllErrors() {
        this.form.querySelectorAll('.form-error').forEach(error => {
            error.style.display = 'none';
        });

        this.form.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('form-input--valid', 'form-input--invalid');
            input.setAttribute('aria-invalid', 'false');
        });

        this.form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('form-group--error');
        });
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'info') {
        if (window.app?.notifications) {
            window.app.notifications.show({
                message,
                type,
                duration: type === 'error' ? 7000 : 5000
            });
        } else {
            alert(message);
        }
    }
}

/**
 * Rate Limiter para formulários
 */
class RateLimiter {
    constructor() {
        this.attempts = new Map();
        this.maxAttempts = 3;
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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.contactManager = new ContactManager();
});

// Exportar para uso global
window.ContactManager = ContactManager;
window.RateLimiter = RateLimiter;
