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

// Prompts MUITO ESPECÍFICOS para estilo barroco
const promptsBarrocos = {
    esperanca: "17th century baroque oil painting by Caravaggio style, dramatic chiaroscuro lighting, divine golden light from heaven, ornate church interior with marble columns, religious symbolism, dark shadows contrasted with brilliant light, renaissance masterpiece, oil on canvas texture, hope theme, heavenly rays, baroque religious art, classical composition, rich golden tones, dramatic lighting effects",
    
    amor: "baroque painting in style of Peter Paul Rubens, cherubic angels with flowing robes, dramatic chiaroscuro, ornate golden frames, classical religious composition, divine love theme, rich warm colors, oil painting texture, 17th century masterpiece style, dramatic shadows and highlights, heavenly atmosphere, baroque religious symbolism",
    
    paz: "baroque landscape painting by Claude Lorrain style, serene pastoral scene, soft divine golden hour light, classical architecture in background, peaceful countryside, dramatic cloudy sky, 17th century oil painting technique, warm earth tones, classical composition, baroque style masterpiece, tranquil religious atmosphere",
    
    fe: "baroque religious painting by Gian Lorenzo Bernini inspiration, dramatic lighting from above, ornate cathedral interior with golden details, spiritual symbolism, classical religious art, 17th century style, rich textures, dramatic chiaroscuro, faith and devotion theme, marble columns, ornate baroque architecture",
    
    sabedoria: "baroque portrait painting by Johannes Vermeer style, scholar in classical study room, warm candlelight, ornate books and scrolls, 17th century interior, oil painting technique, rich golden tones, classical composition, wisdom and knowledge theme, dramatic lighting, baroque style masterpiece",
    
    forca: "baroque heroic painting by Nicolas Poussin style, biblical strength theme, dramatic composition, classical figures, divine light through storm clouds, 17th century oil painting, rich textures, ornate elements, renaissance masterpiece technique, dramatic chiaroscuro lighting, powerful biblical imagery",
    
    protecao: "baroque religious painting by Francesco Borromini inspiration, guardian angel with magnificent wings, protective divine light, ornate heavenly setting, 17th century religious art, classical baroque composition, warm celestial lighting, oil painting masterpiece, dramatic shadows and gold highlights"
};

// Filtros CSS para simular estilo barroco na imagem final
const filtrosBarrocos = {
    esperanca: "sepia(20%) saturate(140%) contrast(110%) brightness(105%) hue-rotate(15deg)",
    amor: "sepia(15%) saturate(160%) contrast(115%) brightness(100%) hue-rotate(-10deg)",
    paz: "sepia(25%) saturate(120%) contrast(105%) brightness(110%) hue-rotate(5deg)",
    fe: "sepia(30%) saturate(130%) contrast(120%) brightness(95%) hue-rotate(25deg)",
    sabedoria: "sepia(40%) saturate(110%) contrast(115%) brightness(90%) hue-rotate(20deg)",
    forca: "sepia(10%) saturate(150%) contrast(125%) brightness(95%) hue-rotate(-5deg)",
    protecao: "sepia(20%) saturate(135%) contrast(110%) brightness(105%) hue-rotate(10deg)"
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    carregarVersiculos();
    configurarEventListeners();
    atualizarContadores();
    mostrarToast('✅ App carregado! Estilo barroco otimizado.');
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
    botaoGerar.textContent = '🎨 Criando arte barroca...';
    
    try {
        mostrarProgresso('🎨 Preparando prompt barroco...', 10);
        
        const qualidade = document.getElementById('qualidadeImagem').value;
        const modelUrl = modelosGratuitos[qualidade];
        const prompt = criarPromptBarrocoCompleto(tema);
        
        console.log('Prompt Barroco:', prompt); // Para debug
        
        mostrarProgresso('🤖 Gerando com estilo dos mestres...', 20);
        
        // Primeira tentativa com modelo principal
        let imageBlob = await tentarGerarImagem(modelUrl, prompt, qualidade, tema);
        
        if (!imageBlob) {
            mostrarProgresso('🔄 Tentando modelo clássico...', 40);
            // Segunda tentativa com modelo mais simples
            imageBlob = await tentarGerarImagem(modelosGratuitos.rapida, prompt, 'rapida', tema);
        }
        
        if (!imageBlob) {
            mostrarProgresso('🎨 Criando arte barroca local...', 60);
            gerarImagemBarrocaLocal(tema);
            mostrarToast('🎨 Arte barroca criada localmente');
            return;
        }
        
        mostrarProgresso('✨ Aplicando estilo barroco...', 80);
        
        imagemAtualBlob = imageBlob;
        await criarImagemBarrocaFinal(imageBlob, tema);
        
        mostrarProgresso('🙏 Obra-prima barroca concluída!', 100);
        
        setTimeout(() => {
            ocultarProgresso();
        }, 2000);
        
        mostrarToast('✅ Obra barroca criada com sucesso!');
        
    } catch (error) {
        console.error('Erro na geração:', error);
        mostrarToast('🎨 Criando arte barroca alternativa', 'warning');
        gerarImagemBarrocaLocal(tema);
    } finally {
        botaoGerar.disabled = false;
        botaoGerar.textContent = '🎨 Gerar Nova Obra Barroca';
        ocultarProgresso();
    }
}

