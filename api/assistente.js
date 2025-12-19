// Arquivo: api/assistente.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Configuração de CORS (Permissão de acesso)
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Chave de API não configurada.");

    // Tratamento de Body (Parsing Seguro)
    let message = null;
    if (req.body) {
        if (typeof req.body === 'object') {
            message = req.body.message;
        } else if (typeof req.body === 'string') {
            try {
                const parsed = JSON.parse(req.body);
                message = parsed.message;
            } catch (e) {
                console.error("Erro no JSON:", e);
            }
        }
    }

    if (!message) {
      return res.status(400).json({ error: "Mensagem vazia ou formato inválido." });
    }

    // --- ATIVAÇÃO DO GEMINI 2.5 FLASH ---
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Usando o modelo exato que apareceu no seu scanner
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Erro na API:", error);
    
    // Se der erro de cota (429) ou modelo não encontrado (404), avisamos o front
    if (error.message.includes("429") || error.message.includes("Quota")) {
        return res.status(429).json({ error: "Cota de uso excedida para este modelo experimental." });
    }
    
    return res.status(500).json({ 
        error: "Falha interna.", 
        details: error.message 
    });
  }
}