# Contributing Guidelines

## Read This First
This document is the internal working guide for the project. It is intentionally more detailed and more practical than the public `README.md`.

The goal is not only to write code, but to build the project in a way that remains:
- reviewable,
- presentable,
- finishable within a fixed time period,
- defensible during evaluation.

---

# 1. Important Warnings Before Development

These are the main areas where going too deep can cause delay and make the project incomplete.

## Warning 1: Do not overbuild RAG early
RAG can easily become the biggest time sink in the whole project.

For the first working version, keep it limited to:
- file text extraction,
- chunking,
- simple embeddings,
- basic retrieval,
- course-specific grounded answer generation.

Avoid spending too much time on:
- reranking,
- multi-agent design,
- advanced memory,
- long-context optimization,
- perfect citation systems.

## Warning 2: Do not spend too much time supporting every file type perfectly
The most reliable targets should be:
- PDF
- DOCX

PPTX should be treated as best-effort. If slide extraction is messy, support it partially and document the limitation instead of losing multiple days.

## Warning 3: Do not make authentication a major feature
Use the simplest functional authentication or even a controlled demo mode initially if needed. Full user-role architecture is unnecessary at this stage.

## Warning 4: Do not over-polish the UI before the workflow works
A clean but simple interface is enough. Do not spend too much time on animations, transitions, or advanced responsive details before the end-to-end flow is complete.

## Warning 5: Do not delay frontend-backend integration
If frontend and backend are developed separately for too long, integration problems will explode at the end. Integration must begin early.

## Warning 6: Do not divide work as "one person full frontend, one person full backend"
That creates imbalance. The work should be divided by feature/module so both contributors handle implementation, integration, testing, and documentation.

## Warning 7: Keep reminders and tracking lightweight
A simple tracker and simple reminder data flow are enough. Do not build a complex real-time notification system unless everything else is already stable.

---

# 2. Project Summary

## Project Goal
The project is a desktop-first web application that scans a semester class routine, extracts distinct course codes, generates course workspaces automatically, and supports course-wise learning through:
- Lecture Notes,
- Slides & Documents,
- AI Chatbot,
- basic study tracking.

## Core Flow
1. Upload routine image/PDF
2. Run OCR on the routine
3. Detect distinct course codes
4. Confirm extracted courses
5. Generate course dashboard
6. Open course-specific workspace
7. Add notes and materials
8. Ask course-specific AI questions
9. Track simple study progress

---

# 3. Project Philosophy

Development should always follow this order:
1. make the full flow work,
2. make it stable,
3. make it cleaner,
4. improve quality only if time remains.

The project is already strong if it can clearly demonstrate:
- routine upload,
- course extraction,
- course workspace creation,
- notes and materials per course,
- course-specific AI response,
- simple study tracking.

Anything beyond that is a bonus.

---

# 4. Recommended Working Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React state management using built-in hooks or lightweight client state

## Backend
- FastAPI
- Python
- Uvicorn
- Pydantic

## Database and Storage
Choose one and stay consistent:
- Firebase Firestore + Firebase Storage
or
- Supabase Database + Storage

## OCR and File Processing
- Tesseract OCR or EasyOCR
- OpenCV only if preprocessing becomes necessary
- PyMuPDF or pdfplumber for PDF
- python-docx for DOCX
- python-pptx for PPTX

## AI / Retrieval
- FAISS
- embedding model/API
- LLM API for grounded responses

## Collaboration Tools
- GitHub
- GitHub Issues
- GitHub Pull Requests
- GitHub Projects or issue board
- Postman or Insomnia
- VS Code
- Draw.io / Figma for diagrams and wireframes

---

# 5. High-Level Module Plan

This is the compressed overview before the daily schedule.

## Module 1: Routine Understanding and Course Setup
### Time Window
Day 1 to Day 5

### Goal
Make the system capable of:
- uploading a routine,
- extracting text,
- detecting courses,
- confirming courses,
- storing them,
- showing the course dashboard.

### Main Output
Routine upload to dashboard flow working end-to-end.

### Main Tools Needed
- Next.js
- Tailwind CSS
- FastAPI
- OCR library
- regex/pattern matching
- database/storage setup
- GitHub issues and PRs

---

## Module 2: Course Workspace and Material System
### Time Window
Day 6 to Day 11

### Goal
Make each course usable through:
- three-panel workspace,
- notes module,
- material upload,
- file text extraction,
- chatbot pipeline,
- minimal RAG.

