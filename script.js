// ========== CONFIGURAÇÕES DA APLICAÇÃO ==========
let versiculos = {};
let versiculoAtual = null;
let imagemAtualBlob = null;

// Coleções de imagens por tema do Unsplash via Picsum
const imagensPorTema = {
    esperanca: [1015, 1016, 1025, 1039, 1041, 1043, 1044, 1048, 1051, 1063],
    amor: [1073, 1074, 1075, 1076, 1077, 1079, 1080, 1081, 1082, 1084],
    paz: [1018, 1019, 1020, 1021, 1024, 1026, 1027, 1029, 1031, 1036],
    fe: [1067, 1068, 1069, 1070, 1071, 1072, 1078, 1083, 1085, 1086],
    sabedoria: [159, 160, 161, 162, 163, 164, 165, 166, 167, 168],
    forca: [146, 147, 148, 149, 150, 151, 152, 153, 154, 155],
    protecao: [137, 138, 139, 140, 141, 142, 143, 144, 145, 156]
};

// Filtros artísticos por tema
const filtrosArtisticos = {
    esperanca: { sepia: 0.3, saturate: 1.4, brightness: 1.2, hue: 45 },
    amor: { sepia: 0.2, saturate: 1.6, brightness: 1.1, hue: 320 },
    paz: { sepia: 0.1, saturate: 1.2, brightness: 1.3, hue: 200 },
    fe: { sepia: 0.4, saturate: 1.3, brightness: 1.1, hue: 260 },
    sabedoria: { sepia: 0.6, saturate: 1.1, brightness: 0.9, hue: 30 },
    forca: { sepia: 0.2, saturate: 1.5, brightness: 1.0, hue: 0 },
    protecao: { sepia: 0.3, saturate: 1.3, brightness: 1.2, hue: 120 }
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
    document.getElementById('gerarVersiculo').addEventListener('click', gerarVersiculoComImagem);
    document.getElementById('temaEscolhido').addEventListener('change', gerarVersiculoComImagem);
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
        gerarVersiculoComImagem();
    } catch (error) {
        console.error('Erro ao carregar versículos:', error);
        mostrarToast('❌ Erro ao carregar versículos');
    }
}

// ========== GERAÇÃO DE VERSÍCULOS ==========
async function gerarVersiculoComImagem() {
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
    
    await gerarImagemArtistica(tema);
    incrementarContador();
}

async function gerarImagemArtistica(tema) {
    try {
        const botaoGerar = document.getElementById('gerarVersiculo');
        botaoGerar.disabled = true;
        botaoGerar.textContent = '🎨 Criando arte...';
        
        mostrarProgresso('🎨 Selecionando imagem inspiradora...', 20);
        
        // Selecionar imagem aleatória do tema
        const imagensDoTema = imagensPorTema[tema];
        const imagemId = imagensDoTema[Math.floor(Math.random() * imagensDoTema.length)];
        
        const qualidade = document.getElementById('qualidadeImagem').value;
        const dimensoes = {
            rapida: { w: 600, h: 400 },
            media: { w: 800, h: 600 },
            alta: { w: 1200, h: 800 }
        };
        
        const { w, h } = dimensoes[qualidade];
        
        // URL da imagem do Picsum (sempre funciona)
        const imageUrl = `https://picsum.photos/id/${imagemId}/${w}/${h}`;
        
        mostrarProgresso('🖼️ Carregando imagem base...', 50);
        
        // Carregar imagem
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            mostrarProgresso('✨ Aplicando filtros artísticos...', 80);
            criarImagemComFiltros(img, tema);
            
            mostrarProgresso('🙏 Finalizando obra sagrada...', 100);
            
            setTimeout(() => {
                const status = document.getElementById('generationStatus');
                if (status) status.classList.add('hidden');
            }, 2000);
            
            mostrarToast('✅ Obra de arte criada!');
        };
        
        img.onerror = function() {
            console.error('Erro ao carregar imagem');
            criarImagemGradienteAvancado(tema);
            mostrarToast('⚠️ Usando arte generativa');
        };
        
        img.src = imageUrl;
        
    } catch (error) {
        console.error('Erro:', error);
        criarImagemGradienteAvancado(tema);
        mostrarToast('⚠️ Usando modo artístico');
    } finally {
        const botaoGerar = document.getElementById('gerarVersiculo');
        botaoGerar.disabled = false;
        botaoGerar.textContent = '🎨 Gerar Nova Arte';
    }
}

