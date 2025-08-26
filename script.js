// Configurações e estado da aplicação
let versiculos = {};
let versiculoAtual = null;
let apiKey = localStorage.getItem('hf_api_key');
let imagemAtualBlob = null;

// Modelos de IA para diferentes qualidades
const modelos = {
    rapida: "runwayml/stable-diffusion-v1-5",
    media: "stabilityai/stable-diffusion-2-1",
    alta: "runwayml/stable-diffusion-v1-5"
};

// Prompts para estilo barroco baseados no tema
const promptsBarrocos = {
    esperanca: "baroque masterpiece painting, divine light streaming through clouds, golden rays illuminating a peaceful landscape, ornate religious symbolism, dramatic chiaroscuro lighting, renaissance style, oil painting texture, heavenly atmosphere, intricate details",
    amor: "baroque oil painting, cherubs and angels, warm golden light, romantic classical scene, ornate decorative elements, dramatic shadows and highlights, renaissance masterpiece style, divine love symbolism, rich warm colors",
    paz: "baroque landscape painting, serene pastoral scene, soft divine light, olive branches, doves flying, peaceful countryside, dramatic sky with gentle clouds, classical composition, warm earth tones, ornate frame style",
    fe: "baroque religious painting, praying hands, divine light from above, cathedral interior, ornate architecture, dramatic lighting, spiritual symbolism, classical religious art style, golden highlights, sacred atmosphere",
    sabedoria: "baroque portrait style, ancient wisdom symbols, scrolls and books, owl perched nearby, candlelight illumination, ornate library setting, dramatic chiaroscuro, classical composition, rich warm tones",
    forca: "baroque heroic painting, strong figure in classical pose, dramatic lighting, stormy sky clearing to reveal light, ornate armor or robes, powerful composition, dynamic shadows, renaissance masterpiece style",
    protecao: "baroque religious scene, guardian angel with spread wings, protective divine light, shield symbolism, ornate heavenly setting, dramatic composition, warm golden lighting, classical religious art style"
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    verificarApiKey();
    carregarVersiculos();
    configurarEventListeners();
    atualizarContadores();
});

// Verificar se API key existe
function verificarApiKey() {
    if (apiKey) {
        document.getElementById('apiSetup').classList.add('hidden');
    }
}

// Configurar event listeners
function configurarEventListeners() {
    document.getElementById('salvarApi').addEventListener('click', salvarApiKey);
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

// Salvar API key
function salvarApiKey() {
    const key = document.getElementById('apiKey').value.trim();
    if (key) {
        localStorage.setItem('hf_api_key', key);
        apiKey = key;
        document.getElementById('apiSetup').classList.add('hidden');
        mostrarToast('✅ API Key salva com sucesso!');
    } else {
        mostrarToast('❌ Por favor, insira uma API key válida');
    }
}

// Carregar versículos
async function carregarVersiculos() {
    try {
        const response = await fetch('versiculos.json');
        versiculos = await response.json();
        if (apiKey) {
            gerarVersiculoComIA();
        }
    } catch (error) {
        console.error('Erro ao carregar versículos:', error);
        mostrarToast('❌ Erro ao carregar versículos');
    }
}

// Gerar versículo com IA
async function gerarVersiculoComIA() {
    if (!apiKey) {
        mostrarToast('❌ Configure sua API key primeiro');
        return;
    }

    const tema = document.getElementById('temaEscolhido').value;
    const versiculosTema = versiculos[tema];
    
    if (versiculosTema && versiculosTema.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * versiculosTema.length);
        versiculoAtual = versiculosTema[indiceAleatorio];
        
        // Atualizar texto
        document.getElementById('versiculoTexto').textContent = `"${versiculoAtual.texto}"`;
        document.getElementById('versiculoReferencia').textContent = versiculoAtual.referencia;
        
        // Gerar imagem com IA
        await gerarImagemIA(tema);
        
        // Atualizar contador
        incrementarContador();
    }
}

