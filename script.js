
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

// ============================================================================
// CONFIGURAÇÕES DE ESTILOS E PARÂMETROS (CORREÇÃO DEFINITIVA)
// ============================================================================

// Parâmetros de estilos artísticos para os modelos
const parametrosEstilos = {
    BARROCO: {
        num_inference_steps: 30,
        guidance_scale: 8.5,
        width: 768,
        height: 768,
        negative_prompt: "blurry, bad quality, watermark, text, modern, contemporary, abstract"
    },
    RENASCENTISTA: {
        num_inference_steps: 25,
        guidance_scale: 7.5,
        width: 768,
        height: 768,
        negative_prompt: "cartoon, anime, modern, digital art, 3d render, photography"
    },
    DEFAULT: {
        num_inference_steps: 20,
        guidance_scale: 7,
        width: 512,
        height: 512,
        negative_prompt: "blurry, bad quality, watermark, text"
    }
};

// Sistema de prioridade de APIs
const CONFIG_APIS = {
    USAR_HUGGINGFACE: true,  // Mudar para false para desabilitar HF
    TIMEOUT_HF: 15000,       // Timeout de 15s para cada modelo HF
    MAX_TENTATIVAS_HF: 3,    // Máximo de modelos HF para testar
    PREFERIR_POLLINATIONS: false  // Se true, vai direto para Pollinations
};

// ============================================================================
// FIM DAS CONFIGURAÇÕES
// ============================================================================


// ============================================================================
// INÍCIO PARTE 2: DEFINIÇÕES DE ESTILOS ARTÍSTICOS
// ============================================================================

const estilosArtisticos = {
    BARROCO: {
        nome: "Barroco",
        periodo: "séculos XVII-XVIII",
        peso: 0.6,
        descricao: "Dramaticidade intensa e chiaroscuro",
        caracteristicas: [
            "contraste extremo de luz e sombra (chiaroscuro)",
            "dramaticidade intensa",
            "movimento dinâmico",
            "emoções exuberantes",
            "detalhes ornamentais elaborados",
            "composições diagonais"
        ],
        artistas: ["Caravaggio", "Rembrandt", "Rubens", "Velázquez"],
        termosPrompt: [
            "baroque painting style",
            "dramatic chiaroscuro lighting",
            "oil on canvas, 17th century",
            "ornate gilded frame",
            "religious baroque masterpiece",
            "by Caravaggio and Rembrandt",
            "intense emotional expression",
            "diagonal composition",
            "rich golden tones",
            "deep shadows and bright highlights"
        ],
        termosNegativos: [
            "modern", "photorealistic", "abstract", "cartoon", "anime",
            "flat design", "digital art", "3D render", "contemporary",
            "minimalist", "geometric", "neon colors", "vector art"
        ]
    },
    RENASCENTISTA: {
        nome: "Renascentista", 
        periodo: "séculos XIV-XVI",
        peso: 0.4,
        descricao: "Proporção matemática e harmonia",
        caracteristicas: [
            "proporção e simetria matemática",
            "perspectiva linear perfeita",
            "equilíbrio harmonioso",
            "idealização da forma humana",
            "temas clássicos e bíblicos",
            "detalhes minuciosos"
        ],
        artistas: ["Leonardo da Vinci", "Michelangelo", "Rafael", "Botticelli"],
        termosPrompt: [
            "renaissance fresco painting",
            "perfect linear perspective",
            "oil on wood panel, 15th century",
            "golden ratio composition",
            "by Leonardo da Vinci and Raphael",
            "sfumato technique",
            "balanced symmetrical composition",
            "classical architectural background",
            "soft natural lighting",
            "anatomically perfect figures"
        ],
        termosNegativos: [
            "modern", "photorealistic", "abstract", "baroque", "dramatic lighting",
            "ornate", "exaggerated emotions", "contemporary", "digital art",
            "asymmetrical", "high contrast", "neon", "minimalist"
        ]
    }
};

// Elementos históricos específicos por estilo
const elementosHistoricos = {
    BARROCO: [
        "anjo barroco com asas dramáticas",
        "santo com expressão extasiada",
        "raios de luz celestial intensos", 
        "vestes douradas com dobras profundas",
        "cortinas vermelhas pesadas",
        "nuvens tempestuosas divinas",
        "querubins em movimento espiral"
    ],
    RENASCENTISTA: [
        "composição em triângulo equilibrado",
        "fundo paisagístico clássico",
        "figuras em pose idealizada",
        "detalhes anatômicos perfeitos",
        "arquitetura clássica romana",
        "jardim renascentista ao fundo",
        "halos dourados geométricos"
    ]
};

// ============================================================================
// FIM PARTE 2: DEFINIÇÕES DE ESTILOS ARTÍSTICOS
// ============================================================================

// ============================================================================
// INÍCIO PARTE 3: MODELOS DE IA E PARÂMETROS
// ============================================================================

// ============================================================================
// MEGA BIBLIOTECA DE MODELOS HUGGING FACE (30+ MODELOS)
// ============================================================================

