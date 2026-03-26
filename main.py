from fastapi import FastAPI

app = FastAPI(title="BM-Agricare API")


@app.get("/")
def root():
    return {"message": "Welcome to BM-Agricare API"}


@app.get("/health")
def health():
    return {"status": "ok"}
