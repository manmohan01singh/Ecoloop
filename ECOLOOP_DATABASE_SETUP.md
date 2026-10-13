# ECOLOOP — DATABASE SETUP & DEPLOYMENT GUIDE
## PostgreSQL 16 & Supabase Migration Architecture

**Document Version:** 2.0.0  
**Status:** Production-Ready Baseline  
**Date:** October 2026  
**Target Environment:** Supabase Cloud / Self-Hosted PostgreSQL 16+

---

## 1. System Requirements & Prerequisites

The EcoLoop database layer is built upon PostgreSQL 16 with native JSONB support, cryptographic extensions, and Row Level Security (RLS).

### Prerequisites:
- **PostgreSQL Version:** 15.0+ (PostgreSQL 16 recommended).
- **Required Extensions:**
  - `uuid-ossp` or native `gen_random_uuid()` (standard in Postgres 13+).
  - `pgcrypto` (for secure hashing).
- **Supabase CLI:** Version 1.140.0+ (for local development and CI/CD).
- **Node.js:** v18.0.0+ / npm v9.0.0+.

---

## 2. Migration Hierarchy & Execution Order

All database migrations are located in `supabase/migrations/` and must be applied in sequential chronological order:

```
supabase/migrations/
├── 20261013000000_ecoloop_phase_3a_schema.sql   (Base Auth, Listings, Activity)
└── 20261013000001_ecoloop_full_ecosystem.sql     (14 Tables: Roles, Providers,
                                                   Workflows, Passport, Moderation)
```

### Table Breakdown by Migration:

#### Migration 1: `20261013000000_ecoloop_phase_3a_schema.sql`
1. `public.profiles`: Stores core user profile, avatar, city, and default role.
2. `public.device_listings`: Core consumer marketplace listings with condition, price, and CO2 diversion.
3. `public.activity_events`: Personalized user activity and notification ledger with unread badges.

#### Migration 2: `20261013000001_ecoloop_full_ecosystem.sql`
1. `public.organizations`: Registered commercial entities (repair shops, recyclers, refurbishers).
2. `public.organization_members`: Multi-tenant team memberships with owner/technician roles.
3. `public.role_assignments`: Granular user capabilities (`consumer`, `repair_pro`, `recycler`, `business`, `moderator`, `admin`).
4. `public.provider_applications`: Formal verification pipeline for commercial providers.
5. `public.provider_profiles`: Public provider reputation, rating, certifications, and radius.
6. `public.repair_requests`: Customer repair triage tickets with symptoms and photos.
7. `public.repair_quotes`: Itemized quotes with labor, parts, diagnostic fee, turnaround, and warranty.
8. `public.recycling_requests`: E-waste collection orders with hazard battery flags.
9. `public.collection_events`: Verified scale intake logs with measured weight (kg) and disposition.
10. `public.inventory_items`: B2B SKU catalog with wholesale MOQ and refurbishment badges.
11. `public.offers`: Marketplace offers and counter-offers between buyers and sellers.
12. `public.device_passport_events`: Immutable lifecycle provenance ledger with 4 verification tiers.
13. `public.reports`: User-submitted violation reports for content and bad actors.
14. `public.moderation_actions`: Enforcement actions with mandatory audit justification.
15. `public.audit_logs`: Immutable administrator operational trail.

---

## 3. Step-by-Step Deployment Instructions

### Method A: Local Development with Supabase CLI (Recommended)

1. **Install and Initialize Supabase:**
   ```powershell
   # In repository root:
   npx supabase init
   ```

2. **Start Local PostgreSQL Container:**
   ```powershell
   npx supabase start
   ```
   *This starts the PostgreSQL database, auth server, storage engine, and local Supabase Studio dashboard at `http://127.0.0.1:54323`.*

3. **Apply All Migrations:**
   ```powershell
   npx supabase db reset
   ```
   *This drops the local database, creates a clean schema, applies both migrations in sequence, and outputs the local connection keys.*

