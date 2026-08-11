from bson import ObjectId

from app.database.connection import expense_collection
from app.utils.helper import expense_serializer


class ExpenseService:

    @staticmethod
    def add_expense(expense, current_user):

        expense_data = expense.model_dump()

        # Logged-in user becomes the owner
        expense_data["user_id"] = str(current_user["_id"])

        # Every new expense starts as Pending
        expense_data["status"] = "Pending"

        result = expense_collection.insert_one(expense_data)

        return expense_serializer(
            expense_collection.find_one(
                {"_id": result.inserted_id}
            )
        )

    @staticmethod
    def get_all_expenses(current_user):

        expenses = []

        for expense in expense_collection.find(
            {
                "user_id": str(current_user["_id"])
            }
        ):
            expenses.append(expense_serializer(expense))

        return expenses

    @staticmethod
    def get_expense_by_id(id, current_user):

        expense = expense_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

        if not expense:
            return None

        if expense["user_id"] != str(current_user["_id"]):
            return "unauthorized"

        return expense_serializer(expense)

    @staticmethod
    def update(id, expense, current_user):

        existing_expense = expense_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

        if not existing_expense:
            return None

        if existing_expense["user_id"] != str(current_user["_id"]):
            return "unauthorized"

        if existing_expense["status"] != "Pending":
            return "cannot_edit"

        expense_data = expense.model_dump()

        expense_data["user_id"] = str(current_user["_id"])

        expense_data["status"] = existing_expense["status"]

        expense_collection.update_one(
            {
                "_id": ObjectId(id)
            },
            {
                "$set": expense_data
            }
        )

        return expense_serializer(
            expense_collection.find_one(
                {
                    "_id": ObjectId(id)
                }
            )
        )

    @staticmethod
    def delete_expense_by_id(id, current_user):

        existing_expense = expense_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

        if not existing_expense:
            return None

        if existing_expense["user_id"] != str(current_user["_id"]):
            return "unauthorized"

        if existing_expense["status"] != "Pending":
            return "cannot_delete"

        expense_collection.delete_one(
            {
                "_id": ObjectId(id)
            }
        )

        return {
            "message": "Expense deleted successfully"
        }