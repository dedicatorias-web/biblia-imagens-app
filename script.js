// ========== CONFIGURAÇÕES DA APLICAÇÃO ==========
let versiculos = {};
let versiculoAtual = null;
let imagemAtualBlob = null;

// Prompts para estilo barroco baseados no tema
const promptsBarrocos = {
    esperanca: "baroque masterpiece oil painting, divine golden light streaming through dramatic clouds, heavenly rays illuminating peaceful landscape, ornate religious symbolism, dramatic chiaroscuro lighting, renaissance style, warm golden atmosphere, intricate baroque details, hope and faith theme",
    
    amor: "baroque oil painting, cherubs and angels in warm golden light, romantic divine scene with ornate decorative elements, dramatic shadows and highlights, renaissance masterpiece style, divine love symbolism, rich warm colors, classical religious composition",
    
    paz: "baroque landscape painting, serene pastoral scene with soft divine light, white doves flying, olive branches, peaceful countryside, dramatic sky with golden clouds, classical composition, warm earth tones, baroque religious art style",
    
    fe: "baroque religious painting, praying hands in divine light from above, magnificent cathedral interior, ornate gothic architecture, dramatic lighting, spiritual golden symbolism, classical religious art, baroque masterpiece composition",
    
    sabedoria: "baroque portrait style, ancient wisdom symbols, ornate scrolls and ancient books, wise owl, warm candlelight, classical library with baroque architecture, dramatic chiaroscuro, rich golden tones, renaissance masterpiece",
    
    forca: "baroque heroic painting, powerful figure in classical pose, divine light breaking through stormy clouds, ornate elements, dynamic composition, renaissance style, dramatic shadows and highlights, biblical strength symbolism",
    
    protecao: "baroque religious masterpiece, guardian angel with golden wings spread wide, protective divine light, heavenly setting, ornate baroque composition, warm celestial lighting, classical religious art style"
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
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
        gerarVersiculoComIA();
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
    
    const indiceAleatorio = Math.floor(Math.random() * versiculosTema.length);
    versiculoAtual = versiculosTema[indiceAleatorio];
    
    document.getElementById('versiculoTexto').textContent = `"${versiculoAtual.texto}"`;
    document.getElementById('versiculoReferencia').textContent = versiculoAtual.referencia;
    
    await gerarImagemIA(tema);
    incrementarContador();
}

