# API Documentation — AI Career Assistant

**Base URL:** `http://localhost:5000/api`

**Authentication:** All protected routes require `Authorization: Bearer <token>` header.

---

## Authentication

### POST /auth/register
Register a new student account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### POST /auth/login
Login with credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as register.

### GET /auth/me *(Protected)*
Get current authenticated user.

**Response:**
```json
{
  "success": true,
  "user": { "_id": "...", "name": "...", "email": "...", "role": "..." }
}
```

### PUT /auth/update-password *(Protected)*
Update password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## User Profile

### GET /users/profile *(Protected)*
Get user's profile with completion percentage.

**Response:**
```json
{
  "success": true,
  "profile": {
    "userId": "...",
    "bio": "...",
    "skills": ["JavaScript", "React"],
    "education": [...],
    "experience": [...],
    "completionPercentage": 75
  }
}
```

### PUT /users/profile *(Protected)*
Update profile.

**Request Body:** Any profile fields (bio, phone, location, skills, education, experience, etc.)

### GET /users/activity *(Protected)*
Get recent activity (last 10 AI reports, interview sessions, saved jobs).

---

## Resume

### POST /resumes/upload *(Protected)*
Upload a resume file (PDF or DOCX, max 5MB).

**Content-Type:** `multipart/form-data`
**Body:** `resume` field with file

**Response:**
```json
{
  "success": true,
  "resume": {
    "_id": "...",
    "fileName": "my-resume.pdf",
    "filePath": "uploads/user123-1234567890-my-resume.pdf",
    "parsedText": "Extracted text from resume...",
    "mimeType": "application/pdf"
  }
}
```

### GET /resumes/my *(Protected)*
Get all user's resumes.

### GET /resumes/:id *(Protected)*
Get single resume by ID.

### DELETE /resumes/:id *(Protected)*
Delete a resume.

### PUT /resumes/:id/activate *(Protected)*
Mark a resume as the active/primary one.

---

## AI Features

### POST /ai/analyze-resume *(Protected)*
Analyze resume with AI. Returns score, strengths, weaknesses, suggestions.

**Request Body:**
```json
{
  "resumeId": "64f..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "score": 78,
    "strengths": ["Strong technical skills", "Good project experience"],
    "weaknesses": ["No quantified achievements", "Missing certifications"],
    "suggestions": ["Add metrics to your achievements", "Include GitHub links"],
    "keywords": ["JavaScript", "React", "Node.js"],
    "atsCompatibility": "Good",
    "overallVerdict": "A solid resume with room for improvement..."
  }
}
```

### POST /ai/generate-summary *(Protected)*
Generate a professional summary from resume.

**Request Body:** `{ "resumeId": "..." }`

**Response:** `{ "success": true, "summary": "Dynamic software engineer with 3 years..." }`

### POST /ai/generate-cover-letter *(Protected)*
Generate a cover letter for a specific job.

**Request Body:**
```json
{
  "resumeId": "...",
  "jobTitle": "Software Engineer",
  "company": "Google",
  "jobDescription": "We are looking for..."
}
```

**Response:** `{ "success": true, "coverLetter": "Dear Hiring Manager,\n..." }`

### POST /ai/skill-gap *(Protected)*
Analyze skill gaps for a target role.

**Request Body:** `{ "resumeId": "...", "targetRole": "Data Scientist" }`

**Response:**
```json
{
  "success": true,
  "analysis": {
    "currentSkills": ["Python", "SQL"],
    "missingSkills": ["Machine Learning", "TensorFlow", "Statistics"],
    "prioritySkills": ["Machine Learning", "Statistics"],
    "estimatedTime": "3-6 months"
  }
}
```

### POST /ai/career-paths *(Protected)*
Get AI-powered career path suggestions.

**Request Body:** `{ "resumeId": "..." }`

**Response:**
```json
{
  "success": true,
  "paths": [
    {
      "title": "Full-Stack Developer",
      "description": "...",
      "requiredSkills": ["React", "Node.js", "MongoDB"],
      "salaryRange": "$80k - $120k",
      "demandLevel": "High",
      "timeToAchieve": "6-12 months"
    }
  ]
}
```

### POST /ai/interview-questions *(Protected)*
Generate mock interview questions.

**Request Body:**
```json
{
  "targetRole": "Software Engineer",
  "interviewType": "technical",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "question": "Explain the difference between REST and GraphQL.",
      "category": "Web Technologies",
      "difficulty": "medium",
      "hint": "Consider data fetching efficiency..."
    }
  ]
}
```

