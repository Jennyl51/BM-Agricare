from fastapi import FastAPI
from auth import router as auth_router
from users import router as users_router
from database import router as db_router

app = FastAPI(title="BM-Agricare API")
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(db_router)


@app.get("/")
def root():
    return {"message": "Welcome to BM-Agricare API"}


@app.get("/health")
def health():
    return {"status": "ok"}



