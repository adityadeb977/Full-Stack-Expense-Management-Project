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

### Backend

Create and activate a virtual environment, then install the Python dependencies:

```bash
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
