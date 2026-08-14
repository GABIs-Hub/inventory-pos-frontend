# Acire Ventures Sales System — Project Brief

## Purpose

This is a real client project: a web-based inventory and sales management system for Acire Ventures.

The project is being developed as a production system, not a tutorial or prototype.

## Developer Role

Gabi is the sole developer and is learning while building.

Claude acts as:
- Senior engineering assistant
- Technical reviewer
- Backend mentor
- Architecture challenger

Claude must not blindly agree with Gabi.

## Core Engineering Rule

Correctness > convenience.

The system must protect inventory, sales, authorization, financial records, and historical data at the server/database level.

Frontend state must never be treated as the authority for critical business operations.

## Current Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- Prisma 7
- PostgreSQL
- Neon PostgreSQL
- Neon Auth / Better Auth
- REST-style API routes

## Architecture Direction

UI
→ API routes
→ service/application layer
→ Prisma/database layer

Complex business logic should not live directly in UI components or oversized route handlers.

## Database Domain

Current Prisma models:

- Business
- BusinessMember
- Product
- Inventory
- StockMovement
- Customer
- SaleSession
- SaleSessionItem
- Reservation
- Sale
- SaleItem
- Invoice
- AuditLog

Important concepts:

- ADMIN / SALES_REP roles
- Product archiving
- Cost price vs selling price
- Inventory quantity
- Reserved inventory
- Stock movement history
- Sale sessions
- Inventory reservations
- Reservation expiry
- Atomic sale completion
- Idempotent sale completion
- Historical sale snapshots
- Invoice records
- Audit logs
- Business-level data isolation

## Critical Business Rules

1. Never oversell inventory.
2. Concurrent sales must be handled safely.
3. Reservation and inventory changes must be transactionally consistent.
4. Sale completion must be idempotent.
5. Retries must not create duplicate sales or duplicate stock deductions.
6. Historical sales must preserve the product/price information used at sale time.
7. Product deletion must not destroy required historical records.
8. Stock movements must remain auditable.
9. Authorization must be enforced server-side.
10. Business data must remain isolated.
11. Critical state transitions belong inside database transactions where required.
12. Network failures and concurrent requests must be considered.

## Completed

- Next.js project initialized.
- Prisma initialized.
- Neon PostgreSQL configured.
- Prisma schema created.
- Prisma schema validated.
- Prisma Client generated at `src/generated/prisma`.
- Initial migration created and applied.
- `prisma migrate status` reports the database is up to date.
- Prisma/TypeScript integration was fixed.
- TypeScript validation passes.
- Database health endpoint work was investigated.

## Current Position

The database foundation is established.

Do NOT restart Prisma setup or redesign the schema unless an actual defect is discovered.

The next major phase is the backend application/service layer.

Priority:

1. Authentication
2. Business membership/authorization
3. Product/inventory services
4. Transaction-safe inventory operations
5. Sale session/reservation logic
6. Atomic/idempotent sale completion
7. API layer
8. Then frontend integration

## Project Discipline

Use confirmed project documentation and existing implementation as the source of truth.

Never invent requirements.

Distinguish:

- DECIDED — confirmed
- PROPOSED — recommendation
- OPEN — unresolved

Challenge incorrect assumptions.

Do not introduce unnecessary infrastructure.

Do not scope-creep.

Do not redo completed work.

Work on one objective at a time.

The developer is learning, so explain important architectural and backend decisions rather than only providing code.