---

### Method B: Remote Deployment to Supabase Cloud

1. **Log in to Supabase CLI:**
   ```powershell
   npx supabase login
   ```

2. **Link to Remote Project:**
   ```powershell
   npx supabase link --project-ref <your-supabase-project-ref>
   ```

3. **Push Migrations to Remote Production Database:**
   ```powershell
   npx supabase db push
   ```

---

### Method C: Manual Execution via Supabase SQL Editor

If executing migrations without the CLI:
1. Open the **Supabase Dashboard** ➔ **SQL Editor**.
2. Create a new query, paste the full contents of `supabase/migrations/20261013000000_ecoloop_phase_3a_schema.sql`, and click **Run**.
3. Create a second query, paste the full contents of `supabase/migrations/20261013000001_ecoloop_full_ecosystem.sql`, and click **Run**.

---

## 4. Environment Variables Configuration

### Mobile Application Environment (`mobile/.env`):
Create or update `mobile/.env` with your project's client-safe variables:

```env
# Supabase Project Endpoint
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Public Anonymous API Key (Safe for Mobile Clients)
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Backend / Server-Side Environment (`.env`):
For administrative scripts, background workers, or backend APIs:

```env
# Supabase Service Role Key (NEVER expose in mobile client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Direct PostgreSQL Connection String
DATABASE_URL=postgresql://postgres.your-project:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## 5. Seed Data & Test Fixtures Setup

To populate the system with realistic default entities for all operational workspaces, execute the following SQL seed script in your Supabase SQL Editor:

```sql
-- Seed Default Verified Organizations
INSERT INTO public.organizations (id, name, slug, org_type, verified, city, contact_email)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Apex Mobile & Micro-Soldering', 'apex-repair', 'repair_shop', true, 'Metro Vancouver', 'service@apexrepair.ca'),
  ('22222222-2222-2222-2222-222222222222', 'Pacific Metals & R2 Recyclers', 'pacific-metals', 'recycler', true, 'Metro Vancouver', 'intake@pacificmetals.ca'),
  ('33333333-3333-3333-3333-333333333333', 'ReLoop Enterprise Refurbishers', 'reloop-enterprise', 'business_seller', true, 'Metro Vancouver', 'sales@reloop.ca')
ON CONFLICT (slug) DO NOTHING;

-- Seed Sample Provider Profiles
INSERT INTO public.provider_profiles (id, user_id, organization_id, provider_type, business_name, bio, rating, review_count, completed_jobs, specialties, certifications)
VALUES
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'repair_pro', 'Apex Mobile Repair', 'Specializing in Apple logic board micro-soldering and battery replacement.', 4.95, 84, 142, ARRAY['Apple', 'Samsung', 'Micro-Soldering', 'Water Damage'], ARRAY['WISE Level 2', 'IPC-7711']),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'recycler', 'Pacific Metals Recycling', 'Zero-landfill certified electronic waste collection and precious metal reclamation facility.', 4.98, 120, 520, ARRAY['Li-ion Batteries', 'Printed Circuit Boards', 'Servers', 'CRT Displays'], ARRAY['R2v3 Certified', 'e-Stewards', 'ISO 14001'])
ON CONFLICT DO NOTHING;
```

---

## 6. Verification Queries & System Health Check

Run the following diagnostic SQL script to confirm schema health, constraint verification, and RLS enablement:

```sql
-- 1. Verify all 15 EcoLoop tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'device_listings', 'activity_events', 'organizations',
    'organization_members', 'role_assignments', 'provider_applications',
    'provider_profiles', 'repair_requests', 'repair_quotes',
    'recycling_requests', 'collection_events', 'inventory_items',
    'offers', 'device_passport_events', 'reports', 'moderation_actions',
    'audit_logs'
  )
ORDER BY table_name;

-- 2. Verify Row Level Security (RLS) is ENABLED on every table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Verify Indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```
