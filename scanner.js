// Arquivo: scanner.js
// Objetivo: Listar modelos disponíveis para a Chave de API especificada.

const API_KEY = 'AIzaSyC-lRa3xjfaMBqAPnCUHYQJiiu69Ge5r6Y'; // <--- COLE SUA CHAVE AQUI

async function listarModelos() {
  console.log("--> Iniciando Varredura de Modelos Disponíveis...");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("--> ERRO DE PERMISSÃO/CONTA:");
      console.error(data.error);
      return;
    }

    if (!data.models) {
      console.log("--> Nenhum modelo encontrado. Verifique se a API Generative Language está ativada no Google Cloud Console.");
      return;
    }

    console.log("\n--> RELATÓRIO DE MODELOS DISPONÍVEIS:");
    console.log("=========================================");
    
    // Filtra apenas modelos que geram conteúdo (chat)
    const modelosUteis = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

    modelosUteis.forEach(model => {
      console.log(`NOME TÉCNICO: ${model.name}`);
      console.log(`DESCRIÇÃO:    ${model.displayName}`);
      console.log("-----------------------------------------");
    });

    console.log("\n--> CONCLUSÃO:");
    console.log("Copie um dos 'NOMES TÉCNICOS' acima (ex: models/gemini-pro) e use no script de teste.");

  } catch (erro) {
    console.error("--> FALHA DE CONEXÃO:");
    console.error(erro);
  }
}

listarModelos();