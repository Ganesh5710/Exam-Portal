

# Online Examination Portal

Full-stack examination portal supporting Physics, Chemistry, and Mathematics test administration, automated scoring, AI-assisted question extraction, LaTeX math rendering, and real-time proctoring.

## Features

### Admin Capabilities
- **Dashboard & Analytics**: Overview of exams, student metrics, question counts, and submission scores.
- **Question Bank**: Manage question items with LaTeX math formulas, media attachments, and options.
- **AI Question Importer**: Extract questions from PDF, Word (.docx), Excel, or image files via Google Gemini API.
- **Exam Management**: Configure timed exams, passing marks, negative marking, and question shuffling.
- **Student Roster**: Import and organize candidate records by department.

### Student Experience
- **Exam Interface**: Section navigation, timers, inline LaTeX math rendering, and question status tracking.
- **Instant Evaluation**: Automated answer evaluation and performance summaries upon submission.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, KaTeX
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (Access and Refresh tokens)
- **AI Integration**: Google Gemini Vision API

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ganesh5710/Exam-Portal.git
   cd Exam-Portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Create `backend/.env`:
     ```env
     PORT=5000
     DATABASE_URL=postgresql://user:password@localhost:5432/examportal
     JWT_ACCESS_SECRET=your_jwt_access_secret
     JWT_REFRESH_SECRET=your_jwt_refresh_secret
     GEMINI_API_KEY=your_gemini_api_key
     ```

4. **Initialize database schema**:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

5. **Start application**:
   ```bash
   # From root directory (starts backend on 5000, frontend on 5173)
   npm run dev
   ```

## License

Proprietary software. All rights reserved.repository
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
