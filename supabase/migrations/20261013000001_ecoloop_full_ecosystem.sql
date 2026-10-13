-- ==============================================================================
-- ECOLOOP — PHASE 3B & COMPLETE CIRCULAR ECOSYSTEM MIGRATION
-- Production-Ready Multi-Role Schema with Row Level Security (RLS) & Triggers
-- ==============================================================================

-- 1. Organizations & Team Memberships
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    org_type TEXT NOT NULL CHECK (org_type IN ('repair_shop', 'recycler', 'refurbisher', 'business_seller')),
    registration_number TEXT,
    tax_id TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    city TEXT NOT NULL DEFAULT 'Metro Vancouver',
    address TEXT,
    contact_email TEXT NOT NULL,
    phone TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('owner', 'manager', 'technician', 'staff', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, user_id)
);

-- 2. Multi-Role Assignments (Permitting multiple concurrent capabilities)
CREATE TABLE IF NOT EXISTS public.role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('consumer', 'repair_pro', 'recycler', 'business', 'moderator', 'admin')),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    granted_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, role, organization_id)
);

-- 3. Provider Verification & Applications Lifecycle
CREATE TABLE IF NOT EXISTS public.provider_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    application_type TEXT NOT NULL CHECK (application_type IN ('repair_pro', 'recycler', 'business')),
    business_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    categories TEXT[] NOT NULL DEFAULT '{}',
    service_area TEXT NOT NULL DEFAULT 'Metro Vancouver',
    documentation_urls TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewer_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('repair_pro', 'recycler', 'business')),
    business_name TEXT NOT NULL,
    bio TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    completed_jobs INTEGER NOT NULL DEFAULT 0 CHECK (completed_jobs >= 0),
    specialties TEXT[] NOT NULL DEFAULT '{}',
    certifications TEXT[] NOT NULL DEFAULT '{}',
    service_radius_km INTEGER NOT NULL DEFAULT 25,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Repair Workflow & Itemized Quotes
