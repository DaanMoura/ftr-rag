import type { DocumentInterface } from "@langchain/core/documents";

export enum TaskType {
  TASK_TYPE_UNSPECIFIED = "TASK_TYPE_UNSPECIFIED",
  RETRIEVAL_QUERY = "RETRIEVAL_QUERY",
  RETRIEVAL_DOCUMENT = "RETRIEVAL_DOCUMENT",
  SEMANTIC_SIMILARITY = "SEMANTIC_SIMILARITY",
  CLASSIFICATION = "CLASSIFICATION",
  CLUSTERING = "CLUSTERING"
}

export interface RAGState {
  question: string;
  docs?: DocumentInterface<Record<string, unknown>>[]
  answer?: string
}