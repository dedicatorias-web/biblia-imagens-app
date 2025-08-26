// ========== CONFIGURAÇÃO DA API ==========
const HUGGING_FACE_API_KEY = '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'; // Substitua pela sua chave

// Se não tiver chave, pode usar esta temporária (limitada):
// const HUGGING_FACE_API_KEY = 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// ========== DEBUG - VERIFICAR ELEMENTOS ==========
console.log('🔍 INICIANDO DEBUG...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, verificando elementos...');
    
    // Verificar se elementos existem
    const elementos = [
        'temaEscolhido',
        'versiculoTexto', 
        'versiculoReferencia',
        'gerarVersiculo',
        'canvasImagem'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✅ ${id}: ENCONTRADO`);
        } else {
            console.error(`❌ ${id}: NÃO ENCONTRADO!`);
        }
    });
    
    // Verificar se a variável versiculos existe
    if (typeof versiculos !== 'undefined') {
        console.log('✅ Variável versiculos: DEFINIDA');
        console.log('📚 Temas disponíveis:', Object.keys(versiculos));
    } else {
        console.error('❌ Variável versiculos: NÃO DEFINIDA!');
    }
    
    // Verificar se versiculoAtual existe
    console.log('🎯 versiculoAtual:', versiculoAtual);
});


// ========== CONFIGURAÇÕES DA APLICAÇÃO ==========
let versiculos = {};
let versiculoAtual = null;
let imagemAtualBlob = null;

// ========== 30 MODELOS HUGGING FACE CATEGORIZADOS ==========
const modelosHuggingFace = {
    
    // ========== SEÇÃO RÁPIDA (10 modelos) - Prioridade máxima ==========
    rapida: [
        {
            nome: "Stable Diffusion v1.5",
            url: "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
            categoria: "rapida",
            confiabilidade: 9
        },
        {
            nome: "CompVis SD v1.4", 
            url: "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4",
            categoria: "rapida",
            confiabilidade: 8
        },
        {
            nome: "SD Turbo",
            url: "https://api-inference.huggingface.co/models/stabilityai/sd-turbo",
            categoria: "rapida", 
            confiabilidade: 7
        },
        {
            nome: "Openjourney v4",
            url: "https://api-inference.huggingface.co/models/prompthero/openjourney-v4",
            categoria: "rapida",
            confiabilidade: 8
        },
        {
            nome: "Deliberate v2",
            url: "https://api-inference.huggingface.co/models/XpucT/Deliberate",
            categoria: "rapida",
            confiabilidade: 7
        },
        {
            nome: "Anything v3",
            url: "https://api-inference.huggingface.co/models/Linaqruf/anything-v3.0",
            categoria: "rapida",
            confiabilidade: 6
        },
        {
            nome: "DreamShaper",
            url: "https://api-inference.huggingface.co/models/Lykon/DreamShaper",
            categoria: "rapida", 
            confiabilidade: 7
        },
        {
            nome: "Protogen x3.4",
            url: "https://api-inference.huggingface.co/models/darkstorm2150/Protogen_x3.4_Official_Release",
            categoria: "rapida",
            confiabilidade: 6
        },
        {
            nome: "AbyssOrangeMix3",
            url: "https://api-inference.huggingface.co/models/WarriorMama777/OrangeMixs",
            categoria: "rapida",
            confiabilidade: 6
        },
        {
            nome: "Counterfeit v3",
            url: "https://api-inference.huggingface.co/models/gsdf/Counterfeit-V3.0",
            categoria: "rapida",
            confiabilidade: 5
        }
    ],

    // ========== SEÇÃO MÉDIA (10 modelos) - Qualidade equilibrada ==========
    media: [
        {
            nome: "Stable Diffusion v2.1",
            url: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
            categoria: "media",
            confiabilidade: 9
        },
        {
            nome: "Dreamlike Photoreal 2.0",
            url: "https://api-inference.huggingface.co/models/dreamlike-art/dreamlike-photoreal-2.0",
            categoria: "media",
            confiabilidade: 8
        },
        {
            nome: "Realistic Vision v5",
            url: "https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V5.1_noVAE",
            categoria: "media",
            confiabilidade: 8
        },
        {
            nome: "ChilloutMix",
            url: "https://api-inference.huggingface.co/models/TASUKU2023/Chilloutmix",
            categoria: "media",
            confiabilidade: 7
        },
        {
            nome: "Analog Diffusion",
            url: "https://api-inference.huggingface.co/models/wavymulder/Analog-Diffusion",
            categoria: "media",
            confiabilidade: 7
        },
        {
            nome: "Epic Realism",
            url: "https://api-inference.huggingface.co/models/emilianJR/epiCRealism",
            categoria: "media",
            confiabilidade: 6
        },
        {
            nome: "Realistic Vision v4",
            url: "https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V4.0",
            categoria: "media",
            confiabilidade: 7
        },
        {
            nome: "DreamShaper v7",
            url: "https://api-inference.huggingface.co/models/Lykon/dreamshaper-7",
            categoria: "media",
            confiabilidade: 6
        },
        {
            nome: "MajicMix Realistic",
            url: "https://api-inference.huggingface.co/models/digiplay/majicMIX.realistic_v6",
            categoria: "media",
            confiabilidade: 6
        },
        {
            nome: "Rev Animated",
            url: "https://api-inference.huggingface.co/models/stablediffusionapi/rev-animated",
            categoria: "media",
            confiabilidade: 5
        }
    ],

    // ========== SEÇÃO ALTA (10 modelos) - Máxima qualidade ==========
    alta: [
        {
            nome: "SDXL Base 1.0",
            url: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            categoria: "alta",
            confiabilidade: 9
        },
        {
            nome: "SDXL Turbo",
            url: "https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo",
            categoria: "alta",
            confiabilidade: 8
        },
        {
            nome: "Juggernaut XL",
            url: "https://api-inference.huggingface.co/models/RunDiffusion/Juggernaut-XL-v9",
            categoria: "alta",
            confiabilidade: 8
        },
        {
            nome: "RealVisXL v4",
            url: "https://api-inference.huggingface.co/models/SG161222/RealVisXL_V4.0",
            categoria: "alta",
            confiabilidade: 7
        },
        {
            nome: "DreamShaper XL",
            url: "https://api-inference.huggingface.co/models/Lykon/dreamshaper-xl-1-0",
            categoria: "alta",
            confiabilidade: 7
        },
        {
            nome: "Playground v2.5",
            url: "https://api-inference.huggingface.co/models/playgroundai/playground-v2.5-1024px-aesthetic",
            categoria: "alta",
            confiabilidade: 6
        },
        {
            nome: "Crystal Clear XL",
            url: "https://api-inference.huggingface.co/models/SG161222/crystalClearXL_ccxl",
            categoria: "alta",
            confiabilidade: 6
        },
        {
            nome: "Copax TimeLessXL",
            url: "https://api-inference.huggingface.co/models/Copax/COPAX_TimeLessXL_SDXL1_Temporal_Consistency",
            categoria: "alta",
            confiabilidade: 5
        },
        {
            nome: "AlbedoBase XL",
            url: "https://api-inference.huggingface.co/models/PublicPrompts/AlbedoBase-XL",
            categoria: "alta",
            confiabilidade: 5
        },
        {
            nome: "Kandinsky 2.2",
            url: "https://api-inference.huggingface.co/models/kandinsky-community/kandinsky-2-2-decoder",
            categoria: "alta",
            confiabilidade: 4
        }
    ]
};


// Prompts específicos para cada tema com foco no texto do versículo
const criarPromptPersonalizado = (tema, textoVersiculo) => {
    const palavrasChave = extrairPalavrasChave(textoVersiculo);
    
    const estilosBase = {
        esperanca: "divine light, golden rays, heavenly atmosphere, hopeful scene",
        amor: "warm colors, hearts, romantic lighting, loving atmosphere", 
        paz: "peaceful landscape, calm waters, serene environment, tranquil scene",
        fe: "spiritual light, praying hands, sacred atmosphere, divine presence",
        sabedoria: "ancient books, wise owl, library setting, knowledge symbols",
        forca: "powerful imagery, strength symbols, dramatic lighting, heroic scene",
        protecao: "guardian angel, protective shield, safe haven, shelter"
    };
    
    return `beautiful digital art, ${estilosBase[tema]}, inspired by "${palavrasChave}", masterpiece quality, detailed, professional artwork, cinematic lighting, no text overlay, clean composition`;
};

function extrairPalavrasChave(texto) {
    const palavrasIgnorar = [
        'para', 'porque', 'senhor', 'deus', 'seja', 'está', 'como', 'todo', 'mais', 
        'pelo', 'pela', 'uma', 'dos', 'das', 'com', 'não', 'que', 'ele', 'ela', 
        'seu', 'sua', 'nos', 'nas', 'por', 'este', 'esta', 'isso', 'muito', 'bem'
    ];
    
    return texto.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .split(/[,.;:!?\s]+/)
        .filter(palavra => palavra.length > 3)
        .filter(palavra => !palavrasIgnorar.includes(palavra))
        .slice(0, 5)
        .join(', ');
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    carregarVersiculos();
    configurarEventListeners();
    atualizarContadores();
    mostrarToast('✅ Gerador de Imagens IA carregado!');
});

function configurarEventListeners() {
    document.getElementById('gerarVersiculo').addEventListener('click', gerarVersiculoComIA);
    document.getElementById('temaEscolhido').addEventListener('change', gerarVersiculoComIA);
    document.getElementById('baixarImagem').addEventListener('click', baixarImagem);
    document.getElementById('compartilharWhatsApp').addEventListener('click', compartilharWhatsApp);
    document.getElementById('copiarTexto').addEventListener('click', copiarTexto);
    document.getElementById('compartilharFacebook').addEventListener('click', compartilharFacebook);
    
    document.getElementById('opacidadeFundo').addEventListener('input', function() {
        const valor = Math.round(this.value * 100);
        document.getElementById('opacidadeDisplay').textContent = valor + '%';
    });
}

async function carregarVersiculos() {
    try {
        const response = await fetch('versiculos.json');
        versiculos = await response.json();
        gerarVersiculoComIA();
    } catch (error) {
        console.error('Erro ao carregar versículos:', error);
        // Fallback com versículos embutidos
        versiculos = {
            esperanca: [
                { texto: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", referencia: "Jeremias 29:11" },
                { texto: "Seja a vossa esperança no Senhor, desde agora e para sempre.", referencia: "Salmos 131:3" }
            ],
            amor: [
                { texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.", referencia: "João 3:16" },
                { texto: "Nisto está o amor: não fomos nós que amamos a Deus, mas que ele nos amou.", referencia: "1 João 4:10" }
            ],
            paz: [
                { texto: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá.", referencia: "João 14:27" },
                { texto: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações.", referencia: "Filipenses 4:7" }
            ],
            fe: [
                { texto: "Ora, a fé é o firme fundamento das coisas que se esperam.", referencia: "Hebreus 11:1" },
                { texto: "Porque andamos por fé, e não por vista.", referencia: "2 Coríntios 5:7" }
            ],
            sabedoria: [
                { texto: "O temor do Senhor é o princípio da sabedoria.", referencia: "Provérbios 9:10" },
                { texto: "Se algum de vós tem falta de sabedoria, peça-a a Deus.", referencia: "Tiago 1:5" }
            ],
            forca: [
                { texto: "Tudo posso naquele que me fortalece.", referencia: "Filipenses 4:13" },
                { texto: "Esforça-te, e tem bom ânimo; não temas, nem te espantes.", referencia: "Josué 1:9" }
            ],
            protecao: [
                { texto: "O Senhor te guardará de todo o mal; guardará a tua alma.", referencia: "Salmos 121:7" },
                { texto: "Aquele que habita no esconderijo do Altíssimo descansará à sombra do Todo-Poderoso.", referencia: "Salmos 91:1" }
            ]
        };
        gerarVersiculoComIA();
    }
}

// ========== SISTEMA DE PROGRESSO VISUAL ==========
function mostrarProgresso(mensagem, porcentagem, tipo = 'primary') {
    let progressContainer = document.getElementById('progressContainer');
    
    // Criar container de progresso se não existir
    if (!progressContainer) {
        progressContainer = document.createElement('div');
        progressContainer.id = 'progressContainer';
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-header">
                <span class="progress-icon">🎨</span>
                <span class="progress-title">Gerando Imagem com IA</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
                <div class="progress-text">0%</div>
            </div>
            <div class="progress-status">Iniciando...</div>
            <div class="progress-steps">
                <div class="step" data-step="1">📝 Analisando texto</div>
                <div class="step" data-step="2">🤖 Conectando IA</div>
                <div class="step" data-step="3">🎨 Gerando arte</div>
                <div class="step" data-step="4">✨ Finalizando</div>
            </div>
        `;
        
        const imageContainer = document.querySelector('.image-container');
        imageContainer.insertBefore(progressContainer, document.getElementById('canvasImagem'));
    }
    
    // Atualizar progresso
    progressContainer.style.display = 'block';
    progressContainer.querySelector('.progress-fill').style.width = porcentagem + '%';
    progressContainer.querySelector('.progress-text').textContent = Math.round(porcentagem) + '%';
    progressContainer.querySelector('.progress-status').textContent = mensagem;
    
    // Atualizar steps visuais
    const steps = progressContainer.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        if (porcentagem >= (stepNum * 25 - 15)) {
            step.classList.add('active');
        }
        if (porcentagem >= (stepNum * 25)) {
            step.classList.add('completed');
        }
    });
    
    // Adicionar classe de tipo
    progressContainer.className = `progress-container ${tipo}`;
}

