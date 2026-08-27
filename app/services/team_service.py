from datetime import datetime, timezone
import re

from bson import ObjectId

from app.database.connection import expense_collection, team_collection, user_collection
from app.utils.helper import team_serializer

TEAM_BUDGET_AMOUNT = 10000


def _current_month():
    return datetime.now(timezone.utc).strftime("%Y-%m")


def _month_bounds(month):
    year, month_number = (int(part) for part in month.split("-"))
    start = datetime(year, month_number, 1, tzinfo=timezone.utc)
    if month_number == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month_number + 1, 1, tzinfo=timezone.utc)
    return start, end


class TeamService:

    @staticmethod
    def list_team_budgets():
        team_budgets = []
        for team in team_collection.find().sort("name", 1):
            budget_month = team.get("budget_month") or _current_month()
            start, end = _month_bounds(budget_month)
            user_ids = set(team.get("member_ids", []))
            if team.get("manager_id"):
                user_ids.add(team["manager_id"])

            approved_spending = sum(
                float(expense.get("amount", 0) or 0)
                for expense in expense_collection.find({
                    "user_id": {"$in": list(user_ids)},
                    "status": "Approved",
                    "created_at": {"$gte": start, "$lt": end},
                })
            )
            budget_amount = float(team.get("budget_amount", TEAM_BUDGET_AMOUNT))
            team_budgets.append({
                "id": str(team["_id"]),
                "name": team["name"],
                "budget_month": budget_month,
                "budget_amount": round(budget_amount, 2),
                "approved_spending": round(approved_spending, 2),
                "remaining": round(budget_amount - approved_spending, 2),
            })

        return team_budgets

    @staticmethod
    def get_user_team_summary(current_user):
        team_id = current_user.get("team_id")
        if not team_id:
            return {"assigned": False}

        try:
            team = team_collection.find_one({"_id": ObjectId(team_id)})
        except Exception:
            team = None

        if not team:
            return {"assigned": False}

        budget_month = team.get("budget_month") or _current_month()
        start, end = _month_bounds(budget_month)
        user_ids = set(team.get("member_ids", []))
        if team.get("manager_id"):
            user_ids.add(team["manager_id"])

        approved_spending = sum(
            float(expense.get("amount", 0) or 0)
            for expense in expense_collection.find({
                "user_id": {"$in": list(user_ids)},
                "status": "Approved",
                "created_at": {"$gte": start, "$lt": end},
            })
        )
        budget_amount = float(team.get("budget_amount", 10000))

        return {
            "assigned": True,
            "team": {"id": str(team["_id"]), "name": team["name"]},
            "budget_month": budget_month,
            "budget_amount": round(budget_amount, 2),
            "approved_spending": round(approved_spending, 2),
            "remaining": round(budget_amount - approved_spending, 2),
        }

    @staticmethod
    def list_teams():
        teams = []
        for team in team_collection.find().sort("name", 1):
            teams.append(team_serializer(team))
        return teams

    @staticmethod
    def create_team(team_data):
        name = team_data.name.strip()

        if not name:
            return "invalid_name"

        existing = team_collection.find_one({
            "name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}
        })

        if existing:
            return "already_exists"

        now = datetime.now(timezone.utc)
        document = {
            "name": name,
            "budget_amount": TEAM_BUDGET_AMOUNT,
            "budget_month": _current_month(),
            "manager_id": None,
            "member_ids": [],
            "created_at": now,
            "updated_at": now,
        }
        result = team_collection.insert_one(document)
        return team_serializer(team_collection.find_one({"_id": result.inserted_id}))

    @staticmethod
    def _remove_user_from_all_teams(user_id, exclude_team_id=None):
        query = {
            "$or": [
                {"manager_id": user_id},
                {"member_ids": user_id},
            ]
        }
        if exclude_team_id:
            query["_id"] = {"$ne": ObjectId(exclude_team_id)}

        for team in team_collection.find(query):
            updates = {
                "$pull": {"member_ids": user_id},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            }
            if team.get("manager_id") == user_id:
                updates["$set"]["manager_id"] = None
                user_collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"role": "user"}},
                )

            team_collection.update_one({"_id": team["_id"]}, updates)

    @staticmethod
    def assign_manager(team_id, user_id):
        team = team_collection.find_one({"_id": ObjectId(team_id)})
        if not team:
            return "team_not_found"

        user = user_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return "user_not_found"

        if user.get("role") == "admin":
            return "invalid_user_role"

        TeamService._remove_user_from_all_teams(user_id, exclude_team_id=team_id)

        previous_manager_id = team.get("manager_id")
        now = datetime.now(timezone.utc)

        update_doc = {
            "$pull": {"member_ids": user_id},
            "$set": {
                "manager_id": user_id,
                "updated_at": now,
            },
        }
        team_collection.update_one({"_id": ObjectId(team_id)}, update_doc)

        user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": "manager", "team_id": team_id}},
        )

        if previous_manager_id and previous_manager_id != user_id:
            user_collection.update_one(
                {"_id": ObjectId(previous_manager_id)},
                {"$set": {"role": "user", "team_id": None}},
            )

        return team_serializer(team_collection.find_one({"_id": ObjectId(team_id)}))

    @staticmethod
    def assign_member(team_id, user_id):
        team = team_collection.find_one({"_id": ObjectId(team_id)})
        if not team:
            return "team_not_found"

        user = user_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return "user_not_found"

        if user.get("role") == "admin":
            return "invalid_user_role"

        if user.get("role") != "user":
            return "invalid_user_role"

        if team.get("manager_id") == user_id:
            return "manager_conflict"

        TeamService._remove_user_from_all_teams(user_id, exclude_team_id=team_id)

        team_collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$addToSet": {"member_ids": user_id},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )

        user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"team_id": team_id}},
        )

        return team_serializer(team_collection.find_one({"_id": ObjectId(team_id)}))

    @staticmethod
    def remove_member(team_id, user_id):
        team = team_collection.find_one({"_id": ObjectId(team_id)})
        if not team:
            return "team_not_found"

        team_collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$pull": {"member_ids": user_id},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )

        user_collection.update_one(
            {"_id": ObjectId(user_id), "team_id": team_id},
            {"$set": {"team_id": None}},
        )

        return team_serializer(team_collection.find_one({"_id": ObjectId(team_id)}))

    @staticmethod
    def remove_manager(team_id):
        team = team_collection.find_one({"_id": ObjectId(team_id)})
        if not team:
            return "team_not_found"

        manager_id = team.get("manager_id")

        team_collection.update_one(
            {"_id": ObjectId(team_id)},
            {
                "$set": {
                    "manager_id": None,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        if manager_id:
            user_collection.update_one(
                {"_id": ObjectId(manager_id), "team_id": team_id},
                {"$set": {"role": "user", "team_id": None}},
            )

        return team_serializer(team_collection.find_one({"_id": ObjectId(team_id)}))

    @staticmethod
    def delete_team(team_id):
        team = team_collection.find_one({"_id": ObjectId(team_id)})
        if not team:
            return None

        manager_id = team.get("manager_id")
        member_ids = team.get("member_ids", [])

        if manager_id:
            user_collection.update_one(
                {"_id": ObjectId(manager_id), "team_id": team_id},
                {"$set": {"role": "user", "team_id": None}},
            )

        if member_ids:
            user_collection.update_many(
                {
                    "_id": {"$in": [ObjectId(user_id) for user_id in member_ids]},
                    "team_id": team_id,
                },
                {"$set": {"team_id": None}},
            )

        team_collection.delete_one({"_id": ObjectId(team_id)})
        return {"message": "Team deleted successfully"}
