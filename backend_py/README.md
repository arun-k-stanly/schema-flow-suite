# Schema Flow Suite - Python Backend (FastAPI + PySpark)

This backend provides agent-driven APIs (Groq AI, data model, pipeline, validation, projects) using FastAPI and PySpark.

## Features
- Agents per domain: `groq`, `data_model`, `pipeline`, `validation`, `project`
- Groq AI integration via `.env` (`GROQ_API_KEY`)
- PySpark session for data pipeline operations
- Simple JSON storage for projects
- CORS enabled for frontend

## Quickstart

1. Create environment file:

```bash
cp .env.example .env
# Fill in GROQ_API_KEY and other values
```

2. Create venv and install dependencies:

```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Run the API:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Open: http://localhost:8001/api/health

## Environment Variables (.env)
- `GROQ_API_KEY`: Groq API key (required for AI endpoints)
- `SPARK_MASTER`: e.g. `local[*]` (optional)
- `ALLOWED_ORIGINS`: comma-separated origins for CORS (optional)
- `STORAGE_DIR`: directory for JSON storage files (default `./storage`)
- `API_PREFIX`: override API prefix (default `/api`)

## Example Requests

- Agents (Groq):
```bash
curl -X POST http://localhost:8001/api/agents/ask \
  -H "Content-Type: application/json" \
  -d '{"agent":"groq","payload":{"message":"Summarize the pipeline purpose"}}'
```

- Pipeline transform (PySpark):
```bash
curl -X POST http://localhost:8001/api/pipeline/transform \
  -H "Content-Type: application/json" \
  -d '{"rows":[{"id":1,"status":"ok"},{"id":2,"status":"bad"}],"ops":[{"action":"filter_eq","column":"status","value":"ok"}]}'
```

- Projects:
```bash
curl -X POST http://localhost:8001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":"proj-1","name":"Demo"}'
```

## Repo Layout
- `app/main.py`: FastAPI app factory and router wiring
- `app/core`: config, spark session, groq client
- `app/agents`: domain agents
- `app/routers`: API endpoints
- `app/utils`: storage helpers
- `app/models`: Pydantic models

## Notes
- For production, point `SPARK_MASTER` to your cluster.
- Secure your `.env` and do not commit secrets.

