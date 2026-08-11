from pydantic import BaseModel

class Expense(BaseModel):
    title: str
    amount: float
    category: str
    
    