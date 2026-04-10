<!--
This file is generated/updated to help AI coding agents work productively in this repo.
Keep entries concise, code-location specific, and actionable.
-->
# Copilot instructions for the Travel Story project

Purpose: help AI agents make safe, minimal, and correct code changes for feature work and maintenance.

- **Big picture:**
  - Backend: Express + MongoDB. Server entry is [backend/index.js](backend/index.js) (runs on `http://localhost:3000`).
  - Frontend: React + Vite app in [frontend/travel-story-app](frontend/travel-story-app). Dev server via `pnpm/npm/yarn run dev` (script `dev` in package.json).
  - Data model: `TravelStory` and `User` are in [backend/models](backend/models).

- **Startup / dev commands:**
  - Backend: from `backend/` run `npm run start` (uses `nodemon index.js`). Ensure `config.json` connection string and `.env` with `ACCESS_TOKEN_SECRET` exist.
  - Frontend: from `frontend/travel-story-app/` run `npm run dev` (Vite).

- **Where to look first for changes:**
  - API endpoints and request/response shapes: [backend/index.js](backend/index.js).
  - Auth helper: [backend/utilities.js](backend/utilities.js) — JWT token in `Authorization: Bearer <token>` header.
  - File upload & storage: [backend/multer.js](backend/multer.js) and the `/image-upload` endpoint; uploaded files are saved to `backend/uploads/` and served at `/uploads`.
  - Frontend API client: [frontend/travel-story-app/src/utils/axiosInstance.js](frontend/travel-story-app/src/utils/axiosInstance.js) — automatically attaches `accessToken` from `localStorage`.
  - Frontend constants: [frontend/travel-story-app/src/utils/constants.js](frontend/travel-story-app/src/utils/constants.js) sets `BASE_URL` (currently `http://localhost:3000`).

- **API conventions & examples (copyable):**
  - Authentication: use header `Authorization: Bearer <token>`; tokens created with `ACCESS_TOKEN_SECRET` and 7d expiry in backend.
  - Image upload: POST `/image-upload` with multipart/form-data, field name `image`. Response: `{ imageUrl: "http://localhost:3000/uploads/<filename>" }`.
  - Create story: POST `/add-travel-story` (authenticated) with JSON `{ title, story, visitedLocation, isFavorite, imageUrl, visitedDate }`. Required: `title`, `story`, `imageUrl`, `visitedDate`.

- **Patterns & conventions to preserve:**
  - Error responses follow `{ error: true|false, message, <data> }` — keep this shape for backward compatibility.
  - Backend uses `userId` from JWT payload (`req.user.userId`) to scope DB queries — always use `userId` in queries to avoid exposing other users' data.
  - Frontend stores token in `localStorage` under key `accessToken` and uses the axios instance; prefer that pattern when adding client code.

- **Tests & linting:**
  - There are no automated tests in the repo; avoid adding speculative tests without confirming test runner and scope.
  - Frontend lint: `npm run lint` in `frontend/travel-story-app` (ESLint). Keep existing ESLint rules.

- **Common pitfalls & gotchas:**
  - DB connection info is in [backend/config.json](backend/config.json). Ensure valid connection string before running backend.
  - Image deletion and file paths assume `http://localhost:3000` in several places; update both backend and frontend constants if changing host/port.
  - `multer` stores files in `./uploads/` relative to `backend/` — file operations in endpoints use `path.join(__dirname, 'uploads', filename)`.

- **When modifying API responses:**
  - Keep response shape backwards compatible; update frontend usage (search for `axiosInstance` and components under [frontend/.../pages/Auth](frontend/travel-story-app/src/pages/Auth)) when changing fields.

- **Good-first tasks for agents:**
  - Small UI fixes within the Vite app (use `npm run dev`), updating components under `src/components`.
  - Add defensive checks in backend endpoints to avoid throwing when expected fields are missing (follow existing error-response shape).

If anything in this file seems incomplete or you want an expanded section (examples, tests, CI), tell me which area to expand.
