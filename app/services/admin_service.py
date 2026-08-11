from bson import ObjectId

from app.database.connection import (
    user_collection,
    expense_collection,
    registration_request_collection
)

from app.utils.helper import (
    user_serializer,
    registration_request_serializer,
    expense_serializer
)


class AdminService:

    @staticmethod
    def get_all_users():

        users = []

        for user in user_collection.find():
            users.append(user_serializer(user))

        return users

    @staticmethod
    def delete_user(id):

        # Remove user-owned expenses first, then delete the user.
        expense_collection.delete_many(
            {"user_id": str(id)}
        )

        result = user_collection.delete_one(
            {"_id": ObjectId(id)}
        )

        if result.deleted_count == 0:
            return None

        return {"message": "User and related expenses deleted successfully"}


    @staticmethod
    def get_registration_requests():

        requests = []

        for request in registration_request_collection.find():
            requests.append(registration_request_serializer(request))

        return requests

    @staticmethod
    def approve_registration_request(id):

        request = registration_request_collection.find_one(
            {"_id": ObjectId(id)}
        )

        if not request:
            return None

        user_data = {
            "name": request["name"],
            "email": request["email"],
            "password": request["password"],
            "role": request.get("role", "user")
        }

        result = user_collection.insert_one(user_data)

        registration_request_collection.delete_one(
            {"_id": ObjectId(id)}
        )

        return user_serializer(
            user_collection.find_one(
                {"_id": result.inserted_id}
            )
        )

    @staticmethod
    def reject_registration_request(id):

        registration_request_collection.delete_one(
            {"_id": ObjectId(id)}
        )

        return {"message": "Registration request rejected"}

    @staticmethod
    def get_all_expenses():

        expenses = []

        for expense in expense_collection.find():

            user = user_collection.find_one(
                {"_id": ObjectId(expense["user_id"])}
            )

            expense_data = expense_serializer(expense)

            expense_data["user_name"] = user["name"] if user else "Unknown"

            expenses.append(expense_data)

        return expenses

    @staticmethod
    def approve_expense(id):

        expense_collection.update_one(
            {
                "_id": ObjectId(id)
            },
            {
                "$set": {
                    "status": "Approved"
                }
            }
        )

        expense = expense_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

        return expense_serializer(expense)

    @staticmethod
    def delete_expense(id):

        result = expense_collection.delete_one(
            {
                "_id": ObjectId(id)
            }
        )

        if result.deleted_count == 0:
            return None

        return {"message": "Expense deleted successfully"}

    @staticmethod
    def reject_expense(id):

        expense_collection.update_one(
            {
                "_id": ObjectId(id)
            },
            {
                "$set": {
                    "status": "Rejected"
                }
            }
        )

        expense = expense_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

        return expense_serializer(expense)