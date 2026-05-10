# TRAVELOOP v2 — WORLD-CLASS ARCHITECTURE
> Stack: Next.js 14 App Router + MongoDB Atlas + Redis + Socket.io + Claude AI
> Version: 2.0 | Upgraded with AI Recommendation Engine, Mood-Based Planning, Carbon Tracker, Social Graph

---

## 🏗️ SYSTEM OVERVIEW

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Next.js 14 App Router │ React 18 │ Zustand │ TanStack Query    │
│  Framer Motion │ MapLibre GL │ Recharts │ Tailwind CSS          │
│  PWA (next-pwa) │ Socket.io-client │ DOMPurify                  │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTPS / WSS
┌─────────────────────────────▼────────────────────────────────────┐
│              API GATEWAY (Next.js Route Handlers)                │
│  /api/v1/* — Auth │ Trips │ Cities │ AI │ Social │ Insights     │
│  Rate limiting (Redis) │ JWT Middleware │ Zod validation         │
└──────────────┬──────────────────────┬───────────────────────────┘
               │                      │
    ┌──────────▼──────┐    ┌──────────▼──────────┐    ┌──────────────┐
    │  MongoDB Atlas  │    │  Upstash Redis      │    │ Socket.io    │
    │  (primary data) │    │  sessions, cache,   │    │ Railway.app  │
    │  + vector store │    │  rate limits,       │    │ (collab WS)  │
    │  for AI search  │    │  AI cache layer     │    │              │
    └──────────┬──────┘    └─────────────────────┘    └──────────────┘
               │
    ┌──────────▼──────────────────────────────────────────────────┐
    │                    EXTERNAL APIS                            │
    │  Anthropic Claude claude-sonnet-4-20250514 (AI engine)     │
    │  Nominatim (geocoding) │ Open-Meteo (weather real-time)    │
    │  Unsplash (city photos) │ ExchangeRate API (forex)         │
    │  Cloudinary (image upload) │ Carbon Interface API          │
    └─────────────────────────────────────────────────────────────┘
```

---

## 🆕 NEW FEATURES (V2 UPGRADES)

### 1. 🧠 AI Recommendation Engine (Claude-Powered)
Beyond simple chat — a full intelligence layer:
- **Mood-based trip matching**: User selects mood tags (adventurous / romantic / family / budget / luxury / spiritual) → AI generates ranked city recommendations with reasoning
- **Personalization vector**: Tracks past trips, liked cities, avg budget → feeds into every AI call as context
- **Smart conflict detection**: AI scans itinerary → flags overlapping dates, unrealistic travel times, over-budget days
- **AI cost optimizer**: "I'm ₹5000 over budget" → AI suggests specific swaps (cheaper hotel X, skip activity Y, fly day earlier = save Z)
- **Packing AI**: Generates checklist from weather API + trip type + duration + cities visited
- **Local hidden gems**: AI searches beyond tourist traps → suggests off-beat activities per city
- **Trip timeline health score**: AI rates itinerary 1-100 on pace, variety, budget efficiency, logistics

### 2. 🌡️ Live Weather Intelligence
- Open-Meteo API (free, no key) → real-time + 7-day forecast per stop city
- WeatherWidget on each StopCard: temp, rain probability, wind
- "Rainy day alternatives" button → AI suggests indoor activities when rain forecast > 60%
- Climate calendar: monthly avg temp/rain chart per city to help pick best travel months

### 3. 🌱 Carbon Footprint Tracker
- Calculates CO2 per transport segment (flight/train/bus/drive using distance × emission factor)
- Shows trip total carbon score with color grade (green/yellow/red)
- "Go greener" button → AI suggests train alternatives, carbon offsets
- Badge system: "Low Carbon Traveler" if score < threshold

### 4. 👥 Social Graph & Community
- Follow other travelers (friend graph stored in MongoDB)
- Public trip gallery: browse community trips by city, budget, duration
- Trip "forks": clone anyone's public trip as starting template
- Like + Save trips from community
- Trip-specific comment threads (public share page)
- Leaderboards: Most trips, Countries visited, Carbon saved

### 5. 🗺️ Advanced Map Features
- **Heatmap layer**: popular activities density per city
- **Cost overlay**: choropleth city color = avg daily cost
- **Route optimizer**: AI suggests optimal stop order to minimize backtracking
- **Offline map tiles**: caches visible area via service worker
- **Street view integration**: Mapillary free street imagery on activity pins

### 6. 📊 Advanced Analytics Dashboard
- Personal travel stats: countries visited, cities, total km, total spend
- Year-in-travel summary (Spotify Wrapped style) auto-generated every January
- Budget trends across trips (are you overspending?)
- Activity type breakdown (% adventure vs culture vs food)
- Best/worst value trips (cost per activity, cost per km)

### 7. ⚡ Performance Upgrades
- MongoDB Atlas Vector Search for semantic city search ("cozy mountain town with good food")
- Redis Sorted Sets for leaderboards (O(log n) ops)
- Incremental Static Regeneration for public share pages
- Edge middleware for auth (no cold starts on protected routes)
- Optimistic UI for ALL mutations (stops, activities, checklist, notes)
- Streaming SSE for AI responses (no waiting for full response)

---

## 📁 UPDATED PROJECT STRUCTURE

```
traveloop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── trips/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── builder/page.tsx
│   │   │       ├── view/page.tsx
│   │   │       ├── budget/page.tsx
│   │   │       ├── checklist/page.tsx
│   │   │       └── notes/page.tsx
│   │   ├── explore/
│   │   │   ├── cities/page.tsx
│   │   │   ├── activities/page.tsx
│   │   │   └── community/page.tsx      # NEW: Social trip feed
│   │   ├── insights/page.tsx           # NEW: Personal travel analytics
│   │   ├── profile/page.tsx
│   │   └── admin/page.tsx
│   ├── share/[token]/page.tsx
│   ├── api/v1/
│   │   ├── auth/...
│   │   ├── trips/...
│   │   ├── cities/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── semantic/route.ts       # NEW: vector semantic search
│   │   ├── activities/route.ts
│   │   ├── weather/route.ts            # NEW: weather proxy
│   │   ├── carbon/route.ts             # NEW: carbon calc
│   │   ├── ai/
│   │   │   ├── suggest/route.ts
│   │   │   ├── recommend/route.ts      # NEW: mood-based recs
│   │   │   ├── optimize/route.ts       # NEW: budget optimizer
│   │   │   ├── checklist/route.ts      # NEW: AI packing list
│   │   │   └── health-score/route.ts   # NEW: trip quality score
│   │   ├── social/
│   │   │   ├── feed/route.ts           # NEW
│   │   │   ├── follow/route.ts         # NEW
│   │   │   └── like/route.ts           # NEW
│   │   ├── insights/route.ts           # NEW: personal stats
│   │   ├── public/[shareToken]/route.ts
│   │   └── admin/...
│   └── layout.tsx
├── components/
│   ├── ui/                             # shadcn/ui
│   ├── auth/
│   ├── dashboard/
│   │   ├── StatsRow.tsx
│   │   ├── UpcomingCountdown.tsx
│   │   └── RecommendedDestinations.tsx # AI-powered
│   ├── trips/
│   │   ├── TripCard.tsx
│   │   ├── TripHealthBadge.tsx         # NEW: AI health score badge
│   │   └── CarbonBadge.tsx             # NEW
│   ├── builder/
│   │   ├── StopCard.tsx
│   │   ├── DraggableStop.tsx
│   │   ├── ActivityPicker.tsx
│   │   ├── TimelineView.tsx
│   │   └── ConflictAlert.tsx           # NEW: AI conflict detection
│   ├── maps/
│   │   ├── TripMap.tsx
│   │   ├── CommunityMap.tsx            # NEW: world heatmap
│   │   └── RouteOptimizer.tsx          # NEW
│   ├── budget/
│   │   ├── CostChart.tsx
│   │   ├── BudgetAlert.tsx
│   │   └── CarbonCostWidget.tsx        # NEW
│   ├── weather/
│   │   └── WeatherWidget.tsx           # NEW
│   ├── ai/
│   │   ├── AIAssistant.tsx
│   │   ├── MoodPicker.tsx              # NEW: mood → recommendation
│   │   ├── TripHealthScore.tsx         # NEW
│   │   └── SmartConflictPanel.tsx      # NEW
│   ├── social/
│   │   ├── CommunityFeed.tsx           # NEW
│   │   ├── TripComments.tsx            # NEW
│   │   └── FollowButton.tsx            # NEW
│   ├── insights/
│   │   └── TravelStats.tsx             # NEW: wrapped-style stats
│   └── shared/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── PageTransition.tsx
│       ├── SkeletonCard.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── db/
│   │   ├── mongoose.ts
│   │   └── redis.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Trip.ts
│   │   ├── Stop.ts
│   │   ├── Activity.ts
│   │   ├── City.ts
│   │   ├── Checklist.ts
│   │   ├── Note.ts
│   │   ├── SharedItinerary.ts
│   │   ├── Follow.ts                   # NEW
│   │   ├── TripLike.ts                 # NEW
│   │   └── TripComment.ts              # NEW
│   ├── auth/
│   │   ├── jwt.ts
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── client.ts                   # NEW: Anthropic SDK singleton
│   │   ├── prompts.ts                  # NEW: all system prompts
│   │   └── context-builder.ts          # NEW: builds user context for AI
│   ├── carbon/
│   │   └── calculator.ts               # NEW: CO2 calculation logic
│   ├── validations/
│   └── utils/
│       ├── budget.ts
│       ├── currency.ts
│       ├── share.ts
│       └── geo.ts                      # NEW: distance calculation
├── store/
│   ├── authStore.ts
│   ├── tripStore.ts
│   ├── uiStore.ts
│   └── aiStore.ts                      # NEW: AI chat history, recs
├── hooks/
│   ├── useAuth.ts
│   ├── useTrips.ts
│   ├── useTrip.ts
│   ├── useCities.ts
│   ├── useActivities.ts
│   ├── useBudget.ts
│   ├── useSocket.ts
│   ├── useAI.ts
│   ├── useWeather.ts                   # NEW
│   ├── useCarbon.ts                    # NEW
│   └── useInsights.ts                  # NEW
├── server/
│   └── socket.ts
├── scripts/
│   └── seed.ts
├── types/
│   └── index.ts
└── middleware.ts
```

---

## 🗄️ DATABASE SCHEMA V2

### New: Follow Collection
```json
{
  "_id": "ObjectId",
  "followerId": "ObjectId (ref: Users, indexed)",
  "followingId": "ObjectId (ref: Users, indexed)",
  "createdAt": "Date"
}
```
Index: `{ followerId: 1, followingId: 1 }` unique compound.

### New: TripLike Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "tripId": "ObjectId",
  "createdAt": "Date"
}
```
Index: `{ userId: 1, tripId: 1 }` unique.

### New: TripComment Collection
```json
{
  "_id": "ObjectId",
  "tripId": "ObjectId (indexed)",
  "userId": "ObjectId",
  "content": "string (max 500, DOMPurified)",
  "parentId": "ObjectId (optional, for replies)",
  "createdAt": "Date"
}
```

### Updated: User Schema (add fields)
```json
{
  "moodPreferences": ["adventurous","romantic","family","budget","luxury","spiritual"],
  "travelPersonality": "string (AI-generated summary)",
  "carbonScore": "number (lifetime CO2 kg)",
  "totalKmTraveled": "number",
  "countriesVisited": ["string"],
  "followersCount": "number",
  "followingCount": "number"
}
```

### Updated: Trip Schema (add fields)
```json
{
  "aiHealthScore": "number (0-100)",
  "carbonKg": "number",
  "likesCount": "number",
  "viewCount": "number",
  "forkCount": "number",
  "forkedFrom": "ObjectId (optional, ref: Trips)"
}
```

### Updated: Stop Schema (add fields)
```json
{
  "weatherCache": {
    "temp": "number",
    "condition": "string",
    "rainProbability": "number",
    "fetchedAt": "Date"
  },
  "carbonKg": "number (transport leg CO2)"
}
```

---

## 🧠 AI ARCHITECTURE (lib/ai/)

### Anthropic Client Singleton (lib/ai/client.ts)
```typescript
import Anthropic from '@anthropic-ai/sdk';
let _client: Anthropic;
export function getAIClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}
```

### Context Builder (lib/ai/context-builder.ts)
Builds rich context object injected into every AI call:
```typescript
interface AIContext {
  user: { name, moodPreferences, pastCities, avgBudgetPerDay, travelPersonality };
  trip?: { name, cities, dates, totalBudget, currency, currentSpend, stops };
  currentStop?: { cityName, arrivalDate, departureDate, activities };
  question: string;
}
```

### System Prompts (lib/ai/prompts.ts)
- `TRIP_PLANNER_PROMPT` — base travel expert persona
- `BUDGET_OPTIMIZER_PROMPT` — cost reduction specialist mode
- `ITINERARY_HEALTH_PROMPT` — structured JSON scorer
- `PACKING_EXPERT_PROMPT` — climate-aware packing list generator
- `MOOD_MATCHER_PROMPT` — personality-to-destination matcher
- `CONFLICT_DETECTOR_PROMPT` — logical issue scanner

### Cache Strategy
All AI responses cached in Redis with:
- Key: `ai:{promptType}:{hashOfInput}`
- TTL: 24h for recommendations, 1h for budget optimize (prices change)
- Skip cache if user adds `?fresh=1` param

---

## 🔐 SECURITY (unchanged + additions)

All V1 rules preserved PLUS:
- **AI prompt injection guard**: strip `<system>` tags + suspicious instruction patterns from user input before sending to Claude
- **Social content**: DOMPurify all comment/note content before DB write AND before render
- **Rate limits** (Redis sliding window):
  - Auth: 5/min
  - AI endpoints: 20/min per user (prevent API cost abuse)
  - Public share: 100/min (no auth)
  - Social actions: 50/min

---

## ⚡ PERFORMANCE TARGETS V2

| Metric | Target |
|--------|--------|
| LCP | < 2.0s |
| FID | < 100ms |
| CLS | < 0.05 |
| API p95 | < 150ms |
| AI streaming first token | < 800ms |
| MongoDB queries | indexed, < 30ms |
| Redis cache hit rate | > 80% on city search |
| Bundle size (initial) | < 180kb gzipped |

---

## 🔑 ENV VARIABLES V2

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Auth
JWT_ACCESS_SECRET=        # min 32 chars
JWT_REFRESH_SECRET=       # min 32 chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI
ANTHROPIC_API_KEY=

# External (all free tiers)
EXCHANGE_RATE_API_KEY=
# Open-Meteo: no key needed
# Nominatim: no key needed
# Unsplash: Client-ID header
UNSPLASH_ACCESS_KEY=

# App URLs
NEXT_PUBLIC_APP_URL=https://traveloop.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://traveloop-socket.railway.app
```

---

## 🚀 DEPLOYMENT V2

```
Vercel          → Next.js app + API routes (Edge for middleware)
MongoDB Atlas   → M0 free (indexes: userId, shareToken, city text, vector)
Upstash Redis   → Serverless Redis (rate limits, cache, sessions)
Railway.app     → Socket.io server (persistent WS)
Cloudinary      → Image CDN + uploads
```

All infra stays on free tiers for hackathon. Production path: Atlas M10 + Upstash Pay-as-you-go.
