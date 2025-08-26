// ========== CONFIGURAÇÕES DA APLICAÇÃO ==========
let versiculos = {};
let versiculoAtual = null;
let imagemAtualBlob = null;

// URLs dos modelos gratuitos do Hugging Face
const modelosGratuitos = {
    rapida: "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
    media: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
    alta: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
};

// Prompts otimizados para estilo barroco
const promptsBarrocos = {
    esperanca: "baroque oil painting masterpiece, divine golden light streaming through dramatic clouds, heavenly rays illuminating peaceful landscape, ornate religious symbolism, renaissance style, warm golden atmosphere, hope and faith, classical religious art, chiaroscuro lighting",
    
    amor: "baroque religious painting, cherubic angels with golden wings, divine love theme, warm romantic lighting, ornate decorative elements, renaissance masterpiece style, heavenly atmosphere, classical composition, rich warm colors",
    
    paz: "baroque landscape painting, serene pastoral scene, soft divine light, white doves flying, olive branches, peaceful countryside, golden clouds, classical religious composition, tranquil atmosphere, renaissance style",
    
    fe: "baroque religious masterpiece, praying hands in divine light, magnificent cathedral interior, ornate gothic architecture, spiritual golden symbolism, classical religious art, dramatic lighting, faith theme",
    
    sabedoria: "baroque portrait style, ancient scrolls and books, wise symbols, warm candlelight, classical library setting, ornate architecture, renaissance masterpiece, wisdom theme, golden tones",
    
    forca: "baroque heroic painting, powerful biblical figure, divine light through stormy clouds, ornate elements, dramatic composition, renaissance style, strength theme, classical religious art",
    
    protecao: "baroque religious painting, guardian angel with spread wings, protective divine light, heavenly setting, ornate composition, warm celestial lighting, classical religious style, protection theme"
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    carregarVersiculos();
    configurarEventListeners();
    atualizarContadores();
    mostrarToast('✅ App carregado! Usando Hugging Face gratuito.');
});

// ========== EVENT LISTENERS ==========
function configurarEventListeners() {
    document.getElementById('gerarVersiculo').addEventListener('click', gerarVersiculoComHF);
    document.getElementById('temaEscolhido').addEventListener('change', gerarVersiculoComHF);
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
        gerarVersiculoComHF();
    } catch (error) {
        console.error('Erro ao carregar versículos:', error);
        mostrarToast('❌ Erro ao carregar versículos', 'error');
    }
}

// ========== GERAÇÃO COM HUGGING FACE ==========
async function gerarVersiculoComHF() {
    const tema = document.getElementById('temaEscolhido').value;
    const versiculosTema = versiculos[tema];
    
    if (!versiculosTema || versiculosTema.length === 0) {
        mostrarToast('❌ Nenhum versículo encontrado para este tema', 'error');
        return;
    }
    
    const indiceAleatorio = Math.floor(Math.random() * versiculosTema.length);
    versiculoAtual = versiculosTema[indiceAleatorio];
    
    document.getElementById('versiculoTexto').textContent = `"${versiculoAtual.texto}"`;
    document.getElementById('versiculoReferencia').textContent = versiculoAtual.referencia;
    
    await gerarImagemHuggingFace(tema);
    incrementarContador();
}

