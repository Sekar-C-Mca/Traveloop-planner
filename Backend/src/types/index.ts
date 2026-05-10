export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  profile_photo_url?: string;
  language_preference: string;
  is_admin: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface City {
  id: number;
  name: string;
  country: string;
  region?: string;
  cost_index?: number;
  popularity_score?: number;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
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
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TripStop {
  id: number;
  trip_id: string;
  city_id: number;
  arrival_date: string;
  departure_date: string;
  order_index: number;
  stay_cost: number;
  transport_cost: number;
  notes?: string;
  created_at: Date;
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
  created_at: Date;
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
  scheduled_date?: string;
  scheduled_time?: string;
  custom_cost?: number;
  notes?: string;
  created_at: Date;
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
  updated_at: Date;
}

export interface PackingItem {
  id: number;
  trip_id: string;
  item_name: string;
  category?: string;
  is_packed: boolean;
  created_at: Date;
}

export interface TripNote {
  id: number;
  trip_id: string;
  trip_stop_id?: number;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
  is_admin: boolean;
}
