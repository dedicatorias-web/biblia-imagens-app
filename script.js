// ========== CONFIGURAÇÃO DA API KEY ==========
// SUBSTITUA 'SUA_CHAVE_AQUI' pela sua chave real do Hugging Face
const API_KEY = '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';

// ========== CONFIGURAÇÕES DA APLICAÇÃO ==========
let versiculos = {};
let versiculoAtual = null;
let imagemAtualBlob = null;

// Modelos de IA para diferentes qualidades
const modelos = {
    rapida: "runwayml/stable-diffusion-v1-5",
    media: "stabilityai/stable-diffusion-2-1",
    alta: "stabilityai/stable-diffusion-xl-base-1.0"
};

// Prompts para estilo barroco baseados no tema
const promptsBarrocos = {
    esperanca: "baroque masterpiece painting, divine light streaming through dramatic clouds, golden rays illuminating peaceful landscape, ornate religious symbolism, dramatic chiaroscuro lighting, renaissance oil painting style, heavenly atmosphere, intricate baroque details, warm golden tones, masterful composition",
    
    amor: "baroque oil painting masterpiece, cherubs and angels in golden light, romantic divine scene, ornate decorative elements, dramatic shadows and highlights, renaissance style, divine love symbolism, rich warm colors, classical composition, baroque religious art",
    
    paz: "baroque landscape painting, serene pastoral scene with divine soft light, olive branches, white doves in flight, peaceful countryside, dramatic sky with gentle golden clouds, classical composition, warm earth tones, baroque masterpiece style",
    
    fe: "baroque religious masterpiece, praying hands bathed in divine light from above, magnificent cathedral interior, ornate gothic architecture, dramatic lighting, spiritual golden symbolism, classical religious art style, baroque composition",
    
    sabedoria: "baroque portrait masterpiece, ancient wisdom symbols, ornate scrolls and leather books, wise owl perched on ancient tome, warm candlelight illumination, classical library with baroque architecture, dramatic chiaroscuro, rich golden tones",
    
    forca: "baroque heroic painting, powerful figure in classical dramatic pose, divine light breaking through stormy clouds, ornate golden armor, dynamic composition, renaissance masterpiece style, dramatic shadows and highlights, biblical strength theme",
    
    protecao: "baroque religious masterpiece, magnificent guardian angel with spread golden wings, protective divine light radiating, ornate heavenly setting, dramatic baroque composition, warm celestial lighting, classical religious art style"
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    if (!API_KEY || API_KEY === 'SUA_CHAVE_AQUI') {
        mostrarToast('❌ Erro: API Key não configurada. Contate o desenvolvedor.');
        return;
    }
    
    carregarVersiculos();
    configurarEventListeners();
    atualizarContadores();
    mostrarToast('✅ App carregado! Clique em "Gerar" para começar.');
});

// ========== EVENT LISTENERS ==========
function configurarEventListeners() {
    document.getElementById('gerarVersiculo').addEventListener('click', gerarVersiculoComIA);
    document.getElementById('temaEscolhido').addEventListener('change', gerarVersiculoComIA);
    document.getElementById('baixarImagem').addEventListener('click', baixarImagem);
    document.getElementById('compartilharWhatsApp').addEventListener('click', compartilharWhatsApp);
    document.getElementById('copiarTexto').addEventListener('click', copiarTexto);
    document.getElementById('compartilharFacebook').addEventListener('click', compartilharFacebook);
    
    // Atualizar display da opacidade em tempo real
    document.getElementById('opacidadeFundo').addEventListener('input', function() {
        const valor = Math.round(this.value * 100);
        document.getElementById('opacidadeDisplay').textContent = valor + '%';
    });
}

// ========== CARREGAMENTO DE DADOS ==========
async function carregarVersiculos() {
    try {
        const response = await fetch('versiculos.json');
        versiculos = await response.json();
        gerarVersiculoComIA(); // Gerar primeiro versículo automaticamente
    } catch (error) {
        console.error('Erro ao carregar versículos:', error);
        mostrarToast('❌ Erro ao carregar versículos');
    }
}