### Main Output
A user can open a course, upload a document, and ask a course-specific question.

### Main Tools Needed
- Next.js
- FastAPI
- database/storage service
- PyMuPDF / python-docx / python-pptx
- FAISS
- embedding model/API
- LLM API
- Postman

---

## Module 3: Tracking, Refinement, and Finalization
### Time Window
Day 12 to Day 15

### Goal
Make the system more academically useful through:
- study tracker,
- retention status,
- simple reminder support,
- integration testing,
- documentation,
- demo preparation.

### Main Output
A stable, demonstrable system with complete workflow and supporting documentation.

### Main Tools Needed
- Next.js
- FastAPI
- database service
- browser devtools
- GitHub
- screen recorder
- Markdown documentation

---

# 6. Balanced Team Division Overview

To avoid unequal load, work should be divided feature-wise rather than stack-wise.

## Contributor A usually handles
- dashboard and upload-related UI,
- course confirmation flow,
- notes UI,
- tracker UI,
- frontend-backend integration for assigned modules,
- testing assigned user flows,
- documentation for assigned sections.

## Contributor B usually handles
- workspace and chatbot UI,
- OCR/parser logic,
- file processing,
- retrieval and AI integration,
- frontend-backend integration for assigned modules,
- testing assigned user flows,
- documentation for assigned sections.

## Shared responsibilities
Both contributors must participate in:
- architecture decisions,
- API contract decisions,
- PR reviews,
- merge conflict handling,
- integration testing,
- final documentation,
- demo preparation.

---

# 7. Branching Strategy

## Main branches
- `main` → stable, presentable version
- `develop` → integration branch

## Working branches
- `feature/...`
- `fix/...`
- `docs/...`
- `refactor/...`

## Example branch names
- `feature/routine-upload-ui`
- `feature/course-extraction-parser`
- `feature/course-dashboard`
- `feature/course-workspace-layout`
- `feature/material-upload`
- `feature/file-text-extraction`
- `feature/chat-ui`
- `feature/rag-retrieval`
- `feature/study-tracker`
- `docs/readme-update`

## Rules
1. Never push directly to `main`
2. Avoid pushing directly to `develop`
3. Every task should begin from an issue
4. Every issue should map to a branch
5. Every branch should be merged through a pull request
6. At least one teammate review is required before merge
7. Large features should be split into smaller PRs

---

# 8. Commit and PR Rules

## Commit message format
- `feat: add routine upload page`
- `feat: implement course extraction parser`
- `feat: build course workspace layout`
- `fix: prevent duplicate course save`
- `refactor: separate parser service`
- `docs: update setup instructions`
- `test: add regex extraction test cases`

## Pull request must include
- what was implemented,
- which issue it closes,
- what was tested,
- screenshots if UI changed,
- known limitations if any.

## Before opening a PR
1. Pull latest `develop`
2. Merge `develop` into your branch if needed
3. Test locally
4. Remove accidental files
5. Update documentation if necessary

---

# 9. Merge Conflict Handling

## Sync process
```bash
git checkout develop
git pull origin develop
git checkout feature/your-branch
git merge develop
```

## If conflict happens
```bash
# resolve files manually

git add .
git commit -m "fix: resolve merge conflict with develop"
git push origin feature/your-branch
```

## Rules
- never ignore a conflict without understanding both sides,
- mention important manual conflict resolution in the PR,
- retest affected features after conflict resolution.

---

# 10. Day-by-Day Detailed Plan

## Day 1 — Setup and Scope Lock

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Scope | finalize core feature list and out-of-scope list | define technical limits for OCR and AI modules | GitHub, Docs, Figma | push initial planning docs on `docs/project-scope` or `docs/architecture-draft` branch | agreed feature scope |
| Setup | initialize Next.js + TypeScript + Tailwind frontend | initialize FastAPI backend | VS Code, Node.js, Python | push project skeleton on separate feature branches, open PRs to `develop` | running frontend and backend skeleton |
| Workflow | create issue labels and board structure | create branch and PR rules | GitHub Projects / Issues | push `CONTRIBUTING.md` / workflow docs through `docs/...` branch | initial workflow system |
| Planning | draft page flow | draft service flow | Draw.io / Markdown | attach architecture image/doc in PR | architecture draft |

**Important note:** no advanced coding today. Avoid wasting time before the structure is clear.

---