// Gerar imagem com IA
async function gerarImagemIA(tema) {
    try {
        mostrarProgresso('Preparando geração da imagem...', 10);
        
        const qualidade = document.getElementById('qualidadeImagem').value;
        const modelo = modelos[qualidade];
        const prompt = criarPromptCompleto(tema);
        
        mostrarProgresso('Enviando para a IA...', 30);
        
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${modelo}`,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        num_inference_steps: qualidade === 'alta' ? 50 : qualidade === 'media' ? 30 : 20,
                        guidance_scale: 7.5,
                        width: 768,
                        height: 512
                    }
                }),
            }
        );
        
        mostrarProgresso('Processando imagem...', 70);
        
        if (!response.ok) {
            throw new Error('Erro na geração da imagem');
        }
        
        const imageBlob = await response.blob();
        imagemAtualBlob = imageBlob;
        
        mostrarProgresso('Finalizando...', 90);
        
        // Criar imagem final com texto
        await criarImagemFinal(imageBlob);
        
        mostrarProgresso('Concluído!', 100);
        setTimeout(() => {
            document.getElementById('generationStatus').classList.add('hidden');
        }, 2000);
        
        mostrarToast('✅ Imagem gerada com sucesso!');
        
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        mostrarToast('❌ Erro ao gerar imagem. Verifique sua API key.');
        document.getElementById('generationStatus').classList.add('hidden');
    }
}

// Criar prompt completo para IA
function criarPromptCompleto(tema) {
    const promptBase = promptsBarrocos[tema];
    const palavrasChave = extrairPalavrasChave(versiculoAtual.texto);
    
    return `${promptBase}, inspired by biblical themes: ${palavrasChave}, masterpiece quality, highly detailed, 4k resolution, professional artwork, no text, no words, no letters`;
}

// Extrair palavras-chave do versículo
function extrairPalavrasChave(texto) {
    const palavrasImportantes = texto.toLowerCase()
        .split(/[,.;:!?\s]+/)
        .filter(palavra => palavra.length > 3)
        .filter(palavra => !['para', 'porque', 'senhor', 'deus', 'seja', 'está', 'como', 'todo', 'mais', 'pelo', 'pela'].includes(palavra))
        .slice(0, 5);
    
    return palavrasImportantes.join(', ');
}

// Criar imagem final com texto sobreposto
async function criarImagemFinal(imageBlob) {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Carregar imagem da IA
    const img = new Image();
    img.onload = function() {
        // Desenhar imagem de fundo
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Adicionar overlay semi-transparente para legibilidade
        adicionarOverlayTexto(ctx);
        
        // Adicionar texto
        adicionarTextoSobreImagem(ctx);
    };
    
    img.src = URL.createObjectURL(imageBlob);
}

// Adicionar overlay para legibilidade do texto
function adicionarOverlayTexto(ctx) {
    const posicao = document.getElementById('posicaoTexto').value;
    const opacidade = parseFloat(document.getElementById('opacidadeFundo').value);
    
    const canvas = ctx.canvas;
    let overlayY, overlayHeight;
    
    switch(posicao) {
        case 'superior':
            overlayY = 0;
            overlayHeight = canvas.height * 0.4;
            break;
        case 'centro':
            overlayY = canvas.height * 0.3;
            overlayHeight = canvas.height * 0.4;
            break;
        case 'inferior':
        default:
            overlayY = canvas.height * 0.6;
            overlayHeight = canvas.height * 0.4;
            break;
    }
    
    // Criar gradiente para o overlay
    const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
    
    if (posicao === 'superior') {
        gradient.addColorStop(0, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    } else if (posicao === 'inferior') {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${opacidade})`);
    } else {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.5, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);
}

