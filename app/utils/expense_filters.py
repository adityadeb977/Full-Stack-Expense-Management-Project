from datetime import datetime, timezone

from bson import ObjectId

from app.database.connection import user_collection


def _parse_date(value: str, end_of_day: bool = False):
    try:
        parsed = datetime.strptime(value, "%Y-%m-%d")
        if end_of_day:
            parsed = parsed.replace(hour=23, minute=59, second=59)
        return parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def build_expense_query(
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
    admin_list=False,
):
    query = {}

    if not admin_list:
        query["user_id"] = str(current_user["_id"])
    elif current_user["role"] == "manager":
        manager_team_id = current_user.get("team_id")
        if not manager_team_id:
            query["user_id"] = {"$in": []}
            return query

        employee_ids = [
            str(user["_id"])
            for user in user_collection.find(
                {"role": "user", "team_id": manager_team_id},
                {"_id": 1},
            )
        ]
        query["user_id"] = {"$in": employee_ids}

    if user_id:
        query["user_id"] = user_id

    if search and admin_list:
        matching_users = user_collection.find(
            {"name": {"$regex": search, "$options": "i"}},
            {"_id": 1},
        )
        matching_user_ids = [str(user["_id"]) for user in matching_users]
        if not matching_user_ids:
            query["user_id"] = {"$in": []}
        elif "user_id" in query:
            if isinstance(query["user_id"], dict) and "$in" in query["user_id"]:
                query["user_id"]["$in"] = [
                    uid for uid in query["user_id"]["$in"] if uid in matching_user_ids
                ]
            elif query["user_id"] in matching_user_ids:
                pass
            else:
                query["user_id"] = {"$in": []}
        else:
            query["user_id"] = {"$in": matching_user_ids}

    if category:
        query["category"] = category

    if status:
        query["status"] = status

    if min_amount is not None or max_amount is not None:
        amount_filter = {}
        if min_amount is not None:
            amount_filter["$gte"] = min_amount
        if max_amount is not None:
            amount_filter["$lte"] = max_amount
        query["amount"] = amount_filter

    if date_from or date_to:
        date_filter = {}
        parsed_from = _parse_date(date_from) if date_from else None
        parsed_to = _parse_date(date_to, end_of_day=True) if date_to else None
        if parsed_from:
            date_filter["$gte"] = parsed_from
        if parsed_to:
            date_filter["$lte"] = parsed_to
        if date_filter:
            query["created_at"] = date_filter

    return query


def enrich_expense_with_user(expense, include_user_name=False):
    from app.utils.helper import expense_serializer

    expense_data = expense_serializer(expense)

    if include_user_name:
        user = user_collection.find_one({"_id": ObjectId(expense["user_id"])})
        expense_data["user_name"] = user["name"] if user else "Unknown"

    return expense_data