function ocultarProgresso() {
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        setTimeout(() => {
            progressContainer.style.display = 'none';
            // Reset visual
            progressContainer.querySelector('.progress-fill').style.width = '0%';
            progressContainer.querySelector('.progress-text').textContent = '0%';
            progressContainer.querySelectorAll('.step').forEach(step => {
                step.classList.remove('active', 'completed');
            });
        }, 1500);
    }
}

// ========== GERAÇÃO PRINCIPAL COM IA ==========
async function gerarVersiculoComIA() {
    const tema = document.getElementById('temaEscolhido').value;
    const versiculosTema = versiculos[tema];
    
    if (!versiculosTema || versiculosTema.length === 0) {
        mostrarToast('❌ Nenhum versículo encontrado para este tema', 'error');
        return;
    }
    
    // Desabilitar botão
    const botaoGerar = document.getElementById('gerarVersiculo');
    botaoGerar.disabled = true;
    botaoGerar.innerHTML = '🎨 Criando arte...';
    
    try {
        // 1. Selecionar versículo aleatório
        mostrarProgresso('📝 Selecionando versículo inspirador...', 5);
        await delay(800);
        
        const indiceAleatorio = Math.floor(Math.random() * versiculosTema.length);
        versiculoAtual = versiculosTema[indiceAleatorio];
        
        // Atualizar interface com o versículo
        document.getElementById('versiculoTexto').textContent = `"${versiculoAtual.texto}"`;
        document.getElementById('versiculoReferencia').textContent = versiculoAtual.referencia;
        
        // 2. Processar texto e criar prompt
        mostrarProgresso('🧠 Analisando conteúdo do versículo...', 15);
        await delay(1000);
        
        const prompt = criarPromptPersonalizado(tema, versiculoAtual.texto);
        console.log('🎨 Prompt criado:', prompt);
        
        // 3. Tentar gerar imagem com IA
        mostrarProgresso('🤖 Conectando com IA Hugging Face...', 25);
        await delay(500);
        
        const imagemGerada = await tentarGerarImagemIA(prompt, tema);
        
        if (imagemGerada) {
            // 4. Processar imagem gerada
            mostrarProgresso('✨ Processando imagem gerada...', 85);
            await delay(800);
            
            await processarImagemFinal(imagemGerada);
            
            mostrarProgresso('🙏 Obra inspiradora concluída!', 100, 'success');
            mostrarToast('✅ Imagem gerada com IA baseada no versículo!');
            
        } else {
            // Fallback para imagem artística local
            mostrarProgresso('🎨 Criando arte local inspirada no texto...', 70);
            await delay(1000);
            
            gerarImagemArtisticaLocal(tema);
            
            mostrarProgresso('✅ Arte local criada com base no versículo!', 100, 'warning');
            mostrarToast('🎨 Imagem criada localmente baseada no texto!', 'warning');
        }
        
        incrementarContador();
        
    } catch (error) {
        console.error('Erro na geração:', error);
        mostrarProgresso('⚠️ Erro na geração, criando arte alternativa...', 100, 'error');
        gerarImagemArtisticaLocal(tema);
        mostrarToast('⚠️ Erro na IA, usando arte local baseada no texto', 'warning');
    } finally {
        // Restaurar botão
        botaoGerar.disabled = false;
        botaoGerar.innerHTML = '🎨 Gerar Nova Imagem IA';
        
        // Ocultar progresso após delay
        setTimeout(ocultarProgresso, 2000);
    }
}

