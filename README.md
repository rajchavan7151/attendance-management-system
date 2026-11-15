# EduTrack - Smart College Attendance Management System 🎓

A modern, full-stack **MERN (MongoDB, Express, React, Node.js)** Attendance Management and Analytics System built with **Real-Time WebSockets (Socket.IO)**, **Tailwind CSS**, and **Docker**. Designed specifically for college academic evaluation and production-grade demonstration.

---

## 🌟 Key Features

### 👑 1. Admin Portal (`/admin`)
- **Dashboard Analytics**: Real-time metric cards for total students, faculty teachers, classes, subjects, and college-wide attendance rate.
- **Attendance Trends Chart**: Interactive area chart powered by Recharts displaying daily attendance fluctuations.
- **Student Management**: Full CRUD operations (Add, Edit, Delete), class allocation, roll number tracking, search & filter.
- **Faculty Management**: Manage instructors, departments, employee IDs, and assigned subjects/classes.
- **Curriculum Catalog**: Create and configure classes, sections, academic semesters, and course credits.
- **Attendance Registry & Audit**: Filter all college attendance records by class, subject, date, and status with printable export reports.
- **User Management**: View and control user accounts, toggle active/disabled status.

### 👨‍🏫 2. Teacher Portal (`/teacher`)
- **Faculty Dashboard**: Assigned courses and classes overview, today's marked count, course attendance averages.
- **Interactive Attendance Marking**:
  - Class, subject, and date selectors (defaults to current date).
  - One-click **"Mark All Present"** and **"Mark All Absent"** bulk actions.
  - Granular **Present**, **Absent**, and **Late** toggle buttons for each student.
  - Remarks field for absence excuses or lab attendance notes.
  - Direct persistence to MongoDB with unique duplicate prevention (`{ student, subject, class, date }`).
- **Edit Attendance**: Correct and update previously submitted attendance sessions with real-time sync.
- **Attendance Session History**: Historical log of all conducted lectures with date, class, and subject filters.
- **Class Compliance Reports**: Visual student-by-student attendance percentages highlighting **Defaulters (< 75%)** and **Safe (&ge; 75%)** students.

### 🎓 3. Student Portal (`/student`)
- **Personal Dashboard**: Total lectures conducted, lectures attended, unexcused absences, and overall attendance percentage.
- **75% Mandatory Attendance Compliance Gauge**:
  - **Safe Zone**: Calculates exact margin of lectures the student can afford to miss without falling below 75%.
  - **Defaulter Warning**: Calculates exact consecutive lectures needed to regain safe standing.
- **Subject-Wise Analytics**: Interactive bar chart and course cards with progress bars and credit breakdowns.
- **Attendance Ratio Chart**: Visual donut/pie chart comparing attended vs absent sessions.
- **Attendance Timeline**: Full chronological history of lectures attended with status and faculty details.

### ⚡ 4. Real-Time WebSockets (Socket.IO)
- When a teacher marks or updates attendance:
  - Admin dashboard metrics and recent activity streams auto-refresh immediately without page reload.
  - Enrolled students receive a live toast notification on their screen (`"🎓 Live Attendance: You were marked Present for 2026-11-13"`).
  - Student attendance statistics and gauges update in real-time.
  - Navbar features a pulsing live connection badge (`● Real-time Live`).

---

## 🔑 Demo Login Accounts

Pre-seeded and ready for instant evaluation:

| Role | Email Address | Password | Permissions & Highlights |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@college.com` | `Admin123` | Full administrative control, all classes, teachers, students, analytics |
| **👨‍🏫 Teacher** | `teacher@college.com` | `Teacher123` | Prof. Sarah Jenkins (CSE) — Mark attendance, edit records, view reports |
| **🎓 Student** | `student@college.com` | `Student123` | Alex Morgan (CS2024-001) — Personal stats, 75% compliance gauge, logs |

> **Tip for Evaluation:** The login page (`http://localhost:5173/login`) features **Quick 1-Click Demo Buttons** for Admin, Teacher, and Student for instant sign-in without manual typing!

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM v7, Axios, Lucide React Icons, Recharts, React Hot Toast.
- **Backend**: Node.js, Express.js, REST API, JSON Web Tokens (JWT), Bcrypt.js, Express-Validator, Morgan HTTP Logger.
- **Real-Time**: Socket.IO (Server & Client).
- **Database**: MongoDB, Mongoose ODM with compound unique index validation.
- **DevOps**: Docker, Docker Compose, Nginx, Multi-Stage builds.

