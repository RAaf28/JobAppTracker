# Job Application Tracker

A full-stack application to track your job search, organize application pipelines, manage multiple resumes with tag-based auto-suggestions, and monitor interview schedules.

## Overview
This application helps job seekers organize their job hunt. It features:
* **Dashboard Analytics**: Success rate metrics, application charts by month/status/company, and upcoming interview schedules.
* **Pipeline Management**: Kanban-like tracking of job applications through various stages (Wishlist, Applied, OA, Interviews, Offer, etc.).
* **Resume Auto-Suggestion**: Suggests the most suitable resume version for a job posting based on tag overlap, falling back to a default resume when none match.
* **Company & Interview Tracking**: Log detailed notes, interview stages, and interviewer contact details.

---

## Tech Stack

### Frontend
* **Core**: Next.js (App Router), TypeScript, Tailwind CSS
* **State Management**: TanStack Query (server state), Zustand (client auth state)
* **Forms & Validation**: React Hook Form, Zod

### Backend
* **Core**: Node.js, Express, TypeScript
* **Database**: PostgreSQL (hosted via Supabase), Prisma ORM
* **Auth**: JSON Web Tokens (JWT), bcrypt hashing
* **Validation**: Zod schema validation

---

## Installation

### 1. Clone the repository and install dependencies
Inside both the `frontend/` and `backend/` directories, run:
```bash
npm install
```

### 2. Set up the Database
Make sure you have your environment variables set up in the `backend/.env` file. Then run migrations to build the tables in your database:
```bash
cd backend
npx prisma migrate dev --name init
```

### 3. Run the Development Servers
In separate terminal windows, start the backend and frontend dev servers.

**For the Backend (Port 5000)**:
```bash
cd backend
npm run dev
```

**For the Frontend (Port 3000)**:
```bash
cd frontend
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://<user>:<password>@<host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://<user>:<password>@<host>:5432/postgres"
JWT_SECRET="your-jwt-secret-key"
```
*(Note: `DIRECT_URL` on port 5432 is required to run migrations bypassing PgBouncer).*

### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```
*(Note: In Vercel production settings, set this to your deployed backend URL: `https://<backend-domain>.vercel.app/api/v1`).*

---

## Folder Structure
```text
ApplicationTracker/
├── backend/
│   ├── prisma/             # Database schema and migrations
│   └── src/
│       ├── config/         # Database and server config
│       ├── middleware/     # Auth, error, and validation middleware
│       ├── modules/        # Feature modules (auth, applications, resumes, etc.)
│       ├── types/          # Custom TypeScript declarations
│       └── utils/          # Express custom errors and utilities
├── frontend/
│   └── src/
│       ├── app/            # Next.js App Router pages and assets
│       ├── components/     # Reusable layout and navigation components
│       ├── lib/            # Utility helpers and resume auto-suggestion hooks
│       ├── services/       # Axios API client wrapper
│       ├── store/          # Zustand global store
│       └── types/          # Frontend model TypeScript definitions
└── README.md
```

---

## API Documentation

### Auth Module (`/api/v1/auth`)
* `POST /register` - Register a new account
* `POST /login` - User login
* `GET /me` - Get current authenticated user details
* `PATCH /me` - Update current user profile

### Applications Module (`/api/v1/applications`)
* `GET /` - List all applications (supports filtering and search query params)
* `POST /` - Log a new application
* `GET /:id` - Get application details
* `PATCH /:id` - Update application details
* `DELETE /:id` - Delete an application

### Resumes Module (`/api/v1/resumes`)
* `GET /` - List user's resumes
* `POST /` - Add a new resume version (supports tags and default configuration)
* `PATCH /:id` - Edit resume tags, files, or default status
* `DELETE /:id` - Delete a resume

---

## Available Scripts

### Frontend Scripts
* `npm run dev` - Starts Next.js development server
* `npm run build` - Builds production Next.js application bundle
* `npm run start` - Starts production Next.js server

### Backend Scripts
* `npm run dev` - Starts development Express server with hot-reload
* `npm run build` - Generates Prisma Client and compiles TypeScript files to `/dist`
* `npm run start` - Starts the compiled Express server
* `npm run db:migrate` - Runs Prisma schema migrations
* `npm run db:generate` - Generates the Prisma Client