// ========== TENTATIVAS DE GERAÇÃO COM IA ==========

// ========== FUNÇÃO PRINCIPAL COM ESTRATÉGIA INTELIGENTE ==========
async function tentarGerarImagemIA(prompt, tema) {
    console.log('🚀 Iniciando geração com 30 modelos Hugging Face...');
    
    // Criar lista ordenada: rápida -> média -> alta, por confiabilidade
    const todosModelos = [
        ...modelosHuggingFace.rapida.sort((a, b) => b.confiabilidade - a.confiabilidade),
        ...modelosHuggingFace.media.sort((a, b) => b.confiabilidade - a.confiabilidade),
        ...modelosHuggingFace.alta.sort((a, b) => b.confiabilidade - a.confiabilidade)
    ];
    
    console.log('📊 Estratégia de tentativas:');
    console.log(`   🟢 Rápida: ${modelosHuggingFace.rapida.length} modelos`);
    console.log(`   🟡 Média: ${modelosHuggingFace.media.length} modelos`);  
    console.log(`   🔴 Alta: ${modelosHuggingFace.alta.length} modelos`);
    console.log(`   📋 Total: ${todosModelos.length} modelos`);
    
    for (let i = 0; i < todosModelos.length; i++) {
        const modelo = todosModelos[i];
        
        try {
            const progresso = 10 + (i * 80 / todosModelos.length);
            const emoji = modelo.categoria === 'rapida' ? '⚡' : modelo.categoria === 'media' ? '⚖️' : '💎';
            
            mostrarProgresso(
                `${emoji} ${i + 1}/${todosModelos.length}: ${modelo.nome} (${modelo.categoria}) [${modelo.confiabilidade}/10]`, 
                progresso
            );
            
            console.log(`🔄 Tentando ${modelo.nome} (${modelo.categoria}) - Confiabilidade: ${modelo.confiabilidade}/10`);
            
            // Ajustar parâmetros baseado na categoria
            const qualidadeParams = getParametrosPorCategoria(modelo.categoria);
            const blob = await chamarAPIHuggingFace(modelo.url, prompt, qualidadeParams);
            
            if (blob && blob.size > 1000) {
                console.log(`✅ ${modelo.nome} (${modelo.categoria}) gerou imagem com sucesso!`);
                mostrarProgresso(`✅ Sucesso com ${modelo.nome}!`, 95, 'success');
                mostrarToast(`🎨 Imagem criada por: ${modelo.nome} (${modelo.categoria.toUpperCase()})`, 'success');
                
                // Log de estatísticas
                console.log(`📈 Estatísticas: Tentativa ${i + 1}/${todosModelos.length} - Taxa de sucesso: ${((1/(i+1))*100).toFixed(1)}%`);
                
                return blob;
            }
            
        } catch (error) {
            const errorType = classifyError(error.message);
            console.log(`❌ ${modelo.nome} (${modelo.categoria}) falhou: ${errorType.emoji} ${errorType.message}`);
            
            // Para erro 503 (modelo carregando), tentar novamente nos primeiros 5 modelos
            if (errorType.type === 'loading' && i < 5) {
                console.log(`🔄 ${modelo.nome}: Esperando modelo carregar (${errorType.waitTime}s)...`);
                await delay(errorType.waitTime * 1000);
                
                try {
                    const blob = await chamarAPIHuggingFace(modelo.url, prompt, getParametrosPorCategoria(modelo.categoria));
                    if (blob && blob.size > 1000) {
                        console.log(`✅ ${modelo.nome} funcionou na segunda tentativa!`);
                        mostrarToast(`🔄 ${modelo.nome} funcionou após aguardar carregamento!`, 'success');
                        return blob;
                    }
                } catch (retryError) {
                    console.log(`❌ ${modelo.nome}: Segunda tentativa também falhou`);
                }
            }
        }
        
        // Pausa adaptativa baseada na categoria
        const pausaMs = getPausaPorCategoria(modelo.categoria);
        if (i < todosModelos.length - 1) {
            await delay(pausaMs);
        }
        
        // Log de progresso a cada 5 tentativas
        if ((i + 1) % 5 === 0) {
            console.log(`📊 Progresso: ${i + 1}/${todosModelos.length} tentativas (${(((i + 1) / todosModelos.length) * 100).toFixed(1)}%)`);
        }
    }
    
    console.log('⚠️ Todos os 30 modelos Hugging Face falharam');
    mostrarProgresso('❌ Todos os modelos falharam, usando arte local...', 85, 'error');
    mostrarToast('⚠️ Todas as 30 tentativas de IA falharam. Usando arte local.', 'warning');
    
    return null;
}

