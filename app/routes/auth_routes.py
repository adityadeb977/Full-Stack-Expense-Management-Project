from fastapi import APIRouter, HTTPException
from app.models.login import Login
from app.models.register import RegisterUser
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/login")
def login(login_data: Login):

    result = AuthService.login(login_data)

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return result


@router.post("/register")
def register(user: RegisterUser):

    result = AuthService.register(user)

    if result == "already_exists":
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    if result == "request_exists":
        raise HTTPException(
            status_code=400,
            detail="Registration request already exists"
        )

    return result