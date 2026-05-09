# Ferelian — Horror Portfolio

A horror-themed interactive developer portfolio with a hidden admin panel for managing content. Built with Next.js 14, NestJS, and MongoDB Atlas.

---

## Overview

The portfolio presents itself as a dark, occult-themed interface. Visitors must "break the seal" to reveal the projects and social links. Behind the scenes, a hidden admin panel — **The Containment Zone** — allows full CRUD management of all portfolio content via a terminal-style UI.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Backend | NestJS, Passport JWT, Mongoose |
| Database | MongoDB Atlas |
| Testing | Vitest (frontend), Jest + fast-check (backend) |
| Auth | JWT (8h expiry), bcrypt (12 rounds) |

---

## Project Structure

```
/
├── horror-portfolio/          # Next.js frontend + admin panel
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Public portfolio (Server Component)
│   │   │   ├── PageClient.tsx     # Interactive client layer
│   │   │   └── void/              # Hidden admin routes
│   │   │       ├── login/         # Binding Seal (login page)
│   │   │       └── dashboard/     # Admin dashboard + panels
│   │   ├── components/
│   │   │   ├── sections/          # LeftShelf, RightShelf, CultSeal
│   │   │   ├── admin/             # Terminal UI components
│   │   │   └── ui/                # CursorFlashlight
│   │   ├── lib/
│   │   │   ├── api.ts             # Public API client (with fallback)
│   │   │   └── adminApi.ts        # Admin API client (JWT)
│   │   └── middleware.ts          # JWT guard for /void routes
│   └── ...
│
└── containment-zone-api/      # NestJS REST API
    ├── src/
    │   ├── auth/              # Login, JWT strategy, bcrypt
    │   ├── projects/          # CRUD for portfolio projects
    │   └── social-links/      # CRUD for social links
    └── scripts/
        └── seed-admin.ts      # One-time admin account setup
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Set up the backend

```bash
cd containment-zone-api
npm install
```

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/containment-zone
JWT_SECRET=your-secret-minimum-32-characters-long
JWT_EXPIRES_IN=8h
ADMIN_PASSWORD=your-admin-password
PORT=3001
PORTFOLIO_URL=http://localhost:3000
```

Seed the admin account (run once):

```bash
npm run seed:admin
```

Start the backend:

```bash
npm run start:dev
```

Backend runs at `http://localhost:3001`.

### 3. Set up the frontend

```bash
cd horror-portfolio
npm install
```

Create a `.env.local` file:

```env
JWT_SECRET=your-secret-minimum-32-characters-long
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> `JWT_SECRET` must be identical to the one in `containment-zone-api/.env`.

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## Accessing the Admin Panel

Navigate to `http://localhost:3000/void` — you will be redirected to the login page.

Enter the password you set in `ADMIN_PASSWORD` to access the dashboard.

The admin URL is intentionally not linked anywhere on the public portfolio.

---

## Running Tests

**Frontend (Vitest + fast-check):**

```bash
cd horror-portfolio
npm test
```

**Backend (Jest + fast-check):**

```bash
cd containment-zone-api
npm test
```

The test suite includes property-based tests covering:
- JWT expiry correctness (8h)
- Password hashing (bcrypt, 12 rounds)
- Schema validation for projects and social links
- API fallback behavior
- Dashboard timestamp formatting
- UI component rendering

---

## Deploying to Production

### Backend → Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repo, set **Root Directory** to `containment-zone-api`
3. Add environment variables (same as `.env` but with production values)
4. Set start command: `npm run start:prod`
5. Note the generated URL (e.g. `https://your-api.up.railway.app`)

### Frontend → Vercel

1. Import your repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `horror-portfolio`
3. Add environment variables:
   ```
   JWT_SECRET=<same secret as backend>
   NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
   ```
4. Deploy

After both are live, update `PORTFOLIO_URL` in Railway to your Vercel domain so CORS works correctly.

---

## API Endpoints

All write endpoints require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/projects` | — | List all projects (public) |
| POST | `/projects` | ✓ | Create project |
| PATCH | `/projects/:id` | ✓ | Update project |
| DELETE | `/projects/:id` | ✓ | Delete project |
| GET | `/social-links` | — | List all social links (public) |
| POST | `/social-links` | ✓ | Create social link |
| PATCH | `/social-links/:id` | ✓ | Update social link |
| DELETE | `/social-links/:id` | ✓ | Delete social link |

---

## Environment Variables Reference

### `containment-zone-api/.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry duration (default: `8h`) |
| `ADMIN_PASSWORD` | Password for the admin account |
| `PORT` | API server port (default: `3001`) |
| `PORTFOLIO_URL` | Allowed CORS origin (your frontend URL) |

### `horror-portfolio/.env.local`

| Variable | Description |
|---|---|
| `JWT_SECRET` | Must match the backend JWT_SECRET exactly |
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## License

Private — all rights reserved.