async function tentarGerarImagem(modelUrl, prompt, qualidade, tema) {
    try {
        mostrarProgresso(`🎨 Criando arte ${qualidade} estilo barroco...`, 30);
        
        const response = await fetch(modelUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_inference_steps: qualidade === 'alta' ? 35 : qualidade === 'media' ? 25 : 20,
                    guidance_scale: 9.0, // Aumentado para melhor aderência ao prompt
                    width: qualidade === 'alta' ? 768 : 512,
                    height: qualidade === 'alta' ? 512 : 384,
                    negative_prompt: "modern, contemporary, minimalist, abstract, cartoon, anime, 3d render, photography, realistic photo, digital art, text, words, letters, watermark, signature, blurry, low quality, distorted, bad anatomy"
                }
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            
            if (blob.size > 1000 && blob.type.includes('image')) {
                mostrarProgresso('✅ Imagem barroca gerada!', 70);
                return blob;
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('Erro na tentativa:', error);
        return null;
    }
}

function criarPromptBarrocoCompleto(tema) {
    const promptBase = promptsBarrocos[tema];
    const palavrasChave = extrairPalavrasChave(versiculoAtual.texto);
    
    // Prompt ainda mais específico para barroco
    return `${promptBase}, biblical inspiration: ${palavrasChave}, 17th century oil painting masterpiece, baroque art style, classical religious painting, museum quality artwork, no text overlay, professional fine art, dramatic religious composition`;
}

function extrairPalavrasChave(texto) {
    const ignorar = [
        'para', 'porque', 'senhor', 'deus', 'seja', 'está', 'como', 'todo', 'mais', 'pelo', 'pela',
        'uma', 'dos', 'das', 'com', 'não', 'que', 'ele', 'ela', 'seu', 'sua', 'nos', 'nas', 'por',
        'este', 'esta', 'isso', 'aquele', 'aquela', 'muito', 'bem', 'assim', 'então'
    ];
    
    const palavrasImportantes = texto.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .split(/[,.;:!?\s]+/)
        .filter(palavra => palavra.length > 3)
        .filter(palavra => !ignorar.includes(palavra))
        .slice(0, 4);
    
    return palavrasImportantes.join(', ');
}

async function criarImagemBarrocaFinal(imageBlob, tema) {
    return new Promise((resolve) => {
        const canvas = document.getElementById('canvasImagem');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const img = new Image();
        img.onload = function() {
            // Aplicar filtro barroco ANTES de desenhar no canvas
            ctx.filter = filtrosBarrocos[tema];
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none'; // Resetar filtro
            
            // Adicionar efeitos barrocos extras
            adicionarEfeitosBarrocos(ctx, tema);
            
            // Adicionar overlay e texto
            adicionarOverlayTexto(ctx);
            adicionarTextoSobreImagem(ctx);
            
            resolve();
        };
        
        img.src = URL.createObjectURL(imageBlob);
    });
}

function adicionarEfeitosBarrocos(ctx, tema) {
    const canvas = ctx.canvas;
    
    // Adicionar vinheta barroca (escurecimento nas bordas)
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.8
    );
    
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(101,67,33,0.3)'); // Tom sépia escuro
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar textura de pintura a óleo
    adicionarTexturaOleo(ctx);
    
    // Adicionar brilhos dourados característicos do barroco
    adicionarBrilhosDourados(ctx, tema);
}

function adicionarTexturaOleo(ctx) {
    const canvas = ctx.canvas;
    ctx.save();
    
    // Criar padrão de pinceladas
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#8B4513'; // Marrom sépia
    
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const length = Math.random() * 20 + 5;
        const angle = Math.random() * Math.PI * 2;
        
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }
    
    ctx.restore();
}

