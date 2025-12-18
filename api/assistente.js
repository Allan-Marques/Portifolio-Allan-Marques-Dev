// Arquivo: api/assistente.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// NADA de 'runtime: edge' aqui. Vamos usar o padrão Node.js seguro.

export default async function handler(req, res) {
  // 1. Configuração Manual de CORS (Essencial para seu HTML falar com a API)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Responde ao "sinal de fumaça" do navegador (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Garante que só aceitamos ordens via POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Chave de API não configurada no servidor.");
    }

    // 4. Tratamento de Entrada (Body Parsing Seguro)
    let message;
    if (req.body && typeof req.body === 'object') {
        // Vercel às vezes já entrega o objeto pronto
        message = req.body.message;
    } else if (req.body && typeof req.body === 'string') {
        // Se vier como texto, convertemos
        const parsed = JSON.parse(req.body);
        message = parsed.message;
    }

    if (!message) {
      // Se falhar o parse ou vier vazio
      return res.status(400).json({ error: "Corpo da requisição inválido ou mensagem vazia." });
    }

    // 5. Acionamento da IA (Gemini 2.0 Flash)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // 6. Resposta Final
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ 
      error: "Falha interna no servidor.", 
      details: error.message 
    });
  }
}