async function gerarImagemHuggingFace(tema) {
    const botaoGerar = document.getElementById('gerarVersiculo');
    botaoGerar.disabled = true;
    botaoGerar.textContent = '🎨 Gerando arte...';
    
    try {
        mostrarProgresso('🎨 Preparando prompt artístico...', 10);
        
        const qualidade = document.getElementById('qualidadeImagem').value;
        const modelUrl = modelosGratuitos[qualidade];
        const prompt = criarPromptCompleto(tema);
        
        mostrarProgresso('🤖 Conectando com Hugging Face...', 20);
        
        // Primeira tentativa com modelo principal
        let imageBlob = await tentarGerarImagem(modelUrl, prompt, qualidade, tema);
        
        if (!imageBlob) {
            mostrarProgresso('🔄 Tentando modelo alternativo...', 40);
            // Segunda tentativa com modelo mais simples
            imageBlob = await tentarGerarImagem(modelosGratuitos.rapida, prompt, 'rapida', tema);
        }
        
        if (!imageBlob) {
            mostrarProgresso('🎨 Usando gerador artístico local...', 60);
            // Fallback para geração local
            gerarImagemArtisticaLocal(tema);
            mostrarToast('🎨 Usando modo artístico offline');
            return;
        }
        
        mostrarProgresso('✨ Finalizando obra...', 80);
        
        imagemAtualBlob = imageBlob;
        await criarImagemFinalComTexto(imageBlob);
        
        mostrarProgresso('🙏 Obra concluída!', 100);
        
        setTimeout(() => {
            const status = document.getElementById('generationStatus');
            if (status) status.classList.add('hidden');
        }, 2000);
        
        mostrarToast('✅ Imagem criada com sucesso!');
        
    } catch (error) {
        console.error('Erro na geração:', error);
        mostrarToast('🎨 Usando modo artístico local', 'warning');
        gerarImagemArtisticaLocal(tema);
    } finally {
        botaoGerar.disabled = false;
        botaoGerar.textContent = '🎨 Gerar Nova Arte';
        
        const status = document.getElementById('generationStatus');
        if (status) status.classList.add('hidden');
    }
}

async function tentarGerarImagem(modelUrl, prompt, qualidade, tema) {
    try {
        mostrarProgresso(`🤖 Gerando com ${qualidade}...`, 30);
        
        const response = await fetch(modelUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_inference_steps: qualidade === 'alta' ? 30 : qualidade === 'media' ? 20 : 15,
                    guidance_scale: 7.5,
                    width: qualidade === 'alta' ? 768 : 512,
                    height: qualidade === 'alta' ? 512 : 384,
                    negative_prompt: "text, words, letters, watermark, signature, blurry, low quality, distorted, bad anatomy, cartoon, anime"
                }
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            
            // Verificar se é uma imagem válida
            if (blob.size > 1000 && blob.type.includes('image')) {
                mostrarProgresso('✅ Imagem gerada com sucesso!', 70);
                return blob;
            }
        }
        
        // Se chegou aqui, houve erro
        const errorText = await response.text();
        console.log('Resposta do HF:', errorText);
        
        return null;
        
    } catch (error) {
        console.error('Erro na tentativa:', error);
        return null;
    }
}