// ========== FUNÇÕES AUXILIARES ==========

// Parâmetros otimizados por categoria
function getParametrosPorCategoria(categoria) {
    const parametros = {
        rapida: {
            steps: 8,
            width: 512,
            height: 384,
            guidance_scale: 6.5
        },
        media: {
            steps: 15,
            width: 640,
            height: 480,
            guidance_scale: 7.5
        },
        alta: {
            steps: 25,
            width: 1024,
            height: 768,
            guidance_scale: 8.5
        }
    };
    return parametros[categoria] || parametros.media;
}

// Pausa adaptativa
function getPausaPorCategoria(categoria) {
    const pausas = {
        rapida: 800,   // 0.8s
        media: 1200,   // 1.2s  
        alta: 2000     // 2.0s
    };
    return pausas[categoria] || 1000;
}

// Classificar tipos de erro
function classifyError(errorMessage) {
    if (errorMessage.includes('401') || errorMessage.includes('Invalid username')) {
        return { type: 'auth', emoji: '🔐', message: 'Sem autenticação', waitTime: 0 };
    } else if (errorMessage.includes('503') || errorMessage.includes('loading')) {
        return { type: 'loading', emoji: '⏳', message: 'Modelo carregando', waitTime: 3 };
    } else if (errorMessage.includes('429')) {
        return { type: 'rate', emoji: '⏰', message: 'Limite de rate', waitTime: 0 };
    } else if (errorMessage.includes('400')) {
        return { type: 'prompt', emoji: '🚫', message: 'Prompt inválido', waitTime: 0 };
    } else if (errorMessage.includes('500')) {
        return { type: 'server', emoji: '💥', message: 'Erro do servidor', waitTime: 0 };
    } else {
        return { type: 'unknown', emoji: '❓', message: 'Erro desconhecido', waitTime: 0 };
    }
}

// ========== FUNÇÃO HUGGING FACE OTIMIZADA ==========
async function chamarAPIHuggingFace(modelUrl, prompt, parametros) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Chave opcional
    if (typeof HUGGING_FACE_API_KEY !== 'undefined' && HUGGING_FACE_API_KEY && HUGGING_FACE_API_KEY !== 'SUA_CHAVE_AQUI') {
        headers['Authorization'] = `Bearer ${HUGGING_FACE_API_KEY}`;
    }
    
    const response = await fetch(modelUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                num_inference_steps: parametros.steps,
                guidance_scale: parametros.guidance_scale,
                width: parametros.width,
                height: parametros.height,
                negative_prompt: "blurry, bad quality, distorted, ugly, text, watermark, signature, low resolution"
            }
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `HTTP ${response.status}`;
        
        try {
            const errorObj = JSON.parse(errorText);
            if (errorObj.error) {
                errorMsg += `: ${errorObj.error}`;
            }
        } catch {
            errorMsg += `: ${errorText}`;
        }
        
        throw new Error(errorMsg);
    }
    
    return await response.blob();
}

// ========== PROCESSAMENTO DA IMAGEM FINAL ==========
async function processarImagemFinal(imageBlob) {
    return new Promise((resolve) => {
        const canvas = document.getElementById('canvasImagem');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const img = new Image();
        img.onload = function() {
            // Desenhar imagem da IA
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Adicionar overlay e texto do versículo
            adicionarOverlayTexto(ctx);
            adicionarTextoVersiculoNaImagem(ctx);
            
            // Salvar blob para download
            canvas.toBlob((blob) => {
                imagemAtualBlob = blob;
                resolve();
            }, 'image/png');
        };
        
        img.onerror = () => {
            console.error('Erro ao carregar imagem gerada');
            gerarImagemArtisticaLocal(document.getElementById('temaEscolhido').value);
            resolve();
        };
        
        img.src = URL.createObjectURL(imageBlob);
    });
}

// ========== UTILITÁRIOS ==========
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function incrementarContador() {
    const contador = parseInt(localStorage.getItem('contador_total') || '0') + 1;
    localStorage.setItem('contador_total', contador);
    atualizarContadores();
}

function atualizarContadores() {
    const contador = localStorage.getItem('contador_total') || '0';
    const elemento = document.getElementById('contadorVersiculos');
    if (elemento) {
        elemento.textContent = `${contador} imagens geradas com IA`;
    }
}

// ========== GERAÇÃO ARTÍSTICA LOCAL (FALLBACK) ==========
function gerarImagemArtisticaLocal(tema) {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Criar arte baseada no texto do versículo
    criarArteBasadaNoTexto(ctx, tema, versiculoAtual.texto);
    
    // Adicionar elementos temáticos
    adicionarElementosTematicos(ctx, tema);
    
    // Adicionar overlay e texto
    adicionarOverlayTexto(ctx);
    adicionarTextoVersiculoNaImagem(ctx);
    
    console.log('🎨 Arte local criada baseada no versículo:', versiculoAtual.referencia);
}

