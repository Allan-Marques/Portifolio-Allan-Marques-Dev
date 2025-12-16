/* ==========================================================================
   ARQUIVO: js/assistente.js
   DESCRIÇÃO: Chatbot Híbrido (IA Real + Fallback Simulado)
   AUTOR: Allan Marques Bastos
   ATUALIZAÇÃO: Conexão com API Gemini
   ==========================================================================
*/

document.addEventListener('DOMContentLoaded', function () {
    
    // --- 1. CONFIGURAÇÕES ---
    // Coloque aqui a URL da sua API na Vercel se estiver hospedando separado
    // Ex: 'https://seu-portfolio.vercel.app/api/assistente'
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

    // Estado do chat
    let isWaiting = false;

    // --- 3. FUNÇÕES VISUAIS (CHAT & AUDIO) ---
    
    function toggleChat() {
        chatWindow.classList.toggle('active');
        
        // Toca áudio se estiver pausado
        if (bgAudio && bgAudio.paused) {
            bgAudio.volume = 0.5;
            bgAudio.play().catch(e => console.log("Áudio:", e));
        }

        // Foca no input (Desktop apenas)
        if (window.innerWidth > 768 && chatWindow.classList.contains('active')) {
            setTimeout(() => chatInput.focus(), 300);
        }
    }

    // Adiciona Mensagem na Tela
    function addMessage(text, type) {
        const div = document.createElement('div');
        div.classList.add('mensagem', type);
        
        if (type === 'assistente') {
            div.innerHTML = `${systemPrefix} ${text}`;
        } else {
            div.textContent = text;
        }

        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div; // Retorna para poder remover depois (ex: loading)
    }

    // Adiciona Indicador de "Digitando..."
    function addLoading() {
        const div = document.createElement('div');
        div.classList.add('mensagem', 'assistente', 'loading-msg');
        div.innerHTML = `${systemPrefix} <span class="blink">Processando dados...</span>`;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    }

    // --- 4. CÉREBRO (IA + FALLBACK) ---

    async function processCommand(userText) {
        if (isWaiting) return;
        isWaiting = true;

        // Mostra "Digitando..."
        const loadingDiv = addLoading();

        try {
            // TENTATIVA 1: CONECTAR COM A IA (BACKEND)
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userMessage: userText,
                    context: 'portfolio_geral' // Contexto para o prompt
                })
            });

            // Se der erro 404/500 (API não existe ou caiu), joga para o erro
            if (!response.ok) throw new Error('API Indisponível');

            const data = await response.json();
            
            // Remove o loading e mostra a resposta da IA
            loadingDiv.remove();
            addMessage(data.resposta, 'assistente');

        } catch (error) {
            // TENTATIVA 2: MODO OFFLINE (SIMULAÇÃO LOCAL)
            // Se a API falhar (GitHub Pages não tem backend), usa respostas prontas
            console.warn("IA Offline, usando modo simulado:", error);
            loadingDiv.remove();
            runSimulation(userText);
        } finally {
            isWaiting = false;
        }
    }

    // SIMULADOR (Modo GitHub Pages / Fallback)
    function runSimulation(rawText) {
        const text = rawText.toLowerCase().trim();
        let response = '';

        if (text.includes('ola') || text.includes('oi') || text.includes('ajuda')) {
            response = 'Conexão (Modo Offline). Sou o Assistente do Allan. A IA principal está indisponível, mas posso listar <strong>[projetos]</strong>, <strong>[contato]</strong> ou <strong>[skills]</strong>.';
        } else if (text.includes('projeto') || text.includes('jogos') || text.includes('ferramentas')) {
            response = 'Allan desenvolve ferramentas de segurança e jogos. Destaque: <strong>Codificador Mnemônico</strong> (Criptografia) e <strong>Xadrez de Terminal</strong>. Veja a seção acima.';
        } else if (text.includes('contato') || text.includes('email')) {
            response = 'Email: allan.solucoes.digitais@gmail.com | LinkedIn e GitHub nos links do rodapé.';
        } else if (text.includes('skill') || text.includes('habilidade')) {
            response = 'Perfil Técnico: Perícia Forense Digital, OSINT, Hardware Avançado e Dev (C, JS, Python).';
        } else {
            response = 'Comando desconhecido (IA Offline). Tente: projetos, contato ou skills.';
        }

        // Delay para naturalidade
        setTimeout(() => {
            addMessage(response, 'assistente');
        }, 600);
    }

    // --- 5. ENVIAR MENSAGEM ---
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text && !isWaiting) {
            addMessage(text, 'usuario');
            chatInput.value = '';
            processCommand(text);
        }
        if(window.innerWidth > 768) chatInput.focus();
    }

    // --- 6. EVENT LISTENERS ---
    if (chatLauncher) {
        // Clone para limpar eventos antigos
        const newLauncher = chatLauncher.cloneNode(true);
        chatLauncher.parentNode.replaceChild(newLauncher, chatLauncher);
        newLauncher.addEventListener('click', toggleChat);
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => chatWindow.classList.remove('active'));
    }

    if (chatSend) chatSend.addEventListener('click', sendMessage);
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});