function adicionarBrilhosDourados(ctx, tema) {
    const canvas = ctx.canvas;
    ctx.save();
    
    // Brilhos dourados típicos do barroco
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#FFD700';
    
    const numBrilhos = tema === 'esperanca' ? 15 : tema === 'amor' ? 12 : 8;
    
    for (let i = 0; i < numBrilhos; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const tamanho = Math.random() * 8 + 3;
        
        // Criar brilho em forma de estrela
        ctx.beginPath();
        for (let j = 0; j < 8; j++) {
            const angle = (j * Math.PI * 2) / 8;
            const radius = j % 2 === 0 ? tamanho : tamanho * 0.5;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.fill();
    }
    
    ctx.restore();
}

// ========== GERAÇÃO BARROCA LOCAL (FALLBACK) ==========
function gerarImagemBarrocaLocal(tema) {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Criar fundo no estilo barroco
    criarFundoBarroco(ctx, tema);
    
    // Adicionar elementos barrocos
    adicionarElementosBarrocos(ctx, tema);
    
    // Adicionar efeitos de pintura a óleo
    adicionarEfeitosBarrocos(ctx, tema);
    
    // Adicionar texto
    adicionarTextoSobreImagem(ctx);
}

function criarFundoBarroco(ctx, tema) {
    const canvas = ctx.canvas;
    
    const fundosBarrocos = {
        esperanca: () => {
            // Fundo dourado com chiaroscuro
            const grad = ctx.createRadialGradient(
                canvas.width * 0.3, canvas.height * 0.2, 0,
                canvas.width * 0.7, canvas.height * 0.8, canvas.width
            );
            grad.addColorStop(0, '#FFF8DC'); // Creme claro
            grad.addColorStop(0.3, '#F0E68C'); // Khaki claro
            grad.addColorStop(0.6, '#DAA520'); // Goldenrod
            grad.addColorStop(0.8, '#8B6914'); // Dark goldenrod
            grad.addColorStop(1, '#654321'); // Dark brown
            return grad;
        },
        
        amor: () => {
            // Tons rosados e dourados barrocos
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#FFF0F5'); // Lavender blush
            grad.addColorStop(0.3, '#FFE4E1'); // Misty rose
            grad.addColorStop(0.6, '#CD853F'); // Peru
            grad.addColorStop(0.9, '#8B4513'); // Saddle brown
            grad.addColorStop(1, '#2F1B14'); // Dark brown
            return grad;
        },
        
        paz: () => {
            // Azuis clássicos barrocos
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#F0F8FF'); // Alice blue
            grad.addColorStop(0.4, '#B0C4DE'); // Light steel blue
            grad.addColorStop(0.7, '#4682B4'); // Steel blue
            grad.addColorStop(0.9, '#2F4F4F'); // Dark slate gray
            grad.addColorStop(1, '#191970'); // Midnight blue
            return grad;
        },
        
        fe: () => {
            // Púrpuras e dourados reais
            const grad = ctx.createRadialGradient(
                canvas.width * 0.5, canvas.height * 0.3, 0,
                canvas.width * 0.5, canvas.height * 0.7, canvas.width * 0.6
            );
            grad.addColorStop(0, '#E6E6FA'); // Lavender
            grad.addColorStop(0.4, '#DDA0DD'); // Plum
            grad.addColorStop(0.7, '#8B008B'); // Dark magenta
            grad.addColorStop(0.9, '#4B0082'); // Indigo
            grad.addColorStop(1, '#2E0854'); // Dark purple
            return grad;
        },
        
        sabedoria: () => {
            // Tons terrosos e dourados
            const grad = ctx.createLinearGradient(canvas.width, 0, 0, canvas.height);
            grad.addColorStop(0, '#FDF5E6'); // Old lace
            grad.addColorStop(0.3, '#DEB887'); // Burlywood
            grad.addColorStop(0.6, '#CD853F'); // Peru
            grad.addColorStop(0.8, '#8B4513'); // Saddle brown
            grad.addColorStop(1, '#3D2914'); // Dark brown
            return grad;
        },
        
        forca: () => {
            // Vermelhos dramáticos barrocos
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#FFE4E1'); // Misty rose
            grad.addColorStop(0.3, '#CD5C5C'); // Indian red
            grad.addColorStop(0.6, '#B22222'); // Fire brick
            grad.addColorStop(0.8, '#800000'); // Maroon
            grad.addColorStop(1, '#2F0000'); // Dark red
            return grad;
        },
        
        protecao: () => {
            // Verdes nobres barrocos
            const grad = ctx.createRadialGradient(
                canvas.width / 2, canvas.height * 0.3, 0,
                canvas.width / 2, canvas.height * 0.7, canvas.width * 0.5
            );
            grad.addColorStop(0, '#F0FFF0'); // Honeydew
            grad.addColorStop(0.4, '#90EE90'); // Light green
            grad.addColorStop(0.7, '#228B22'); // Forest green
            grad.addColorStop(0.9, '#006400'); // Dark green
            grad.addColorStop(1, '#013220'); // Very dark green
            return grad;
        }
    };
    
    const criarFundo = fundosBarrocos[tema] || fundosBarrocos.esperanca;
    ctx.fillStyle = criarFundo();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function adicionarElementosBarrocos(ctx, tema) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    
    const elementosBarrocos = {
        esperanca: () => {
            // Raios divinos barrocos
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#FFA500';
            ctx.shadowBlur = 10;
            
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height * 0.3;
            
            for (let i = 0; i < 16; i++) {
                const angulo = (i * 22.5) * Math.PI / 180;
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
            // Ornamentos de amor barrocos
            ctx.fillStyle = '#CD853F';
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 12; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                desenharOrnamentoBarroco(ctx, x, y, 25);
            }
        },
        
        paz: () => {
            // Ondas barrocas
            ctx.strokeStyle = '#4682B4';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#87CEEB';
            ctx.shadowBlur = 8;
            
            for (let y = 100; y < ctx.canvas.height; y += 80) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                for (let x = 0; x < ctx.canvas.width; x += 40) {
                    ctx.quadraticCurveTo(x + 20, y - 15, x + 40, y);
                }
                ctx.stroke();
            }
        }
    };
    
    const elemento = elementosBarrocos[tema] || elementosBarrocos.esperanca;
    elemento();
    
    ctx.restore();
}

