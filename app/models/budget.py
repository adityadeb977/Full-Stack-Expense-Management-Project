from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


CATEGORIES = {
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Others",
}


class BudgetUpsert(BaseModel):
    month: str = Field(..., pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    amount: float = Field(..., gt=0)
    category: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, value):
        if value is not None and value not in CATEGORIES:
            raise ValueError("Unsupported expense category")
        return value


class BudgetCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: Optional[str] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, value):
        if value is not None and value not in CATEGORIES:
            raise ValueError("Unsupported expense category")
        return value


class BudgetResponse(BaseModel):
    id: str
    user_id: str
    month: str
    amount: float
    category: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
