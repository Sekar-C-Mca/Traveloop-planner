'use client';

import { create } from 'zustand';
import type { Trip } from '@/types';

interface TripState {
  activeTrip: Trip | null;
  trips: Trip[];
  isLoading: boolean;
  setActiveTrip: (trip: Trip | null) => void;
  setTrips: (trips: Trip[]) => void;
  setLoading: (loading: boolean) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  removeTrip: (id: string) => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTrip: null,
  trips: [],
  isLoading: false,
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setTrips: (trips) => set({ trips }),
  setLoading: (loading) => set({ isLoading: loading }),
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  updateTrip: (id, updates) =>
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      activeTrip:
        state.activeTrip?.id === id
          ? { ...state.activeTrip, ...updates }
          : state.activeTrip,
    })),
  removeTrip: (id) =>
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== id),
      activeTrip: state.activeTrip?.id === id ? null : state.activeTrip,
    })),
}));
