-- ==============================================================================
-- ECOLOOP — PHASE 3A DATABASE MIGRATION
-- Production-Ready Schema with Row Level Security (RLS) & Triggers
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PROFILES TABLE
-- Tied 1-to-1 with auth.users. User roles cannot be modified by regular users.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    city TEXT DEFAULT 'Metro Vancouver',
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'business', 'moderator', 'admin')),
    karma_points INTEGER NOT NULL DEFAULT 50 CHECK (karma_points >= 0),
    co2_diverted_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (co2_diverted_kg >= 0),
    preferences JSONB NOT NULL DEFAULT '{"notifications": true, "theme": "system", "email_alerts": false}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. DEVICE LISTINGS TABLE
-- Normalized device catalog supporting Sell, Repair, and Recycle pathways.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.device_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    device_category TEXT NOT NULL CHECK (device_category IN (
        'smartphone', 'laptop', 'tablet', 'audio', 'gaming', 'parts', 'wearable', 'other'
    )),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN (
        'like_new', 'good', 'fair', 'for_parts'
    )),
    description TEXT NOT NULL,
    pathway TEXT NOT NULL CHECK (pathway IN ('sell', 'repair', 'recycle')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'pending', 'completed', 'archived'
    )),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    is_free BOOLEAN NOT NULL DEFAULT false,
    original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= 0),
    city TEXT NOT NULL DEFAULT 'Metro Vancouver',
    pickup_type TEXT NOT NULL DEFAULT 'dropoff' CHECK (pickup_type IN ('dropoff', 'pickup', 'shipping', 'both')),
    warranty_days INTEGER CHECK (warranty_days IS NULL OR warranty_days >= 0),
    issue_type TEXT,
    issue_details TEXT,
    disposal_reason TEXT,
    certificate_requested BOOLEAN NOT NULL DEFAULT false,
    co2_saved_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (co2_saved_kg >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. LISTING PHOTOS TABLE
-- Stored object references linked to device listings with display ordering.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.device_listings(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. ACTIVITY EVENTS TABLE
-- Immutable event ledger for notifications and community telemetry.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'listing_created', 'listing_status_changed', 'account_created', 'karma_earned', 'system_notice'
    )),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('device_listing', 'profile', 'system')),
    entity_id UUID,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. PERFORMANCE & QUERY INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_device_listings_owner_id ON public.device_listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_device_listings_category ON public.device_listings(device_category);
