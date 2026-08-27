from bson import ObjectId

from app.database.connection import team_collection, user_collection


def user_serializer(user):

    team_id = user.get("team_id")
    team_name = None
    if team_id:
        team = team_collection.find_one({"_id": ObjectId(team_id)})
        if team:
            team_name = team.get("name")

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "team_id": team_id,
        "team_name": team_name,
    }


def registration_request_serializer(request):

    return {
        "id": str(request["_id"]),
        "name": request["name"],
        "email": request["email"],
        "role": request.get("role", "user"),
        "status": request.get("status", "Pending")
    }


def expense_serializer(expense):

    created_at = expense.get("created_at")
    if created_at and hasattr(created_at, "isoformat"):
        created_at = created_at.isoformat()

    return {
        "id": str(expense["_id"]),
        "title": expense["title"],
        "amount": expense["amount"],
        "category": expense["category"],
        "user_id": expense["user_id"],
        "status": expense["status"],
        "created_at": created_at,
        "receipt": expense.get("receipt"),
        "approval_note": expense.get("approval_note"),
        "reviewed_at": expense.get("reviewed_at").isoformat()
        if expense.get("reviewed_at") and hasattr(expense.get("reviewed_at"), "isoformat")
        else expense.get("reviewed_at"),
    }


def team_serializer(team):
    manager = None
    manager_id = team.get("manager_id")
    if manager_id:
        manager_doc = user_collection.find_one({"_id": ObjectId(manager_id)})
        if manager_doc:
            manager = {
                "id": str(manager_doc["_id"]),
                "name": manager_doc.get("name"),
                "email": manager_doc.get("email"),
                "role": manager_doc.get("role"),
            }

    member_ids = team.get("member_ids", [])
    members = []
    if member_ids:
        member_docs = user_collection.find(
            {"_id": {"$in": [ObjectId(user_id) for user_id in member_ids]}},
            {"name": 1, "email": 1, "role": 1},
        )
        members = [
            {
                "id": str(member["_id"]),
                "name": member.get("name"),
                "email": member.get("email"),
                "role": member.get("role"),
            }
            for member in member_docs
        ]

    created_at = team.get("created_at")
    updated_at = team.get("updated_at")

    return {
        "id": str(team["_id"]),
        "name": team["name"],
        "budget_amount": float(team.get("budget_amount", 10000)),
        "budget_month": team.get("budget_month"),
        "manager_id": manager_id,
        "member_ids": member_ids,
        "manager": manager,
        "members": members,
        "created_at": created_at.isoformat() if hasattr(created_at, "isoformat") else created_at,
        "updated_at": updated_at.isoformat() if hasattr(updated_at, "isoformat") else updated_at,
    }
