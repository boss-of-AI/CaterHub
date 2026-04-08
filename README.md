# CaterMe — Mumbai's Premium Catering Platform

An online catering platform connecting event organizers with top-rated caterers in Mumbai. The platform features an event-based routing architecture that allows customers to select standard menu skeletons built by admins, and flexibly customize their dish selections per slot.

## Project Structure
This is a monorepo consisting of 4 main workspaces:
- **`backend`**: NestJS + Prisma backend
- **`customer-site`**: NextJS app for end-users to browse events, pick dishes, and request bookings.
- **`caterer-site`**: NextJS dashboard for caterers to receive orders, accept/reject jobs, and manage their listings.
- **`admin-panel`**: React (Refine) dashboard for the platform owner to create event categories, menu skeletons, and assign jobs.

## Development Progress (April 2026)

### Phase 1: Core Architecture & Bug Fixes [COMPLETE]
- Overhauled Prisma schema to add `EventCategory`, `MenuSkeleton`, and custom `OrderDishSelection` routing.
- Fixed global dependencies mismatch and secured environment files.
- Ensured guest customer creation and order handling work properly.

### Phase 2: Security Hardening [COMPLETE]
- Implemented robust `RolesGuard` `@Roles('ADMIN', 'CATERER', 'CUSTOMER')` decorators in NestJS.
- Protected all controllers to make sure endpoints are un-reachable by unauthorized users.
- Cleaned up JWT payload structures.

### Phase 3: Menu System & Global Catalog [COMPLETE]
- Created the new EventCategory system to route flows by events instead of specific caterers.
- Seeded a massive Mumbai-centric catering library of 120+ authentic dishes.
- Seeded 14 pre-built menu templates (skeletons) across 8 event categories.

### Phase 4: Customer Frontend (NextJS) [COMPLETE]
- Migrated legacy `browse-by-caterer` approach to modern `browse-by-event`.
- Implemented a dynamic Dish Selection GUI `/events/[categoryId]/[skeletonId]` with min/max item validations.
- Enabled drafting to local storage if a user begins selecting a menu before logging in.

### Phase 5: Complete Business Logic [COMPLETE]
- Included "Reject Job" workflows for caterer allocations.
- Replaced basic window dialogs with clean `react-hot-toast` notifications.
- Added comprehensive Order Status state machine (PENDING -> BROADCASTED -> ASSIGNED -> COMPLETED).

### Phase 6: Final Polish & Deployment [IN PROGRESS]
- Clean up un-used legacy components.
- Prepare production build testing for NextJS sites.
- Prepare deployment pipeline for DigitalOcean/Vercel.

---

## Instructions to Run Locally

### 1. Database & Backend
```bash
cd backend
npm install
npx prisma db push --force-reset
npx prisma db seed
npm run start:dev
```

### 2. Admin Panel
```bash
cd admin-panel
npm install
npm run dev
```

### 3. Customer App
```bash
cd customer-site
npm install
npm run dev
```

### 4. Caterer Dashboard
```bash
cd caterer-site
npm install
npm run dev
```