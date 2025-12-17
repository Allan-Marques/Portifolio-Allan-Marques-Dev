import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Configurações de CORS (Permite o site acessar o servidor)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responde OK para o navegador checar permissões
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. LÊ O QUE O SITE MANDOU
    let body = req.body;

    // Se vier como texto, transforma em objeto JSON
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("Erro ao converter JSON:", e);
      }
    }

    // === AQUI ESTAVA O ERRO 400 ===
    // Seu site envia 'userMessage', então vamos ler 'userMessage'.
    const userMessage = body?.userMessage || body?.message || body?.prompt;

    if (!userMessage) {
      return res.status(400).json({ 
        error: "Mensagem vazia.",
        detalhe: "O servidor esperava 'userMessage' e não encontrou."
      });
    }

    // 3. CONFIGURA A PERSONALIDADE
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Você é o assistente virtual do portfólio do Allan Marques. Responda de forma curta, profissional e simpática. Se perguntarem projetos, fale do Codificador Mnemônico. Se contato, fale do email." }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido! Sou o assistente do Allan. Como posso ajudar?" }],
        },
      ],
    });

    // 4. GERA A RESPOSTA
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // === AQUI ESTAVA O ERRO DE RESPOSTA VAZIA ===
    // Seu site espera 'resposta', então mandamos 'resposta' (não 'reply')
    res.status(200).json({ resposta: text });

  } catch (error) {
    console.error("Erro no Backend:", error);
    res.status(500).json({ error: "Erro interno ao processar IA." });
  }
}
