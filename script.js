// Dados dos versículos e estado da aplicação
let versiculos = {};
let versiculoAtual = null;

// Carregar versículos do arquivo JSON
async function carregarVersiculos() {
    try {
        const response = await fetch('versiculos.json');
        versiculos = await response.json();
        gerarNovoVersiculo();
    } catch (error) {
        console.error('Erro ao carregar versículos:', error);
    }
}

// Gerar um novo versículo aleatório
function gerarNovoVersiculo() {
    const tema = document.getElementById('temaEscolhido').value;
    const versiculosTema = versiculos[tema];
    
    if (versiculosTema && versiculosTema.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * versiculosTema.length);
        versiculoAtual = versiculosTema[indiceAleatorio];
        
        // Atualizar o texto na página
        document.getElementById('versiculoTexto').textContent = `"${versiculoAtual.texto}"`;
        document.getElementById('versiculoReferencia').textContent = versiculoAtual.referencia;
        
        // Gerar a imagem
        gerarImagem();
    }
}

// Gerar imagem no canvas
function gerarImagem() {
    const canvas = document.getElementById('canvasImagem');
    const ctx = canvas.getContext('2d');
    
    // Cores de fundo baseadas no tema
    const coresTema = {
        esperanca: ['#FF6B6B', '#4ECDC4'],
        amor: ['#FF8A80', '#FF5722'],
        paz: ['#81C784', '#4CAF50'],
        fe: ['#64B5F6', '#2196F3']
    };
    
    const tema = document.getElementById('temaEscolhido').value;
    const cores = coresTema[tema];
    
    // Criar gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, cores[0]);
    gradient.addColorStop(1, cores[1]);
    
    // Preencher fundo
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Configurar texto
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    
    // Texto do versículo
    ctx.font = 'bold 32px Arial';
    const texto = versiculoAtual.texto;
    
    // Quebrar texto em linhas
    const palavras = texto.split(' ');
    const linhas = [];
    let linhaAtual = '';
    
    for (let palavra of palavras) {
        const testeLinha = linhaAtual + palavra + ' ';
        const largura = ctx.measureText(testeLinha).width;
        
        if (largura > canvas.width - 100 && linhaAtual !== '') {
            linhas.push(linhaAtual);
            linhaAtual = palavra + ' ';
        } else {
            linhaAtual = testeLinha;
        }
    }
    linhas.push(linhaAtual);
    
    // Desenhar texto
    const alturaLinha = 40;
    const yInicial = (canvas.height - (linhas.length * alturaLinha)) / 2;
    
    linhas.forEach((linha, index) => {
        ctx.fillText(linha.trim(), canvas.width / 2, yInicial + (index * alturaLinha));
    });
    
    // Referência
    ctx.font = 'italic 24px Arial';
    ctx.fillText(`- ${versiculoAtual.referencia}`, canvas.width / 2, yInicial + (linhas.length * alturaLinha) + 50);
}

// Baixar imagem
function baixarImagem() {
    const canvas = document.getElementById('canvasImagem');
    const link = document.createElement('a');
    link.download = `versiculo-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Compartilhar no WhatsApp
function compartilharWhatsApp() {
    const texto = `${versiculoAtual.texto}\n\n${versiculoAtual.referencia}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    carregarVersiculos();
    
    document.getElementById('gerarVersiculo').addEventListener('click', gerarNovoVersiculo);
    document.getElementById('temaEscolhido').addEventListener('change', gerarNovoVersiculo);
    document.getElementById('baixarImagem').addEventListener('click', baixarImagem);
    document.getElementById('compartilharWhatsApp').addEventListener('click', compartilharWhatsApp);
});
