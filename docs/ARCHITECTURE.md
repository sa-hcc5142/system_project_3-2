# Architecture & Page Flow

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                     │
│                                                          │
│  Upload Page → Confirmation → Dashboard → Workspace      │
│                                            ├─ Notes      │
│                                            ├─ Materials  │
│                                            └─ Chat       │
│                                                          │
│  Study Tracker → Retention View                          │
└──────────────────┬───────────────────────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼───────────────────────────────────────┐
│                   BACKEND (FastAPI)                        │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ OCR Service  │  │ File Process │  │ RAG Pipeline   │  │
│  │ (EasyOCR)   │  │ (PyMuPDF,    │  │ (FAISS +       │  │
│  │             │  │  python-docx, │  │  Embeddings +  │  │
│  │             │  │  python-pptx) │  │  LLM API)      │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Course Svc  │  │ Notes Svc    │  │ Tracker Svc    │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│             SUPABASE (PostgreSQL + Storage)               │
│                                                          │
│  Tables: courses, notes, materials, chat_history,        │
│          study_logs, reminders                            │
│  Storage: routine_uploads/, course_materials/             │
└──────────────────────────────────────────────────────────┘
```

---

## Page Flow (User Journey)

```
[Landing / Home Page]
        │
        ▼
[Upload Routine Page]
   • Upload image/PDF
   • Preview uploaded file
   • Click "Process Routine"
        │
        ▼
[Course Confirmation Page]
   • View extracted course codes
   • Edit / remove / add courses
   • Click "Confirm & Save"
        │
        ▼
[Course Dashboard]
   • View all courses as cards
   • Search / filter courses
   • Click a course card
        │
        ▼
[Course Workspace] ← Three-panel layout
   ├── [Notes Panel]
   │      • Create / view / edit / delete notes
   │
   ├── [Materials Panel]
   │      • Upload PDF / DOCX / PPTX
   │      • View uploaded files list
   │      • See extraction status
   │
   └── [Chat Panel]
          • Ask course-specific questions
          • View AI-generated answers
          • See source snippet indicators
        │
        ▼
[Study Tracker Page]
   • Log study sessions (hit/miss/score)
   • View recent logs per course
   • See retention status (red/yellow/green)
   • Simple reminder management
```

---

## Frontend Route Structure (Next.js App Router)

```
src/app/
├── page.tsx                          → Landing / Home
├── upload/
│   └── page.tsx                      → Routine Upload
├── confirm/
│   └── page.tsx                      → Course Confirmation
├── dashboard/
│   └── page.tsx                      → Course Dashboard
├── course/
│   └── [courseId]/
│       └── page.tsx                  → Course Workspace
├── tracker/
│   └── page.tsx                      → Study Tracker
└── layout.tsx                        → Root Layout
```

---

## Backend API Structure (FastAPI)

```
backend/
├── main.py                           → App entry point
├── routers/
│   ├── routine.py                    → POST /api/routine/upload
│   │                                   POST /api/routine/parse
│   ├── courses.py                    → GET  /api/courses
│   │                                   POST /api/courses
│   │                                   GET  /api/courses/{id}
│   │                                   PUT  /api/courses/{id}
│   │                                   DELETE /api/courses/{id}
│   ├── notes.py                      → CRUD /api/courses/{id}/notes
│   ├── materials.py                  → POST /api/courses/{id}/materials/upload
│   │                                   GET  /api/courses/{id}/materials
│   ├── chat.py                       → POST /api/courses/{id}/chat
│   │                                   GET  /api/courses/{id}/chat/history
│   └── tracker.py                    → CRUD /api/courses/{id}/tracker
├── services/
│   ├── ocr_service.py                → EasyOCR text extraction
│   ├── parser_service.py             → Course code regex extraction
│   ├── file_processor.py             → PDF/DOCX/PPTX text extraction
│   ├── rag_service.py                → Chunking + embedding + retrieval
│   └── llm_service.py                → LLM API calls
├── models/                           → Pydantic schemas
├── config.py                         → Settings / env vars
└── requirements.txt
```

---

## Database Schema (Supabase / PostgreSQL)

### courses
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| code | text | e.g., "CSE 3200" |
| title | text | e.g., "System Development Project" |
| type | text | Theory / Lab / Sessional |
| created_at | timestamp | Auto |

### notes
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| course_id | uuid (FK) | References courses.id |
| title | text | Note title |
| content | text | Note body |
| created_at | timestamp | Auto |
| updated_at | timestamp | Auto |

### materials
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| course_id | uuid (FK) | References courses.id |
| file_name | text | Original file name |
| file_type | text | pdf / docx / pptx |
| storage_path | text | Path in Supabase Storage |
| extracted_text | text | Extracted content |
| status | text | pending / processed / failed |
| created_at | timestamp | Auto |

### chat_history
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| course_id | uuid (FK) | References courses.id |
| role | text | user / assistant |
| message | text | Message content |
| created_at | timestamp | Auto |

### study_logs
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| course_id | uuid (FK) | References courses.id |
| score | integer | Score or rating |
| status | text | hit / miss |
| notes | text | Optional log note |
| logged_at | timestamp | Auto |

### reminders
| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| course_id | uuid (FK) | References courses.id |
| title | text | Reminder title |
| due_date | timestamp | When it's due |
| is_done | boolean | Completion status |
| created_at | timestamp | Auto |
