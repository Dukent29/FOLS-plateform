# FOLS-plateform
FOLS Security Group protège les personnes et les biens avec des prestations adaptées, une équipe professionnelle et une relation de confiance avec chaque client.
# FOLS Security Platform

Full-stack MVP for **FOLS SECURITY GROUP**: public acquisition website + internal CRM/back-office.

## What is included

### Public side
- Modern responsive homepage
- Services and business sectors
- Qualified quote / security-needs form
- Form validation
- Lead creation in PostgreSQL
- Success reference returned to the visitor

### Back-office
- Secure login with HttpOnly session cookie
- Password hashing with Node.js `scrypt`
- Dashboard KPIs
- Prospect list, search and filters
- Prospect detail
- Status pipeline
- Notes / communication history
- SMTP email replies from lead detail
- Configurable default hourly rates per service
- Quote calculator and database persistence
- Printable quote detail (browser print / PDF)
- Quote list and status transitions (draft / sent / accepted / refused / expired)
- Client list (won opportunities)
- Company/CNAPS settings screen
- Mission creation
- Planning list

### Technical stack
- Next.js 16.3 / App Router
- React 19
- TypeScript
- PostgreSQL 17
- Prisma ORM 7
- Prisma PostgreSQL driver adapter
- Plain CSS design system (no CSS framework dependency)
- Docker Compose for local PostgreSQL

## Business flow

```text
Public visitor
  -> qualified request
  -> Lead / NEW
  -> Qualification
  -> Quote to prepare
  -> Quote
  -> Accepted / Won
  -> Mission
  -> Planning
```

## 1. Prerequisites

- Node.js 22+
- Docker Desktop / Docker Engine
- npm

## 2. Configure environment

```bash
cp .env.example .env
```

Change at least `ADMIN_PASSWORD` before using the project outside local development.

## 3. Start PostgreSQL

```bash
docker compose up -d postgres
```

## 4. Install dependencies

```bash
npm install
```

## 5. Generate Prisma Client

Prisma 7 requires explicit generation:

```bash
npm run db:generate
```

## 6. Create the database schema

```bash
npm run db:migrate -- --name init
```

## 7. Seed admin + services

```bash
npm run db:seed
```

Default values come from `.env`:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

## 8. Run the application

```bash
npm run dev
```

Open:

- Public website: http://localhost:3000
- Quote request: http://localhost:3000/demande-devis
- Back-office: http://localhost:3000/login

## Test the complete flow

1. Open `/demande-devis`.
2. Submit a prospect request.
3. Log into `/login`.
4. Dashboard count should show the new request.
5. Open `Prospects` and the submitted lead.
6. Change its status.
7. Add a commercial note.
8. Use the quote calculator.
9. The generated quote appears under `Devis`.
10. Mark the quote as `Sent`, then `Accepted`. The lead becomes `Won`.
11. Create a mission and see it in `Planning`.

## Important production work still required

This repository is a **serious functional MVP**, not a finished ERP. Before real production use, add:

- exact CNAPS authorization/legal wording supplied by FOLS
- rate limiting / anti-spam / CAPTCHA on the public lead endpoint
- production email templates / delivery observability
- quote status update UI and PDF generation
- customer acceptance/signature workflow
- finer RBAC if multiple employees are added
- audit log
- file/document storage
- automated backups
- monitoring / error reporting
- privacy/data-retention policy implementation
- CSRF strategy for sensitive state-changing forms if deployment architecture requires it
- automated tests

## Security design

The admin area is not protected by frontend hiding. Server components call `requireUser()`, which validates an HttpOnly session against the database. Passwords are stored as salted `scrypt` hashes. Session tokens are random; only their SHA-256 hashes are stored in PostgreSQL.

## Data model

Main models:

- User / Session
- Company / Contact
- Service
- Lead / Communication
- Quote / QuoteItem
- Mission

See `prisma/schema.prisma` for the complete relationships.
