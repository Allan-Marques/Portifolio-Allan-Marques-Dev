import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Configurações de permissão (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responde OK para verificações do navegador
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // === PARTE NOVA: TRATAMENTO INTELIGENTE DA MENSAGEM ===
    let body = req.body;

    // Se o corpo vier como texto (string), tenta transformar em JSON
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Erro ao converter body:", e);
      }
    }

    // Procura a mensagem em qualquer campo possível
    const userMessage = body?.message || body?.prompt || body?.text;

    // Se mesmo assim estiver vazio, avisa o erro 400
    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem vazia. Digite algo no chat!" });
    }

    // Inicia o Chat
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Você é o assistente virtual do portfólio do Allan Marques. Responda de forma curta, profissional e simpática." }],
        },
        {
          role: "model",
          parts: [{ text: "Olá! Sou o assistente do Allan. Como posso ajudar?" }],
        },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Erro geral na API:", error);
    res.status(500).json({ error: "Erro interno ao processar IA." });
  }
}