// ========== GERAÇÃO DE VERSÍCULOS E IA ==========
async function gerarVersiculoComIA() {
    const tema = document.getElementById('temaEscolhido').value;
    const versiculosTema = versiculos[tema];
    
    if (!versiculosTema || versiculosTema.length === 0) {
        mostrarToast('❌ Nenhum versículo encontrado para este tema');
        return;
    }
    
    // Selecionar versículo aleatório
    const indiceAleatorio = Math.floor(Math.random() * versiculosTema.length);
    versiculoAtual = versiculosTema[indiceAleatorio];
    
    // Atualizar interface com o texto
    document.getElementById('versiculoTexto').textContent = `"${versiculoAtual.texto}"`;
    document.getElementById('versiculoReferencia').textContent = versiculoAtual.referencia;
    
    // Gerar imagem com IA
    await gerarImagemIA(tema);
    
    // Atualizar contador
    incrementarContador();
}

async function gerarImagemIA(tema) {
    try {
        // Desabilitar botão durante geração
        const botaoGerar = document.getElementById('gerarVersiculo');
        botaoGerar.disabled = true;
        botaoGerar.textContent = '🎨 Gerando...';
        
        mostrarProgresso('🎨 Preparando a obra de arte...', 10);
        
        const qualidade = document.getElementById('qualidadeImagem').value;
        const modelo = modelos[qualidade];
        const prompt = criarPromptCompleto(tema);
        
        console.log('Prompt enviado:', prompt); // Para debug
        
        mostrarProgresso('🤖 Enviando para a IA...', 30);
        
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${modelo}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        num_inference_steps: qualidade === 'alta' ? 50 : qualidade === 'media' ? 35 : 25,
                        guidance_scale: 7.5,
                        width: 768,
                        height: 512,
                        negative_prompt: "text, words, letters, watermark, signature, blurry, low quality, distorted, bad anatomy"
                    }
                }),
            }
        );
        
        mostrarProgresso('🎨 Criando obra barroca...', 70);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }
        
        const imageBlob = await response.blob();
        imagemAtualBlob = imageBlob;
        
        mostrarProgresso('✨ Adicionando texto sagrado...', 90);
        
        // Criar imagem final com texto
        await criarImagemFinal(imageBlob);
        
        mostrarProgresso('🙏 Obra concluída!', 100);
        
        // Ocultar progresso após 2 segundos
        setTimeout(() => {
            const status = document.getElementById('generationStatus');
            if (status) status.classList.add('hidden');
        }, 2000);
        
        mostrarToast('✅ Imagem sagrada criada com sucesso!');
        
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        mostrarToast(`❌ Erro na geração: ${error.message}`);
        
        // Em caso de erro, mostrar versículo sem imagem de fundo
        criarImagemSemIA();
        
    } finally {
        // Reabilitar botão
        const botaoGerar = document.getElementById('gerarVersiculo');
        botaoGerar.disabled = false;
        botaoGerar.textContent = '🎨 Gerar Nova Imagem';
        
        const status = document.getElementById('generationStatus');
        if (status) status.classList.add('hidden');
    }
}

// ========== CRIAÇÃO DE PROMPTS ==========
function criarPromptCompleto(tema) {
    const promptBase = promptsBarrocos[tema];
    const palavrasChave = extrairPalavrasChave(versiculoAtual.texto);
    
    // Prompt mais detalhado para melhor qualidade
    return `${promptBase}, biblical inspiration: ${palavrasChave}, ultra detailed baroque masterpiece, 8k resolution, professional religious art, museum quality, no text overlay, clean composition, dramatic lighting, renaissance painting style`;
}

function extrairPalavrasChave(texto) {
    // Lista de palavras a ignorar (mais completa)
    const ignorar = [
        'para', 'porque', 'senhor', 'deus', 'seja', 'está', 'como', 'todo', 'mais', 'pelo', 'pela',
        'uma', 'dos', 'das', 'com', 'não', 'que', 'ele', 'ela', 'seu', 'sua', 'meu', 'minha',
        'nos', 'nas', 'por', 'ser', 'ter', 'ver', 'bem', 'mas', 'sim', 'sem', 'sob', 'até'
    ];
    
    const palavrasImportantes = texto.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .split(/[,.;:!?\s]+/)
        .filter(palavra => palavra.length > 3)
        .filter(palavra => !ignorar.includes(palavra))
        .slice(0, 6);
    
    return palavrasImportantes.join(', ');
}

