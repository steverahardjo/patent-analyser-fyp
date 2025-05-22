import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance
from langchain.memory import ConversationBufferMemory
from fastembed import SparseTextEmbedding
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tqdm

from services.LLM import Openai
from services.dtype import PatentDocument

class PatentChatbot:
    def __init__(self, text: PatentDocument | str):
        load_dotenv()
        self.openai_client = Openai("OPENAI_KEY")
            
        # Initialize Qdrant Cloud client
        self.memory = ConversationBufferMemory(memory_key="chat_history", input_key="query")
        self.qdrant = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("VECTORDB_KEY"))
        self.collection_name = "patent_chunks"
        self.text = text
        self.model_bm42 = SparseTextEmbedding(model_name="Qdrant/bm42-all-minilm-l6-v2-attentions")
        self.init_chatbot(self.text)


    def embed_chunks(self, text, chunk_size=1000, chunk_overlap=200):
        # Clean the text using Langchain's TextCleaner
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        chunks = splitter.split_text(text)
        
        # Create points with both dense and sparse vectors
        points = []
        for i, chunk in enumerate(chunks):
            # Get embeddings
            dense_vector = self.openai_client.embed(chunk)
            sparse_embedding = list(self.model_bm42.embed(chunk))[0]
            
            # Create point with proper vector format
            point = models.PointStruct(
                id=i,
                vector={
                    "dense": dense_vector,
                    "sparse": models.SparseVector(
                        values=sparse_embedding.values.tolist(),
                        indices=sparse_embedding.indices.tolist()
                    )
                },
                payload={"text": chunk}
            )
            points.append(point)
        
        return points

    def create_qdrant_index(self, points):
        try:
            # Try to delete existing collection if it exists
            try:
                self.qdrant.delete_collection(collection_name=self.collection_name)
                print(f"Deleted existing collection: {self.collection_name}")
            except Exception as e:
                print(f"Note: Could not delete existing collection (this is normal if it doesn't exist): {str(e)}")

            print(f"Creating collection: {self.collection_name}")
            print(f"Number of points: {len(points)}")
            
            # Create new collection
            self.qdrant.create_collection(
                collection_name=self.collection_name,
                vectors_config={
                    "dense": models.VectorParams(
                        size=1536,
                        distance=Distance.COSINE
                    )
                },
                sparse_vectors_config={
                    "sparse": models.SparseVectorParams(
                        modifier=models.Modifier.IDF
                    )
                },
                quantization_config=models.BinaryQuantization(
                    binary=models.BinaryQuantizationConfig(
                        always_ram=True,
                    )
                )
            )

            # Upload points with progress bar
            for point in tqdm.tqdm(points):
                self.qdrant.upsert(
                    collection_name=self.collection_name,
                    points=[point],
                    wait=False
                )
            print("Successfully created and populated collection")
            
        except Exception as e:
            print(f"Error in create_qdrant_index: {str(e)}")
            if "forbidden" in str(e).lower():
                print("Permission denied. Please check your Qdrant Cloud API key permissions.")
                print("You need write permissions to create and manage collections.")
            raise

    def retrieve_chunks(self, query, top_k=10):
        # Get embeddings for the query
        dense_embedding = self.openai_client.embed(query)
        sparse_embedding = list(self.model_bm42.query_embed(query))[0]
        
        # Perform hybrid search using prefetch and fusion
        results = self.qdrant.query_points(
            collection_name=self.collection_name,
            prefetch=[
                models.Prefetch(query=sparse_embedding.as_object(), using="sparse", limit=top_k),
                models.Prefetch(query=dense_embedding, using="dense", limit=top_k),
            ],
            query=models.FusionQuery(fusion=models.Fusion.RRF),
                search_params=models.SearchParams(
            quantization=models.QuantizationSearchParams(
                ignore=False,
                rescore=True,
                oversampling=2.0,
            )),
            limit=top_k
        )
        
        # Simply append all results
        return " ".join(point.payload['text'] for point in results.points)

    def generate_answer(self, query, context):
        history = self.memory.load_memory_variables({}).get("chat_history", "")
        prompt = f"""
Context:
{context}

History:
{history}

User Question: {query}

Please provide a clear and concise answer based on the context above.
"""
        return self.openai_client.chat(prompt, 0.7)

    def init_chatbot(self, text: PatentDocument):
        full_text = str(text)
        points = self.embed_chunks(full_text)
        self.create_qdrant_index(points)


    def generate_patent_answer(self, query: str):
        
        # Retrieve relevant chunks for the query
        retrieved = self.retrieve_chunks(query)
        
        # Rerank chunks for better relevance
        #reranked = self.rerank_chunks(query, retrieved)
        
        # Build context from reranked chunks
        context = "".join(retrieved)
        
        # Generate final answer from context
        answer = self.generate_answer(query, context)
        print(context)
        
        # Save memory for the next interactions
        self.memory.save_context({"query": query}, {"output": answer})
        
        return answer
    
    def clearout_history(self):
        self.memory.clear()