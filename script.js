// ============================================================================
// INÍCIO PARTE 1: CONFIGURAÇÕES GLOBAIS E CONSTANTES
// ============================================================================

// Configurações principais
const CONFIG = {
    VERSION: '2.0.0',
    DEBUG: true,
    API_TIMEOUT: 30000,
    MAX_RETRIES: 3,
    DELAY_BETWEEN_ATTEMPTS: 1000
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

// ============================================================================
// FIM PARTE 1: CONFIGURAÇÕES GLOBAIS E CONSTANTES
// ============================================================================

// ============================================================================
// INÍCIO PARTE 2: DEFINIÇÕES DE ESTILOS ARTÍSTICOS
// ============================================================================

const estilosArtisticos = {
    BARROCO: {
        nome: "Barroco",
        periodo: "séculos XVII-XVIII",
        peso: 0.6, // 60% de chance
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
        peso: 0.4, // 40% de chance
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

// Modelos Hugging Face prioritários (testados e funcionais)
const modelosHFPrioritarios = [
    {
        nome: "SDXL Base 1.0",
        url: "stabilityai/stable-diffusion-xl-base-1.0",
        categoria: "alta",
        confiabilidade: 10,
        tempo_estimado: "30-60s",
        parametros_customizados: {
            num_inference_steps: 50,
            guidance_scale: 8.5,
            width: 1024,
            height: 1024
        }
    },
    {
        nome: "SDXL Turbo",
        url: "stabilityai/sdxl-turbo",
        categoria: "rapida",
        confiabilidade: 8,
        tempo_estimado: "10-20s",
        parametros_customizados: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024
        }
    }
];

// APIs alternativas (sem necessidade de chave)
const apisAlternativas = [
    {
        nome: "Pollinations AI",
        confiabilidade: 9,
        funcao: async (prompt) => {
            const encodedPrompt = encodeURIComponent(prompt);
            const seed = Math.floor(Math.random() * 1000000);
            const url = `${API_URLS.POLLINATIONS}${encodedPrompt}?width=1024&height=1024&model=flux&enhance=true&nologo=true&seed=${seed}`;
            
            console.log('🔄 Gerando com Pollinations...');
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            
            const blob = await response.blob();
            if (blob.size < 5000) throw new Error('Imagem muito pequena');
            
            return blob;
        }
    },
    {
        nome: "Pollinations Turbo",
        confiabilidade: 7,
        funcao: async (prompt) => {
            const encodedPrompt = encodeURIComponent(prompt);
            const url = `${API_URLS.POLLINATIONS}${encodedPrompt}?width=512&height=512&model=turbo&enhance=false&nologo=true`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return await response.blob();
        }
    }
];

// Parâmetros específicos por estilo
const parametrosEstilos = {
    BARROCO: {
        num_inference_steps: 45,
        guidance_scale: 11.5,
        temperature: 0.8,
        top_p: 0.92
    },
    RENASCENTISTA: {
        num_inference_steps: 50,
        guidance_scale: 9.5,
        temperature: 0.7,
        top_p: 0.9
    }
};

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
    // 1. CONFIG do GitHub Actions (produção)
    if (typeof window !== 'undefined' && window.CONFIG?.HUGGING_FACE_API_KEY) {
        const chave = window.CONFIG.HUGGING_FACE_API_KEY;
        if (chave && chave !== '{{ HUGGING_FACE_API_KEY }}' && chave.startsWith('hf_')) {
            console.log('🔑 Usando chave do CONFIG (produção segura)');
            return chave;
        }
    }
    
    // 2. Variável global (desenvolvimento)
    if (typeof HUGGING_FACE_API_KEY !== 'undefined' && 
        HUGGING_FACE_API_KEY && 
        HUGGING_FACE_API_KEY !== 'SUA_CHAVE_AQUI' && 
        HUGGING_FACE_API_KEY.startsWith('hf_')) {
        console.log('🔑 Usando chave local (desenvolvimento)');
        return HUGGING_FACE_API_KEY;
    }
    
    // 3. localStorage (usuário definiu manualmente)
    const storedKey = localStorage.getItem('hf_api_key');
    if (storedKey?.startsWith('hf_')) {
        console.log('🔑 Usando chave do localStorage');
        return storedKey;
    }
    
    // 4. Chave manual temporária
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
    
    return "BARROCO"; // Fallback seguro
}

// Gerar prompt estilizado com elementos históricos
function gerarPromptEstilizado(promptBase) {
    const estiloEscolhido = escolherEstiloAleatorio();
    const config = estilosArtisticos[estiloEscolhido];
    
    // Escolher elemento histórico aleatório
    const elementos = elementosHistoricos[estiloEscolhido];
    const elementoAleatorio = elementos[Math.floor(Math.random() * elementos.length)];
    
    // Escolher artistas de referência
    const artistasRef = config.artistas.slice(0, 2).join(" and ");
    
    // Construir prompt completo
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
    
    // Log detalhado
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

// Chamar API Hugging Face com segurança e retry
async function chamarAPIHuggingFaceSeguro(url, prompt, parametros) {
    const chave = getAPIKey();
    if (!chave) {
        throw new Error('🔑 Chave API não configurada ou inválida');
    }
    
    const tentarChamada = async (tentativa = 1) => {
        try {
            console.log(`🔄 Chamando: ${url.split('/').pop()} (tentativa ${tentativa})`);
            
            const response = await fetch(API_URLS.HUGGING_FACE_BASE + url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${chave}`,
                    'Content-Type': 'application/json',
                    'x-wait-for-model': 'true'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: parametros
                }),
                signal: AbortSignal.timeout(CONFIG.API_TIMEOUT)
            });
            
            console.log(`📡 Status: ${response.status} | Modelo: ${url.split('/').pop()}`);
            
            if (response.status === 503) {
                console.log('⏳ Modelo carregando, aguardando...');
                await delay(5000);
                if (tentativa < CONFIG.MAX_RETRIES) {
                    return tentarChamada(tentativa + 1);
                }
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const blob = await response.blob();
            
            if (blob.size < 1000) {
                throw new Error('Imagem muito pequena ou corrompida');
            }
            
            console.log(`✅ Sucesso: ${blob.size} bytes | ${url.split('/').pop()}`);
            return blob;
            
        } catch (error) {
            console.log(`❌ Erro em ${url.split('/').pop()}: ${error.message}`);
            
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
async function tentarGerarImagemIA(promptBase, tema) {
    const startTime = Date.now();
    console.log('🚀 Iniciando geração inteligente...');
    mostrarProgresso('Preparando geração...', 5);
    
    // Gerar prompt estilizado
    const { prompt, negative_prompt, estilo } = gerarPromptEstilizado(promptBase);
    
    // Preparar parâmetros específicos do estilo
    const parametrosBase = {
        ...parametrosEstilos[estilo],
        negative_prompt: negative_prompt,
        width: 1024,
        height: 1024
    };
    
    const chave = getAPIKey();
    
    // PRIORIDADE 1: Modelos Hugging Face (se tiver chave)
    if (chave) {
        console.log('🤖 Priorizando modelos Hugging Face...');
        
        for (let i = 0; i < modelosHFPrioritarios.length; i++) {
            const modelo = modelosHFPrioritarios[i];
            
            try {
                mostrarProgresso(`🤖 ${modelo.nome}...`, 20 + (i * 30));
                console.log(`🔄 Tentando ${modelo.nome} (Conf: ${modelo.confiabilidade}/10)`);
                
                const parametrosFinal = {
                    ...parametrosBase,
                    ...modelo.parametros_customizados
                };
                
                const blob = await chamarAPIHuggingFaceSeguro(modelo.url, prompt, parametrosFinal);
                
                if (blob && blob.size > 5000) {
                    const tempoTotal = Date.now() - startTime;
                    console.log(`✅ ${modelo.nome} funcionou em ${formatarTempo(tempoTotal)}!`);
                    
                    mostrarToast(`🎨 Imagem criada por: ${modelo.nome} (${estilo})`, 'success');
                    
                    // Atualizar estatísticas
                    stats.sucessoIA++;
                    stats.totalGerado++;
                    stats.tempoMedio = (stats.tempoMedio + tempoTotal) / stats.sucessoIA;
                    
                    return blob;
                }
                
            } catch (error) {
                console.log(`❌ ${modelo.nome} falhou: ${error.message}`);
                stats.falhasIA++;
            }
            
            await delay(CONFIG.DELAY_BETWEEN_ATTEMPTS);
        }
    } else {
        console.log('🔐 Sem chave HuggingFace, pulando para alternativas');
    }
    
    // PRIORIDADE 2: APIs Alternativas (sem chave)
    console.log('🆓 Tentando APIs alternativas gratuitas...');
    
    for (let i = 0; i < apisAlternativas.length; i++) {
        const api = apisAlternativas[i];
        
        try {
            mostrarProgresso(`🆓 ${api.nome}...`, 60 + (i * 20));
            console.log(`🔄 Tentando ${api.nome} (Conf: ${api.confiabilidade}/10)`);
            
            const blob = await api.funcao(prompt);
            
            if (blob && blob.size > 3000) {
                const tempoTotal = Date.now() - startTime;
                console.log(`✅ ${api.nome} funcionou em ${formatarTempo(tempoTotal)}!`);
                
                mostrarToast(`🎨 Imagem criada por: ${api.nome}`, 'success');
                
                stats.sucessoIA++;
                stats.totalGerado++;
                
                return blob;
            }
            
        } catch (error) {
            console.log(`❌ ${api.nome} falhou: ${error.message}`);
            stats.falhasIA++;
        }
        
        await delay(1000);
    }
    
    // PRIORIDADE 3: Arte Local (fallback final)
    console.log('🎨 Todas as APIs falharam, gerando arte local...');
    mostrarProgresso('Criando arte local...', 90);
    
    return await gerarArteLocal(prompt, tema, estilo);
}

// ============================================================================
// FIM PARTE 7: FUNÇÕES DE CHAMADA DE API
// ============================================================================

// ============================================================================
// INÍCIO PARTE 8: SISTEMA DE ARTE LOCAL (FALLBACK)
// ============================================================================

// Gerar arte local usando Canvas
async function gerarArteLocal(prompt, tema, estilo) {
    console.log('🎨 Gerando arte local com Canvas...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Definir cores baseadas no estilo
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
    
    // Adicionar elementos decorativos
    ctx.globalAlpha = 0.3;
    
    // Raios de luz
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
    
    // Adicionar texto do versículo
    ctx.globalAlpha = 1;
    ctx.font = 'bold 48px Georgia';
    ctx.fillStyle = paleta.sombra[0];
    ctx.textAlign = 'center';
    ctx.shadowColor = paleta.luz[0];
    ctx.shadowBlur = 20;
    
    const palavras = prompt.split(' ').slice(0, 5).join(' ');
    ctx.fillText(palavras.toUpperCase(), 512, 900);
    
    // Converter para blob
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            console.log('✅ Arte local gerada com sucesso!');
            mostrarToast('🎨 Arte criada localmente', 'success');
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
}

// ============================================================================
// FIM PARTE 8: SISTEMA DE ARTE LOCAL (FALLBACK)
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
        // Criar prompt base
        const promptBase = criarPromptBase(versiculo, tema);
        
        // Tentar gerar imagem
        const imagemBlob = await tentarGerarImagemIA(promptBase, tema);
        
        if (imagemBlob) {
            // Exibir imagem
            await exibirImagem(imagemBlob);
            
            // Salvar no histórico
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

// Exibir imagem na interface
async function exibirImagem(blob) {
    const imagemURL = URL.createObjectURL(blob);
    const canvasImagem = document.getElementById('canvasImagem');
    
    if (canvasImagem) {
        // Adicionar efeito de fade
        canvasImagem.style.opacity = '0';
        canvasImagem.src = imagemURL;
        
        canvasImagem.onload = () => {
            canvasImagem.style.transition = 'opacity 1s';
            canvasImagem.style.opacity = '1';
            
            // Limpar URL antiga após carregar
            setTimeout(() => {
                if (canvasImagem.dataset.oldSrc) {
                    URL.revokeObjectURL(canvasImagem.dataset.oldSrc);
                }
                canvasImagem.dataset.oldSrc = imagemURL;
            }, 1000);
        };
    }
}

// ============================================================================
// FIM PARTE 9: FUNÇÕES PRINCIPAIS DE GERAÇÃO
// ============================================================================

// ============================================================================
// INÍCIO PARTE 10: CARREGAMENTO DE VERSÍCULOS
// ============================================================================

// Carregar versículos do arquivo JSON
async function carregarVersiculos() {
    console.log('📚 Carregando versículos...');
    
    try {
        const response = await fetch('versiculos.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        versiculos = data.versiculos || data;
        
        console.log(`✅ ${versiculos.length} versículos carregados`);
        
        // Agrupar por tema
        const temas = [...new Set(versiculos.map(v => v.tema))];
        console.log(`📚 Temas disponíveis: ${temas.join(', ')}`);
        
        // Popular dropdown de temas se existir
        popularTemas(temas);
        
        // Gerar primeiro versículo automaticamente
        if (versiculos.length > 0) {
            await gerarNovoVersiculo();
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar versículos:', error);
        
        // Usar versículos de fallback
        versiculos = obterVersiculosFallback();
        console.log('📚 Usando versículos de fallback');
        
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
    
    // Filtrar por tema se selecionado
    let versiculosDisponiveis = versiculos;
    if (temaEscolhido) {
        versiculosDisponiveis = versiculos.filter(v => v.tema === temaEscolhido);
        console.log(`🎯 Filtrando por tema: ${temaEscolhido}`);
    }
    
    // Escolher versículo aleatório
    if (versiculosDisponiveis.length > 0) {
        const indice = Math.floor(Math.random() * versiculosDisponiveis.length);
        versiculoAtual = versiculosDisponiveis[indice];
        temaAtual = versiculoAtual.tema;
        
        console.log(`📖 Versículo escolhido: ${versiculoAtual.referencia}`);
        
        // Atualizar interface
        atualizarInterface();
        
        // Gerar imagem com IA
        await gerarVersiculoComIA(versiculoAtual, temaAtual);
    } else {
        console.log('⚠️ Nenhum versículo disponível para o tema selecionado');
        mostrarToast('Nenhum versículo encontrado para este tema', 'error');
    }
}

// Atualizar interface com versículo atual
function atualizarInterface() {
    if (!versiculoAtual) return;
    
    const elementoTexto = document.getElementById('versiculoTexto');
    const elementoReferencia = document.getElementById('versiculoReferencia');
    
    if (elementoTexto) {
        elementoTexto.textContent = versiculoAtual.texto;
        elementoTexto.style.opacity = '0';
        setTimeout(() => {
            elementoTexto.style.transition = 'opacity 1s';
            elementoTexto.style.opacity = '1';
        }, 100);
    }
    
    if (elementoReferencia) {
        elementoReferencia.textContent = versiculoAtual.referencia;
    }
}

// ============================================================================
// FIM PARTE 11: GERAÇÃO E MANIPULAÇÃO DE VERSÍCULOS
// ============================================================================

// ============================================================================
// INÍCIO PARTE 12: SISTEMA DE COMPARTILHAMENTO
// ============================================================================

// Compartilhar versículo
async function compartilharVersiculo() {
    if (!versiculoAtual) return;
    
    const canvas = document.getElementById('canvasImagem');
    const textoCompleto = `${versiculoAtual.texto}\n- ${versiculoAtual.referencia}`;
    
    // Tentar Web Share API
    if (navigator.share && canvas) {
        try {
            // Converter imagem para blob
            const response = await fetch(canvas.src);
            const blob = await response.blob();
            const file = new File([blob], 'versiculo.png', { type: 'image/png' });
            
            await navigator.share({
                title: 'Versículo do Dia',
                text: textoCompleto,
                files: [file]
            });
            
            console.log('✅ Compartilhado com sucesso!');
            mostrarToast('Compartilhado com sucesso!', 'success');
            
        } catch (error) {
            console.log('❌ Erro ao compartilhar:', error);
            copiarTextoParaClipboard(textoCompleto);
        }
    } else {
        // Fallback: copiar para clipboard
        copiarTextoParaClipboard(textoCompleto);
    }
}

// Copiar texto para clipboard
function copiarTextoParaClipboard(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        console.log('📋 Texto copiado para clipboard');
        mostrarToast('Texto copiado!', 'success');
    }).catch(error => {
        console.error('❌ Erro ao copiar:', error);
        mostrarToast('Erro ao copiar texto', 'error');
    });
}

// Baixar imagem
function baixarImagem() {
    const canvas = document.getElementById('canvasImagem');
    
    if (canvas && canvas.src) {
        const link = document.createElement('a');
        link.download = `versiculo_${Date.now()}.png`;
        link.href = canvas.src;
        link.click();
        
        console.log('⬇️ Download iniciado');
        mostrarToast('Download iniciado!', 'success');
    }
}

// ============================================================================
// FIM PARTE 12: SISTEMA DE COMPARTILHAMENTO
// ============================================================================

// ============================================================================
// INÍCIO PARTE 13: EVENTOS E INICIALIZAÇÃO
// ============================================================================

// Configurar eventos
function configurarEventos() {
    console.log('⚙️ Configurando eventos...');
    
    // Botão gerar versículo
    const btnGerar = document.getElementById('gerarVersiculo');
    if (btnGerar) {
        btnGerar.addEventListener('click', async () => {
            btnGerar.disabled = true;
            btnGerar.textContent = 'Gerando...';
            
            await gerarNovoVersiculo();
            
            btnGerar.disabled = false;
            btnGerar.textContent = 'Gerar Novo Versículo';
        });
    }
    
    // Mudança de tema
    const selectTema = document.getElementById('temaEscolhido');
    if (selectTema) {
        selectTema.addEventListener('change', async () => {
            console.log(`🎯 Tema alterado para: ${selectTema.value}`);
            await gerarNovoVersiculo();
        });
    }
    
    // Botões de compartilhamento
    const btnCompartilhar = document.getElementById('compartilhar');
    if (btnCompartilhar) {
        btnCompartilhar.addEventListener('click', compartilharVersiculo);
    }
    
    const btnBaixar = document.getElementById('baixar');
    if (btnBaixar) {
        btnBaixar.addEventListener('click', baixarImagem);
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

// Verificar elementos do DOM
function verificarElementosDOM() {
    console.log('📄 Verificando elementos do DOM...');
    
    const elementosNecessarios = [
        'temaEscolhido',
        'versiculoTexto',
        'versiculoReferencia',
        'gerarVersiculo',
        'canvasImagem'
    ];
    
    elementosNecessarios.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✅ ${id}: ENCONTRADO`);
        } else {
            console.log(`❌ ${id}: NÃO ENCONTRADO`);
        }
    });
}

// Inicialização principal
async function inicializarSistema() {
    console.log('🔍 INICIANDO DEBUG...');
    console.log('✅ Script de Versículos IA carregado completamente!');
    
    verificarElementosDOM();
    
    console.log('✅ Variável versiculos: DEFINIDA');
    console.log(`📚 Temas disponíveis: []`);
    console.log(`🎯 versiculoAtual: ${versiculoAtual}`);
    
    configurarEventos();
    
    // Verificar chave API
    const chaveValida = await verificarChaveAPI();
    if (chaveValida) {
        console.log('🔑 Chave API válida e pronta para uso');
    } else {
        console.log('⚠️ Usando apenas APIs gratuitas');
    }
    
    // Carregar versículos
    await carregarVersiculos();
    
    console.log('📊 Estatísticas:', stats.totalGerado, 'imagens geradas');
    console.log('🚀 Sistema de Versículos com IA inicializado completamente!');
    console.log('💡 Funcionalidades: Geração IA, Fallback Artístico, Compartilhamento, Analytics');
}

// Event listener principal
document.addEventListener('DOMContentLoaded', inicializarSistema);

// Exportar funções para debug no console
window.debugFunctions = {
    definirChave: definirChaveManualmente,
    verificarChave: verificarChaveAPI,
    gerarVersiculo: gerarNovoVersiculo,
    stats: () => console.table(stats),
    limparCache: () => {
        localStorage.clear();
        console.log('🧹 Cache limpo');
    }
};

console.log('💡 Dica: Use window.debugFunctions para acessar funções de debug');

// ============================================================================
// FIM PARTE 13: EVENTOS E INICIALIZAÇÃO
// ============================================================================

// ============================================================================
// FIM DO ARQUIVO SCRIPT.JS
// ============================================================================
