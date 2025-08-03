import { ChromaClient } from "chromadb";

const client = new ChromaClient()
const collection = await client.getOrCreateCollection({ 
  name: 'javascript-book'
})

const query = await collection.query({
  queryTexts: ['How functions work?'],
  nResults: 2
})

console.log(query)
