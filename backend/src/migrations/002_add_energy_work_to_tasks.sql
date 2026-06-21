-- Migration 002: Add energy_work columns to tasks table
ALTER TABLE tasks ADD COLUMN execution_type TEXT DEFAULT 'standard';
ALTER TABLE tasks ADD COLUMN energy_work_execution TEXT DEFAULT '{}';
