# 📚 StudySphere — Academic Study Resources Hub

A modern, full-stack **MERN** web application built for students and educators to discover, organize, filter, and share academic study resources (cheat sheets, lecture notes, solved past exams, and tutorial guides) in a secure, collaborative environment.

---

## 🌟 Key Features

1. **Public Landing Page**:
   - High-impact hero section with value proposition and category preview badges.
   - Direct call-to-action buttons for "Sign Up" and "Log In".
   - Feature highlights explaining search, community curation, and security.

2. **Secure Authentication Flow**:
   - **Client & Server Validation**: Full validation of names, email formats, and matching passwords.
   - **Password Security**: Passwords salted and hashed with `bcryptjs`.
   - **Duplicate Email Prevention**: Instant rejection with user-friendly error banners.
   - **Post-Registration Redirect**: Seamless redirect to Log In page with a green confirmation alert.
   - **Session Management**: Stateless authentication powered by JSON Web Tokens (JWT) stored in `localStorage` and sent via `Authorization: Bearer <token>`.
   - **One-Click Logout**: Clears authentication credentials and redirects to login.

3. **Protected Study Resources Dashboard**:
   - Protected route wrapper (`<ProtectedRoute />`) that checks session state and intercepts unauthorized requests.
   - Personalized greeting banner with the authenticated user's name: *"Welcome back, [Name] 👋"*.
   - Live analytics metrics: Total Resources Available, Disciplines Covered, and Your Contributions.
   - Real-time search query box (searches across titles, descriptions, and `#tags`).
   - Dynamic discipline filter (Computer Science, Mathematics, Physics, Biology, Chemistry, Engineering, Business, Other).
   - Format filter (Notes, Cheat Sheet, Past Exam, Textbook Guide, Project Tutorial, Video Lecture).
   - "My Uploads Only" quick toggle.

4. **Full CRUD Resource Management**:
   - **Create**: Add new resources with modal dialog validation.
   - **Read**: Live fetching from MongoDB via Mongoose.
   - **Update**: Edit existing resource details (restricted to the resource owner).
   - **Delete**: Remove resources with confirmation dialog (restricted to the resource owner).
   - **External Links**: Direct one-click navigation to external Google Drive, GitHub, or PDF links.

5. **Security & Production Hardening**:
   - Configured with `helmet` for security headers.
   - Strict CORS configuration supporting local Vite development and production domains (e.g. `*.vercel.app`).
   - Centralized error-handling middleware.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Lucide React, Modern Vanilla CSS Design System |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas via Mongoose (with automated local persistence fallback) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **DevOps / Hosting** | Vercel (Frontend), Render (Backend) |

---

## 📁 Repository Structure

```
Flexi Small Project/
├── .gitignore                      # Git ignore rules for node_modules, .env, and dist
├── README.md                       # Complete documentation, setup & deploy guides
├── package.json                    # Workspace root scripts
├── server/                         # Backend Express API
│   ├── .env                        # Local backend environment variables (git-ignored)
│   ├── .env.example                # Backend environment template
│   ├── package.json                # Server dependencies and scripts
│   ├── test-suite.js               # Automated verification test suite (16 tests)
│   └── src/
│       ├── config/
│       │   └── db.js               # MongoDB Atlas connection handler
│       ├── controllers/
│       │   ├── authController.js   # Sign-up, login, get profile
│       │   └── resourceController.js # CRUD handlers with search & filters
│       ├── middleware/
│       │   ├── auth.js             # JWT bearer verification middleware
│       │   └── errorHandler.js     # Centralized error handler
│       ├── models/
│       │   ├── User.js             # User schema with bcrypt pre-save hook
│       │   └── Resource.js         # Study resource schema with timestamps
│       ├── routes/
│       │   ├── authRoutes.js       # /api/auth routes
│       │   └── resourceRoutes.js   # /api/resources routes
│       └── server.js               # Express application entrypoint
└── client/                         # Frontend React + Vite
    ├── .env                        # Local frontend environment variables (git-ignored)
    ├── .env.example                # Frontend environment template
    ├── index.html                  # HTML5 entry with Outfit & Inter typography
    ├── package.json                # Client dependencies and scripts
    ├── vercel.json                 # Vercel SPA routing rewrites configuration
    ├── vite.config.js              # Vite configuration with /api proxy
    └── src/
        ├── api/
        │   └── client.js           # Axios instance with JWT interceptor & 401 handling
        ├── context/
        │   └── AuthContext.jsx     # Authentication state provider
        ├── components/
        │   ├── Navbar.jsx          # Dynamic navbar with session pill & logout
        │   ├── Footer.jsx          # Academic footer
        │   ├── ProtectedRoute.jsx  # Route guard redirecting to /login
        │   ├── ResourceCard.jsx    # Study card with tags, badges, and action buttons
        │   ├── ResourceModal.jsx   # Create & Edit resource modal dialog
        │   └── Toast.jsx           # Toast alerts
        ├── pages/
        │   ├── LandingPage.jsx     # Public hero & feature overview
        │   ├── SignUpPage.jsx      # Validated sign-up page
        │   ├── LogInPage.jsx       # Log-in page with success banner
        │   ├── DashboardPage.jsx   # Protected study resources dashboard
        │   └── NotFoundPage.jsx    # 404 handler
        ├── styles/
        │   └── index.css           # Modern design system (tokens, glassmorphism, animations)
        ├── App.jsx                 # Route definitions
        └── main.jsx                # React DOM render
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
Create a file named `.env` inside the `server/` directory (refer to `server/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studysphere?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_studyhub_production_change_me
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Note**: If `MONGODB_URI` is left blank or cannot connect during local testing, the server automatically enables an in-memory fallback store so that all endpoints, hashing, and CRUD features run immediately with zero friction.

