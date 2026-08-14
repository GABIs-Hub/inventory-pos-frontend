# AGENT.md — Inventory POS Frontend

## 1. Project Identity

Project: Inventory & Sales Management System (POS)

Repository: `inventory-pos-frontend`

Primary purpose:
Build a production-grade web frontend for a small organization's inventory, sales, customer, invoicing, and reporting operations.

This is a client project. Treat all implementation decisions as production engineering decisions, not as throwaway prototypes.

The project owner/developer is Gabi. The developer is learning while building this system. Therefore, do not merely produce code: explain important architectural and engineering decisions before or alongside implementation.

---

## 2. Core Engineering Principle

Work deliberately.

Do not rush into implementation when the architecture, ownership boundary, data flow, or requirements are unclear.

Before changing code:

1. Identify the layer involved.
2. Identify the actual root cause.
3. Check the existing architecture and conventions.
4. Make the smallest correct change.
5. Validate the change.
6. Only then proceed to the next layer.

Never solve a frontend routing problem by changing Prisma.
Never solve a database connectivity problem by changing UI code.
Never introduce a new abstraction when an existing project abstraction already solves the problem.

When an error occurs, explicitly classify it:

- Frontend/UI
- Next.js routing
- API/client
- Backend/business logic
- Database/Prisma
- Authentication/authorization
- Build/tooling
- Deployment/infrastructure

This project values correctness and maintainability over speed.

---

## 3. Project Architecture

The intended system boundary is:

```text
                    INVENTORY POS SYSTEM
                           │
             ┌─────────────┴─────────────┐
             │                           │
        FRONTEND                     BACKEND
     Next.js + TS                  Separate service
     React                         REST API
     UI/UX                         Auth
     State                         Validation
     API client                    Business logic
             │                     Inventory logic
             │                     Sales logic
             └──────────────┬──────────────┘
                            │
                         DATABASE
                       PostgreSQL
                          Neon
```

### Important boundary

This repository is primarily the frontend application.

The backend/API is a separate architectural responsibility.

Prisma and the database schema exist in this repository currently because the database architecture and migration foundation were established here. Do not automatically turn the frontend into a database-heavy backend application.

Database access must remain behind a clearly defined boundary.

Do not scatter Prisma calls throughout React components, pages, or UI utilities.

---

## 4. Current Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- Modern responsive UI
- Accessible component design

### Database

- PostgreSQL
- Neon
- Prisma ORM
- Prisma Client generated into:

```text
src/generated/prisma
```

### Configuration

Prisma configuration:

```text
prisma.config.ts
```

Schema:

```text
prisma/schema.prisma
```

Environment variables:

```text
.env
```

`.env` is ignored by Git and must never be committed.

---

## 5. Existing Database Foundation

The database migration has already been successfully applied.

Expected status:

```text
npx prisma migrate status
```

should report that the database schema is up to date.

Do not recreate, delete, or reset the database simply because an unrelated application problem occurs.

The current domain model contains:

```text
Business
├── BusinessMember
├── Product
│   └── Inventory
├── Customer
├── SaleSession
│   ├── SaleSessionItem
│   └── Reservation
├── Sale
│   └── SaleItem
├── Invoice
├── StockMovement
└── AuditLog
```

### Important entities

#### Business

Represents a client business/organization.

Fields include:

- id
- name
- currency
- createdAt
- updatedAt

#### BusinessMember

Represents a user belonging to a business.

Roles:

```text
ADMIN
SALES_REP
```

A member is scoped to a business.

#### Product

Represents a sellable inventory item.

Important fields:

- name
- description
- sku
- costPrice
- sellingPrice
- isArchived

Product uniqueness is scoped to a business.

#### Inventory

One-to-one with Product.

Tracks:

- quantity
- reservedQuantity

Do not casually change inventory quantities without considering stock movements and transactional consistency.

#### StockMovement

Represents inventory history.

Types:

```text
STOCK_IN
SALE
ADJUSTMENT
RETURN
```

Inventory changes should be auditable.

#### Customer

Stores customer information associated with a business.

#### SaleSession

Represents an in-progress POS transaction.

Statuses:

```text
ACTIVE
COMPLETED
CANCELLED
EXPIRED
```

#### SaleSessionItem

Represents an item currently inside a sale session/cart.

#### Reservation

Represents stock reserved for a sale session.

Statuses:

```text
ACTIVE
RELEASED
CONSUMED
EXPIRED
```

Reservation logic must be treated as transactional business logic.

#### Sale

Represents a completed or voided sale.

Statuses:

```text
COMPLETED
VOID
```