function criarImagemComFiltros(img, tema) {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aplicar filtros CSS
    const filtro = filtrosArtisticos[tema];
    ctx.filter = `sepia(${filtro.sepia}) saturate(${filtro.saturate}) brightness(${filtro.brightness}) hue-rotate(${filtro.hue}deg) contrast(1.1)`;
    
    // Desenhar imagem com filtro
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Reset filtro
    ctx.filter = 'none';
    
    // Adicionar overlay artístico
    adicionarOverlayArtistico(ctx, tema);
    
    // Adicionar padrões decorativos sutis
    adicionarPadroesDecorativosSubtis(ctx, tema);
    
    // Adicionar texto
    adicionarOverlayTexto(ctx);
    adicionarTextoSobreImagem(ctx);
}

function adicionarOverlayArtistico(ctx, tema) {
    const canvas = ctx.canvas;
    
    // Overlay sutil para dar profundidade
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    
    const coresOverlay = {
        esperanca: 'rgba(255, 215, 0, 0.1)',
        amor: 'rgba(255, 105, 180, 0.1)',
        paz: 'rgba(135, 206, 235, 0.1)',
        fe: 'rgba(147, 112, 219, 0.1)',
        sabedoria: 'rgba(218, 165, 32, 0.1)',
        forca: 'rgba(220, 20, 60, 0.1)',
        protecao: 'rgba(50, 205, 50, 0.1)'
    };
    
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, coresOverlay[tema] || 'rgba(0,0,0,0.05)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function adicionarPadroesDecorativosSubtis(ctx, tema) {
    ctx.save();
    ctx.globalAlpha = 0.03; // Muito sutil
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    
    // Padrões geométricos baseados no tema
    switch(tema) {
        case 'esperanca':
            // Raios de luz sutis
            for (let i = 0; i < 12; i++) {
                const angulo = (i * 30) * Math.PI / 180;
                const centerX = ctx.canvas.width / 2;
                const centerY = ctx.canvas.height / 2;
                const raio = Math.min(ctx.canvas.width, ctx.canvas.height) / 2;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(angulo) * raio,
                    centerY + Math.sin(angulo) * raio
                );
                ctx.stroke();
            }
            break;
            
        case 'amor':
            // Círculos concêntricos
            for (let i = 1; i <= 5; i++) {
                ctx.beginPath();
                ctx.arc(
                    ctx.canvas.width / 2,
                    ctx.canvas.height / 2,
                    (i * 50),
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }
            break;
            
        case 'paz':
            // Ondas suaves
            for (let y = 50; y < ctx.canvas.height; y += 100) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                for (let x = 0; x < ctx.canvas.width; x += 50) {
                    ctx.quadraticCurveTo(x + 25, y - 20, x + 50, y);
                }
                ctx.stroke();
            }
            break;
    }
    
    ctx.restore();
}

function criarImagemGradienteAvancado(tema) {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gradientes mais sofisticados
    const gradientsAvancados = {
        esperanca: () => {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#FFD700');
            grad.addColorStop(0.3, '#FFA500');
            grad.addColorStop(0.6, '#FF8C00');
            grad.addColorStop(1, '#FF6347');
            return grad;
        },
        amor: () => {
            const grad = ctx.createRadialGradient(
                canvas.width/2, canvas.height/2, 0,
                canvas.width/2, canvas.height/2, canvas.width/2
            );
            grad.addColorStop(0, '#FFB6C1');
            grad.addColorStop(0.5, '#FF69B4');
            grad.addColorStop(1, '#C71585');
            return grad;
        },
        paz: () => {
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#E0F6FF');
            grad.addColorStop(0.5, '#87CEEB');
            grad.addColorStop(1, '#4682B4');
            return grad;
        },
        fe: () => {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#DDA0DD');
            grad.addColorStop(0.5, '#9370DB');
            grad.addColorStop(1, '#4B0082');
            return grad;
        }
    };
    
    const criarGradiente = gradientsAvancados[tema] || gradientsAvancados.esperanca;
    ctx.fillStyle = criarGradiente();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar textura artística
    adicionarTexturaArtistica(ctx, tema);
    
    // Adicionar padrões grandes
    adicionarPadraoDecorativo(ctx, tema);
    
    // Adicionar texto
    adicionarTextoSobreImagem(ctx);
}

