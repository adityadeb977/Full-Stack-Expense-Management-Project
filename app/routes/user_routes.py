from fastapi import APIRouter, HTTPException
from app.services.user_service import UserService
from app.models.create_user import CreateUser

router = APIRouter()

@router.post("/users")
def create(user: CreateUser):
    result = UserService.create_user(user)

    if not result:
        raise HTTPException(status_code=400, detail="Employee already exists")

    return result

@router.get("/users")
def get_all():
    return UserService.get_users()

@router.get("/users/{id}")
def get_one(id:str):
    user=UserService.get_user(id)

    if not user:
        raise HTTPException(status_code=404,detail="Employee not found")

    return user
