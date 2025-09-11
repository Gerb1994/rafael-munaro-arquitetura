/**
 * RAFAEL MUNARO ARQUITETURA - SCRIPTS AVANÇADOS COM SEGURANÇA
 * Sistema completo de interatividade e animações modernas com proteções de segurança
 */

'use strict'; // Strict mode para maior segurança

class RafaelMunaroSecureApp {
    constructor() {
        // Verificar se o sistema de segurança está carregado
        if (!window.securityManager) {
            console.error('❌ Sistema de segurança não encontrado! Abortando inicialização.');
            return;
        }

        this.security = window.securityManager;
        this.validator = this.security.inputValidator;
        this.rateLimiter = this.security.rateLimiter;

        this.init();
        this.bindEvents();
        this.setupObservers();
    }

    init() {
        // Verificar ambiente seguro antes de prosseguir
        const securityReport = this.security.environmentDetector.getSecurityReport();

        if (!securityReport.trusted) {
            console.warn('⚠️ Ambiente não confiável detectado. Algumas funcionalidades podem estar limitadas.');
        }

    // Inicializar componentes com validações de segurança
    this.initThreeJS();
    this.initGSAP();
        this.initParticles();
        this.initCursor();
        this.initScrollEffects();
        this.initFormValidation();

        // Start main animations directly
        this.startMainAnimations();
    }

    startMainAnimations() {
        // Se GSAP não estiver disponível, sair silenciosamente
        if (typeof window.gsap === 'undefined') {
            return;
        }

        // Timeline principal para animações coordenadas
        const mainTimeline = gsap.timeline({
            defaults: {
                ease: "power4.out",
                duration: 1.2
            }
        });

        // Animação do título com efeito de morphing
        const titleLines = gsap.utils.toArray('.hero__title-line');
        titleLines.forEach((line, index) => {
            const letters = line.textContent.split('');
            line.innerHTML = letters.map(letter =>
                `<span class="letter" style="display: inline-block;">${this.security.inputValidator.sanitize(letter)}</span>`
            ).join('');

            mainTimeline.from(line.querySelectorAll('.letter'), {
                y: 100,
                opacity: 0,
                rotateX: -90,
                duration: 1,
                stagger: 0.05,
                ease: "back.out(1.7)"
            }, index * 0.3);
        });

        // Animação do subtítulo com typewriter effect
        const subtitle = document.querySelector('.hero__subtitle');
        if (subtitle) {
            const originalText = this.security.inputValidator.sanitize(subtitle.textContent);
            subtitle.innerHTML = '<span class="typewriter-text"></span><span class="typewriter-cursor">|</span>';

            mainTimeline.add(() => {
                this.typeWriterEffect(subtitle.querySelector('.typewriter-text'), originalText, 50);
            }, "-=0.5");

            mainTimeline.from(subtitle, {
                y: 50,
                opacity: 0,
                scale: 0.9,
                duration: 0.5,
                ease: "power3.out"
            }, "-=0.5");
        }

        // Animação dos botões com efeitos de ripple
        mainTimeline.from('.hero__actions .btn', {
            y: 30,
            opacity: 0,
            scale: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)",
            onComplete: () => {
                // Adicionar efeito de pulsação contínua
                gsap.to('.hero__cta--primary', {
                    scale: 1.05,
                    duration: 2,
                    yoyo: true,
                    repeat: -1,
                    ease: "power2.inOut"
                });
            }
        }, "-=0.3");

        // Animação dos elementos flutuantes
        mainTimeline.from('.floating-element', {
            scale: 0,
            rotation: -180,
            opacity: 0,
            duration: 1.5,
            stagger: 0.1,
            ease: "elastic.out(1, 0.3)"
        }, "-=1");