A sale stores immutable transactional information such as:

- sale number
- subtotal
- discount
- total
- customer snapshot
- seller
- sale items

#### SaleItem

Stores the historical snapshot of an item sold.

Important fields include:

- productId
- productName
- quantity
- unitSellingPrice
- unitCostPrice
- subtotal

Do not rely on the current Product name or price to reconstruct historical sales.

#### Invoice

Represents the invoice associated with a sale.

Statuses:

```text
ISSUED
VOID
```

Each sale can have one invoice.

#### AuditLog

Records important business actions.

Do not use AuditLog as a generic application logger. It is intended for business/security-relevant events.

---

## 6. Database Transaction Rules

The most important transactional area is the sales/inventory workflow.

A sale must not be implemented as a collection of unrelated database operations.

Conceptually:

```text
Start transaction
    ↓
Validate sale session
    ↓
Validate products
    ↓
Validate reservations / available stock
    ↓
Lock or safely update inventory
    ↓
Create Sale
    ↓
Create SaleItems
    ↓
Create StockMovements
    ↓
Consume/release reservations
    ↓
Create Invoice where required
    ↓
Complete SaleSession
    ↓
Create AuditLog
    ↓
Commit
```

If any critical operation fails, the transaction must roll back.

Never allow:

```text
Sale created
+
Inventory not reduced
```

or:

```text
Inventory reduced
+
Sale not created
```

or:

```text
Invoice created
+
Sale transaction failed
```

unless the architecture explicitly defines an asynchronous workflow for that operation.

Concurrency matters.

Two sales attempting to consume the same stock must not be allowed to produce an impossible inventory state.

---

## 7. API Boundary

The frontend should communicate with the backend through a controlled API layer.

Preferred conceptual flow:

```text
React Component
      ↓
Feature Hook / Action
      ↓
API Client
      ↓
Backend Endpoint
      ↓
Business Service
      ↓
Repository / Database
```

Avoid:

```text
React Component
      ↓
Prisma
```

Do not place business rules in UI components.

Do not trust client-provided totals, permissions, prices, inventory quantities, or role information.

The server/backend must validate authoritative business data.

---

## 8. Next.js Routing Rules

This project uses the Next.js App Router.

A route:

```text
/api/health/db
```

must be structured as:

```text
src/
└── app/
    └── api/
        └── health/
            └── db/
                └── route.ts
```

Not:

```text
routes.ts
```

or arbitrary route filenames.

When debugging a 404:

1. Verify the URL.
2. Verify the App Router directory structure.
3. Verify `route.ts`.
4. Verify the exported HTTP method (`GET`, `POST`, etc.).
5. Restart the dev server only if necessary.
6. Then investigate application/database logic.

Do not modify Prisma to solve a Next.js route discovery problem.

---

## 9. Database Health Endpoint

The database health endpoint is diagnostic infrastructure only.

Expected conceptual endpoint:

```text
GET /api/health/db
```

Its job is to determine whether the application can successfully communicate with PostgreSQL.

It should not contain business logic.

A successful response may look conceptually like:

```json
{
  "status": "ok",
  "database": "available"
}
```

A failure response should be useful during development but must not leak credentials, connection strings, secrets, or sensitive infrastructure details in production.

Do not expose raw Prisma errors to public production clients.

---

## 10. Environment Variables

Never hardcode:

- database URLs
- passwords
- API keys
- JWT secrets
- OAuth secrets
- private service credentials

Use `.env` / deployment environment variables.

Never expose server-only secrets through variables prefixed with:

```text
NEXT_PUBLIC_
```

The database connection string is server-side only.

---

## 11. Security Rules

Security is part of the implementation, not a later feature.

Always consider:

- authentication
- authorization
- business ownership
- role permissions
- input validation
- IDOR prevention
- SQL/database safety
- secret handling
- auditability
- rate limiting where appropriate
- safe error responses

Every business resource must be scoped to the authenticated business/member.

Never assume that because a user has an ID, they are allowed to access that record.

For example, this is unsafe:

```text
GET /api/products/:productId
```

if the backend simply fetches by `productId`.

The server must establish that the product belongs to the authenticated user's business.

---

## 12. Business Roles

Current roles:

```text
ADMIN
SALES_REP
```

Do not invent additional roles without a requirement.

At minimum, the architecture should distinguish between:

### ADMIN

Expected responsibilities may include:

- business configuration
- product management
- inventory adjustments
- staff/member management
- reports
- sales oversight
- invoice management

### SALES_REP

Expected responsibilities may include:

- viewing available products
- creating sales
- managing their active sale session
- viewing permitted sales/customer information

