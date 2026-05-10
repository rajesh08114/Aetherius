'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success('If this email exists, a reset link has been sent.');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ec] text-aetherius-heading flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-aetherius-line bg-white p-8 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
        <h1 className="text-2xl font-syne font-bold">Forgot Password</h1>
        <p className="text-sm text-aetherius-muted mt-2">Enter your email to receive reset instructions.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-aetherius-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-aetherius-line bg-aetherius-field pl-9 pr-3 py-2"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold py-2.5 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Send Reset Link
          </button>
        </form>

        <p className="text-sm text-aetherius-muted mt-6 text-center">
          Remembered your password?{' '}
          <Link href="/login" className="text-amber-600 font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

