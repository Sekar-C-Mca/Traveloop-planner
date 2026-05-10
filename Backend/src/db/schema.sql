-- ============================================================
-- Traveloop Database Schema
-- Run this once against your Neon PostgreSQL instance
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(255) NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  profile_photo_url   TEXT,
  language_preference VARCHAR(10) NOT NULL DEFAULT 'en',
  is_admin            BOOLEAN NOT NULL DEFAULT false,
  is_deleted          BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- CITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS cities (
  id                INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name              VARCHAR(255) NOT NULL,
  country           VARCHAR(255) NOT NULL,
  region            VARCHAR(100),
  cost_index        NUMERIC(5,2),
  popularity_score  NUMERIC(5,2),
  description       TEXT,
  image_url         TEXT,
  latitude          NUMERIC(10,7),
  longitude         NUMERIC(10,7),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_categories (
  id    INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name  VARCHAR(100) NOT NULL UNIQUE,
  icon  VARCHAR(50)
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id                INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  city_id           INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  category_id       INTEGER REFERENCES activity_categories(id) ON DELETE SET NULL,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  estimated_cost    NUMERIC(10,2),
  duration_minutes  INTEGER,
  image_url         TEXT,
  is_popular        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_city_id ON activities(city_id);
CREATE INDEX IF NOT EXISTS idx_activities_category_id ON activities(category_id);

-- ============================================================
-- TRIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  cover_photo_url  TEXT,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  currency         VARCHAR(10) NOT NULL DEFAULT 'INR',
  total_budget     NUMERIC(12,2),
  is_public        BOOLEAN NOT NULL DEFAULT false,
  share_token      VARCHAR(64) UNIQUE,
  status           VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed')),
  is_deleted       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON trips(share_token);

-- ============================================================
-- TRIP STOPS
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_stops (
  id               INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_id          UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id          INTEGER NOT NULL REFERENCES cities(id),
  arrival_date     DATE NOT NULL,
  departure_date   DATE NOT NULL,
  order_index      INTEGER NOT NULL DEFAULT 0,
  stay_cost        NUMERIC(10,2) NOT NULL DEFAULT 0,
  transport_cost   NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);

-- ============================================================
-- TRIP STOP ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_stop_activities (
  id              INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_stop_id    INTEGER NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
  activity_id     INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  scheduled_date  DATE,
  scheduled_time  TIME,
  custom_cost     NUMERIC(10,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tsa_trip_stop_id ON trip_stop_activities(trip_stop_id);

-- ============================================================
-- TRIP BUDGETS
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_budgets (
  id                  INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_id             UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  transport_budget    NUMERIC(12,2) NOT NULL DEFAULT 0,
  stay_budget         NUMERIC(12,2) NOT NULL DEFAULT 0,
  activity_budget     NUMERIC(12,2) NOT NULL DEFAULT 0,
  meal_budget         NUMERIC(12,2) NOT NULL DEFAULT 0,
  misc_budget         NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency            VARCHAR(10) NOT NULL DEFAULT 'INR',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SAVED DESTINATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_destinations (
  id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city_id     INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, city_id)
);

-- ============================================================
-- PACKING CHECKLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS packing_checklist (
  id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item_name   VARCHAR(255) NOT NULL,
  category    VARCHAR(100),
  is_packed   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packing_trip_id ON packing_checklist(trip_id);

-- ============================================================
-- TRIP NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_notes (
  id              INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_stop_id    INTEGER REFERENCES trip_stops(id) ON DELETE SET NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_trip_id ON trip_notes(trip_id);

-- ============================================================
-- SHARED TRIP VIEWS (analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS shared_trip_views (
  id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  viewer_ip   VARCHAR(64),
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIP COPIES (analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_copies (
  id                    INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  original_trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  copied_by_user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_trip_id           UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  copied_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
