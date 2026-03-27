from fastapi import FastAPI
from auth import router as auth_router

app = FastAPI(title="BM-Agricare API")
app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "Welcome to BM-Agricare API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/login")
def auth_login():
    pass


@app.get("/auth/me")
def auth_me():
    pass


@app.get("/users/me")
def get_user_me():
    pass


@app.patch("/users/me")
def update_user_me():
    pass


@app.get("/admin/users")
def get_admin_users():
    pass


@app.post("/admin/users")
def create_admin_user():
    pass


@app.patch("/admin/users/{user_id}")
def update_admin_user(user_id: str):
    pass