        // Animação do scroll indicator
        mainTimeline.from('.hero__scroll', {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.5");

        // Iniciar animações de fundo
        this.startBackgroundAnimations();
    }

    initThreeJS() {
    // Verificações defensivas de WebGL/THREE
    const report = this.security.environmentDetector.getSecurityReport();
    if (!report || !report.security || !report.security.webgl || typeof window.THREE === 'undefined') {
            console.warn('WebGL não disponível em ambiente seguro');
            return;
        }

        const heroBg = document.getElementById('hero-bg');
        const canvas = document.getElementById('hero-canvas');

        if (!canvas) return;

        // Configuração Three.js básica com validações de segurança
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Criar geometria de fundo
        this.createBackgroundGeometry();

        // Animação
        this.animateThreeJS();

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initFormValidation() {
        const contactForm = document.getElementById('contact-form');

        if (!contactForm) return;

        const inputs = contactForm.querySelectorAll('input, textarea, select');

        // Validação em tempo real usando o sistema de segurança
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // Submit handler com validações de segurança
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const identifier = this.security.inputValidator.sanitize(formData.get('email') || 'anonymous');

            // Verificar rate limiting
            if (!this.rateLimiter.canProceed(identifier)) {
                const remainingTime = Math.ceil(this.rateLimiter.getRemainingTime(identifier) / 1000 / 60);
                this.enhancedNotification(`Muitas tentativas. Tente novamente em ${remainingTime} minutos.`, 'error');
                return;
            }

            let isValid = true;
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // Validar dados com o sistema de segurança
                const validatedData = this.validator.validateFormData(formData);
                if (validatedData) {
                    this.submitSecureForm(contactForm, validatedData);
                } else {
                    this.enhancedNotification('Dados do formulário inválidos. Verifique e tente novamente.', 'error');
                }
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Limpar erro anterior
        this.clearFieldError(field);

        switch (fieldName) {
            case 'nome':
                if (!value) {
                    errorMessage = 'Nome é obrigatório';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                    isValid = false;
                } else if (!this.validator.validateName(value)) {
                    errorMessage = 'Nome contém caracteres inválidos';
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'E-mail é obrigatório';
                    isValid = false;
                } else if (!this.validator.validateEmail(value)) {
                    errorMessage = 'E-mail inválido';
                    isValid = false;
                }
                break;

            case 'telefone':
                if (value && !this.validator.validatePhone(value)) {
                    errorMessage = 'Telefone inválido';
                    isValid = false;
                }
                break;

            case 'mensagem':
                if (!value) {
                    errorMessage = 'Mensagem é obrigatória';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Mensagem deve ter pelo menos 10 caracteres';
                    isValid = false;
                } else if (!this.validator.validateMessage(value)) {
                    errorMessage = 'Mensagem contém caracteres inválidos';
                    isValid = false;
                }
                break;

            case 'privacidade':
                if (!field.checked) {
                    errorMessage = 'Aceite a política de privacidade';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    async submitSecureForm(form, validatedData) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Loading state
        submitBtn.classList.add('btn--loading');
        submitBtn.disabled = true;

        try {
            // Adicionar CSRF token
            validatedData.csrf_token = this.security.csrfToken;

            // Enviar dados de forma segura
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.security.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(validatedData),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            // Success animation
            gsap.to(form, {
                scale: 0.98,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });

            this.enhancedNotification(result.message || 'Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            form.reset();

            // Reset rate limiter para este usuário
            const identifier = validatedData.email || 'anonymous';
            this.rateLimiter.reset(identifier);

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            this.enhancedNotification('Erro ao enviar mensagem. Tente novamente mais tarde.', 'error');
        } finally {
            submitBtn.classList.remove('btn--loading');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');

        let errorElement = field.parentNode.querySelector('.form__error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form__error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = this.validator.sanitize(message);
        errorElement.style.display = 'block';
    }

    clearFieldError(field) {
        field.classList.remove('error');

        const errorElement = field.parentNode.querySelector('.form__error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    enhancedNotification(message, type = 'info', options = {}) {
        return this.security.enhancedNotification(message, type, options);
    }

    typeWriterEffect(element, text, speed = 50) {
        let i = 0;
        const cursor = element.parentNode.querySelector('.typewriter-cursor');

        const typeWriter = () => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;

                // Cursor blink
                if (cursor) {
                    gsap.to(cursor, {
                        opacity: 0,
                        duration: 0.1,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.inOut"
                    });
                }

                setTimeout(typeWriter, speed);
            } else {
                // Final cursor fade
                if (cursor) {
                    gsap.to(cursor, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
            }
        };

        typeWriter();
    }

    createBackgroundGeometry() {
        // Sistema de partículas avançado com validações de segurança
        this.createParticleSystem();
        this.createOrganicGeometry();
        this.createLightEffects();

        this.camera.position.z = 5;
    }

    createParticleSystem() {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);

        // Paleta de cores premium
        const colorPalette = [
            new THREE.Color(0xB66C48),
            new THREE.Color(0x545943),
            new THREE.Color(0x9BA187),
            new THREE.Color(0x8C421E),
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Posições esferoidais
            const radius = Math.random() * 15 + 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Cores dinâmicas
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Tamanhos variados
            sizes[i] = Math.random() * 0.1 + 0.02;

            // Velocidades para movimento orgânico
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        // Shader material personalizado com validações
        const vertexShader = `
            attribute float size;
            attribute vec3 velocity;
            varying vec3 vColor;
            varying float vSize;

            void main() {
                vColor = color;
                vSize = size;

                vec3 pos = position;

                // Movimento orgânico baseado no tempo
                float time = mod(${Date.now()} * 0.001, 1000.0);
                pos += velocity * sin(time + position.x * 0.1) * 2.0;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const fragmentShader = `
            varying vec3 vColor;
            varying float vSize;

            void main() {
                float distance = length(gl_PointCoord - vec2(0.5));
                if (distance > 0.5) discard;

                float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                alpha *= vSize * 20.0;

                gl_FragColor = vec4(vColor, alpha);
            }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    // Placeholder methods - implementações seguras (no-op) até serem definidas
    createOrganicGeometry() { /* no-op */ }
    createLightEffects() { /* no-op */ }
    animateThreeJS() { /* no-op */ }
    initGSAP() { /* no-op */ }
    initParticles() { /* no-op */ }
    initCursor() { /* no-op */ }
    initScrollEffects() { /* no-op */ }
    bindEvents() { /* no-op */ }
    setupObservers() { /* no-op */ }
    startBackgroundAnimations() { /* no-op */ }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (window.securityManager) {
        new RafaelMunaroSecureApp();
        console.log('🚀 Rafael Munaro App inicializada com segurança máxima');
    } else {
        console.error('❌ Falha na inicialização: Sistema de segurança não encontrado');
    }
});
