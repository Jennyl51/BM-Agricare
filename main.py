from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from auth import router as auth_router
from users import router as users_router
from invoices import router as invoices_router
from api.routes.rewards import router as rewards_router

app = FastAPI(title="BM-Agricare API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(invoices_router)
app.include_router(rewards_router)


@app.get("/")
def root():
    return FileResponse("index.html")


@app.get("/health")
def health():
    return {"status": "ok"}



