'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilSimple,
  Trash,
  MapPin,
  BookOpen,
  X,
  Check,
} from '@phosphor-icons/react';
import { cn, formatRelativeTime, generateId } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Note {
  id: string;
  content: string;
  city?: string;
  createdAt: string;
}

interface StopOption {
  id: string;
  city: string;
  country: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    content:
      'Watched the most incredible sunset from the Charles Bridge today. The light hit the castle and turned everything gold. Need to come back here in autumn.',
    city: 'Prague',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    content:
      'Found the best trdelnik stand near the Old Town Square. The lady there told me they roll the dough around wooden sticks and roast it over coals. Tastes like cinnamon heaven.',
    city: 'Prague',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n3',
    content:
      'The train ride between Prague and Vienna was stunning. Rolling green hills and little villages with terracotta roofs. Three hours flew by.',
    city: 'Vienna',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n4',
    content:
      'Visited the Schonbrunn Palace gardens. The hedges are trimmed so precisely they look like green architecture. Sat by the Gloriette and ate a sachertorte.',
    city: 'Vienna',
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n5',
    content:
      'Budapest at night is something else entirely. The Parliament building lit up reflects perfectly in the Danube. Walked across the Chain Bridge around midnight.',
    city: 'Budapest',
    createdAt: new Date(Date.now() - 74 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n6',
    content:
      'General travel tip: always carry a reusable water bottle. The tap water in all three cities was perfectly safe and saved me a fortune.',
    createdAt: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
  },
];

const STOP_OPTIONS: StopOption[] = [
  { id: 's1', city: 'Prague', country: 'Czech Republic' },
  { id: 's2', city: 'Vienna', country: 'Austria' },
  { id: 's3', city: 'Budapest', country: 'Hungary' },
];

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
          {formatRelativeTime(note.createdAt)}
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
      {note.city && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sand-100 text-sand-700 text-xs font-medium mb-2">
          <MapPin size={12} weight="fill" />
          {note.city}
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
  onClose: () => void;
  onSave: (content: string, city: string | undefined) => void;
}

function NoteModal({ isOpen, editingNote, onClose, onSave }: NoteModalProps) {
  const [content, setContent] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('none');

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        setContent(editingNote.content);
        setSelectedCity(editingNote.city || 'none');
      } else {
        setContent('');
        setSelectedCity('none');
      }
    }
  }, [isOpen, editingNote]);

  const handleSave = useCallback(() => {
    if (!content.trim()) return;
    const city = selectedCity === 'none' ? undefined : selectedCity;
    onSave(content.trim(), city);
    onClose();
  }, [content, selectedCity, onSave, onClose]);

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
            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
                Link to stop
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-2.5 text-sm text-charcoal-700 focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-500 transition-colors"
              >
                <option value="none">No specific stop</option>
                {STOP_OPTIONS.map((stop) => (
                  <option key={stop.id} value={stop.city}>
                    {stop.city}, {stop.country}
                  </option>
                ))}
              </select>
            </div>

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
              disabled={!content.trim()}
              className={cn(
                'w-full py-3 rounded-full font-medium text-sm transition-all duration-200',
                content.trim()
                  ? 'bg-ember-500 text-white hover:bg-ember-600 shadow-warm'
                  : 'bg-charcoal-100 text-charcoal-300 cursor-not-allowed'
              )}
            >
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
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleAddNote = useCallback(
    (content: string, city: string | undefined) => {
      const newNote: Note = {
        id: generateId(),
        content,
        city,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    },
    []
  );

  const handleEditNote = useCallback(
    (content: string, city: string | undefined) => {
      if (!editingNote) return;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id ? { ...n, content, city } : n
        )
      );
      setEditingNote(null);
    },
    [editingNote]
  );

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

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
            Your personal travel journal
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
        onClose={closeModal}
        onSave={editingNote ? handleEditNote : handleAddNote}
      />
    </div>
  );
}
