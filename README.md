# Blood Bank App

This repository contains a full-stack Blood Donation/Request application with:
- `backend/`: Express + MongoDB API server
- `frontend/`: React application

## Prerequisites

- Node.js installed
- npm available
- MongoDB database or MongoDB Atlas connection string

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Blood-Bank
   ```

2. Install dependencies for the root workspace:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Environment Variables

### Backend

Copy the backend example file and configure values:

```bash
cd backend
copy .env.example .env
```

Then edit `backend/.env` and set:
- `MONGO_URI` — MongoDB connection string
- `DB_NAME` — optional database name
- `JWT_SECRET` — JSON Web Token secret
- `EMAIL_USER` / `EMAIL_PASS` — email service credentials for notifications
- `FRONTEND_URL` — frontend origin, default is `http://localhost:3000`

### Frontend

Copy the frontend example file:

```bash
cd frontend
copy .env.example .env
```

If needed, update `REACT_APP_API_URL` to point to the backend API (default is `http://localhost:5000`).

## Run the app

From the repository root, start both backend and frontend together:

```bash
npm run start
```

### Alternative commands

- Start backend only:
  ```bash
  npm run start:backend
  ```
- Start frontend only:
  ```bash
  npm run start:frontend
  ```
- Run backend with live reload:
  ```bash
  npm run dev:backend
  ```
- Run frontend in development mode:
  ```bash
  npm run dev:frontend
  ```

## Seed a default user

If you want to seed a default user into the backend database:

```bash
cd backend
npm run seed:user
```

## Access

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Notes

- The backend must have a valid `MONGO_URI` before starting.
- If using `mongodb+srv://`, the backend includes a DNS fallback fix for Windows/network issues.
- Use `npm run dev` from the root to run both services in development mode if supported.