CREATE TABLE IF NOT EXISTS public.repair_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_category TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    photos TEXT[] NOT NULL DEFAULT '{}',
    urgency TEXT NOT NULL DEFAULT 'standard' CHECK (urgency IN ('low', 'standard', 'express')),
    preferred_service_type TEXT NOT NULL DEFAULT 'dropoff' CHECK (preferred_service_type IN ('dropoff', 'pickup', 'mail_in')),
    city TEXT NOT NULL DEFAULT 'Metro Vancouver',
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'matching', 'quoted', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed'
    )),
    accepted_quote_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.repair_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_request_id UUID NOT NULL REFERENCES public.repair_requests(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    parts_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (parts_cost >= 0),
    labor_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (labor_cost >= 0),
    diagnostic_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (diagnostic_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    estimated_turnaround_days INTEGER NOT NULL DEFAULT 2 CHECK (estimated_turnaround_days > 0),
    warranty_days INTEGER NOT NULL DEFAULT 90 CHECK (warranty_days >= 0),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Recycling Workflow & Verified Measured Scale Weights
CREATE TABLE IF NOT EXISTS public.recycling_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_category TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    estimated_weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.2 CHECK (estimated_weight_kg > 0),
    condition TEXT NOT NULL DEFAULT 'broken',
    has_hazardous_battery BOOLEAN NOT NULL DEFAULT false,
    collection_type TEXT NOT NULL DEFAULT 'dropoff' CHECK (collection_type IN ('dropoff', 'pickup')),
    address TEXT,
    city TEXT NOT NULL DEFAULT 'Metro Vancouver',
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
        'requested', 'eligibility_checked', 'accepted', 'scheduled', 'collected', 'received', 'processing', 'closed'
    )),
    assigned_recycler_id UUID REFERENCES public.profiles(id),
    certificate_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.collection_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recycling_request_id UUID NOT NULL REFERENCES public.recycling_requests(id) ON DELETE CASCADE,
    recycler_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verified_weight_kg NUMERIC(8, 2) NOT NULL CHECK (verified_weight_kg > 0),
    hazardous_notes TEXT,
    processing_stage TEXT NOT NULL CHECK (processing_stage IN ('dismantled', 'materials_recovered', 'certified_destruction')),
    certificate_number TEXT NOT NULL UNIQUE,
    disposition_summary TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Business Inventory & Bulk Lots
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    title TEXT NOT NULL,
    device_category TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    condition_grade TEXT NOT NULL CHECK (condition_grade IN ('A+', 'A', 'B', 'C', 'For Parts')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    is_wholesale BOOLEAN NOT NULL DEFAULT false,
    minimum_order_qty INTEGER NOT NULL DEFAULT 1 CHECK (minimum_order_qty >= 1),
    refurbished_inspected BOOLEAN NOT NULL DEFAULT false,
    warranty_days INTEGER DEFAULT 90 CHECK (warranty_days IS NULL OR warranty_days >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Marketplace Offers & Counter-Offers
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.device_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    offer_amount NUMERIC(10, 2) NOT NULL CHECK (offer_amount > 0),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'countered', 'declined', 'expired')),
    counter_amount NUMERIC(10, 2) CHECK (counter_amount IS NULL OR counter_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Device Passport Immutable Lifecycle Events
CREATE TABLE IF NOT EXISTS public.device_passport_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_identifier TEXT NOT NULL, -- IMEI, Serial number or Listing UUID
    listing_id UUID REFERENCES public.device_listings(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'first_listed', 'ownership_transfer', 'reported_repair', 'verified_repair',
        'parts_replaced', 'refurbishment_inspection', 'recycler_collected', 'responsibly_processed'
    )),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_role TEXT NOT NULL DEFAULT 'consumer',
    verification_tier TEXT NOT NULL DEFAULT 'user_reported' CHECK (verification_tier IN (
        'user_reported', 'provider_reported', 'evidence_backed', 'certified'
    )),
    summary TEXT NOT NULL,
    evidence_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Moderation Reports & Moderator Actions
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'user', 'provider', 'quote')),
    target_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'spam', 'counterfeit', 'hazardous_item', 'prohibited_device', 'fraud', 'other'
    )),
    description TEXT NOT NULL,
    evidence_urls TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'actioned', 'dismissed')),
    assigned_moderator_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    moderator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    action_taken TEXT NOT NULL CHECK (action_taken IN (
        'warning_issued', 'content_hidden', 'content_removed', 'user_suspended', 'escalated_to_admin', 'dismissed'
    )),
    justification TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Platform Administrator Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    ip_address TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON public.role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_apps_status ON public.provider_applications(status);
CREATE INDEX IF NOT EXISTS idx_repair_req_customer ON public.repair_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_req_status ON public.repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repair_quotes_request ON public.repair_quotes(repair_request_id);
CREATE INDEX IF NOT EXISTS idx_recycling_req_user ON public.recycling_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_recycling_req_status ON public.recycling_requests(status);
CREATE INDEX IF NOT EXISTS idx_inventory_org ON public.inventory_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_passport_device ON public.device_passport_events(device_identifier);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);

-- Enable RLS across all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycling_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_passport_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Public can view verified organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Public can view provider profiles" ON public.provider_profiles FOR SELECT USING (true);
CREATE POLICY "Public can view device passport events" ON public.device_passport_events FOR SELECT USING (true);
CREATE POLICY "Users can create passport events" ON public.device_passport_events FOR INSERT WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Users view own repair requests" ON public.repair_requests FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users create own repair requests" ON public.repair_requests FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users view quotes for their requests" ON public.repair_quotes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.repair_requests r WHERE r.id = repair_request_id AND (r.customer_id = auth.uid() OR provider_id = auth.uid()))
);

CREATE POLICY "Users view own recycling requests" ON public.recycling_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_recycler_id);
CREATE POLICY "Users create recycling requests" ON public.recycling_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view inventory they own" ON public.inventory_items FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users manage inventory they own" ON public.inventory_items FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users view own offers" ON public.offers FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users create offers" ON public.offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
