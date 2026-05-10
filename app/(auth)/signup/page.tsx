'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema } from '@/lib/validations/auth';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, Sparkles, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

type RegisterForm = z.infer<typeof RegisterSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const initAuth = useAuthStore((state) => state.initAuth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  });

  const passwordValue = watch('password', '');
  
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 1;
    if (pass.match(/[A-Z]/)) score += 1;
    if (pass.match(/[0-9]/)) score += 1;
    if (pass.match(/[^A-Za-z0-9]/)) score += 1;
    if (pass.length > 12) score += 1;
    return Math.min(5, score);
  };
  
  const strength = calculateStrength(passwordValue);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await fetch('/api/v1/auth/register', {
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
        toast.success('Account created successfully!');
        router.push('/trips');
      } else {
        toast.error(json.error || 'Failed to create account');
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

        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <svg viewBox="0 0 800 400" className="w-full h-full text-slate-700 fill-current">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl border border-aetherius-line bg-white p-8 my-auto shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-syne font-bold mb-2">Create an account</h2>
            <p className="text-aetherius-muted text-sm">Start planning your next adventure</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-aetherius-heading mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-aetherius-line rounded-lg bg-aetherius-field text-aetherius-heading placeholder-aetherius-muted focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
            </div>

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
              <label className="block text-sm font-medium text-aetherius-heading mb-1">Password</label>
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
                    <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500 hover:text-slate-300" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              <div className="mt-2 flex space-x-1 h-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.div
                    key={level}
                    className={`flex-1 rounded-full ${
                      strength >= level 
                        ? strength <= 2 ? 'bg-red-500' : strength <= 3 ? 'bg-amber-400' : 'bg-green-500'
                        : 'bg-slate-700'
                    }`}
                    initial={false}
                    animate={{ backgroundColor: strength >= level 
                      ? strength <= 2 ? '#ef4444' : strength <= 3 ? '#fbbf24' : '#22c55e'
                      : '#e3e3e3' }}
                  />
                ))}
              </div>
              
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-aetherius-heading mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-10 pr-3 py-2 border border-aetherius-line rounded-lg bg-aetherius-field text-aetherius-heading placeholder-aetherius-muted focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-center mt-2">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-aetherius-line bg-aetherius-field text-amber-500 focus:ring-amber-500"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-aetherius-muted">
                I agree to the <Link href="#" className="text-amber-500 hover:underline">Terms</Link> and <Link href="#" className="text-amber-500 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center mt-4 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-aetherius-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
