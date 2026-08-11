from fastapi import APIRouter, Depends, HTTPException

from app.services.admin_service import AdminService
from app.utils.admin import admin_required

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
def get_users(current_user=Depends(admin_required)):

    return AdminService.get_all_users()

@router.delete("/users/{id}")
def delete_user(id: str, current_user=Depends(admin_required)):

    result = AdminService.delete_user(id)

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    return result

@router.get("/expenses")
def get_expenses(current_user=Depends(admin_required)):

    return AdminService.get_all_expenses()

@router.put("/expenses/{id}/approve")
def approve(id:str,current_user=Depends(admin_required)):

    return AdminService.approve_expense(id)


@router.put("/expenses/{id}/reject")
def reject(id:str,current_user=Depends(admin_required)):

    return AdminService.reject_expense(id)


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