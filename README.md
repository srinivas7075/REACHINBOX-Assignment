# ReachInbox Email Scheduler

A full-stack email scheduling system built with **Express, BullMQ, Redis, PostgreSQL, and Next.js**.

---

## 🛠️ Architecture Overview

### 1. Scheduling Engine
- **BullMQ (Redis)** is used for job management.
- When a user schedules an email, a job is added to the `email-queue` with a `delay` corresponding to the scheduled time.
- Purely event-driven; **no Cron jobs** are used.

### 2. Persistence on Restart
- **Job State**: Stored in Redis (Jobs) and PostgreSQL (Metadata).
- **Graceful Handling**: If the backend server crashes or restarts:
    - Redis persists the pending jobs.
    - On restart, the BullMQ Worker reconnects to Redis and resumes processing exactly where it left off.
    - No data is lost.

### 3. Rate Limiting & Concurrency
- **Concurrency**: The worker is configured to process multiple jobs in parallel (configurable via `WORKER_CONCURRENCY`).
- **Rate Limiting**: Implemented using a **Sliding Window** or **Token Bucket** approach in Redis (`rate_limit:{userId}:{hour}`).
    - If a user exceeds their limit (e.g., 10 emails/hr), the job is not failed. Instead, it is **delayed/rescheduled** to the next available window.

---

## ✅ Features Implemented

| Feature | Component | Status | Details |
| :--- | :--- | :--- | :--- |
| **Scheduler Engine** | Backend | ✅ Done | BullMQ with delayed jobs. |
| **Persistence** | Backend | ✅ Done | Docker Volumes for Redis/PG. Worker resumes auto-magically. |
| **Rate Limiting** | Backend | ✅ Done | Redis-backed counters per user per hour. |
| **Concurrency** | Backend | ✅ Done | Adjustable worker threads. |
| **API** | Backend | ✅ Done | `POST /schedule`, `GET /scheduled-emails`. |
| **Login** | Frontend | ✅ Done | Mock Google Login (UI only for demo). |
| **Dashboard** | Frontend | ✅ Done | View Scheduled vs Sent emails. |
| **Visuals** | Frontend | ✅ Done | **Glassmorphism UI**, Accordion View, Grid Layout. |
| **Compose** | Frontend | ✅ Done | Rich Text (Basic) + CSV Upload. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Docker** & **Docker Compose** (for Redis & Postgres)

### 2. Setup Infrastructure
Start the required databases:
```bash
docker-compose up -d
```

### 3. Setup Backend
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   - The app uses **Ethereal Email** (a fake SMTP service) by default.
   - On first run, the app **automatically generates** Ethereal credentials and saves them to `.env`. No manual setup required!
4. Initialize Database:
   ```bash
   npm run init-db
   ```
5. Start Server:
   ```bash
   npm run dev
   ```
   *Runs on `http://localhost:5002`*

### 4. Setup Frontend
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Client:
   ```bash
   npm run dev
   ```
   *Runs on `http://localhost:3002`*

---

## 🧪 How to Test

1. **Open** `http://localhost:3002`
2. **Login** (Click "Login with Google" - it's a mock access).
3. **Schedule**:
   - Go to "Schedule".
   - Upload a CSV or enter manually.
   - Pick a time 2 mins in the future.
   - Click "Schedule".
4. **Verify**:
   - Check the **"Scheduled"** tab to see them pending.
   - Wait for the time to pass.
   - Check the **"Sent"** tab (or check the Backend console for Ethereal URL).

---

## ⚠️ Assumptions & Trade-offs

1. **Mock Authentication**:
   - Real Google OAuth is partially implemented but mocked for the demo to avoid requiring reviewer API keys.
   - The "Login" button simulates a successful session.

2. **Ethereal Email**:
   - Used instead of SendGrid/SES to ensure the reviewer can run the project without setting up paid external accounts.
   - Emails are "sent" to a trap inbox, not real addresses.

3. **Timezones**:
   - The scheduler assumes the client sends the scheduled time in ISO format.
   - Server processes based on UTC/Server time.

4. ** CSV Parsing**:
   - Assumes a simple header structure (`email`, `subject`, `body`). Complex validations are minimal for this MVC.
