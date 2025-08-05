import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { TaskType, type RAGState } from "./types";
import { pull } from 'langchain/hub'
import { Annotation, StateGraph } from "@langchain/langgraph";

const embeddingModel = "text-embedding-004";
const llmModel = "gemini-2.0-flash";
const url = "https://eloquentjavascript.net/1st_edition/print.html";

const cheerioLoader = new CheerioWebBaseLoader(url, { selector: '.block' });
const docs = await cheerioLoader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1500,
  chunkOverlap: 300,
});

const allSplits = await splitter.splitDocuments(docs);

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: embeddingModel,
  apiKey: process.env.GOOGLE_API_KEY,
  taskType: TaskType.RETRIEVAL_DOCUMENT
});

const vectorStore = new Chroma(embeddings, {
  collectionName: 'javascript-book-gemini-embedding'
})

// await vectorStore.addDocuments(allSplits);

const promptTemplate = await pull('rlm/rag-prompt')

const llm = new ChatGoogleGenerativeAI({
  model: llmModel,
  apiKey: process.env.GOOGLE_API_KEY
})

const retrieve = async (state: RAGState): Promise<RAGState> => {
  console.log('RETRIEVE', { state})
  const retrievedDocs = await vectorStore.similaritySearch(state.question)
  console.log('RETRIEVE', { retrievedDocs })
  return { ...state, docs: retrievedDocs }
}

const generate = async (state: RAGState): Promise<RAGState> => {
  console.log('GENERATE', { state })
  const docs = (state.docs ?? []).map(doc => doc.pageContent).join('\n') 

  const prompt = `
  Você é um expert em Javascript que vai responder a uma pergunta do usuário.
  
  Responda a pergunta com base nos seguintes trechos retirados do livro "Eloquent Javascript".
  Referencie em sua resposta os trechos abaixos.
  
  DOCUMENTOS:
  ${docs}

  PERGUNTA:
  ${state.question}
  `

  const response = await llm.invoke(prompt)
  return { ...state, answer: response.content.toString() }
}

const StateAnnotation = Annotation.Root({
  question: Annotation<RAGState['question']>,
  docs: Annotation<RAGState['docs']>,
  answer: Annotation<RAGState['answer']>
})

const graph = new StateGraph(StateAnnotation)
  .addNode('retrieve', retrieve)
  .addNode('generate', generate)
  .addEdge('__start__', 'retrieve')
  .addEdge('retrieve', 'generate')
  .addEdge('generate', '__end__')
  .compile()

const getAnswer = async (question: string): Promise<string> => {
  const state = await graph.invoke({ question })
  return state.answer ?? ''
}

export { getAnswer }