// ========== CRIAÇÃO DE IMAGENS ==========
async function criarImagemFinal(imageBlob) {
    return new Promise((resolve) => {
        const canvas = document.getElementById('canvasImagem');
        const ctx = canvas.getContext('2d');
        
        // Limpar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Carregar e desenhar imagem da IA
        const img = new Image();
        img.onload = function() {
            // Desenhar imagem de fundo (redimensionada para o canvas)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Adicionar overlay semi-transparente
            adicionarOverlayTexto(ctx);
            
            // Adicionar texto do versículo
            adicionarTextoSobreImagem(ctx);
            
            resolve();
        };
        
        img.src = URL.createObjectURL(imageBlob);
    });
}

// Fallback: criar imagem apenas com gradiente se IA falhar
function criarImagemSemIA() {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    // Cores baseadas no tema
    const coresTema = {
        esperanca: ['#FFD700', '#FFA500'],
        amor: ['#FF69B4', '#FF1493'],
        paz: ['#87CEEB', '#4682B4'],
        fe: ['#9370DB', '#8A2BE2'],
        sabedoria: ['#DAA520', '#B8860B'],
        forca: ['#DC143C', '#B22222'],
        protecao: ['#32CD32', '#228B22']
    };
    
    const tema = document.getElementById('temaEscolhido').value;
    const cores = coresTema[tema] || ['#667eea', '#764ba2'];
    
    // Criar gradiente de fundo
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, cores[0]);
    gradient.addColorStop(1, cores[1]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar texto
    adicionarTextoSobreImagem(ctx);
}

