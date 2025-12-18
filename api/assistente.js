export default async function handler(req, res) {
  // 1. CORS
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
    // 2. TRATAR DADOS
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const userMessage = body?.userMessage || body?.message || body?.prompt;

    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem vazia." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 3. CONEXÃO DIRETA COM O MODELO CLÁSSICO (GEMINI-PRO)
    // Esse modelo roda em todas as contas, antigas ou novas.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: "Você é o assistente virtual do portfólio do Allan Marques. Responda de forma curta e profissional. Contexto: " + userMessage }]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Google:", data);
      return res.status(response.status).json({ error: "Erro na API", detalhes: data });
    }

    // 4. RETORNA RESPOSTA
    // O formato do gemini-pro pode variar ligeiramente, garantindo acesso seguro
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta da IA.";
    
    res.status(200).json({ resposta: text });

  } catch (error) {
    console.error("Erro Geral:", error);
    res.status(500).json({ error: "Erro interno." });
  }
}
