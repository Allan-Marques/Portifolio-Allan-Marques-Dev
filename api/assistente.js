// Arquivo: api/assistente.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS Setup
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
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key ausente");

    // --- ANÁLISE FORENSE DO BODY (DEBUG) ---
    // Se o body for string (veio sem header JSON), tentamos parsear manualmente
    let message = null;

    if (req.body) {
        if (typeof req.body === 'object') {
            message = req.body.message;
        } else if (typeof req.body === 'string') {
            try {
                const parsed = JSON.parse(req.body);
                message = parsed.message;
            } catch (e) {
                console.error("Erro ao fazer parse do JSON:", e);
            }
        }
    }

    // Se após tentar ler, a mensagem continuar vazia, aí sim damos Erro 400
    if (!message) {
      console.error("Body recebido inválido:", req.body);
      return res.status(400).json({ error: "Mensagem vazia ou formato inválido. Verifique o Content-Type." });
    }

    // IA
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Erro fatal:", error);
    return res.status(500).json({ error: error.message });
  }
}