---

## 🚀 Quick Start Guide (Windows)

### Option A: 1-Click Launch (Recommended for Windows)

In the `Attendance Management System` folder:
1. Double click **`start-all.bat`**
   - Automatically starts MongoDB on port `27017`
   - Starts Express Backend on `http://localhost:5000`
   - Starts Vite Frontend on `http://localhost:5173`
2. Open your browser at **`http://localhost:5173`**!

---

### Option B: Manual Command Line Execution

#### Step 1: Start MongoDB
Ensure MongoDB is running locally on port `27017` or start it via:
```powershell
& "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "backend\data\db" --port 27017
```

#### Step 2: Seed the Database
```powershell
cd backend
npm run seed
```
*Creates classes, subjects, faculty teachers, 12 sample students, and 300 historical attendance records!*

#### Step 3: Run the Backend API
```powershell
cd backend
npm start
```
*Server runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)*

#### Step 4: Run the React Frontend
```powershell
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🐳 Docker & Docker Compose Setup

Run the complete multi-container stack (Frontend + Backend + MongoDB) with a single command:

```bash
docker-compose up --build
```

- **Frontend UI**: `http://localhost`
- **Backend API**: `http://localhost:5000`
- **MongoDB**: `localhost:27017`

To run in the background (detached):
```bash
docker-compose up -d
```

To stop containers:
```bash
docker-compose down
```

---

## ☁️ Production Cloud Deployment Guide

### 1. MongoDB Database (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist network access (`0.0.0.0/0`).
3. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/attendance_db?retryWrites=true&w=majority
   ```

### 2. Backend Deployment (Render.com)
1. Push repository to GitHub.
2. In Render, click **New + Web Service** and connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string*
   - `CLIENT_URL`: *Your Vercel frontend URL*
5. Run the seed script via Render Shell or remotely: `npm run seed`.

### 3. Frontend Deployment (Vercel)
1. In Vercel, click **Add New Project** and import the repository.
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
3. Set Environment Variables:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-render-backend.onrender.com`
4. Deploy! Vercel automatically compiles the production build into its global edge CDN.

---

## 📋 Evaluation Checklist Demonstration

Here is the exact step-by-step walkthrough to demonstrate all nine evaluation criteria to your examiner:

| # | Checklist Point | Demonstration Steps |
| :-: | :--- | :--- |
| **1** | **Role-Based Authentication** | Open `http://localhost:5173/login`. Show the 3 quick login buttons. Log in as **Admin**, observe the admin sidebar & metrics. Log out. Log in as **Teacher**, observe teacher controls. Log in as **Student**, observe restricted student dashboard. |
| **2** | **Admin Dashboard & CRUD** | As Admin, open `Admin Dashboard` to showcase the Recharts attendance trend graph and class breakdowns. Navigate to `Students` and click **"Add New Student"** to add a test student; show the new student in the list. |
| **3** | **Class & Subject Management** | Navigate to `Academic Curriculum`. Show sections (`CS-3A`, `IT-3B`) and subjects (`CS301`, `CS302`, etc.) with credits and assigned faculty. |
| **4** | **Marking Attendance to MongoDB** | Log in as Teacher (`teacher@college.com`). Click **"Mark Attendance"**. Select class `CS-3A` and subject `CS301`. Click **"Mark All Present"**, toggle 1-2 students to **"Absent"**, and click **"Save Attendance to MongoDB"**. Show the success toast confirmation. |
| **5** | **Prevent Duplicate Records** | On the Mark Attendance page, submit attendance again for the same class, subject, and date. Show that records update smoothly without duplicate key errors in MongoDB. |
| **6** | **Attendance Percentage Calculation** | Navigate to `Class Reports`. Show the exact attended/total ratios, percentage calculations, and the **Defaulter Warning (<75%)** tag. |
| **7** | **Student Personal Dashboard** | Log in as Student (`student@college.com`). Show the **75% Compliance Banner** (demonstrating safe margin or lectures needed), subject-wise bar chart, and presence ratio pie chart. |
| **8** | **Real-Time Socket.IO Synchronization** | Open two browser windows side by side: one logged in as **Teacher** on `/teacher/mark` and one logged in as **Student** on `/student`. As the teacher, mark attendance and click Save. Notice the student window instantly displays a **live toast notification** and updates its statistics without page refresh! |
| **9** | **Docker & Code Architecture** | Show `docker-compose.yml`, `backend/Dockerfile`, and `frontend/Dockerfile`. Highlight clean directory separation (`controllers/`, `models/`, `routes/`, `middleware/`, `config/`). |

