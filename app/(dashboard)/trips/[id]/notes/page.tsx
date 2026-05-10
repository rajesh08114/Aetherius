'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { authFetch } from '@/lib/utils/authFetch';
import { Loader2, NotebookPen, Pin, Trash2, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

interface TripNote {
  _id: string;
  title: string;
  content: string;
  pinned: boolean;
  date: string;
}

export default function TripNotesPage({ params }: { params: { id: string } }) {
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => notes.find((n) => n._id === selectedId) || null, [notes, selectedId]);

  const loadNotes = async () => {
    try {
      const res = await authFetch(`/api/v1/trips/${params.id}/notes`);
      if (!res.ok) throw new Error('Failed to load notes');
      const json = await res.json();
      setNotes(json.data || []);
      if (!selectedId && json.data?.length) {
        setSelectedId(json.data[0]._id);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Could not load notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const createNote = async () => {
    if (!draft.title.trim()) {
      toast.error('Please add a note title');
      return;
    }
    setIsSaving(true);
    try {
      const res = await authFetch(`/api/v1/trips/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title, content: draft.content, pinned: false })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create note');
      setDraft({ title: '', content: '' });
      await loadNotes();
      setSelectedId(json.data._id);
      toast.success('Note added');
    } catch (error: any) {
      toast.error(error?.message || 'Could not create note');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSelected = async (patch: Partial<TripNote>) => {
    if (!selected) return;
    try {
      const res = await authFetch(`/api/v1/trips/${params.id}/notes/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update note');
      await loadNotes();
    } catch (error: any) {
      toast.error(error?.message || 'Update failed');
    }
  };

  const deleteSelected = async () => {
    if (!selected) return;
    try {
      const res = await authFetch(`/api/v1/trips/${params.id}/notes/${selected._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete note');
      setSelectedId(null);
      await loadNotes();
      toast.success('Note deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Delete failed');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-syne font-bold text-aetherius-heading flex items-center gap-3">
            <NotebookPen className="w-8 h-8 text-amber-500" />
            Trip Notes & Journal
          </h1>
          <p className="text-aetherius-muted mt-1">Capture reminders, local contacts, and day-specific details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="glass-card border border-aetherius-line rounded-2xl p-4 h-fit">
            <h2 className="font-semibold text-aetherius-heading mb-3">Saved Notes</h2>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {notes.map((note) => (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => setSelectedId(note._id)}
                  className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${
                    selectedId === note._id
                      ? 'bg-amber-500/10 border-amber-500 text-aetherius-heading'
                      : 'bg-white border-aetherius-line text-aetherius-muted hover:text-aetherius-heading'
                  }`}
                >
                  <div className="font-medium truncate">{note.title}</div>
                  <div className="text-xs mt-1">{new Date(note.date).toLocaleString()}</div>
                </button>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-aetherius-muted">No notes yet. Create your first one.</p>
              )}
            </div>
          </aside>

          <section className="space-y-4">
            <div className="glass-card border border-aetherius-line rounded-2xl p-4">
              <h3 className="font-semibold text-aetherius-heading mb-3">Add New Note</h3>
              <div className="space-y-3">
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Note title"
                  className="w-full rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your trip note..."
                  className="w-full min-h-28 rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={createNote}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Note
                </button>
              </div>
            </div>

            {selected && (
              <div className="glass-card border border-aetherius-line rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-aetherius-heading">Edit Note</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateSelected({ pinned: !selected.pinned })}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm border ${
                        selected.pinned ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-white border-aetherius-line text-aetherius-muted'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5 mr-1.5" />
                      {selected.pinned ? 'Pinned' : 'Pin'}
                    </button>
                    <button
                      type="button"
                      onClick={deleteSelected}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm border border-red-500/30 text-red-400 bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>

                <input
                  value={selected.title}
                  onChange={(e) =>
                    setNotes((prev) => prev.map((n) => (n._id === selected._id ? { ...n, title: e.target.value } : n)))
                  }
                  className="w-full rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <textarea
                  value={selected.content || ''}
                  onChange={(e) =>
                    setNotes((prev) => prev.map((n) => (n._id === selected._id ? { ...n, content: e.target.value } : n)))
                  }
                  className="w-full min-h-36 rounded-lg border border-aetherius-line bg-aetherius-field px-3 py-2 text-aetherius-heading focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => updateSelected({ title: selected.title, content: selected.content })}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-aetherius-nav text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

