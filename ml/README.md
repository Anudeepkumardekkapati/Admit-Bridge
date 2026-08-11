# AdmitBridge ML Service

Python service that will host the college recommendation model. Built with
FastAPI. No ML logic yet — this is just the runnable skeleton.

## Setup

```bash
cd ml
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app:app --reload --port 8000
```

Service starts at `http://localhost:8000`.

## Test the health endpoint

```bash
curl http://localhost:8000/health
# -> {"status":"ok","service":"admitbridge-ml"}
```

Interactive API docs are available at `http://localhost:8000/docs`.

## What comes next

- Training scripts / notebooks for the recommendation model
- A `POST /predict` endpoint that the Express server will call
