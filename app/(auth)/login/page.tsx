'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/lib/validations/auth';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const initAuth = useAuthStore((state) => state.initAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setAuth(json.data.accessToken);
        setUser(json.data.user);
        await initAuth();
        toast.success('Welcome back!');
        const nextPath = typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('from') || '/trips'
          : '/trips';
        router.push(nextPath);
      } else {
        toast.error(json.error || 'Failed to login');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f7f4ec] text-aetherius-heading">
      {/* LEFT SIDE: Visuals */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-aetherius-nav relative overflow-hidden border-r border-black/20 text-white">
        <div className="z-10">
          <h1 className="text-4xl font-syne font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent mb-4">
            Traveloop
          </h1>
          <p className="text-xl text-white/80 font-sans">Plan. Explore. Remember.</p>
        </div>

        {/* Abstract World Map with pulsing dots */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <svg viewBox="0 0 800 400" className="w-full h-full text-slate-700 fill-current">
            {/* Extremely simplified placeholder for SVG map */}
            <circle cx="200" cy="150" r="100" className="opacity-20" />
            <circle cx="600" cy="200" r="150" className="opacity-20" />
          </svg>
          <motion.div
            className="absolute w-3 h-3 bg-amber-500 rounded-full"
            style={{ top: '30%', left: '40%' }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-2 h-2 bg-amber-400 rounded-full"
            style={{ top: '60%', left: '70%' }}
            animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="z-10 space-y-4">
          <div className="flex items-center space-x-3 text-slate-300">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>AI-Powered Itineraries</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <Users className="w-5 h-5 text-amber-500" />
            <span>Real-time Collaboration</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <Wallet className="w-5 h-5 text-amber-500" />
            <span>Smart Budget Optimization</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-aetherius-line bg-white p-8 shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-syne font-bold mb-2">Welcome back</h2>
            <p className="text-aetherius-muted text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-aetherius-heading mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2 border border-aetherius-line rounded-lg bg-aetherius-field text-aetherius-heading placeholder-aetherius-muted focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-aetherius-heading">Password</label>
                <Link href="/forgot-password" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-10 pr-10 py-2 border border-aetherius-line rounded-lg bg-aetherius-field text-aetherius-heading placeholder-aetherius-muted focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500 hover:text-slate-300 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-aetherius-line" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-aetherius-muted">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                disabled
                className="w-full flex justify-center items-center py-2.5 px-4 border border-aetherius-line rounded-lg shadow-sm bg-aetherius-field text-sm font-medium text-aetherius-muted opacity-60 cursor-not-allowed group relative"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google (Coming soon)
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-aetherius-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
