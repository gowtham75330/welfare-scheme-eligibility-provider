# All India Scholarship and Government Scheme Eligibility Portal

This is a complete full-stack web application built to help Indian citizens discover scholarships and welfare schemes they are eligible for. The platform includes both Central Government Schemes and Tamil Nadu Government Scholarships.

## Technology Stack

*   **Backend:** Node.js, Express, SQLite (sqlite3)
*   **Frontend:** React (Vite build tool), Tailwind CSS, React Router DOM
*   **Authentication:** JWT (JSON Web Tokens), bcrypt
*   **Icons:** Lucide-React

## Features

1.  **User Authentication:** Registration and Login with encrypted passwords.
2.  **Role Selection & Profile Generation:** Users enter detailed eligibility parameters (Role, Age, Gender, Religion/Caste Category, Income, Education level, State, District).
3.  **Dynamic Filtering Engine:** Backend logic accurately filters welfare schemes based on the exact user profile.
4.  **Admin Panel:** Admin can Add, Edit, and Delete schemes in real-time, and view all registered users.
5.  **Modern Scheme Cards:** View eligible schemes, requirements, and click 'Apply Now' to visit official portals.

---

## 🚀 Quick Start (Single Command)

To run the complete application (Backend + SQLite Database + Frontend + Automatic Browser Launch), run **one command**:

```bash
npm start
```

That's it! 
- ✅ Express backend starts on `http://localhost:5001`
- ✅ SQLite database (`scheme_portal.db`) connects and auto-seeds
- ✅ Vite frontend starts on `http://localhost:5173`
- 🌐 Your default browser automatically opens `http://localhost:5173`!

*(Alternative: You can also double-click `start.bat` or run `npm run dev`)*

---

## Manual Step-by-Step Setup (Optional)

Prerequisites: You must have **Node.js** installed on your system.

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
> The backend runs on `http://localhost:5001`. SQLite database `scheme_portal.db` connects automatically.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> The frontend dev server runs on `http://localhost:5173` and proxies all `/api` requests to backend port 5001.

---

## Usage Guide

*   **User Flow:** Click "Get Started", register an account, fill out your profile details (Role, Income, Category, State, etc.). Once saved, your Dashboard will show how many schemes match your exact profile. Click "View My Schemes" to apply.
*   **Admin Access:** On the login page, click "Switch to Admin Login". Use the default admin credentials:
    *   **Username:** admin
    *   **Password:** admin123
*   Once logged in as Admin, you can add new schemes or modify existing ones through the Admin Panel.

---

## Deployment Instructions

### Backend (Node.js API)
1. Deploy the backend folder to a service like **Render**, **Railway**, or **Heroku**.
2. Make sure to define `JWT_SECRET` in your environment variables.
3. *Note on SQLite:* SQLite is a file-based database. For ephemeral platforms like Render or Heroku, the database file will be wiped on restart. In a production environment, migrate the connection to a PostgreSQL or MySQL database, or use a persistent disk volume for SQLite.

### Frontend (React / Vite)
1. Update the API URLs in the frontend code (e.g., in `LoginPage.jsx`, `RegisterPage.jsx`, etc.) from `http://localhost:5000` to your deployed backend URL.
2. Run the build command:
    \`\`\`bash
    npm run build
    \`\`\`
3. Deploy the resulting `dist/` folder to a service like **Vercel**, **Netlify**, or **GitHub Pages**. (Vercel and Netlify support Vite apps out-of-the-box and handle the build process automatically).
