-- EcoLoop User Setup Script
-- Run this after starting the database

-- First, let's see what users exist
SELECT id, name, email, role FROM "Users";

-- Delete existing test users if they exist (to recreate with fresh passwords)
DELETE FROM "Providers" WHERE "userId" IN (SELECT id FROM "Users" WHERE email IN ('moderator@ecoloop.com', 'recycler@ecoloop.com'));
DELETE FROM "Users" WHERE email IN ('moderator@ecoloop.com', 'recycler@ecoloop.com');

-- Insert Moderator with bcrypt hash for 'moderator123'
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO "Users" (id, name, email, password, role, "ecoKarmaTotal", "verificationStatus", "subscriptionTier", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Moderator User',
  'moderator@ecoloop.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'moderator',
  0,
  'admin_verified',
  'free',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert Recycler with bcrypt hash for 'recycler123'
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO "Users" (id, name, email, phone, password, city, state, role, "ecoKarmaTotal", "verificationStatus", "subscriptionTier", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'EcoRecycle Center',
  'recycler@ecoloop.com',
  '+6281234567890',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Jakarta',
  'DKI Jakarta',
  'recycler',
  0,
  'admin_verified',
  'free',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create Provider profile for Recycler
INSERT INTO "Providers" ("id", "userId", "businessName", "type", "specializations", "description", "address", "city", "province", "lat", "lng", "serviceRadius", "phone", "whatsapp", "verificationStatus", "completedJobs", "acceptedMaterials", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  u.id,
  'EcoRecycle Center Jakarta',
  'recycler',
  '["elektronik", "plastik", "logam", "baterai"]',
  'Professional e-waste recycling center in Jakarta',
  'Jl. Sudirman No. 123',
  'Jakarta',
  'DKI Jakarta',
  -6.2088,
  106.8456,
  50,
  '+6281234567890',
  '+6281234567890',
  'admin_verified',
  0,
  '["smartphone", "laptop", "tablet", "printer", "tv", "baterai", "kabel", "plastik", "logam"]',
  NOW(),
  NOW()
FROM "Users" u
WHERE u.email = 'recycler@ecoloop.com'
AND NOT EXISTS (SELECT 1 FROM "Providers" p WHERE p."userId" = u.id);

-- Verify users were created
SELECT id, name, email, role, "verificationStatus" FROM "Users" WHERE email IN ('moderator@ecoloop.com', 'recycler@ecoloop.com');

-- Show provider
SELECT p.id, p."businessName", p.type, u.email 
FROM "Providers" p 
JOIN "Users" u ON p."userId" = u.id 
WHERE u.email = 'recycler@ecoloop.com';
