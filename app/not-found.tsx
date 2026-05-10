import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-12 text-center rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Compass className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-4xl font-syne font-bold text-slate-100 mb-2">404</h1>
        <h2 className="text-xl font-medium text-slate-300 mb-4">Lost your way?</h2>
        <p className="text-slate-500 mb-8">The destination you are looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex w-full justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
