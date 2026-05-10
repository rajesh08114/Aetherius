'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Plane,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const platformBenefits = [
  'Plan multi-city trips with a clear, structured workflow from start to finish.',
  'Keep itinerary, activities, budgets, notes, and checklists in one place.',
  'Collaborate with travel companions and share polished plans in seconds.'
];

const activityTiles = [
  { title: 'Backpacking Trips', subtitle: 'Smart route planning', image: '/aetherius/assets/Group-5825.jpg', href: '/explore/cities' },
  { title: 'Basecamp Tours', subtitle: 'Budget-aware itineraries', image: '/aetherius/assets/samuel-girven-nw-kHaHI9fs-unsplash-900x500.jpg', href: '/trips/new' },
  { title: 'Family Camping', subtitle: 'Checklist-first workflows', image: '/aetherius/assets/daniel-j-schwarz-Hhe9c31780A-unsplash-900x500.jpg', href: '/trips' },
  { title: 'Glamping', subtitle: 'Share with your group', image: '/aetherius/assets/jace-afsoon-K4XHqPZq66c-unsplash-900x500.jpg', href: '/community' }
];

const capabilityHighlights = [
  { title: 'Structured Itinerary Design', detail: 'Build, reorder, and visualize multi-city plans with stop-level detail and date context.' },
  { title: 'Financial Visibility', detail: 'Monitor estimated spend, detect cost pressure early, and apply AI savings recommendations.' },
  { title: 'Operational Readiness', detail: 'Use packing checklists and trip notes so plans remain actionable from planning to departure.' },
  { title: 'Collaboration at Scale', detail: 'Publish shareable itineraries and align travelers, partners, or clients around one source of truth.' }
];

const featureModules = [
  { title: 'Secure Accounts', detail: 'Authentication and protected trip data for every user workspace.', href: '/signup', cta: 'Create Account' },
  { title: 'Trip Dashboard', detail: 'A central view for active trips, quick actions, and planning progress.', href: '/dashboard', cta: 'Open Dashboard' },
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-white">
          <Plane className="h-7 w-7 text-amber-400" />
          <span className="font-syne text-2xl font-bold tracking-wide">Traveloop</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-white/80 md:flex">
          <a href="#overview" className="transition-colors hover:text-amber-400">Overview</a>
          <a href="#activities" className="transition-colors hover:text-amber-400">Activities</a>
          <a href="#capabilities" className="transition-colors hover:text-amber-400">Capabilities</a>
          <a href="#features" className="transition-colors hover:text-amber-400">Features</a>
        </nav>

        {isLoading ? (
          <span className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70">Loading...</span>
        ) : isAuthenticated ? (
          <Link href="/dashboard" className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-400">
            Open Dashboard
          </Link>
        ) : (
          <Link href="/login" className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-400">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#ececec] text-[#121212]">
      <Header />

      <section className="relative min-h-[92vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/aetherius/assets/hero-campger-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />

        <div className="relative mx-auto flex max-w-[1200px] flex-col px-4 pb-20 pt-36 text-white md:px-6 md:pt-40">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/40 bg-black/30 px-4 py-2 text-sm font-semibold text-amber-300"
          >
              <Sparkles className="h-4 w-4" />
              AI-Powered Travel Planning
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="max-w-4xl text-5xl font-syne font-bold uppercase leading-[1.05] md:text-7xl"
            >
              Explore The New Way To Plan Trips
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 max-w-3xl text-lg text-white/85 md:text-xl"
            >
              Traveloop helps individuals and teams plan smarter trips with a unified workflow across itinerary design, budget planning, checklist preparation, and collaboration.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-10 flex flex-wrap gap-3">
              <Link href="/trips/new" className="inline-flex items-center rounded-xl bg-amber-500 px-6 py-3.5 font-bold text-slate-900 transition-colors hover:bg-amber-400">
                Start Planning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/explore/cities" className="inline-flex items-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition-colors hover:border-white">
                Explore Destinations
              </Link>
            </motion.div>
        </div>
      </section>

      <section id="overview" className="mx-auto -mt-14 max-w-[1200px] px-4 md:px-6">
        <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-9">
          <h2 className="text-3xl font-syne font-bold">Why Teams Choose Traveloop</h2>
          <p className="mt-2 text-[#585858]">Traveloop is built to remove planning friction and provide a professional, end-to-end travel workflow.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {platformBenefits.map((benefit) => (
              <div key={benefit} className="rounded-xl border border-[#e7e2d8] bg-[#faf8f2] px-4 py-4 text-sm text-[#454545]">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="activities" className="mx-auto mt-16 max-w-[1200px] px-4 md:px-6">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-3xl font-syne font-bold">By Activities</h2>
          <Link href="/explore/cities" className="text-sm font-semibold text-amber-600 hover:text-amber-500">
            View All Activities
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {activityTiles.map((tile, idx) => (
            <motion.div
              key={tile.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="group relative h-[340px] overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${tile.image}')` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <p className="text-sm text-amber-300">{tile.subtitle}</p>
                <h3 className="mt-1 text-3xl font-syne font-bold leading-tight">{tile.title}</h3>
                <Link href={tile.href} className="mt-4 inline-flex items-center text-sm font-semibold text-white/85 hover:text-white">
                  Explore <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="capabilities" className="mx-auto mt-16 max-w-[1200px] px-4 md:px-6">
        <h2 className="text-3xl font-syne font-bold">Core Capabilities</h2>
        <p className="mt-2 max-w-3xl text-[#585858]">Professional planning tools designed for clarity, collaboration, and confident execution.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {capabilityHighlights.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#222]/15 bg-[#10151f] p-6 text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
              <h3 className="flex items-center gap-2 text-lg font-syne font-bold">
                <CheckCircle2 className="h-5 w-5 text-amber-400" />
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-white/75">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto mt-16 max-w-[1200px] px-4 md:px-6">
        <h2 className="text-3xl font-syne font-bold">Product Feature Coverage</h2>
        <p className="mt-2 text-[#585858]">Core modules that power the full travel planning lifecycle.</p>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featureModules.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
            >
              <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url('${activityTiles[idx % activityTiles.length].image}')` }} />
              <div className="p-5">
                <h3 className="font-syne text-xl font-bold">{item.title}</h3>
                <p className="mt-2 min-h-16 text-sm text-[#5e5e5e]">{item.detail}</p>
                <div className="mt-4">
                  <Link
                    href={item.href}
                    className="inline-flex items-center rounded-lg border border-[#e4ded2] bg-[#f9f6ef] px-4 py-2 text-sm font-semibold text-[#1f1f1f] transition-colors hover:border-amber-400 hover:bg-amber-50"
                  >
                    {item.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-[1200px] px-4 pb-24 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-black/15 bg-[#111111] p-9 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: "url('/aetherius/assets/hp-blog-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/80" />
          <div className="relative">
            <h2 className="text-4xl font-syne font-bold">Professional Planning, End To End</h2>
            <p className="mt-3 max-w-3xl text-white/80">
              Traveloop delivers a modern planning experience powered by structured workflows and AI assistance, helping travelers move from trip idea to real-world execution with confidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center rounded-xl bg-amber-500 px-5 py-3 font-bold text-slate-900 transition-colors hover:bg-amber-400">
                Open Dashboard
              </Link>
              <Link href="/explore/cities" className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 font-semibold text-white transition-colors hover:border-white">
                Try AI Destination Match
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
