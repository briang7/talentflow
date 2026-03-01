# TalentFlow - HR Analytics Dashboard

A full-stack HR Analytics Dashboard built with Angular 19, GraphQL (Apollo), PostgreSQL, and Prisma.

## Tech Stack

- **Frontend**: Angular 19 + Angular Material + Apollo Angular + ng2-charts
- **Backend**: Express + Apollo Server 4 + Prisma ORM
- **Database**: PostgreSQL 16 + Redis 7
- **Monorepo**: Nx 20
- **Infrastructure**: Docker Compose, GitHub Actions CI/CD, Firebase Hosting

## Quick Start

### Prerequisites

- Node.js 22+
- Docker Desktop
- npm

### Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd talentflow
   npm install
   ```

2. **Start databases**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations and seed**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start the backend**
   ```bash
   npx nx serve server
   ```
   GraphQL API at http://localhost:4000/graphql

5. **Start the frontend**
   ```bash
   npx nx serve client
   ```
   Angular app at http://localhost:4200

### Demo Accounts

| Role | Email |
|------|-------|
| Admin | sarah.chen@talentflow.dev |
| HR Manager | emma.wilson@talentflow.dev |
| Team Lead | alex.rivera@talentflow.dev |

## Project Structure

```
talentflow/
├── apps/
│   ├── client/          # Angular 19 frontend
│   └── server/          # Express + Apollo Server backend
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── docker-compose.yml   # PostgreSQL + Redis
└── codegen.ts           # GraphQL code generation
```

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
