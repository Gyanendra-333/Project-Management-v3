# 🚀 ProjectHub — Advanced MERN Project Management System

A production-style full-stack application built with the MERN stack featuring JWT auth, role-based access, real-time notifications, file uploads, activity logs, and a clean Tailwind UI with dark mode.

---

## 📁 Project Structure

```
project-management/
├── backend/          # Express + MongoDB API
└── frontend/         # React + Tailwind UI
```

---

## ✨ Features

### Core

- **JWT Authentication** — Login, Register, protected routes
- **Role-Based Access** — Admin & User roles
- **Projects CRUD** — Create, read, update, delete (Admin only for create/update/delete)
- **File Uploads** — Up to 3 attachments per project via Multer
- **Dashboard Analytics** — Charts with Recharts (status breakdown, stats, ending soon)
- **User Management** — Admin can create/update/delete users and change roles

### Bonus (All Implemented)

- 🌙 **Theme Toggle** — Dark/Light mode via Tailwind `dark:` classes
- 🔔 **Real-time Notifications** — Socket.io for live project/user events
- 📋 **Activity Logs** — Every action is logged with user + timestamp
- 🔍 **Search, Filter, Pagination** — On both Projects and Users pages
- **Axios Interceptors** — Auto-attach JWT, global 401 handling
- **Context API** — Auth, Theme, Notifications via React Context
- **Debounced Search** — Smooth search without excess API calls

---

## 🛠️ Tech Stack

| Layer       | Tech                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| Frontend    | React, React Router v6, Tailwind CSS, Axios, Recharts, Socket.io-client |
| Backend     | Node.js, Express.js, MongoDB, Mongoose, Socket.io                       |
| Auth        | JWT, bcryptjs                                                           |
| File Upload | Multer (local storage)                                                  |
| State       | Context API                                                             |

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js >= 16
- MongoDB running locally (or provide Atlas URI in `.env`)

### 1. Clone & Install Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/project_management
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Start backend:

```bash
npm run dev     # development (nodemon)
npm start       # production
```

### 2. Install & Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5000`

---

## 🔑 Default Admin Setup

Since only Admins can create users, register via `/register` first, then manually update your role in MongoDB:

```bash
mongosh
use project_management
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

Or use this seed script:

```bash
cd backend
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' });
  console.log('Admin created: admin@test.com / admin123');
  process.exit(0);
});
"
```

---

## 📡 API Endpoints

### Auth

| Method | Endpoint             | Access  |
| ------ | -------------------- | ------- |
| POST   | `/api/auth/register` | Public  |
| POST   | `/api/auth/login`    | Public  |
| GET    | `/api/auth/me`       | Private |

### Projects

| Method | Endpoint                                     | Access  |
| ------ | -------------------------------------------- | ------- |
| GET    | `/api/projects?search=&status=&page=&limit=` | Private |
| GET    | `/api/projects/:id`                          | Private |
| POST   | `/api/projects` (multipart)                  | Admin   |
| PUT    | `/api/projects/:id` (multipart)              | Admin   |
| PATCH  | `/api/projects/:id/status`                   | Private |
| DELETE | `/api/projects/:id`                          | Admin   |

### Users

| Method | Endpoint                                | Access        |
| ------ | --------------------------------------- | ------------- |
| GET    | `/api/users?search=&role=&page=&limit=` | Admin         |
| POST   | `/api/users`                            | Admin         |
| PUT    | `/api/users/profile`                    | Private (own) |
| PUT    | `/api/users/:id`                        | Admin         |
| DELETE | `/api/users/:id`                        | Admin         |

### Dashboard

| Method | Endpoint         | Access |
| ------ | ---------------- | ------ |
| GET    | `/api/dashboard` | Admin  |

### Activity

| Method | Endpoint                             | Access |
| ------ | ------------------------------------ | ------ |
| GET    | `/api/activity?page=&limit=&entity=` | Admin  |

---

## 🔌 Socket.io Events

| Event          | Direction       | Payload                        |
| -------------- | --------------- | ------------------------------ |
| `join`         | Client → Server | `userId`                       |
| `notification` | Server → Client | `{ type, message, timestamp }` |

Notification types: `project_created`, `project_updated`, `project_deleted`, `project_assigned`, `status_updated`, `user_created`, `user_deleted`

---

## 📱 Pages

| Page           | Route                | Access |
| -------------- | -------------------- | ------ |
| Login          | `/login`             | Public |
| Register       | `/register`          | Public |
| Dashboard      | `/`                  | Admin  |
| Projects       | `/projects`          | All    |
| Project Detail | `/projects/:id`      | All    |
| Create Project | `/projects/new`      | Admin  |
| Edit Project   | `/projects/:id/edit` | Admin  |
| Users          | `/users`             | Admin  |
| Activity Log   | `/activity`          | Admin  |
| Profile        | `/profile`           | All    |

---

## 📊 Evaluation Criteria Coverage

| Criteria                        | Implementation                              |
| ------------------------------- | ------------------------------------------- |
| Authentication & Security (20%) | JWT + bcrypt + middleware guards            |
| CRUD accuracy (20%)             | Full project & user CRUD with validation    |
| Code quality (20%)              | Modular MVC backend, Context-based frontend |
| UI/UX (20%)                     | Tailwind + dark mode + responsive layout    |
| File Upload + Dashboard (10%)   | Multer + Recharts analytics                 |
| Documentation & Git usage (10%) | This README + Postman collection            |
