/* ARQUIVO: api/assistente.js (Código Final em Inglês) */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let knowledge = {};

try {
    knowledge = require('../knowledge_base.json');
} catch (e) {
    console.warn("Knowledge base not found.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("API Key missing");

    const { userMessage, context } = req.body;

    const systemPrompt = `
    # CONTEXTO
    Você é o Allan Marques Bastos. Aja como o próprio em uma entrevista.
    # DADOS:
    ${JSON.stringify(knowledge)}
    `;

    let finalMessage = userMessage;
    if (context === 'inicio') finalMessage = "Apresente-se.";

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${finalMessage}`);
    const response = await result.response;
    
    return res.status(200).json({ resposta: response.text() });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
// Versao Flash Corrigida
