# Skillbrix: Next-Generation Online Examination Portal

An advanced, secure, and modern web-based examination platform featuring real-time AI-powered proctoring, a premium interactive 3D command center preview, automatic grading, and comprehensive administrator results dashboards.

## Key Features

### 👨‍🎓 Student Terminal
* **Secure Assessment Environment**: Fullscreen mode enforcement, devtools block, copy-paste block, and right-click disable.
* **AI Gaze & Face Proctoring**: Integrated BlazeFace model detects multiple faces, look-aways, and webcam absences.
* **Tab Switch & Screen Escape Violations**: Auto-warns and auto-submits exams upon exceeding 5 strikes.
* **Dynamic Time Schedule Checking**: Real-time timer checks for exam availability without requiring manual page refresh.
* **Auto-Polling Grade Release**: Dynamic result confirmation page automatically pulls score/grade data every 30 seconds once released by admin.

### 👩‍💼 Admin Dashboard
* **Live Candidate Monitor**: Real-time socket-based proctoring console showing student screen state, webcam gaze status, and violation logs.
* **Question Bank & AI Importers**: Easily import descriptive, coding, MCQ, and true/false questions via PDF/Docx files.
* **Proctor Commands**: Force-terminate exam sessions or extend timers in real-time.
* **Flexible Results Management**: Manual grading interface for descriptive questions, dynamic grade/percentage calculations, and bulk publish options.

## Technology Stack
* **Frontend**: React, TypeScript, TailwindCSS, Vite
* **Backend**: Node.js, Express, Socket.io, TypeScript, Prisma (SQLite)

## How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Servers (Backend on port 5000, Frontend on port 3000)**:
   ```bash
   npm run dev
   ```
