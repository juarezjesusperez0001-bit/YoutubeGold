// Estado de la aplicación
const AppState = {
    currentTool: null,
    usageCount: 3,
    totalEarnings: 0,
    currentTheme: 'red',
    isLoading: false,
    deferredPrompt: null
};

// Configuración de herramientas
const TOOLS_CONFIG = {
    'keyword-research': {
        title: 'Keyword Research IA',
        description: 'Encuentra las palabras clave más rentables',
        icon: 'fas fa-search'
    },
    'title-optimizer': {
        title: 'Optimizador de Títulos',
        description: 'Crea títulos irresistibles',
        icon: 'fas fa-magic'
    },
    'thumbnail-analyzer': {
        title: 'Analizador de Miniaturas',
        description: 'Optimiza tus thumbnails',
        icon: 'fas fa-image'
    },
    'trending-topics': {
        title: 'Temas Trending',
        description: 'Descubre qué está viral',
        icon: 'fas fa-fire'
    },
    'competitor-spy': {
        title: 'Espía de Competencia',
        description: 'Analiza a tu competencia',
        icon: 'fas fa-user-secret'
    },
    'revenue-calculator': {
        title: 'Calculadora de Ingresos',
        description: 'Predice tus ganancias',
        icon: 'fas fa-calculator'
    },
    'ai-assistant': {
        title: 'Asistente IA',
        description: 'Análisis completo con IA',
        icon: 'fas fa-robot'
    },
    'voice-optimizer': {
        title: 'Optimizador de Voz IA',
        description: 'Mejora tu forma de hablar',
        icon: 'fas fa-microphone'
    },
    'trend-predictor': {
        title: 'Predictor de Tendencias',
        description: 'Predice el futuro con IA',
        icon: 'fas fa-crystal-ball',
        premium: true
    }
};

// Mensajes de carga para diferentes herramientas
const LOADING_MESSAGES = {
    'keyword-research': [
        'Analizando 50M+ de keywords...',
        'Detectando oportunidades de ranking...',
        'Calculando volumen de búsqueda...',
        'Optimizando para tu nicho...'
    ],
    'title-optimizer': [
        'Analizando patrones virales...',
        'Detectando triggers emocionales...',
        'Optimizando para CTR máximo...',
        'Generando títulos irresistibles...'
    ],
    'ai-assistant': [
        'IA analizando tu canal...',
        'Detectando oportunidades de crecimiento...',
        'Comparando con competidores...',
        'Generando estrategias personalizadas...'
    ]
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadSavedData();
    setupEventListeners();
    checkForUpdates();
});

function initializeApp() {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('youtubegold_theme') || 'red';
    setTheme(savedTheme);

    // Configurar PWA
    setupPWA();

    // Mostrar earnings iniciales
    updateEarningsDisplay();

    // Configurar herramientas
    setupToolCards();

    // Mensaje de bienvenida para nuevos usuarios
    if (!localStorage.getItem('youtubegold_visited')) {
        setTimeout(() => {
            showWelcomeMessage();
            localStorage.setItem('youtubegold_visited', 'true');
        }, 2000);
    }
}

function loadSavedData() {
    // Cargar uso guardado
    const savedUsage = localStorage.getItem('youtubegold_usage');
    if (savedUsage) {
        AppState.usageCount = parseInt(savedUsage);
        updateUsageDisplay();
    }

    // Cargar earnings guardados
    const savedEarnings = localStorage.getItem('youtubegold_earnings');
    if (savedEarnings) {
        AppState.totalEarnings = parseInt(savedEarnings);
        updateEarningsDisplay();
    }
}

function setupEventListeners() {
    // Botón de tema
    const themeBtn = document.getElementById('theme-toggle');
    const themeSelector = document.getElementById('theme-selector');

    themeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        themeSelector.classList.toggle('hidden');
    });

    // Cerrar selector de temas al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!themeSelector?.contains(e.target) && !themeBtn?.contains(e.target)) {
            themeSelector?.classList.add('hidden');
        }
    });

    // Opciones de tema
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            setTheme(theme);
            themeSelector.classList.add('hidden');
        });
    });

    // Herramientas
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const tool = card.dataset.tool;
            if (tool) {
                selectTool(tool);
            }
        });
    });

    // CTA del hero
    const heroCta = document.querySelector('.hero-cta');
    heroCta?.addEventListener('click', scrollToTools);

    // Workspace
    const closeWorkspace = document.getElementById('close-workspace');
    closeWorkspace?.addEventListener('click', closeWorkspacePanel);

    const generateBtn = document.getElementById('generate-content');
    generateBtn?.addEventListener('click', generateOptimization);

    // Acciones de resultados
    const copyBtn = document.getElementById('copy-results');
    const saveBtn = document.getElementById('save-results');
    const exportBtn = document.getElementById('export-results');

    copyBtn?.addEventListener('click', copyResults);
    saveBtn?.addEventListener('click', saveResults);
    exportBtn?.addEventListener('click', exportResults);

    // Modal premium
    const closePremium = document.getElementById('close-premium');
    closePremium?.addEventListener('click', closePremiumModal);

    // Botón de instalación
    const installBtn = document.getElementById('install-app');
    installBtn?.addEventListener('click', installApp);
}

function setupPWA() {
    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    }

    // Prompt de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        AppState.deferredPrompt = e;
        const installBtn = document.getElementById('install-app');
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });
}

function setupToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');

    toolCards.forEach(card => {
        const tool = card.dataset.tool;
        const config = TOOLS_CONFIG[tool];

        if (config?.premium && !isPremiumUser()) {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                showPremiumModal();
            });
        }
    });
}

// Funciones de tema
function setTheme(themeName) {
    AppState.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('youtubegold_theme', themeName);

    showNotification(`Tema cambiado a ${getThemeName(themeName)}`, 'success');
    trackEvent('theme_changed', { theme: themeName });
}

function getThemeName(theme) {
    const names = {
        red: 'Rojo Clásico',
        dark: 'Dark Mode',
        blue: 'Azul Pro',
        purple: 'Morado Creator',
        green: 'Verde Money'
    };
    return names[theme] || theme;
}

// Funciones de herramientas
function selectTool(toolName) {
    if (AppState.usageCount <= 0 && !isPremiumUser()) {
        showPremiumModal();
        return;
    }

    const config = TOOLS_CONFIG[toolName];
    if (config?.premium && !isPremiumUser()) {
        showPremiumModal();
        return;
    }

    AppState.currentTool = toolName;
    const workspace = document.getElementById('workspace');
    const title = document.getElementById('workspace-title');

    if (title && config) {
        title.textContent = config.title;
    }

    workspace?.classList.remove('hidden');

    // Scroll al workspace
    setTimeout(() => {
        workspace?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    trackEvent('tool_selected', { tool: toolName });
}

function closeWorkspacePanel() {
    const workspace = document.getElementById('workspace');
    workspace?.classList.add('hidden');
    AppState.currentTool = null;
}

async function generateOptimization() {
    if (AppState.isLoading) return;

    // Validar inputs
    const channelTopic = document.getElementById('channel-topic')?.value?.trim();
    const videoTopic = document.getElementById('video-topic')?.value?.trim();

    if (!channelTopic || !videoTopic) {
        showNotification('Por favor, completa todos los campos requeridos', 'error');
        return;
    }

    AppState.isLoading = true;
    showLoadingOverlay();

    const generateBtn = document.getElementById('generate-content');
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
    }

    try {
        // Simular proceso de generación
        await simulateAIProcessing();

        // Generar contenido
        const result = await generateContentByTool(AppState.currentTool, {
            channelTopic,
            videoTopic,
            audience: document.getElementById('target-audience')?.value || 'general'
        });

        // Mostrar resultados
        displayResults(result);

        // Actualizar estadísticas
        updateUsageCount();
        updateEarnings();

        trackEvent('optimization_generated', { 
            tool: AppState.currentTool,
            channelTopic,
            videoTopic 
        });

    } catch (error) {
        console.error('Error generating optimization:', error);
        showNotification('Error al generar optimización. Inténtalo de nuevo.', 'error');
    } finally {
        AppState.isLoading = false;
        hideLoadingOverlay();

        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Optimización';
        }
    }
}

async function simulateAIProcessing() {
    const messages = LOADING_MESSAGES[AppState.currentTool] || [
        'Procesando con IA...',
        'Analizando datos...',
        'Optimizando resultados...',
        'Finalizando...'
    ];

    for (let i = 0; i < messages.length; i++) {
        updateLoadingMessage(messages[i]);
        updateLoadingProgress((i + 1) / messages.length * 100);
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    }
}

function generateContentByTool(tool, data) {
    const generators = {
        'keyword-research': generateKeywordResearch,
        'title-optimizer': generateTitleOptimization,
        'thumbnail-analyzer': generateThumbnailAnalysis,
        'trending-topics': generateTrendingTopics,
        'competitor-spy': generateCompetitorAnalysis,
        'revenue-calculator': generateRevenueCalculation,
        'ai-assistant': generateAIAssistantAnalysis,
        'voice-optimizer': generateVoiceOptimization,
        'trend-predictor': generateTrendPrediction
    };

    const generator = generators[tool] || generators['keyword-research'];
    return generator(data);
}

function generateKeywordResearch(data) {
    const { channelTopic, videoTopic, audience } = data;

    const keywords = generateKeywords(videoTopic, audience);
    const longTailKeywords = generateLongTailKeywords(videoTopic);
    const competitorKeywords = generateCompetitorKeywords(channelTopic);

    return `
        <div class="optimization-result">
            <h3><i class="fas fa-search"></i> Keywords de Alto Impacto para "${videoTopic}"</h3>

            <div class="keyword-section">
                <h4>🎯 Keywords Principales</h4>
                <div class="keyword-list">
                    ${keywords.map(kw => `
                        <div class="keyword-item">
                            <span class="keyword-text">${kw.word}</span>
                            <div class="keyword-stats">
                                <span class="volume">${kw.volume}</span>
                                <span class="difficulty ${kw.difficulty.toLowerCase()}">${kw.difficulty}</span>
                                <span class="cpc">$${kw.cpc}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="keyword-section">
                <h4>💎 Keywords Long-tail</h4>
                <div class="keyword-list">
                    ${longTailKeywords.map(kw => `
                        <div class="keyword-item long-tail">
                            <span class="keyword-text">${kw.word}</span>
                            <div class="keyword-stats">
                                <span class="volume">${kw.volume}</span>
                                <span class="opportunity">Oportunidad: ${kw.opportunity}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="insights-section">
                <h4>🧠 Insights IA</h4>
                <div class="insight-cards">
                    <div class="insight-card">
                        <i class="fas fa-lightbulb"></i>
                        <div>
                            <strong>Oportunidad Detectada</strong>
                            <p>Las keywords con "${videoTopic.split(' ')[0]}" tienen 340% menos competencia</p>
                        </div>
                    </div>
                    <div class="insight-card">
                        <i class="fas fa-chart-line"></i>
                        <div>
                            <strong>Tendencia Creciente</strong>
                            <p>Búsquedas de "${channelTopic}" aumentaron 45% este mes</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action-plan">
                <h4>🚀 Plan de Acción</h4>
                <ol>
                    <li>Usar "${keywords[0].word}" en el título principal</li>
                    <li>Incluir keywords long-tail en la descripción</li>
                    <li>Crear 3 videos más sobre "${channelTopic}"</li>
                    <li>Optimizar tags con keywords de baja competencia</li>
                </ol>
            </div>
        </div>
    `;
}

function generateTitleOptimization(data) {
    const { videoTopic, audience } = data;

    const titles = generateOptimizedTitles(videoTopic, audience);

    return `
        <div class="optimization-result">
            <h3><i class="fas fa-magic"></i> Títulos Optimizados para "${videoTopic}"</h3>

            <div class="title-rankings">
                <h4>🏆 Top 5 Títulos con Mayor Potencial</h4>
                ${titles.map((title, index) => `
                    <div class="title-option rank-${index + 1}">
                        <div class="rank-badge">#${index + 1}</div>
                        <div class="title-content">
                            <h5 class="title-text">${title.text}</h5>
                            <div class="title-metrics">
                                <span class="metric ctr">CTR: ${title.ctr}%</span>
                                <span class="metric engagement">Engagement: ${title.engagement}%</span>
                                <span class="metric viral">Viral: ${title.viral}/100</span>
                            </div>
                            <div class="title-analysis">
                                <div class="analysis-item">
                                    <i class="fas fa-eye"></i>
                                    <span>Curiosity Gap: ${title.curiosity}</span>
                                </div>
                                <div class="analysis-item">
                                    <i class="fas fa-heart"></i>
                                    <span>Emotional Trigger: ${title.emotion}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="optimization-tips">
                <h4>💡 Tips de Optimización Avanzada</h4>
                <div class="tip-grid">
                    <div class="tip-card">
                        <i class="fas fa-ruler"></i>
                        <h5>Longitud Ideal</h5>
                        <p>55-60 caracteres para máxima visibilidad en todas las plataformas</p>
                    </div>
                    <div class="tip-card">
                        <i class="fas fa-fire"></i>
                        <h5>Power Words</h5>
                        <p>Usar palabras como "SECRETO", "ÚLTIMO", "VIRAL" aumenta CTR en +23%</p>
                    </div>
                    <div class="tip-card">
                        <i class="fas fa-clock"></i>
                        <h5>Urgencia</h5>
                        <p>Crear FOMO con "ANTES QUE SEA TARDE", "SOLO HOY"</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Funciones auxiliares para generar datos
function generateKeywords(topic, audience) {
    const volumes = ['50K', '120K', '340K', '890K', '1.2M'];
    const difficulties = ['Baja', 'Media', 'Alta'];
    const baseKeywords = [
        `${topic} tutorial`,
        `como hacer ${topic}`,
        `${topic} 2024`,
        `mejor ${topic}`,
        `${topic} gratis`
    ];

    return baseKeywords.map(kw => ({
        word: kw,
        volume: volumes[Math.floor(Math.random() * volumes.length)],
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        cpc: (Math.random() * 3 + 0.5).toFixed(2)
    }));
}

function generateLongTailKeywords(topic) {
    const longTails = [
        `${topic} paso a paso para principiantes`,
        `como mejorar ${topic} rápidamente`,
        `${topic} vs alternativas 2024`,
        `errores comunes en ${topic}`,
        `${topic} profesional desde casa`
    ];

    return longTails.map(kw => ({
        word: kw,
        volume: Math.floor(Math.random() * 50 + 10) + 'K',
        opportunity: ['Alta', 'Muy Alta'][Math.floor(Math.random() * 2)]
    }));
}

function generateCompetitorKeywords(topic) {
    // Placeholder for competitor keyword generation logic
    return [
        { word: `best ${topic} channels`, volume: '200K', difficulty: 'Media', cpc: '1.50' },
        { word: `${topic} secrets`, volume: '90K', difficulty: 'Baja', cpc: '0.80' }
    ];
}

function generateOptimizedTitles(topic, audience) {
    const titles = [
        {
            text: `SECRETO: ${topic} que CAMBIÓ mi vida (FUNCIONA 100%)`,
            ctr: (Math.random() * 5 + 12).toFixed(1),
            engagement: Math.floor(Math.random() * 20 + 80),
            viral: Math.floor(Math.random() * 20 + 80),
            curiosity: 'Muy Alto',
            emotion: 'Transformación'
        },
        {
            text: `${topic} - El MÉTODO que NADIE te cuenta`,
            ctr: (Math.random() * 4 + 10).toFixed(1),
            engagement: Math.floor(Math.random() * 15 + 75),
            viral: Math.floor(Math.random() * 15 + 75),
            curiosity: 'Alto',
            emotion: 'Exclusividad'
        },
        {
            text: `ÚLTIMO DÍA: ${topic} GRATIS (No volverá a repetirse)`,
            ctr: (Math.random() * 3 + 9).toFixed(1),
            engagement: Math.floor(Math.random() * 10 + 70),
            viral: Math.floor(Math.random() * 10 + 70),
            curiosity: 'Alto',
            emotion: 'Urgencia'
        },
        {
            text: `${topic}: La VERDAD que NO quieren que sepas`,
            ctr: (Math.random() * 3 + 8).toFixed(1),
            engagement: Math.floor(Math.random() * 10 + 65),
            viral: Math.floor(Math.random() * 10 + 65),
            curiosity: 'Medio',
            emotion: 'Conspiración'
        },
        {
            text: `Tutorial COMPLETO: ${topic} desde CERO (2024)`,
            ctr: (Math.random() * 2 + 7).toFixed(1),
            engagement: Math.floor(Math.random() * 10 + 60),
            viral: Math.floor(Math.random() * 10 + 60),
            curiosity: 'Medio',
            emotion: 'Educativo'
        }
    ];

    return titles;
}

// Placeholder for other tool generation functions (to be implemented)
function generateThumbnailAnalysis(data) { return '<div class="optimization-result">Thumbnail Analysis Placeholder</div>'; }
function generateTrendingTopics(data) { return '<div class="optimization-result">Trending Topics Placeholder</div>'; }
function generateCompetitorAnalysis(data) { return '<div class="optimization-result">Competitor Analysis Placeholder</div>'; }
function generateRevenueCalculation(data) { return '<div class="optimization-result">Revenue Calculator Placeholder</div>'; }
function generateAIAssistantAnalysis(data) { return '<div class="optimization-result">AI Assistant Analysis Placeholder</div>'; }
function generateVoiceOptimization(data) { return '<div class="optimization-result">Voice Optimization Placeholder</div>'; }
function generateTrendPrediction(data) { return '<div class="optimization-result">Trend Prediction Placeholder</div>'; }


// Funciones de UI
function displayResults(content) {
    const resultsContent = document.getElementById('results-content');
    if (resultsContent) {
        resultsContent.innerHTML = content;
        resultsContent.scrollTop = 0;
    }
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay?.classList.remove('hidden');
    updateLoadingProgress(0);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    overlay?.classList.add('hidden');
}

function updateLoadingMessage(message) {
    const messageEl = document.getElementById('loading-message');
    if (messageEl) {
        messageEl.textContent = message;
    }
}

function updateLoadingProgress(percentage) {
    const progressBar = document.getElementById('loading-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

function updateUsageCount() {
    if (!isPremiumUser()) {
        AppState.usageCount = Math.max(0, AppState.usageCount - 1);
        localStorage.setItem('youtubegold_usage', AppState.usageCount.toString());
    }
    updateUsageDisplay();
}

function updateUsageDisplay() {
    const usageEl = document.getElementById('usage-count');
    const usageFill = document.getElementById('usage-fill');

    if (usageEl) {
        usageEl.textContent = isPremiumUser() ? '∞' : AppState.usageCount;
    }

    if (usageFill && !isPremiumUser()) {
        const percentage = (AppState.usageCount / 3) * 100;
        usageFill.style.width = percentage + '%';
    }
}

function updateEarnings() {
    const increase = Math.floor(Math.random() * 2000) + 500;
    AppState.totalEarnings += increase;
    localStorage.setItem('youtubegold_earnings', AppState.totalEarnings.toString());

    animateEarningsCounter(AppState.totalEarnings - increase, AppState.totalEarnings);
}

function updateEarningsDisplay() {
    const earningsEl = document.getElementById('earnings-display');
    if (earningsEl) {
        earningsEl.textContent = '$' + AppState.totalEarnings.toLocaleString();
    }
}

function animateEarningsCounter(start, end) {
    const earningsEl = document.getElementById('earnings-display');
    if (!earningsEl) return;

    const duration = 1500;
    const increment = (end - start) / (duration / 16);
    let current = start;

    const animation = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(animation);
        }
        earningsEl.textContent = '$' + Math.floor(current).toLocaleString();
    }, 16);
}

// Funciones de modal y notificaciones
function showPremiumModal() {
    const modal = document.getElementById('premium-modal');
    modal?.classList.remove('hidden');
    trackEvent('premium_modal_shown', { trigger: 'usage_limit' });
}

function closePremiumModal() {
    const modal = document.getElementById('premium-modal');
    modal?.classList.add('hidden');
}

function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
        <i class="${iconMap[type] || iconMap.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(notification);

    // Auto-remove
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    }, duration);
}

