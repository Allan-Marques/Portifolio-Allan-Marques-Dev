// Caminho sugerido: app/api/gemini/route.js (ou onde estiver sua lógica)
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Segurança: Pega a chave das Variáveis de Ambiente do Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API não configurada no servidor." },
        { status: 500 }
      );
    }

    // 2. Extrai o corpo da mensagem enviada pelo Frontend
    const { message } = await req.json();

    // 3. Inicializa o Agente com a Chave
    const genAI = new GoogleGenerativeAI(apiKey);

    // --- A CORREÇÃO CRÍTICA ESTÁ AQUI ---
    // Substituímos o 'gemini-1.5-flash' pelo modelo que sua auditoria confirmou:
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 4. Executa a geração
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // 5. Retorna para o Frontend
    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("Erro na Perícia Digital (API):", error);
    return NextResponse.json(
      { error: "Falha na comunicação com o modelo.", details: error.message },
      { status: 500 }
    );
  }
}
