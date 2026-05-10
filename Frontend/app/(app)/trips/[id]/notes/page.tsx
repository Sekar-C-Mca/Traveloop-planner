'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilSimple,
  Trash,
  MapPin,
  BookOpen,
  X,
  SpinnerGap,
} from '@phosphor-icons/react';
import { cn, formatRelativeTime } from '@/lib/utils';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Note {
  id: string;
  content: string;
  city_name?: string;       // joined from backend
  trip_stop_id?: string | null;
  created_at: string;
}

interface StopOption {
  id: string;
  city_name: string;
  country: string;
}

// ---------------------------------------------------------------------------
// Note Card
// ---------------------------------------------------------------------------

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 rounded-lg shadow-warm border border-sand-100 p-4 break-inside-avoid mb-4"
    >
      {/* Top row: timestamp + actions */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-charcoal-400 font-body">
          {formatRelativeTime(note.created_at)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-md text-charcoal-400 hover:text-ember-500 hover:bg-ember-50 transition-colors"
            aria-label="Edit note"
          >
            <PencilSimple size={16} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-md text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Delete note"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {/* City badge */}
      {note.city_name && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sand-100 text-sand-700 text-xs font-medium mb-2">
          <MapPin size={12} weight="fill" />
          {note.city_name}
        </span>
      )}

      {/* Content */}
      <p className="text-sm text-charcoal-700 leading-relaxed font-body whitespace-pre-line">
        {note.content}
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Note Modal (Add / Edit)
// ---------------------------------------------------------------------------

interface NoteModalProps {
  isOpen: boolean;
  editingNote: Note | null;
  stopOptions: StopOption[];
  onClose: () => void;
  onSave: (content: string, trip_stop_id: string | null) => Promise<void>;
}

function NoteModal({ isOpen, editingNote, stopOptions, onClose, onSave }: NoteModalProps) {
  const [content, setContent] = useState('');
  const [selectedStop, setSelectedStop] = useState<string>('none');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        setContent(editingNote.content);
        setSelectedStop(editingNote.trip_stop_id ?? 'none');
      } else {
        setContent('');
        setSelectedStop('none');
      }
    }
  }, [isOpen, editingNote]);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSave(content.trim(), selectedStop === 'none' ? null : selectedStop);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [content, selectedStop, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-warm-lg p-6 max-h-[85vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-charcoal-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-charcoal-800">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* City/stop selector */}
            {stopOptions.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
                  Link to stop
                </label>
                <select
                  value={selectedStop}
                  onChange={(e) => setSelectedStop(e.target.value)}
                  className="w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-2.5 text-sm text-charcoal-700 focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-500 transition-colors"
                >
                  <option value="none">No specific stop</option>
                  {stopOptions.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.city_name}, {stop.country}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
                Your memory
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about a moment, a feeling, a discovery..."
                rows={5}
                className="w-full rounded-lg border border-sand-200 bg-sand-50/50 px-4 py-3 text-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className={cn(
                'w-full py-3 rounded-full font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2',
                content.trim() && !saving
                  ? 'bg-ember-500 text-white hover:bg-ember-600 shadow-warm'
                  : 'bg-charcoal-100 text-charcoal-300 cursor-not-allowed'
              )}
            >
              {saving && <SpinnerGap size={16} className="animate-spin" />}
              {editingNote ? 'Save Changes' : 'Save Note'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mb-4">
        <BookOpen size={32} className="text-sand-400" />
      </div>
      <h3 className="font-display text-xl text-charcoal-700 mb-2">
        Your travel journal is empty
      </h3>
      <p className="text-charcoal-400 text-sm max-w-xs">
        Write your first memory. Capture the moments that made this trip
        unforgettable.
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TripNotesPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [notes, setNotes] = useState<Note[]>([]);
  const [stopOptions, setStopOptions] = useState<StopOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Load notes + stops
  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [notesRes, stopsRes] = await Promise.all([
          api.get(`/api/trips/${tripId}/notes`),
          api.get(`/api/trips/${tripId}/stops`),
        ]);
        if (!cancelled) {
          setNotes(notesRes.data.notes ?? []);
          setStopOptions(
            (stopsRes.data.stops ?? []).map((s: any) => ({
              id: String(s.id),
              city_name: s.city_name,
              country: s.country,
            }))
          );
        }
      } catch {
        if (!cancelled) setNotes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tripId]);

  // Add note
  const handleAddNote = useCallback(
    async (content: string, trip_stop_id: string | null) => {
      const { data } = await api.post(`/api/trips/${tripId}/notes`, {
        content,
        trip_stop_id: trip_stop_id ?? null,
      });
      const newNote = data.note;
      // Attach city_name from stops
      const stop = stopOptions.find((s) => s.id === String(newNote.trip_stop_id));
      setNotes((prev) => [{ ...newNote, city_name: stop?.city_name }, ...prev]);
    },
    [tripId, stopOptions]
  );

  // Edit note
  const handleEditNote = useCallback(
    async (content: string, trip_stop_id: string | null) => {
      if (!editingNote) return;
      const { data } = await api.put(
        `/api/trips/${tripId}/notes/${editingNote.id}`,
        { content }
      );
      const updated = data.note;
      const stop = stopOptions.find((s) => s.id === String(trip_stop_id));
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...updated, city_name: stop?.city_name }
            : n
        )
      );
      setEditingNote(null);
    },
    [editingNote, tripId, stopOptions]
  );

  // Delete note
  const handleDeleteNote = useCallback(
    async (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      try {
        await api.delete(`/api/trips/${tripId}/notes/${id}`);
      } catch {
        // Reload on failure
        const { data } = await api.get(`/api/trips/${tripId}/notes`);
        setNotes(data.notes ?? []);
      }
    },
    [tripId]
  );

  const openEditModal = useCallback((note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingNote(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingNote(null);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <SpinnerGap size={32} className="animate-spin text-ember-400" />
      </div>
    );
  }

  return (
    <div className="journal-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl text-charcoal-800">
            Trip Notes
          </h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Your personal travel journal · {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </motion.div>

        {/* Notes grid or empty state */}
        {notes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="columns-2 gap-4">
            <AnimatePresence>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={openEditModal}
                  onDelete={handleDeleteNote}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={openAddModal}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-ember-500 text-white shadow-warm-lg flex items-center justify-center hover:bg-ember-600 transition-colors"
        aria-label="Add note"
      >
        <PencilSimple size={24} weight="bold" />
      </motion.button>

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        editingNote={editingNote}
        stopOptions={stopOptions}
        onClose={closeModal}
        onSave={editingNote ? handleEditNote : handleAddNote}
      />
    </div>
  );
}
