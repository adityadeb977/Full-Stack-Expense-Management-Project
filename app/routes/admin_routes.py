from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Body, Query
from fastapi.responses import FileResponse

from app.services.admin_service import AdminService
from app.utils.admin import admin_required, approval_required
from app.utils.receipt_storage import receipt_path
from app.services.receipt_ocr import extract_receipt_details
from app.services.risk_radar_service import RiskRadarService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
def get_users(current_user=Depends(admin_required)):

    return AdminService.get_all_users()

@router.delete("/users/{id}")
def delete_user(id: str, current_user=Depends(admin_required)):

    result = AdminService.delete_user(id)

    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")

    return result

@router.patch("/users/{id}/role")
def update_user_role(
    id: str,
    role: str = Body(..., embed=True),
    current_user=Depends(admin_required)
):

    result = AdminService.update_user_role(id, role)

    if not result:
        raise HTTPException(status_code=404, detail="Employee not found or invalid role")

    return result

@router.get("/expenses")
def get_expenses(
    current_user=Depends(approval_required),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    return AdminService.get_all_expenses(
        current_user,
        search=search,
        category=category,
        status=status,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount,
        page=page,
        page_size=page_size,
    )

@router.put("/expenses/{id}/approve")
def approve(id: str, note: str | None = Body(None, embed=True), current_user=Depends(approval_required)):

    result = AdminService.approve_expense(id, current_user, note)

    if result is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    if result == "unauthorized":
        raise HTTPException(status_code=403, detail="Access denied")

    if result == "receipt_required":
        raise HTTPException(status_code=400, detail="A receipt is required to approve expenses of Rs. 1,000 or more")

    return result


@router.put("/expenses/{id}/reject")
def reject(id: str, note: str | None = Body(None, embed=True), current_user=Depends(approval_required)):

    result = AdminService.reject_expense(id, current_user, note)

    if result is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    if result == "unauthorized":
        raise HTTPException(status_code=403, detail="Access denied")

    return result


@router.get("/expenses/{id}/receipt")
def download_receipt(id: str, current_user=Depends(approval_required)):
    expense = AdminService.get_receipt_for_review(id, current_user)
    if expense is None:
        raise HTTPException(404, "Expense not found")
    if expense == "unauthorized":
        raise HTTPException(403, "Access denied")
    path = receipt_path(expense.get("receipt"))
    if not path or not path.is_file():
        raise HTTPException(404, "Receipt not found")
    return FileResponse(path, media_type=expense["receipt"]["content_type"], filename=expense["receipt"]["file_name"])


@router.get("/expenses/{id}/receipt/ocr")
def ocr_receipt(id: str, current_user=Depends(approval_required)):
    expense = AdminService.get_receipt_for_review(id, current_user)
    if expense is None:
        raise HTTPException(404, "Expense not found")
    if expense == "unauthorized":
        raise HTTPException(403, "Access denied")
    path = receipt_path(expense.get("receipt"))
    if not path or not path.is_file():
        raise HTTPException(404, "Receipt not found")
    return extract_receipt_details(path, expense["receipt"]["content_type"])


@router.delete("/expenses/{id}")
def delete_expense(id: str, current_user=Depends(admin_required)):

    result = AdminService.delete_expense(id)

    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")

    return result


@router.get("/registration-requests")
def registration_requests(current_user=Depends(admin_required)):

    return AdminService.get_registration_requests()


@router.put("/registration-requests/{id}/approve")
def approve_registration(id: str, current_user=Depends(admin_required)):

    result = AdminService.approve_registration_request(id)

    if not result:
        raise HTTPException(status_code=404, detail="Registration request not found")

    return result


@router.delete("/registration-requests/{id}")
def reject_registration(id: str, current_user=Depends(admin_required)):

    return AdminService.reject_registration_request(id)


@router.get("/stats")
def get_stats(current_user=Depends(admin_required)):

    return AdminService.get_dashboard_stats(current_user)


@router.get("/risk-radar")
def get_risk_radar(current_user=Depends(admin_required)):
    return RiskRadarService.get_radar()