function criarArteBasadaNoTexto(ctx, tema, textoVersiculo) {
    const canvas = ctx.canvas;
    const palavrasChave = extrairPalavrasChave(textoVersiculo);
    
    console.log('🔍 Palavras-chave extraídas:', palavrasChave);
    
    // Analisar sentimento do texto para escolher cores
    const coresPersonalizadas = analisarSentimentoTexto(textoVersiculo, tema);
    
    // Criar gradiente baseado no conteúdo do versículo
    let gradient;
    
    if (textoVersiculo.includes('luz') || textoVersiculo.includes('brilh') || textoVersiculo.includes('claro')) {
        // Gradiente radiante para textos sobre luz
        gradient = ctx.createRadialGradient(
            canvas.width * 0.3, canvas.height * 0.2, 0,
            canvas.width * 0.7, canvas.height * 0.8, canvas.width * 0.8
        );
        gradient.addColorStop(0, '#FFFACD'); // Light goldenrod
        gradient.addColorStop(0.4, coresPersonalizadas.primaria);
        gradient.addColorStop(0.8, coresPersonalizadas.secundaria);
        gradient.addColorStop(1, coresPersonalizadas.terciaria);
        
    } else if (textoVersiculo.includes('água') || textoVersiculo.includes('rio') || textoVersiculo.includes('mar')) {
        // Gradiente fluido para textos sobre água
        gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#E0F6FF');
        gradient.addColorStop(0.3, '#87CEEB');
        gradient.addColorStop(0.7, coresPersonalizadas.primaria);
        gradient.addColorStop(1, coresPersonalizadas.secundaria);
        
    } else if (textoVersiculo.includes('montanha') || textoVersiculo.includes('rocha') || textoVersiculo.includes('forte')) {
        // Gradiente sólido para textos sobre força/estabilidade
        gradient = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
        gradient.addColorStop(0, '#8B7355'); // Dark khaki
        gradient.addColorStop(0.4, coresPersonalizadas.primaria);
        gradient.addColorStop(0.8, coresPersonalizadas.secundaria);
        gradient.addColorStop(1, '#F5F5DC'); // Beige
        
    } else {
        // Gradiente padrão baseado no tema
        gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
        );
        gradient.addColorStop(0, coresPersonalizadas.clara);
        gradient.addColorStop(0.5, coresPersonalizadas.primaria);
        gradient.addColorStop(1, coresPersonalizadas.escura);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function analisarSentimentoTexto(texto, tema) {
    // Palavras que indicam diferentes sentimentos/conceitos
    const categorias = {
        alegria: ['alegria', 'gozo', 'regozij', 'feliz', 'contentament'],
        esperanca: ['esper', 'futur', 'promess', 'restaur', 'renov'],
        paz: ['paz', 'descanso', 'tranquil', 'seren', 'calm'],
        amor: ['amor', 'misericordia', 'bondade', 'graça', 'compaixão'],
        luz: ['luz', 'brilh', 'claro', 'illumin', 'resplandec'],
        forca: ['forte', 'poder', 'fortale', 'vigor', 'animo'],
        protecao: ['guard', 'proteg', 'livr', 'refugio', 'escond']
    };
    
    const textoLower = texto.toLowerCase();
    let categoriaEncontrada = tema; // Default para o tema
    
    // Encontrar a categoria mais relevante no texto
    for (const [cat, palavras] of Object.entries(categorias)) {
        if (palavras.some(palavra => textoLower.includes(palavra))) {
            categoriaEncontrada = cat;
            break;
        }
    }
    
    // Paletas de cores baseadas no conteúdo detectado
    const paletasCores = {
        alegria: {
            clara: '#FFF8DC', primaria: '#FFD700', secundaria: '#FFA500', 
            terciaria: '#FF8C00', escura: '#B8860B'
        },
        esperanca: {
            clara: '#F0F8FF', primaria: '#87CEEB', secundaria: '#4682B4',
            terciaria: '#1E90FF', escura: '#191970'
        },
        paz: {
            clara: '#F0FFF0', primaria: '#98FB98', secundaria: '#90EE90',
            terciaria: '#32CD32', escura: '#006400'
        },
        amor: {
            clara: '#FFF0F5', primaria: '#FFB6C1', secundaria: '#FF69B4',
            terciaria: '#FF1493', escura: '#DC143C'
        },
        luz: {
            clara: '#FFFAF0', primaria: '#FFEFD5', secundaria: '#FFE4B5',
            terciaria: '#DEB887', escura: '#D2691E'
        },
        forca: {
            clara: '#FFE4E1', primaria: '#CD5C5C', secundaria: '#B22222',
            terciaria: '#8B0000', escura: '#800000'
        },
        protecao: {
            clara: '#E6E6FA', primaria: '#DDA0DD', secundaria: '#9370DB',
            terciaria: '#8A2BE2', escura: '#4B0082'
        },
        fe: {
            clara: '#F5F5DC', primaria: '#DEB887', secundaria: '#D2B48C',
            terciaria: '#BC9A6A', escura: '#8B7355'
        },
        sabedoria: {
            clara: '#FDF5E6', primaria: '#F5DEB3', secundaria: '#DEB887',
            terciaria: '#D2B48C', escura: '#8B7D6B'
        }
    };
    
    return paletasCores[categoriaEncontrada] || paletasCores[tema] || paletasCores.esperanca;
}

function adicionarElementosTematicos(ctx, tema) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    
    // Elementos visuais baseados no tema E no conteúdo do versículo
    const elementosPorTema = {
        esperanca: () => adicionarRaiosEsperanca(ctx),
        amor: () => adicionarSimbolosAmor(ctx),
        paz: () => adicionarElementosPaz(ctx),
        fe: () => adicionarSimbolosFe(ctx),
        sabedoria: () => adicionarElementosSabedoria(ctx),
        forca: () => adicionarSimbolosForca(ctx),
        protecao: () => adicionarElementosProtecao(ctx)
    };
    
    const funcaoElemento = elementosPorTema[tema] || elementosPorTema.esperanca;
    funcaoElemento();
    
    // Adicionar elementos específicos baseados no texto
    adicionarElementosBaseadosNoTexto(ctx);
    
    ctx.restore();
}

function adicionarElementosBaseadosNoTexto(ctx) {
    const texto = versiculoAtual.texto.toLowerCase();
    
    // Detectar elementos específicos mencionados no versículo
    if (texto.includes('estrela') || texto.includes('brilh')) {
        desenharEstrelas(ctx, 8);
    }
    
    if (texto.includes('pomba') || texto.includes('ave')) {
        desenharPombas(ctx, 5);
    }
    
    if (texto.includes('flor') || texto.includes('jardim')) {
        desenharFlores(ctx, 6);
    }
    
    if (texto.includes('coroa') || texto.includes('rei')) {
        desenharCoroas(ctx, 3);
    }
    
    if (texto.includes('espada') || texto.includes('guerra')) {
        desenharEspadas(ctx, 4);
    }
}

// ========== FUNÇÕES DE DESENHO ESPECÍFICAS ==========
function adicionarRaiosEsperanca(ctx) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#FFA500';
    ctx.shadowBlur = 8;
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height * 0.3;
    
    for (let i = 0; i < 12; i++) {
        const angulo = (i * 30) * Math.PI / 180;
        const raio = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.35;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angulo) * raio,
            centerY + Math.sin(angulo) * raio
        );
        ctx.stroke();
    }
}

