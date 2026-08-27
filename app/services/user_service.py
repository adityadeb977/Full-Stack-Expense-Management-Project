import secrets

from app.database.connection import user_collection
from app.utils.helper import user_serializer
from app.utils.auth import hash_password
from bson import ObjectId


class UserService:

    @staticmethod
    def get_users():
        users = []

        for user in user_collection.find():
            users.append(user_serializer(user))

        return users

    @staticmethod
    def create_user(user):

        existing_user = user_collection.find_one(
            {"email": user.email}
        )

        if existing_user:
            return None

        user_data = user.model_dump()

        user_data["password"] = hash_password(user.password)
        user_data["role"] = user_data.get("role", "user")
        user_data["team_id"] = None

        if user_data["role"] not in ["user", "manager"]:
            user_data["role"] = "user"

        result = user_collection.insert_one(user_data)

        return user_serializer(
            user_collection.find_one(
                {"_id": result.inserted_id}
            )
        )

    @staticmethod
    def get_user(id):

        user = user_collection.find_one(
            {"_id": ObjectId(id)}
        )

        if user:
            return user_serializer(user)

        return None
