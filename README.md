
# 🐳 Backend Patent Analyzer (Dockerized)

## 📦 Run the Docker Container

```bash
docker pull holyknight101/backend_patent-analyzer_v1:latest

docker run -d -p 8000:8000 --name patent_server holyknight101/backend_patent-analyzer_v1:latest
````

App will be available at:
👉 [http://localhost:8000](http://localhost:8000)

## 📤 Upload a PDF File

```bash
curl -X POST -F "file=@/path/to/your/file.pdf" http://localhost:8000/upload
```
## 📤 Enable chatbot conversation
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the patent about?"}'
```

## 🛑 Stop & Clean Up

```bash
docker stop patent_server
docker rm patent_server
```

> 💡 Works on Linux, Windows, and macOS (Intel & Apple Silicon).