function criarPromptCompleto(tema) {
    const promptBase = promptsBarrocos[tema];
    const palavrasChave = extrairPalavrasChave(versiculoAtual.texto);
    
    return `${promptBase}, inspired by: ${palavrasChave}, masterpiece quality, highly detailed, 4k resolution, professional artwork, no text overlay, clean composition`;
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

async function criarImagemFinalComTexto(imageBlob) {
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

// ========== GERAÇÃO ARTÍSTICA LOCAL (FALLBACK) ==========
function gerarImagemArtisticaLocal(tema) {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Criar fundo artístico baseado no tema
    criarFundoArtistico(ctx, tema);
    
    // Adicionar elementos decorativos
    adicionarElementosDecorativos(ctx, tema);
    
    // Adicionar textura
    adicionarTexturaArtistica(ctx);
    
    // Adicionar texto
    adicionarTextoSobreImagem(ctx);
}

function criarFundoArtistico(ctx, tema) {
    const canvas = ctx.canvas;
    
    const fundosArtisticos = {
        esperanca: () => {
            // Gradiente radiante dourado
            const grad = ctx.createRadialGradient(
                canvas.width * 0.3, canvas.height * 0.3, 0,
                canvas.width * 0.7, canvas.height * 0.7, canvas.width * 0.8
            );
            grad.addColorStop(0, '#FFF8DC');
            grad.addColorStop(0.3, '#FFD700');
            grad.addColorStop(0.6, '#DAA520');
            grad.addColorStop(1, '#B8860B');
            return grad;
        },
        
        amor: () => {
            // Gradiente romântico
            const grad = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.6
            );
            grad.addColorStop(0, '#FFE4E1');
            grad.addColorStop(0.4, '#FFB6C1');
            grad.addColorStop(0.7, '#FF69B4');
            grad.addColorStop(1, '#DC143C');
            return grad;
        },
        
        paz: () => {
            // Gradiente sereno
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#F0F8FF');
            grad.addColorStop(0.3, '#E0F6FF');
            grad.addColorStop(0.7, '#87CEEB');
            grad.addColorStop(1, '#4682B4');
            return grad;
        },
        
        fe: () => {
            // Gradiente espiritual
            const grad = ctx.createRadialGradient(
                canvas.width * 0.2, canvas.height * 0.2, 0,
                canvas.width * 0.8, canvas.height * 0.8, canvas.width
            );
            grad.addColorStop(0, '#E6E6FA');
            grad.addColorStop(0.4, '#DDA0DD');
            grad.addColorStop(0.7, '#9370DB');
            grad.addColorStop(1, '#4B0082');
            return grad;
        },
        
        sabedoria: () => {
            // Gradiente sábio
            const grad = ctx.createLinearGradient(canvas.width, 0, 0, canvas.height);
            grad.addColorStop(0, '#FDF5E6');
            grad.addColorStop(0.3, '#F5DEB3');
            grad.addColorStop(0.7, '#DEB887');
            grad.addColorStop(1, '#8B7355');
            return grad;
        },
        
        forca: () => {
            // Gradiente forte
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#FFE4E1');
            grad.addColorStop(0.3, '#FA8072');
            grad.addColorStop(0.7, '#DC143C');
            grad.addColorStop(1, '#8B0000');
            return grad;
        },
        
        protecao: () => {
            // Gradiente protetor
            const grad = ctx.createRadialGradient(
                canvas.width / 2, canvas.height * 0.3, 0,
                canvas.width / 2, canvas.height * 0.7, canvas.width * 0.5
            );
            grad.addColorStop(0, '#F0FFF0');
            grad.addColorStop(0.4, '#98FB98');
            grad.addColorStop(0.7, '#32CD32');
            grad.addColorStop(1, '#006400');
            return grad;
        }
    };
    
    const criarFundo = fundosArtisticos[tema] || fundosArtisticos.esperanca;
    ctx.fillStyle = criarFundo();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function adicionarElementosDecorativos(ctx, tema) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    
    const decoracoes = {
        esperanca: () => {
            // Raios de luz dourados
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height / 2;
            
            for (let i = 0; i < 12; i++) {
                const angulo = (i * 30) * Math.PI / 180;
                const raio = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(angulo) * raio,
                    centerY + Math.sin(angulo) * raio
                );
                ctx.stroke();
            }
        },
        
        amor: () => {
            // Corações decorativos
            ctx.fillStyle = '#FFB6C1';
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharCoracao(ctx, x, y, 20 + Math.random() * 15);
            }
        },
        
        paz: () => {
            // Círculos concêntricos
            ctx.strokeStyle = '#87CEEB';
            ctx.lineWidth = 2;
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height / 2;
            
            for (let i = 1; i <= 6; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, i * 50, 0, Math.PI * 2);
                ctx.stroke();
            }
        },
        
        fe: () => {
            // Cruzes ornamentais
            ctx.strokeStyle = '#9370DB';
            ctx.lineWidth = 4;
            for (let i = 0; i < 8; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharCruz(ctx, x, y, 30);
            }
        },
        
        sabedoria: () => {
            // Símbolos de sabedoria
            ctx.fillStyle = '#DEB887';
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharLivro(ctx, x, y, 25);
            }
        },
        
        forca: () => {
            // Raios de força
            ctx.strokeStyle = '#DC143C';
            ctx.lineWidth = 3;
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharRaio(ctx, x, y, 40);
            }
        },
        
        protecao: () => {
            // Escudos protetores
            ctx.fillStyle = '#32CD32';
            for (let i = 0; i < 6; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharEscudo(ctx, x, y, 35);
            }
        }
    };
    
    const decoracao = decoracoes[tema] || decoracoes.esperanca;
    decoracao();
    
    ctx.restore();
}

