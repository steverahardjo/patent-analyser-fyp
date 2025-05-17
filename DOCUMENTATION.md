# Patent Analysis System Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [API Documentation](#api-documentation)
5. [Usage Guide](#usage-guide)
6. [Error Handling](#error-handling)
7. [Security & Performance](#security--performance)

## Overview
The Patent Analysis System is an intelligent platform designed to analyze and interact with patent documents. It leverages advanced natural language processing and machine learning techniques to understand, classify, and answer questions about patents. The system uses a combination of vector databases, language models, and semantic search to provide accurate and context-aware responses.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Flask Server   │────▶│  Core Services  │────▶│  Vector Store   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                        │
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  API Endpoints  │     │  LLM Services   │     │  Qdrant DB      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Component Interaction Flow
1. User uploads patent document
2. System processes and extracts information
3. Content is classified and analyzed
4. Vector embeddings are created and stored
5. User queries are processed through the chatbot
6. Responses are generated and validated

## Core Components

### 1. Patent Parser (`patent_parser.py`)
The Patent Parser service handles the initial processing of patent documents.

#### Key Features:
- PDF document processing
- Patent number extraction
- Metadata extraction
- Text content extraction

#### Main Classes:
```python
class DocProcessing:
    """
    Handles the processing of patent documents.
    
    Methods:
    - process_document(patent_number: str) -> PatentDocument
    - extract_metadata(content: str) -> Dict
    - extract_text(content: bytes) -> str
    """
```

### 2. Text Classification (`textClassification.py`)
Handles the classification and analysis of patent text content.

#### Key Features:
- Patent classification
- Topic extraction
- Summary generation
- TRIZ principle analysis

#### Main Classes:
```python
class PatentClassifier:
    """
    Classifies and analyzes patent content.
    
    Methods:
    - classify_patent(abstract: str, claims: str) -> ClassificationResult
    - summarization(patent_doc: PatentDocument) -> str
    """
```

### 3. Chatbot Service (`chatbot.py`)
Provides interactive Q&A capabilities for patent documents.

#### Key Features:
- Context-aware responses
- Semantic search
- Response validation
- Conversation memory
- Input/output guardrails

#### Main Classes:
```python
class PatentChatbot:
    """
    Handles interactive patent document queries.
    
    Methods:
    - generate_patent_answer(query: str) -> str
    - add_topicalGuardrail(query: str) -> bool
    - add_outputGuardrail(response: str) -> str
    - retrieve_chunks(query: str, top_k: int, min_score: float) -> List[str]
    - rerank_chunks(query: str, chunks: List[str]) -> List[str]
    """
```

### 4. LLM Service (`LLM.py`)
Manages interactions with language models.

#### Key Features:
- Multiple LLM provider support
- Embedding generation
- Chat completions
- Model abstraction

#### Main Classes:
```python
class LanguageModel(ABC):
    """
    Abstract base class for language model implementations.
    """

class Openai(LanguageModel):
    """
    OpenAI implementation of the language model interface.
    """
```

### 5. Data Types (`dtype.py`)
Defines core data structures used throughout the system.

#### Key Classes:
```python
class PatentDocument:
    """
    Represents a processed patent document.
    
    Attributes:
    - title: str
    - abstract: str
    - claims: str
    - inventor: str
    - publication_date: str
    """
```

### 6. Prompt Templates (`prompt_template.py`)
Manages system prompts and templates.

#### Key Features:
- Centralized prompt management
- Enum-based prompt organization
- Template formatting

#### Main Templates:
```python
class Prompt(Enum):
    INPUT_GUARDRAIL = "..."
    OUTPUT_GUARDRAIL = "..."
    SUMMARIZATION = "..."
    # Additional templates...
```

## API Documentation

### Endpoints

#### 1. Upload Patent
```http
POST /upload
Content-Type: multipart/form-data

Parameters:
- file: PDF file (required)

Response:
{
    "message": "PDF processed and classified successfully",
    "patent_number": "string",
    "title": "string",
    "Inventors": "string",
    "publication_date": "string",
    "classification_result": "object",
    "summ": "string"
}
```

#### 2. Query Patent
```http
POST /query
Content-Type: application/json

Parameters:
- question: string (required)

Response:
{
    "answer": "string"
}
```

## Usage Guide

### Basic Usage Flow
1. Upload a patent document using the `/upload` endpoint
2. Receive classification and summary
3. Ask questions about the patent using the `/query` endpoint
4. Receive context-aware responses

### Example Usage
```python
# Upload patent
response = requests.post('/upload', files={'file': open('patent.pdf', 'rb')})
patent_data = response.json()

# Query patent
query_response = requests.post('/query', json={'question': 'What is the main innovation?'})
answer = query_response.json()['answer']
```

### Best Practices
1. Always validate patent documents before upload
2. Use specific, technical questions for better responses
3. Consider the context when asking follow-up questions
4. Handle API errors appropriately

## Error Handling

### Common Error Codes
- 400: Bad Request
- 422: Unprocessable Entity
- 500: Internal Server Error

### Error Response Format
```json
{
    "error": "string",
    "details": "string" // Optional
}
```

### Common Error Scenarios
1. Invalid patent document format
2. Missing patent number
3. Query outside patent scope
4. Processing failures

## Security & Performance

### Security Considerations
1. API key management
   - Secure storage of API keys
   - Environment variable usage
   - Key rotation policies

2. Input validation
   - File type verification
   - Content validation
   - Size limitations

3. Rate limiting
   - Request throttling
   - Concurrent request limits
   - Resource usage monitoring

4. Error message sanitization
   - Safe error responses
   - Logging best practices
   - Debug information control

### Performance Considerations
1. Chunk size optimization
   - Optimal text splitting
   - Memory usage balance
   - Processing efficiency

2. Vector search parameters
   - Index optimization
   - Search precision tuning
   - Result filtering

3. Response caching
   - Query result caching
   - Document processing cache
   - Memory management

4. Resource management
   - Connection pooling
   - Memory limits
   - Process optimization

## Future Improvements
1. Enhanced error handling
   - More detailed error messages
   - Better error recovery
   - Improved logging

2. Additional LLM providers
   - Support for more models
   - Provider fallback
   - Cost optimization

3. Improved response validation
   - Better context checking
   - Response quality metrics
   - Automated testing

4. Extended patent analysis capabilities
   - More detailed classification
   - Better summary generation
   - Enhanced query understanding 