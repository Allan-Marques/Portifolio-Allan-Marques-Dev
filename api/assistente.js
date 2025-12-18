// Arquivo: api/assistente.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuração para Vercel entender que é uma Edge Function (opcional, mas bom para performance)
export const config = {
  runtime: 'edge', 
}; 
// NOTA: Se der erro com 'edge', remova as linhas 4-6 e use o padrão abaixo.
// Mas vamos tentar primeiro o padrão Node.js clássico para garantir compatibilidade total:

export default async function handler(req, res) {
  // 1. CORS (Permite que seu front acesse o back)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Trata requisição OPTIONS (Preflight do navegador)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Chave de API não configurada no servidor (Variáveis de Ambiente).");
    }

    // Parse do corpo da requisição
    const { message } = req.body;

    // Inicializa a IA
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // MODELO CORRIGIDO (Conforme sua auditoria)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Geração
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // Resposta de Sucesso
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Erro na Perícia Digital (API):", error);
    return res.status(500).json({ 
      error: "Falha interna no processamento.", 
      details: error.message 
    });
  }
}