'use client';

import { useCallback } from 'react';
import { useTripStore } from '@/store/trip';
import api from '@/lib/api';
import type { Trip } from '@/types';

export function useTrip() {
  const {
    trips,
    activeTrip,
    isLoading,
    setActiveTrip,
    setTrips,
    setLoading,
    addTrip,
    updateTrip: updateTripInStore,
    removeTrip,
  } = useTripStore();

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Trip[]>('/api/trips');
      setTrips(data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setTrips, setLoading]);

  const fetchTrip = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const { data } = await api.get<Trip>(`/api/trips/${id}`);
        setActiveTrip(data);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setActiveTrip, setLoading]
  );

  const createTrip = useCallback(
    async (tripData: Partial<Trip>) => {
      setLoading(true);
      try {
        const { data } = await api.post<Trip>('/api/trips', tripData);
        addTrip(data);
        return data;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addTrip, setLoading]
  );

  const updateTrip = useCallback(
    async (id: string, tripData: Partial<Trip>) => {
      setLoading(true);
      try {
        const { data } = await api.put<Trip>(`/api/trips/${id}`, tripData);
        updateTripInStore(id, data);
        return data;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateTripInStore, setLoading]
  );

  const deleteTrip = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await api.delete(`/api/trips/${id}`);
        removeTrip(id);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [removeTrip, setLoading]
  );

  return {
    trips,
    activeTrip,
    isLoading,
    fetchTrips,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip,
  };
}
