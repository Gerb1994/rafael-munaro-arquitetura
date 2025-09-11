/**
 * STATE MANAGER - RAFAEL MUNARO ARQUITETURA
 * Sistema de gerenciamento de estado reativo
 */

class StateManager {
    constructor() {
        this.state = {};
        this.listeners = new Map();
        this.middlewares = [];
        this.plugins = [];
        this.init();
    }

    init() {
        this.loadPersistedState();
        this.setupAutoSave();
        this.setupEventDelegation();
    }

    /**
     * GERENCIAMENTO BÁSICO DE ESTADO
     */
    setState(updates, action = 'unknown') {
        const oldState = { ...this.state };
        const newState = { ...this.state, ...updates };

        // Aplicar middlewares
        const processedUpdates = this.applyMiddlewares(oldState, newState, action);

        // Atualizar estado
        this.state = { ...this.state, ...processedUpdates };

        // Notificar listeners
        this.notifyListeners(oldState, this.state, action);

        // Executar plugins
        this.executePlugins(oldState, this.state, action);

        console.log(`🔄 State updated: ${action}`, { oldState, newState: this.state });
    }

    getState() {
        return { ...this.state };
    }

    subscribe(listener, selector = null) {
        const id = Symbol('listener');
        this.listeners.set(id, { listener, selector });
        return () => this.listeners.delete(id);
    }

    /**
     * MIDDLEWARES
     */
    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }

    applyMiddlewares(oldState, newState, action) {
        return this.middlewares.reduce((updates, middleware) => {
            return middleware(oldState, updates, action);
        }, newState);
    }

    /**
     * PLUGINS
     */
    plugin(plugin) {
        this.plugins.push(plugin);
        return this;
    }

    executePlugins(oldState, newState, action) {
        this.plugins.forEach(plugin => {
            if (typeof plugin === 'function') {
                plugin(oldState, newState, action);
            }
        });
    }

    /**
     * PERSISTÊNCIA
     */
    loadPersistedState() {
        try {
            const persisted = localStorage.getItem('rafael-munaro-state');
            if (persisted) {
                const parsed = JSON.parse(persisted);
                this.state = { ...this.state, ...parsed };
                console.log('💾 State loaded from storage');
            }
        } catch (error) {
            console.warn('Failed to load persisted state:', error);
        }
    }

    saveState() {
        try {
            const stateToSave = this.getPersistableState();
            localStorage.setItem('rafael-munaro-state', JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    getPersistableState() {
        // Filtrar propriedades que devem ser persistidas
        const persistableKeys = ['theme', 'language', 'preferences', 'user'];
        const persistableState = {};

        persistableKeys.forEach(key => {
            if (this.state[key] !== undefined) {
                persistableState[key] = this.state[key];
            }
        });

        return persistableState;
    }

    setupAutoSave() {
        // Debounced save
        let saveTimeout;
        const debouncedSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => this.saveState(), 1000);
        };

        // Salvar automaticamente quando o estado muda
        this.subscribe(() => debouncedSave());

        // Salvar antes de fechar a página
        window.addEventListener('beforeunload', () => this.saveState());
    }

    /**
     * EVENTOS E AÇÕES
     */
    setupEventDelegation() {
        // Delegação de eventos para elementos com data-action
        document.addEventListener('click', (e) => {
            const actionElement = e.target.closest('[data-action]');
            if (actionElement) {
                const action = actionElement.dataset.action;
                const payload = actionElement.dataset.payload ?
                    JSON.parse(actionElement.dataset.payload) : {};

                this.dispatch(action, payload, e);
            }
        });

        // Suporte para formulários
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.dataset.action) {
                e.preventDefault();
                const formData = new FormData(form);
                const payload = Object.fromEntries(formData);
                this.dispatch(form.dataset.action, payload, e);
            }
        });
    }

    dispatch(action, payload = {}, event = null) {
        const actionType = action.toUpperCase().replace(/-/g, '_');

        switch (actionType) {
            case 'TOGGLE_THEME':
                this.toggleTheme();
                break;
            case 'SET_LANGUAGE':
                this.setLanguage(payload.language);
                break;
            case 'UPDATE_PREFERENCES':
                this.updatePreferences(payload);
                break;
            case 'RESET_STATE':
                this.resetState();
                break;
            default:
                // Ação customizada
                this.handleCustomAction(action, payload, event);
        }
    }

    /**
     * AÇÕES ESPECÍFICAS
     */
    toggleTheme() {
        const currentTheme = this.state.theme || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        this.setState({ theme: newTheme }, 'toggle-theme');
        this.applyTheme(newTheme);
    }

    setLanguage(language) {
        this.setState({ language }, 'set-language');
        this.applyLanguage(language);
    }

    updatePreferences(preferences) {
        const currentPrefs = this.state.preferences || {};
        const newPreferences = { ...currentPrefs, ...preferences };

        this.setState({ preferences: newPreferences }, 'update-preferences');
    }

    resetState() {
        const defaultState = this.getDefaultState();
        this.setState(defaultState, 'reset-state');
        this.saveState();
    }

    getDefaultState() {
        return {
            theme: 'light',
            language: 'pt-BR',
            preferences: {
                animations: true,
                notifications: true,
                analytics: false
            },
            user: null,
            navigation: {
                currentSection: 'home',
                scrollPosition: 0
            }
        };
    }

    /**
     * APLICAÇÃO DE ESTADO NA UI
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Atualizar elementos da UI
        const themeToggle = document.querySelector('.nav__theme-toggle');
        if (themeToggle) {
            themeToggle.setAttribute('data-current-theme', theme);
        }
    }

    applyLanguage(language) {
        document.documentElement.setAttribute('lang', language);

        // Aqui seria implementada a troca de idioma na interface
        console.log(`🌍 Language changed to: ${language}`);
    }

    /**
     * OBSERVADORES E NOTIFICAÇÕES
     */
    notifyListeners(oldState, newState, action) {
        this.listeners.forEach(({ listener, selector }) => {
            if (selector) {
                // Verificar se a mudança afeta o seletor
                const hasChanged = this.hasSelectorChanged(selector, oldState, newState);
                if (hasChanged) {
                    listener(newState, action);
                }
            } else {
                listener(newState, action);
            }
        });
    }

    hasSelectorChanged(selector, oldState, newState) {
        const keys = selector.split('.');
        let oldValue = oldState;
        let newValue = newState;

        for (const key of keys) {
            oldValue = oldValue?.[key];
            newValue = newValue?.[key];
        }

        return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    }

    /**
     * AÇÕES CUSTOMIZADAS
     */
    handleCustomAction(action, payload, event) {
        // Disparar evento customizado
        const customEvent = new CustomEvent('stateAction', {
            detail: { action, payload, event }
        });
        document.dispatchEvent(customEvent);

        console.log(`🎯 Custom action dispatched: ${action}`, payload);
    }

    /**
     * UTILITÁRIOS
     */
    get(path = '') {
        if (!path) return this.getState();

        const keys = path.split('.');
        let value = this.state;

        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) break;
        }

        return value;
    }

    set(path, value, action = 'set-path') {
        const keys = path.split('.');
        const updates = {};
        let current = updates;

        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = {};
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        this.setState(updates, action);
    }

    /**
     * INTEGRAÇÃO COM OUTROS SISTEMAS
     */
    connectTo(component) {
        // Método para conectar componentes reativos
        if (component && typeof component.update === 'function') {
            return this.subscribe((state) => component.update(state));
        }
    }

    /**
     * DEBUGGING
     */
    debug() {
        console.group('🔍 State Manager Debug');
        console.log('Current State:', this.state);
        console.log('Active Listeners:', this.listeners.size);
        console.log('Middlewares:', this.middlewares.length);
        console.log('Plugins:', this.plugins.length);
        console.groupEnd();
    }
}