### Frontend (`client/.env`)
Create a file named `.env` inside the `client/` directory (refer to `client/.env.example`):

```env
# In development (with Vite proxy), use:
VITE_API_URL=http://localhost:5000/api

# When deploying to production on Vercel, set this to your live Render backend URL:
# VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🚀 How to Run Locally

### Option 1: Quick Start (Both Servers Concurrently)

From the project root directory:

```bash
# 1. Install all dependencies (both server and client)
npm run install:all

# 2. Start both the backend and frontend servers concurrently
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Option 2: Running Individually

#### Terminal 1 — Start Backend Server:
```bash
cd server
npm install
npm run start
```

#### Terminal 2 — Start Frontend Client:
```bash
cd client
npm install
npm run dev
```

---

## 🧪 Automated Verification & Testing

The application includes an automated end-to-end API test suite in `server/test-suite.js` that tests all authentication flows, error scenarios, and CRUD capabilities.

To run the verification test suite:

```bash
# Ensure backend is running in another terminal, then run:
cd server
node test-suite.js
```

### Verification Checklist:

| # | Test Case | Target Endpoint | Expected Result | Status |
|---|---|---|---|---|
| 1 | Healthcheck | `GET /api/health` | 200 OK | ✅ **PASS** |
| 2 | Auth Guard Block | `GET /api/auth/me` | 401 Unauthorized (No Token) | ✅ **PASS** |
| 3 | Resource Guard Block | `GET /api/resources` | 401 Unauthorized (No Token) | ✅ **PASS** |
| 4 | Password Mismatch | `POST /api/auth/signup` | 400 Bad Request | ✅ **PASS** |
| 5 | Valid Registration | `POST /api/auth/signup` | 201 Created (Bcrypt hashed) | ✅ **PASS** |
| 6 | Duplicate Email Rejection | `POST /api/auth/signup` | 400 Bad Request ("Already exists") | ✅ **PASS** |
| 7 | Invalid Password Login | `POST /api/auth/login` | 401 Unauthorized | ✅ **PASS** |
| 8 | Valid Login & JWT | `POST /api/auth/login` | 200 OK + JWT Token returned | ✅ **PASS** |
| 9 | Profile Verification | `GET /api/auth/me` | 200 OK + User object | ✅ **PASS** |
| 10 | List Resources | `GET /api/resources` | 200 OK + Array of resources | ✅ **PASS** |
| 11 | Create Resource | `POST /api/resources` | 201 Created + ObjectId | ✅ **PASS** |
| 12 | Get Resource by ID | `GET /api/resources/:id` | 200 OK + Resource data | ✅ **PASS** |
| 13 | Update Resource | `PUT /api/resources/:id` | 200 OK (Owner authorized) | ✅ **PASS** |
| 14 | Search & Filter | `GET /api/resources?search=...` | 200 OK + Filtered results | ✅ **PASS** |
| 15 | Delete Resource | `DELETE /api/resources/:id` | 200 OK (Owner authorized) | ✅ **PASS** |
| 16 | Malformed Token Rejection | `GET /api/auth/me` | 401 Unauthorized ("Invalid token") | ✅ **PASS** |

---

## 🌐 Production Deployment Guide

### Part 1: Deploy Backend on Render

1. Create a free account at [render.com](https://render.com).
2. Push your project to a GitHub repository.
3. In Render Dashboard, click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name**: `studysphere-backend` (or your choice)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Under **Environment Variables**, add the following keys:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<your MongoDB Atlas connection string>`
   - `JWT_SECRET`: `<a secure random string>`
   - `CLIENT_URL`: `https://your-studysphere-client.vercel.app` (your Vercel frontend URL)
7. Click **Create Web Service**. Once deployed, copy your backend URL (e.g. `https://studysphere-backend.onrender.com`).

---

### Part 2: Deploy Frontend on Vercel

1. Create a free account at [vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api` (the Render URL from Part 1, followed by `/api`)
6. Click **Deploy**. Vercel will build and publish your app.
7. SPA routing is already configured via [client/vercel.json](file:///c:/Users/mara9/OneDrive/Desktop/Flexi%20Small%20Project/client/vercel.json) to handle routes like `/dashboard` and `/login` seamlessly without 404 errors.

---

## 📝 License
This project is open-source and available under the [ISC License](LICENSE).