function desenharOrnamentoBarroco(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // Ornamento barroco complexo
    ctx.beginPath();
    
    // Forma central
    ctx.arc(0, 0, size/3, 0, Math.PI * 2);
    
    // Pétalas ornamentais
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const px = Math.cos(angle) * size/2;
        const py = Math.sin(angle) * size/2;
        
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(px * 0.7, py * 0.7, px, py);
    }
    
    ctx.fill();
    ctx.stroke();
    ctx.restore();
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
    
    // Overlay com tom sépia barroco
    const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
    
    if (posicao === 'superior') {
        gradient.addColorStop(0, `rgba(101,67,33,${opacidade * 0.8})`); // Tom sépia
        gradient.addColorStop(0.7, `rgba(101,67,33,${opacidade * 0.3})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
    } else if (posicao === 'inferior') {
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.3, `rgba(101,67,33,${opacidade * 0.3})`);
        gradient.addColorStop(1, `rgba(101,67,33,${opacidade * 0.8})`);
    } else {
        gradient.addColorStop(0, `rgba(101,67,33,${opacidade * 0.3})`);
        gradient.addColorStop(0.3, `rgba(101,67,33,${opacidade * 0.8})`);
        gradient.addColorStop(0.7, `rgba(101,67,33,${opacidade * 0.8})`);
        gradient.addColorStop(1, `rgba(101,67,33,${opacidade * 0.3})`);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);
}

function adicionarTextoSobreImagem(ctx) {
    const canvas = ctx.canvas;
    const posicao = document.getElementById('posicaoTexto').value;
    
    // Texto com estilo barroco (dourado)
    ctx.fillStyle = '#FFD700'; // Dourado barroco
    ctx.strokeStyle = '#8B4513'; // Contorno marrom
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
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
    
    // Fonte mais ornamental para o estilo barroco
    ctx.font = 'bold 34px "Times New Roman", Georgia, serif';
    const texto = versiculoAtual.texto;
    
    const linhas = quebrarTextoInteligente(ctx, texto, canvas.width - 120);
    
    const alturaLinha = 40;
    const alturaTotal = linhas.length * alturaLinha;
    const yInicial = yBase - (alturaTotal / 2);
    
    // Desenhar texto com contorno dourado
    linhas.forEach((linha, index) => {
        const y = yInicial + (index * alturaLinha);
        ctx.strokeText(linha, canvas.width / 2, y);
        ctx.fillText(linha, canvas.width / 2, y);
    });
    
    // Referência com estilo mais ornamental
    ctx.font = 'italic bold 28px "Times New Roman", Georgia, serif';
    ctx.shadowBlur = 8;
    const yReferencia = yInicial + alturaTotal + 45;
    ctx.strokeText(`— ${versiculoAtual.referencia}`, canvas.width / 2, yReferencia);
    ctx.fill
\<Streaming stoppped because the conversation grew too long for this model\>
