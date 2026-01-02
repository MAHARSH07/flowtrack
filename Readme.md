# FlowTrack – Enterprise Task & Workflow Management System

FlowTrack is an enterprise-style task and workflow management system inspired by internal company task management tools. 
It demonstrates secure task handling, role-based workflows, backend-powered filtering, search, and pagination.

---

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
  - ADMIN
  - MANAGER
  - EMPLOYEE

---

### Task Management
- Create tasks (ADMIN / MANAGER)
- Assign and reassign tasks to employees
- Update task status
- View tasks based on user role

---

### Workflow Rules
- Status lifecycle:
  - TODO → IN_PROGRESS → DONE
- Employees:
  - Can update only their assigned tasks
  - Must follow valid status transitions
- Admins / Managers:
  - Can override workflow rules
  - Can reassign tasks

---

### Backend-Powered Filters
- Filter by task status
- Filter by assignment:
  - Assigned to me
  - Unassigned (ADMIN / MANAGER only)
- Filters enforced securely in backend

---

### Task Search
- Search tasks by title or description
- Fully backend-powered
- RBAC-safe (no data leaks)

---

### Pagination
- Implemented using backend query parameters (page, limit)
- Page & limit based pagination
- Works with filters and search
- Designed to scale with large datasets

---

### Frontend UI
- React dashboard
- Role-aware UI components
- Task cards with status badges
- Assignment dropdown
- Pagination controls

---

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT Authentication
- Pydantic

### Frontend
- React
- TypeScript
- Vite
- Axios
- React Router

---

## Architecture Overview

Frontend (React)
↓ JWT REST APIs
Backend (FastAPI)
↓ SQLAlchemy ORM
PostgreSQL


- Backend enforces RBAC and workflow rules  
- Frontend remains thin and secure  
- No business logic duplication


---

## Roles & Permissions

| Role      | Create Task | Assign Task | Reassign | Update Status | View Unassigned |
|-----------|-------------|-------------|----------|---------------|-----------------|
| ADMIN     | Yes         | Yes         | Yes      | Yes           | Yes             |
| MANAGER   | Yes         | Yes         | Yes      | Yes           | Yes             |
| EMPLOYEE  | No          | No          | No       | Own tasks     | No              |

---

## API Examples

Get tasks with filters:
GET /tasks?status=IN_PROGRESS&assigned=me

Search tasks:
GET /tasks?q=login

Paginated tasks:
GET /tasks?page=2&limit=10


## Running Locally

### Backend

```bash
cd app
python -m venv venv

# Activate virtual environment
# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

```

### Frontend

```bash
cd frontend
npm install
npm run dev
```


## Why This Project

This project demonstrates:
- Secure role-based access control
- Backend-enforced workflows
- Scalable filtering, search, and pagination
- Clean frontend-backend separation
- Real-world API design patterns

---


## Project Status

- Core features complete
- Architecture finalized
- Resume ready

---

## Deployment

FlowTrack is deployed using free-tier cloud services with a clear separation between frontend, backend, and database.

---

### Backend Deployment

- **Platform:** Render
- **Framework:** FastAPI
- **Runtime:** Python
- **Process Manager:** Uvicorn
- **Migrations:** Alembic (auto-run on startup)

**Backend URL**
https://flowtrack-q8u6.onrender.com

**Health Check**

GET /health

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Deployment Notes

- Environment variables are configured in Render dashboard
- Alembic migrations are triggered automatically using RUN_MIGRATIONS=true
- CORS is configured to allow frontend access

### Database Deployment

- Database: PostgreSQL
- Provider: Aiven (free tier)
- Connection: SSL-enabled

### Frontend Deployment

- Platform: Vercel
- Framework: React (Vite)
- Build Tool: Vite
  
**Frontend URL**
https://flowtrack-orcin.vercel.app

**Frontend Environment Variable**
VITE_API_URL=https://flowtrack-q8u6.onrender.com

API Communication: Axios

---

## Future Enhancements
- Audit logs
- Notifications
- Activity timeline
- Dockerization
- CI/CD pipeline

---

## Author

Maharsh G R
