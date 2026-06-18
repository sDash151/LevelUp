# 🚀 LevelUp — Your Life Operating System

A **premium production-ready PWA** for tracking and leveling up every dimension of your life.

![Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | Unified overview of all life metrics at a glance |
| ✅ **Habits** | Daily habit tracker with streaks, categories, and completion heatmap |
| 🎯 **Goals** | Weekly/monthly goals with milestones and progress tracking |
| 📝 **Reflections** | Daily/weekly journaling with mood tracking and trend charts |
| 💻 **DSA Tracker** | Coding problem tracker with difficulty, topics, and platforms |
| 💼 **Job Tracker** | Job application pipeline with 7-stage status tracking |
| 📁 **Projects** | Side project manager with tech stack, GitHub/live links |
| 💰 **Finance** | Income/expense tracker with category breakdown and savings rate |
| 🏋️ **Fitness** | Workout logger with exercises, daily metrics (weight/steps/sleep) |
| 📈 **Analytics** | Cross-domain charts — habit trends, weekly activity, finance summary |
| ⚡ **Insights** | AI-style smart insights across all 8 life domains |
| 👤 **Profile** | Account settings, preferences, and security |

## 🛠 Tech Stack

### Frontend
- **React** (JavaScript, Vite 6)
- **Tailwind CSS v4** (CSS-first config)
- **Framer Motion** (animations)
- **React Router v6** (routing)
- **Zustand** (state management)
- **TanStack Query** (server state)
- **Recharts** (charts/graphs)
- **Lucide Icons**
- **PWA** (service workers, offline support, installable)

### Backend
- **Node.js + Express**
- **PostgreSQL + Prisma ORM**
- **JWT Authentication** (access + refresh tokens)
- **Zod** (validation)
- **Helmet, CORS, Compression** (security)

### Infrastructure
- **Docker + Docker Compose** (full stack deployment)
- **Nginx** (static serving, API proxy, gzip, caching)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd LevelUP

# Server
cd server
npm install
cp .env.example .env  # Configure your database URL

# Client
cd ../client
npm install
```

### 2. Database Setup

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Run Development

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

### 4. Docker (Production)

```bash
docker compose up --build -d
```

Access at `http://localhost`

---

## 📁 Project Structure

```
LevelUP/
├── client/                         # React Frontend
│   ├── src/
│   │   ├── app/                    # App root, Router, ErrorBoundary, PWA
│   │   ├── design-system/          # Components, layouts, theme
│   │   │   ├── components/         # Button, Card, Input, Modal, Badge, etc.
│   │   │   └── layouts/            # AppLayout, SideNav, MobileNav
│   │   ├── features/               # Feature modules
│   │   │   ├── auth/               # Login, Signup, ForgotPassword
│   │   │   ├── dashboard/          # Dashboard overview
│   │   │   ├── habits/             # Habit tracker
│   │   │   ├── goals/              # Goal tracker
│   │   │   ├── reflections/        # Journal & mood
│   │   │   ├── dsa/                # DSA problem tracker
│   │   │   ├── jobs/               # Job application pipeline
│   │   │   ├── projects/           # Project manager
│   │   │   ├── finance/            # Income/expense tracker
│   │   │   ├── fitness/            # Workout logger
│   │   │   ├── analytics/          # Cross-domain analytics
│   │   │   ├── insights/           # Smart insights
│   │   │   └── profile/            # Settings & account
│   │   └── shared/                 # Stores, utils, hooks
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                         # Express Backend
│   ├── src/
│   │   ├── config/                 # Database, env
│   │   ├── modules/                # Feature modules (modular monolith)
│   │   │   ├── auth/               # JWT auth, OAuth
│   │   │   ├── habits/             # Habit CRUD
│   │   │   ├── goals/              # Goal CRUD
│   │   │   ├── dashboard/          # Aggregated stats
│   │   │   ├── reflections/        # Reflection CRUD
│   │   │   ├── dsa/                # DSA problem CRUD
│   │   │   ├── jobs/               # Job application CRUD
│   │   │   ├── projects/           # Project CRUD
│   │   │   ├── finance/            # Transaction CRUD
│   │   │   ├── fitness/            # Workout + daily log CRUD
│   │   │   ├── analytics/          # Cross-module analytics
│   │   │   └── insights/           # Smart insights engine
│   │   ├── routes/                 # Route aggregator
│   │   └── shared/                 # Middlewares, errors, utils
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🏗 Architecture

```
Client (React)  →  Nginx (proxy)  →  Express API  →  PostgreSQL
     ↑                                    ↑
  Zustand                            Prisma ORM
  TanStack Query                     Zod Validation
  Framer Motion                      JWT Auth
```

**Server Module Pattern:**
```
Route → Controller → Service → Repository → Prisma
```

Every module follows this exact 5-file structure:
- `*.validation.js` — Zod schemas
- `*.repository.js` — Database queries
- `*.service.js` — Business logic + ownership
- `*.controller.js` — HTTP handlers
- `*.routes.js` — Express routes

---

## 📊 Build Stats

| Metric | Value |
|--------|-------|
| Total Modules | 2,866 |
| Build Time | 6.66s |
| Errors | 0 |
| Code-Split Pages | 14 chunks |
| PWA Precache | 49 entries |
| CSS Bundle | 50.53 KB (9.19 KB gzip) |
| Total Bundle | ~1,080 KB |

---

## 📄 License

MIT
