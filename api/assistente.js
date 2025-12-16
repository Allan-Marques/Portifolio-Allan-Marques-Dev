/* ==========================================================================
   ARQUIVO: api/assistente.js (VERSÃO ESM MODERNIZADA)
   DESCRIÇÃO: Backend compatível com a biblioteca Google Gemini e Vercel
   ========================================================================== */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from 'module';

// Em módulos ESM, precisamos criar um 'require' manual para ler arquivos JSON
const require = createRequire(import.meta.url);

let knowledge = {};
try {
    // Tenta carregar o arquivo da raiz
    knowledge = require('../knowledge_base.json');
} catch (e) {
    console.warn("Base de conhecimento não carregada:", e.message);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  
  // 1. Configuração de CORS (Permite que seu site acesse a API)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Responde rápido para requisições de verificação (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Validação de Método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verifica se a chave existe
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Chave GEMINI_API_KEY não encontrada no ambiente Vercel");
    }

    const { userMessage, context } = req.body;

    // 3. Engenharia de Prompt
    const systemPrompt = `
    # CONTEXTO
    Você é o Allan Marques Bastos. Aja como o próprio em uma entrevista.
    Seja técnico e direto.
    
    # DADOS DO PORTFÓLIO:
    ${JSON.stringify(knowledge)}
    `;

    let finalMessage = userMessage;
    // Gatilhos proativos
    if (context === 'inicio') finalMessage = "Faça uma breve apresentação profissional.";
    if (context === 'contexto_projetos') finalMessage = "Quais são seus projetos principais?";

    // 4. Chamada para o Google Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(`${systemPrompt}\n\nUsuário/Recrutador: ${finalMessage}`);
    const response = await result.response;
    
    // 5. Retorno para o Frontend
    return res.status(200).json({ resposta: response.text() });

  } catch (error) {
    console.error("Erro na API:", error);
    // Retorna erro 500 com a mensagem para ajudar no debug
    return res.status(500).json({ error: error.message || 'Erro interno na IA.' });
  }
}