CREATE INDEX IF NOT EXISTS idx_device_listings_status ON public.device_listings(status);
CREATE INDEX IF NOT EXISTS idx_device_listings_pathway ON public.device_listings(pathway);
CREATE INDEX IF NOT EXISTS idx_device_listings_created_at ON public.device_listings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON public.listing_photos(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_photos_display_order ON public.listing_photos(listing_id, display_order);

CREATE INDEX IF NOT EXISTS idx_activity_events_recipient_id ON public.activity_events(recipient_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON public.activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_unread ON public.activity_events(recipient_id, read_at) WHERE read_at IS NULL;

-- ==============================================================================
-- 7. AUTOMATIC TIMESTAMP & SECURITY TRIGGERS
-- ==============================================================================

-- Function to touch updated_at automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_device_listings_updated_at ON public.device_listings;
CREATE TRIGGER set_device_listings_updated_at
    BEFORE UPDATE ON public.device_listings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Prevent users from self-elevating privileges (role or karma) via client UPDATE
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS TRIGGER AS $$
DECLARE
    is_service BOOLEAN;
BEGIN
    is_service := (current_user IN ('postgres', 'service_role', 'supabase_admin'))
               OR (coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role');

    IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT is_service THEN
        RAISE EXCEPTION 'Users cannot alter their own account role.';
    END IF;
    IF (OLD.karma_points IS DISTINCT FROM NEW.karma_points) AND NOT is_service THEN
        RAISE EXCEPTION 'Karma points can only be updated through verified actions.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_profile_privileges ON public.profiles;
CREATE TRIGGER enforce_profile_privileges
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_privileges();

-- Idempotent profile creation trigger upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
BEGIN
    base_username := LOWER(COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ));
    final_username := base_username || '_' || substr(replace(NEW.id::text, '-', ''), 1, 6);

    INSERT INTO public.profiles (
        id,
        display_name,
        username,
        avatar_url,
        role,
        karma_points,
        co2_diverted_kg
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, 'Member'), '@', 1)),
        final_username,
        NEW.raw_user_meta_data->>'avatar_url',
        'member',
        50,
        0.0
    )
    ON CONFLICT (id) DO NOTHING;

    -- Add welcome activity event
    INSERT INTO public.activity_events (
        recipient_id,
        event_type,
        entity_type,
        entity_id,
        title,
        description,
        metadata
    )
    VALUES (
        NEW.id,
        'account_created',
        'profile',
        NEW.id,
        'Welcome to EcoLoop!',
        'Your circular electronic passport is active. 50 welcome EcoKarma points awarded.',
        jsonb_build_object('welcome_bonus', 50)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
-- Anyone (authenticated or anonymous) can view basic public profiles
CREATE POLICY "Public profiles are visible to all users"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Users can insert their own profile (matching authenticated identity)
CREATE POLICY "Users can create their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Device Listings Policies
-- ------------------------------------------------------------------------------
-- Public can view active listings; owners can view all their listings (active, pending, etc.)
CREATE POLICY "Active listings are viewable by all; owners see all their own"
    ON public.device_listings
    FOR SELECT
    USING (status = 'active' OR auth.uid() = owner_id);

-- Authenticated users can insert their own listings
CREATE POLICY "Authenticated users can create listings"
    ON public.device_listings
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own listings
CREATE POLICY "Owners can update their own listings"
    ON public.device_listings
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Owners can delete or archive their own listings
CREATE POLICY "Owners can delete their own listings"
    ON public.device_listings
    FOR DELETE
    USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- Listing Photos Policies
-- ------------------------------------------------------------------------------
-- Photos are viewable if the parent listing is active or owned by user
CREATE POLICY "Photos are viewable with their listings"
    ON public.listing_photos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.device_listings l
            WHERE l.id = listing_photos.listing_id
            AND (l.status = 'active' OR l.owner_id = auth.uid())
        )
    );

-- Owners can insert photos for their own listings
CREATE POLICY "Owners can insert photos for their listings"
    ON public.listing_photos
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.device_listings l
            WHERE l.id = listing_photos.listing_id
            AND l.owner_id = auth.uid()
        )
    );

-- Owners can delete photos of their listings
CREATE POLICY "Owners can delete photos of their listings"
    ON public.listing_photos
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.device_listings l
            WHERE l.id = listing_photos.listing_id
            AND l.owner_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- Activity Events Policies
-- ------------------------------------------------------------------------------
-- Users can only view their own activity events
CREATE POLICY "Users can only view their own activity events"
    ON public.activity_events
    FOR SELECT
    USING (auth.uid() = recipient_id);

-- Users can mark their own activity events as read
CREATE POLICY "Users can update their own activity events"
    ON public.activity_events
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- Authenticated users or system triggers can create activity events
CREATE POLICY "Authenticated users can trigger activity events"
    ON public.activity_events
    FOR INSERT
    WITH CHECK (auth.uid() = recipient_id OR auth.uid() = actor_id);

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET CONFIGURATION
-- ==============================================================================

-- Create bucket for listing photos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read access for listing photos
CREATE POLICY "Listing photos are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'listing-photos');

-- Storage RLS: Authenticated users can upload photos under their user ID prefix
CREATE POLICY "Authenticated users can upload listing photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'listing-photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage RLS: Users can delete their own uploaded photos
CREATE POLICY "Users can delete their own listing photos"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'listing-photos'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
