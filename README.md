# AI-Powered Course Workspace from Routine Scan

## Overview
AI-Powered Course Workspace from Routine Scan is a desktop-first web application that converts a semester class routine into a structured, course-centered academic workspace.

The system scans a routine image or PDF, detects distinct course codes, generates dedicated course workspaces automatically, and organizes academic support for each course through three core sections:

- Lecture Notes
- Slides & Documents
- AI Chatbot

The purpose of the project is to reduce fragmentation in student study materials by combining routine-based course setup, document organization, and AI-assisted learning support in one platform.

---

## Problem It Solves
Students often manage semester materials across multiple disconnected sources such as printed routines, lecture notes, slides, PDFs, and chat groups. As a result:

- course organization usually starts late and remains messy,
- materials stay scattered across different locations,
- missed lectures are harder to recover from,
- course-wise study support is not centralized,
- progress tracking becomes inconsistent.

This project addresses that problem by automatically transforming a routine into structured course entities and then creating a dedicated workspace for each detected course.

---

## Core Features

### 1. Routine-Based Course Detection
- Upload class routine image or PDF
- Run OCR on the uploaded routine
- Detect distinct course codes using pattern matching
- Review and confirm extracted courses before saving

### 2. Course-Centered Workspace
Each detected course receives a dedicated workspace with:
- Lecture Notes section
- Slides & Documents section
- AI Chatbot section

### 3. Course Material Management
- Upload course-specific documents
- Keep materials organized under the relevant course
- Maintain structured access to notes and academic resources

### 4. AI-Assisted Question Answering
- Ask course-specific questions inside the workspace
- Generate responses grounded in uploaded course materials
- Keep chatbot interaction limited to the selected course context

### 5. Study Progress Support
- Record simple study progress or review status
- Maintain a lightweight retention/status view for follow-up

---

## Expected Workflow
1. Upload a semester class routine image or PDF
2. Extract raw text using OCR
3. Detect distinct course codes from the routine
4. Review and confirm the extracted courses
5. Generate a course dashboard automatically
6. Open an individual course workspace
7. Add notes, upload materials, and interact with the AI chatbot for that course

---

## Why Web Application
This project is designed as a **desktop-first web application** because the main learning workflow depends on simultaneous access to notes, documents, and AI support.

A web interface provides:
- cleaner multi-panel workspace support,
- better usability for document upload and preview,
- more effective course dashboard organization,
- a stronger academic workflow compared to a mobile-first layout.

---

## Technology Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- Python

### Database and Storage
- Firebase or Supabase

### OCR and File Processing
- Tesseract OCR or EasyOCR
- PyMuPDF / pdfplumber
- python-docx
- python-pptx

### AI and Retrieval
- FAISS
- Embedding model or API
- LLM integration for course-aware responses

---

## High-Level Architecture

```text
User
  |
  v
Next.js Web Application
  |-- Routine Upload
  |-- Course Dashboard
  |-- Course Workspace
  |     |-- Lecture Notes
  |     |-- Slides & Documents
  |     |-- AI Chatbot
  |
  v
FastAPI Backend
  |-- OCR Service
  |-- Course Extraction Service
  |-- File Processing Service
  |-- Retrieval / Chat Service
  |
  +--> Database
  +--> Storage
  +--> Vector Index
```

---

## Project Structure

```text
frontend/
backend/
docs/
README.md
```

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/sa-hcc5142/system_project_3-2.git
cd system_project_3-2
```

### 2. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend setup
Create a separate terminal and run:

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Environment configuration
Set up the required environment variables for:
- database/storage provider,
- OCR configuration if needed,
- embedding/LLM API access.

Example files:
- `frontend/.env.local`
- `backend/.env`

---

## Minimum Demonstration Scenario
A complete demonstration should support the following flow:

1. Upload a routine
2. Extract and confirm courses
3. Open a generated course workspace
4. Add notes or upload course materials
5. Ask a course-specific question through the chatbot
6. Record simple study progress

---

## Future Enhancements
- handwritten note OCR
- automatic quiz generation
- stronger semantic retrieval
- personalized revision recommendations
- richer progress analytics
- mobile companion interface

---

## Collaboration
This repository follows a structured collaborative workflow using:
- branches,
- pull requests,
- code review,
- controlled merging,
- issue-based task tracking.