## Day 2 — Routine Upload Foundation

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| UI | build upload page and validation states | define upload endpoint contract | Next.js, Tailwind, FastAPI docs | push upload UI in `feature/routine-upload-ui`; push upload route stub in `feature/routine-upload-api` | upload page ready |
| Preview | add image/PDF preview flow | implement backend file receive endpoint | Browser DevTools, Postman | PR both branches into `develop` after review | frontend-backend upload connection |
| Research | prepare confirmation screen wireframe | test OCR options on routine sample | Figma, Python scripts | push OCR test notebook/script and docs note to branch | OCR feasibility note |

**Warning:** keep UI simple and functional.

---

## Day 3 — OCR and Course Code Extraction

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Frontend | connect upload action to parse request | implement OCR text extraction | Next.js, FastAPI, OCR library | push integration work in `feature/routine-parse-integration`; push OCR service in `feature/course-extraction-parser` | OCR text visible |
| Results | build temporary result panel | write regex for `CSE XXXX` and `HUM XXXX` extraction | Python regex, logs | open PR with screenshots and test result | distinct course codes extracted |
| Stability | add loading/error states | normalize output and remove duplicates | Browser DevTools | merge reviewed PRs into `develop` | first usable parser flow |

**Warning:** do not try to make OCR perfect here.

---

## Day 4 — Structured Course Confirmation

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| UI | build editable course confirmation list | create course mapping table for code to title/type | Next.js, TypeScript, Python | push `feature/course-confirmation-ui` and `feature/course-mapping-service` | confirmation screen complete |
| Actions | add remove/edit/confirm controls | return structured course objects from backend | FastAPI, Postman | PRs must include sample payload | confirmed course payload |
| Integration | connect confirm action to save route | add fallback handling for uncertain OCR matches | DevTools | merge after teammate review | review-confirm-save flow |

---

## Day 5 — Dashboard and Persistence

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| UI | build course dashboard cards and filtering | create DB schema and storage structure for courses | Next.js, Firebase/Supabase | push `feature/course-dashboard` and `feature/course-persistence` | dashboard visible |
| Navigation | add click-to-open course route | build course fetch/save services | DB console, API testing tools | open PRs with dashboard screenshots and API notes | saved courses loaded from DB |
| Quality | improve empty and loading states | validate persistence using real extracted data | Browser DevTools | merge to `develop` after review | stable dashboard flow |

**Checkpoint:** by end of Day 5, routine upload to course dashboard must work end-to-end.

---

## Day 6 — Workspace Shell

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Layout | build course workspace shell and header | define API routes for notes, materials, and chat | Next.js, Tailwind, FastAPI | push `feature/course-workspace-layout` and `feature/workspace-api-stubs` | workspace skeleton |
| Notes panel | create notes panel structure | prepare notes API schema | TypeScript, FastAPI docs | PR with screenshots and endpoint contract | notes panel visible |
| Docs/chat shell | add placeholder panels | prepare material/chat endpoint stubs | Postman | merge reviewed PRs | full three-panel layout |

**Warning:** do not waste time on advanced resizing/animation.

---

## Day 7 — Notes Module

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Notes UI | add note create/view/edit flow | implement notes save/load API | Next.js, FastAPI, DB | push `feature/notes-ui` and `feature/notes-api` | notes feature works |
| Integration | connect note forms to backend | define note validation rules | Firebase/Supabase, Pydantic | PR should include CRUD test evidence | notes saved per course |
| Testing | test note CRUD manually | fix validation and persistence issues | Browser, API tools | merge to `develop` after review | stable notes module |

---

## Day 8 — Material Upload Module

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Upload UI | build material upload form and list view | implement storage upload logic | Next.js, storage service, FastAPI | push `feature/material-upload-ui` and `feature/material-upload-backend` | material upload visible |
| Metadata | show file title/type/date/status | save metadata in database | DB console, storage console | PR includes upload test screenshots | uploaded files linked to course |
| Validation | add accepted file type checks | handle rejected/invalid file input | Browser DevTools | merge after review | stable upload flow |

**Warning:** no document editing, no complex preview system.

---

## Day 9 — File Text Extraction

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| UI states | show processing/extraction status in materials list | implement PDF/DOCX/PPTX text extraction | Next.js, PyMuPDF, python-docx, python-pptx | push `feature/material-processing-ui` and `feature/file-text-extraction` | extraction pipeline working |
| Details view | add material detail or extracted status view | save extracted text and processing result | FastAPI, DB | PR should mention supported file types clearly | extracted text linked to file |
| Failure handling | show extraction error state | handle unsupported/failed extraction safely | Logs, test files | merge reviewed PRs | robust extraction handling |

