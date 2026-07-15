'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/auth';
import { api } from '../../services/api';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      login(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to register. Email may already be in use.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0e12] px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-[#24262f] bg-[#16181d] p-8 shadow-2xl">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-3">Create an account</h1>
          <p className="text-sm text-slate-400">Get organized and start tracking your applications</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-500">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:border-blue-500 focus:outline-none"
              placeholder="John Doe"
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:border-blue-500 focus:outline-none"
              placeholder="name@example.com"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