function adicionarSimbolosAmor(ctx) {
    ctx.fillStyle = '#FFB6C1';
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const tamanho = 15 + Math.random() * 15;
        
        desenharCoracao(ctx, x, y, tamanho);
    }
}

function adicionarElementosPaz(ctx) {
    // Ondas suaves de paz
    ctx.strokeStyle = '#87CEEB';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#4682B4';
    ctx.shadowBlur = 5;
    
    for (let y = 100; y < ctx.canvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        for (let x = 0; x < ctx.canvas.width; x += 30) {
            const waveY = y + Math.sin((x / 50) * Math.PI) * 10;
            ctx.lineTo(x, waveY);
        }
        ctx.stroke();
    }
}

function adicionarSimbolosFe(ctx) {
    ctx.strokeStyle = '#9370DB';
    ctx.fillStyle = '#DDA0DD';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < 6; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const tamanho = 20;
        
        // Cruz
        ctx.beginPath();
        ctx.moveTo(x, y - tamanho);
        ctx.lineTo(x, y + tamanho);
        ctx.moveTo(x - tamanho/1.5, y - tamanho/2);
        ctx.lineTo(x + tamanho/1.5, y - tamanho/2);
        ctx.stroke();
    }
}

function adicionarElementosSabedoria(ctx) {
    ctx.fillStyle = '#DEB887';
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        
        // Livro
        const w = 25, h = 18;
        ctx.fillRect(x - w/2, y - h/2, w, h);
        ctx.strokeRect(x - w/2, y - h/2, w, h);
        
        // Páginas
        for (let j = 1; j <= 3; j++) {
            ctx.beginPath();
            ctx.moveTo(x - w/2 + 3, y - h/2 + j * 4);
            ctx.lineTo(x + w/2 - 3, y - h/2 + j * 4);
            ctx.stroke();
        }
    }
}

function adicionarSimbolosForca(ctx) {
    ctx.strokeStyle = '#B22222';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#DC143C';
    ctx.shadowBlur = 6;
    
    for (let i = 0; i < 6; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const tamanho = 25;
        
        // Raio de força
        ctx.beginPath();
        ctx.moveTo(x, y - tamanho);
        ctx.lineTo(x - tamanho/3, y);
        ctx.lineTo(x + tamanho/6, y);
        ctx.lineTo(x - tamanho/3, y + tamanho);
        ctx.lineTo(x + tamanho/3, y);
        ctx.lineTo(x - tamanho/6, y);
        ctx.closePath();
        ctx.stroke();
    }
}

