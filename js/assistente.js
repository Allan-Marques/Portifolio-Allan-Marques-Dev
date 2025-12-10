// js/assistente.js

document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS DO DOM ---
    const chatContainer = document.getElementById('chat-container');
    const chatHeader = document.getElementById('chat-header');
    const chatCorpo = document.getElementById('chat-corpo');
    const chatInput = document.getElementById('chat-input');
    const chatEnviar = document.getElementById('chat-enviar');

    // --- ESTADO DO CHAT ---
    let isChatOpen = false;
    let isWaitingForResponse = false;
    const proactiveTriggers = new Set();

    // --- FUNÇÕES DA INTERFACE (UI) ---
    const toggleChat = () => {
        isChatOpen = !isChatOpen;
        chatContainer.classList.toggle('aberto', isChatOpen);
        if (isChatOpen) {
            chatInput.focus();
        }
    };

    const adicionarMensagem = (texto, tipo) => {
        const divMensagem = document.createElement('div');
        divMensagem.classList.add('mensagem', tipo);
        divMensagem.innerHTML = texto;
        chatCorpo.appendChild(divMensagem);
        chatCorpo.scrollTop = chatCorpo.scrollHeight;
    };

    const toggleTypingIndicator = (show) => {
        let indicator = chatCorpo.querySelector('.typing-indicator');
        if (show) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.classList.add('mensagem', 'assistente', 'typing-indicator');
                indicator.innerHTML = `<span></span><span></span><span></span>`;
                chatCorpo.appendChild(indicator);
                chatCorpo.scrollTop = chatCorpo.scrollHeight;
            }
        } else {
            if (indicator) {
                indicator.remove();
            }
        }
    };
    
    const setInputEnabled = (enabled) => {
        chatInput.disabled = !enabled;
        chatEnviar.disabled = !enabled;
        if(enabled) {
            chatInput.placeholder = "Pergunte sobre mim...";
        } else {
            chatInput.placeholder = "Aguarde a resposta...";
        }
    };

    // --- LÓGICA DE COMUNICAÇÃO COM A IA ---
    const enviarParaIA = async (userMessage, context) => {
        if (isWaitingForResponse) return;

        isWaitingForResponse = true;
        setInputEnabled(false);
        toggleTypingIndicator(true);

        try {
            // A rota da API continua a mesma, pois será usada na Vercel
            const response = await fetch('/api/assistente', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Corpo da requisição simplificado, sem o idioma
                body: JSON.stringify({ userMessage, context })
            });

            if (!response.ok) {
                // O erro 405 (Method Not Allowed) vai acontecer aqui localmente, e isso é normal.
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            adicionarMensagem(data.resposta, 'assistente');

        } catch (error) {
            console.error("Falha ao comunicar com o assistente:", error);
            adicionarMensagem("Olá! No momento, só consigo conversar quando o site está online. Publique o projeto para interagir comigo!", 'assistente');
        } finally {
            isWaitingForResponse = false;
            toggleTypingIndicator(false);
            setInputEnabled(true);
            chatInput.focus();
        }
    };

    const enviarMensagemDoUsuario = () => {
        const pergunta = chatInput.value.trim();
        if (pergunta === '' || isWaitingForResponse) return;

        adicionarMensagem(pergunta, 'usuario');
        chatInput.value = '';
        enviarParaIA(pergunta, null);
    };

    // --- GATILHOS PROATIVOS ---
    const iniciarConversaProativa = (context) => {
        if (proactiveTriggers.has(context)) return;
        proactiveTriggers.add(context);
        
        if (!isChatOpen) {
            toggleChat();
        }
        
        setTimeout(() => {
            enviarParaIA(null, context);
        }, 800);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                iniciarConversaProativa(`contexto_${sectionId}`);
            }
        });
    }, { threshold: 0.6 });

    ['projetos', 'habilidades', 'formacao'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            observer.observe(element);
        }
    });

    // --- EVENT LISTENERS ---
    chatHeader.addEventListener('click', toggleChat);
    chatEnviar.addEventListener('click', enviarMensagemDoUsuario);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            enviarMensagemDoUsuario();
        }
    });

    // --- INICIALIZAÇÃO ---
    // Removemos a saudação inicial proativa para não gerar um erro logo de cara.
    // O chat será iniciado pela interação do usuário.
    // Você pode reativar a linha abaixo se quiser.
    // setTimeout(() => { iniciarConversaProativa('inicio'); }, 3000);

    // Habilita o input para o usuário poder digitar.
    setInputEnabled(true);
});


























































































































































































































