# EcoPatent Analyzer

An intelligent patent analysis platform that scrapes patent data from the USPTO, classifies inventions using **TRIZ 40 principles**, and provides an interactive Q&A chatbot over patent content — powered by hybrid vector search and LLMs.

## Architecture

```
┌──────────────┐     ┌───────────────────┐     ┌────────────────┐
│  React UI    │────▶│   Flask API       │────▶│   Qdrant (RAG) │
│  (Vite + TS) │     │   (port 8000)     │     │  Vector Store  │
└──────────────┘     └────────┬──────────┘     └────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
            ┌──────────────┐   ┌──────────────────┐
            │  Selenium     │   │  Azure Cosmos DB  │
            │  (USPTO       │   │  + Blob Storage   │
            │   scraper)    │   │                   │
            └──────────────┘   └──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.13, Django 6, DRF |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **LLM** | OpenAI GPT-4o, TogetherAI (DeepSeek) |
| **Vector DB** | Qdrant Cloud (dense + sparse hybrid search) |
| **Reranker** | Cohere (`rerank-english-v3.0`) |
| **Infrastructure** | Docker, Docker Compose |
| **Cloud Storage** | Azure Cosmos DB, Azure Blob Storage |
| **Scraping** | Selenium (headless Firefox on standalone container) |

## Prerequisites

- Python 3.13+
- Node.js 18+
- Docker & Docker Compose
- API keys (see [Environment Variables](#environment-variables))

## Environment Variables

Create a `.env` file in the project root:

| Variable | Description |
|----------|-------------|
| `OPENAI_KEY` | OpenAI API key |
| `TOGETHER_API_KEY` | TogetherAI API key |
| `COHERE_API_KEY` | Cohere API key |
| `VECTORDB_KEY` | Qdrant Cloud API key |
| `QDRANT_URL` | Qdrant Cloud cluster URL |
| `COSMODB_STRING` | Azure Cosmos DB connection string |
| `AZURE_BLOB_STRING` | Azure Blob Storage connection string |

## Quick Start (Docker)

```bash
# Build and start both backend + Selenium containers
docker compose up --build

# In another terminal, start the frontend
cd frontend
npm install
npm run frontend
```

- **Backend** → http://localhost:8000
- **Frontend** → http://localhost:5173

## Manual Setup (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
npm run frontend
```

### Selenium (required for USPTO scraping)

```bash
docker run -d -p 4444:4444 --shm-size=2gb selenium/standalone-firefox:latest
```

## API Reference

### `POST /upload`

Upload a patent PDF for analysis.

**Request:** `multipart/form-data` with `file` field (PDF only).

**Response:**
```json
{
  "message": "PDF processed and classified successfully",
  "patent_number": "US1234567",
  "title": "System and method for...",
  "Inventors": "Smith, John",
  "publication_date": "2023-05-15",
  "classification_result": { "... TRIZ classification ..." },
  "summ": "Patent summary...",
  "suggested_questions": "1. ...\\n2. ..."
}
```

### `POST /query`

Ask a question about the currently loaded patent.

**Request:**
```json
{ "question": "What is the main innovation?" }
```

**Response:**
```json
{ "answer": "The main innovation is..." }
```

## Project Structure

```
├── compose.yaml               # Docker Compose (backend + Selenium)
├── Dockerfile
├── backend/
│   ├── manage.py                  # Django management script
│   ├── patent_analyzer/           # Django project configuration
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── upload/                    # Upload API app
│   │   └── views.py
│   ├── query/                     # Query API app
│   │   └── views.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── Dockerfile
│   ├── compose.yaml
│   ├── .dockerignore
│   └── services/
│       ├── patent_parser.py       # USPTO scraping (Selenium + BeautifulSoup)
│       ├── textClassification.py  # TRIZ classification pipeline
│       ├── chatbot.py             # Q&A chatbot with hybrid search
│       ├── LLM.py                 # LLM abstractions (OpenAI, TogetherAI)
│       ├── db.py                  # Azure Cosmos DB & Blob storage
│       ├── dtype.py               # Pydantic data models
│       └── prompt_template.py     # LLM prompt templates
├── frontend/
│   └── src/
│       ├── pages/             # Page components
│       ├── components/        # UI components
│       ├── hooks/             # Custom React hooks
│       ├── types/             # TypeScript types
│       └── api.ts             # Backend API client
└── docs/
```

## How It Works

1. **Upload** — A patent PDF is uploaded; the system extracts the patent number using regex.
2. **Scrape** — Selenium navigates the USPTO Public Patent Search site and scrapes the full patent (title, abstract, claims, description, metadata).
3. **Classify** — The patent is analyzed against TRIZ 40 principles via a multi-step LLM pipeline: problem extraction → topic classification → vector retrieval → dynamic rule creation → final classification.
4. **Store** — Patent data is persisted to Azure Cosmos DB; the PDF is stored in Azure Blob Storage; text embeddings (dense + sparse) are indexed in Qdrant.
5. **Chat** — Users ask questions; the system performs hybrid search (dense + sparse) on Qdrant, reranks results with Cohere, and generates an answer using GPT-4o with conversation memory.
