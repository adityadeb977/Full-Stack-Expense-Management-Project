from datetime import datetime, timezone

from bson import ObjectId

from app.database.connection import expense_collection
from app.utils.expense_filters import build_expense_query, enrich_expense_with_user
from app.utils.helper import expense_serializer


class ExpenseService:

    @staticmethod
    def add_expense(expense, current_user):

        expense_data = expense.model_dump()

        # Logged-in user becomes the owner
        expense_data["user_id"] = str(current_user["_id"])

        # Every new expense starts as Pending
        expense_data["status"] = "Pending"
        expense_data["created_at"] = datetime.now(timezone.utc)

        result = expense_collection.insert_one(expense_data)

        return expense_serializer(
            expense_collection.find_one(
                {"_id": result.inserted_id}
            )
        )

    @staticmethod
    def get_all_expenses(
        current_user,
        *,
        search=None,
        category=None,
        status=None,
        date_from=None,
        date_to=None,
        min_amount=None,
        max_amount=None,
        page=1,
        page_size=10,
    ):
        query = build_expense_query(
            current_user,
            search=search,
            category=category,
            status=status,
            date_from=date_from,
            date_to=date_to,
            min_amount=min_amount,
            max_amount=max_amount,
            admin_list=False,
        )

        skip = (page - 1) * page_size
        total = expense_collection.count_documents(query)

        expenses = []
        for expense in (
            expense_collection.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(page_size)
        ):
            expenses.append(expense_serializer(expense))

        return {
            "items": expenses,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

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