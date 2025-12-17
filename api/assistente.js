import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Configurações de CORS
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
    // === O ESPIÃO: Mostra no log o que está chegando ===
    console.log("--- DEBUG START ---");
    console.log("Tipo do Body:", typeof req.body);
    console.log("Conteúdo do Body:", JSON.stringify(req.body));
    // ==================================================

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let body = req.body;

    // Tenta consertar se vier como texto
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Erro ao fazer parse do JSON:", e);
      }
    }

    // Procura a mensagem
    const userMessage = body?.message || body?.prompt || body?.text;

    if (!userMessage) {
      // Devolve o erro mostrando o que recebeu (para ajudar a gente)
      return res.status(400).json({ 
        error: "Mensagem vazia", 
        recebido: body 
      });
    }

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
    console.error("Erro Fatal:", error);
    res.status(500).json({ error: "Erro interno." });
  }
}
