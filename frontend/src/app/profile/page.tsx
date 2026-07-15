'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/auth';
import { api } from '../../services/api';
import { User, Check, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: any) => {
    setSuccess(false);
    setError(null);
    setLoading(true);
    try {
      const response = await api.patch('/auth/me', data);
      const updated = response.data.user;
      updateUser(updated);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account information and preferences.</p>
        </div>

        <div className="rounded-xl border border-[#24262f] bg-[#16181d] p-6 md:p-8">
          <div className="flex items-center gap-4 border-b border-[#24262f] pb-6 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.name}</h2>
              <p className="text-sm text-slate-500">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}</p>
            </div>
          </div>

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-500">
              <Check className="h-5 w-5" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-500">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="Full Name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-[#24262f] bg-[#0d0e12] px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="Email Address"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="border-t border-[#24262f] pt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Saving changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
