# 💸 Smart Expense Tracker (Pro)

A production-grade full-stack expense tracking application featuring multi-role management, automated activity logging, and intelligent data analytics.

## 🚀 Key Features

- **👑 Admin Control Panel:** Manage users, update roles (USER/ADMIN), and enable/disable accounts.
- **📊 Activity Logging:** Automated tracking of login/logout times, session duration, and IP/Device auditing.
- **📥 Intelligent Import:** Upload Excel (.xlsx) or CSV files with smart column detection for bulk expense tracking.
- **🗓️ Historical Analytics:** View spending trends from any month or year with interactive filters and charts.
- **🔐 Secure Auth:** JWT-based authentication with Refresh tokens and Role-Based Access Control (RBAC).
- **🔄 Recurring Expenses:** Automated daily processing of monthly recurring transactions.
- **🌙 Dark Mode:** Sleek, modern SaaS-style UI with full theme support.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Lucide Icons, Chart.js
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (Access + Refresh Tokens), Bcrypt.js

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 2. Installation
Install dependencies for both client and server from the root directory:
```bash
npm run install:all
```

### 3. Environment Setup
Create a `.env` file in the `server` directory and a `.env.local` in the `client` directory based on the provided `.env.example` files.

#### Backend (`server/.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
CLIENT_URL=http://localhost:3000
```

#### Frontend (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Running the Project
Launch both the frontend and backend concurrently from the root:
```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## 🛡️ Admin Setup
To promote a user to Admin, you can use the included utility script:
```bash
cd server
node src/utils/promote-admin.js your-email@example.com
```

## 📋 API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Admin (Restricted)
- `GET /api/admin/users`: List all users + stats
- `PATCH /api/admin/users/:id/role`: Change user role
- `PATCH /api/admin/users/:id/status`: Enable/Disable user
- `GET /api/admin/logs/:userId`: Detailed session logs

### Data
- `GET /api/expenses`: Paginated expenditures
- `POST /api/expenses/import`: Excel/CSV parser
- `GET /api/analytics/monthly`: Year-to-date summary
- `GET /api/analytics/category`: Spend breakdown

## 📄 License
MIT
