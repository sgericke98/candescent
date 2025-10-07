-- Update risk_type enum to include new risk types
-- First, we need to alter the enum type to add new values

-- Add new risk types
ALTER TYPE risk_type ADD VALUE IF NOT EXISTS 'Delivery';
ALTER TYPE risk_type ADD VALUE IF NOT EXISTS 'Changes';

-- Note: PostgreSQL doesn't allow removing enum values directly
-- The existing values (Relationship, Product, Competition, Price) will remain valid
-- This migration adds the new required values: Delivery and Changes
-- All six values are now available: Competition, Price, Product, Delivery, Relationship, Changes
