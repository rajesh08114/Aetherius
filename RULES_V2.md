# TRAVELOOP v2 — DEVELOPMENT RULES & CONVENTIONS
> Every team member must read. No exceptions. Violation = PR rejected.

---

## 🧱 STACK RULES

| Layer | Tech | Version | Rule |
|-------|------|---------|------|
| Framework | Next.js | 14.x | App Router ONLY. No pages/ dir |
| Language | TypeScript | 5.x | Strict mode. No `any`. No `@ts-ignore` |
| Styling | Tailwind CSS | 3.x | Utility-first. No raw CSS except globals.css |
| State | Zustand | 4.x | One store per domain. No prop drilling > 2 levels |
| Server State | TanStack Query | 5.x | All API calls through hooks. No raw fetch in components |
| DB | MongoDB + Mongoose | 8.x | All models in lib/models/. Schema validation mandatory |
| Cache | Redis (Upstash) | - | City: 1h, AI responses: 24h, sessions, rate limits |
| Auth | JWT + HttpOnly cookies | - | NO localStorage for tokens. EVER. |
| Validation | Zod | 3.x | Validate ALL inputs. Frontend + backend. Shared schemas |
| UI Components | shadcn/ui | latest | Extend don't override. Customize via CSS vars only |
| Maps | MapLibre GL JS | 3.x | Free, no API key required. Dynamic import, SSR:false |
| Drag-Drop | dnd-kit | 6.x | Stops reorder + activity reorder within stop |
| Charts | Recharts | 2.x | Budget + insights charts only |
| Animation | Framer Motion | 11.x | Page transitions + micro-interactions + presence |
| AI | Anthropic Claude | claude-sonnet-4-20250514 | ALL AI via lib/ai/client.ts singleton. NEVER direct in component |
| Real-time | Socket.io | 4.x | Collaborative editing. Client via useSocket hook only |
| Weather | Open-Meteo | - | Free, no key. Cache per city per day in Redis |
| Carbon | lib/carbon/calculator.ts | - | Custom logic, distance × emission factor table |

---

## 📁 FILE NAMING RULES

```
Components:     PascalCase.tsx         → TripCard.tsx
Hooks:          useXxx.ts              → useTrip.ts
Utils:          camelCase.ts           → budget.ts
API routes:     route.ts               → app/api/v1/trips/route.ts
Models:         PascalCase.ts          → Trip.ts
Stores:         camelCaseStore.ts      → tripStore.ts
Types:          PascalCase interface   → TripData, StopData
Constants:      SCREAMING_SNAKE        → MAX_STOPS = 20
AI Prompts:     SCREAMING_SNAKE        → TRIP_PLANNER_PROMPT
```

---

## 🗂️ COMPONENT RULES

```tsx
// ✅ Server Component default
export default async function TripList() {
  const trips = await getTrips();
  return <TripCard trip={trips[0]} />;
}

// ✅ Client Component when interactivity needed
'use client';
export function InteractiveMap() { ... }

// ❌ WRONG — never fetch in useEffect in component
'use client';
export function BadComponent() {
  useEffect(() => fetch('/api/trips').then(...), []);
}

// ✅ Use TanStack Query for client-side fetching
'use client';
export function GoodComponent() {
  const { data } = useTrips(); // custom hook wrapping useQuery
}

// ✅ Every component needs all 4 states
export function DataComponent() {
  const { data, isLoading, isError } = useTrips();
  if (isLoading) return <SkeletonCard />;
  if (isError) return <ErrorState />;
  if (!data?.length) return <EmptyState />;
  return <TripList data={data} />;
}
```

---

## 🤖 AI RULES (NEW)

```typescript
// ✅ ONLY way to call AI — via lib/ai/client.ts
import { getAIClient } from '@/lib/ai/client';
import { TRIP_PLANNER_PROMPT } from '@/lib/ai/prompts';
import { buildTripContext } from '@/lib/ai/context-builder';

// ✅ Always stream AI responses (no waiting for full response)
const stream = await client.messages.stream({ ... });
for await (const chunk of stream) { ... }

// ✅ Always cache AI responses in Redis
const cacheKey = `ai:suggest:${hash(JSON.stringify(input))}`;
const cached = await redis.get(cacheKey);
if (cached) return NextResponse.json(cached);

// ✅ Always sanitize user input before sending to Claude
const safePrompt = prompt
  .replace(/<\/?system>/gi, '')
  .replace(/ignore previous/gi, '')
  .slice(0, 2000); // hard cap

// ❌ NEVER call Anthropic API directly in a component or hook
// ❌ NEVER log AI responses (may contain user trip data)
// ❌ NEVER bypass rate limit on AI endpoints (20/min per user)
```

