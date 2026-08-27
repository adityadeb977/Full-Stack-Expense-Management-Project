import re
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from fastapi.responses import FileResponse

from app.models.expense import Expense
from app.services.expense_service import ExpenseService
from app.utils.dependencies import get_current_user
from app.utils.receipt_storage import save_receipt, receipt_path, remove_receipt
from app.services.receipt_ocr import extract_receipt_details
from app.models.budget import BudgetCreate
from app.services.budget_service import BudgetService, CURRENT_MONTH
from app.services.team_service import TeamService

router = APIRouter()


@router.get("/budgets")
def get_budgets(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    current_user=Depends(get_current_user),
):
    return BudgetService.list_budgets(current_user, month)


@router.put("/budgets/{month}")
def upsert_budget(
    month: str,
    budget: BudgetCreate,
    current_user=Depends(get_current_user),
):
    if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", month):
        raise HTTPException(status_code=422, detail="Month must use YYYY-MM format")
    return BudgetService.upsert_budget(
        budget.model_copy(update={"month": month}), current_user
    )


@router.get("/insights")
def get_insights(
    month: str = Query(CURRENT_MONTH, pattern=r"^\d{4}-(0[1-9]|1[0-2])$"),
    current_user=Depends(get_current_user),
):
    return BudgetService.get_insights(current_user, month)


@router.get("/team")
def get_team_summary(current_user=Depends(get_current_user)):
    return TeamService.get_user_team_summary(current_user)


@router.post("/expenses")
def create(expense: Expense, current_user=Depends(get_current_user)):
    return ExpenseService.add_expense(expense, current_user)


@router.get("/expenses")
def get_expenses(
    current_user=Depends(get_current_user),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    return ExpenseService.get_all_expenses(
        current_user,
        category=category,
        status=status,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount,
        page=page,
        page_size=page_size,
    )


@router.get("/expenses/{id}")
def get_one(id: str, current_user=Depends(get_current_user)):

    expense = ExpenseService.get_expense_by_id(id, current_user)

    if expense is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    if expense == "unauthorized":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return expense


@router.put("/expenses/{id}")
def update(
    id: str,
    expense: Expense,
    current_user=Depends(get_current_user)
):

    result = ExpenseService.update(
        id,
        expense,
        current_user
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    if result == "unauthorized":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    if result == "cannot_edit":
        raise HTTPException(
            status_code=400,
            detail="Only pending expenses can be edited"
        )

    return result


@router.delete("/expenses/{id}")
def delete(
    id: str,
    current_user=Depends(get_current_user)
):

    result = ExpenseService.delete_expense_by_id(
        id,
        current_user
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    if result == "unauthorized":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    if result == "cannot_delete":
        raise HTTPException(
            status_code=400,
            detail="Only pending expenses can be deleted"
        )

    return result


@router.post("/expenses/{id}/receipt")
async def upload_receipt(id: str, file: UploadFile = File(...), current_user=Depends(get_current_user)):
    receipt = await save_receipt(file)
    result = ExpenseService.attach_receipt(id, receipt, current_user)
    if result is None:
        remove_receipt(receipt)
        raise HTTPException(404, "Expense not found")
    if result == "unauthorized":
        remove_receipt(receipt)
        raise HTTPException(403, "Access denied")
    if result == "cannot_edit":
        remove_receipt(receipt)
        raise HTTPException(400, "Only pending expenses can be updated")
    return result


@router.get("/expenses/{id}/receipt")
def download_receipt(id: str, current_user=Depends(get_current_user)):
    expense = ExpenseService.get_expense_by_id(id, current_user)
    if expense is None:
        raise HTTPException(404, "Expense not found")
    if expense == "unauthorized":
        raise HTTPException(403, "Access denied")
    path = receipt_path(expense.get("receipt"))
    if not path or not path.is_file():
        raise HTTPException(404, "Receipt not found")
    return FileResponse(path, media_type=expense["receipt"]["content_type"], filename=expense["receipt"]["file_name"])


@router.get("/expenses/{id}/receipt/ocr")
def ocr_receipt(id: str, current_user=Depends(get_current_user)):
    expense = ExpenseService.get_expense_by_id(id, current_user)
    if expense is None:
        raise HTTPException(404, "Expense not found")
    if expense == "unauthorized":
        raise HTTPException(403, "Access denied")
    path = receipt_path(expense.get("receipt"))
    if not path or not path.is_file():
        raise HTTPException(404, "Receipt not found")
    return extract_receipt_details(path, expense["receipt"]["content_type"])
