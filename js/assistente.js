/* ==========================================================================
   ARQUIVO: js/assistente.js
   DESCRIÇÃO: Interface do Terminal Forense (Conexão com Gemini 2.0)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    
    // --- 1. CONFIGURAÇÕES ---
    const API_URL = '/api/assistente'; 
    const systemPrefix = '<span class="prompt-user">root@allan:~#</span>';

    // --- 2. SELEÇÃO DE ELEMENTOS ---
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-enviar');
    const chatBody = document.getElementById('chat-corpo');
    const chatWindow = document.getElementById('chat-window');
    const chatLauncher = document.getElementById('chat-launcher');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const bgAudio = document.getElementById('bg-audio');

    let isWaiting = false;

    // --- 3. FUNÇÕES VISUAIS ---
    
    function toggleChat() {
        chatWindow.classList.toggle('active');
        
        // Toca áudio (Efeito Matrix)
        if (bgAudio && bgAudio.paused) {
            bgAudio.volume = 0.5;
            bgAudio.play().catch(e => console.log("Áudio bloqueado pelo navegador"));
        }

        if (window.innerWidth > 768 && chatWindow.classList.contains('active')) {
            setTimeout(() => chatInput.focus(), 300);
        }
    }

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.classList.add('mensagem', type);
        
        if (type === 'assistente') {
            // Se vier texto com quebras de linha da IA, converte para <br>
            // E aplica formatação Markdown básica se necessário (negrito)
            let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedText = formattedText.replace(/\n/g, '<br>');
            
            div.innerHTML = `${systemPrefix} ${formattedText}`;
        } else {
            div.textContent = text;
        }

        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    }

    function addLoading() {
        const div = document.createElement('div');
        div.classList.add('mensagem', 'assistente', 'loading-msg');
        div.innerHTML = `${systemPrefix} <span class="blink">Analisando dados...</span>`;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    }

    // --- 4. COMUNICAÇÃO COM O CÉREBRO (BACKEND) ---

    async function processCommand(userText) {
        if (isWaiting) return;
        isWaiting = true;
        const loadingDiv = addLoading();

        try {
            // --- CONEXÃO COM A API VERCEL ---
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    // CORREÇÃO CRÍTICA PARA ERRO 400:
                    'Content-Type': 'application/json' 
                },
                // CORREÇÃO DE PROTOCOLO: O backend espera 'message', não 'userMessage'
                body: JSON.stringify({ 
                    message: `[Contexto: Você é o Assistente Virtual do Perito Allan Marques. Responda de forma técnica e breve.] Usuário diz: ${userText}` 
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Erro na API');
            }

            const data = await response.json();
            
            // Sucesso: Remove loading e mostra resposta
            loadingDiv.remove();
            addMessage(data.result, 'assistente');

        } catch (error) {
            console.error("Falha na Operação:", error);
            loadingDiv.remove();
            
            // Mensagem de Erro amigável
            addMessage(`ERRO CRÍTICO: Falha na conexão com o servidor. (${error.message})`, 'assistente');
        } finally {
            isWaiting = false;
        }
    }

    // --- 5. CONTROLES ---
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text && !isWaiting) {
            addMessage(text, 'usuario');
            chatInput.value = '';
            processCommand(text);
        }
        if(window.innerWidth > 768) chatInput.focus();
    }

    // Eventos
    if (chatLauncher) {
        // Remove clones antigos para evitar duplo clique
        const newLauncher = chatLauncher.cloneNode(true);
        chatLauncher.parentNode.replaceChild(newLauncher, chatLauncher);
        newLauncher.addEventListener('click', toggleChat);
    }

    if (chatCloseBtn) chatCloseBtn.addEventListener('click', () => chatWindow.classList.remove('active'));
    if (chatSend) chatSend.addEventListener('click', sendMessage);
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});