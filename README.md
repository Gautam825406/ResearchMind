# ResearchMind

A React research workspace connected to a FastAPI backend and the existing Python multi-agent pipeline, powered by Groq. The original Streamlit interface remains available.

For the detailed frontend/backend architecture and interview preparation guide, see [DOCUMENTATION.md](DOCUMENTATION.md).

## Project structure

```text
backend/
	api.py            FastAPI endpoints
	agents.py         Groq agents and writing/review chains
	pipeline.py       Research workflow
	tools.py          Web search and scraping
	app.py            Optional Streamlit interface
	test_api.py       Backend regression tests
	requirements.txt  Python dependencies
	.env              Private backend credentials (ignored by Git)
	.env.example      Backend configuration template
frontend/
	src/              React landing page and research workspace
	package.json      Frontend dependencies and commands
	vite.config.js    Frontend development server and API proxy
.venv/              Python virtual environment
```

## Python setup (PowerShell)

```powershell
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
```

Create `backend/.env` using `backend/.env.example` and provide `GROQ_API_KEY` and `TAVILY_API_KEY`. Groq powers the agents and Tavily provides web search. Optionally set `GROQ_MODEL` to a Groq model with tool-calling support; the default is `openai/gpt-oss-20b`, served by Groq. No OpenAI key is required. Keep these credentials on the backend, never in React. Research calls use your provider accounts and may incur charges. Model availability depends on your Groq account; if Groq reports `model_not_found`, select a model available to your account and restart the API.

Start the API from the project root:

```powershell
.\.venv\Scripts\python.exe -m uvicorn api:app --app-dir backend --host 127.0.0.1 --port 8000
```

Interactive FastAPI documentation is available at http://127.0.0.1:8000/docs. The `/api/health` endpoint reports provider configuration without exposing credentials.

## React frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173) for the landing page. The research workspace is at http://127.0.0.1:5173/studio. Landing-page example topics open the studio with a prefilled question; they do not automatically start paid research. Vite forwards `/api` calls to port 8000. If port 5173 is occupied, Vite chooses the next available port.

The interface supports topic suggestions, Markdown reports, source details, reading notes, critic feedback, Markdown downloads, and completed-run history for the current browser session. History is cleared on refresh. Runs may take several minutes; keep the page open. The local API permits one research run at a time. Restart the API after changing `.env`.

## Verification

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s backend -p test_api.py -v
cd frontend
npm run build
```

API tests use a mocked pipeline and do not make paid provider calls. Missing keys do not prevent opening the frontend or viewing the API health endpoint.

## Original interface

```powershell
.\.venv\Scripts\python.exe -m streamlit run backend/app.py
```

The API and development servers are intended for local use. Add authentication, rate limits, and deployment configuration before exposing them publicly.