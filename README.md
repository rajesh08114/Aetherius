# Traveloop

Traveloop is an AI-powered travel planning platform built with Next.js.  
It helps users design trips end-to-end: itinerary building, city/activity planning, budgeting, checklists, notes, sharing, and community discovery.

## Project Highlights

- Secure authentication with role-based access (`user`, `admin`)
- Multi-trip dashboard and trip lifecycle management
- Multi-stop itinerary builder with reorder support
- Activity planning and destination discovery
- Budget and carbon-related assistant APIs
- AI assistant for trip ideas, cost reduction, and planning help
- Notes and checklist tools for execution readiness
- Community sharing flows
- Admin analytics dashboard (usage, trends, engagement, user management)

## Tech Stack

- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion
- State/Data: Zustand, TanStack Query
- Backend/API: Next.js Route Handlers
- Database: MongoDB with Mongoose models
- Cache/Rate Limit: Upstash Redis (optional in local dev)
- AI Provider: Hugging Face Inference Router (OpenAI-compatible chat endpoint)
- Charts: Recharts

## Architecture Notes

- Main app routes are in `app/` using App Router route groups:
  - `app/(auth)` for login/signup flows
  - `app/(dashboard)` for authenticated product modules
  - `app/api/v1/*` for backend APIs
- Auth is JWT-based with refresh token cookie flow.
- AI features are implemented in `app/api/v1/ai/*`.
- Admin analytics is available at `app/(dashboard)/admin/page.tsx`.

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm 9+
- MongoDB instance (local or cloud)
- Optional: Upstash Redis for production-grade rate limiting

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.local.example .env
```

3. Fill required variables in `.env` (see table below).

4. Start development server:

```bash
npm run dev
```

5. Open:

`http://localhost:3000`

## Environment Variables

Minimum required for core app + auth + AI:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `NEXT_PUBLIC_APP_URL` | Yes | App origin (example: `http://localhost:3000`) |
| `HF_API_KEY` | Yes (for AI) | Hugging Face Inference API key |
| `HF_INFERENCE_URL` | Optional | Defaults to `https://router.huggingface.co/v1` |
| `HF_MODEL_ID` | Yes (for AI) | Primary model id |
| `HF_MODEL_FALLBACKS` | Optional | Comma-separated fallback models |

Optional integrations:

| Variable | Purpose |
|---|---|
| `REDIS_URL`, `REDIS_TOKEN` | Upstash Redis cache/rate-limit/blacklist |
| `CLOUDINARY_*` | Media upload/storage |
| `NEXT_PUBLIC_SOCKET_URL` | Socket server URL |
| `UNSPLASH_ACCESS_KEY` | External image/destination enhancements |
| `EXCHANGE_RATE_API_KEY` | Currency conversion enhancements |
| `DATABASE_URL` | Legacy Prisma/Postgres workflows (not primary runtime DB) |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | Run lint checks |
| `npm run typecheck` | TypeScript checks (`tsc --noEmit`) |
| `npm run socket` | Start socket server (if used) |
| `npm run prisma:*` | Prisma utility scripts (optional/legacy flow) |

## Admin Analytics Dashboard

- Route: `/admin`
- Access: admin users only
- Includes:
  - KPI cards (users, trips, activities, stops, active users, views/trip)
  - 30-day trip and user growth charts
  - Trip status distribution
  - Top cities and top activity types
  - Engagement metrics (likes/comments/views/forks)
  - Recent trips table
  - User role management (promote/demote)

## AI Assistant Quality Fixes (Current)

Recent improvements were added to reduce noisy AI output:

- Stronger generation controls (temperature/top_p/frequency penalty)
- Server-side response sanitization for repeated token artifacts
- Safer chunk merge and duplicate cleanup in chat UI rendering
- Prompt update for more professional, structured responses

## Production Notes

- Use strong random JWT secrets.
- Enable Redis in production for reliable rate limits and token blacklist support.
- Configure monitoring/logging for API route errors.
- Restrict admin role assignment workflows and audit role changes.

## License

Private project. Add your organization’s license policy before public distribution.
