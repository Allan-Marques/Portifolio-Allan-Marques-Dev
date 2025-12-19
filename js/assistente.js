/* ==========================================================================
   ARQUIVO: js/assistente.js
   DESCRIÇÃO: Interface do Terminal Forense (Versão com Links Clicáveis)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    
    const API_URL = '/api/assistente'; 
    const systemPrefix = '<span class="prompt-user">root@allan:~#</span>';

    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-enviar');
    const chatBody = document.getElementById('chat-corpo');
    const chatWindow = document.getElementById('chat-window');
    const chatLauncher = document.getElementById('chat-launcher');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const bgAudio = document.getElementById('bg-audio');

    let isWaiting = false;

    function toggleChat() {
        chatWindow.classList.toggle('active');
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
            // 1. Formata Negrito
            let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // 2. DETECTA LINKS (HTTP/HTTPS) E CRIA TAGS <A>
            formattedText = formattedText.replace(
                /(https?:\/\/[^\s]+)/g, 
                '<a href="$1" target="_blank" style="color: #00ff00; text-decoration: underline; word-break: break-all;">$1</a>'
            );

            // 3. Quebra de linha
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
        div.innerHTML = `${systemPrefix} <span class="blink">_</span>`;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    }

    async function processCommand(userText) {
        if (isWaiting) return;
        isWaiting = true;
        const loadingDiv = addLoading();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Erro na API');
            }

            const data = await response.json();
            loadingDiv.remove();
            addMessage(data.result, 'assistente');

        } catch (error) {
            console.error("Falha na Operação:", error);
            loadingDiv.remove();
            addMessage(`ERRO CRÍTICO: Falha na conexão com o servidor. (${error.message})`, 'assistente');
        } finally {
            isWaiting = false;
        }
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text && !isWaiting) {
            addMessage(text, 'usuario');
            chatInput.value = '';
            processCommand(text);
        }
        if(window.innerWidth > 768) chatInput.focus();
    }

    if (chatLauncher) {
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