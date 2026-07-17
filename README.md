# Skillbrix: Next-Generation Online Examination Portal

An advanced, secure, and modern web-based examination platform featuring real-time AI-powered proctoring, a premium interactive 3D command center preview, automatic grading, and comprehensive administrator results dashboards.

## Core Capabilities

- **Interactive 3D Preview Widget**: Live perspective dashboard layout featuring mouse parallax rotation and floating telemetry overlays.
- **WebSocket-Driven Monitor**: Instant WebSocket proctor updates tracking focus switches and gaze violations in real-time.
- **Bulk Question Importer**: Fast parsing of up to 2,000+ questions from Excel/CSV templates with custom marking keys.

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

## Feature Walkthroughs

### 1. Interactive 3D Mockup
Skillbrix features a premium 3D perspective dashboard preview on its landing page. 
- Integrated custom CSS 3D transforms (`perspective`, `rotateX`, `rotateY`) matching local mouse coordinate movements.
- Supports four dynamic, responsive floating metrics cards (`Integrity Signal`, `Peak Throughput`, `Completion Pulse`, `Review Velocity`).
- Built custom visual data graphics (SVG sparklines, progressive circular charts, and bar charts) displaying live simulated telemetries.

### 2. AI Proctoring Command Center
Provides administrators with absolute visibility into candidate exam behaviors in real-time.
- **WebSocket State Machine**: Direct integration updates individual candidate cards instantly on screen changes or webcam warnings.
- **Visual Proctoring Panel**: Live simulations tracking cheat violations, offline heartbeats, frozen nodes, and status indicators.
- **Violation Logging Node**: Real-time terminal feeds displaying time-stamped proctor event strings (e.g. gaze lookaway logs).

### 3. Bulk Excel/CSV Importer
Accelerates test creation by allowing massive questions batches to be processed instantly.
- **2,000+ Questions Capacity**: Fully optimized file upload parser that processes 2k questions in a few seconds.
- **Client-Side Validation**: Immediate schema audit (verifying correct choices, score bounds, negative weight limits) before DB commit.
- **Custom Parsing Engine**: Built using modern XLSX spreadsheet libraries to parse Excel and CSV files with clear structure error highlight.

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
