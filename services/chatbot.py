import os
from qdrant_client import QdrantClient, models
from langchain.memory import ConversationBufferMemory
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from services.LLM import Openai
import cohere
from services.dtype import PatentDocument

class PatentChatbot:
    def __init__(self, text:PatentDocument|str):
        load_dotenv()
        self.cohere_key = os.getenv("COHERE_API_KEY")
        self.openai_client = Openai("OPENAI_KEY")
        self.cohere_client = cohere.Client(self.cohere_key)
        self.memory = ConversationBufferMemory(memory_key="chat_history", input_key="query")
        self.qdrant = QdrantClient(host="localhost", api_key=None)
        self.collection_name = "patent_chunks"
        self.text=text
        self.init_chatbot(self.text)

    def embed_chunks(self, text, chunk_size=1000, chunk_overlap=200):
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        chunks = splitter.split_text(text)
        vectors = self.openai_client.embed(chunks)
        return chunks, vectors

    def create_qdrant_index(self, chunks, vectors):
        self.qdrant.recreate_collection(
            collection_name=self.collection_name,
            vectors_config=models.VectorParams(
                size=len(vectors),
                distance=models.Distance.COSINE,
                on_disk=True,
                quantization_config=models.ScalarQuantization(
                    scalar=models.ScalarQuantizationConfig(type="int8")
                )
            )
        )
        self.qdrant.upload_collection(
            collection_name=self.collection_name,
            vectors=[vectors],
            payload=[{"text": chunk} for chunk in chunks],
            ids=[i for i in range(len(chunks))],
            batch_size=64
        )

    def retrieve_chunks(self, query, top_k=5):
        query_vec = self.openai_client.embed(query, "text-embedding-3-small")
        results = self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=query_vec,
            limit=top_k,
            with_payload=True
        )
        return [res.payload["text"] for res in results]

    def rerank_chunks(self, query, chunks):
        rerank_result = self.cohere_client.rerank(model="rerank-english-v3.0", query=query, documents=chunks)
        ranked = sorted(zip(chunks, rerank_result.results), key=lambda x: -x[1].relevance_score)
        return [chunk for chunk, _ in ranked[:2]]

    def generate_answer(self, query, context):
        history = self.memory.load_memory_variables({}).get("chat_history", "")
        prompt = f"""
Context:
{context}

Chat History:
{history}

User: {query}
Assistant:"""
        response = self.openai_client.chat(prompt, 0.7)
        return response

    def generate_suggested_questions(self, summary: str) -> str:
        prompt = f"""
You are a helpful assistant. Based on the following patent summary, suggest 5 intelligent and relevant questions that a user might want to ask about this patent.
Make sure the questions are open-ended, technical, and focused on clarifying key aspects.

Patent Summary:
{summary}

Output format: points 1 to 5
"""
        try:
            response = self.openai_client.chat(prompt)
            return response
        except Exception as e:
            print(f"Error generating suggested questions: {e}")
            return []

    def clean_up_index(self):
        if self.qdrant.collection_exists(collection_name=self.collection_name):
            self.qdrant.delete_collection(collection_name=self.collection_name)
            print(f"🗑️ Deleted collection '{self.collection_name}' from disk.")

    def init_chatbot(self, text: PatentDocument):
        full_text = str(text)
        chunks, vectors = self.embed_chunks(full_text)
        self.create_qdrant_index(chunks, vectors)

    def generate_patent_answer(self, query: str):
        
        # Retrieve relevant chunks for the query
        retrieved = self.retrieve_chunks(query)
        
        # Rerank chunks for better relevance
        reranked = self.rerank_chunks(query, retrieved)
        
        # Build context from reranked chunks
        context = "\n\n".join(reranked)
        
        # Generate final answer from context
        answer = self.generate_answer(query, context)
        print(context)
        
        # Save memory for the next interactions
        self.memory.save_context({"query": query}, {"output": answer})
        
        return answer