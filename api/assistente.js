export default async function handler(req, res) {
  // --- 1. CONFIGURAÇÃO DE CORS (PADRÃO) ---
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

  try {
    // --- 2. PREPARAR DADOS ---
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const userMessage = body?.userMessage || body?.message || body?.prompt;

    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem vazia." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API Key não configurada." });
    }

    // --- 3. CONEXÃO DIRETA (SEM BIBLIOTECA) ---
    // Usamos o endereço oficial da API REST do Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: "Você é o assistente virtual do portfólio do Allan Marques. Responda de forma curta e profissional. Contexto: " + userMessage }]
        }
      ]
    };

    // Faz a chamada "nua e crua"
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // --- 4. TRATAMENTO DE ERROS DA API ---
    if (!response.ok) {
      console.error("Erro do Google:", data);
      return res.status(response.status).json({ 
        error: "Erro na API do Google", 
        detalhes: data.error?.message || "Erro desconhecido" 
      });
    }

    // --- 5. PEGAR A RESPOSTA E ENVIAR ---
    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ resposta: text });

  } catch (error) {
    console.error("Erro Geral:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}
