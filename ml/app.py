from fastapi import FastAPI

app = FastAPI(title="AdmitBridge ML Service")


@app.get("/health")
def health():
    return {"status": "ok", "service": "admitbridge-ml"}
