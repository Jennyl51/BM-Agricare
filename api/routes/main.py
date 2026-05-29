from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from api.routes.auth import router as auth_router
from api.routes.users import router as users_router
from api.routes.invoices import router as invoices_router
from api.routes.rewards import router as rewards_router
from api.routes.guidelines import router as guidelines_router
from api.routes.products import router as products_router
from api.routes import admin_analytics

app = FastAPI(title="BM-Agricare API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(invoices_router)
app.include_router(rewards_router)
app.include_router(guidelines_router)
app.include_router(products_router)
app.include_router(admin_analytics.router)


@app.get("/")
def root():
    return FileResponse("index.html")


@app.get("/health")
def health():
    return {"status": "ok"}




