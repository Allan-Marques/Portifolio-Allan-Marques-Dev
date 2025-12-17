import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
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
    
    // === USANDO O FLASH COM A BIBLIOTECA ATUALIZADA (0.21.0) ===
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const userMessage = body?.userMessage || body?.message || body?.prompt;

    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem vazia." });
    }

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Você é o assistente virtual do portfólio do Allan Marques. Responda de forma curta e profissional." }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Sou o assistente do Allan." }],
        },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ resposta: text });

  } catch (error) {
    console.error("Erro API:", error);
    res.status(500).json({ error: "Erro interno na IA." });
  }
}
