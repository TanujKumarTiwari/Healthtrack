# HealthTrack

HealthTrack is a local web application for submitting symptoms and viewing
AI-generated general health information. It includes a public symptom checker
and a staff-only provider dashboard for reviewing stored submissions.

> **Health disclaimer:** HealthTrack is not a medical device and does not
> provide a diagnosis or replace professional medical advice. For potentially
> life-threatening symptoms, seek emergency care immediately.

## Project structure

- `backend/` — Django REST API and SQLite database
- `frontend/` — React application built with Vite

## Requirements

- Python and pip
- Node.js and npm
- [Ollama](https://ollama.com/) installed and running locally
- The Ollama model configured for the backend (default: `llama3.2`)

## Setup

### 1. Prepare Ollama

Start Ollama, then download the default model:

```powershell
ollama pull llama3.2
```

To use a different model, set `OLLAMA_MODEL` in `backend/.env`. The model must
be available to your local Ollama installation.

### 2. Create and activate a Python virtual environment

In PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate
```

If activation is blocked because PowerShell script execution is disabled, allow
locally created scripts for your current Windows user, then activate the
environment:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\.venv\Scripts\Activate
```

### 3. Install dependencies

After activating the environment, install dependencies from `backend/`:

```powershell
python -m pip install -r requirements.txt
```

### 4. Check that the AI system is working

Make sure Ollama is running and the configured model is available, then run
the AI smoke test from `backend/`:

```powershell
python test_ollama.py
```

The script prints the AI response if the service is reachable and working. If
it fails, check that Ollama is running and that the model configured by
`OLLAMA_MODEL` (default: `llama3.2`) has been downloaded.

### 5. Start the backend

From `backend/`, run:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`. The provider dashboard
requires a Django staff account; the superuser created above can be used for
local development.

### 6. Start the frontend

Open another PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173/`).

The frontend currently calls the backend at `http://127.0.0.1:8000/api`.
The backend's CORS configuration allows `http://localhost:5173`.

## API

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `POST` | `/api/symptoms/` | Analyze and save symptoms | Public |
| `POST` | `/api/token/` | Obtain a JWT token using Django credentials | Public |
| `GET` | `/api/provider/submissions/` | List saved symptom submissions | Staff only |
| — | `/admin/` | Django administration | Django account |

Example symptom request:

```json
{
  "symptoms": "Headache and fatigue"
}
```

The symptoms field must contain non-whitespace text and be no longer than 5000
characters. A successful response includes the submission ID, submitted
symptoms, AI analysis, and whether the analysis came from cache.

## Data and privacy

Symptom text and generated analysis are saved in the backend's SQLite database.
The analysis cache uses Django's in-memory local cache and expires after one
hour. Treat submissions as sensitive health information; this project is
configured for local development and should not be exposed publicly without
appropriate security, privacy, retention, and deployment controls.

## Development checks

Run frontend linting and build checks from `frontend/`:

```powershell
npm run lint
npm run build
```

Run backend tests from `backend/`:

```powershell
python manage.py test
```
#
