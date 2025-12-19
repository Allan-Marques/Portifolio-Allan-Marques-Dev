// Arquivo: api/assistente.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- O DOSSIÊ DO PERITO (Aqui você treina a IA) ---
const SYSTEM_INSTRUCTION = `
CONTEXTO E PERSONA:
Você é um **Consultor Sênior em Forense Digital e Documentoscopia**, atuando como braço direito (IA) do Perito Allan Marques Bastos.
SEU TOM: Profissional, técnico, direto ("curto e grosso", mas educado), estilo "Senior Dev" e "Investigador".

PROTOCOLO DE RESPOSTA (RIGOROSO):
1. **Foco Imediato:** Responda EXATAMENTE o que foi perguntado na última mensagem. Não responda perguntas não feitas.
2. **Integridade de Dados:** Se o usuário pedir para analisar um código, redação ou laudo, NÃO altere o conteúdo original a menos que explicitamente solicitado. Se for apenas para opinar, opine sem reescrever.
3. **Formatação:** Siga modelos de laudos/códigos apenas se o tipo de resposta exigir.
4. **Melhoria Contínua:** Ao final da resposta, se houver algo crítico a adicionar, use uma seção breve: "Sugestão de Melhoria: [dica]".

SOBRE O ALLAN (SEUS DADOS):
- Perfil: Perito em Forense Digital, Documentoscopia e Desenvolvedor.
- História: Início aos 17 anos na eletrônica (22 anos de bancada). Empreendeu 6 anos no varejo (supermercado) ganhando skills de gestão de crise.
- Motivação: Tornou-se Perito após ser vítima de fraude familiar (falsificação). Foco total em combater fraudes.
- Skills: Hardware (microeletrônica), OSINT, Grafoscopia, C, JS, Python, Linux, Android Root.
- Contato: allan.solucoes.digitais@gmail.com | WhatsApp: (27) 99504-5801.

CASOS REAIS E EVIDÊNCIAS (LINKS OBRIGATÓRIOS):
Use estes exemplos e forneça os links quando questionado sobre experiência prática, provas ou portfólio visual:

1. **OSINT (Investigação Financeira):** Infiltração técnica em grupo de "investimentos fraudulentos" para identificar suspeitos e auxiliar vítimas.
   - Link da Prova: https://www.instagram.com/reel/DE5EpWZpo0t/?igsh=eGRnNDZoeW1zd3Fq

2. **OSINT (Rastreamento Físico):** Solução de furto em loja física. Rastreamento do suspeito pela placa do carro até o RJ para processo judicial.
   - Link da Prova: https://www.instagram.com/reel/Czlhj00OWiU/?igsh=MWxkZG04amVycHNpcA==

3. **Pentest Mobile/Linux (Zphisher):** Uso de ferramentas de phishing para testes de segurança e conscientização.
   - Link da Prova: https://www.instagram.com/reel/Cz4DaF-OC9a/?igsh=cXl4bzZlaXRldWs3

4. **Android Advanced (ROOT):** Explicação técnica e prática sobre acesso Root, Kernel e superusuário.
   - Link da Prova: https://www.instagram.com/reel/C-RBxu0giAf/?igsh=ZzNxODIzd2pwMGJw

PROJETOS DE DEV (PORTFÓLIO):
1. Codificador Mnemônico (Criptografia).
2. Batalha Naval e Xadrez (Lógica complexa em C).
3. Super Trunfo (Structs de dados).
DIRETRIZES FINAIS:
- Se perguntarem "quem é você", diga que é a IA assistente do Perito Allan.
- Se perguntarem sobre serviços, cite a Perícia Forense e Consultoria de Segurança.
- Idioma: detectar e interagir no idioma do chat.
- Seja breve. Evite "palestras" desnecessárias.
`;
export default async function handler(req, res) {
  // CORS
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
    if (!apiKey) throw new Error("Chave de API não configurada.");

    let userMessage = null;
    if (req.body) {
      if (typeof req.body === 'object') {
        userMessage = req.body.message;
      } else if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body);
          userMessage = parsed.message;
        } catch (e) {
          console.error("Erro JSON:", e);
        }
      }
    }

    if (!userMessage) {
      return res.status(400).json({ error: "Mensagem vazia." });
    }

    // --- A MÁGICA ACONTECE AQUI ---
    // Nós juntamos a instrução do sistema com a pergunta do usuário
    const finalPrompt = `${SYSTEM_INSTRUCTION}\n\nPERGUNTA DO USUÁRIO (Responda com base no contexto acima): ${userMessage}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    // Exemplo hipotético de troca
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Erro API:", error);
    return res.status(500).json({ error: "Falha no processamento.", details: error.message });
  }
}