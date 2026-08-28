from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import (
    user_collection,
    expense_collection,
    registration_request_collection,
    team_collection,
    audit_log_collection,
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
    def _record_audit(current_user, action, target_type, target_id=None, details=None):
        audit_log_collection.insert_one({
            "actor_id": str(current_user.get("_id", current_user.get("id", ""))),
            "actor_name": current_user.get("name", current_user.get("email", "Unknown")),
            "action": action,
            "target_type": target_type,
            "target_id": str(target_id) if target_id else None,
            "details": details or {},
            "created_at": datetime.now(timezone.utc),
        })

    @staticmethod
    def _serialize_audit_log(log):
        return {
            "id": str(log["_id"]),
            "actor_id": log.get("actor_id"),
            "actor_name": log.get("actor_name", "Unknown"),
            "action": log.get("action"),
            "target_type": log.get("target_type"),
            "target_id": log.get("target_id"),
            "details": log.get("details", {}),
            "created_at": log.get("created_at").isoformat()
            if hasattr(log.get("created_at"), "isoformat") else log.get("created_at"),
        }

    @staticmethod
    def _manager_can_review_owner(current_user, owner):
        if current_user["role"] != "manager":
            return True

        manager_team_id = current_user.get("team_id")
        if not manager_team_id:
            return False

        return owner and owner.get("role") == "user" and owner.get("team_id") == manager_team_id

    @staticmethod
    def get_all_users():

        users = []

        for user in user_collection.find():
            users.append(user_serializer(user))

        return users

    @staticmethod
    def delete_user(id, current_user):

        user = user_collection.find_one({"_id": ObjectId(id)})
        if not user:
            return None

        user_id = str(id)

        team_collection.update_many(
            {"member_ids": user_id},
            {
                "$pull": {"member_ids": user_id},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )

        if user.get("role") == "manager":
            team_collection.update_many(
                {"manager_id": user_id},
                {
                    "$set": {
                        "manager_id": None,
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )

        # Remove user-owned expenses first, then delete the user.
        expense_collection.delete_many(
            {"user_id": str(id)}
        )

        result = user_collection.delete_one(
            {"_id": ObjectId(id)}
        )

        if result.deleted_count == 0:
            return None

        AdminService._record_audit(current_user, "delete_user", "user", id, {"name": user.get("name"), "email": user.get("email")})

        return {"message": "Employee and related expenses deleted successfully"}

    @staticmethod
    def update_user_role(id, role, current_user):

        if role not in ["user", "manager"]:
            return None

        user = user_collection.find_one({"_id": ObjectId(id)})
        if not user:
            return None

        user_id = str(id)

        if role == "user" and user.get("role") == "manager":
            team_collection.update_many(
                {"manager_id": user_id},
                {
                    "$set": {
                        "manager_id": None,
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )
            user_collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": {"team_id": None}},
            )

        result = user_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"role": role}}
        )

        AdminService._record_audit(current_user, "update_user_role", "user", id, {"from_role": user.get("role"), "to_role": role})

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

            if not AdminService._manager_can_review_owner(current_user, owner):
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
    def approve_registration_request(id, current_user):

        request = registration_request_collection.find_one(
            {"_id": ObjectId(id)}
        )

        if not request:
            return None

        user_data = {
            "name": request["name"],
            "email": request["email"],
            "password": request["password"],
            "role": request.get("role", "user"),
            "team_id": None,
        }

        result = user_collection.insert_one(user_data)

        registration_request_collection.delete_one(
            {"_id": ObjectId(id)}
        )

        AdminService._record_audit(current_user, "approve_registration", "registration_request", id, {"email": request.get("email")})

        return user_serializer(
            user_collection.find_one(
                {"_id": result.inserted_id}
            )
        )

    @staticmethod
    def reject_registration_request(id, current_user):

        result = registration_request_collection.delete_one(
            {"_id": ObjectId(id)}
        )

        if result.deleted_count:
            AdminService._record_audit(current_user, "reject_registration", "registration_request", id)

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

        if not AdminService._manager_can_review_owner(current_user, owner):
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

        AdminService._record_audit(current_user, "approve_expense", "expense", id, {"amount": expense.get("amount"), "note": note})

        expense = expense_collection.find_one(
            {
                "_id": ObjectId(id)
            }
        )

        return expense_serializer(expense)

    @staticmethod
    def delete_expense(id, current_user):
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

        AdminService._record_audit(current_user, "delete_expense", "expense", id, {"title": expense.get("title") if expense else None})

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

        if not AdminService._manager_can_review_owner(current_user, owner):
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

        AdminService._record_audit(current_user, "reject_expense", "expense", id, {"amount": expense.get("amount"), "note": note})

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
        if not AdminService._manager_can_review_owner(current_user, owner):
            return "unauthorized"
        return expense

    @staticmethod
    def get_audit_logs(*, action=None, actor_id=None, date_from=None, date_to=None, page=1, page_size=25):
        query = {}
        if action:
            query["action"] = action
        if actor_id:
            query["actor_id"] = actor_id
        if date_from or date_to:
            query["created_at"] = {}
            if date_from:
                query["created_at"]["$gte"] = datetime.fromisoformat(date_from).replace(tzinfo=timezone.utc)
            if date_to:
                query["created_at"]["$lt"] = datetime.fromisoformat(date_to).replace(tzinfo=timezone.utc)

        skip = (page - 1) * page_size
        logs = audit_log_collection.find(query).sort("created_at", -1).skip(skip).limit(page_size)
        return {
            "items": [AdminService._serialize_audit_log(log) for log in logs],
            "total": audit_log_collection.count_documents(query),
            "page": page,
            "page_size": page_size,
        }
