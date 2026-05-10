-- Migration: 001_add_missing_columns
-- Adds columns that are defined in schema.sql but were missing from the live Neon DB.
-- Safe to run multiple times (uses IF NOT EXISTS).

-- trips: soft-delete flag
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- activities: audit timestamp
ALTER TABLE activities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
