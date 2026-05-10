/**
 * api-hooks.ts
 * Typed fetch helpers that wrap the axios instance in lib/api.ts.
 * Import these in any page/component instead of writing inline fetch calls.
 */

import api from "./api";
import type { User, City, Trip, Activity, ActivityCategory } from "@/types";

// ---------------------------------------------------------------------------
// Users / Profile
// ---------------------------------------------------------------------------

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/api/users/me");
  return data.user;
}

export async function updateMe(payload: {
  name?: string;
  language_preference?: string;
  profile_photo_url?: string;
}): Promise<User> {
  const { data } = await api.put<{ user: User }>("/api/users/me", payload);
  return data.user;
}

export async function deleteAccount(): Promise<void> {
  await api.delete("/api/users/me", { data: { confirmation: "DELETE" } });
}

// ---------------------------------------------------------------------------
// Saved destinations
// ---------------------------------------------------------------------------

export async function fetchSavedDestinations(): Promise<City[]> {
  const { data } = await api.get<{ cities: City[] }>(
    "/api/users/me/saved-destinations"
  );
  return data.cities;
}

export async function saveDestination(city_id: number): Promise<void> {
  await api.post("/api/users/me/saved-destinations", { city_id });
}

export async function removeSavedDestination(cityId: number): Promise<void> {
  await api.delete(`/api/users/me/saved-destinations/${cityId}`);
}

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------

export async function fetchTrips(params?: {
  status?: "upcoming" | "ongoing" | "completed";
}): Promise<Trip[]> {
  const { data } = await api.get<{ trips: Trip[] }>("/api/trips", { params });
  return data.trips;
}

export async function fetchTrip(id: string): Promise<Trip> {
  const { data } = await api.get<{ trip: Trip }>(`/api/trips/${id}`);
  return data.trip;
}

export async function createTrip(payload: Partial<Trip>): Promise<Trip> {
  const { data } = await api.post<{ trip: Trip }>("/api/trips", payload);
  return data.trip;
}

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

export interface CityFilters {
  search?: string;
  region?: string;
  sort?: "popularity" | "cost_asc" | "cost_desc";
  limit?: number;
  offset?: number;
}

export interface CitiesResponse {
  cities: City[];
  total: number;
}

export async function fetchCities(
  filters?: CityFilters
): Promise<CitiesResponse> {
  const { data } = await api.get<CitiesResponse>("/api/cities", {
    params: filters,
  });
  return data;
}

export async function fetchCity(id: number): Promise<City> {
  const { data } = await api.get<{ city: City }>(`/api/cities/${id}`);
  return data.city;
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export interface ActivityFilters {
  city_id?: number;
  category_id?: number;
  min_cost?: number;
  max_cost?: number;
  is_popular?: boolean;
}

export async function fetchActivities(
  filters?: ActivityFilters
): Promise<Activity[]> {
  const { data } = await api.get<{ activities: Activity[] }>(
    "/api/activities",
    { params: filters }
  );
  return data.activities;
}

export async function fetchCategories(): Promise<ActivityCategory[]> {
  const { data } = await api.get<{ categories: ActivityCategory[] }>(
    "/api/activities/categories"
  );
  return data.categories;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminStats {
  total_users: number;
  total_trips: number;
  public_trips: number;
  top_cities: { name: string; visit_count: number }[];
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<{ stats: AdminStats }>("/api/admin/stats");
  return data.stats;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  trip_count: number;
}

export async function fetchAdminUsers(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUser[]; total: number }> {
  const { data } = await api.get<{ users: AdminUser[]; total: number }>(
    "/api/admin/users",
    { params }
  );
  return data;
}

export interface AdminTrip {
  id: string;
  name: string;
  owner_name: string;
  status: string;
  start_date: string;
  end_date: string;
  stop_count: number;
  is_public: boolean;
  created_at: string;
}

export async function fetchAdminTrips(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ trips: AdminTrip[]; total: number }> {
  const { data } = await api.get<{ trips: AdminTrip[]; total: number }>(
    "/api/admin/trips",
    { params }
  );
  return data;
}
