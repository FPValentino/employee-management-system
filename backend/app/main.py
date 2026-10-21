from fastapi import FastAPI
from app.database import Base, engine
from app.models.employee import Employee
from app.routes.employees import router as employee_router
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.models.user import User


app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_router)
app.include_router(auth_router)
Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "ok"}