async function gerarImagemIA(tema) {
    try {
        const botaoGerar = document.getElementById('gerarVersiculo');
        botaoGerar.disabled = true;
        botaoGerar.textContent = '🎨 Gerando arte...';
        
        mostrarProgresso('🎨 Criando obra barroca...', 20);
        
        const prompt = criarPromptCompleto(tema);
        const qualidade = document.getElementById('qualidadeImagem').value;
        
        // Configurações baseadas na qualidade
        const config = {
            rapida: { width: 512, height: 384, steps: 20 },
            media: { width: 768, height: 512, steps: 30 },
            alta: { width: 1024, height: 768, steps: 40 }
        };
        
        const { width, height } = config[qualidade];
        
        mostrarProgresso('🤖 Processando com IA...', 60);
        
        // URL do Pollinations AI (gratuito, sem API key)
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}&enhance=true&nologo=true`;
        
        console.log('Gerando imagem com prompt:', prompt);
        
        mostrarProgresso('✨ Finalizando obra...', 90);
        
        // Carregar imagem
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = async function() {
            // Converter para blob
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(async (blob) => {
                imagemAtualBlob = blob;
                await criarImagemFinal(blob);
                mostrarProgresso('🙏 Obra concluída!', 100);
                
                setTimeout(() => {
                    const status = document.getElementById('generationStatus');
                    if (status) status.classList.add('hidden');
                }, 2000);
                
                mostrarToast('✅ Imagem sagrada criada!');
                
                botaoGerar.disabled = false;
                botaoGerar.textContent = '🎨 Gerar Nova Imagem';
            }, 'image/png');
        };
        
        img.onerror = function() {
            console.error('Erro ao carregar imagem da IA');
            criarImagemSemIA();
            mostrarToast('⚠️ Usando estilo alternativo');
            
            botaoGerar.disabled = false;
            botaoGerar.textContent = '🎨 Gerar Nova Imagem';
            
            const status = document.getElementById('generationStatus');
            if (status) status.classList.add('hidden');
        };
        
        img.src = imageUrl;
        
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        criarImagemSemIA();
        mostrarToast('⚠️ Usando modo offline');
        
        const botaoGerar = document.getElementById('gerarVersiculo');
        botaoGerar.disabled = false;
        botaoGerar.textContent = '🎨 Gerar Nova Imagem';
        
        const status = document.getElementById('generationStatus');
        if (status) status.classList.add('hidden');
    }
}

function criarPromptCompleto(tema) {
    const promptBase = promptsBarrocos[tema];
    const palavrasChave = extrairPalavrasChave(versiculoAtual.texto);
    
    return `${promptBase}, biblical inspiration: ${palavrasChave}, masterpiece quality, highly detailed, professional religious art, no text, no words, clean composition, 8k resolution`;
}

function extrairPalavrasChave(texto) {
    const ignorar = [
        'para', 'porque', 'senhor', 'deus', 'seja', 'está', 'como', 'todo', 'mais', 'pelo', 'pela',
        'uma', 'dos', 'das', 'com', 'não', 'que', 'ele', 'ela', 'seu', 'sua', 'nos', 'nas'
    ];
    
    const palavrasImportantes = texto.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .split(/[,.;:!?\s]+/)
        .filter(palavra => palavra.length > 3)
        .filter(palavra => !ignorar.includes(palavra))
        .slice(0, 4);
    
    return palavrasImportantes.join(', ');
}

async function criarImagemFinal(imageBlob) {
    return new Promise((resolve) => {
        const canvas = document.getElementById('canvasImagem');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            adicionarOverlayTexto(ctx);
            adicionarTextoSobreImagem(ctx);
            resolve();
        };
        
        img.src = URL.createObjectURL(imageBlob);
    });
}

function criarImagemSemIA() {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    const coresTema = {
        esperanca: ['#FFD700', '#FF8C00', '#FFA500'],
        amor: ['#FF69B4', '#FF1493', '#DC143C'],
        paz: ['#87CEEB', '#4682B4', '#6495ED'],
        fe: ['#9370DB', '#8A2BE2', '#9932CC'],
        sabedoria: ['#DAA520', '#B8860B', '#CD853F'],
        forca: ['#DC143C', '#B22222', '#8B0000'],
        protecao: ['#32CD32', '#228B22', '#006400']
    };
    
    const tema = document.getElementById('temaEscolhido').value;
    const cores = coresTema[tema] || ['#667eea', '#764ba2', '#5a67d8'];
    
    // Criar gradiente radial mais complexo
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.max(canvas.width, canvas.height) / 2;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, cores[0]);
    gradient.addColorStop(0.5, cores[1]);
    gradient.addColorStop(1, cores[2]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar padrão decorativo
    adicionarPadraoDecorativo(ctx, tema);
    adicionarTextoSobreImagem(ctx);
}

function adicionarPadraoDecorativo(ctx, tema) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    
    // Padrões baseados no tema
    const padroes = {
        esperanca: () => desenharEstrelas(ctx),
        amor: () => desenharCoracoes(ctx),
        paz: () => desenharPombas(ctx),
        fe: () => desenharCruzes(ctx),
        sabedoria: () => desenharScrolls(ctx),
        forca: () => desenharRaios(ctx),
        protecao: () => desenharEscudos(ctx)
    };
    
    const padrao = padroes[tema] || padroes.esperanca;
    padrao();
    
    ctx.restore();
}

function desenharEstrelas(ctx) {
    ctx.fillStyle = 'gold';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        desenharEstrela(ctx, x, y, 15, 5, 0.5);
    }
}

function desenharEstrela(ctx, cx, cy, raioExt, pontas, raioInt) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(0, 0 - raioExt);
    
    for (let i = 0; i < pontas; i++) {
        ctx.rotate(Math.PI / pontas);
        ctx.lineTo(0, 0 - (raioExt * raioInt));
        ctx.rotate(Math.PI / pontas);
        ctx.lineTo(0, 0 - raioExt);
    }
    
    ctx.fill();
    ctx.restore();
}

function desenharCoracoes(ctx) {
    ctx.fillStyle = 'pink';
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        desenharCoracao(ctx, x, y, 20);
    }
}

function desenharCoracao(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(-size/4, -size/4, size/4, 0, Math.PI * 2);
    ctx.arc(size/4, -size/4, size/4, 0, Math.PI * 2);
    ctx.moveTo(0, size/4);
    ctx.lineTo(-size/2, -size/8);
    ctx.lineTo(size/2, -size/8);
    ctx.lineTo(0, size/4);
    ctx.fill();
    ctx.restore();
}

function desenharPombas(ctx) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI);
        ctx.moveTo(x - 15, y);
        ctx.lineTo(x - 5, y - 5);
        ctx.moveTo(x + 15, y);
        ctx.lineTo(x + 5, y - 5);
        ctx.stroke();
    }
}

function desenharCruzes(ctx) {
    ctx.strokeStyle = 'gold';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const size = 20;
        
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.moveTo(x - size/2, y - size/2);
        ctx.lineTo(x + size/2, y - size/2);
        ctx.stroke();
    }
}

function desenharScrolls(ctx) {
    ctx.strokeStyle = 'burlywood';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        
        ctx.beginPath();
        ctx.rect(x - 15, y - 10, 30, 20);
        ctx.moveTo(x - 15, y - 10);
        ctx.bezierCurveTo(x - 20, y - 15, x - 20, y + 15, x - 15, y + 10);
        ctx.moveTo(x + 15, y - 10);
        ctx.bezierCurveTo(x + 20, y - 15, x + 20, y + 15, x + 15, y + 10);
        ctx.stroke();
    }
}

function desenharRaios(ctx) {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(x, y - 25);
        ctx.lineTo(x - 8, y - 5);
        ctx.lineTo(x + 3, y - 5);
        ctx.lineTo(x - 5, y + 10);
        ctx.lineTo(x + 8, y - 5);
        ctx.lineTo(x - 3, y - 5);
        ctx.lineTo(x, y - 25);
        ctx.stroke();
    }
}

function desenharEscudos(ctx) {
    ctx.fillStyle = 'silver';
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x - 10, y - 10);
        ctx.lineTo(x - 10, y + 5);
        ctx.lineTo(x, y + 15);
        ctx.lineTo(x + 10, y + 5);
        ctx.lineTo(x + 10, y - 10);
        ctx.closePath();
        ctx.fill();
    }
}

function adicionarOverlayTexto(ctx) {
    const posicao = document.getElementById('posicaoTexto').value;
    const opacidade = parseFloat(document.getElementById('opacidadeFundo').value);
    
    const canvas = ctx.canvas;
    let overlayY, overlayHeight;
    
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
    
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
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
    
    ctx.font = 'bold 32px Inter, Georgia, serif';
    const texto = versiculoAtual.texto;
    
    const linhas = quebrarTextoInteligente(ctx, texto, canvas.width - 100);
    
    const alturaLinha = 40;
    const alturaTotal = linhas.length * alturaLinha;
    const yInicial = yBase - (alturaTotal / 2);
    
    linhas.forEach((linha, index) => {
        ctx.fillText(linha, canvas.width / 2, yInicial + (index * alturaLinha));
    });
    
    ctx.font = 'italic 26px Inter, Georgia, serif';
    ctx.shadowBlur = 6;
    const yReferencia = yInicial + alturaTotal + 40;
    ctx.fillText(`— ${versiculoAtual.referencia}`, canvas.width / 2, yReferencia);
    
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

function baixarImagem() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhuma imagem para baixar');
        return;
    }
    
    const canvas = document.getElementById('canvasImagem');
    const link = document.createElement('a');
    
    const nomeArquivo = `versiculo-${versiculoAtual.referencia
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase()}-${Date.now()}.png`;
    
    link.download = nomeArquivo;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    mostrarToast('💾 Imagem baixada com sucesso!');
}

function compartilharWhatsApp() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum versículo para compartilhar');
        return;
    }
    
    const texto = `🙏 *${versiculoAtual.referencia}*\n\n"_${versiculoAtual.texto}_"\n\n✨ Criado em: ${window.location.href}`;
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
            mostrarToast('📋 Texto copiado!');
        }).catch(() => {
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

function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function incrementarContador() {
    const hoje = new Date().toDateString();
    const contadorHoje = localStorage.getItem('contador_hoje');
    const dataContador = localStorage.getItem('data_contador');
    
    if (dataContador !== hoje) {
        localStorage.setItem('contador_hoje', '1');
        localStorage.setItem('data_contador', hoje);
    } else {
        const novoContador = parseInt(contadorHoje || '0') + 1;
        localStorage.setItem('contador_hoje', novoContador);
    }
    
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
