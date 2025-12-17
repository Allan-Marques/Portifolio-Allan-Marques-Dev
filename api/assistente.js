import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Configurações de permissão (CORS) para o site funcionar
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Se for apenas uma verificação do navegador, responde OK e para
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Conecta com a chave do Google
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // === AQUI ESTÁ A CORREÇÃO FINAL DO NOME ===
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Pega a mensagem do usuário
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Mensagem vazia" });
    }

    // Inicia o chat com personalidade definida
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Você é o assistente virtual do portfólio do Allan Marques. Responda de forma curta, profissional e simpática." }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido! Sou o assistente do Allan. Como posso ajudar você hoje?" }],
        },
      ],
    });

    // Envia a pergunta e espera a resposta
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Devolve a resposta para o site
    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Erro na API:", error);
    res.status(500).json({ error: "Erro interno no servidor de IA." });
  }
}