Exact permissions must be confirmed before implementing authorization rules.

Do not silently assume that every role can perform every operation.

---

## 13. Frontend Feature Organization

Prefer feature-oriented organization.

A future structure may resemble:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
│
├── components/
│   └── ui/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── products/
│   ├── inventory/
│   ├── sales/
│   ├── customers/
│   ├── invoices/
│   ├── reports/
│   └── settings/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── db/
│   ├── validation/
│   └── utils/
│
├── generated/
│   └── prisma/
│
└── types/
```

Do not create this entire structure speculatively.

Create directories when the corresponding feature is actually being implemented.

---

## 14. UI/UX Principles

This is a business application, not a marketing website.

Prioritize:

- clarity
- speed
- low cognitive load
- responsive layouts
- accessible controls
- predictable navigation
- clear data hierarchy
- useful empty states
- useful loading states
- useful error states
- confirmation for destructive operations

The POS workflow must optimize for fast sales entry.

Do not sacrifice usability for visual effects.

Avoid unnecessary animations.

Do not use excessive cards, gradients, decorative elements, or oversized marketing-style layouts in operational screens.

---

## 15. Data Formatting

Money must be treated as monetary data.

Database monetary values use:

```text
Decimal(14,2)
```

Do not use JavaScript floating-point arithmetic for authoritative financial calculations.

The backend/database must be authoritative for:

- subtotal
- discount
- total
- cost
- selling price
- profit

Frontend calculations are for presentation/UX only unless explicitly designed otherwise.

Currency defaults to:

```text
NGN
```

but do not hardcode NGN into reusable financial components.

---

## 16. Product Rules

Product names are unique within a business.

SKU is unique within a business when provided.

Do not use global uniqueness for business-scoped resources.

Products can be archived.

Archiving is preferred over destructive deletion when historical transactions depend on a product.

Do not delete products that would break historical sales.

---

## 17. Sales Rules

A sale should preserve historical information.

When a sale is created:

- Product name is snapshotted into SaleItem.
- Selling price is snapshotted.
- Cost price is snapshotted.
- Sale totals are stored.
- Seller is stored.
- Customer information may be snapshotted.

Changing a Product later must not rewrite historical sales.

A sale number must be unique within a business.

A completed sale must not be silently edited in a way that destroys financial history.

Void/reversal workflows should be explicit and auditable.

---

## 18. Inventory Rules

Inventory is not simply a number displayed on the screen.

It represents the result of stock movements and transactional operations.

Important concepts:

```text
Available Stock
=
quantity - reservedQuantity
```

Do not allow available stock to become negative unless the business requirements explicitly permit negative inventory.

Stock operations must be atomic.

Inventory adjustments should have a reason.

Inventory changes should generate StockMovement records where appropriate.

---

## 19. Invoice Rules

An invoice belongs to a sale.

An invoice must not exist independently of a valid sale.

Invoice numbers must be unique.

Voiding an invoice should not silently delete the underlying sale.

Invoice history must remain auditable.

Do not generate fake invoice data merely to populate the UI.

---

## 20. Error Handling

Errors should be classified and handled intentionally.

Use user-friendly messages in the UI.

Use detailed server-side logging for debugging.

Never expose:

- database passwords
- connection strings
- stack traces
- internal filesystem paths
- Prisma internals

to production users.

During development, detailed errors may be returned temporarily, but remove or restrict them before production.

---

## 21. Testing Expectations

For every significant feature, consider at least:

### Unit tests

For:

- validation
- calculations
- pure business rules
- formatting

### Integration tests

For:

- API behavior
- database operations
- authorization
- transactional workflows

### End-to-end tests

For critical flows such as:

```text
Login
→ Dashboard
→ Add Product
→ Add Stock
→ Create Sale
→ Complete Sale
→ Generate/View Invoice
```

The sales/inventory transaction should receive especially strong testing.

---

## 22. Validation Commands

Use these before considering a database change complete:

```powershell
npx prisma validate
```

```powershell
npx prisma generate
```

```powershell
npx prisma migrate status
```

For TypeScript:

```powershell
npx tsc --noEmit
```

For the application:

```powershell
npm run dev
```

Before committing, run the project's available lint/build/test commands as appropriate.

Do not claim that something works without validating it.

---

## 23. Git Discipline

Use meaningful commits.

Examples:

```text
feat(products): add product management foundation
feat(sales): implement sale session workflow
fix(api): correct database health route
refactor(api): isolate backend client
chore(prisma): update generated client
```

Avoid commits such as:

```text
fix stuff
changes
update
test
asdf
```

Do not rewrite history or force-push unless explicitly instructed.

Do not delete migrations to make a problem disappear.

Migrations are part of the project's history.

---

## 24. Migration Discipline

Never casually run destructive commands against the client's database.

Be extremely cautious with:

```text
prisma migrate reset
```

Do not use it merely to resolve an application error.

Before modifying an existing migration:

1. Determine whether it has already been applied.
2. Determine whether the database contains production/client data.
3. Prefer creating a new migration.
4. Validate the migration.
5. Apply it deliberately.

Once a migration is applied to a shared/production database, treat it as immutable history.

---

## 25. What Has Already Been Solved

Do not repeatedly revisit these unless new evidence indicates a regression:

- Prisma initialization
- Prisma schema generation
- TypeScript path configuration
- Prisma Client generation
- `.env` Git ignore
- Initial database schema design
- Initial database migration
- Database migration status

The database currently has an applied initial migration and should be treated as an established foundation.

---

## 26. Current Immediate State

The project currently needs to move forward from infrastructure setup into application architecture.

The previous troubleshooting consumed too much time around Prisma and the health endpoint.

The correct approach now is:

```text
1. Verify Next.js route structure.
2. Verify the database health endpoint.
3. Stop touching Prisma unless the endpoint proves there is a database problem.
4. Establish the frontend architecture.
5. Establish the API contract.
6. Implement authentication.
7. Build the application feature-by-feature.
```

Do not start implementing every feature simultaneously.

---

## 27. Development Workflow

For every task, use this process:

### Step 1 — Understand

State:

- what we are trying to accomplish
- why it is needed
- which layer it belongs to
- what files are likely involved

### Step 2 — Inspect

Inspect existing code before creating/replacing files.

Prefer:

```text
read existing file
→ understand conventions
→ make targeted change
```

over:

```text
replace entire project
```

### Step 3 — Plan

For non-trivial tasks, provide a short implementation plan.

### Step 4 — Implement

Make the smallest coherent change.

### Step 5 — Validate

Run the appropriate checks.

### Step 6 — Explain

Tell Gabi:

- what changed
- why it changed
- what was validated
- what comes next

---

## 28. Teaching Requirement

Gabi is learning software engineering while building this project.

Do not behave like an opaque code generator.

When making an important architectural decision, explain:

```text
What
Why
Where
How
Trade-off
```

For example:

> We are putting this code in `src/lib/api` instead of a component because the API client is infrastructure and should not be coupled to UI rendering.

Avoid excessively long explanations for trivial syntax.

The goal is to teach engineering judgment, not merely syntax.

---

## 29. Do Not Over-Engineer

Do not introduce:

- unnecessary design patterns
- unnecessary repositories
- unnecessary abstractions
- unnecessary state libraries
- unnecessary dependencies
- microservices
- event buses
- complicated caching
- speculative features

unless there is a concrete requirement.

Use the simplest architecture that remains production-grade.

---

## 30. Do Not Guess Requirements

If a requirement is unknown and materially affects architecture, ask.

Do not invent:

- tax rules
- payment providers
- invoice legal requirements
- user roles
- permissions
- business workflows
- report definitions
- notification behavior
- accounting rules

If a reasonable default exists and the decision is low-risk, state the assumption clearly and proceed.

---

## 31. Protect Existing Work

Before changing an important file:

- inspect it
- understand its purpose
- preserve unrelated functionality
- avoid destructive rewrites

Never replace a working implementation simply because another implementation is more familiar.

If a change is risky, explain the risk before applying it.

---

## 32. Communication Rules

Be frank.

If an approach is wrong, say so directly.

If a previous decision was inefficient, say so.

If something is unnecessary, say so.

Do not pretend a solution is production-ready when it is not.

Do not claim success from static inspection alone when a command/test can verify it.

When something fails, report:

```text
What failed
Why it failed
What layer is responsible
What we will change
How we will verify it
```

---

## 33. Definition of Done

A feature is not done merely because the UI renders.

A production feature should have:

- correct architecture
- correct validation
- correct authorization
- correct API behavior
- correct database behavior
- correct loading state
- correct error state
- correct empty state
- responsive UI
- accessible controls
- appropriate tests
- successful type checking
- successful lint/build checks where applicable
- no secrets committed
- clear Git history

---

## 34. Final Rule

Do not lose the architectural picture while solving a local error.

Always ask:

```text
Where are we?
What layer are we working on?
Why are we touching this file?
What does this unlock?
What is the next logical step?
```

The objective is not to accumulate code.

The objective is to deliver a reliable, maintainable, production-grade Inventory POS system.
