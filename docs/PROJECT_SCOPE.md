# Project Scope

## Project Title
**CourseSync** — Routine-Driven Course Workspace with AI-Assisted Learning

## Project Goal
A desktop-first web app that scans a semester class routine, extracts course codes, generates per-course workspaces, and supports learning through notes, document management, AI chatbot, and study tracking.

---

## In-Scope Features (Must Have)

### 1. Routine Upload & OCR
- Upload routine image (PNG/JPG) or PDF
- Preview uploaded file before processing
- Extract text using OCR (EasyOCR)
- Detect distinct course codes (e.g., `CSE 3200`, `HUM 4155`)

### 2. Course Confirmation & Setup
- Display extracted courses for user review
- Allow editing, removing, or confirming courses
- Map course codes to course titles where possible
- Save confirmed courses to database

### 3. Course Dashboard
- Show all courses as cards
- Filter/search courses
- Click to open individual course workspace

### 4. Course Workspace (3-Panel Layout)
- **Notes Panel**: Create, view, edit, delete notes per course
- **Materials Panel**: Upload and list PDF/DOCX/PPTX files per course
- **Chat Panel**: Ask course-specific AI questions

### 5. File Text Extraction
- Extract text from uploaded PDF (PyMuPDF)
- Extract text from uploaded DOCX (python-docx)
- Best-effort extraction from PPTX (python-pptx)
- Store extracted text for RAG pipeline

### 6. AI Chatbot (Minimal RAG)
- Chunk extracted text per course
- Generate embeddings (sentence-transformers or OpenAI)
- Store vectors in FAISS index per course
- Retrieve relevant chunks for user queries
- Generate grounded answers using LLM API
- Restrict retrieval to the selected course only

### 7. Study Tracker
- Log study sessions (hit/miss/score)
- View recent study logs per course
- Simple retention status indicators (red/yellow/green)

### 8. Basic Reminder Support
- Simple reminder data entry per course
- Display upcoming reminders (lightweight, no push notifications)

---

## Out-of-Scope (Will NOT Build)

- Full user authentication / role-based access (use simple demo mode)
- Real-time push notifications
- Mobile-responsive design (desktop-first only)
- Document editing or in-browser preview
- Multi-agent AI system
- Advanced reranking or long-context optimization
- Citation system for AI responses
- Collaborative/multi-user features
- Complex real-time notification system
- Support for file types beyond PDF/DOCX/PPTX

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Backend | FastAPI + Python + Uvicorn |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| OCR | EasyOCR |
| PDF Processing | PyMuPDF |
| DOCX Processing | python-docx |
| PPTX Processing | python-pptx (best-effort) |
| Vector Search | FAISS |
| Embeddings | sentence-transformers (or OpenAI API) |
| LLM | OpenAI API or Google Gemini API |
| Version Control | GitHub + Issues + PRs |

---

## Minimum Acceptance Criteria

The project is credible if the following works end-to-end:
1. Upload a routine
2. Detect distinct courses
3. Confirm and save courses
4. Open course workspace
5. Add notes or upload materials
6. Extract text from at least PDF and DOCX
7. Ask a course-specific AI question and get a grounded answer
8. Record a study log

---

## Known Limitations (to be documented, not fixed)

- PPTX extraction may be incomplete for complex slides
- OCR accuracy depends on routine image quality
- AI responses are limited by the quality of uploaded material
- No real-time collaboration support
- Reminders are local/simple, not push-based
