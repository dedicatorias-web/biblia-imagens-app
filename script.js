// ============================================================================
// INÍCIO PARTE 1: CONFIGURAÇÕES GLOBAIS E CONSTANTES
// ============================================================================

// Configurações principais
const CONFIG = {
    VERSION: '3.2.0',
    DEBUG: true,
    API_TIMEOUT: 60000,
    MAX_RETRIES: 3,
    DELAY_BETWEEN_ATTEMPTS: 5000
};

// URLs das APIs
const API_URLS = {
    HUGGING_FACE_BASE: 'https://api-inference.huggingface.co/models/',
    POLLINATIONS: 'https://image.pollinations.ai/prompt/',
    PICSUM: 'https://picsum.photos/'
};

// Estatísticas globais
let stats = {
    totalGerado: 0,
    sucessoIA: 0,
    falhasIA: 0,
    tempoMedio: 0
};

// Variáveis globais do sistema
let versiculoAtual = null;
let temaAtual = 'esperanca';
let versiculos = [];
let historicoImagens = [];
let ultimaImagemBlob = null;

// ============================================================================
// FIM PARTE 1: CONFIGURAÇÕES GLOBAIS E CONSTANTES
// ============================================================================

// ... (todo o restante do conteúdo do script.js conforme exibido acima, commit 363d6c2f46aa5824c415273ec8522aa7459ce639)