// Adicionar texto sobre a imagem
function adicionarTextoSobreImagem(ctx) {
    const canvas = ctx.canvas;
    const posicao = document.getElementById('posicaoTexto').value;
    
    // Configurações de texto
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Posicionar texto baseado na escolha
    let yBase;
    switch(posicao) {
        case 'superior':
            yBase = canvas.height * 0.15;
            break;
        case 'centro':
            yBase = canvas.height * 0.45;
            break;
        case 'inferior':
        default:
            yBase = canvas.height * 0.75;
            break;
    }
    
    // Texto do versículo
    ctx.font = 'bold 28px Inter, Arial, sans-serif';
    const texto = versiculoAtual.texto;
    
    // Quebrar texto em linhas
    const linhas = quebrarTexto(ctx, texto, canvas.width - 80);
    
    // Desenhar linhas do texto
    const alturaLinha = 35;
    const yInicial = yBase - ((linhas.length - 1) * alturaLinha) / 2;
    
    linhas.forEach((linha, index) => {
        ctx.fillText(linha, canvas.width / 2, yInicial + (index * alturaLinha));
    });
    
    // Referência
    ctx.font = 'italic 22px Inter, Arial, sans-serif';
    ctx.fillText(
        `— ${versiculoAtual.referencia}`, 
        canvas.width / 2, 
        yInicial + (linhas.length * alturaLinha) + 25
    );
}

// Quebrar texto em linhas
function quebrarTexto(ctx, texto, larguraMax) {
    const palavras = texto.split(' ');
    const linhas = [];
    let linhaAtual = '';
    
    for (let palavra of palavras) {
        const testeLinha = linhaAtual + palavra + ' ';
        const largura = ctx.measureText(testeLinha).width;
        
        if (largura > larguraMax && linhaAtual !== '') {
            linhas.push(linhaAtual.trim());
            linhaAtual = palavra + ' ';
        } else {
            linhaAtual = testeLinha;
        }
    }
    
    linhas.push(linhaAtual.trim());
    return linhas;
}

// Mostrar progresso
function mostrarProgresso(mensagem, porcentagem) {
    const status = document.getElementById('generationStatus');
    if (!status) {
        const div = document.createElement('div');
        div.id = 'generationStatus';
        div.className = 'generation-status';
        div.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="status-text"></div>
        `;
        document.querySelector('.image-container').insertBefore(div, document.getElementById('canvasImagem'));
    }
    
    document.getElementById('generationStatus').classList.remove('hidden');
    document.querySelector('.status-text').textContent = mensagem;
    document.querySelector('.progress-fill').style.width = porcentagem + '%';
}

// Baixar imagem
function baixarImagem() {
    const canvas = document.getElementById('canvasImagem');
    const link = document.createElement('a');
    link.download = `versiculo-${versiculoAtual.referencia.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    mostrarToast('💾 Imagem baixada!');
}

// Compartilhar no WhatsApp
function compartilharWhatsApp() {
    const texto = `🙏 *${versiculoAtual.referencia}*\n\n"_${versiculoAtual.texto}_"\n\n✨ Gerado em: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    
    mostrarToast('📱 Abrindo WhatsApp...');
}

// Copiar texto
function copiarTexto() {
    const texto = `${versiculoAtual.texto}\n\n${versiculoAtual.referencia}`;
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('📋 Texto copiado!');
    });
}

// Compartilhar no Facebook
function compartilharFacebook() {
    const texto = encodeURIComponent(`${versiculoAtual.texto} - ${versiculoAtual.referencia}`);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${texto}`;
    window.open(url, '_blank');
    
    mostrarToast('📘 Abrindo Facebook...');
}

// Mostrar toast
function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Incrementar contador
function incrementarContador() {
    let contador = parseInt(localStorage.getItem('contador_versiculos') || '0');
    contador++;
    localStorage.setItem('contador_versiculos', contador);
    atualizarContadores();
}

// Atualizar contadores
function atualizarContadores() {
    const contador = localStorage.getItem('contador_versiculos') || '0';
    if (document.getElementById('contadorVersiculos')) {
        document.getElementById('contadorVersiculos').textContent = `${contador} versículos gerados`;
    }
}
