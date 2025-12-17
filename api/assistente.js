import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Configuração do CORS (Permite que seu site converse com o servidor)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Se o navegador estiver apenas checando permissões, responde OK e para.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. Conecta no Google usando sua Chave
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // === O NOME CORRETO É ESTE AQUI ===
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Recebe a mensagem do usuário
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Mensagem vazia" });
    }

    // 4. Inicia o Chat
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Você é o assistente virtual do portfólio do Allan Marques. Responda de forma curta, profissional e simpática." }],
        },
        {
          role: "model",
          parts: [{ text: "Olá! Sou o assistente do Allan. Como posso ajudar você a conhecer melhor o trabalho dele?" }],
        },
      ],
    });

    // 5. Envia e aguarda a resposta
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Erro detalhado:", error);
    res.status(500).json({ error: "Erro ao processar a IA." });
  }
}
