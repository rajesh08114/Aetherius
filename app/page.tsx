'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  NotebookPen,
  PiggyBank,
  Share2,
  UserRoundCog,
  Sparkles,
  Plane
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const coreProblems = [
  'Travel planning is fragmented across spreadsheets, notes, maps, and chat apps.',
  'Managing multi-city itineraries with dates, activities, and costs is time-consuming.',
  'Travelers lack a single place for budgeting, packing, sharing, and day-wise execution.'
];

const solutionPoints = [
  'Create and manage personalized multi-city itineraries in one place.',
  'Visualize stops, activities, and dates through builder + itinerary views.',
  'Stay budget-aware with AI optimization and cost breakdown tracking.',
  'Collaborate and share plans with public links and community flows.'
];

const featureModules = [
  { title: 'Auth & Onboarding', detail: 'Login / Signup with protected personal planning data.' },
  { title: 'Dashboard & My Trips', detail: 'Central hub for recent trips, quick actions, and trip management.' },
  { title: 'Create Trip + Builder', detail: 'Trip basics, multi-stop planning, reorder flow, and map context.' },
  { title: 'Itinerary View', detail: 'List and timeline-style itinerary review for execution clarity.' },
  { title: 'City + Activity Search', detail: 'Explore cities and assign activity types/costs/durations per stop.' },
  { title: 'Budget Intelligence', detail: 'Cost summaries with AI-driven savings recommendations.' },
  { title: 'Packing Checklist', detail: 'AI-assisted checklist generation with packed-state tracking.' },
  { title: 'Notes / Journal', detail: 'Per-trip note capture for reminders, contacts, and trip-specific details.' },
  { title: 'Profile & Settings', detail: 'Profile, language preference, and travel history controls.' },
  { title: 'Share & Community', detail: 'Public itinerary pages plus community inspiration feed.' }
];

function Header() {
  const { isAuthenticated, isLoading } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-aetherius-line bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-aetherius-heading">
          <Plane className="h-6 w-6 text-amber-500" />
          <span className="font-syne text-xl font-bold">Traveloop</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-aetherius-muted md:flex">
          <a href="#problem" className="hover:text-aetherius-heading">Problem</a>
          <a href="#solution" className="hover:text-aetherius-heading">Solution</a>
          <a href="#features" className="hover:text-aetherius-heading">Features</a>
        </nav>

        {isLoading ? (
          <span className="rounded-lg bg-aetherius-field px-4 py-2 text-sm text-aetherius-muted">Loading...</span>
        ) : isAuthenticated ? (
          <Link href="/trips" className="rounded-lg bg-aetherius-nav px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            Open Dashboard
          </Link>
        ) : (
          <Link href="/login" className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-aetherius-heading">
      <Header />

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 md:px-6 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-sm font-medium text-amber-700">
              <Sparkles className="h-4 w-4" />
              Hackathon Problem Statement Aligned
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl font-syne font-bold leading-tight md:text-5xl"
            >
              Personalized Travel Planning Made Easy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 max-w-2xl text-lg text-aetherius-muted"
            >
              Traveloop unifies itinerary building, activity planning, budgeting, packing, and sharing into one intelligent, collaborative workspace for modern travelers.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 flex flex-wrap gap-3">
              <Link href="/trips/new" className="inline-flex items-center rounded-xl bg-aetherius-nav px-5 py-3 font-semibold text-white hover:bg-black">
                Start Planning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/explore/cities" className="inline-flex items-center rounded-xl border border-aetherius-line bg-white px-5 py-3 font-semibold text-aetherius-heading hover:border-[#d3c8ad]">
                Explore Destinations
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-3xl border border-aetherius-line p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-syne font-bold">
              <LayoutDashboard className="h-5 w-5 text-amber-500" />
              Mission Snapshot
            </h2>
            <ul className="space-y-3">
              {solutionPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-aetherius-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section id="problem" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="glass-card rounded-3xl border border-aetherius-line p-7 md:p-8">
          <h2 className="text-2xl font-syne font-bold">Problem Statement</h2>
          <p className="mt-2 text-aetherius-muted">From your project document, these are the core planning pain points Traveloop solves:</p>
          <div className="mt-5 grid gap-3">
            {coreProblems.map((problem) => (
              <div key={problem} className="rounded-xl border border-aetherius-line bg-white px-4 py-3 text-sm text-aetherius-muted">
                {problem}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solution" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card rounded-2xl border border-aetherius-line p-5">
            <h3 className="flex items-center gap-2 text-lg font-syne font-bold"><MapPinned className="h-5 w-5 text-amber-500" /> Intelligent Itinerary Builder</h3>
            <p className="mt-2 text-sm text-aetherius-muted">Build, reorder, and visualize multi-city plans with stop-level detail and timeline awareness.</p>
          </div>
          <div className="glass-card rounded-2xl border border-aetherius-line p-5">
            <h3 className="flex items-center gap-2 text-lg font-syne font-bold"><PiggyBank className="h-5 w-5 text-amber-500" /> Budget + AI Insights</h3>
            <p className="mt-2 text-sm text-aetherius-muted">Monitor estimated spend, detect over-budget days, and optimize costs using AI suggestions.</p>
          </div>
          <div className="glass-card rounded-2xl border border-aetherius-line p-5">
            <h3 className="flex items-center gap-2 text-lg font-syne font-bold"><ListChecks className="h-5 w-5 text-amber-500" /> Execution Readiness</h3>
            <p className="mt-2 text-sm text-aetherius-muted">Use packing checklists and trip notes so plans are practical, not just conceptual.</p>
          </div>
          <div className="glass-card rounded-2xl border border-aetherius-line p-5">
            <h3 className="flex items-center gap-2 text-lg font-syne font-bold"><Share2 className="h-5 w-5 text-amber-500" /> Sharing & Collaboration</h3>
            <p className="mt-2 text-sm text-aetherius-muted">Publish read-only itineraries and discover community plans for inspiration and reuse.</p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <h2 className="text-2xl font-syne font-bold">Requirement-Aligned Feature Coverage</h2>
        <p className="mt-2 text-aetherius-muted">This implementation maps to the hackathon requirements with the following modules:</p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureModules.map((item) => (
            <div key={item.title} className="glass-card rounded-2xl border border-aetherius-line p-5">
              <h3 className="font-syne text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-aetherius-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">
        <div className="rounded-3xl border border-aetherius-line bg-aetherius-nav p-8 text-white">
          <h2 className="text-2xl font-syne font-bold">Traveloop Solution Summary</h2>
          <p className="mt-3 max-w-3xl text-white/80">
            A responsive, user-centric travel planning platform powered by structured data, smart workflows, and AI assistance to help travelers plan confidently from idea to execution.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/trips" className="inline-flex items-center rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-400">
              Open My Trips
            </Link>
            <Link href="/explore/cities" className="inline-flex items-center rounded-xl border border-white/30 px-5 py-3 font-semibold text-white hover:border-white">
              Try AI Destination Match
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
