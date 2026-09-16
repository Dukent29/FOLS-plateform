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
- Clerk sign-in, sign-up, account menu, and managed sessions
- Server-enforced staff access using Clerk public metadata roles
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

`DATABASE_URL` and the mail settings remain in `.env`. Authentication now uses Clerk; `ADMIN_EMAIL` and `ADMIN_PASSWORD` no longer control dashboard login.

Connect the existing Clerk application using the CLI (no keys need to be shared in chat):

```bash
npx -y clerk@latest auth login
npx -y clerk@latest init
npx -y clerk@latest doctor
```

The CLI writes `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` locally. Keep environment files untracked. Restart the app after changing credentials. Use the same Clerk application and instance where your users were created.

### Authorize staff

In the Clerk Dashboard, open **Users**, select the staff user, and set **Public metadata** to include:

```json
{ "role": "admin" }
```

The supported roles are `admin` and `manager`; both can use the current back office. Preserve other metadata fields when editing. Roles are read on the server from Clerk's Backend API, so no custom session-token template is needed. User-editable unsafe metadata is never used for authorization. Accounts with no recognized staff role see an access-denied page; signing up alone does not grant dashboard access.

Before deployment, configure Clerk's production instance and domain. Development and production users are separate. A VPN-hosted app still needs internet access to Clerk.

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

## 7. Seed services + company settings

```bash
npm run db:seed
```

This seeds business reference data only. Create users and assign staff roles in Clerk. Existing database users and sessions are preserved but are no longer accepted for authentication.

## 8. Run the application

```bash
npm run dev
```

Open:

- Public website: http://localhost:3000
- Quote request: http://localhost:3000/demande-devis
- Sign-in: http://localhost:3000/sign-in (`/login` redirects here)
- Sign-up: http://localhost:3000/sign-up
- Back-office: http://localhost:3000/admin

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

Clerk validates sessions. `proxy.ts` protects `/admin` and `/api/admin` before requests reach the dashboard. The admin layout also calls `requireUser()`; every admin API handler calls `requireApiUser()` before accessing business data. The server checks Clerk public metadata for an approved staff role. APIs return 401 for unsigned users and 403 for users without a staff role. The old password login/logout endpoints return 410 and cannot create sessions.

## Data model

Main models:

- User / Session
- Company / Contact
- Service
- Lead / Communication
- Quote / QuoteItem
- Mission

See `prisma/schema.prisma` for the complete relationships.