### POST /ai/interview-feedback *(Protected)*
Get AI feedback on an interview answer.

**Request Body:**
```json
{
  "question": "Explain closures in JavaScript",
  "answer": "A closure is...",
  "role": "Software Engineer"
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "feedback": "Good explanation but could include practical examples...",
    "score": 7,
    "improvements": ["Add a code example", "Mention practical use cases"],
    "strengths": ["Correct definition", "Clear explanation"]
  }
}
```

### POST /ai/learning-roadmap *(Protected)*
Generate a personalized learning roadmap.

**Request Body:**
```json
{
  "targetRole": "Machine Learning Engineer",
  "currentSkills": ["Python", "SQL"],
  "timeframe": "6 months"
}
```

### POST /ai/project-ideas *(Protected)*
Get AI-generated project ideas.

**Request Body:** `{ "skills": ["React", "Node.js"], "targetRole": "Full Stack Developer" }`

### POST /ai/weekly-report *(Protected)*
Generate a personalized weekly improvement report based on platform activity.

---

## Jobs

### GET /jobs
Get all active job listings (public).

**Query Parameters:**
- `search` — search by title or company
- `type` — filter by job type (full-time, internship, etc.)
- `location` — filter by location
- `page` — page number (default: 1)
- `limit` — results per page (default: 10)

### GET /jobs/recommendations *(Protected)*
Get AI-matched job recommendations based on user's resume skills.

### GET /jobs/:id
Get single job details.

### POST /jobs/save/:id *(Protected)*
Save a job.

### GET /jobs/saved *(Protected)*
Get all saved jobs with status.

### PUT /jobs/saved/:id/status *(Protected)*
Update application status.

**Request Body:** `{ "status": "applied" }` (saved/applied/interviewing/offered/rejected)

### DELETE /jobs/saved/:id *(Protected)*
Remove a saved job.

### POST /jobs/apply/:id *(Protected)*
Mark as applied to a job.

---

## Interview

### POST /interviews/sessions *(Protected)*
Create a new interview session (saves questions).

### GET /interviews/sessions *(Protected)*
Get user's interview history.

### GET /interviews/sessions/:id *(Protected)*
Get single interview session.

### POST /interviews/sessions/:id/submit *(Protected)*
Submit answers and get AI feedback.

**Request Body:**
```json
{
  "answers": [
    { "questionIndex": 0, "answer": "My answer here..." },
    { "questionIndex": 1, "answer": "Another answer..." }
  ]
}
```

### DELETE /interviews/sessions/:id *(Protected)*
Delete an interview session.

---

## Learning

### GET /learning/plan *(Protected)*
Get (or create) user's learning plan.

### PUT /learning/plan *(Protected)*
Update learning plan.

### POST /learning/plan/complete/:weekIndex *(Protected)*
Mark a week in the roadmap as completed.

### POST /learning/bookmarks *(Protected)*
Bookmark a resource.

**Request Body:** `{ "title": "...", "url": "...", "type": "article" }`

### GET /learning/bookmarks *(Protected)*
Get all bookmarked resources.

### DELETE /learning/bookmarks/:resourceId *(Protected)*
Remove a bookmark.

---

## Admin Endpoints *(Protected + Admin role)*

### GET /admin/users
List all users with pagination and search.

### GET /admin/users/:id
Get user detail with profile and stats.

### PUT /admin/users/:id/status
Activate or deactivate a user.

**Request Body:** `{ "isActive": false }`

### DELETE /admin/users/:id
Permanently delete a user and all their data.

### GET /admin/analytics
Get platform-wide analytics.

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalUsers": 150,
    "activeUsers": 120,
    "totalResumes": 89,
    "totalJobs": 45,
    "totalInterviews": 234,
    "aiUsageTotal": 1890,
    "userGrowth": [{"date": "2024-01-01", "count": 5}],
    "popularFeatures": [{"feature": "resume-analysis", "count": 450}]
  }
}
```

### GET /admin/ai-usage
AI usage breakdown by user and report type.

### POST /admin/jobs
Create a new job listing.

### GET /admin/jobs
Get all jobs with stats.

### PUT /admin/jobs/:id
Update a job listing.

### DELETE /admin/jobs/:id
Delete a job listing.

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description here"
}
```

| Status Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource Not Found |
| 500 | Server Error |
