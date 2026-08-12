from fastapi import APIRouter, Depends, HTTPException, Body

from app.services.admin_service import AdminService
from app.utils.admin import admin_required, approval_required

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
def get_expenses(current_user=Depends(approval_required)):

    return AdminService.get_all_expenses(current_user)

@router.put("/expenses/{id}/approve")
def approve(id: str, current_user=Depends(approval_required)):

    result = AdminService.approve_expense(id, current_user)

    if result is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    if result == "unauthorized":
        raise HTTPException(status_code=403, detail="Access denied")

    return result


@router.put("/expenses/{id}/reject")
def reject(id: str, current_user=Depends(approval_required)):

    result = AdminService.reject_expense(id, current_user)

    if result is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    if result == "unauthorized":
        raise HTTPException(status_code=403, detail="Access denied")

    return result


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