---

## 📂 Project Directory Structure

```
attendance-management-system/
├── docker-compose.yml           # Multi-container orchestration (Mongo, Express, Vite/Nginx)
├── README.md                    # Project documentation & deployment manual
├── .gitignore                   # Version control ignore definitions
├── .env.example                 # Root environment template
├── start-all.bat                # Windows 1-click startup script (Mongo + Backend + Frontend)
├── start-mongodb.bat            # Local MongoDB starter
├── start-backend.bat            # Backend API runner
├── start-frontend.bat           # Frontend Vite dev runner
├── seed-data.bat                # Demo data seeder
│
├── backend/
│   ├── package.json
│   ├── server.js                # Express app & Socket.IO server initialization
│   ├── Dockerfile               # Backend Node.js production container
│   ├── .env                     # Backend local environment variables
│   ├── .env.example
│   ├── scripts/
│   │   └── seed.js              # Database seeder (Users, Classes, Subjects, Records)
│   └── src/
│       ├── config/              # MongoDB connection configuration (db.js)
│       ├── models/              # Mongoose Schemas (User, Student, Teacher, Class, Subject, Attendance)
│       ├── controllers/         # REST API Controllers (auth, student, teacher, class, attendance, dashboard)
│       ├── routes/              # Express route declarations with role guards
│       ├── middleware/          # JWT authentication, role authorization, validation middleware
│       └── utils/               # Socket.IO emitters, percentage calculations
│
└── frontend/
    ├── package.json
    ├── vite.config.js           # Vite dev proxy configuration
    ├── tailwind.config.js       # Tailwind CSS theme configuration
    ├── index.html               # Main HTML entry point
    ├── Dockerfile               # Multi-stage Dockerfile (Vite build + Nginx alpine)
    ├── nginx.conf               # Nginx reverse proxy configuration
    ├── .env                     # Frontend environment variables
    └── src/
        ├── App.jsx              # Client-side router & route protection
        ├── main.jsx             # React DOM root
        ├── index.css            # Tailwind directives & styles
        ├── context/             # AuthContext.jsx & SocketContext.jsx
        ├── services/            # Axios API wrappers (auth, student, teacher, attendance, dashboard)
        ├── components/          # Reusable UI (Navbar, Sidebar, StatCard, Modal, ProtectedRoute, Layout)
        └── pages/
            ├── Login.jsx        # Professional portal login with 1-click demo buttons
            ├── admin/           # Admin Dashboard, StudentMgmt, TeacherMgmt, Curriculum, Reports, UserMgmt
            ├── teacher/         # Teacher Dashboard, MarkAttendance, EditAttendance, History, Reports
            └── student/         # Student Dashboard, SubjectWiseAttendance, StudentAttendanceHistory
```

---

## 🛡️ License & Academic Integrity
Developed as a Full-Stack MERN Project for Academic Evaluation. All rights reserved.
