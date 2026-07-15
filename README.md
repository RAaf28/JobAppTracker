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