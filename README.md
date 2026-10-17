# PrepIntel - AI-Powered Exam Preparation & Analytics Platform

PrepIntel is a full-stack, AI-driven preparation and performance analytics platform tailored for competitive examinations (JEE Advanced, JEE Main, NEET, CET). It provides a feature-rich **Student Portal** for tests, streaks, and smart AI insights alongside an **Admin Panel** for batch management, question banks, and cohort analytics.

---

## 🚀 Tech Stack

- **Frontend:** React 19 (Vite), TailwindCSS, Framer Motion, Recharts, Lucide Icons, React Router v7
- **Backend:** Node.js, Express.js
- **Database:** MySQL (via `mysql2`)
- **Authentication:** JWT (JSON Web Tokens) & `bcryptjs`
- **AI Integration:** Groq SDK (LLM-based personalized student & admin insights)

---

## 📁 Project Structure

```
Loop/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   ├── pages/              # Student pages & Admin pages
│   │   └── services/           # API and auth client services
│   └── package.json
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Database connection & auto-migration
│   │   ├── controllers/        # Request handlers & logic
│   │   ├── middleware/         # JWT verification & role authorization
│   │   ├── routes/             # REST API endpoints
│   │   └── server.js           # Server entry point
│   ├── .env                    # Environment variables
│   └── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed and running locally:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (or XAMPP / MariaDB)

---

## 🛠️ Getting Started

### 1. Database & Environment Configuration

1. Make sure your local **MySQL Server** service is running.
2. Check or update the backend environment configuration in `server/.env`:

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=prepintel_db
PORT=5000
JWT_SECRET=prepintel_super_secret_key_2025
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key
```

> **Note:** The backend automatically executes `CREATE DATABASE IF NOT EXISTS prepintel_db`, creates all required tables, and seeds the initial Super-Admin user upon startup.

---

### 2. Start the Backend Server

Open a terminal window and run:

```bash
cd Loop/server
npm install
npm run dev
```

- **Backend API:** `http://localhost:5000`

---

### 3. Start the Frontend Client

Open a second terminal window and run:

```bash
cd Loop/client
npm install
npm run dev
```

- **Frontend Application:** `http://localhost:5173`

---

## 🔑 Default Credentials

The system seeds a default Super-Admin account automatically:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super-Admin** | `admin@gmail.com` | `Admin@123` |

*(Students can register freely through the Sign Up page).*

---

## 🌐 API Overview

| Route Prefix | Description |
| :--- | :--- |
| `/api/auth` | Student & Admin login, registration, and profile info |
| `/api/tests` | Test scheduling, submission, and test bank management |
| `/api/analytics` | Exam analytics, performance metrics, and history |
| `/api/insights` | Groq AI-powered recommendations & insights |
| `/api/admin` | Student management, batch comparisons, and platform overview |

---

## 📊 Performance Analytics

PrepIntel combines test results, performance history, and AI-generated insights to help students identify areas for improvement. The analytics dashboard also supports administrators in reviewing student progress and comparing performance across batches.

## 📜 Available Scripts

### Backend (`Loop/server`)
- `npm run dev` - Starts server in development mode using `nodemon`
- `npm start` - Starts server with Node.js

### Frontend (`Loop/client`)
- `npm run dev` - Starts Vite development server
- `npm run build` - Builds production bundle
- `npm run preview` - Locally previews the production build
