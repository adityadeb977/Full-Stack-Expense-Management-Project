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

    return {
        "id": str(expense["_id"]),
        "title": expense["title"],
        "amount": expense["amount"],
        "category": expense["category"],
        "user_id": expense["user_id"],
        "status": expense["status"]
    }