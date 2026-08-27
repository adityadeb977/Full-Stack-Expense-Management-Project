from pydantic import BaseModel, Field


class TeamCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)


class TeamAssignManager(BaseModel):
    user_id: str


class TeamResponse(BaseModel):
    id: str
    name: str
    budget_amount: float
    budget_month: str
    manager_id: str | None = None
    member_ids: list[str] = Field(default_factory=list)
