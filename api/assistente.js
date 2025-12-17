import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Configurações de CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. LÊ O QUE O SITE MANDOU
    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Erro JSON:", e);
      }
    }

    // === A CORREÇÃO: Lê 'userMessage' (que seu site manda) ===
    const userMessage = body?.userMessage || body?.message || body?.prompt || body?.text;

    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem vazia." });
    }

    // 3. PERSONALIDADE
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Você é o assistente virtual do portfólio do Allan Marques. Responda de forma curta e profissional." }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Serei breve e profissional." }],
        },
      ],
    });

    // 4. GERA RESPOSTA
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // === A CORREÇÃO: Responde 'resposta' (que seu site espera) ===
    res.status(200).json({ resposta: text });

  } catch (error) {
    console.error("Erro API:", error);
    res.status(500).json({ error: "Erro interno." });
  }
}
