from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query

from app.models.expense import Expense
from app.services.expense_service import ExpenseService
from app.utils.dependencies import get_current_user

router = APIRouter()


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