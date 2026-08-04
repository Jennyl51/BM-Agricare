from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from api.routes.auth import router as auth_router
from api.routes.users import router as users_router
from api.routes.invoices import router as invoices_router
from api.routes.rewards import router as rewards_router
from api.routes.guidelines import router as guidelines_router
from api.routes.admin_auth import router as admin_auth_router
from api.routes.admin_dashboard import router as admin_dashboard_router
from api.routes.admin_invoices import router as admin_invoices_router
from api.routes.admin_retailers import router as admin_retailers_router
from api.routes.admin_products import router as admin_products_router
from api.routes.admin_rewards import router as admin_rewards_router

app = FastAPI(title="BM-Agricare API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(invoices_router)
app.include_router(rewards_router)
app.include_router(guidelines_router)
# admin
app.include_router(admin_auth_router)
app.include_router(admin_dashboard_router)
app.include_router(admin_invoices_router)
app.include_router(admin_retailers_router)
app.include_router(admin_products_router)
app.include_router(admin_rewards_router)


@app.get("/")
def root():
    return FileResponse("index.html")


@app.get("/health")
def health():
    return {"status": "ok"}



