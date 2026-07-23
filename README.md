

<div align="center">



[![Live Frontend](https://img.shields.io/badge/🌐%20Live%20App-skillbrix--exam.vercel.app-22c55e?style=for-the-badge)](https://skillbrix-exam.vercel.app)

A full-stack, production-ready **Online Exam Portal** built for **JEE MAINS** examinations supporting Physics, Chemistry, and Mathematics — with AI-powered question importing, LaTeX math rendering, image/diagram support, and real-time exam taking.

</div>





### 👨‍💼 Admin Panel
- **Dashboard** — Overview of exams, students, questions, and results
- **Department Management** — Organize students and exams by department (JEE MAINS)
- **Subject Management** — Physics, Chemistry, Mathematics
- **Question Bank** — Create, edit, filter questions with full LaTeX math support
- **AI Question Importer** — Upload PDF, Images (JPG/PNG), Word (.docx) or Excel files and auto-extract questions using Google Gemini AI
- **Exam Builder** — Create time-limited exams with configurable scoring and negative marking
- **Student Management** — Bulk import students from Excel/CSV
- **Results Analytics** — View scores, rankings, and performance analytics

### 🎓 Student Portal
- **Real-time Exam Interface** — Clean timer-based exam UI with section navigation
- **Math Rendering** — Beautifully rendered LaTeX matrices, fractions, integrals, Greek letters
- **Image Support** — Physics/Chemistry diagrams displayed inline inside questions
- **Instant Results** — Scores displayed immediately after exam submission
- **Previous Results** — Full history of past exam attempts

### 🤖 AI-Powered Features
- **AI Question Import** — Upload a PDF/Image/Docx → Gemini Vision extracts all questions with full LaTeX formatting
- **AI Question Generator** — Generate MCQ/Descriptive questions on any topic using Gemini AI
- **OCR Engine** — Reads handwritten-style question papers and converts to structured JSON



## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Math Rendering** | KaTeX |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Prisma |
| **Auth** | JWT (Access + Refresh tokens) |
| **AI** | Google Gemini 2.0 Flash Vision API |
| **File Parsing** | pdf-parse, mammoth (docx), xlsx |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |
| **Image Storage** | Cloudinary |

---

##  Live Demo

| Service | URL |
|---|---|
|  Frontend | [https://skillbrix-exam.vercel.app](https://skillbrix-exam.vercel.app) |
|  Backend API | [https://exam-portal-xtx0.onrender.com](https://exam-portal-xtx0.onrender.com) |

---



```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                    │
│         React + Vite + KaTeX + Vanilla CSS              │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS REST API
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (Render)                      │
│            Node.js + Express.js + Prisma                │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │  Auth Module │  │ Import Module│  │  Exam Module │  │
│   └─────────────┘  └──────┬───────┘  └──────────────┘  │
│                           │ Gemini Vision API            │
│   ┌────────────────────── ▼ ─────────────────────────┐  │
│   │          Google Gemini 2.0 Flash (AI)             │  │
│   └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              PostgreSQL via Supabase                    │
│        Users, Exams, Questions, Results, Settings       │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database (or Supabase account)
- Google Gemini API Key (free from [aistudio.google.com](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/Ganesh5710/Exam-Portal.git
cd Exam-Portal
```

### 2. Install All Dependencies
```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```



### 5. Run Locally
```bash
# From project root — starts both backend (port 5000) and frontend (port 5173)
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |

---

## 📁 Project Structure

```
Exam-Portal/
├── backend/                   # Node.js + Express API server
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Database seeder
│   ├── src/
│   │   ├── config/
│   │   │   ├── gemini.js      # Gemini AI client with model fallback
│   │   │   └── logger.js
│   │   └── modules/
│   │       ├── auth/          # Login, refresh, logout
│   │       ├── users/         # Student & admin management
│   │       ├── questions/     # Question bank CRUD + AI generator
│   │       ├── exams/         # Exam CRUD + attempt management
│   │       ├── import/        # AI document/image import engine
│   │       ├── departments/   # Department management
│   │       └── subjects/      # Subject management
│   └── package.json
│
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       └── MathContent.jsx   # KaTeX LaTeX renderer
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Questions.jsx     # Question Bank
│   │   │   │   ├── QuestionImport.jsx # AI Importer
│   │   │   │   ├── Exams.jsx
│   │   │   │   ├── Students.jsx
│   │   │   │   ├── Results.jsx
│   │   │   │   └── Settings.jsx
│   │   │   └── student/
│   │   │       ├── ExamList.jsx
│   │   │       ├── ExamTerminal.jsx   # Exam taking interface
│   │   │       └── Results.jsx
│   │   └── App.jsx
│   └── package.json
│
├── package.json               # Root scripts: dev, build, install-all
└── README.md
```

---

## 🤖 AI Question Importer

The AI Importer accepts the following file formats:

| Format | Support |
|---|---|
| 📄 PDF | ✅ Full text + Vision fallback for custom fonts |
| 🖼️ JPG/PNG/JPEG | ✅ Direct Gemini Vision processing |
| 📝 Word (.docx) | ✅ Text extraction via mammoth |
| 📊 Excel (.xlsx/.csv) | ✅ Structured row parsing |

### How it Works:
1. Upload your question paper (PDF, image, Word, or Excel)
2. The backend sends the file to **Google Gemini 2.0 Flash Vision**
3. Gemini extracts every question with full LaTeX formatting:
   - Matrices → `\begin{bmatrix}...\end{bmatrix}`
   - Fractions → `\frac{a}{b}`
   - Integrals → `\int_{a}^{b}`
   - Greek letters → `\alpha`, `\theta`, `\Delta`
4. Preview the extracted questions and select which ones to import
5. Questions are saved to the Question Bank

### Setup:
Add your **Google Gemini API Key** in:
- **Admin → Settings → GEMINI_API_KEY**

Get a free key at: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 📐 Math Rendering

All mathematical content is rendered using **KaTeX** via the `MathContent.jsx` component.

### Supported Syntax:

```latex
# Matrices
$\begin{bmatrix} a & b \\ c & d \end{bmatrix}$

# Fractions
$\frac{d^2y}{dx^2} + \frac{dy}{dx} + y = 0$

# Integrals
$\int_{0}^{\pi} \sin(x)\,dx = 2$

# Limits
$\lim_{x \to 0} \frac{\sin x}{x} = 1$

# Sums
$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$

# Greek Letters
$\alpha + \beta + \gamma = \pi$

# Vectors
$\vec{F} = m\vec{a}$

# Chemistry
$H_2SO_4 \rightarrow 2H^+ + SO_4^{2-}$
```

---

## 🔌 API Overview

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login (admin/student) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |

### Questions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/questions` | List questions (with filters) |
| POST | `/api/questions` | Create question |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |
| POST | `/api/questions/generate-ai` | AI generate questions |

### Import
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/import/extract` | Upload file & extract questions via AI |
| POST | `/api/import/save` | Save selected extracted questions |

### Exams
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/exams` | List exams |
| POST | `/api/exams` | Create exam |
| POST | `/api/exams/:id/start` | Student starts exam |
| POST | `/api/exams/:id/submit` | Student submits exam |
| GET | `/api/exams/:id/results` | Get exam results |

### Users / Students
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List students |
| POST | `/api/users` | Create student |
| POST | `/api/users/bulk-import` | Bulk import students from Excel |

---

## 🌍 Deployment

### Frontend (Vercel)
1. Fork or clone this repository
2. Connect to Vercel → Import the `frontend/` directory
3. Set build command: `npm run build`
4. Set output directory: `dist`

### Backend (Render)
1. Create a new **Web Service** on Render
2. Connect to your GitHub repo
3. Set root directory: `backend/`
4. Set build command: `npm install && npx prisma generate`
5. Set start command: `node src/index.js`
6. Add environment variables (see [Setup](#️-local-setup)):
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `GEMINI_API_KEY`

---

## 📸 Screenshots

### 🏠 Admin Dashboard
Clean overview of exams, questions, students, and analytics.

### 📚 Question Bank
Filter by Department, Subject, and Question Type. Full LaTeX preview.

### 🤖 AI Question Importer
Upload PDF/Image → AI extracts all questions with matrices and fractions intact.

### 📝 Exam Terminal
Clean, distraction-free exam UI with timer, section navigation, and LaTeX rendering.

### 📊 Results Dashboard
View student scores, ranks, and analytics after exam submission.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is proprietary software developed for **SkillBrix / Enkonix**.
All rights reserved © 2026.

---

<div align="center">

**Built with ❤️ for JEE MAINS students**

[![Live App](https://img.shields.io/badge/🌐%20Try%20It%20Live-skillbrix--exam.vercel.app-22c55e?style=for-the-badge)](https://skillbrix-exam.vercel.app)

</div>
