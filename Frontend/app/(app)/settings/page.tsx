'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Gear,
  BookmarkSimple,
  Warning,
  Camera,
  X,
  Check,
  Globe,
  MapPin,
} from '@phosphor-icons/react';
import { cn, generateId } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SettingsTab = 'profile' | 'preferences' | 'saved' | 'danger';

interface SavedCity {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_SAVED_CITIES: SavedCity[] = [
  {
    id: 'c1',
    name: 'Kyoto',
    country: 'Japan',
    imageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12e0c6e?w=400&q=80',
  },
  {
    id: 'c2',
    name: 'Lisbon',
    country: 'Portugal',
    imageUrl:
      'https://images.unsplash.com/photo-1585208798174-6b4e3d8417fe?w=400&q=80',
  },
  {
    id: 'c3',
    name: 'Marrakech',
    country: 'Morocco',
    imageUrl:
      'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&q=80',
  },
  {
    id: 'c4',
    name: 'Buenos Aires',
    country: 'Argentina',
    imageUrl:
      'https://images.unsplash.com/photo-1589909202802-8f4dce34d4d3?w=400&q=80',
  },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'] as const;
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as const;
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese'] as const;

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Gear },
  { id: 'saved', label: 'Saved Places', icon: BookmarkSimple },
  { id: 'danger', label: 'Danger Zone', icon: Warning },
];

// ---------------------------------------------------------------------------
// Profile Tab
// ---------------------------------------------------------------------------

function ProfileTab() {
  const [name, setName] = useState('Kai Wanderlust');
  const [language, setLanguage] = useState<string>('English');
  const [showToast, setShowToast] = useState(false);

  const handleSave = useCallback(() => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-ember-100 flex items-center justify-center text-3xl font-display text-ember-600 overflow-hidden border-2 border-sand-200">
            <span>K</span>
          </div>
          <button
            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Change avatar"
          >
            <Camera size={24} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-charcoal-400 mt-2">Click to change photo</p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
          Display Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="underline-input w-full text-base"
          placeholder="Your name"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
          Email
        </label>
        <p className="text-charcoal-400 text-sm py-2">kai@traveloop.app</p>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-2.5 text-sm text-charcoal-700 focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-500 transition-colors"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="pill-button bg-ember-500 text-white hover:bg-ember-600 shadow-warm transition-colors"
      >
        Save Changes
      </button>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal-800 text-white text-sm px-5 py-3 rounded-full shadow-warm-lg flex items-center gap-2"
          >
            <Check size={16} weight="bold" />
            Settings saved!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Preferences Tab
// ---------------------------------------------------------------------------

function PreferencesTab() {
  const [currency, setCurrency] = useState<string>('INR');
  const [dateFormat, setDateFormat] = useState<string>('DD/MM/YYYY');
  const [darkMode, setDarkMode] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = useCallback(() => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
          Default Currency
        </label>
        <div className="flex gap-2 flex-wrap">
          {CURRENCIES.map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                currency === cur
                  ? 'bg-ember-500 text-white border-ember-500 shadow-warm'
                  : 'bg-white text-charcoal-600 border-sand-200 hover:border-sand-300'
              )}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      {/* Date Format */}
      <div>
        <label className="block text-sm font-medium text-charcoal-600 mb-1.5">
          Date Format
        </label>
        <div className="flex gap-2 flex-wrap">
          {DATE_FORMATS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setDateFormat(fmt)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                dateFormat === fmt
                  ? 'bg-ember-500 text-white border-ember-500 shadow-warm'
                  : 'bg-white text-charcoal-600 border-sand-200 hover:border-sand-300'
              )}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-charcoal-700">Dark Mode</p>
          <p className="text-xs text-charcoal-400">
            Switch to a darker color scheme
          </p>
        </div>
        <Switch
          checked={darkMode}
          onCheckedChange={setDarkMode}
          className={cn(
            darkMode && 'bg-ember-500 data-[state=checked]:bg-ember-500'
          )}
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="pill-button bg-ember-500 text-white hover:bg-ember-600 shadow-warm transition-colors"
      >
        Save Preferences
      </button>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal-800 text-white text-sm px-5 py-3 rounded-full shadow-warm-lg flex items-center gap-2"
          >
            <Check size={16} weight="bold" />
            Settings saved!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Saved Places Tab
// ---------------------------------------------------------------------------

function SavedPlacesTab() {
  const [cities, setCities] = useState<SavedCity[]>(INITIAL_SAVED_CITIES);

  const handleRemove = useCallback((id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {cities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-sand-100 flex items-center justify-center mb-3">
            <BookmarkSimple size={28} className="text-sand-400" />
          </div>
          <p className="text-charcoal-500 text-sm">No saved places yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {cities.map((city) => (
              <motion.div
                key={city.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25 }}
                className="relative group rounded-xl overflow-hidden border border-sand-100 shadow-warm"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundImage: `url(${city.imageUrl})` }}
                  />
                </div>

                {/* Info overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* City text */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-display text-white text-sm font-medium">
                    {city.name}
                  </p>
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    <MapPin size={10} />
                    {city.country}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(city.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  aria-label={`Remove ${city.name}`}
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Danger Zone Tab
// ---------------------------------------------------------------------------

function DangerZoneTab() {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText === 'DELETE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-2 border-red-300 rounded-xl p-6 bg-red-50/30">
        <h3 className="font-display text-lg text-red-700 mb-2">
          Delete Account
        </h3>
        <p className="text-sm text-red-600/70 mb-4">
          This action is permanent and cannot be undone. All your trips, notes,
          and saved places will be permanently deleted.
        </p>

        {/* Confirmation input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-red-600 mb-1.5">
            Type <span className="font-mono font-bold">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE here"
            className="w-full rounded-lg border-2 border-red-200 bg-white px-3 py-2.5 text-sm text-charcoal-700 placeholder:text-red-300 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 transition-colors"
          />
        </div>

        {/* Delete button */}
        <button
          disabled={!isConfirmEnabled}
          className={cn(
            'pill-button text-sm transition-all duration-200',
            isConfirmEnabled
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
              : 'bg-red-100 text-red-300 cursor-not-allowed'
          )}
        >
          Permanently Delete Account
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'preferences':
        return <PreferencesTab />;
      case 'saved':
        return <SavedPlacesTab />;
      case 'danger':
        return <DangerZoneTab />;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl text-charcoal-800">Settings</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Tab navigation - pill style */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-ember-500 text-white shadow-warm'
                    : 'bg-white text-charcoal-500 border border-sand-200 hover:border-sand-300 hover:text-charcoal-700'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
