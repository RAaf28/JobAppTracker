# Job Application Tracker

A full-stack application to track job applications, manage resumes, monitor interview progress, and analyze your job search.

## Goal

Build a production-like application that demonstrates:

- Authentication & Authorization
- REST API design
- Database relationships
- CRUD operations
- Filtering & searching
- Dashboard analytics
- Responsive UI
- Good project architecture

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Axios
- React Hook Form
- Zod

### Backend

- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt
- Zod

### Deployment

- Frontend: Vercel
- Backend: Railway
- Database: Supabase PostgreSQL

## Core Features

### Authentication

- Register
- Login
- Logout
- JWT Authentication
- Protected routes

### Dashboard

Display:

- Total Applications
- Interviews
- Offers
- Rejections
- Response Rate
- Applications This Month
- Upcoming Interviews

Charts:

- Applications by Month
- Applications by Status
- Applications by Company

### Applications

Each application contains:

- Company
- Position
- Job Type
- Location
- Salary Range
- Status
- Source
- Applied Date
- Deadline
- Resume Version
- Cover Letter
- Notes

### Company Management

- Company Name
- Industry
- Website
- Location
- Company Size
- Notes

### Interview Tracking

- Date
- Time
- Stage
- Interviewer
- Meeting Link
- Notes
- Outcome

### Resume Management

- Resume Name
- Version
- Last Updated
- File URL

### Analytics

- Response Rate
- Offer Rate
- Rejection Rate
- Average Days Until Response
- Most Common Rejection Stage

### Search & Filtering

Search:
- Company
- Position

Filters:
- Status
- Job Type
- Source
- Date Range

Sorting:
- Recently Applied
- Company
- Deadline
- Salary

### Profile

- Name
- Email
- Password

## Stretch Features

- Kanban Board
- Calendar View
- Email reminders
- File uploads
- Resume preview
- Interview preparation notes
- Bookmark jobs
- Dark mode
- Export CSV
- Import CSV

## User Flow

```text
Register
↓
Dashboard
↓
Add Application
↓
Track Progress
↓
Interview
↓
Offer / Rejection
↓
Analytics
```

## Database Schema

### User

```text
id
name
email
password
createdAt
updatedAt
```

### Company

```text
id
name
industry
website
location
size
notes
userId
```

### Resume

```text
id
name
version
fileUrl
userId
createdAt
```

### Application

```text
id
position
jobType
status
salaryMin
salaryMax
location
source
appliedDate
deadline
coverLetter
notes
companyId
resumeId
userId
createdAt
updatedAt
```

### Interview

```text
id
stage
date
time
interviewer
meetingLink
notes
outcome
applicationId
```

## Relationships

```text
User
├── Companies
├── Resumes
└── Applications

Company
└── Applications

Resume
└── Applications

Application
└── Interviews
```

## API Routes

### Auth

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Applications

```http
GET    /api/v1/applications
GET    /api/v1/applications/:id
POST   /api/v1/applications
PATCH  /api/v1/applications/:id
DELETE /api/v1/applications/:id
```

### Companies

```text
GET
POST
PATCH
DELETE
```

### Interviews

```text
GET
POST
PATCH
DELETE
```

### Resumes

```text
GET
POST
PATCH
DELETE
```

## Application Status

```text
Wishlist
Applied
Online Assessment
HR Interview
Technical Interview
Final Interview
Offer
Accepted
Rejected
Withdrawn
```

## Folder Structure

```text
job-tracker/

frontend/
└── src/
    ├── app/
    ├── components/
    ├── features/
    ├── hooks/
    ├── services/
    ├── store/
    ├── types/
    ├── utils/
    └── lib/

backend/
└── src/
    ├── config/
    ├── middleware/
    ├── modules/
    │   ├── auth/
    │   ├── applications/
    │   ├── companies/
    │   ├── interviews/
    │   ├── resumes/
    │   └── users/
    ├── prisma/
    ├── utils/
    └── types/
```

## Milestones

### Phase 1

- Authentication
- Database
- CRUD Applications

### Phase 2

- Dashboard
- Analytics
- Search
- Filters

### Phase 3

- Companies
- Interviews
- Resume Management

### Phase 4

- File Upload
- Calendar
- Kanban Board
- Deployment

## Bonus Features

- AI resume feedback
- AI cover letter generator
- AI interview question generator
- Chrome extension to save jobs
- Email notifications
- PWA support
- Expo mobile app
- Public portfolio dashboard