function adicionarTexturaArtistica(ctx, tema) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'white';
    
    // Criar textura pontilhada
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const raio = Math.random() * 3 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function adicionarPadraoDecorativo(ctx, tema) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    
    const padroes = {
        esperanca: () => {
            ctx.fillStyle = 'gold';
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharEstrela(ctx, x, y, 20, 5, 0.5);
            }
        },
        amor: () => {
            ctx.fillStyle = 'pink';
            for (let i = 0; i < 12; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharCoracao(ctx, x, y, 25);
            }
        },
        paz: () => {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharPomba(ctx, x, y, 15);
            }
        },
        fe: () => {
            ctx.strokeStyle = 'gold';
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharCruz(ctx, x, y, 25);
            }
        }
    };
    
    const padrao = padroes[tema] || padroes.esperanca;
    padrao();
    
    ctx.restore();
}

// Funções de desenho dos padrões
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

function desenharPomba(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI);
    ctx.moveTo(x - size, y);
    ctx.lineTo(x - size/3, y - size/2);
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size/3, y - size/2);
    ctx.stroke();
}

function desenharCruz(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.moveTo(x - size/2, y - size/2);
    ctx.lineTo(x + size/2, y - size/2);
    ctx.stroke();
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
        gradient.addColorStop(0.7, `rgba(0,0,0,${opacidade * 0.3})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    } else if (posicao === 'inferior') {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.3, `rgba(0,0,0,${opacidade * 0.3})`);
        gradient.addColorStop(1, `rgba(0,0,0,${opacidade})`);
    } else {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.2, `rgba(0,0,0,${opacidade * 0.2})`);
        gradient.addColorStop(0.5, `rgba(0,0,0,${opacidade})`);
        gradient.addColorStop(0.8, `rgba(0,0,0,${opacidade * 0.2})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);
}

function adicionarTextoSobreImagem(ctx) {
    const canvas = ctx.canvas;
    const posicao = document.getElementById('posicaoTexto').value;
    
    // Configuração de texto aprimorada
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    let yBase;
    switch(posicao) {
        case 'superior':
            yBase = canvas.height * 0.22;
            break;
        case 'centro':
            yBase = canvas.height * 0.5;
            break;
        case 'inferior':
        default:
            yBase = canvas.height * 0.75;
            break;
    }
    
    // Texto principal
    ctx.font = 'bold 34px Inter, "Times New Roman", serif';
    const texto = versiculoAtual.texto;
    
    const linhas = quebrarTextoInteligente(ctx, texto, canvas.width - 120);
    
    const alturaLinha = 42;
    const alturaTotal = linhas.length * alturaLinha;
    const yInicial = yBase - (alturaTotal / 2);
    
    // Desenhar cada linha
    linhas.forEach((linha, index) => {
        ctx.fillText(linha, canvas.width / 2, yInicial + (index * alturaLinha));
    });
    
    // Referência
    ctx.font = 'italic bold 28px Inter, "Times New Roman", serif';
    ctx.shadowBlur = 6;
    const yReferencia = yInicial + alturaTotal + 45;
    ctx.fillText(`— ${versiculoAtual.referencia}`, canvas.width / 2, yReferencia);
    
    // Limpar sombras
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
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarToast('📋 Texto copiado!');
        });
    }
}

function compartilharFacebook() {
    if (!versiculoAtual) return;
    
    const texto = encodeURIComponent(`"${versiculoAtual.texto}" - ${versiculoAtual.referencia}`);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${texto}`;
    
    window.open(url, '_blank');
    mostrarToast('📘 Abrindo Facebook...');
}

function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
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
        elemento.textContent = `${contador} imagens criadas`;
    }
}
