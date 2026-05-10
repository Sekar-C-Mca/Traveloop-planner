'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import type { City } from '@/types';

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCities = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<City[]>('/api/cities');
      setCities(data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchCities = useCallback(async (query: string, region?: string) => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { search: query };
      if (region) {
        params.region = region;
      }
      const { data } = await api.get<City[]>('/api/cities', { params });
      setCities(data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cities,
    isLoading,
    searchCities,
    fetchCities,
  };
}
