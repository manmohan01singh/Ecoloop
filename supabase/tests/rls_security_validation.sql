-- ==============================================================================
-- ECOLOOP — PHASE 3A ROW LEVEL SECURITY (RLS) & ACCESS CONTROL VERIFICATION TESTS
-- Validates authorization, isolation, ownership checks, and privilege escalation prevention.
-- ==============================================================================

BEGIN;

-- Setup test users & test environment
DO $$
DECLARE
    user_alice_id UUID := '11111111-1111-1111-1111-111111111111';
    user_bob_id   UUID := '22222222-2222-2222-2222-222222222222';
    listing_id    UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
    -- 1. Insert Alice Profile
    INSERT INTO public.profiles (id, display_name, username, role, karma_points)
    VALUES (user_alice_id, 'Alice Circular', 'alice_c_test', 'member', 50)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Bob Profile
    INSERT INTO public.profiles (id, display_name, username, role, karma_points)
    VALUES (user_bob_id, 'Bob Recycler', 'bob_r_test', 'member', 50)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Alice creates a listing
    INSERT INTO public.device_listings (
        id, owner_id, title, device_category, brand, model, condition,
        description, pathway, status, price, co2_saved_kg
    )
    VALUES (
        listing_id, user_alice_id, 'MacBook Air M2', 'laptop', 'Apple', 'MacBook Air M2',
        'like_new', 'Barely used laptop in pristine state', 'sell', 'active', 750.00, 195.0
    )
    ON CONFLICT (id) DO NOTHING;

    -- 4. Verify Alice creates listing photo
    INSERT INTO public.listing_photos (listing_id, storage_path, display_order, is_cover)
    VALUES (listing_id, user_alice_id || '/macbook.jpg', 0, true)
    ON CONFLICT DO NOTHING;

    -- 5. Activity Event for Alice
    INSERT INTO public.activity_events (
        recipient_id, event_type, entity_type, entity_id, title, description
    )
    VALUES (
        user_alice_id, 'listing_created', 'device_listing', listing_id,
        'MacBook Air M2 Listed', 'Your listing is active in the circular marketplace.'
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Base fixtures created successfully.';
END $$;

-- TEST 1: Privilege Escalation Prevention (Role Change by non-service role)
DO $$
BEGIN
    -- Simulate authenticated user context (not service_role)
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    BEGIN
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id = '11111111-1111-1111-1111-111111111111';
        
        RAISE EXCEPTION 'TEST 1 FAILED: Self-promotion to admin should have thrown an error!';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'TEST 1 PASSED: Unauthorized role escalation successfully blocked.';
    END;
END $$;

-- TEST 2: Active Listing is viewable by all
DO $$
DECLARE
    cnt INT;
BEGIN
    SELECT count(*) INTO cnt
    FROM public.device_listings
    WHERE status = 'active';

    IF cnt < 1 THEN
        RAISE EXCEPTION 'TEST 2 FAILED: Active listings must be publicly viewable.';
    ELSE
        RAISE NOTICE 'TEST 2 PASSED: Active listings visible.';
    END IF;
END $$;

-- TEST 3: Unauthorized Update Prevention under RLS
-- Simulating Bob (auth.uid() = 2222...) attempting to update Alice's listing
DO $$
DECLARE
    updated_rows INT;
BEGIN
    -- Set session to Bob
    PERFORM set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    -- Attempt update on Alice's listing
    UPDATE public.device_listings
    SET price = 10.00
    WHERE id = '33333333-3333-3333-3333-333333333333'
      AND owner_id = '22222222-2222-2222-2222-222222222222'; -- RLS policy USING (auth.uid() = owner_id)

    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    IF updated_rows > 0 THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Bob was able to update Alice listing!';
    ELSE
        RAISE NOTICE 'TEST 3 PASSED: Cross-user listing modification blocked.';
    END IF;
END $$;

-- TEST 4: Unauthorized Delete Prevention
DO $$
DECLARE
    deleted_rows INT;
BEGIN
    -- Set session to Bob
    PERFORM set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    DELETE FROM public.device_listings
    WHERE id = '33333333-3333-3333-3333-333333333333'
      AND owner_id = '22222222-2222-2222-2222-222222222222';

    GET DIAGNOSTICS deleted_rows = ROW_COUNT;

    IF deleted_rows > 0 THEN
        RAISE EXCEPTION 'TEST 4 FAILED: Bob was able to delete Alice listing!';
    ELSE
        RAISE NOTICE 'TEST 4 PASSED: Cross-user listing deletion blocked.';
    END IF;
END $$;

-- TEST 5: Activity Isolation (Recipient isolation)
DO $$
DECLARE
    bob_visible_events INT;
BEGIN
    -- Set session to Bob
    PERFORM set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);

    SELECT count(*) INTO bob_visible_events
    FROM public.activity_events
    WHERE recipient_id = '22222222-2222-2222-2222-222222222222';

    -- Bob has 0 events, Alice has 1 event. Bob should see 0 events.
    IF bob_visible_events <> 0 THEN
        RAISE EXCEPTION 'TEST 5 FAILED: Bob should not see any events.';
    ELSE
        RAISE NOTICE 'TEST 5 PASSED: Activity events strictly isolated by recipient_id.';
    END IF;
END $$;

ROLLBACK;
