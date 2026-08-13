def user_serializer(user):

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
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
