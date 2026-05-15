# Taskflow — Team Task Manager

A full-stack collaborative task management web application built with **Node.js + Express**, **PostgreSQL + Prisma**, and **React**. Think of it as a simplified Trello/Asana.

---

## Features

| Feature | Details |
|---|---|
| **Authentication** | JWT-based signup/login with bcrypt password hashing |
| **Projects** | Create, edit, delete projects; Admin auto-assigned on creation |
| **Team members** | Add/remove members per project; role-based visibility |
| **Tasks** | Full CRUD with title, description, priority, status, assignee, due date |
| **Dashboard** | Stats: total tasks, by status, overdue, tasks per user |
| **Role-based access** | Admin: full control · Member: view + update own task status |
| **Kanban board** | Drag-friendly column view alongside list view |
| **Overdue detection** | Real-time — no stored flags, always accurate |

---

## Tech Stack

### Backend
- **Runtime**: Node.js 20 + Express 4
- **Database**: PostgreSQL 16 via **Prisma ORM**
- **Auth**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Validation**: `express-validator`
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Logging**: `morgan`

### Frontend
- **Framework**: React 18 with React Router v6
- **Data fetching**: TanStack Query (React Query v5)
- **HTTP client**: Axios
- **Toast notifications**: react-hot-toast
- **Styling**: Pure CSS custom properties (dark theme)

---

## Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   └── src/
│       ├── app.js                 # Express entry point
│       ├── config/
│       │   └── database.js        # Prisma client singleton
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   ├── taskController.js
│       │   ├── dashboardController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── auth.js            # JWT + role guards
│       │   ├── validate.js        # express-validator helper
│       │   └── errorHandler.js    # Global error handler
│       ├── routes/
│       │   ├── auth.js
│       │   ├── projects.js
│       │   ├── tasks.js
│       │   ├── dashboard.js
│       │   └── users.js
│       └── utils/
│           └── seed.js            # Demo data seeder
└── frontend/
    └── src/
        ├── api/
        │   ├── client.js          # Axios instance + interceptors
        │   └── services.js        # API function library
        ├── context/
        │   └── AuthContext.jsx    # Auth state + JWT management
        ├── components/
        │   ├── layout/Layout.jsx  # Sidebar + outlet wrapper
        │   ├── ui/index.jsx       # Avatar, Badge, Modal, icons…
        │   ├── tasks/
        │   │   ├── TaskModal.jsx  # Create/edit task form
        │   │   └── TaskViews.jsx  # List + Kanban board
        │   └── projects/
        │       ├── ProjectModal.jsx
        │       └── MembersModal.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProjectsPage.jsx
        │   ├── ProjectDetailPage.jsx
        │   ├── MyTasksPage.jsx
        │   └── TeamPage.jsx
        ├── utils/helpers.js
        ├── App.jsx                # Routes + guards
        └── index.js
```

---

## Database Schema

```
users            projects           project_members       tasks
────────────     ────────────────   ─────────────────     ────────────────
id (PK)          id (PK)            project_id (FK) ─┐    id (PK)
name             name               user_id (FK)    ─┤    project_id (FK)
email (UNIQUE)   description        joined_at        │    assignee_id (FK)
password_hash    admin_id (FK) ──►──┤                │    title
role             created_at         └────────────────┘    description
created_at       updated_at                               priority
updated_at                                                status
                                                          due_date
                                                          created_at
                                                          updated_at
```

---

## API Reference

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/auth/signup` | Public | — |
| POST | `/api/auth/login` | Public | — |
| GET | `/api/auth/me` | JWT | Any |
| GET | `/api/projects` | JWT | Any |
| POST | `/api/projects` | JWT | Any |
| GET | `/api/projects/:id` | JWT | Member |
| PUT | `/api/projects/:id` | JWT | Project Admin |
| DELETE | `/api/projects/:id` | JWT | Project Admin |
| POST | `/api/projects/:id/members` | JWT | Project Admin |
| DELETE | `/api/projects/:id/members/:userId` | JWT | Project Admin |
| GET | `/api/projects/:id/tasks` | JWT | Member |
| POST | `/api/projects/:id/tasks` | JWT | Project Admin |
| GET | `/api/tasks/my` | JWT | Any |
| PATCH | `/api/tasks/:id` | JWT | Admin/Assignee |
| DELETE | `/api/tasks/:id` | JWT | Project Admin |
| GET | `/api/dashboard` | JWT | Any |
| GET | `/api/dashboard/my-tasks` | JWT | Any |
| GET | `/api/users` | JWT | Admin |
| GET | `/api/users/:id` | JWT | Any |

---

## Quick Start (without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally

### 1. Clone and install

```bash
git clone <repo-url>
cd taskflow

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow"
JWT_SECRET="pick-a-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 3. Run database migrations + seed

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### 4. Start backend

```bash
npm run dev
# API running at http://localhost:5000
```

### 5. Configure and start frontend

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

npm start
# App running at http://localhost:3000
```

---

## Quick Start (with Docker)

```bash
# Build and start all services (DB + backend + frontend)
docker-compose up --build

# In a separate terminal, run migrations and seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed
```

App: http://localhost:3000  
API: http://localhost:5000/api/health

---

## Demo Accounts

After seeding, these accounts are available (password: `password123`):

| Name | Email | Role |
|------|-------|------|
| Alex Morgan | alex@example.com | **Admin** |
| Sam Rivera | sam@example.com | Member |
| Jordan Lee | jordan@example.com | Member |
| Casey Kim | casey@example.com | Member |

---

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create/edit/delete project | ✅ | ❌ |
| Add/remove project members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Edit any task field | ✅ | ❌ |
| Update status of own task | ✅ | ✅ |
| View project tasks | ✅ | ✅ (own) |
| View all users | ✅ | ❌ |
| View dashboard | ✅ (all) | ✅ (own) |

---

## Security Highlights

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWTs signed with **HS256**, expire in 7 days
- **Rate limiting** on auth routes (20 req / 15 min)
- **Helmet** sets secure HTTP headers
- Input validation on every route with **express-validator**
- Prisma parameterised queries prevent **SQL injection**
- 404 returned for both "not found" and "no permission" to prevent data leakage

---

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Signing secret for JWTs | Required |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `/api` (proxy) |