// Middlewares úteis
const loggerMiddleware = (oldState, newState, action) => {
    console.log(`📝 [${action}]`, { oldState, newState });
    return newState;
};

const validationMiddleware = (oldState, newState, action) => {
    // Validações básicas do estado
    if (newState.theme && !['light', 'dark'].includes(newState.theme)) {
        console.warn('Invalid theme value:', newState.theme);
    }
    return newState;
};

// Plugins úteis
const persistencePlugin = (oldState, newState, action) => {
    // Plugin automático de persistência
    if (action !== 'load-persisted') {
        // Salvar em localStorage
    }
};

const analyticsPlugin = (oldState, newState, action) => {
    // Enviar eventos para analytics
    if (window.gtag) {
        gtag('event', 'state_change', {
            action: action,
            old_state: JSON.stringify(oldState),
            new_state: JSON.stringify(newState)
        });
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.stateManager = new StateManager();

    // Adicionar middlewares e plugins padrão
    window.stateManager
        .use(loggerMiddleware)
        .use(validationMiddleware)
        .plugin(persistencePlugin)
        .plugin(analyticsPlugin);

    // Definir estado inicial
    const defaultState = window.stateManager.getDefaultState();
    window.stateManager.setState(defaultState, 'initialize');

    // Aplicar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    window.stateManager.applyTheme(savedTheme);

    console.log('🏪 State Manager initialized');
});

// Export para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}
