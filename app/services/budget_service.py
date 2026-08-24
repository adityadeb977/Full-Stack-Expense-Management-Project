import calendar
from datetime import datetime, timezone

from app.database.connection import budget_collection, expense_collection
from app.models.budget import BudgetUpsert


CURRENT_MONTH = datetime.now(timezone.utc).strftime("%Y-%m")


def _month_bounds(month):
    year, month_number = (int(part) for part in month.split("-"))
    start = datetime(year, month_number, 1, tzinfo=timezone.utc)
    if month_number == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month_number + 1, 1, tzinfo=timezone.utc)
    return start, end


def _budget_serializer(budget):
    return {
        "id": str(budget["_id"]),
        "user_id": budget["user_id"],
        "month": budget["month"],
        "amount": float(budget["amount"]),
        "category": budget.get("category"),
        "created_at": budget.get("created_at").isoformat()
        if hasattr(budget.get("created_at"), "isoformat")
        else budget.get("created_at"),
        "updated_at": budget.get("updated_at").isoformat()
        if hasattr(budget.get("updated_at"), "isoformat")
        else budget.get("updated_at"),
    }


class BudgetService:
    @staticmethod
    def list_budgets(current_user, month=None):
        query = {"user_id": str(current_user["_id"])}
        if month:
            query["month"] = month
        return [_budget_serializer(item) for item in budget_collection.find(query).sort("category", 1)]

    @staticmethod
    def upsert_budget(budget: BudgetUpsert, current_user):
        now = datetime.now(timezone.utc)
        user_id = str(current_user["_id"])
        query = {
            "user_id": user_id,
            "month": budget.month,
            "category": budget.category,
        }
        budget_collection.update_one(
            query,
            {
                "$set": {
                    "amount": budget.amount,
                    "updated_at": now,
                },
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
        return _budget_serializer(budget_collection.find_one(query))

    @staticmethod
    def get_insights(current_user, month= CURRENT_MONTH):
        start, end = _month_bounds(month)
        user_id = str(current_user["_id"])
        expenses = list(expense_collection.find({
            "user_id": user_id,
            "created_at": {"$gte": start, "$lt": end},
        }))

        approved_total = 0.0
        pending_total = 0.0
        rejected_total = 0.0
        category_totals = {}
        for expense in expenses:
            amount = float(expense.get("amount", 0) or 0)
            status = expense.get("status")
            if status == "Approved":
                approved_total += amount
                category = expense.get("category", "Others")
                category_totals[category] = category_totals.get(category, 0.0) + amount
            elif status == "Pending":
                pending_total += amount
            elif status == "Rejected":
                rejected_total += amount

        budgets = list(budget_collection.find({"user_id": user_id, "month": month}))
        overall_budget = next((item for item in budgets if item.get("category") is None), None)
        category_budgets = {
            item["category"]: float(item["amount"])
            for item in budgets
            if item.get("category")
        }
        budget_amount = float(overall_budget["amount"]) if overall_budget else None
        now = datetime.now(timezone.utc)
        elapsed_days = max(1, min((now.date() - start.date()).days + 1, (end - start).days)) if month == now.strftime("%Y-%m") else (end - start).days
        days_in_month = (end - start).days
        projection = approved_total / elapsed_days * days_in_month if approved_total else 0.0

        alerts = []
        if budget_amount is not None:
            if approved_total > budget_amount:
                alerts.append({"type": "over_budget", "severity": "high", "message": f"Approved spending is Rs. {approved_total:.2f}, above your Rs. {budget_amount:.2f} budget."})
            elif approved_total >= budget_amount * 0.8:
                alerts.append({"type": "near_budget", "severity": "medium", "message": f"You have used {approved_total / budget_amount * 100:.0f}% of your monthly budget."})
            if projection > budget_amount and approved_total <= budget_amount:
                alerts.append({"type": "projected_over_budget", "severity": "medium", "message": f"Current spending pace projects Rs. {projection:.2f} by month end."})

        for category, category_budget in category_budgets.items():
            spent = category_totals.get(category, 0.0)
            if spent > category_budget:
                alerts.append({"type": "category_over_budget", "severity": "high", "category": category, "message": f"{category} spending is Rs. {spent:.2f}, above its Rs. {category_budget:.2f} budget."})

        return {
            "month": month,
            "budget": budget_amount,
            "approved_total": round(approved_total, 2),
            "pending_total": round(pending_total, 2),
            "rejected_total": round(rejected_total, 2),
            "remaining": round(budget_amount - approved_total, 2) if budget_amount is not None else None,
            "projected_total": round(projection, 2),
            "days_elapsed": elapsed_days,
            "days_in_month": days_in_month,
            "categories": [
                {
                    "name": category,
                    "spent": round(spent, 2),
                    "budget": category_budgets.get(category),
                }
                for category, spent in sorted(category_totals.items(), key=lambda item: item[1], reverse=True)
            ],
            "alerts": alerts,
        }
