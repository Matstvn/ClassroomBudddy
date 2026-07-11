# ClassroomBuddy

A personal, all-in-one classroom management web application designed for a single Grade 6 teacher.  
ClassroomBuddy replaces multiple spreadsheets, paper records, and separate utilities with one integrated system that supports daily teaching.

The application runs **offline** on a local network – no internet required.

---

## Features

### 📋 Learners Module
- Import learners from DepEd SF1 Excel files
- Add, edit, archive, and permanently delete learners
- Searchable learner list with master‑detail view

### 📅 Daily Log
- AM and PM attendance (time‑sensitive buttons)
- Lesson plan with curriculum integration
- Quick assessment creation linked to learning objectives
- View today's assessments and open them for scoring

### 📊 Assessment Engine
- Create assessments (Written Works, Performance Tasks, Term Examinations) with optional learning objective linking
- Score entry grid for all learners
- Automatic computation of term grades using configurable K‑12 weights (WW, PT, TE)
- Grade Sheet report with printable view

### 📚 Reading Suite
- **Comprehension** – passages with multiple‑choice questions, shuffled answers, retake rules (≥80% blocks retake), history
- **Oral Reading Fluency (ORF)** – clickable passage words for error marking, built‑in timer, WCPM and accuracy calculation, history
- **Reading Level Tracking** – eight‑level progression with history

### 📈 Classroom Monitoring
- Curriculum tree (Performance Standards → Learning Competencies → Learning Objectives)
- Class‑wide progress averages computed from linked assessments
- Add learning objectives directly from the tracker

### 🛠️ Teacher Tools
- Countdown Timer with visual/audio alerts
- Stopwatch with lap times
- Random Name Picker
- Seating Plan generator
- Group Generator

### 📄 Reports
- Grade Sheet (per subject, term, school year) with print support
- Attendance Summary (per date range, session) with print support

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Vite, TypeScript, Tailwind CSS v4 |
| Backend   | FastAPI (Python), SQLAlchemy, Alembic |
| Database  | MySQL / MariaDB                   |
| Tools     | VS Code, Git, ESLint, Prettier    |

---

## Project Structure
ClassroomBuddy/
├── backend/
│ ├── app/
│ │ ├── api/v1/endpoints/ # REST API endpoints
│ │ ├── core/ # config, database
│ │ ├── models/ # SQLAlchemy models
│ │ ├── schemas/ # Pydantic schemas
│ │ ├── services/ # business logic
│ │ └── utils/ # SF1 parser, etc.
│ ├── alembic/ # database migrations
│ └── requirements.txt
├── frontend/
│ ├── src/
│ │ ├── app/ # main entry, router
│ │ ├── components/ # reusable UI components
│ │ ├── layouts/ # main layout with navigation
│ │ ├── modules/ # feature modules (learners, classroom, reading, grades, tools, reports)
│ │ ├── services/ # API client
│ │ ├── stores/ # simple state stores
│ │ └── styles/ # global CSS
│ ├── index.html
│ └── vite.config.ts
├── .gitignore
└── README.md


---

## Setup & Installation

### Prerequisites
- Python 3.10+ with `venv`
- MySQL or MariaDB server running locally
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/Matstvn/ClassroomBudddy.git
cd ClassroomBudddy

cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt