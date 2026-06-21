-- Migration 005: Add objective_id column to tasks table
ALTER TABLE tasks ADD COLUMN objective_id TEXT REFERENCES objectives(id) ON DELETE CASCADE;
