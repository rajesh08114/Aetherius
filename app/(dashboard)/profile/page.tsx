'use client';

import { useEffect, useState } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { authFetch } from '@/lib/utils/authFetch';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    avatar: '',
    languagePreference: 'en',
    countriesVisited: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authFetch('/api/v1/profile');
        if (!res.ok) throw new Error('Failed to load profile');
        const json = await res.json();
        const profile = json.data;
        setForm({
          name: profile.name || '',
          email: profile.email || '',
          avatar: profile.avatar || '',
          languagePreference: profile.languagePreference || 'en',
          countriesVisited: Array.isArray(profile.countriesVisited) ? profile.countriesVisited.join(', ') : ''
        });
      } catch (error: any) {
        toast.error(error?.message || 'Could not load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const onSave = async () => {
    setIsSaving(true);
    try {
      const res = await authFetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          avatar: form.avatar || undefined,
          languagePreference: form.languagePreference,
          countriesVisited: form.countriesVisited
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save profile');

      setUser(json.data);
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-syne font-bold text-aetherius-heading flex items-center gap-3">
            <User className="w-8 h-8 text-amber-500" />
            Profile & Settings
          </h1>
          <p className="text-aetherius-muted mt-1">Manage your identity, language preferences, and travel history.</p>
        </div>

        <div className="glass-card rounded-2xl border border-aetherius-line p-6 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-aetherius-heading">Full name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-aetherius-heading">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-aetherius-heading">Profile photo URL</span>
            <input
              value={form.avatar}
              onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-aetherius-heading">Language preference</span>
            <select
              value={form.languagePreference}
              onChange={(e) => setForm((prev) => ({ ...prev, languagePreference: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-aetherius-heading">Countries visited (comma-separated)</span>
            <textarea
              value={form.countriesVisited}
              onChange={(e) => setForm((prev) => ({ ...prev, countriesVisited: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-24"
              placeholder="Japan, Italy, Indonesia"
            />
          </label>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold hover:from-amber-400 hover:to-amber-500 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </button>
        </div>
      </div>
    </PageTransition>
  );
}

