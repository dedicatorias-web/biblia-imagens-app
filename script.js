// ============================================================================
// INÍCIO PARTE 12: SISTEMA DE COMPARTILHAMENTO E DOWNLOAD (SIMPLIFICADO)
// ============================================================================

// Função principal de compartilhamento universal
async function compartilharVersiculoUniversal() {
    if (!versiculoAtual) {
        mostrarToast('❌ Nenhum versículo para compartilhar', 'error');
        return;
    }
    try {
        const dados = await prepararDadosCompartilhamento();
        const texto = dados.texto;
        const url = dados.url;
        const imageBlob = dados.imageBlob;
        let compartilhou = false;

        // Suporte Web Share API com imagem
        if (
            navigator.canShare &&
            imageBlob &&
            navigator.canShare({ files: [new File([imageBlob], 'versiculo.png', { type: 'image/png' })] })
        ) {
            await navigator.share({
                title: dados.titulo,
                text: texto,
                url: url,
                files: [new File([imageBlob], 'versiculo.png', { type: 'image/png' })]
            });
            mostrarToast('✅ Compartilhado com imagem!', 'success');
            compartilhou = true;
        } else if (navigator.share) {
            await navigator.share({
                title: dados.titulo,
                text: texto,
                url: url
            });
            mostrarToast('✅ Compartilhado!', 'success');
            compartilhou = true;
        }

        // Fallback: WhatsApp (apenas texto/link)
        if (!compartilhou) {
            const mensagem = encodeURIComponent(`${texto}\n${url}`);
            window.open(`https://wa.me/?text=${mensagem}`, '_blank');
            mostrarToast('ℹ️ Compartilhamento do WhatsApp: a imagem não será enviada, apenas texto e link.', 'info');
        }
    } catch (error) {
        console.error('❌ Erro no compartilhamento:', error);
        mostrarToast(`❌ Erro ao compartilhar: ${error.message}`, 'error');
    }
}

// Preparar dados do versículo para compartilhamento (mantido)
async function prepararDadosCompartilhamento() {
    const { versiculo, referencia } = versiculoAtual;
    const texto = `"${versiculo}"\n\n📖 ${referencia}\n\n✨ Versículo gerado em: ${window.location.hostname || 'Versículos Inspiradores'}`;
    const url = window.location.href;
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
        }
    } catch (error) {
        imageBlob = null;
    }
    return {
        titulo: `Versículo: ${referencia}`,
        texto: texto,
        url: url,
        imageBlob: imageBlob
    };
}

// Configurar evento no botão universal
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('compartilhar');
    if (btn) {
        btn.onclick = compartilharVersiculoUniversal;
    }
});

// ============================================================================
// FIM PARTE 12: SISTEMA DE COMPARTILHAMENTO E DOWNLOAD (SIMPLIFICADO)
// ============================================================================
