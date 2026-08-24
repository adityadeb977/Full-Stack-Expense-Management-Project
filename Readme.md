# Expense Management System

An expense management application with a FastAPI backend and React/Vite frontend. Employees can submit and track expenses, managers can review team submissions, and administrators can manage users and expense approvals.

## Features

- Role-based login for employees, managers, and administrators.
- Employee dashboard with sidebar navigation for Welcome, Add Expense, and My Expenses.
- Employee expense search, filters, pagination, editing, deletion, and receipt uploads.
- Manager dashboard with Welcome and Team Expenses views for reviewing submissions.
- Admin dashboard with separate Welcome, Statistics, Employees, and Expenses views.
- Employee search by name, email, or role from the admin Employees section.
- Add Employee modal with validation and employee/manager role selection.
- Admin expense search, filtering, approval, rejection, receipt viewing, OCR support, and deletion.
- JWT-protected API endpoints with role-based access control.

## Project Structure

```text
app/       FastAPI application, routes, services, models, and utilities
frontend/  React/Vite application
```

## Setup
- Open Budget Guardian to set monthly limits and review approved spending insights.
- See month-end spending projections, category breakdowns, and explainable budget alerts.

### Backend

- Employee: Welcome, Insights, Add Expense, My Expenses.
Create and activate a virtual environment, then install the Python dependencies:

```bash

## Budget Guardian

Budget Guardian is a private employee workspace for monthly spending awareness. Employees can save an overall monthly budget and optional category budgets, then inspect approved spending for a selected month.

- Approved expenses count toward budget consumption.
- Pending and rejected amounts are shown separately and do not consume the approved-spending budget.
- The month-end projection uses the current approved daily spending pace multiplied by the number of days in the month.
- Alerts are deterministic and explainable: near budget at 80%, over budget above 100%, projected over budget, and category budgets exceeded.

API endpoints:

- `GET /budgets?month=YYYY-MM` reads the signed-in employee's budgets.
- `PUT /budgets/{month}` saves an overall or category budget with `{ "amount": 25000, "category": null }`.
- `GET /insights?month=YYYY-MM` returns totals, category spending, projection, and alerts.

Budget and insight endpoints are scoped to the authenticated employee and do not expose another user's private budget data.
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Set the required environment variables in `.env`, including the MongoDB connection settings used by the application.

Start the API from the project root:

```bash
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://127.0.0.1:8000`.

### Frontend

Install the frontend dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

The frontend is available at `http://127.0.0.1:5173`.

For a production build:

```bash
npm run build
```

## Admin Risk Radar

Risk Radar is an admin-only review queue that scans existing expense records and prioritizes claims that may need investigation. It flags missing required receipts, pending claims older than seven days, unusually large claims, and repeated title/category/amount combinations from the same employee within seven days.

The scoring is explainable: missing receipts add 30 points, approval delays add 15, large claims add 20, and possible duplicates add 35. Claims are shown as Low, Medium, or High risk and are never automatically approved, rejected, or modified.

Use `GET /admin/risk-radar` to retrieve the summary and flagged claims. The endpoint requires administrator access.
