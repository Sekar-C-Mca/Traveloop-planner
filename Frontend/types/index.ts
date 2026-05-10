export interface User {
  id: string;
  name: string;
  email: string;
  profile_photo_url?: string;
  language_preference: string;
  is_admin: boolean;
  created_at: string;
}

export interface City {
  id: number;
  name: string;
  country: string;
  region?: string;
  cost_index?: number;
  popularity_score: number;
  description?: string;
  image_url?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_photo_url?: string;
  start_date: string;
  end_date: string;
  currency: string;
  total_budget?: number;
  is_public: boolean;
  share_token?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  created_at: string;
  stops?: TripStop[];
}

export interface TripStop {
  id: number;
  trip_id: string;
  city_id: number;
  city?: City;
  arrival_date: string;
  departure_date: string;
  order_index: number;
  stay_cost: number;
  transport_cost: number;
  notes?: string;
  activities?: TripStopActivity[];
}

export interface Activity {
  id: number;
  city_id: number;
  category_id?: number;
  name: string;
  description?: string;
  estimated_cost?: number;
  duration_minutes?: number;
  image_url?: string;
  is_popular: boolean;
  category?: ActivityCategory;
}

export interface ActivityCategory {
  id: number;
  name: string;
  icon?: string;
}

export interface TripStopActivity {
  id: number;
  trip_stop_id: number;
  activity_id: number;
  activity?: Activity;
  scheduled_date?: string;
  scheduled_time?: string;
  custom_cost?: number;
  notes?: string;
}

export interface TripBudget {
  id: number;
  trip_id: string;
  transport_budget: number;
  stay_budget: number;
  activity_budget: number;
  meal_budget: number;
  misc_budget: number;
  currency: string;
}

export interface PackingItem {
  id: number;
  trip_id: string;
  item_name: string;
  category?: string;
  is_packed: boolean;
}

export interface TripNote {
  id: number;
  trip_id: string;
  trip_stop_id?: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}