function adicionarElementosProtecao(ctx) {
    ctx.fillStyle = '#98FB98';
    ctx.strokeStyle = '#32CD32';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 4; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const tamanho = 25;
        
        // Escudo
        ctx.beginPath();
        ctx.moveTo(x, y - tamanho);
        ctx.lineTo(x - tamanho/2, y - tamanho/2);
        ctx.lineTo(x - tamanho/2, y + tamanho/3);
        ctx.lineTo(x, y + tamanho);
        ctx.lineTo(x + tamanho/2, y + tamanho/3);
        ctx.lineTo(x + tamanho/2, y - tamanho/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

// ========== ELEMENTOS ESPECÍFICOS DO TEXTO ==========
function desenharEstrelas(ctx, quantidade) {
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFA500';
    ctx.shadowBlur = 10;
    
    for (let i = 0; i < quantidade; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const raio = 8 + Math.random() * 8;
        
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            const angle = (j * 4 * Math.PI) / 5;
            const radius = j % 2 === 0 ? raio : raio * 0.5;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.fill();
    }
}

function desenharPombas(ctx, quantidade) {
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < quantidade; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        
        // Corpo da pomba
        ctx.beginPath();
        ctx.ellipse(x, y, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Asas
        ctx.beginPath();
        ctx.arc(x - 8, y - 3, 6, 0, Math.PI);
        ctx.arc(x + 8, y - 3, 6, 0, Math.PI);
        ctx.stroke();
    }
}

function desenharFlores(ctx, quantidade) {
    for (let i = 0; i < quantidade; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const cores = ['#FF69B4', '#FFB6C1', '#FFA07A', '#98FB98'];
        
        ctx.fillStyle = cores[Math.floor(Math.random() * cores.length)];
        
        // Pétalas
        for (let j = 0; j < 6; j++) {
            const angle = (j * Math.PI * 2) / 6;
            const petalX = x + Math.cos(angle) * 8;
            const petalY = y + Math.sin(angle) * 8;
            
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 6, 3, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Centro
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function desenharCoroas(ctx, quantidade) {
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < quantidade; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const tamanho = 15;
        
        // Base da coroa
        ctx.fillRect(x - tamanho, y + tamanho/2, tamanho * 2, 4);
        
        // Pontas da coroa
        for (let j = 0; j < 5; j++) {
            const pontaX = x - tamanho + (j * tamanho/2);
            const alturas = [tamanho, tamanho * 1.5, tamanho * 2, tamanho * 1.5, tamanho];
            
            ctx.fillRect(pontaX, y + tamanho/2 - alturas[j], 3, alturas[j]);
        }
    }
}

function desenharEspadas(ctx, quantidade) {
    ctx.fillStyle = '#C0C0C0';
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < quantidade; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const comprimento = 30;
        
        // Lâmina
        ctx.fillRect(x - 2, y - comprimento, 4, comprimento);
        
        // Guarda
        ctx.fillRect(x - 8, y - 5, 16, 3);
        
        // Punho
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 2, y, 4, 10);
        
        // Pomo
        ctx.beginPath();
        ctx.arc(x, y + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#C0C0C0'; // Reset cor
    }
}

function desenharCoracao(ctx, x, y, tamanho) {
    ctx.save();
    ctx.translate(x, y);
    
    ctx.beginPath();
    // Lado esquerdo do coração
    ctx.arc(-tamanho/4, -tamanho/4, tamanho/4, 0, Math.PI * 2);
    // Lado direito do coração
    ctx.arc(tamanho/4, -tamanho/4, tamanho/4, 0, Math.PI * 2);
    
    ctx.fill();
    
    // Parte inferior do coração
    ctx.beginPath();
    ctx.moveTo(0, tamanho/4);
    ctx.lineTo(-tamanho/2, -tamanho/8);
    ctx.lineTo(tamanho/2, -tamanho/8);
    ctx.lineTo(0, tamanho/4);
    ctx.fill();
    
    ctx.restore();
}

// ========== SISTEMA DE OVERLAY E TEXTO ==========
function adicionarOverlayTexto(ctx) {
    const posicao = document.getElementById('posicaoTexto').value;
    const opacidade = parseFloat(document.getElementById('opacidadeFundo').value);
    
    const canvas = ctx.canvas;
    let overlayY, overlayHeight;
    
    // Definir área do overlay baseado na posição
    switch(posicao) {
        case 'superior':
            overlayY = 0;
            overlayHeight = canvas.height * 0.6;
            break;
        case 'centro':
            overlayY = canvas.height * 0.2;
            overlayHeight = canvas.height * 0.6;
            break;
        case 'inferior':
        default:
            overlayY = canvas.height * 0.4;
            overlayHeight = canvas.height * 0.6;
            break;
    }
    
    // Criar gradiente para overlay suave
    const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
    
    if (posicao === 'superior') {
        gradient.addColorStop(0, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(0.6, `rgba(0,0,0,${opacidade * 0.4})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    } else if (posicao === 'inferior') {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.4, `rgba(0,0,0,${opacidade * 0.4})`);
        gradient.addColorStop(1, `rgba(0,0,0,${opacidade})`);
    } else {
        // Centro - overlay mais suave
        gradient.addColorStop(0, `rgba(0,0,0,${opacidade * 0.2})`);
        gradient.addColorStop(0.3, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(0.7, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(1, `rgba(0,0,0,${opacidade * 0.2})`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);
}

function adicionarTextoVersiculoNaImagem(ctx) {
    if (!versiculoAtual) return;
    
    const canvas = ctx.canvas;
    const posicao = document.getElementById('posicaoTexto').value;
    
    // Configurar estilo do texto
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Definir posição base do texto
    let yBase;
    switch(posicao) {
        case 'superior':
            yBase = canvas.height * 0.3;
            break;
        case 'centro':
            yBase = canvas.height * 0.5;
            break;
        case 'inferior':
        default:
            yBase = canvas.height * 0.75;
            break;
    }
    
    // Configurar fonte para o versículo principal
    const tamanhoFonteBase = Math.min(canvas.width / 25, 32);
    ctx.font = `bold ${tamanhoFonteBase}px "Georgia", "Times New Roman", serif`;
    
    // Quebrar texto em linhas inteligentemente
    const texto = versiculoAtual.texto;
    const larguraMaxima = canvas.width - 80;
    const linhas = quebrarTextoInteligente(ctx, texto, larguraMaxima);
    
    // Calcular espaçamento e posição inicial
    const alturaLinha = tamanhoFonteBase * 1.3;
    const alturaTotal = linhas.length * alturaLinha;
    const yInicial = yBase - (alturaTotal / 2);
    
    // Desenhar cada linha do versículo
    linhas.forEach((linha, index) => {
        const y = yInicial + (index * alturaLinha);
        
        // Contorno (stroke) primeiro
        ctx.strokeText(linha, canvas.width / 2, y);
        // Texto preenchido por cima
        ctx.fillText(linha, canvas.width / 2, y);
    });
    
    // Configurar fonte para a referência
    const tamanhoFonteRef = Math.min(canvas.width / 30, 26);
    ctx.font = `italic bold ${tamanhoFonteRef}px "Georgia", "Times New Roman", serif`;
    
    // Posicionar referência
    const yReferencia = yInicial + alturaTotal + (tamanhoFonteRef * 1.5);
    const textoReferencia = `— ${versiculoAtual.referencia}`;
    
    // Desenhar referência
    ctx.strokeText(textoReferencia, canvas.width / 2, yReferencia);
    ctx.fillText(textoReferencia, canvas.width / 2, yReferencia);
    
    // Limpar efeitos de sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function quebrarTextoInteligente(ctx, texto, larguraMax) {
    const palavras = texto.split(' ');
    const linhas = [];
    let linhaAtual = '';
    
    for (let palavra of palavras) {
        const testeLinha = linhaAtual + (linhaAtual ? ' ' : '') + palavra;
        const larguraTeste = ctx.measureText(testeLinha).width;
        
        if (larguraTeste > larguraMax && linhaAtual) {
            linhas.push(linhaAtual.trim());
            linhaAtual = palavra;
        } else {
            linhaAtual = testeLinha;
        }
    }
    
    if (linhaAtual) {
        linhas.push(linhaAtual.trim());
    }
    
    // Limitar número de linhas para não sobrecarregar a imagem
    if (linhas.length > 4) {
        // Se muito longo, tentar quebrar de forma mais agressiva
        return quebrarTextoAgressivo(ctx, texto, larguraMax, 4);
    }
    
    return linhas;
}

function quebrarTextoAgressivo(ctx, texto, larguraMax, maxLinhas) {
    const palavras = texto.split(' ');
    const linhas = [];
    let linhaAtual = '';
    
    for (let palavra of palavras) {
        if (linhas.length >= maxLinhas - 1) {
            // Última linha - adicionar tudo que resta
            linhaAtual += (linhaAtual ? ' ' : '') + palavra;
        } else {
            const testeLinha = linhaAtual + (linhaAtual ? ' ' : '') + palavra;
            const larguraTeste = ctx.measureText(testeLinha).width;
            
            if (larguraTeste > larguraMax && linhaAtual) {
                linhas.push(linhaAtual.trim());
                linhaAtual = palavra;
            } else {
                linhaAtual = testeLinha;
            }
        }
    }
    
    if (linhaAtual) {
        // Se a última linha ainda é muito longa, encurtar com reticências
        if (ctx.measureText(linhaAtual).width > larguraMax) {
            while (ctx.measureText(linhaAtual + '...').width > larguraMax && linhaAtual.length > 10) {
                linhaAtual = linhaAtual.substring(0, linhaAtual.length - 1);
            }
            linhaAtual += '...';
        }
        linhas.push(linhaAtual.trim());
    }
    
    return linhas;
}

// ========== FUNCIONALIDADES DE COMPARTILHAMENTO ==========
function baixarImagem() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhuma imagem para baixar', 'error');
        return;
    }
    
    const canvas = document.getElementById('canvasImagem');
    const link = document.createElement('a');
    
    // Nome do arquivo baseado no versículo
    const referenciaLimpa = versiculoAtual.referencia
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const nomeArquivo = `versiculo_${referenciaLimpa}_${timestamp}.png`;
    
    link.download = nomeArquivo;
    link.href = canvas.toDataURL('image/png', 1.0);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToast('💾 Imagem baixada com sucesso!');
    
    // Analytics local
    incrementarContadorDownload();
}

function compartilharWhatsApp() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum versículo para compartilhar', 'error');
        return;
    }
    
    const emoji = obterEmojiTema(document.getElementById('temaEscolhido').value);
    const texto = `${emoji} *${versiculoAtual.referencia}*\n\n"_${versiculoAtual.texto}_"\n\n✨ Imagem gerada com IA em: ${window.location.href}\n\n#VersiculoBiblico #Fe #Esperanca`;
    
    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    
    // Abrir em nova aba
    const janela = window.open(urlWhatsApp, '_blank');
    
    if (janela) {
        mostrarToast('📱 Abrindo WhatsApp para compartilhar...');
    } else {
        mostrarToast('⚠️ Pop-up bloqueado. Permita pop-ups para compartilhar.', 'warning');
    }
    
    incrementarContadorCompartilhamento('whatsapp');
}

function compartilharFacebook() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum versículo para compartilhar', 'error');
        return;
    }
    
    const textoCompartilhar = `"${versiculoAtual.texto}" - ${versiculoAtual.referencia}`;
    const urlAtual = encodeURIComponent(window.location.href);
    const textoEncoded = encodeURIComponent(textoCompartilhar);
    
    const urlFacebook = `https://www.facebook.com/sharer/sharer.php?u=${urlAtual}&quote=${textoEncoded}`;
    
    const janela = window.open(urlFacebook, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    
    if (janela) {
        mostrarToast('📘 Abrindo Facebook para compartilhar...');
    } else {
        mostrarToast('⚠️ Pop-up bloqueado. Permita pop-ups para compartilhar.', 'warning');
    }
    
    incrementarContadorCompartilhamento('facebook');
}

function copiarTexto() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum versículo para copiar', 'error');
        return;
    }
    
    const emoji = obterEmojiTema(document.getElementById('temaEscolhido').value);
    const textoCompleto = `${emoji} ${versiculoAtual.referencia}\n\n"${versiculoAtual.texto}"\n\n✨ Gerado com IA em: ${window.location.href}`;
    
    // Tentar usar a API moderna
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textoCompleto)
            .then(() => {
                mostrarToast('📋 Texto copiado para área de transferência!');
            })
            .catch(() => {
                copiarTextoFallback(textoCompleto);
            });
    } else {
        copiarTextoFallback(textoCompleto);
    }
    
    incrementarContadorCompartilhamento('copia');
}

function copiarTextoFallback(texto) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        const sucesso = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (sucesso) {
            mostrarToast('📋 Texto copiado!');
        } else {
            mostrarToast('❌ Erro ao copiar. Selecione o texto manualmente.', 'error');
            console.log('Texto para copiar:', texto);
        }
    } catch (error) {
        mostrarToast('❌ Erro ao copiar texto.', 'error');
        console.error('Erro na cópia:', error);
    }
}

