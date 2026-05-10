'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WhatsappLogo,
  TwitterLogo,
  Link as LinkIcon,
  Copy,
  Clock,
  MapPin,
  CurrencyInr,
} from '@phosphor-icons/react';
import { cn, formatDateRange, formatCurrency, generateId } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Activity {
  id: string;
  time: string;
  name: string;
  cost: number;
}

interface Stop {
  id: string;
  city: string;
  country: string;
  dateStart: string;
  dateEnd: string;
  activities: Activity[];
}

interface SharedTrip {
  name: string;
  coverUrl: string;
  dateStart: string;
  dateEnd: string;
  username: string;
  stops: Stop[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_TRIP: SharedTrip = {
  name: 'Central Europe Autumn',
  coverUrl:
    'https://images.unsplash.com/photo-1541849546-216549135759?w=1200&q=80',
  dateStart: '2025-09-15',
  dateEnd: '2025-09-28',
  username: 'wanderlust_kai',
  stops: [
    {
      id: 's1',
      city: 'Prague',
      country: 'Czech Republic',
      dateStart: '2025-09-15',
      dateEnd: '2025-09-19',
      activities: [
        { id: 'a1', time: '09:00', name: 'Prague Castle Tour', cost: 500 },
        { id: 'a2', time: '12:30', name: 'Lunch at Lokal Dlouha', cost: 450 },
        { id: 'a3', time: '15:00', name: 'Charles Bridge Walk', cost: 0 },
        { id: 'a4', time: '19:00', name: 'Jazz Dock Evening', cost: 800 },
      ],
    },
    {
      id: 's2',
      city: 'Vienna',
      country: 'Austria',
      dateStart: '2025-09-19',
      dateEnd: '2025-09-23',
      activities: [
        { id: 'a5', time: '10:00', name: 'Schonbrunn Palace', cost: 1200 },
        { id: 'a6', time: '13:00', name: 'Naschmarkt Food Tour', cost: 900 },
        { id: 'a7', time: '16:00', name: 'Belvedere Museum', cost: 700 },
        { id: 'a8', time: '20:00', name: 'Opera at Staatsoper', cost: 2500 },
      ],
    },
    {
      id: 's3',
      city: 'Budapest',
      country: 'Hungary',
      dateStart: '2025-09-23',
      dateEnd: '2025-09-26',
      activities: [
        { id: 'a9', time: '08:00', name: 'Ruin Bar Crawl', cost: 600 },
        { id: 'a10', time: '11:00', name: 'Thermal Baths (Szechenyi)', cost: 1000 },
        { id: 'a11', time: '15:00', name: 'Fishermans Bastion', cost: 0 },
        { id: 'a12', time: '19:30', name: 'Danube Dinner Cruise', cost: 3000 },
      ],
    },
    {
      id: 's4',
      city: 'Bratislava',
      country: 'Slovakia',
      dateStart: '2025-09-26',
      dateEnd: '2025-09-28',
      activities: [
        { id: 'a13', time: '10:00', name: 'Bratislava Castle', cost: 400 },
        { id: 'a14', time: '12:00', name: 'Old Town Walking Tour', cost: 300 },
        { id: 'a15', time: '16:00', name: 'UFO Bridge Observation', cost: 500 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Stop Timeline Item
// ---------------------------------------------------------------------------

interface StopTimelineItemProps {
  stop: Stop;
  index: number;
  isLast: boolean;
}

function StopTimelineItem({ stop, index, isLast }: StopTimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative flex gap-6"
    >
      {/* Timeline line + circle */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-ember-500 text-white flex items-center justify-center font-display text-sm font-bold shrink-0 z-10">
          {index + 1}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-ember-500/30 min-h-[40px]" />
        )}
      </div>

      {/* Stop content */}
      <div className={cn('pb-8 flex-1', isLast && 'pb-0')}>
        <div className="mb-3">
          <h3 className="font-display text-xl text-charcoal-800">
            {stop.city}
          </h3>
          <p className="text-sm text-charcoal-400">
            {stop.country} &middot;{' '}
            {formatDateRange(stop.dateStart, stop.dateEnd)}
          </p>
        </div>

        {/* Activities */}
        <div className="space-y-2">
          {stop.activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between bg-white/80 rounded-lg px-4 py-2.5 border border-sand-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-charcoal-400 font-mono w-12">
                  {activity.time}
                </span>
                <span className="text-sm text-charcoal-700">
                  {activity.name}
                </span>
              </div>
              {activity.cost > 0 && (
                <span className="text-xs font-medium text-charcoal-500 flex items-center gap-1">
                  <CurrencyInr size={12} />
                  {formatCurrency(activity.cost)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Social Share Button
// ---------------------------------------------------------------------------

interface ShareButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

function ShareButton({ icon: Icon, label, onClick }: ShareButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-sand-200 bg-white hover:bg-sand-50 hover:border-sand-300 text-charcoal-600 text-sm font-medium transition-all duration-200"
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SharePage() {
  const [copyToast, setCopyToast] = useState(false);
  const [loginToast, setLoginToast] = useState(false);

  const trip = MOCK_TRIP;

  const handleCopyThisTrip = useCallback(() => {
    setLoginToast(true);
    setTimeout(() => setLoginToast(false), 3000);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {
      // Fallback: no-op
    });
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  }, []);

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `Check out this trip: ${trip.name} on Traveloop! ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [trip.name]);

  const handleTwitter = useCallback(() => {
    const text = encodeURIComponent(
      `Check out this trip: ${trip.name} on @traveloop!`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`,
      '_blank'
    );
  }, [trip.name]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] overflow-hidden">
        {/* Cover image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${trip.coverUrl})` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl text-white mb-2 drop-shadow-lg">
              {trip.name}
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              {formatDateRange(trip.dateStart, trip.dateEnd)} &middot; by{' '}
              <span className="font-medium text-white">@{trip.username}</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        {/* City Timeline */}
        <div className="mb-10">
          <h2 className="font-display text-2xl text-charcoal-800 mb-6">
            Itinerary
          </h2>
          <div className="flex flex-col">
            {trip.stops.map((stop, i) => (
              <StopTimelineItem
                key={stop.id}
                stop={stop}
                index={i}
                isLast={i === trip.stops.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mb-10">
          {/* Copy This Trip */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyThisTrip}
            className="w-full py-3.5 rounded-full bg-ember-500 text-white font-medium text-sm hover:bg-ember-600 shadow-warm transition-colors mb-6"
          >
            Copy This Trip
          </motion.button>

          {/* Social share row */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <ShareButton
              icon={WhatsappLogo}
              label="WhatsApp"
              onClick={handleWhatsApp}
            />
            <ShareButton
              icon={TwitterLogo}
              label="Twitter"
              onClick={handleTwitter}
            />
            <ShareButton icon={LinkIcon} label="Copy Link" onClick={handleCopyLink} />
          </div>
        </div>

        {/* Footer branding */}
        <div className="text-center py-6 border-t border-sand-100">
          <p className="text-xs text-charcoal-400">
            Powered by{' '}
            <span className="font-display font-medium text-ember-500">
              Traveloop
            </span>
          </p>
        </div>
      </div>

      {/* Toast: Login required */}
      <AnimatePresence>
        {loginToast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal-800 text-white text-sm px-5 py-3 rounded-full shadow-warm-lg"
          >
            Please log in to copy this trip
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast: Link copied */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal-800 text-white text-sm px-5 py-3 rounded-full shadow-warm-lg flex items-center gap-2"
          >
            <Copy size={16} />
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