function adicionarTexturaArtistica(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    
    // Textura pontilhada dourada
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const raio = Math.random() * 3 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// ========== FUNÇÕES DE DESENHO ==========
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

function desenharCruz(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.moveTo(x - size/2, y - size/2);
    ctx.lineTo(x + size/2, y - size/2);
    ctx.stroke();
}

function desenharLivro(ctx, x, y, size) {
    ctx.fillRect(x - size/2, y - size/3, size, size * 0.7);
    ctx.strokeRect(x - size/2, y - size/3, size, size * 0.7);
    
    // Páginas
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x - size/2 + 5, y - size/3 + i * 5);
        ctx.lineTo(x + size/2 - 5, y - size/3 + i * 5);
        ctx.stroke();
    }
}

function desenharRaio(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size/3, y - size/3);
    ctx.lineTo(x + size/6, y - size/3);
    ctx.lineTo(x - size/3, y + size/3);
    ctx.lineTo(x + size/3, y - size/6);
    ctx.lineTo(x - size/6, y + size/3);
    ctx.lineTo(x, y - size);
    ctx.stroke();
}

function desenharEscudo(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size/2, y - size/2);
    ctx.lineTo(x - size/2, y + size/3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x + size/2, y + size/3);
    ctx.lineTo(x + size/2, y - size/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// ========== TEXTO E INTERFACE ==========
function adicionarOverlayTexto(ctx) {
    const posicao = document.getElementById('posicaoTexto').value;
    const opacidade = parseFloat(document.getElementById('opacidadeFundo').value);
    
    const canvas = ctx.canvas;
    let overlayY, overlayHeight;
    
    switch(posicao) {
        case 'superior':
            overlayY = 0;
            overlayHeight = canvas.height * 0.5;
            break;
        case 'centro':
            overlayY = canvas.height * 0.2;
            overlayHeight = canvas.height * 0.6;
            break;
        case 'inferior':
        default:
            overlayY = canvas.height * 0.5;
            overlayHeight = canvas.height * 0.5;
            break;
    }
    
    const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
    
    if (posicao === 'superior') {
        gradient.addColorStop(0, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(0.7, `rgba(0,0,0,${opacidade * 0.3})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    } else if (posicao === 'inferior') {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.3, `rgba(0,0,0,${opacidade * 0.3})`);
        gradient.addColorStop(1, `rgba(0,0,0,${opacidade})`);
    } else {
        gradient.addColorStop(0, `rgba(0,0,0,${opacidade * 0.2})`);
        gradient.addColorStop(0.3, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(0.7, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(1, `rgba(0,0,0,${opacidade * 0.2})`);
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
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    let yBase;
    switch(posicao) {
        case 'superior':
            yBase = canvas.height * 0.25;
            break;
        case 'centro':
            yBase = canvas.height * 0.5;
            break;
        case 'inferior':
        default:
            yBase = canvas.height * 0.72;
            break;
    }
    
    ctx.font = 'bold 32px "Times New Roman", Georgia, serif';
    const texto = versiculoAtual.texto;
    
    const linhas = quebrarTextoInteligente(ctx, texto, canvas.width - 120);
    
    const alturaLinha = 38;
    const alturaTotal = linhas.length * alturaLinha;
    const yInicial = yBase - (alturaTotal / 2);
    
    linhas.forEach((linha, index) => {
        ctx.fillText(linha, canvas.width / 2, yInicial + (index * alturaLinha));
    });
    
    ctx.font = 'italic bold 26px "Times New Roman", Georgia, serif';
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
            linhas.push(linhaAtual.trim());
            linhaAtual = palavra;
        } else {
            linhaAtual = testeLinha;
        }
    }
    
    if (linhaAtual) {
        linhas.push(linhaAtual.trim());
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
        mostrarToast('❌ Nenhuma imagem para baixar', 'error');
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
    
    mostrarToast('💾 Imagem baixada!');
}

function compartilharWhatsApp() {
    if (!versiculoAtual) return;
    
    const texto = `🙏 *${versiculoAtual.referencia}*\n\n"_${versiculoAtual.texto}_"\n\n✨ Criado em: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    
    window.open(url, '_blank');
    mostrarToast('📱 Abrindo WhatsApp...');
}

function copiarTexto() {
    if (!versiculoAtual) return;
    
    const texto = `"${versiculoAtual.texto}"\n\n— ${versiculoAtual.referencia}`;
    
    if (navigator
\<Streaming stoppped because the conversation grew too long for this model\>
