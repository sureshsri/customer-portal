# Customer Management Portal

A Next.js 14 admin portal for managing customers, users, and job categories.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.local.example` to `.env.local` and update values:
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/customer_portal
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

> For MongoDB Atlas, replace URI with your connection string, e.g.:
> `mongodb+srv://username:password@cluster.mongodb.net/customer_portal`

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Admin Login

- **Username:** `admin`
- **Password:** `admin123`

> Change these in `src/lib/auth.ts` before deploying to production.

## Features

- **Dashboard** – Overview stats and revenue summary
- **Customers** – Full CRUD with auto-incrementing ID (0000001, 0000002...)
  - Search by ID, ITE code, or name
  - Auto-calculates balance payment
- **Job Categories** – Create/edit/delete service categories
- **Users** – Admin-only user management (create, edit, delete)

## Tech Stack

- **Next.js 14** (App Router)
- **MongoDB** + Mongoose
- **NextAuth.js** (JWT sessions)
- **Tailwind CSS**

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/       # Protected routes with sidebar
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── categories/
│   │   └── users/
│   ├── api/               # API routes
│   │   ├── auth/
│   │   ├── customers/
│   │   ├── categories/
│   │   └── users/
│   ├── login/
│   └── providers.tsx
├── components/
│   └── layout/Sidebar.tsx
├── lib/
│   ├── mongodb.ts
│   └── auth.ts
└── models/
    ├── Customer.ts
    ├── User.ts
    ├── JobCategory.ts
    └── Counter.ts
```

## Build for Production

```bash
npm run build
npm start
```
