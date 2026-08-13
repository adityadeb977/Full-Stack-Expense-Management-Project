# Expense Management System

A full-stack expense management application for employees, managers, and administrators. Employees submit claims, reviewers approve or reject them, and administrators manage people and records.

## Features

- Secure login with role-based access for users, managers, and admins.
- Registration requests that administrators can approve or reject.
- Create, edit, delete, and view personal expense claims.
- Expense categories, amounts, timestamps, and Pending / Approved / Rejected statuses.
- Pagination and filters for category, status, date range, amount range, and employee name.
- Manager review workflow for employee expenses.
- Admin dashboard for users, roles, registration requests, and all expenses.
- Summary cards for total, pending, approved, and rejected spending.
- Receipt upload for JPEG, PNG, and PDF files (up to 10 MB).
- Secure receipt viewing for claim owners and authorized reviewers.
- Receipt requirement for claims of ₹1,000 or more before approval.
- Approval and rejection notes, retained with the claim for auditability.
- Optional OCR endpoint that can suggest an amount from an uploaded receipt image.

## Tech stack

- Backend: FastAPI, PyMongo, Pydantic
- Database: MongoDB
- Frontend: React, Vite, Tailwind CSS, Axios

## Prerequisites

Install the following before starting:

- Python 3.10 or newer
- Node.js 18 or newer
- MongoDB, either locally or through MongoDB Atlas

## Setup and start

1. Clone the repository and open it in a terminal.

2. Create and activate a Python virtual environment:

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install backend dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root and add your MongoDB connection string:

   ```env
   MONGO_URI=mongodb://localhost:27017
   ```

5. Start the backend from the project root:

   ```powershell
   uvicorn app.main:app --reload
   ```

   The API runs at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

6. In a second terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

7. Open the URL printed by Vite, normally `http://localhost:5173`.

## Receipt and OCR setup

- Receipts are stored locally in `app/uploads/receipts` by default. Set `RECEIPT_UPLOAD_DIR` in `.env` to use another location.
- OCR is optional and supports receipt images (JPEG and PNG). Install Tesseract OCR and ensure its executable is available on the server `PATH`; then restart the backend.
- If OCR is not configured, all upload, viewing, approval-policy, and review-note features continue to work normally.

## Main API groups

- `POST /register`, `POST /login` — account registration and sign-in.
- `/expenses` — employee expense claims and receipt upload/viewing.
- `/admin/expenses` — review, approve, reject, and access team receipts.
- `/admin/users` — user and role management.
- `/admin/registration-requests` — registration request management.
- `/admin/stats` — dashboard totals.

## Roles

- **User:** manages personal claims and receipts.
- **Manager:** reviews claims submitted by users.
- **Admin:** manages users and registration requests, reviews all claims, and accesses reporting.