---

## 🔌 API ROUTE RULES

Every route.ts must follow this exact pattern:

```typescript
export async function POST(request: Request) {
  try {
    // 1. Auth check FIRST
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Rate limit check SECOND (for AI routes)
    const limited = await checkRateLimit(`api:${user.userId}`, 100);
    if (limited) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    // 3. Validate input with Zod
    const parsed = CreateTripSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // 4. Ownership check on resource (no IDOR)
    const trip = await Trip.findOne({ _id: id, userId: user.userId });
    if (!trip) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 5. Business logic
    const result = await doThing(parsed.data);

    // 6. Consistent response shape
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[API_TRIPS_POST]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## 🗄️ DATABASE RULES

```typescript
// ✅ Singleton connection always
import { connectDB } from '@/lib/db/mongoose';
await connectDB();

// ✅ Mandatory indexes
tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ shareToken: 1 }, { unique: true, sparse: true });
citySchema.index({ name: 'text', country: 'text' });
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// ✅ lean() on ALL read-only queries
const trips = await Trip.find({ userId }).lean();

// ✅ Paginate all list endpoints
const trips = await Trip.find({ userId })
  .skip((page - 1) * limit)
  .limit(Math.min(limit, 50)) // hard cap 50
  .lean();

// ✅ Cascade delete on trip removal
async function deleteTrip(tripId: string, userId: string) {
  await verifyOwnership(tripId, userId);
  await Stop.deleteMany({ tripId });
  await Activity.deleteMany({ tripId });
  await Checklist.deleteOneById(tripId);
  await Note.deleteMany({ tripId });
  await TripLike.deleteMany({ tripId });
  await TripComment.deleteMany({ tripId });
  await Trip.findByIdAndDelete(tripId);
}

