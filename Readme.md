# Expense Management System

Expense Management System is a role-based expense tracking application. Employees can submit and monitor expenses, managers can review team claims, and administrators can manage users, approvals, and workspace activity.

The project contains:

- A FastAPI backend with MongoDB persistence.
- A React and Vite frontend styled with Tailwind CSS.
- JWT authentication and role-based access control.
- Receipt upload, download, and OCR support.

## Roles and Capabilities

### Employee

- Register as an employee.
- Log in securely and access a role-specific dashboard.
- Use sidebar navigation for Welcome, Add Expense, and My Expenses.
- Create expenses with a title, amount, category, and receipt.
- Search and filter expenses by category, status, date range, and amount range.
- View paginated expense results and expense details.
- Edit or delete pending expenses.
- View receipts and request receipt OCR details.

### Manager

- Log in to a manager-specific workspace.
- Use sidebar navigation for Welcome and Team Expenses.
- Search, filter, and paginate team expense submissions.
- Approve or reject pending expenses with an optional review note.
- View submitted receipts and receipt OCR details.
- Approvals for expenses of Rs. 1,000 or more require a receipt.

### Administrator

- Use a separate admin dashboard with Welcome, Statistics, Employees, and Expenses views.
- View workspace statistics including users, managers, expense counts, and amounts by status.
- Search employees by name, email, or role.
- Add employees or managers through a validated modal form.
- Promote employees to managers or demote managers to employees.
- Delete users and expenses.
- Search and filter all expense submissions.
- Approve, reject, and review expenses and receipts.
- Review, approve, or reject registration requests through the admin API.

## Dashboard UI

All authenticated workspaces use focused sidebar navigation so related workflows are kept in separate views instead of being displayed on one long page.

- Employee: Welcome, Add Expense, My Expenses.
- Manager: Welcome, Team Expenses.
- Admin: Welcome, Statistics, Employees, Expenses.
- Responsive navigation changes to a horizontal menu on smaller screens.
- The admin Add Employee form opens in a modal with backdrop, Escape-key, and click-outside dismissal.

## Project Structure

```text
.
├── app/
│   ├── database/       MongoDB connection setup
│   ├── models/         Request and domain models
│   ├── routes/         Authentication, user, expense, and admin routes
│   ├── services/       Business logic and receipt OCR
│   └── utils/          Authentication, authorization, filters, and storage helpers
├── frontend/
│   ├── src/components/ Reusable forms, tables, filters, navigation, and services
│   ├── src/pages/      Login, registration, employee/manager, and admin pages
│   └── package.json     Frontend scripts and dependencies
├── requirements.txt
└── Readme.md
```



### Backend

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
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```cmd
venv\Scripts\activate
```

macOS or Linux:

```bash
source venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 2. Set up the frontend

```bash
cd frontend
npm install
```

## Running the Project

Start MongoDB first, then run the backend and frontend in separate terminals.

### Backend

From the project root:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend URLs:

- API: `http://127.0.0.1:8000`
- Swagger documentation: `http://127.0.0.1:8000/docs`
- ReDoc documentation: `http://127.0.0.1:8000/redoc`

### Frontend

From the `frontend` directory:

```bash
npm run dev
```

Open `http://127.0.0.1:5173` in a browser. The frontend API client is configured to use `http://127.0.0.1:8000`.

## Useful Commands

Run these commands from the `frontend` directory:

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint checks
```

## Main API Areas

| Area | Endpoints | Purpose |
| --- | --- | --- |
| Authentication | `POST /login`, `POST /register` | Log in and submit registration requests |
| Users | `GET /users`, `POST /users` | Read users and create employees |
| Expenses | `/expenses` | Create, read, update, delete, filter, and paginate expenses |
| Receipts | `/expenses/{id}/receipt` | Upload and download expense receipts |
| OCR | `/expenses/{id}/receipt/ocr` | Extract available receipt details |
| Admin users | `/admin/users` | Manage users and roles |
| Admin expenses | `/admin/expenses` | Review, approve, reject, filter, and delete expenses |
| Admin statistics | `GET /admin/stats` | Retrieve dashboard statistics |
| Registration requests | `/admin/registration-requests` | Approve or reject employee registration requests |

## Authentication and Authorization

After login, the frontend stores the access token and role information in browser local storage. Axios attaches the token to API requests using the `Authorization: Bearer <token>` header.

The backend protects routes according to role:

- Authenticated users can manage their own expenses.
- Managers and administrators can review expense submissions.
- Administrators can manage users, roles, registration requests, and workspace statistics.

## Receipt and OCR Notes

Receipts support JPEG, PNG, and PDF files. Receipt files are stored by the backend and can be viewed from the expense tables. OCR availability depends on the installed OCR tooling and the quality/type of the uploaded receipt.

## Development Notes

- Keep the backend running on port `8000` and the Vite frontend on port `5173` unless the API client and CORS settings are updated accordingly.
- Do not commit `.env`, credentials, uploaded receipts, or generated cache files.
- Use the Swagger UI at `/docs` to inspect and manually exercise API endpoints.