function showWelcomeMessage() {
    showNotification('¡Bienvenido a YouTubeGold! Tienes 3 optimizaciones gratuitas para probar.', 'success', 6000);
}

// Funciones de datos
function copyResults() {
    const content = document.getElementById('results-content')?.textContent;
    if (content) {
        navigator.clipboard.writeText(content).then(() => {
            showNotification('Resultados copiados al portapapeles', 'success');
        });
    }
}

function saveResults() {
    const content = document.getElementById('results-content')?.innerHTML;
    if (content && !content.includes('aparecerán aquí')) {
        const savedResults = JSON.parse(localStorage.getItem('youtubegold_results') || '[]');
        savedResults.push({
            tool: AppState.currentTool,
            content: content,
            date: new Date().toISOString(),
            topic: document.getElementById('video-topic')?.value
        });
        localStorage.setItem('youtubegold_results', JSON.stringify(savedResults));
        showNotification('Resultados guardados exitosamente', 'success');
    }
}

function exportResults() {
    if (!isPremiumUser()) {
        showPremiumModal();
        return;
    }

    const content = document.getElementById('results-content')?.textContent;
    if (content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtubegold-results-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Resultados exportados exitosamente', 'success');
    }
}

// Funciones de utilidad
function scrollToTools() {
    document.getElementById('tools')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function isPremiumUser() {
    return localStorage.getItem('youtubegold_premium') === 'true';
}

function installApp() {
    if (AppState.deferredPrompt) {
        AppState.deferredPrompt.prompt();
        AppState.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('¡YouTubeGold instalado exitosamente!', 'success');
                trackEvent('app_installed', {});
            }
            AppState.deferredPrompt = null;
            const installBtn = document.getElementById('install-app');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        });
    }
}

function trackEvent(eventName, data) {
    console.log(`Event: ${eventName}`, data);
    // Aquí se integraría con Google Analytics, Mixpanel, etc.
}

function checkForUpdates() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            showNotification('Nueva versión disponible. Recargando...', 'info', 2000);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        });
    }
}

// Manejo de errores global
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showNotification('Ocurrió un error inesperado', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('Error en operación asíncrona', 'error');
});

// Exportar funciones para uso en HTML
window.scrollToTools = scrollToTools;
window.selectTool = selectTool;
window.setTheme = setTheme;
window.installApp = installApp;
