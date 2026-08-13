from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import (
    user_collection,
    expense_collection,
    registration_request_collection
)

from app.utils.expense_filters import build_expense_query, enrich_expense_with_user
from app.utils.helper import (
    user_serializer,
    registration_request_serializer,
    expense_serializer
)
from app.utils.receipt_storage import remove_receipt

RECEIPT_REQUIRED_AMOUNT = 1000


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

        return {"message": "Employee and related expenses deleted successfully"}

    @staticmethod
    def update_user_role(id, role):

        if role not in ["user", "manager"]:
            return None

        result = user_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"role": role}}
        )

        if result.matched_count == 0:
            return None

        return user_serializer(
            user_collection.find_one(
                {"_id": ObjectId(id)}
            )
        )

    @staticmethod
    def get_dashboard_stats(current_user):

        total_users = user_collection.count_documents({"role": {"$in": ["user", "manager"]}})
        total_managers = user_collection.count_documents({"role": "manager"})
        total_expenses = expense_collection.count_documents({})

        total_amount = 0.0
        pending_amount = 0.0
        approved_amount = 0.0
        rejected_amount = 0.0

        for expense in expense_collection.find():
            owner = user_collection.find_one(
                {"_id": ObjectId(expense["user_id"])}
            )

            if current_user["role"] == "manager" and owner and owner.get("role") != "user":
                continue

            amount = expense.get("amount", 0) or 0
            total_amount += float(amount)

            if expense.get("status") == "Pending":
                pending_amount += float(amount)
            elif expense.get("status") == "Approved":
                approved_amount += float(amount)
            elif expense.get("status") == "Rejected":
                rejected_amount += float(amount)

        return {
            "total_users": total_users,
            "total_managers": total_managers,
            "total_expenses": total_expenses,
            "total_amount": total_amount,
            "pending_amount": pending_amount,
            "approved_amount": approved_amount,
            "rejected_amount": rejected_amount,
        }


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
    def get_all_expenses(
        current_user,
        *,
        user_id=None,
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
            user_id=user_id,
            search=search,
            category=category,
            status=status,
            date_from=date_from,
            date_to=date_to,
            min_amount=min_amount,
            max_amount=max_amount,
            admin_list=True,
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
            expenses.append(enrich_expense_with_user(expense, include_user_name=True))

        return {
            "items": expenses,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def approve_expense(id, current_user, note=None):

        expense = expense_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

        if not expense:
            return None

        owner = user_collection.find_one(
            {"_id": ObjectId(expense["user_id"])}
        )

        if current_user["role"] == "manager" and owner and owner.get("role") != "user":
            return "unauthorized"

        if float(expense.get("amount", 0)) >= RECEIPT_REQUIRED_AMOUNT and not expense.get("receipt"):
            return "receipt_required"

        expense_collection.update_one(
            {
                "_id": ObjectId(id)
            },
            {
                "$set": {
                    "status": "Approved",
                    "approval_note": note,
                    "reviewed_at": datetime.now(timezone.utc),
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
        expense = expense_collection.find_one({"_id": ObjectId(id)})
        if expense:
            remove_receipt(expense.get("receipt"))
        result = expense_collection.delete_one(
            {
                "_id": ObjectId(id)
            }
        )

        if result.deleted_count == 0:
            return None

        return {"message": "Expense deleted successfully"}

    @staticmethod
    def reject_expense(id, current_user, note=None):

        expense = expense_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

        if not expense:
            return None

        owner = user_collection.find_one(
            {"_id": ObjectId(expense["user_id"])}
        )

        if current_user["role"] == "manager" and owner and owner.get("role") != "user":
            return "unauthorized"

        expense_collection.update_one(
            {
                "_id": ObjectId(id)
            },
            {
                "$set": {
                    "status": "Rejected",
                    "approval_note": note,
                    "reviewed_at": datetime.now(timezone.utc),
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
    def get_receipt_for_review(id, current_user):
        expense = expense_collection.find_one({"_id": ObjectId(id)})
        if not expense:
            return None
        owner = user_collection.find_one({"_id": ObjectId(expense["user_id"])})
        if current_user["role"] == "manager" and owner and owner.get("role") != "user":
            return "unauthorized"
        return expense
