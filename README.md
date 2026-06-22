# 🚀 LevelUp — Premium Life OS

<p align="center">
  <em>The ultimate, full-stack, AI-powered Life Operating System for ambitious developers and professionals.</em>
</p>

---

## 📖 Overview

**LevelUp** is not just an application; it is a **Premium Life Operating System**. Built specifically for ambitious individuals, it completely eliminates the need for fragmented productivity apps. Instead of juggling a dozen different trackers for your habits, job applications, coding practice, finances, and fitness, LevelUp centralizes your entire life into a single, beautiful, glassmorphic Command Center.

Powered by the **Google Gemini AI API**, LevelUp acts as your personal coach—dynamically generating habit routines, acting as an AI Chief Financial Officer, and offering intelligent insights to prevent developer burnout.

---

## ✨ Core Modules & Features

### 💻 The Developer Engine
*   **DSA Tracker:** Track your Data Structures and Algorithms mastery. Includes a Spaced-Repetition Revision Queue, Pattern Mastery analytics, Weak Area detection, and a Company-specific preparation mode.
*   **Job Pipeline:** A fully functional, responsive Kanban board to track job and internship applications from 'Applied' to 'Offer'. Features a massive CRM drawer to log recruiter contacts, interview notes, and negotiation status.
*   **Projects Workspace:** A Jira-style pipeline integrated with GitHub. Track your real-time commit history, log technical 'Learnings' to avoid repeating bugs, and use the AI Intelligence tab for architectural advice.

### 🌱 Personal Growth
*   **AI Habit Planner:** Uses Google Gemini to dynamically generate customized, step-by-step daily habit routines based on your ultimate life goals. Includes a GitHub-style annual contribution heatmap.
*   **Goals & Milestones:** Break massive long-term goals down into actionable milestones mapped across a comprehensive Monthly Goals timeline view.
*   **Reflections:** A digital journal featuring a dynamic Mood Chart and AI sentiment analysis that reads your entries to detect signs of burnout or imposter syndrome.

### 🏋️ Holistic Health & Lifestyle
*   **Fitness Engine:** Essentially MyFitnessPal + Hevy built-in. Track macro-nutrition, log strength training volume, monitor muscle group balance, and securely upload physique progress photos to the cloud.
*   **Finance & AI CFO:** Log daily transactions and track emotional spending. Features an **AI CFO Chat Modal** where you can ask your AI financial advisor to optimize your budget in natural language.

### 📊 Global Analytics
*   **Life Radar & Cross-Module Performance:** Visualizes your performance across all modules to calculate your true 'Life ROI'. It correlates data (e.g., how your sleep affects your coding success) to give you a holistic view of your productivity.

---

## 🛠️ Tech Stack & Architecture

LevelUp is a highly scalable, robust MERN/PERN stack application deployed with a microservices-inspired client/server separation.

### Frontend
*   **Framework:** React 18, Vite
*   **Styling:** Tailwind CSS, custom glassmorphism design system
*   **State Management:** Zustand
*   **Animations & Data Viz:** Framer Motion, Recharts
*   **PWA:** Fully configured as a Progressive Web App for native mobile installation

### Backend
*   **Framework:** Node.js, Express.js
*   **Security:** Helmet, `express-rate-limit`, HttpOnly JSON Web Tokens (JWT) for secure session management.
*   **Database:** PostgreSQL (hosted on NeonDB)
*   **ORM:** Prisma ORM for bulletproof end-to-end type safety

### External APIs
*   **Google Gemini API:** Powers the AI Habit Planner, AI CFO, and Reflection insights.
*   **GitHub OAuth:** Secure, frictionless, one-click authentication.
*   **Cloudinary API:** Secure cloud storage for fitness progress photos.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
*   Node.js (v18+)
*   A PostgreSQL Database URL
*   API Keys for Google Gemini, GitHub OAuth, and Cloudinary.

### 1. Clone the repository
```bash
git clone https://github.com/sDash151/LevelUp.git
cd LevelUp
```

### 2. Setup the Backend
Navigate to the server directory:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and configure the following variables:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="your_postgresql_connection_string"

# JWT Secrets (Generate random hex strings)
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cross-Origin
CORS_ORIGIN=http://localhost:5173

# External APIs
GEMINI_API_KEY="your_gemini_key"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GITHUB_CALLBACK_URL="http://localhost:5000/api/v1/auth/github/callback"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

Initialize the database and start the server:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Setup the Frontend
Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`. The Vite proxy is already configured to route `/api` requests to `http://localhost:5000`.

---

## 👨‍💻 Author

**Sourav Dash Adhikari**
*   MCA Graduate, Atria Institute of Technology, Bangalore
*   MERN Stack Fast Track Program, AccioJob Bangalore

*LevelUp was built as a passion project to solve the fragmentation of modern productivity tools, proving the capability of full-stack AI integration.*