**Warning:** prioritize PDF and DOCX reliability.

---

## Day 10 — Chat Pipeline Foundation

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Chat UI | build chatbot panel with message bubbles | create ask-question endpoint | Next.js, FastAPI | push `feature/chat-ui` and `feature/chat-endpoint` | chat interface complete |
| UX | add loading/error/empty states | return basic backend response first | Browser DevTools, Postman | PR should include end-to-end chat proof | end-to-end chat flow |
| Persistence | add simple chat list if feasible | define chat schema and course-bound history | DB, API | merge after review | chat linked to selected course |

**Important note:** today is for chat pipeline, not advanced retrieval quality.

---

## Day 11 — Minimal RAG Integration

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| UI improvement | show source label or snippet under answers | implement chunking, embeddings, and retrieval | FAISS, embedding model/API, FastAPI | push `feature/chat-source-ui` and `feature/rag-retrieval` | grounded course-aware answers |
| Context control | always send current course ID from frontend | restrict retrieval to selected course only | Python, vector index | PR must mention retrieval scope design | course-specific response flow |
| Testing | test with 2–3 uploaded materials | tune chunk size/top-k lightly | logs, sample prompts | merge reviewed PRs | minimal usable RAG |

**Warning:** do not over-optimize retrieval.

---

## Day 12 — Study Tracker

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Tracker UI | build hit/miss/score entry form | implement tracker save/load API | Next.js, FastAPI, DB | push `feature/study-tracker-ui` and `feature/study-tracker-api` | tracker input works |
| Records view | show recent logs by course | define tracker data model | TypeScript, Pydantic | PR includes sample records/screenshots | study records stored |
| Integration | connect tracker page to backend | validate fields | DevTools, Postman | merge after review | tracker module integrated |

---

## Day 13 — Retention Status and Reminder Basics

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Retention UI | build red/yellow/green status view | implement simple status update rules | Next.js, FastAPI, DB | push `feature/retention-ui` and `feature/retention-logic` | retention indicators visible |
| Reminder support | add reminder settings form/stub | create reminder data structure/basic scheduling logic | Browser, DB | push small separate PR if needed | basic reminder support |
| Testing | verify status updates after tracker input | verify reminder save/load flow | Manual testing | merge reviewed PRs | retention flow usable |

**Warning:** keep reminders lightweight.

---

## Day 14 — Integration Testing and Bug Fixing

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| End-to-end testing | test full user journey from upload to tracker | test OCR, extraction, retrieval, and DB consistency | Browser, API tools, DB console | create bug issues from findings, push fixes through `fix/...` branches | major bugs identified |
| Fixes | fix UI/state/navigation issues | fix processing/chat/parser issues | GitHub Issues, logs | open small bug-fix PRs, review quickly | stable near-final build |
| Cleanup | improve empty states and consistency | remove dead code and improve service structure | VS Code | merge reviewed fixes into `develop` | cleaner repository |

**Rule:** no new major feature starts today.

---

## Day 15 — Documentation and Demo Preparation

| Area | Contributor A | Contributor B | Tools Needed | GitHub Push / PR | Deliverable |
|---|---|---|---|---|---|
| Documentation | prepare screenshots and feature summaries | write setup instructions and technical summary | Markdown, GitHub | push `docs/...` branches or one final documentation PR | complete project docs |
| Demo | prepare interface walkthrough | prepare explanation for OCR, retrieval, and architecture choices | Screen recorder, notes | push demo assets/docs if needed | demo-ready flow |
| Final review | close/update issues and check merged PRs | review repo history and workflow evidence | GitHub | final merge to `main` from tested `develop` | submission-ready repository |

---

# 11. Minimum Acceptance Scenario

The project is in a strong state if the following clearly works:
1. upload a routine,
2. detect distinct courses,
3. confirm and save courses,
4. open course workspace,
5. add notes or upload materials,
6. extract text from at least one reliable file type,
7. ask a course-specific AI question,
8. record a study log.

If this scenario works cleanly, the project is already credible even if some optional ideas remain incomplete.

---

# 12. Daily Working Habit

Every day both contributors should try to produce:
- at least one issue update,
- meaningful commits,
- one PR or one PR review,
- short progress note,
- one tested increment.

This creates visible progress and protects the project from last-minute chaos.

---

# 13. Final Advice

Work feature by feature, not file by file.

A complete and demonstrable workflow with moderate technical sophistication is stronger than an unfinished system that attempted too many advanced ideas.