// ❌ NEVER expose passwordHash
User.findById(id).select('-passwordHash -refreshTokenHash')
```

---

## 🎨 UI/UX RULES

### Design Tokens
```css
:root {
  --color-primary: #F59E0B;
  --color-primary-dark: #D97706;
  --color-primary-light: #FDE68A;
  --color-surface: #0F172A;
  --color-surface-2: #1E293B;
  --color-surface-3: #334155;
  --color-border: #475569;
  --color-text: #F8FAFC;
  --color-text-muted: #94A3B8;
  --color-accent: #06B6D4;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 20px;
  --shadow-card: 0 4px 24px rgba(0,0,0,0.4);
  --shadow-elevated: 0 20px 60px rgba(0,0,0,0.5);
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Glass Morphism Cards (universal)
```css
.glass-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: var(--radius);
}
```

### Animation Standards
```typescript
// Page enter transition (all pages use this)
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

// List stagger
const containerVariants = {
  visible: { transition: { staggerChildren: 0.08 } }
};

// Card hover lift
const cardHover = {
  whileHover: { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
  transition: { duration: 0.2 }
};

// AI streaming text: use typewriter reveal (opacity 0 → 1 per token)
// Budget alert: pulse-amber keyframe animation
// Drag item: scale(1.05) + shadow on active drag
```

### Loading States
- **ALL data fetches** → skeleton loaders (shimmer animation), never spinners
- **AI responses** → streaming text with blinking cursor
- **Optimistic updates**: checklist toggles, note saves, like buttons (no loader)
- **Mutations**: toast notifications via `sonner` for all success/error

### Responsive Breakpoints
```
Mobile first. Breakpoints: sm:640 md:768 lg:1024 xl:1280
Desktop: sidebar visible, 2-3 col grids, split panels (builder)
Tablet: sidebar collapsed to icons, 2 col grids
Mobile: bottom tab bar (5 items), single col, full-screen modals
```

---

## 🔐 SECURITY RULES

1. **Tokens**: accessToken in Zustand (memory only), refreshToken in HttpOnly cookie
2. **Passwords**: bcrypt, minRounds=12
3. **Rate limiting**: Redis sliding window. Auth: 5/min. AI: 20/min. API: 100/min. Public: 200/min
4. **CORS**: Next.js config whitelist only
5. **Sanitization**: DOMPurify on ALL user-rendered markdown + comment content
6. **Ownership**: EVERY query includes `userId: req.user._id` — no IDOR, no exceptions
7. **Share tokens**: `crypto.randomBytes(32).toString('hex')` — never sequential
8. **Admin routes**: `role: 'admin'` middleware check
9. **AI prompt injection**: strip `<system>` + instruction-override patterns from all AI inputs
10. **AI cost guard**: rate limit AI endpoints per user (20/min), cache responses aggressively

---

## 🧪 TESTING RULES

```
Unit:       lib/utils/*, lib/ai/*, lib/carbon/* → Jest
API:        app/api/v1/* → Jest + Supertest (mock MongoDB + Redis)
Components: key flows → React Testing Library
E2E:        Playwright → login → create trip → add stop → AI suggest → share
```

Coverage: utils 80%, API routes 70%, components 40%

---

## 🔄 GIT RULES

```
Branches:
  feature/[screen]          → feature/mood-recommender
  fix/[issue]               → fix/carbon-calc-flight
  chore/[task]              → chore/seed-cities

Commits (Conventional):
  feat(ai): add mood-based destination recommender
  fix(budget): carbon score not updating on stop delete
  chore(db): add follow collection indexes

PR rules:
  - next lint pass
  - tsc --noEmit pass
  - Min 1 reviewer
  - No direct push to main
```

---

## 🏃 PERFORMANCE RULES

1. **Images**: `next/image` ALWAYS. Never raw `<img>`
2. **Fonts**: `next/font/google`, `display: swap`
3. **Heavy libs**: MapLibre GL, Socket.io-client → `dynamic(() => import(...), { ssr: false })`
4. **API pagination**: max 50 items hard cap
5. **MongoDB**: never N+1. Use `$lookup` or populate selectively. Use `.lean()`
6. **React**: `useCallback`/`useMemo` only for genuinely expensive ops — not by default
7. **AI**: stream first token < 800ms. Cache 24h. Abort controller on component unmount
8. **Bundle**: next-bundle-analyzer after build. No chunk > 250kb
9. **Redis**: batch operations with pipeline when possible. Sorted sets for leaderboards

---

## 📋 SCREEN IMPLEMENTATION CHECKLIST V2

| Screen | Route | Phase | Status |
|--------|-------|-------|--------|
| Login/Signup | /login, /signup | 1 | [ ] |
| Dashboard | / | 2 | [ ] |
| Create Trip | /trips/new | 2 | [ ] |
| My Trips | /trips | 2 | [ ] |
| Itinerary Builder | /trips/[id]/builder | 2 | [ ] |
| Itinerary View | /trips/[id]/view | 2 | [ ] |
| City Search | /explore/cities | 3 | [ ] |
| Activity Search | /explore/activities | 3 | [ ] |
| Budget Breakdown | /trips/[id]/budget | 3 | [ ] |
| Packing Checklist | /trips/[id]/checklist | 3 | [ ] |
| Public Share | /share/[token] | 3 | [ ] |
| **Community Feed** | /explore/community | 4 | [ ] |
| **Travel Insights** | /insights | 4 | [ ] |
| Trip Notes | /trips/[id]/notes | 4 | [ ] |
| User Profile | /profile | 4 | [ ] |
| Admin Dashboard | /admin | 5 | [ ] |

---

## ❗ ANTI-PATTERNS — NEVER DO

- [ ] No auth on protected route
- [ ] JWT in localStorage
- [ ] Direct MongoDB in component
- [ ] Unhandled promise rejections
- [ ] `console.log` in production
- [ ] Hardcoded API keys in source
- [ ] Missing loading/error/empty states
- [ ] `any` TypeScript type
- [ ] Fetch collection without pagination
- [ ] Missing index on trip.userId
- [ ] Raw fetch in client component (use TanStack Query hooks)
- [ ] Direct Anthropic API call outside lib/ai/client.ts
- [ ] AI response without Redis cache
- [ ] User markdown rendered without DOMPurify
- [ ] AI endpoint without rate limiting
