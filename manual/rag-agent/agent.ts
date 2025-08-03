import { GoogleGenAI } from "@google/genai";
import { ChromaClient } from "chromadb";

const client = new ChromaClient()
const collection = await client.getOrCreateCollection({ 
  name: 'javascript-book'
})

const MODEL = "gemini-2.0-flash";

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })

const userQuestion = 'What is a function?'

const retrieve = async (question: string) => {
  return await collection.query({
    queryTexts: [question],
    nResults: 5
  })
}


const retrievedChunks = (await retrieve(userQuestion)).documents[0]?.join('\n\n=======\n\n')

const systemInstruction = `
Você é um expert em Javascript que vai responder a uma pergunta do usuário.

Responda a pergunta com base nos seguintes trechos retirados do livro "Eloquent Javascript".
Referencie em sua resposta os trechos abaixos.

${retrievedChunks}
`

const response = await genai.models.generateContent({
  model: MODEL,
  config: {
    systemInstruction
  },
  contents: userQuestion
})

console.log(response?.candidates?.[0]?.content?.parts?.[0]?.text)
