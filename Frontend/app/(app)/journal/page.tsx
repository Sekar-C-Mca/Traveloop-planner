'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  PencilSimple,
  Trash,
  MapPin,
  PlusCircle,
  MagnifyingGlass,
  SpinnerGap,
  ArrowRight,
  CalendarBlank,
  X,
  Check,
} from '@phosphor-icons/react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { formatDateRange } from '@/lib/utils';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Note {
  id: string;
  content: string;
  city_name?: string;
  trip_stop_id?: string | null;
  created_at: string;
}

interface TripWithNotes {
  id: string;
  name: string;
  cover_photo_url: string | null;
  start_date: string;
  end_date: string;
  notes: Note[];
  loadingNotes: boolean;
}

// ---------------------------------------------------------------------------
// Quick-add note modal (inline sheet)
// ---------------------------------------------------------------------------

interface QuickAddNoteProps {
  tripId: string;
  onAdded: (note: Note) => void;
  onCancel: () => void;
}

function QuickAddNote({ tripId, onAdded, onCancel }: QuickAddNoteProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/api/trips/${tripId}/notes`, { content: content.trim() });
      onAdded(data.note);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  }, [tripId, content, onAdded]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border-t border-sand-100"
    >
      <div className="px-4 py-3 space-y-2">
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a travel memory…"
          rows={3}
          className="w-full rounded-lg border border-sand-200 bg-sand-50/50 px-3 py-2 text-xs text-charcoal-700 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-100 resize-none leading-relaxed"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-charcoal-500 hover:bg-sand-100 transition-colors"
          >
            <X size={12} />Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              content.trim() && !saving ? 'bg-ember-500 text-white hover:bg-ember-600' : 'bg-sand-100 text-charcoal-300 cursor-not-allowed'
            )}
          >
            {saving ? <SpinnerGap size={12} className="animate-spin" /> : <Check size={12} weight="bold" />}
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// NoteChip
// ---------------------------------------------------------------------------

function NoteChip({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-lg border border-sand-100 bg-white p-3"
    >
      {note.city_name && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-medium text-sand-700 mb-1.5">
          <MapPin size={9} weight="fill" />{note.city_name}
        </span>
      )}
      <p className="text-xs text-charcoal-700 leading-relaxed line-clamp-3">{note.content}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-charcoal-400">{formatRelativeTime(note.created_at)}</span>
        <button
          onClick={() => onDelete(note.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-charcoal-300 hover:text-red-500 hover:bg-red-50 transition-all"
          aria-label="Delete note"
        >
          <Trash size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// TripJournalCard
// ---------------------------------------------------------------------------

function TripJournalCard({ trip }: { trip: TripWithNotes }) {
  const [notes, setNotes] = useState<Note[]>(trip.notes);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { setNotes(trip.notes); }, [trip.notes]);

  const handleNoteAdded = useCallback((note: Note) => {
    setNotes((prev) => [note, ...prev]);
    setShowAdd(false);
  }, []);

  const handleDelete = useCallback(async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await api.delete(`/api/trips/${trip.id}/notes/${noteId}`);
    } catch { /* silent */ }
  }, [trip.id]);

  const preview = notes.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="warm-card overflow-hidden flex flex-col"
    >
      {/* Trip header */}
      <div className="relative h-28 w-full overflow-hidden bg-sand-100">
        {trip.cover_photo_url ? (
          <Image
            src={trip.cover_photo_url}
            alt={trip.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sand-200 to-ember-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="font-display text-lg font-bold text-white leading-tight">{trip.name}</h2>
          <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
            <CalendarBlank size={12} />
            <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
          </div>
        </div>
        <Link
          href={`/trips/${trip.id}/notes`}
          className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white hover:bg-white/30 transition-colors"
        >
          Open journal <ArrowRight size={12} />
        </Link>
      </div>

      {/* Note count summary */}
      {!trip.loadingNotes && (
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-xs text-charcoal-500 font-medium">
            {notes.length === 0 ? 'No notes yet' : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
          </span>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-ember-500 hover:text-ember-600 transition-colors"
          >
            {showAdd ? <><X size={12} />Cancel</> : <><PencilSimple size={12} weight="bold" />Add note</>}
          </button>
        </div>
      )}

      {/* Loading state */}
      {trip.loadingNotes && (
        <div className="px-4 py-4 flex items-center gap-3">
          <SpinnerGap size={18} className="animate-spin text-ember-400" />
          <span className="text-xs text-charcoal-400">Loading notes…</span>
        </div>
      )}

      {/* Quick-add area */}
      <AnimatePresence>
        {showAdd && (
          <QuickAddNote
            tripId={trip.id}
            onAdded={handleNoteAdded}
            onCancel={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>

      {/* Notes preview grid */}
      {!trip.loadingNotes && notes.length > 0 && (
        <div className="px-4 py-3 grid grid-cols-2 gap-2 flex-1">
          <AnimatePresence mode="popLayout">
            {preview.map((note) => (
              <NoteChip key={note.id} note={note} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
          {notes.length > 4 && (
            <Link
              href={`/trips/${trip.id}/notes`}
              className="rounded-lg border border-dashed border-sand-200 flex items-center justify-center p-3 text-xs text-charcoal-400 hover:border-ember-300 hover:text-ember-500 transition-colors"
            >
              +{notes.length - 4} more →
            </Link>
          )}
        </div>
      )}

      {!trip.loadingNotes && notes.length === 0 && !showAdd && (
        <div className="flex flex-col items-center py-8 text-center">
          <BookOpen size={24} className="text-sand-300 mb-2" />
          <p className="text-xs text-charcoal-400">No journal entries yet.</p>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TripJournalPage() {
  const [trips, setTrips] = useState<TripWithNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get('/api/trips');
        const rawTrips = data.trips ?? [];
        if (cancelled) return;

        const initial: TripWithNotes[] = rawTrips.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          cover_photo_url: t.cover_photo_url ?? null,
          start_date: t.start_date,
          end_date: t.end_date,
          notes: [],
          loadingNotes: true,
        }));
        setTrips(initial);
        setLoading(false);

        // Load each trip's notes in parallel
        await Promise.allSettled(
          initial.map(async (trip) => {
            try {
              const { data: nd } = await api.get(`/api/trips/${trip.id}/notes`);
              if (cancelled) return;
              setTrips((prev) =>
                prev.map((t) =>
                  t.id === trip.id ? { ...t, notes: nd.notes ?? [], loadingNotes: false } : t
                )
              );
            } catch {
              if (!cancelled) {
                setTrips((prev) =>
                  prev.map((t) => t.id === trip.id ? { ...t, loadingNotes: false } : t)
                );
              }
            }
          })
        );
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) => t.name.toLowerCase().includes(q));
  }, [trips, search]);

  const totalNotes = useMemo(() => trips.reduce((s, t) => s + t.notes.length, 0), [trips]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800">Trip Journal</h1>
          {!loading && trips.length > 0 && (
            <p className="mt-1 text-sm text-charcoal-500">
              {totalNotes} {totalNotes === 1 ? 'memory' : 'memories'} across {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
            </p>
          )}
        </div>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-4 py-2 text-sm font-medium text-white hover:bg-ember-600 transition-colors shadow-warm"
        >
          <PlusCircle size={18} weight="fill" />New Trip
        </Link>
      </motion.div>

      {/* Search */}
      {!loading && trips.length > 0 && (
        <div className="relative max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text" placeholder="Search trips…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-sand-200 bg-white py-2 pl-9 pr-4 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="warm-card overflow-hidden animate-pulse">
              <div className="h-28 bg-sand-100" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-sand-100 rounded w-2/3" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-sand-100 rounded-lg" />
                  <div className="h-16 bg-sand-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-sand-400" weight="duotone" />
          </div>
          <h2 className="font-display text-xl font-semibold text-charcoal-700 mb-2">No trips yet</h2>
          <p className="text-charcoal-400 text-sm max-w-xs mb-6">Create your first trip to start writing your travel journal.</p>
          <Link href="/trips/new" className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-ember-600 transition-colors shadow-warm">
            <PlusCircle size={18} weight="fill" />Plan a Trip
          </Link>
        </motion.div>
      ) : filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <MagnifyingGlass size={28} className="text-sand-300 mb-2" />
          <p className="text-charcoal-400 text-sm">No trips match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredTrips.map((trip) => (
              <TripJournalCard key={trip.id} trip={trip} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
