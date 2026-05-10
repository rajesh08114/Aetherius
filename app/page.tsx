'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  PiggyBank,
  Share2,
  Sparkles,
  Plane
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const platformBenefits = [
  'Plan multi-city trips with a clear, structured workflow from start to finish.',
  'Keep itinerary, activities, budgets, notes, and checklists in one place.',
  'Collaborate with travel companions and share polished plans in seconds.'
];

const capabilityHighlights = [
  'Build and manage personalized itineraries with date-aware stop planning.',
  'Track cost estimates and optimize travel spend with AI suggestions.',
  'Prepare better with checklists, notes, and execution-focused tools.',
  'Share public itineraries and discover ideas from the community.'
];

const featureModules = [
  { title: 'Secure Accounts', detail: 'Authentication and protected trip data for every user workspace.', href: '/signup', cta: 'Create Account' },
  { title: 'Trip Dashboard', detail: 'A central view for active trips, quick actions, and planning progress.', href: '/trips', cta: 'Open Dashboard' },
  { title: 'Itinerary Builder', detail: 'Create multi-stop plans, reorder legs, and keep schedules organized.', href: '/trips/new', cta: 'Start New Trip' },
  { title: 'Timeline Views', detail: 'Review plans by day and stop to improve travel-day clarity.', href: '/trips', cta: 'View Timelines' },
  { title: 'Destination Discovery', detail: 'Search cities and explore activities with practical metadata.', href: '/explore/cities', cta: 'Explore Cities' },
  { title: 'Budget Intelligence', detail: 'Estimate costs, monitor spending, and apply AI optimization insights.', href: '/trips', cta: 'Open Budgets' },
  { title: 'Checklist Assistant', detail: 'Generate and track packing checklists for execution readiness.', href: '/trips', cta: 'Open Checklists' },
  { title: 'Trip Notes', detail: 'Capture reminders, references, and context for each trip.', href: '/trips', cta: 'Open Notes' },
  { title: 'Profile Controls', detail: 'Manage preferences, identity settings, and personal planning history.', href: '/profile', cta: 'Go to Profile' },
  { title: 'Sharing & Community', detail: 'Publish read-only plans and discover inspiration from other travelers.', href: '/community', cta: 'Open Community' }
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
          <a href="#overview" className="hover:text-aetherius-heading">Overview</a>
          <a href="#capabilities" className="hover:text-aetherius-heading">Capabilities</a>
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
              AI-Powered Travel Planning Platform
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
              Traveloop helps individuals and teams plan smarter trips with a unified workflow across itinerary design, budget planning, checklist preparation, and collaboration.
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
              Platform Snapshot
            </h2>
            <ul className="space-y-3">
              {capabilityHighlights.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-aetherius-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section id="overview" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="glass-card rounded-3xl border border-aetherius-line p-7 md:p-8">
          <h2 className="text-2xl font-syne font-bold">Why Teams Choose Traveloop</h2>
          <p className="mt-2 text-aetherius-muted">Traveloop is built to remove planning friction and provide a professional, end-to-end travel workflow.</p>
          <div className="mt-5 grid gap-3">
            {platformBenefits.map((benefit) => (
              <div key={benefit} className="rounded-xl border border-aetherius-line bg-white px-4 py-3 text-sm text-aetherius-muted">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card rounded-2xl border border-aetherius-line p-5">
            <h3 className="flex items-center gap-2 text-lg font-syne font-bold"><MapPinned className="h-5 w-5 text-amber-500" /> Structured Itinerary Design</h3>
            <p className="mt-2 text-sm text-aetherius-muted">Build, reorder, and visualize multi-city plans with stop-level detail and date context.</p>
          </div>
          <div className="glass-card rounded-2xl border border-aetherius-line p-5">
            <h3 className="flex items-center gap-2 text-lg font-syne font-bold"><PiggyBank className="h-5 w-5 text-amber-500" /> Financial Visibility</h3>
            <p className="mt-2 text-sm text-aetherius-muted">Monitor estimated spend, detect cost pressure early, and apply AI savings recommendations.</p>
          </div>
          <div className="glass-card rounded-2xl border border-aetherius-line p-5">
            <h3 className="flex items-center gap-2 text-lg font-syne font-bold"><ListChecks className="h-5 w-5 text-amber-500" /> Operational Readiness</h3>
            <p className="mt-2 text-sm text-aetherius-muted">Use packing checklists and trip notes so plans remain actionable from planning to departure.</p>
          </div>
          <div className="glass-card rounded-2xl border border-aetherius-line p-5">
            <h3 className="flex items-center gap-2 text-lg font-syne font-bold"><Share2 className="h-5 w-5 text-amber-500" /> Collaboration at Scale</h3>
            <p className="mt-2 text-sm text-aetherius-muted">Publish shareable itineraries and align travelers, partners, or clients around one source of truth.</p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <h2 className="text-2xl font-syne font-bold">Product Feature Coverage</h2>
        <p className="mt-2 text-aetherius-muted">Core modules that power the full travel planning lifecycle:</p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureModules.map((item) => (
            <div key={item.title} className="glass-card flex h-full flex-col rounded-2xl border border-aetherius-line p-5">
              <h3 className="font-syne text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-aetherius-muted">{item.detail}</p>
              <div className="mt-4">
                <Link
                  href={item.href}
                  className="inline-flex items-center rounded-lg border border-aetherius-line bg-white px-4 py-2 text-sm font-semibold text-aetherius-heading transition-colors hover:border-[#d3c8ad] hover:bg-aetherius-field"
                >
                  {item.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6">
        <div className="rounded-3xl border border-aetherius-line bg-aetherius-nav p-8 text-white">
          <h2 className="text-2xl font-syne font-bold">Professional Planning, End to End</h2>
          <p className="mt-3 max-w-3xl text-white/80">
            Traveloop delivers a modern planning experience powered by structured workflows and AI assistance, helping travelers move from trip idea to real-world execution with confidence.
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