const modelosHFPrioritarios = [
    // === MODELOS BASE STABLE DIFFUSION ===
    {
        nome: "RunwayML SD 1.5",
        url: "runwayml/stable-diffusion-v1-5",
        categoria: "base",
        confiabilidade: 10,
        tempo_estimado: "15-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    {
        nome: "CompVis SD 1.4",
        url: "CompVis/stable-diffusion-v1-4",
        categoria: "base",
        confiabilidade: 9,
        tempo_estimado: "15-25s",
        parametros_customizados: {
            num_inference_steps: 20,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Stable Diffusion 2.1 Base",
        url: "stabilityai/stable-diffusion-2-1-base",
        categoria: "base",
        confiabilidade: 8,
        tempo_estimado: "20-35s",
        parametros_customizados: {
            num_inference_steps: 30,
            guidance_scale: 8,
            width: 768,
            height: 768
        }
    },
    
    // === MODELOS ARTÍSTICOS ===
    {
        nome: "Dreamlike Diffusion",
        url: "dreamlike-art/dreamlike-diffusion-1.0",
        categoria: "artistico",
        confiabilidade: 9,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 8,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Dreamlike Photoreal",
        url: "dreamlike-art/dreamlike-photoreal-2.0",
        categoria: "fotorealista",
        confiabilidade: 8,
        tempo_estimado: "25-35s",
        parametros_customizados: {
            num_inference_steps: 30,
            guidance_scale: 8.5,
            width: 768,
            height: 768
        }
    },
    {
        nome: "OpenJourney",
        url: "prompthero/openjourney",
        categoria: "artistico",
        confiabilidade: 8,
        tempo_estimado: "15-25s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Midjourney V4 Style",
        url: "prompthero/midjourney-v4-diffusion",
        categoria: "artistico",
        confiabilidade: 7,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS ANIME/CARTOON ===
    {
        nome: "Anything V5",
        url: "stablediffusionapi/anything-v5",
        categoria: "anime",
        confiabilidade: 8,
        tempo_estimado: "15-25s",
        parametros_customizados: {
            num_inference_steps: 20,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Waifu Diffusion",
        url: "hakurei/waifu-diffusion",
        categoria: "anime",
        confiabilidade: 7,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Anime Pastel Dream",
        url: "stablediffusionapi/anime-pastel-dream",
        categoria: "anime",
        confiabilidade: 7,
        tempo_estimado: "15-25s",
        parametros_customizados: {
            num_inference_steps: 20,
            guidance_scale: 6.5,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS REALISTAS ===
    {
        nome: "Realistic Vision V5",
        url: "stablediffusionapi/realistic-vision-v5",
        categoria: "fotorealista",
        confiabilidade: 9,
        tempo_estimado: "25-40s",
        parametros_customizados: {
            num_inference_steps: 30,
            guidance_scale: 8,
            width: 512,
            height: 512
        }
    },
    {
        nome: "CyberRealistic",
        url: "stablediffusionapi/cyberrealistic",
        categoria: "fotorealista",
        confiabilidade: 8,
        tempo_estimado: "25-35s",
        parametros_customizados: {
            num_inference_steps: 28,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Photorealistic Stock",
        url: "stablediffusionapi/photorealistic-stock-v2",
        categoria: "fotorealista",
        confiabilidade: 7,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS PINTURAS CLÁSSICAS ===
    {
        nome: "Classic Animation",
        url: "stablediffusionapi/classic-anim-diffusion",
        categoria: "classico",
        confiabilidade: 7,
        tempo_estimado: "15-25s",
        parametros_customizados: {
            num_inference_steps: 20,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Van Gogh Diffusion",
        url: "dallinmackay/Van-Gogh-diffusion",
        categoria: "artistico",
        confiabilidade: 7,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Oil Painting Style",
        url: "stablediffusionapi/oil-painting-style",
        categoria: "classico",
        confiabilidade: 6,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 8,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS FANTASIA/SCI-FI ===
    {
        nome: "Fantasy Mix",
        url: "stablediffusionapi/fantasy-mix",
        categoria: "fantasia",
        confiabilidade: 7,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Epic Diffusion",
        url: "stablediffusionapi/epic-diffusion",
        categoria: "fantasia",
        confiabilidade: 7,
        tempo_estimado: "25-35s",
        parametros_customizados: {
            num_inference_steps: 28,
            guidance_scale: 8,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Sci-Fi Diffusion",
        url: "stablediffusionapi/sci-fi-diffusion",
        categoria: "scifi",
        confiabilidade: 6,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS ESTILIZADOS ===
    {
        nome: "Cartoon Diffusion",
        url: "stablediffusionapi/cartoon-diffusion",
        categoria: "cartoon",
        confiabilidade: 7,
        tempo_estimado: "15-25s",
        parametros_customizados: {
            num_inference_steps: 20,
            guidance_scale: 6.5,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Comic Diffusion",
        url: "stablediffusionapi/comic-diffusion",
        categoria: "cartoon",
        confiabilidade: 6,
        tempo_estimado: "15-25s",
        parametros_customizados: {
            num_inference_steps: 20,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    {
        nome: "3D Cartoon Style",
        url: "stablediffusionapi/3d-cartoon-diffusion",
        categoria: "cartoon",
        confiabilidade: 6,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS ARQUITETURA/DESIGN ===
    {
        nome: "Architecture Style",
        url: "stablediffusionapi/architecture-diffusion",
        categoria: "arquitetura",
        confiabilidade: 6,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 8,
            width: 768,
            height: 512
        }
    },
    {
        nome: "Interior Design",
        url: "stablediffusionapi/interior-design-diffusion",
        categoria: "arquitetura",
        confiabilidade: 6,
        tempo_estimado: "25-35s",
        parametros_customizados: {
            num_inference_steps: 28,
            guidance_scale: 7.5,
            width: 768,
            height: 512
        }
    },
    
    // === MODELOS EXPERIMENTAIS ===
    {
        nome: "Analog Diffusion",
        url: "wavymulder/Analog-Diffusion",
        categoria: "experimental",
        confiabilidade: 7,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Redshift Diffusion",
        url: "nitrosocke/redshift-diffusion",
        categoria: "experimental",
        confiabilidade: 6,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Future Diffusion",
        url: "nitrosocke/Future-Diffusion",
        categoria: "experimental",
        confiabilidade: 6,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS PORTRAIT ===
    {
        nome: "Portrait Plus",
        url: "stablediffusionapi/portrait-plus",
        categoria: "retrato",
        confiabilidade: 7,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    },
    {
        nome: "Beauty Face",
        url: "stablediffusionapi/beauty-face",
        categoria: "retrato",
        confiabilidade: 6,
        tempo_estimado: "20-30s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS RÁPIDOS ===
    {
        nome: "SD Turbo",
        url: "stabilityai/sd-turbo",
        categoria: "turbo",
        confiabilidade: 8,
        tempo_estimado: "5-10s",
        parametros_customizados: {
            num_inference_steps: 1,
            guidance_scale: 0,
            width: 512,
            height: 512
        }
    },
    {
        nome: "SDXL Turbo",
        url: "stabilityai/sdxl-turbo",
        categoria: "turbo",
        confiabilidade: 7,
        tempo_estimado: "8-15s",
        parametros_customizados: {
            num_inference_steps: 1,
            guidance_scale: 0,
            width: 512,
            height: 512
        }
    },
    
    // === MODELOS BACKUP ===
    {
        nome: "Stable Diffusion Web",
        url: "stablediffusionapi/stable-diffusion-api",
        categoria: "backup",
        confiabilidade: 5,
        tempo_estimado: "20-40s",
        parametros_customizados: {
            num_inference_steps: 20,
            guidance_scale: 7.5,
            width: 512,
            height: 512
        }
    }
];

// Sistema de seleção inteligente de modelos
function selecionarModeloPorEstilo(estilo, categoria = null) {
    let modelosFiltrados = modelosHFPrioritarios;
    
    // Filtrar por categoria se especificada
    if (categoria) {
        modelosFiltrados = modelosFiltrados.filter(m => m.categoria === categoria);
    }
    
    // Para estilo barroco, priorizar modelos artísticos e clássicos
    if (estilo === 'BARROCO') {
        const categoriasPrioritarias = ['artistico', 'classico', 'base'];
        modelosFiltrados = modelosFiltrados.filter(m => 
            categoriasPrioritarias.includes(m.categoria)
        );
    }
    
    // Para estilo renascentista, priorizar modelos realistas
    if (estilo === 'RENASCENTISTA') {
        const categoriasPrioritarias = ['fotorealista', 'artistico', 'base'];
        modelosFiltrados = modelosFiltrados.filter(m => 
            categoriasPrioritarias.includes(m.categoria)
        );
    }
    
    // Ordenar por confiabilidade
    modelosFiltrados.sort((a, b) => b.confiabilidade - a.confiabilidade);
    
    // Retornar top 5 modelos
    return modelosFiltrados.slice(0, 5);
}

// ============================================================================
// FIM DA MEGA BIBLIOTECA DE MODELOS
// ============================================================================

// APIs alternativas MELHORADAS
const apisAlternativas = [
    {
        nome: "Pollinations AI (Flux)",
        confiabilidade: 10,
        funcao: async (prompt) => {
            const encodedPrompt = encodeURIComponent(prompt);
            const seed = Math.floor(Math.random() * 1000000);
            const url = `${API_URLS.POLLINATIONS}${encodedPrompt}?width=1024&height=1024&model=flux&enhance=true&nologo=true&seed=${seed}`;
            
            console.log('🔄 Gerando com Pollinations Flux...');
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            
            const blob = await response.blob();
            if (blob.size < 5000) throw new Error('Imagem muito pequena');
            
            return blob;
        }
    },
    {
        nome: "Pollinations Turbo",
        confiabilidade: 8,
        funcao: async (prompt) => {
            const encodedPrompt = encodeURIComponent(prompt);
            const seed = Math.floor(Math.random() * 1000000);
            const url = `${API_URLS.POLLINATIONS}${encodedPrompt}?width=512&height=512&model=turbo&enhance=false&nologo=true&seed=${seed}`;
            
            console.log('🔄 Gerando com Pollinations Turbo...');
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return await response.blob();
        }
    }
];
// ============================================================================
// FIM PARTE 3: MODELOS DE IA E PARÂMETROS
// ============================================================================

// ============================================================================
// INÍCIO PARTE 4: FUNÇÕES UTILITÁRIAS
// ============================================================================

// Função de delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Mostrar progresso na interface
function mostrarProgresso(mensagem, porcentagem) {
    console.log(`📊 ${mensagem} - ${porcentagem}%`);
    
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${porcentagem}%`;
        progressBar.setAttribute('aria-valuenow', porcentagem);
    }
    
    if (progressText) {
        progressText.textContent = mensagem;
    }
}

// Sistema de notificações toast
function mostrarToast(mensagem, tipo = 'success') {
    console.log(`📢 ${tipo.toUpperCase()}: ${mensagem}`);
    
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${tipo === 'success' ? '✅' : '❌'}</span>
            <span class="toast-message">${mensagem}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Criar container de toast se não existir
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
    `;
    document.body.appendChild(container);
    return container;
}

// Formatar tempo
function formatarTempo(ms) {
    const segundos = Math.floor(ms / 1000);
    return segundos > 60 ? `${Math.floor(segundos / 60)}m ${segundos % 60}s` : `${segundos}s`;
}

// ============================================================================
// FIM PARTE 4: FUNÇÕES UTILITÁRIAS
// ============================================================================

// ============================================================================
// INÍCIO PARTE 5: GESTÃO DE API KEYS
// ============================================================================

// Obter API key de múltiplas fontes
function getAPIKey() {
    // Config do GitHub Actions (produção)
    if (typeof window !== 'undefined' && window.CONFIG?.HUGGING_FACE_API_KEY) {
        const chave = window.CONFIG.HUGGING_FACE_API_KEY;
        if (chave && chave !== '{{ HUGGING_FACE_API_KEY }}' && chave.startsWith('hf_')) {
            console.log('🔑 Usando chave do CONFIG (produção segura)');
            return chave;
        }
    }
    
    // Variável global (desenvolvimento)
    if (typeof HUGGING_FACE_API_KEY !== 'undefined' && 
        HUGGING_FACE_API_KEY && 
        HUGGING_FACE_API_KEY !== 'SUA_CHAVE_AQUI' && 
        HUGGING_FACE_API_KEY.startsWith('hf_')) {
        console.log('🔑 Usando chave local (desenvolvimento)');
        return HUGGING_FACE_API_KEY;
    }
    
    // localStorage (usuário definiu manualmente)
    const storedKey = localStorage.getItem('hf_api_key');
    if (storedKey?.startsWith('hf_')) {
        console.log('🔑 Usando chave do localStorage');
        return storedKey;
    }
    
    // Chave manual temporária
    if (window.CHAVE_MANUAL?.startsWith('hf_')) {
        console.log('🔑 Usando chave manual temporária');
        return window.CHAVE_MANUAL;
    }
    
    console.log('🚫 Nenhuma chave API encontrada');
    return null;
}

// Definir chave manualmente (para debug)
function definirChaveManualmente(chave) {
    if (!chave || !chave.startsWith('hf_')) {
        console.error('❌ Chave inválida - deve começar com "hf_"');
        return false;
    }
    
    localStorage.setItem('hf_api_key', chave);
    window.CHAVE_MANUAL = chave;
    console.log('💾 Chave salva com sucesso!');
    mostrarToast('Chave API configurada!', 'success');
    return true;
}

// Verificar status da chave
async function verificarChaveAPI() {
    const chave = getAPIKey();
    if (!chave) return false;
    
    try {
        const response = await fetch('https://huggingface.co/api/whoami', {
            headers: { 'Authorization': `Bearer ${chave}` }
        });
        const data = await response.json();
        console.log('✅ Chave válida:', data.name || 'Usuário verificado');
        return true;
    } catch (error) {
        console.log('❌ Chave inválida ou expirada');
        return false;
    }
}

// ============================================================================
// FIM PARTE 5: GESTÃO DE API KEYS
// ============================================================================

// ============================================================================
// INÍCIO PARTE 6: FUNÇÕES DE GERAÇÃO DE PROMPTS E ESTILOS
// ============================================================================

// Escolher estilo aleatório com pesos
function escolherEstiloAleatorio() {
    const estilos = [
        { nome: "BARROCO", peso: estilosArtisticos.BARROCO.peso },
        { nome: "RENASCENTISTA", peso: estilosArtisticos.RENASCENTISTA.peso }
    ];
    
    const totalPeso = estilos.reduce((sum, s) => sum + s.peso, 0);
    let rand = Math.random() * totalPeso;
    
    for (const estilo of estilos) {
        rand -= estilo.peso;
        if (rand <= 0) {
            console.log(`🎨 Estilo escolhido: ${estilo.nome}`);
            return estilo.nome;
        }
    }
    
    return "BARROCO";
}

// Gerar prompt estilizado com elementos históricos
function gerarPromptEstilizado(promptBase) {
    const estiloEscolhido = escolherEstiloAleatorio();
    const config = estilosArtisticos[estiloEscolhido];
    
    const elementos = elementosHistoricos[estiloEscolhido];
    const elementoAleatorio = elementos[Math.floor(Math.random() * elementos.length)];
    
    const artistasRef = config.artistas.slice(0, 2).join(" and ");
    
    const promptFinal = [
        `masterpiece, ${config.nome.toLowerCase()} painting style`,
        promptBase,
        elementoAleatorio,
        ...config.termosPrompt,
        `by ${artistasRef}`,
        "museum quality restoration",
        "canvas texture visible",
        "aged varnish effect",
        "authentic historical artwork",
        "no modern elements"
    ].join(", ");
    
    console.log(`🎨 ESTILO: ${config.nome} (${config.periodo})`);
    console.log(`🖌️ ARTISTAS: ${artistasRef}`);
    console.log(`📝 ELEMENTO: ${elementoAleatorio}`);
    console.log(`💡 PROMPT: ${promptFinal.substring(0, 150)}...`);
    
    return {
        prompt: promptFinal,
        negative_prompt: config.termosNegativos.join(", "),
        estilo: estiloEscolhido
    };
}

// Criar prompt baseado no versículo e tema
function criarPromptBase(versiculo, tema) {
    const palavrasChave = extrairPalavrasChave(versiculo.texto);
    
    const temasVisuais = {
        esperanca: "hopeful scene, bright future, sunrise, ascending birds",
        fe: "faith symbols, divine light, praying hands, sacred atmosphere",
        amor: "warm embrace, hearts, compassionate scene, gentle touch",
        sabedoria: "ancient books, wise owl, library setting, knowledge symbols",
        paz: "calm waters, dove, olive branch, serene landscape",
        forca: "mighty mountains, lion, strong oak tree, fortress",
        gratidao: "harvest scene, thanksgiving, abundant fruits, blessing hands",
        oracao: "kneeling figure, cathedral, candlelight, spiritual moment"
    };
    
    const elementosTema = temasVisuais[tema] || "spiritual scene";
    
    return `beautiful artwork, divine light, golden rays, heavenly atmosphere, ${elementosTema}, inspired by "${palavrasChave}"`;
}

// Extrair palavras-chave do versículo
function extrairPalavrasChave(texto) {
    const palavrasIgnoradas = ['o', 'a', 'de', 'do', 'da', 'e', 'que', 'para', 'com', 'em', 'por'];
    const palavras = texto.toLowerCase()
        .replace(/[.,;:!?]/g, '')
        .split(' ')
        .filter(p => p.length > 2 && !palavrasIgnoradas.includes(p))
        .slice(0, 6)
        .join(", ");
    
    return palavras || "biblical scene";
}

// ============================================================================
// FIM PARTE 6: FUNÇÕES DE GERAÇÃO DE PROMPTS E ESTILOS
// ============================================================================

// ============================================================================
// INÍCIO PARTE 7: FUNÇÕES DE CHAMADA DE API
// ============================================================================

// Chamar API Hugging Face com URLs CORRETAS
async function chamarAPIHuggingFaceSeguro(url, prompt, parametros) {
    const chave = getAPIKey();
    if (!chave) {
        throw new Error('🔑 Chave API não configurada');
    }
    
    const urlCompleta = `https://api-inference.huggingface.co/models/${url}`;
    
    const tentarChamada = async (tentativa = 1) => {
        try {
            console.log(`🔄 Chamando: ${url} (tentativa ${tentativa})`);
            
            const response = await fetch(urlCompleta, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${chave}`,
                    'Content-Type': 'application/json',
                    'x-wait-for-model': 'true'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: parametros,
                    options: {
                        wait_for_model: true
                    }
                }),
                signal: AbortSignal.timeout(CONFIG.API_TIMEOUT)
            });
            
            console.log(`📡 Status: ${response.status}`);
            
            if (response.status === 503) {
                const data = await response.json();
                const tempoEspera = data.estimated_time || 20;
                console.log(`⏳ Modelo carregando... aguardando ${tempoEspera}s`);
                await delay(tempoEspera * 1000);
                
                if (tentativa < CONFIG.MAX_RETRIES) {
                    return tentarChamada(tentativa + 1);
                }
            }
            
            if (!response.ok) {
                let errorText = 'Erro desconhecido';
                try {
                    errorText = await response.text();
                } catch (e) {
                    // Ignorar erro ao ler texto
                }
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const blob = await response.blob();
            
            if (blob.size < 1000) {
                throw new Error('Imagem muito pequena');
            }
            
            console.log(`✅ Sucesso: ${(blob.size / 1024).toFixed(2)}KB`);
            return blob;
            
        } catch (error) {
            console.error(`❌ Erro: ${error.message}`);
            
            if (tentativa < CONFIG.MAX_RETRIES && error.name !== 'AbortError') {
                console.log(`🔄 Tentando novamente em ${CONFIG.DELAY_BETWEEN_ATTEMPTS}ms...`);
                await delay(CONFIG.DELAY_BETWEEN_ATTEMPTS);
                return tentarChamada(tentativa + 1);
            }
            
            throw error;
        }
    };
    
    return tentarChamada();
}

// Função principal de tentativa de geração
// Função principal com teste em massa de modelos
// Função principal de geração (VERSÃO CORRIGIDA E OTIMIZADA)
async function tentarGerarImagemIA(promptBase, tema) {
    const startTime = Date.now();
    console.log('🚀 Iniciando geração inteligente...');
    mostrarProgresso('Preparando geração...', 5);
    
    const { prompt, negative_prompt, estilo } = gerarPromptEstilizado(promptBase);
    
    // Obter parâmetros do estilo ou usar default
    const estiloParams = parametrosEstilos[estilo] || parametrosEstilos.DEFAULT;
    
    // Verificar configuração de APIs
    const preferirPollinations = CONFIG_APIS.PREFERIR_POLLINATIONS || 
                                localStorage.getItem('preferir_pollinations') === 'true';
    
    if (preferirPollinations) {
        console.log('🎯 Configurado para usar Pollinations diretamente');
    }
    
    // TENTATIVA 1: Hugging Face (se habilitado e não preferir Pollinations)
    if (CONFIG_APIS.USAR_HUGGINGFACE && !preferirPollinations) {
        const chave = getAPIKey();
        
        if (chave) {
            console.log(`🤖 Testando modelos Hugging Face...`);
            
            // Selecionar modelos baseados no estilo
            const modelosSelecionados = selecionarModeloPorEstilo(estilo);
            const maxTentativas = Math.min(CONFIG_APIS.MAX_TENTATIVAS_HF, modelosSelecionados.length);
            
            for (let i = 0; i < maxTentativas; i++) {
                const modelo = modelosSelecionados[i];
                
                try {
                    const progresso = 20 + (i * 20);
                    mostrarProgresso(`🤖 ${modelo.nome}...`, progresso);
                    console.log(`🔄 Testando ${modelo.nome} [${modelo.categoria}]`);
                    
                    // Combinar parâmetros
                    const parametros = {
                        ...estiloParams,
                        ...modelo.parametros_customizados,
                        negative_prompt: negative_prompt || estiloParams.negative_prompt
                    };
                    
                    // Criar timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), CONFIG_APIS.TIMEOUT_HF);
                    
                    try {
                        const blob = await chamarAPIHuggingFaceComAbort(
                            modelo.url, 
                            prompt, 
                            parametros,
                            controller.signal
                        );
                        
                        clearTimeout(timeoutId);
                        
                        if (blob && blob.size > 5000) {
                            const tempoTotal = Date.now() - startTime;
                            console.log(`✅ ${modelo.nome} funcionou em ${formatarTempo(tempoTotal)}!`);
                            
                            mostrarToast(`🎨 Sucesso: ${modelo.nome}`, 'success');
                            
                            // Salvar preferência de sucesso
                            localStorage.setItem('ultimo_modelo_sucesso', JSON.stringify({
                                url: modelo.url,
                                nome: modelo.nome,
                                timestamp: Date.now()
                            }));
                            
                            stats.sucessoIA++;
                            stats.totalGerado++;
                            
                            ultimaImagemBlob = blob;
                            return blob;
                        }
                    } catch (error) {
                        clearTimeout(timeoutId);
                        throw error;
                    }
                    
                } catch (error) {
                    console.log(`⚠️ ${modelo.nome}: ${error.message?.substring(0, 50) || 'Erro desconhecido'}`);
                    
                    // Se for erro de autorização, desabilitar HF
                    if (error.message?.includes('401') || error.message?.includes('403')) {
                        console.log('🔴 Problema de autorização - Pulando para alternativas');
                        break;
                    }
                }
            }
        } else {
            console.log('⚠️ Sem chave API do Hugging Face');
        }
    }
    
    // TENTATIVA 2: Pollinations AI (Sempre funciona)
    console.log('🆓 Usando Pollinations AI...');
    mostrarProgresso('Gerando com Pollinations...', 70);
    
    // Tentar diferentes modelos do Pollinations
    const modelosPollinations = [
        { nome: 'Flux', modelo: 'flux', width: 1024, height: 1024, enhance: true },
        { nome: 'Turbo', modelo: 'turbo', width: 512, height: 512, enhance: false }
    ];
    
    for (const config of modelosPollinations) {
        try {
            console.log(`🔄 Tentando Pollinations ${config.nome}...`);
            
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${config.width}&height=${config.height}&model=${config.modelo}&enhance=${config.enhance}&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
            
            const response = await fetch(url);
            
            if (response.ok) {
                const blob = await response.blob();
                
                if (blob.size > 3000) {
                    const tempoTotal = Date.now() - startTime;
                    console.log(`✅ Pollinations ${config.nome} funcionou em ${formatarTempo(tempoTotal)}!`);
                    
                    mostrarToast(`🎨 Imagem criada: Pollinations ${config.nome}`, 'success');
                    
                    stats.sucessoIA++;
                    stats.totalGerado++;
                    
                    ultimaImagemBlob = blob;
                    return blob;
                }
            }
        } catch (error) {
            console.log(`⚠️ Pollinations ${config.nome} falhou`);
        }
    }
    
    // TENTATIVA 3: Arte Local (Último recurso)
    console.log('🎨 Gerando arte local como fallback final...');
    mostrarProgresso('Criando arte local...', 90);
    return await gerarArteLocal(prompt, tema, estilo);
}

// Função auxiliar para chamada com abort
async function chamarAPIHuggingFaceComAbort(modelo, prompt, parametros, signal) {
    const chave = getAPIKey();
    
    const response = await fetch(
        `https://api-inference.huggingface.co/models/${modelo}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${chave}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: parametros,
                options: { wait_for_model: true }
            }),
            signal: signal
        }
    );
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    return await response.blob();
}

// Função auxiliar melhorada para formatar tempo
function formatarTempo(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms/1000).toFixed(1)}s`;
    return `${(ms/60000).toFixed(1)}min`;
}

// ============================================================================
// FIM PARTE 7: FUNÇÕES DE CHAMADA DE API
// ============================================================================



// ============================================================================
// INÍCIO: SISTEMA DE TESTE DE MODELOS
// ============================================================================

// Função para testar quais modelos estão online
async function testarModelosHF() {
    console.log('🧪 INICIANDO TESTE DE MODELOS HUGGING FACE...');
    const chave = getAPIKey();
    
    if (!chave) {
        console.error('❌ Nenhuma chave API configurada');
        return;
    }
    
    const resultados = [];
    const prompt = "beautiful landscape, high quality";
    
    for (const modelo of modelosHFPrioritarios) {
        console.log(`📡 Testando ${modelo.nome}...`);
        
        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${modelo.url}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${chave}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: modelo.parametros_customizados
                    })
                }
            );
            
            if (response.ok) {
                console.log(`✅ ${modelo.nome} - FUNCIONANDO`);
                resultados.push({
                    nome: modelo.nome,
                    url: modelo.url,
                    status: 'OK',
                    categoria: modelo.categoria
                });
            } else {
                console.log(`❌ ${modelo.nome} - Status ${response.status}`);
                resultados.push({
                    nome: modelo.nome,
                    url: modelo.url,
                    status: `Erro ${response.status}`,
                    categoria: modelo.categoria
                });
            }
            
            // Pequena pausa entre testes
            await new Promise(r => setTimeout(r, 1000));
            
        } catch (error) {
            console.log(`❌ ${modelo.nome} - ${error.message}`);
            resultados.push({
                nome: modelo.nome,
                url: modelo.url,
                status: 'Erro',
                categoria: modelo.categoria
            });
        }
    }
    
    // Mostrar relatório
    console.table(resultados);
    
    const funcionando = resultados.filter(r => r.status === 'OK');
    console.log(`📊 RESULTADO: ${funcionando.length}/${modelosHFPrioritarios.length} modelos funcionando`);
    
    // Salvar modelos funcionais no localStorage
    if (funcionando.length > 0) {
        localStorage.setItem('modelos_funcionais', JSON.stringify(funcionando));
        console.log('💾 Modelos funcionais salvos no cache');
    }
    
    return funcionando;
}

// Função para obter apenas modelos que funcionaram no último teste
function obterModelosFuncionais() {
    const cached = localStorage.getItem('modelos_funcionais');
    if (cached) {
        const modelos = JSON.parse(cached);
        console.log(`📦 ${modelos.length} modelos funcionais em cache`);
        return modelos.map(m => m.url);
    }
    return null;
}

// Função auxiliar de seleção inteligente de modelos
function selecionarModeloPorEstilo(estilo, categoria = null) {
    let modelosFiltrados = modelosHFPrioritarios;
    
    // Priorizar modelos que sabemos que funcionam
    const modelosFuncionais = obterModelosFuncionais();
    if (modelosFuncionais) {
        modelosFiltrados = modelosFiltrados.filter(m => 
            modelosFuncionais.includes(m.url)
        );
        console.log(`🎯 Usando apenas ${modelosFiltrados.length} modelos testados`);
    }
    
    // Filtrar por categoria se especificada
    if (categoria) {
        modelosFiltrados = modelosFiltrados.filter(m => m.categoria === categoria);
    }
    
    // Para estilo barroco, priorizar modelos artísticos e clássicos
    if (estilo === 'BARROCO') {
        const categoriasPrioritarias = ['artistico', 'classico', 'base'];
        modelosFiltrados = modelosFiltrados.filter(m => 
            categoriasPrioritarias.includes(m.categoria)
        );
    }
    
    // Para estilo renascentista, priorizar modelos realistas
    if (estilo === 'RENASCENTISTA') {
        const categoriasPrioritarias = ['fotorealista', 'artistico', 'base'];
        modelosFiltrados = modelosFiltrados.filter(m => 
            categoriasPrioritarias.includes(m.categoria)
        );
    }
    
    // Ordenar por confiabilidade
    modelosFiltrados.sort((a, b) => b.confiabilidade - a.confiabilidade);
    
    // Retornar top 5 modelos
    return modelosFiltrados.slice(0, 5);
}

// ============================================================================
// FIM: SISTEMA DE TESTE DE MODELOS
// ============================================================================




// ============================================================================
// INÍCIO PARTE 8: SISTEMA DE CANVAS E EXIBIÇÃO DE IMAGEM
// ============================================================================

// Exibir imagem no canvas com texto automaticamente
async function exibirImagemComTexto(blob) {
    console.log('🖼️ Exibindo imagem com texto...');
    
    const canvas = document.getElementById('canvasImagem');
    if (!canvas || canvas.tagName !== 'CANVAS') {
        console.error('❌ Canvas não encontrado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const imagemURL = URL.createObjectURL(blob);
    
    img.onload = function() {
        console.log(`✅ Imagem carregada: ${img.width}x${img.height}`);
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        if (versiculoAtual) {
            adicionarTextoEleganteNoCanvas(ctx, canvas);
        }
        
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 1s';
        setTimeout(() => {
            canvas.style.opacity = '1';
        }, 50);
        
        URL.revokeObjectURL(imagemURL);
        
        const btnBaixar = document.getElementById('baixarImagem');
        if (btnBaixar) btnBaixar.disabled = false;
        
        console.log('✅ Imagem e texto prontos!');
    };
    
    img.onerror = function() {
        console.error('❌ Erro ao carregar imagem');
        URL.revokeObjectURL(imagemURL);
    };
    
    img.src = imagemURL;
}

// Adicionar texto elegante no canvas
function adicionarTextoEleganteNoCanvas(ctx, canvas) {
    if (!versiculoAtual) return;
    
    const posicao = document.getElementById('posicaoTexto')?.value || 'bottom';
    const qualidade = document.getElementById('qualidadeImagem')?.value || 'alta';
    
    console.log(`📝 Adicionando texto: posição=${posicao}, qualidade=${qualidade}`);
    
    const overlayHeight = 150;
    let overlayY;
    
    switch(posicao) {
        case 'top':
            overlayY = 0;
            break;
        case 'center':
            overlayY = (canvas.height - overlayHeight) / 2;
            break;
        case 'bottom':
        default:
            overlayY = canvas.height - overlayHeight;
    }
    
    // Desenhar fundo semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);
    
    // Adicionar gradiente
    const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);
    
    // Configurar texto
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const maxWidth = canvas.width - 80;
    const palavras = versiculoAtual.texto.split(' ');
    const linhas = [];
    let linhaAtual = '';
    
    const tamanhoFonte = qualidade === 'alta' ? 32 : 24;
    ctx.font = `bold ${tamanhoFonte}px 'Segoe UI', Arial, sans-serif`;
    
    // Criar linhas
    for (const palavra of palavras) {
        const teste = linhaAtual + palavra + ' ';
        const medida = ctx.measureText(teste);
        
        if (medida.width > maxWidth && linhaAtual !== '') {
            linhas.push(linhaAtual.trim());
            linhaAtual = palavra + ' ';
        } else {
            linhaAtual = teste;
        }
    }
    linhas.push(linhaAtual.trim());
    
    const alturaLinha = tamanhoFonte * 1.2;
    const alturaTotal = linhas.length * alturaLinha + 30;
    const yInicial = overlayY + (overlayHeight - alturaTotal) / 2 + alturaLinha / 2;
    
    // Desenhar texto com sombra
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    linhas.forEach((linha, index) => {
        const y = yInicial + (index * alturaLinha);
        ctx.fillText(linha, canvas.width / 2, y);
    });
    
    // Adicionar referência
    ctx.font = `italic ${tamanhoFonte * 0.6}px 'Georgia', serif`;
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 3;
    
    const yReferencia = yInicial + (linhas.length * alturaLinha) + 10;
    ctx.fillText(`— ${versiculoAtual.referencia}`, canvas.width / 2, yReferencia);
    
    // Limpar sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    console.log(`✅ Texto adicionado: ${linhas.length} linhas`);
}

// Wrapper para compatibilidade
async function exibirImagem(blob) {
    return exibirImagemComTexto(blob);
}

// Gerar arte local como fallback
async function gerarArteLocal(prompt, tema, estilo) {
    console.log('🎨 Gerando arte local com Canvas...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    const paletas = {
        BARROCO: {
            fundo: ['#1a0f0a', '#2d1810', '#3d251a'],
            luz: ['#ffd700', '#ffed4e', '#fff59d'],
            sombra: ['#000000', '#1a1a1a', '#2e2e2e']
        },
        RENASCENTISTA: {
            fundo: ['#e8dcc6', '#f5e6d3', '#faf8f1'],
            luz: ['#fff3e0', '#ffe0b2', '#ffcc80'],
            sombra: ['#5d4037', '#6d4c41', '#795548']
        }
    };
    
    const paleta = paletas[estilo] || paletas.BARROCO;
    
    // Criar gradiente de fundo
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 600);
    gradient.addColorStop(0, paleta.luz[0]);
    gradient.addColorStop(0.5, paleta.luz[1]);
    gradient.addColorStop(1, paleta.fundo[0]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar raios de luz
    ctx.globalAlpha = 0.3;
    
    for (let i = 0; i < 12; i++) {
        ctx.save();
        ctx.translate(512, 200);
        ctx.rotate((Math.PI * 2 * i) / 12);
        
        const rayGradient = ctx.createLinearGradient(0, 0, 0, 400);
        rayGradient.addColorStop(0, paleta.luz[0]);
        rayGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = rayGradient;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.lineTo(10, 400);
        ctx.lineTo(-10, 400);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    ctx.globalAlpha = 1;
    
    // Converter para blob
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            console.log('✅ Arte local gerada com sucesso!');
            mostrarToast('🎨 Arte criada localmente', 'success');
            ultimaImagemBlob = blob;
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
}

// ============================================================================
// FIM PARTE 8: SISTEMA DE CANVAS E EXIBIÇÃO DE IMAGEM
// ============================================================================

// ============================================================================
// INÍCIO PARTE 9: FUNÇÕES PRINCIPAIS DE GERAÇÃO
// ============================================================================

// Função principal para gerar versículo com IA
async function gerarVersiculoComIA(versiculo, tema) {
    console.log('🚀 Gerando versículo com IA...');
    console.log(`📖 Versículo: "${versiculo.texto}"`);
    console.log(`🎯 Tema: ${tema}`);
    
    try {
        const promptBase = criarPromptBase(versiculo, tema);
        const imagemBlob = await tentarGerarImagemIA(promptBase, tema);
        
        if (imagemBlob) {
            await exibirImagemComTexto(imagemBlob);
            
            historicoImagens.push({
                versiculo: versiculo,
                tema: tema,
                timestamp: new Date().toISOString(),
                tamanho: imagemBlob.size
            });
            
            console.log('✅ Imagem gerada com IA baseada no versículo!');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Erro ao gerar imagem:', error);
        mostrarToast('Erro ao gerar imagem', 'error');
        return false;
    }
}

// Atualizar interface com versículo atual
function atualizarInterface() {
    if (!versiculoAtual) {
        console.error('❌ Nenhum versículo atual definido');
        return;
    }
    
    console.log('📝 Atualizando texto do versículo...');
    
    const elementoTexto = document.getElementById('versiculoTexto');
    if (elementoTexto) {
        elementoTexto.textContent = versiculoAtual.texto;
        elementoTexto.style.opacity = '0';
        setTimeout(() => {
            elementoTexto.style.transition = 'opacity 1s';
            elementoTexto.style.opacity = '1';
        }, 100);
        console.log('✅ Texto atualizado');
    }
    
    const elementoReferencia = document.getElementById('versiculoReferencia');
    if (elementoReferencia) {
        elementoReferencia.textContent = versiculoAtual.referencia;
        console.log('✅ Referência atualizada');
    }
    
    const contador = document.getElementById('contadorVersiculos');
    if (contador) {
        const count = parseInt(contador.textContent || '0') + 1;
        contador.textContent = count;
        console.log(`✅ Contador: ${count}`);
    }
}

// ============================================================================
// FIM PARTE 9: FUNÇÕES PRINCIPAIS DE GERAÇÃO
// ============================================================================

// ============================================================================
// INÍCIO PARTE 10: CARREGAMENTO DE VERSÍCULOS
// ============================================================================

// Normaliza qualquer formato em um array [{texto, referencia, tema}]
function normalizarVersiculos(data) {
  // Se vier como { versiculos: [...] }
  if (Array.isArray(data?.versiculos)) return data.versiculos;

  // Se já for um array na raiz
  if (Array.isArray(data)) return data;

  // Se vier agrupado por tema: { "esperanca": [...], "amor": [...] }
  if (data && typeof data === 'object') {
    const lista = [];
    for (const [tema, arr] of Object.entries(data)) {
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        if (item && item.texto && item.referencia) {
          lista.push({ texto: item.texto, referencia: item.referencia, tema });
        }
      }
    }
    return lista;
  }

  return [];
}

// Substitua sua carregarVersiculos por esta
async function carregarVersiculos() {
  console.log('📚 Carregando versículos...');
  try {
    const response = await fetch('versiculos.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    versiculos = normalizarVersiculos(data);

    const total = Array.isArray(versiculos) ? versiculos.length : 0;
    console.log(`✅ ${total} versículos carregados`);

    if (total === 0) throw new Error('Formato inválido ou vazio');

    const temas = [...new Set(versiculos.map(v => v.tema).filter(Boolean))];
    popularTemas(temas);

    await gerarNovoVersiculo();
  } catch (error) {
    console.error('❌ Erro ao carregar versículos:', error);
    versiculos = obterVersiculosFallback();
    console.log('📚 Usando versículos de fallback');
    const temasFallback = [...new Set(versiculos.map(v => v.tema).filter(Boolean))];
    popularTemas(temasFallback);
    await gerarNovoVersiculo();
  }
}
// Popular dropdown de temas
function popularTemas(temas) {
    const selectTema = document.getElementById('temaEscolhido');
    
    if (selectTema && temas.length > 0) {
        selectTema.innerHTML = '<option value="">Todos os temas</option>';
        
        temas.forEach(tema => {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema.charAt(0).toUpperCase() + tema.slice(1);
            selectTema.appendChild(option);
        });
    }
}

// Obter versículos de fallback
function obterVersiculosFallback() {
    return [
        {
            texto: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
            referencia: "Jeremias 29:11",
            tema: "esperanca"
        },
        {
            texto: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.",
            referencia: "Provérbios 3:5",
            tema: "fe"
        },
        {
            texto: "O Senhor é o meu pastor, nada me faltará.",
            referencia: "Salmos 23:1",
            tema: "paz"
        },
        {
            texto: "Tudo posso naquele que me fortalece.",
            referencia: "Filipenses 4:13",
            tema: "forca"
        },
        {
            texto: "O amor é paciente, é benigno; o amor não é invejoso, não se vangloria, não se ensoberbece.",
            referencia: "1 Coríntios 13:4",
            tema: "amor"
        },
        {
            texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
            referencia: "João 3:16",
            tema: "amor"
        },
        {
            texto: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te esforço, e te ajudo, e te sustento com a destra da minha justiça.",
            referencia: "Isaías 41:10",
            tema: "forca"
        },
        {
            texto: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.",
            referencia: "Salmos 37:5",
            tema: "fe"
        },
        {
            texto: "Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum de seus benefícios.",
            referencia: "Salmos 103:2",
            tema: "gratidao"
        },
        {
            texto: "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que não se veem.",
            referencia: "Hebreus 11:1",
            tema: "fe"
        }
    ];
}

// ============================================================================
// FIM PARTE 10: CARREGAMENTO DE VERSÍCULOS
// ============================================================================

// ============================================================================
// INÍCIO PARTE 11: GERAÇÃO E MANIPULAÇÃO DE VERSÍCULOS
// ============================================================================

// Gerar novo versículo
async function gerarNovoVersiculo() {
    console.log('🎲 Gerando novo versículo...');
    
    const temaEscolhido = document.getElementById('temaEscolhido')?.value || '';
    
    let versiculosDisponiveis = versiculos;
    if (temaEscolhido) {
        versiculosDisponiveis = versiculos.filter(v => v.tema === temaEscolhido);
        console.log(`🎯 Filtrando por tema: ${temaEscolhido}`);
    }
    
    if (versiculosDisponiveis.length > 0) {
        const indice = Math.floor(Math.random() * versiculosDisponiveis.length);
        versiculoAtual = versiculosDisponiveis[indice];
        temaAtual = versiculoAtual.tema;
        
        console.log(`📖 Versículo escolhido: ${versiculoAtual.referencia}`);
        
        atualizarInterface();
        await gerarVersiculoComIA(versiculoAtual, temaAtual);
    } else {
        console.log('⚠️ Nenhum versículo disponível para o tema selecionado');
        mostrarToast('Nenhum versículo encontrado para este tema', 'error');
    }
}

// ============================================================================
// FIM PARTE 11: GERAÇÃO E MANIPULAÇÃO DE VERSÍCULOS
// ============================================================================

// ============================================================================
// INÍCIO PARTE 12: SISTEMA DE COMPARTILHAMENTO E DOWNLOAD
// ============================================================================



// Função principal de compartilhamento
async function compartilharVersiculo(plataforma = null) {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum versículo para compartilhar', 'error');
        return;
    }
    
    console.log(`📤 Iniciando compartilhamento: ${plataforma || 'nativo'}`);
    
    try {
        // Preparar dados para compartilhamento
        const dados = await prepararDadosCompartilhamento();
        
        if (plataforma) {
            // Compartilhar em plataforma específica
            await compartilharPlataforma(plataforma, dados);
        } else {
            // Usar Web Share API (nativo do navegador)
            await compartilharNativo(dados);
        }
        
    } catch (error) {
        console.error('❌ Erro no compartilhamento:', error);
        mostrarToast(`❌ Erro ao compartilhar: ${error.message}`, 'error');
        throw error;
    }
}

// Preparar dados do versículo para compartilhamento
async function prepararDadosCompartilhamento() {
    const { versiculo, referencia } = versiculoAtual;
    
    // Texto para compartilhamento
    const texto = `"${versiculo}"\n\n📖 ${referencia}\n\n✨ Versículo gerado em: ${window.location.hostname || 'Versículos Inspiradores'}`;
    
    // URL da página
    const url = window.location.href;
    
    // Tentar converter canvas para blob para compartilhamento
    let imageBlob = null;
    try {
        const canvas = document.getElementById('canvasImagem');
        if (canvas) {
            imageBlob = await new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Falha ao gerar imagem'));
                }, 'image/png', 0.95);
            });
            console.log('📷 Imagem preparada para compartilhamento:', imageBlob.size, 'bytes');
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível preparar imagem para compartilhamento:', error);
    }
    
    return {
        titulo: `Versículo: ${referencia}`,
        texto: texto,
        textoEncoded: encodeURIComponent(texto),
        url: url,
        urlEncoded: encodeURIComponent(url),
        imageBlob: imageBlob,
        versiculoSimples: versiculo,
        referenciaSimples: referencia
    };
}

// Compartilhamento nativo (Web Share API)
async function compartilharNativo(dados) {
    console.log('🌐 Tentando compartilhamento nativo...');
    
    if (navigator.share) {
        const shareData = {
            title: dados.titulo,
            text: dados.texto,
            url: dados.url
        };
        
        // Verificar se suporta compartilhamento de arquivos
        if (dados.imageBlob && navigator.canShare) {
            const arquivo = new File([dados.imageBlob], 'versiculo.png', { type: 'image/png' });
            
            if (navigator.canShare({ files: [arquivo] })) {
                shareData.files = [arquivo];
                console.log('📷 Compartilhando com imagem');
            }
        }
        
        await navigator.share(shareData);
        console.log('✅ Compartilhado via Web Share API');
        mostrarToast('✅ Compartilhado com sucesso!', 'success');
        
    } else {
        // Fallback: copiar para clipboard
        console.log('📋 Web Share não disponível, copiando para clipboard...');
        await copiarParaClipboard(dados.texto);
        mostrarToast('📋 Texto copiado para a área de transferência!', 'success');
    }
}

// Compartilhar em plataforma específica
async function compartilharPlataforma(plataforma, dados) {
    const configuracoes = obterConfiguracaoPlataforma(plataforma, dados);
    
    if (!configuracoes.url) {
        throw new Error(`Plataforma "${plataforma}" não suportada`);
    }
    
    console.log(`📱 Abrindo ${plataforma}:`, configuracoes.url.substring(0, 100) + '...');
    
    // Abrir em nova janela/aba
    const janela = window.open(
        configuracoes.url, 
        '_blank', 
        configuracoes.opcoesPoup || 'width=600,height=400,scrollbars=yes,resizable=yes'
    );
    
    if (!janela) {
        // Se o popup foi bloqueado, tentar redirect direto
        console.warn('⚠️ Popup bloqueado, tentando redirect...');
        window.location.href = configuracoes.url;
    } else {
        mostrarToast(`📱 Compartilhando no ${plataforma}...`, 'success');
        
        // Fechar janela automaticamente após alguns segundos (opcional)
        if (configuracoes.autoFechar) {
            setTimeout(() => {
                try {
                    if (janela && !janela.closed) {
                        janela.close();
                    }
                } catch (e) {
                    console.warn('⚠️ Não foi possível fechar janela automaticamente');
                }
            }, 5000);
        }
    }
}

// Obter configuração específica de cada plataforma
function obterConfiguracaoPlataforma(plataforma, dados) {
    const configuracoes = {
        whatsapp: {
            url: `https://wa.me/?text=${dados.textoEncoded}`,
            opcoesPoup: 'width=400,height=600',
            autoFechar: true
        },
        facebook: {
            url: `https://www.facebook.com/sharer/sharer.php?u=${dados.urlEncoded}&quote=${encodeURIComponent(dados.versiculoSimples + ' - ' + dados.referenciaSimples)}`,
            opcoesPoup: 'width=600,height=400',
            autoFechar: true
        },
        twitter: {
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(dados.versiculoSimples + ' - ' + dados.referenciaSimples)}&url=${dados.urlEncoded}&hashtags=versiculo,biblia,fe`,
            opcoesPoup: 'width=550,height=420',
            autoFechar: true
        },
        telegram: {
            url: `https://t.me/share/url?url=${dados.urlEncoded}&text=${dados.textoEncoded}`,
            opcoesPoup: 'width=500,height=400',
            autoFechar: true
        },
        linkedin: {
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${dados.urlEncoded}&summary=${encodeURIComponent(dados.versiculoSimples)}`,
            opcoesPoup: 'width=550,height=400',
            autoFechar: true
        },
        email: {
            url: `mailto:?subject=${encodeURIComponent(dados.titulo)}&body=${dados.textoEncoded}`,
            opcoesPoup: null,
            autoFechar: false
        }
    };
    
    return configuracoes[plataforma.toLowerCase()] || {};
}

// Função auxiliar para copiar texto
async function copiarParaClipboard(texto) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(texto);
            console.log('📋 Copiado via Clipboard API');
        } else {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = texto;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const sucesso = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (!sucesso) {
                throw new Error('Comando copy não suportado');
            }
            
            console.log('📋 Copiado via execCommand');
        }
    } catch (error) {
        console.error('❌ Erro ao copiar:', error);
        throw new Error('Não foi possível copiar o texto');
    }
}

// Funções com feedback visual para cada botão
async function compartilharWhatsApp() {
    const seletor = '.btn-social.whatsapp';
    
    try {
        adicionarEstadoBotao(seletor, 'loading');
        console.log('📱 Compartilhando no WhatsApp...');
        
        await compartilharVersiculo('whatsapp');
        adicionarFeedbackBotao(seletor, 'success');
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'whatsapp' });
        }
        
    } catch (error) {
        console.error('❌ Erro WhatsApp:', error);
        adicionarFeedbackBotao(seletor, 'error');
    } finally {
        removerEstadoBotao(seletor, 'loading');
    }
}

async function compartilharFacebook() {
    const seletor = '.btn-social.facebook';
    
    try {
        adicionarEstadoBotao(seletor, 'loading');
        console.log('👥 Compartilhando no Facebook...');
        
        await compartilharVersiculo('facebook');
        adicionarFeedbackBotao(seletor, 'success');
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'facebook' });
        }
        
    } catch (error) {
        console.error('❌ Erro Facebook:', error);
        adicionarFeedbackBotao(seletor, 'error');
    } finally {
        removerEstadoBotao(seletor, 'loading');
    }
}

async function compartilharTwitter() {
    const seletor = '.btn-social.twitter';
    
    try {
        adicionarEstadoBotao(seletor, 'loading');
        console.log('🐦 Compartilhando no Twitter...');
        
        await compartilharVersiculo('twitter');
        adicionarFeedbackBotao(seletor, 'success');
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'twitter' });
        }
        
    } catch (error) {
        console.error('❌ Erro Twitter:', error);
        adicionarFeedbackBotao(seletor, 'error');
    } finally {
        removerEstadoBotao(seletor, 'loading');
    }
}

async function compartilharTelegram() {
    const seletor = '.btn-social.telegram';
    
    try {
        adicionarEstadoBotao(seletor, 'loading');
        console.log('💬 Compartilhando no Telegram...');
        
        await compartilharVersiculo('telegram');
        adicionarFeedbackBotao(seletor, 'success');
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'telegram' });
        }
        
    } catch (error) {
        console.error('❌ Erro Telegram:', error);
        adicionarFeedbackBotao(seletor, 'error');
    } finally {
        removerEstadoBotao(seletor, 'loading');
    }
}

async function compartilharEmail() {
    const seletor = '.btn-social.email';
    
    try {
        adicionarEstadoBotao(seletor, 'loading');
        console.log('📧 Compartilhando por email...');
        
        await compartilharVersiculo('email');
        adicionarFeedbackBotao(seletor, 'success');
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'email' });
        }
        
    } catch (error) {
        console.error('❌ Erro Email:', error);
        adicionarFeedbackBotao(seletor, 'error');
    } finally {
        removerEstadoBotao(seletor, 'loading');
    }
}

// Funções auxiliares para feedback visual
function adicionarEstadoBotao(seletor, estado) {
    const botao = document.querySelector(seletor);
    if (botao) {
        botao.classList.add(estado);
    }
}

function removerEstadoBotao(seletor, estado) {
    const botao = document.querySelector(seletor);
    if (botao) {
        botao.classList.remove(estado);
    }
}

function adicionarFeedbackBotao(seletor, tipo, duracao = 2000) {
    const botao = document.querySelector(seletor);
    if (!botao) return;
    
    // Remover estados anteriores
    botao.classList.remove('success', 'error', 'loading');
    
    // Adicionar novo estado
    botao.classList.add(tipo);
    
    // Remover após duração especificada
    setTimeout(() => {
        botao.classList.remove(tipo);
    }, duracao);
}

// Função para compartilhamento em massa (todas as redes)
async function compartilharTodasRedes() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum versículo para compartilhar', 'error');
        return;
    }
    
    console.log('🚀 Compartilhamento em massa iniciado');
    mostrarToast('📤 Preparando compartilhamento...', 'info');
    
    // Mostrar modal de opções
    const opcoes = ['whatsapp', 'facebook', 'twitter', 'telegram', 'email'];
    const promises = [];
    
    for (const plataforma of opcoes) {
        // Adicionar pequeno delay entre as chamadas
        promises.push(
            new Promise(resolve => {
                setTimeout(async () => {
                    try {
                        await compartilharVersiculo(plataforma);
                        resolve({ plataforma, sucesso: true });
                    } catch (error) {
                        resolve({ plataforma, sucesso: false, erro: error.message });
                    }
                }, Math.random() * 1000);
            })
        );
    }
    
    const resultados = await Promise.all(promises);
    
    const sucessos = resultados.filter(r => r.sucesso).length;
    mostrarToast(`✅ Compartilhado em ${sucessos}/${opcoes.length} redes`, 'success');
    
    console.log('📊 Resultados do compartilhamento:', resultados);
}


// ============================================================================
// FIM DO SISTEMA DE COMPARTILHAMENTO
// ============================================================================

// ============================================================================
// FIM PARTE 12: SISTEMA DE COMPARTILHAMENTO E DOWNLOAD
// ============================================================================

// ============================================================================
// INÍCIO PARTE 13: EVENTOS E INICIALIZAÇÃO
// ============================================================================

// Configurar eventos
function configurarEventos() {
    console.log('⚙️ Configurando eventos...');
    
    const btnGerar = document.getElementById('gerarVersiculo');
    if (btnGerar) {
        btnGerar.addEventListener('click', async () => {
            btnGerar.disabled = true;
            btnGerar.textContent = 'Gerando...';
            
            await gerarNovoVersiculo();
            
            btnGerar.disabled = false;
            btnGerar.textContent = 'Gerar Novo Versículo';
        });
        console.log('✅ Evento: Gerar Versículo configurado');
    }
    
    const selectTema = document.getElementById('temaEscolhido');
    if (selectTema) {
        selectTema.addEventListener('change', async () => {
            console.log(`🎯 Tema alterado para: ${selectTema.value}`);
            await gerarNovoVersiculo();
        });
        console.log('✅ Evento: Mudança de Tema configurado');
    }
    
    const selectPosicao = document.getElementById('posicaoTexto');
    if (selectPosicao) {
        selectPosicao.addEventListener('change', async () => {
            console.log('📍 Mudando posição do texto...');
            if (ultimaImagemBlob) {
                await exibirImagemComTexto(ultimaImagemBlob);
            }
        });
        console.log('✅ Evento: Posição Texto configurado');
    }
    
    const selectQualidade = document.getElementById('qualidadeImagem');
    if (selectQualidade) {
        selectQualidade.addEventListener('change', async () => {
            console.log('🎨 Mudando qualidade...');
            if (ultimaImagemBlob) {
                await exibirImagemComTexto(ultimaImagemBlob);
            }
        });
        console.log('✅ Evento: Qualidade configurado');
    }
    
    const btnBaixar = document.getElementById('baixarImagem');
    if (btnBaixar) {
        btnBaixar.addEventListener('click', baixarImagem);
        console.log('✅ Evento: Baixar Imagem configurado');
    }
    
    const btnCopiar = document.getElementById('copiarTexto');
    if (btnCopiar) {
        btnCopiar.addEventListener('click', () => {
            if (versiculoAtual) {
                const texto = `${versiculoAtual.texto}\n- ${versiculoAtual.referencia}`;
                copiarTextoParaClipboard(texto);
            }
        });
        console.log('✅ Evento: Copiar Texto configurado');
    }
    
    const btnCompartilhar = document.getElementById('compartilhar');
    if (btnCompartilhar) {
        btnCompartilhar.addEventListener('click', compartilharVersiculo);
        console.log('✅ Evento: Compartilhar configurado');
    }
    
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            gerarNovoVersiculo();
        }
        if (e.key === 's' && e.ctrlKey) {
            e.preventDefault();
            baixarImagem();
        }
    });
}

// Funções de debug
function debugElementosDOM() {
    console.log('🔍 === DEBUG DE ELEMENTOS DOM ===');
    
    const todosElementos = document.querySelectorAll('[id]');
    console.log(`📋 Total de elementos com ID: ${todosElementos.length}`);
    
    const relevantes = Array.from(todosElementos).filter(el => {
        const id = el.id.toLowerCase();
        return id.includes('versiculo') || 
               id.includes('texto') || 
               id.includes('referencia') || 
               id.includes('imagem') || 
               id.includes('canvas');
    });
    
    console.log('📝 Elementos relevantes encontrados:');
    relevantes.forEach(el => {
        console.log(`  - ID: "${el.id}" | Tag: <${el.tagName.toLowerCase()}> | Classes: "${el.className}"`);
    });
    
    const imagens = document.querySelectorAll('img');
    console.log(`🖼️ Total de imagens: ${imagens.length}`);
    
    return relevantes;
}

// Teste com imagem de exemplo
async function testarComImagemExemplo() {
    console.log('🧪 Testando com imagem de exemplo...');
    
    try {
        const response = await fetch('https://picsum.photos/800/600');
        const blob = await response.blob();
        
        versiculoAtual = {
            texto: "Este é um teste do sistema de geração de imagens com versículos bíblicos",
            referencia: "Teste 1:1",
            tema: "teste"
        };
        
        atualizarInterface();
        await exibirImagemComTexto(blob);
        
        console.log('✅ Teste concluído!');
        return true;
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return false;
    }
}

// Inicialização principal
async function inicializarSistema() {
    console.log('🔍 INICIANDO SISTEMA...');
    console.log('✅ Script de Versículos IA v3.2 carregado!');
    
    debugElementosDOM();
    configurarEventos();
    
    const chaveValida = await verificarChaveAPI();
    if (chaveValida) {
        console.log('🔑 Chave API válida e pronta para uso');
    } else {
        console.log('⚠️ Usando apenas APIs gratuitas');
    }
    
    await carregarVersiculos();
    
    console.log('📊 Estatísticas:', stats.totalGerado, 'imagens geradas');
    console.log('🚀 Sistema inicializado completamente!');
}

// Event listener principal
document.addEventListener('DOMContentLoaded', inicializarSistema);

// Exportar funções para debug no console
window.debugFunctions = {
    definirChave: definirChaveManualmente,
    verificarChave: verificarChaveAPI,
    gerarVersiculo: gerarNovoVersiculo,
    testarImagem: testarComImagemExemplo,
    adicionarTexto: () => {
        const canvas = document.getElementById('canvasImagem');
        if (canvas && versiculoAtual) {
            const ctx = canvas.getContext('2d');
            adicionarTextoEleganteNoCanvas(ctx, canvas);
        }
    },
    baixar: baixarImagem,
    compartilhar: compartilharVersiculo,
    stats: () => console.table(stats),
    limparCache: () => {
        localStorage.clear();
        console.log('🧹 Cache limpo');
    },
    debug: debugElementosDOM,
    resetar: () => {
        versiculoAtual = null;
        ultimaImagemBlob = null;
        console.log('🔄 Sistema resetado');
    }
};

console.log('💡 Dica: Use window.debugFunctions para acessar funções de debug');
console.log('💡 Teste rápido: window.debugFunctions.testarImagem()');
console.log('💡 Ver estatísticas: window.debugFunctions.stats()');

// ============================================================================
// FIM PARTE 13: EVENTOS E INICIALIZAÇÃO
// ============================================================================

// ============================================================================
// FIM DO ARQUIVO SCRIPT.JS - VERSÃO COMPLETA 3.2
// ============================================================================


