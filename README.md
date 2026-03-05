# TalentFlow - HR Analytics Dashboard

A full-stack HR Analytics platform where managers explore employee data, visualize org structures, track performance reviews, and generate reports — built with Angular 19, GraphQL, and PostgreSQL.

**Live Demo:** [talentflow-c04b3.web.app](https://talentflow-c04b3.web.app)
**API:** [talentflow-api on Cloud Run](https://talentflow-api-orhwxm5nra-uc.a.run.app/health)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19 (standalone components, signals) |
| UI Library | Angular Material 19 (M3 theming) |
| Charts | Apache ECharts (ngx-echarts) |
| Org Chart | d3-org-chart + D3.js |
| API Client | Apollo Angular |
| Backend | Express + Apollo Server 4 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 (Neon serverless) |
| Auth | Dev-mode token auth (Base64 JWT) |
| Monorepo | Nx 20 |
| CI/CD | GitHub Actions |
| Frontend Hosting | Firebase Hosting |
| Backend Hosting | Google Cloud Run |
| Containerization | Docker (multi-stage build) |

## Features

### Analytics Dashboard
- KPI cards with animated entrance (Total Employees, New Hires, Turnover Rate, Avg Tenure, Avg Salary)
- Headcount trend area chart with gradient fill
- Department distribution rose/nightingale pie chart with elastic animation
- Salary distribution gradient bar chart with staggered entrance
- Tenure by department horizontal gradient bars
- All charts use ECharts with elasticOut easing and staggered delays

### Employee Directory
- Paginated, searchable employee list with GraphQL cursor-based pagination
- Filters: department, status (Active/On Leave/Terminated), text search
- Employee profile with contact info, reporting chain, direct reports, performance history
- Add Employee dialog with reactive form validation

### Organization Chart
- Interactive d3-org-chart tree with SVG connector lines
- Color-coded nodes by department
- Click to expand/collapse subtree, click expanded card to navigate to profile
- Zoom in/out, fit to screen, expand all, collapse all
- Search highlighting by name or title
- State preservation across navigation (expanded nodes restored on back)

### Performance Reviews
- Review cycle list with status badges (Draft, Active, Completed)
- Review detail with scores and cycle info
- Review creation form (reviewer, cycle, ratings by category, comments, goals)
- Status workflow: Draft → Submitted → Reviewed → Finalized

### Reports
- Report builder with field selection and date range
- Pre-built templates (headcount, compensation, turnover)

## Architecture

```
talentflow/                         # Nx 20 monorepo
├── apps/
│   ├── client/                     # Angular 19 SPA
│   │   └── src/app/
│   │       ├── core/               # Guards, services, Apollo config
│   │       ├── features/
│   │       │   ├── auth/           # Login page
│   │       │   ├── dashboard/      # ECharts analytics
│   │       │   ├── employees/      # List, detail, form
│   │       │   ├── layout/         # Sidebar shell
│   │       │   ├── org-chart/      # d3-org-chart tree
│   │       │   ├── reviews/        # Cycles, detail, form
│   │       │   └── reports/        # Report builder
│   │       └── graphql/            # Operations + generated types
│   └── server/                     # Express + Apollo Server 4
│       └── src/
│           ├── graphql/
│           │   ├── typeDefs/       # .graphql schema files
│           │   └── resolvers/      # 5 resolvers
│           └── services/           # Business logic + Prisma
├── prisma/
│   ├── schema.prisma               # 10 models, 6 enums
│   ├── migrations/                 # PostgreSQL migrations
│   └── seed.ts                     # ~50 employees, reviews, goals
├── Dockerfile                      # Multi-stage build for Cloud Run
├── docker-compose.yml              # Local dev (PostgreSQL + Redis)
├── firebase.json                   # Firebase Hosting config
├── .github/workflows/
│   ├── ci.yml                      # Lint, test, build on PR
│   └── deploy.yml                  # Cloud Run + Firebase on push to main
└── codegen.ts                      # GraphQL code generation
```

## Quick Start (Local Development)

### Prerequisites

- Node.js 22+
- Docker Desktop
- npm

### Setup

```bash
git clone https://github.com/briang7/talentflow.git
cd talentflow
npm install --legacy-peer-deps
```

### Start databases

```bash
docker-compose up -d
```

### Run migrations and seed

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### Start the app

```bash
# Terminal 1: Backend (GraphQL API on port 4000)
npx nx serve server

# Terminal 2: Frontend (Angular on port 4200)
npx nx serve client
```

## Demo Accounts

No passwords required — enter any email and click Sign In.

| Role | Email |
|------|-------|
| Admin | sarah.chen@talentflow.dev |
| HR Manager | emma.wilson@talentflow.dev |
| Team Lead | alex.rivera@talentflow.dev |
| Employee | marcus.johnson@talentflow.dev |

## Deployment

Deployments are automated via GitHub Actions on push to `main`:

1. **Backend** → Docker build → Artifact Registry → Google Cloud Run
2. **Frontend** → Nx production build → Firebase Hosting

### Environment Variables (Cloud Run)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NODE_ENV` | `production` |
| `PORT` | Set by Cloud Run (default 8080) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

## Available Commands

| Command | Description |
|---------|-------------|
| `npx nx serve client` | Start Angular dev server |
| `npx nx serve server` | Start GraphQL API server |
| `npx nx build client` | Production build (Angular) |
| `npx nx build server` | Production build (Server) |
| `npx nx test client` | Run Angular unit tests |
| `npx nx lint client` | Lint Angular code |
| `npx prisma studio` | Open Prisma Studio |
| `npx prisma migrate dev` | Run database migrations |
| `npx tsx prisma/seed.ts` | Seed database |

## Database Schema

10 models: Employee, Department, Role, Office, User, ReviewCycle, PerformanceReview, Rating, Goal, AuditLog

Key relationships:
- Employees belong to departments, roles, and offices
- Employees have a manager (self-referencing hierarchy)
- Performance reviews link employees to reviewers within review cycles
- Ratings and goals belong to reviews
- Users map Firebase UIDs to employees with role-based access
