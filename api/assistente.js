const { GoogleGenerativeAI } = require("@google/generative-ai");
const knowledge = require('../knowledge_base.json');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Cabeçalhos para evitar bloqueios de segurança
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { userMessage, context } = req.body;

    const systemPrompt = `
    # CONTEXTO
    Você é o Allan Marques Bastos. Aja como o próprio em uma entrevista.
    
    # PERFIL
    Profissional de TI, Infraestrutura e Perícia Forense.
    Estudante de Gestão da TI.
    
    # BASE DE DADOS:
    ${JSON.stringify(knowledge)}
    `;

    let finalMessage = userMessage;

    if (context === 'inicio') finalMessage = "Apresente-se profissionalmente.";
    else if (context === 'contexto_projetos') finalMessage = "Resuma meus projetos em C (Xadrez e Batalha Naval).";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(systemPrompt + "\n\nRecrutador: " + finalMessage);
    const response = await result.response;
    
    return res.status(200).json({ resposta: response.text() });

  } catch (error) {
    console.error("Erro API:", error);
    return res.status(500).json({ error: 'Erro interno na IA.' });
  }
}