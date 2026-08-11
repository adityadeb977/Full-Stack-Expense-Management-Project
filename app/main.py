from fastapi import FastAPI
from app.routes.user_routes import router as user_router
from app.routes.expense_routes import router as expense_router
from app.routes.auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.admin_routes import router as admin_router

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(expense_router)
app.include_router(auth_router)
app.include_router(admin_router)