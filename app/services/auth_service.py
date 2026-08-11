from app.database.connection import (
    user_collection,
    registration_request_collection
)
from app.services.user_service import UserService
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token
)


class AuthService:

    @staticmethod
    def login(login_data):

        user = user_collection.find_one(
            {"email": login_data.email}
        )

        if not user:
            return None

        is_valid = verify_password(
            login_data.password,
            user["password"]
        )

        if not is_valid:
            return None

        payload = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"]
        }

        token = create_access_token(payload)

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user["role"],
            "name": user["name"]
        }

    @staticmethod
    def register(register_data):
        existing_user = user_collection.find_one(
            {"email": register_data.email}
        )

        if existing_user:
            return "already_exists"

        existing_request = registration_request_collection.find_one(
            {"email": register_data.email}
        )

        if existing_request:
            return "request_exists"

        request_data = register_data.model_dump()
        request_data["password"] = hash_password(register_data.password)
        request_data["role"] = "user"
        request_data["status"] = "Pending"

        registration_request_collection.insert_one(request_data)

        return {
            "message": "Registration request submitted successfully"
        }
