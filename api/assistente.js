// Arquivo: api/assistente.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Configuração: Dizemos ao Next.js que isso é uma rota dinâmica (não cachear estático)
export const dynamic = 'force-dynamic';

// --- TRATAMENTO DE CORS (Preflight) ---
// O navegador manda um 'OPTIONS' antes do POST para ver se pode falar com a API.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// --- A LÓGICA DO CHAT (POST) ---
export async function POST(req) {
  try {
    // 1. Validação da Chave (Segurança)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API não configurada no servidor." },
        { status: 500 }
      );
    }

    // 2. Parse do Corpo da Requisição (Jeito moderno)
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem vazia." },
        { status: 400 }
      );
    }

    // 3. Acionamento do Perito (Gemini)
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // MODELO: Mantemos o 2.0 Flash que sua auditoria validou
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // 4. Construção da Resposta com CORS
    // Aqui usamos NextResponse para garantir que os headers vão junto
    return NextResponse.json(
      { result: text },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );

  } catch (error) {
    console.error("Erro na Perícia Digital:", error);
    return NextResponse.json(
      { error: "Falha interna.", details: error.message },
      { status: 500 }
    );
  }
}