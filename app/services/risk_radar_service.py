from collections import defaultdict
from datetime import datetime, timedelta, timezone

from app.database.connection import expense_collection, user_collection
from app.utils.helper import expense_serializer


RECEIPT_REQUIRED_AMOUNT = 1000
LARGE_EXPENSE_AMOUNT = 50000
STALE_PENDING_DAYS = 7
DUPLICATE_WINDOW_DAYS = 7


def _as_utc(value):
    if not value:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _risk_level(score):
    if score >= 60:
        return "High"
    if score >= 30:
        return "Medium"
    return "Low"


class RiskRadarService:
    @staticmethod
    def get_radar():
        now = datetime.now(timezone.utc)
        stale_before = now - timedelta(days=STALE_PENDING_DAYS)
        duplicate_before = now - timedelta(days=DUPLICATE_WINDOW_DAYS)
        expenses = list(expense_collection.find().sort("created_at", -1))
        users = {
            str(user["_id"]): user.get("name", "Unknown")
            for user in user_collection.find({}, {"name": 1})
        }

        duplicate_keys = defaultdict(list)
        for expense in expenses:
            created_at = _as_utc(expense.get("created_at"))
            if created_at and created_at >= duplicate_before:
                key = (
                    expense.get("user_id"),
                    round(float(expense.get("amount", 0) or 0), 2),
                    expense.get("category", ""),
                    expense.get("title", "").strip().lower(),
                )
                duplicate_keys[key].append(expense)

        flagged = []
        counts = {"high": 0, "medium": 0, "low": 0}
        for expense in expenses:
            amount = float(expense.get("amount", 0) or 0)
            created_at = _as_utc(expense.get("created_at"))
            flags = []
            score = 0

            if expense.get("status") == "Pending" and amount >= RECEIPT_REQUIRED_AMOUNT and not expense.get("receipt"):
                flags.append({"code": "missing_receipt", "label": "Missing required receipt", "points": 30})
                score += 30
            if expense.get("status") == "Pending" and created_at and created_at < stale_before:
                age_days = (now - created_at).days
                flags.append({"code": "approval_delay", "label": f"Pending for {age_days} days", "points": 15})
                score += 15
            if amount >= LARGE_EXPENSE_AMOUNT:
                flags.append({"code": "large_amount", "label": "Unusually large claim", "points": 20})
                score += 20

            key = (
                expense.get("user_id"),
                round(amount, 2),
                expense.get("category", ""),
                expense.get("title", "").strip().lower(),
            )
            matches = duplicate_keys.get(key, [])
            if len(matches) > 1:
                flags.append({"code": "possible_duplicate", "label": "Possible duplicate claim", "points": 35})
                score += 35

            if not flags:
                continue

            level = _risk_level(score)
            counts[level.lower()] += 1
            item = expense_serializer(expense)
            item.update({
                "user_name": users.get(expense.get("user_id"), "Unknown"),
                "risk_score": score,
                "risk_level": level,
                "risk_flags": flags,
            })
            flagged.append(item)

        flagged.sort(key=lambda item: (-item["risk_score"], item.get("created_at") or ""))
        return {
            "summary": {
                "flagged_expenses": len(flagged),
                "high_risk": counts["high"],
                "medium_risk": counts["medium"],
                "low_risk": counts["low"],
                "scanned_expenses": len(expenses),
            },
            "items": flagged,
        }
