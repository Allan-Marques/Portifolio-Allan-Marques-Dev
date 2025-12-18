export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) {} }

    const userMessage = body?.userMessage || body?.message || body?.prompt;
    if (!userMessage) return res.status(400).json({ error: "Mensagem vazia." });

    const apiKey = process.env.GEMINI_API_KEY;

    // Conexão direta com o modelo Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Você é o assistente do Allan. Responda curto. Contexto: " + userMessage }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Google:", data);
      return res.status(response.status).json({ error: "Erro API Google", detalhes: data });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    res.status(200).json({ resposta: text });

  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ error: "Erro interno." });
  }
}