// ========== SISTEMA DE NOTIFICAÇÕES E UTILITÁRIOS ==========
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    
    // Definir classe baseada no tipo
    toast.className = `toast show ${tipo}`;
    toast.textContent = mensagem;
    
    // Auto ocultar após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
    
    // Log para debug
    console.log(`📢 ${tipo.toUpperCase()}: ${mensagem}`);
}

function obterEmojiTema(tema) {
    const emojis = {
        esperanca: '✨',
        amor: '❤️',
        paz: '🕊️',
        fe: '🙏',
        sabedoria: '🦉',
        forca: '💪',
        protecao: '🛡️'
    };
    return emojis[tema] || '📖';
}

// ========== SISTEMA DE CONTADORES E ANALYTICS ==========
function incrementarContador() {
    const contador = parseInt(localStorage.getItem('contador_total') || '0') + 1;
    localStorage.setItem('contador_total', contador);
    
    // Contador por tema
    const tema = document.getElementById('temaEscolhido').value;
    const contadorTema = parseInt(localStorage.getItem(`contador_${tema}`) || '0') + 1;
    localStorage.setItem(`contador_${tema}`, contadorTema);
    
    // Atualizar display
    atualizarContadores();
    
    // Salvar timestamp da última geração
    localStorage.setItem('ultima_geracao', new Date().toISOString());
}

function incrementarContadorDownload() {
    const downloads = parseInt(localStorage.getItem('contador_downloads') || '0') + 1;
    localStorage.setItem('contador_downloads', downloads);
}

function incrementarContadorCompartilhamento(tipo) {
    const compartilhamentos = parseInt(localStorage.getItem(`contador_share_${tipo}`) || '0') + 1;
    localStorage.setItem(`contador_share_${tipo}`, compartilhamentos);
}

function atualizarContadores() {
    const contadorTotal = localStorage.getItem('contador_total') || '0';
    const downloads = localStorage.getItem('contador_downloads') || '0';
    
    const elemento = document.getElementById('contadorVersiculos');
    if (elemento) {
        elemento.innerHTML = `
            ${contadorTotal} imagens geradas | ${downloads} downloads
        `;
    }
    
    // Atualizar título da página se muitas gerações
    if (parseInt(contadorTotal) > 0) {
        document.title = `Versículos Bíblicos IA (${contadorTotal}) - Gerador`;
    }
}

// ========== FUNÇÕES DE INICIALIZAÇÃO FINAL ==========
function inicializarEstatisticas() {
    // Mostrar estatísticas de uso se disponível
    const contadorTotal = localStorage.getItem('contador_total');
    const ultimaGeracao = localStorage.getItem('ultima_geracao');
    
    if (contadorTotal && parseInt(contadorTotal) > 0) {
        console.log(`📊 Estatísticas: ${contadorTotal} imagens geradas`);
        
        if (ultimaGeracao) {
            const dataUltima = new Date(ultimaGeracao);
            const agora = new Date();
            const diasDesdeUltima = Math.floor((agora - dataUltima) / (1000 * 60 * 60 * 24));
            
            if (diasDesdeUltima > 7) {
                mostrarToast(`👋 Bem-vindo de volta! Última visita: ${diasDesdeUltima} dias atrás`, 'info');
            }
        }
    }
}

// ========== INICIALIZAÇÃO FINAL ==========
document.addEventListener('DOMContentLoaded', function() {
    // Executar inicializações se ainda não foram feitas
    if (typeof versiculos === 'undefined' || Object.keys(versiculos).length === 0) {
        carregarVersiculos();
    }
    
    if (!document.getElementById('gerarVersiculo').onclick) {
        configurarEventListeners();
    }
    
    // Inicializar estatísticas
    inicializarEstatisticas();
    atualizarContadores();
    
    // Log de inicialização
    console.log('🚀 Sistema de Versículos com IA inicializado completamente!');
    console.log('💡 Funcionalidades: Geração IA, Fallback Artístico, Compartilhamento, Analytics');
});

// ========== DETECTAR PROBLEMAS E FALLBACKS ==========
window.addEventListener('error', function(evento) {
    console.error('💥 Erro detectado:', evento.error);
    mostrarToast('⚠️ Erro detectado. Tentando modo alternativo...', 'warning');
    
    // Se houver erro crítico, tentar recarregar funcionalidades básicas
    setTimeout(() => {
        if (versiculoAtual && document.getElementById('canvasImagem')) {
            gerarImagemArtisticaLocal(document.getElementById('temaEscolhido').value);
        }
    }, 1000);
});

// Log final de carregamento
console.log('✅ Script de Versículos IA carregado completamente!');
