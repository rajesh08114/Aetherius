'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-12 text-center rounded-3xl relative overflow-hidden border-red-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-syne font-bold text-slate-100 mb-4">Something went wrong!</h2>
        <p className="text-slate-500 mb-8 text-sm">We hit some turbulence. Please try again.</p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all w-full border border-slate-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