function adicionarOverlayTexto(ctx) {
    const posicao = document.getElementById('posicaoTexto').value;
    const opacidade = parseFloat(document.getElementById('opacidadeFundo').value);
    
    const canvas = ctx.canvas;
    let overlayY, overlayHeight;
    
    // Definir área do overlay baseado na posição
    switch(posicao) {
        case 'superior':
            overlayY = 0;
            overlayHeight = canvas.height * 0.45;
            break;
        case 'centro':
            overlayY = canvas.height * 0.25;
            overlayHeight = canvas.height * 0.5;
            break;
        case 'inferior':
        default:
            overlayY = canvas.height * 0.55;
            overlayHeight = canvas.height * 0.45;
            break;
    }
    
    // Criar gradiente suave para o overlay
    const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
    
    if (posicao === 'superior') {
        gradient.addColorStop(0, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(0.7, `rgba(0,0,0,${opacidade * 0.5})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    } else if (posicao === 'inferior') {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.3, `rgba(0,0,0,${opacidade * 0.5})`);
        gradient.addColorStop(1, `rgba(0,0,0,${opacidade})`);
    } else {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.2, `rgba(0,0,0,${opacidade * 0.3})`);
        gradient.addColorStop(0.5, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(0.8, `rgba(0,0,0,${opacidade * 0.3})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);
}

function adicionarTextoSobreImagem(ctx) {
    const canvas = ctx.canvas;
    const posicao = document.getElementById('posicaoTexto').value;
    
    // Configurações avançadas de texto
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Posicionar texto
    let yBase;
    switch(posicao) {
        case 'superior':
            yBase = canvas.height * 0.2;
            break;
        case 'centro':
            yBase = canvas.height * 0.5;
            break;
        case 'inferior':
        default:
            yBase = canvas.height * 0.75;
            break;
    }
    
    // Texto principal do versículo
    ctx.font = 'bold 30px Inter, Georgia, serif';
    const texto = versiculoAtual.texto;
    
    // Quebrar texto em linhas otimizadas
    const linhas = quebrarTextoInteligente(ctx, texto, canvas.width - 100);
    
    // Calcular posição vertical centralizada
    const alturaLinha = 38;
    const alturaTotal = linhas.length * alturaLinha;
    const yInicial = yBase - (alturaTotal / 2);
    
    // Desenhar cada linha com espaçamento otimizado
    linhas.forEach((linha, index) => {
        ctx.fillText(linha, canvas.width / 2, yInicial + (index * alturaLinha));
    });
    
    // Referência bíblica com estilo diferenciado
    ctx.font = 'italic 24px Inter, Georgia, serif';
    ctx.shadowBlur = 4;
    const yReferencia = yInicial + alturaTotal + 35;
    ctx.fillText(`— ${versiculoAtual.referencia}`, canvas.width / 2, yReferencia);
    
    // Reset shadow para não afetar outros elementos
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// ========== UTILITÁRIOS ==========
function quebrarTextoInteligente(ctx, texto, larguraMax) {
    const palavras = texto.split(' ');
    const linhas = [];
    let linhaAtual = '';
    
    for (let i = 0; i < palavras.length; i++) {
        const palavra = palavras[i];
        const testeLinha = linhaAtual + (linhaAtual ? ' ' : '') + palavra;
        const largura = ctx.measureText(testeLinha).width;
        
        if (largura > larguraMax && linhaAtual) {
            linhas.push(linhaAtual);
            linhaAtual = palavra;
        } else {
            linhaAtual = testeLinha;
        }
    }
    
    if (linhaAtual) {
        linhas.push(linhaAtual);
    }
    
    return linhas;
}

function mostrarProgresso(mensagem, porcentagem) {
    let status = document.getElementById('generationStatus');
    
    if (!status) {
        status = document.createElement('div');
        status.id = 'generationStatus';
        status.className = 'generation-status';
        status.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="status-text"></div>
        `;
        
        const container = document.querySelector('.image-container');
        container.insertBefore(status, document.getElementById('canvasImagem'));
    }
    
    status.classList.remove('hidden');
    status.querySelector('.status-text').textContent = mensagem;
    status.querySelector('.progress-fill').style.width = porcentagem + '%';
}

// ========== FUNCIONALIDADES DE COMPARTILHAMENTO ==========
function baixarImagem() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhuma imagem para baixar');
        return;
    }
    
    const canvas = document.getElementById('canvasImagem');
    const link = document.createElement('a');
    
    // Nome do arquivo mais descritivo
    const nomeArquivo = `versiculo-${versiculoAtual.referencia
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase()}-${Date.now()}.png`;
    
    link.download = nomeArquivo;
    link.href = canvas.toDataURL('image/png', 1.0); // Máxima qualidade
    link.click();
    
    mostrarToast('💾 Imagem baixada com sucesso!');
}

function compartilharWhatsApp() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum versículo para compartilhar');
        return;
    }
    
    const texto = `🙏 *${versiculoAtual.referencia}*\n\n"_${versiculoAtual.texto}_"\n\n✨ Imagem criada com IA em: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    
    window.open(url, '_blank');
    mostrarToast('📱 Abrindo WhatsApp...');
}

function copiarTexto() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum texto para copiar');
        return;
    }
    
    const texto = `"${versiculoAtual.texto}"\n\n— ${versiculoAtual.referencia}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarToast('📋 Texto copiado para a área de transferência!');
        }).catch(() => {
            // Fallback para navegadores mais antigos
            copiarTextoFallback(texto);
        });
    } else {
        copiarTextoFallback(texto);
    }
}

function copiarTextoFallback(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    mostrarToast('📋 Texto copiado!');
}

function compartilharFacebook() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum conteúdo para compartilhar');
        return;
    }
    
    const texto = encodeURIComponent(`"${versiculoAtual.texto}" - ${versiculoAtual.referencia}`);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${texto}`;
    
    window.open(url, '_blank', 'width=600,height=400');
    mostrarToast('📘 Abrindo Facebook...');
}

// ========== SISTEMA DE NOTIFICAÇÕES ==========
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    
    // Adicionar classe baseada no tipo
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    toast.classList.add('show');
    
    // Auto-ocultar após 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ========== CONTADORES E ESTATÍSTICAS ==========
function incrementarContador() {
    const hoje = new Date().toDateString();
    const contadorHoje = localStorage.getItem('contador_hoje');
    const dataContador = localStorage.getItem('data_contador');
    
    if (dataContador !== hoje) {
        // Novo dia, resetar contador diário
        localStorage.setItem('contador_hoje', '1');
        localStorage.setItem('data_contador', hoje);
    } else {
        // Mesmo dia, incrementar
        const novoContador = parseInt(contadorHoje || '0') + 1;
        localStorage.setItem('contador_hoje', novoContador);
    }
    
    // Contador total
    const contadorTotal = parseInt(localStorage.getItem('contador_total') || '0') + 1;
    localStorage.setItem('contador_total', contadorTotal);
    
    atualizarContadores();
}

function atualizarContadores() {
    const contadorHoje = localStorage.getItem('contador_hoje') || '0';
    const contadorTotal = localStorage.getItem('contador_total') || '0';
    
    const elemento = document.getElementById('contadorVersiculos');
    if (elemento) {
        elemento.textContent = `${contadorHoje} hoje • ${contadorTotal} total`;
    }
}
