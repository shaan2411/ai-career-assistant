# 🚀 AI-Powered Student Career Assistant

> A full-stack MERN application that helps students supercharge their career readiness using AI-powered resume analysis, mock interviews, personalized learning paths, and intelligent job recommendations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v18+-green.svg)
![React](https://img.shields.io/badge/react-v18-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-v7-green.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [API Documentation](#api-documentation)
- [Database Collections](#database-collections)
- [AI Provider Configuration](#ai-provider-configuration)
- [Deployment Guide](#deployment-guide)
- [Future Enhancements](#future-enhancements)

---

## ✨ Features

### 🎓 Student Features
- **Authentication** — Register, login with JWT
- **Profile Management** — Education, experience, skills with completion tracking
- **Resume Upload & Analysis** — PDF/DOCX upload with AI-powered scoring (0-100) and ATS analysis
- **AI Professional Summary** — Auto-generate tailored professional summaries
- **Cover Letter Generator** — Job-specific cover letters from resume + job description
- **Skill Gap Analysis** — Identify missing skills for target roles
- **Career Path Suggestions** — AI-powered career trajectory recommendations
- **Mock Interviews** — AI-generated Technical & HR questions with real-time feedback
- **Job Recommendations** — Skill-matched job listings
- **Saved Jobs Tracker** — Kanban-style application tracker
- **Learning Roadmap** — Week-by-week personalized learning plans
- **AI Reports** — Resume analysis, career paths, weekly progress reports
- **PDF Export** — Export any AI report as a PDF

### 🔐 Admin Features
- **User Management** — View, activate/deactivate, delete users
- **Platform Analytics** — Growth charts, AI usage stats, feature popularity
- **Job Management** — Create, edit, delete job listings
- **AI Usage Statistics** — Per-user and per-feature breakdown

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 18, Bootstrap 5, Chart.js, React Router v6 |
| **Backend** | Node.js, Express.js 4 |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT) + bcrypt |
| **State Management** | React Context API |
| **AI Integration** | Google Gemini 1.5 Flash / OpenAI GPT-3.5 (switchable) |
| **File Upload** | Multer (local) |
| **PDF Parsing** | pdf-parse |
| **Email** | Nodemailer |
| **PDF Export** | jsPDF + jsPDF-AutoTable |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────┐
│              CLIENT (React.js)                │
│   Context API │ Protected Routes │ Bootstrap  │
└────────────────────┬─────────────────────────┘
                     │ HTTP REST API
┌────────────────────▼─────────────────────────┐
│           SERVER (Node.js + Express)          │
│  JWT Auth │ Role-Based Access │ Multer Upload │
│     AI Provider Module (Gemini / OpenAI)      │
└────────────────────┬─────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
┌────────▼────────┐    ┌──────────▼──────────┐
│    MongoDB       │    │    AI Providers      │
│  8 Collections   │    │ Gemini 1.5 / OpenAI │
└─────────────────┘    └─────────────────────┘
```

---

## 📁 Project Structure

```
ai-career-assistant/
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── aiProvider.js       # Modular AI provider
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── resumeController.js
│   │   ├── aiController.js
│   │   ├── jobController.js
│   │   ├── interviewController.js
│   │   ├── learningController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── roleMiddleware.js   # Role-based authorization
│   │   ├── errorMiddleware.js  # Global error handler
│   │   └── uploadMiddleware.js # Multer configuration
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Resume.js
│   │   ├── Job.js
│   │   ├── SavedJob.js
│   │   ├── InterviewHistory.js
│   │   ├── LearningPlan.js
│   │   └── AIReport.js
│   ├── routes/                 # Express routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── learningRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── pdfParser.js
│   │   ├── emailService.js
│   │   └── helpers.js
│   ├── uploads/                # Uploaded resume files (gitignored)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── client/                     # Frontend (React.js)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosConfig.js
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Sidebar, Layout, Loader
│   │   │   ├── dashboard/      # Dashboard widgets
│   │   │   ├── resume/         # Resume components
│   │   │   ├── interview/      # Interview components
│   │   │   ├── jobs/           # Job components
│   │   │   ├── learning/       # Learning components
│   │   │   └── admin/          # Admin components
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useToast.js
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── student/        # Dashboard, Profile, Resume, etc.
│   │   │   └── admin/          # Admin pages
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── docs/
│   └── API.md                  # API Documentation
├── scripts/
│   └── seedData.js             # Sample data seeder
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn
- A Gemini API key (free) or OpenAI API key

### Step 1: Clone the repository
```bash
git clone https://github.com/yourusername/ai-career-assistant.git
cd ai-career-assistant
```

### Step 2: Install backend dependencies
```bash
cd server
npm install
```

### Step 3: Install frontend dependencies
```bash
cd ../client
npm install
```

---

## 🔧 Environment Setup

### Backend (.env)
Create `server/.env` from `server/.env.example`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_career_assistant
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# AI Provider: 'gemini' or 'openai'
AI_PROVIDER=gemini
GOOGLE_AI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

CLIENT_URL=http://localhost:3000

# Optional: Email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env)
Create `client/.env` from `client/.env.example`:
```bash
cp client/.env.example client/.env
```

### Getting API Keys
- **Gemini** (recommended, free tier): https://makersuite.google.com/app/apikey
- **OpenAI**: https://platform.openai.com/api-keys

---

## ▶️ Running the App

### Development Mode (recommended)

Terminal 1 — Backend:
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

Terminal 2 — Frontend:
```bash
cd client
npm start
# App opens at http://localhost:3000
```

### Seed Sample Data (optional)
```bash
cd server
node ../scripts/seedData.js
```

---

## 📡 API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

### Quick Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |
| GET | /api/users/profile | Get profile | Yes |
| PUT | /api/users/profile | Update profile | Yes |
| POST | /api/resumes/upload | Upload resume | Yes |
| GET | /api/resumes/my | Get my resumes | Yes |
| POST | /api/ai/analyze-resume | AI resume analysis | Yes |
| POST | /api/ai/generate-summary | AI summary generation | Yes |
| POST | /api/ai/generate-cover-letter | AI cover letter | Yes |
| POST | /api/ai/skill-gap | Skill gap analysis | Yes |
| POST | /api/ai/career-paths | Career suggestions | Yes |
| POST | /api/ai/interview-questions | Generate questions | Yes |
| POST | /api/ai/interview-feedback | Evaluate answer | Yes |
| POST | /api/ai/learning-roadmap | Learning plan | Yes |
| POST | /api/ai/project-ideas | Project suggestions | Yes |
| POST | /api/ai/weekly-report | Weekly report | Yes |
| GET | /api/jobs | List jobs | No |
| POST | /api/jobs/save/:id | Save a job | Yes |
| GET | /api/jobs/saved | Saved jobs | Yes |
| GET | /api/admin/analytics | Platform analytics | Admin |
| GET | /api/admin/users | All users | Admin |

---

## 🗄 Database Collections

| Collection | Purpose |
|---|---|
| **users** | Authentication, roles, AI usage tracking |
| **profiles** | Detailed user profiles (education, experience, skills) |
| **resumes** | Uploaded files, parsed text, AI analysis results |
| **jobs** | Job listings managed by admins |
| **savedjobs** | Student saved/applied jobs with status tracking |
| **interviewhistories** | Mock interview sessions, Q&A, AI feedback |
| **learningplans** | Personalized roadmaps, bookmarks, progress |
| **aireports** | All AI-generated reports history |

---

## 🤖 AI Provider Configuration

The AI module is fully modular. Switch providers by changing `AI_PROVIDER` in `.env`:

```env
AI_PROVIDER=gemini   # Use Google Gemini 1.5 Flash (default)
AI_PROVIDER=openai   # Use OpenAI GPT-3.5 Turbo
```

No code changes required when switching providers.

---

## 🚢 Deployment Guide

### Backend — Deploy to Railway/Render

1. Push code to GitHub
2. Create new service on Railway/Render from GitHub repo
3. Set root directory to `server/`
4. Add all environment variables
5. Deploy

### Frontend — Deploy to Vercel/Netlify

1. Create new project on Vercel from GitHub repo
2. Set root directory to `client/`
3. Set build command: `npm run build`
4. Set `REACT_APP_API_URL` to your deployed backend URL
5. Deploy

### Database — MongoDB Atlas

1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP (0.0.0.0/0 for all)
4. Copy connection string to `MONGO_URI`

---

## 🔮 Future Enhancements

- [ ] LinkedIn OAuth integration
- [ ] Real-time notifications with Socket.io
- [ ] Video mock interviews with AI analysis
- [ ] Resume builder (drag-and-drop template)
- [ ] Company research AI assistant
- [ ] Peer review system for resumes
- [ ] Mobile app (React Native)
- [ ] Integration with job boards (LinkedIn, Indeed) via APIs
- [ ] AI-powered salary negotiation coach
- [ ] Mentorship matching system
- [ ] Multi-language support
- [ ] Stripe payment for premium AI usage

---

## 👨‍💻 Author

Built with ❤️ as a final-year engineering project.

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
