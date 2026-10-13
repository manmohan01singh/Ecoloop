# ECOLOOP — SECURITY & ACCESS CONTROL SPECIFICATION
## Threat Modeling, RBAC, and Row Level Security Architecture

**Document Version:** 2.0.0  
**Status:** Production-Grade Baseline  
**Date:** October 2026  
**Security Standard:** Zero-Trust Client, PostgreSQL 16 Row Level Security (RLS)

---

## 1. Executive Security Summary & Threat Model

Circular electronics platforms face unique, high-stakes threat vectors combining software security, data privacy, and catastrophic physical safety risks:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CIRCULAR THREAT MATRIX                                │
├─────────────────────────┬───────────────────────────────────────────────────────┤
│ Threat Vector           │ Impact & Platform Risk                                │
├─────────────────────────┼───────────────────────────────────────────────────────┤
│ 1. Hazardous Batteries  │ Thermal runaway, fires during shipping/intake.        │
│ 2. Data Privacy Leakage │ Personal data exposed during device resale or repair. │
│ 3. Fraudulent Providers │ Unqualified entities issuing bogus certificates.      │
│ 4. Counterfeit Ledger   │ Falsified repair provenance or stolen device fencing. │
│ 5. Privilege Escalation │ Consumers granting themselves admin/moderator roles.  │
│ 6. Unauthorized Access  │ Competitors viewing proprietary B2B inventory prices. │
└─────────────────────────┴───────────────────────────────────────────────────────┘
```

EcoLoop implements a **Zero-Trust Client Security Model**: all client-side role checks in React Native are treated strictly as presentation conveniences. Security boundaries are strictly and immutably enforced at the database layer via PostgreSQL Row Level Security (RLS) policies, foreign key integrity, and server-side capability resolution.

---

## 2. Role-Based Access Control (RBAC) Architecture

### 2.1 Role Definitions & Capabilities

EcoLoop defines six distinct functional roles that an authenticated identity may hold simultaneously or sequentially:

1. **`consumer` (Default Role):**
   - Granted automatically to every registered user upon account creation.
   - Permissions: Browse marketplace, post personal devices for sale/repair/recycle, view and accept repair quotes, submit recycling requests, view device passports, file moderation reports.
2. **`repair_pro` (Verified Service Provider):**
   - Requires an approved Provider Application with verified business registration.
   - Permissions: Access Repair Pro Workspace, triage incoming repair tickets, author and submit binding itemized quotes, advance repair workflow states, record verified repair events to Device Passports.
3. **`recycler` (Certified E-Waste Processor):**
   - Requires R2v3, e-Stewards, or municipal environmental recycling accreditation.
   - Permissions: Access Recycler Workspace, claim collection requests, record physical intake with verified scale weights (kg), issue tamper-evident Digital Disposal Certificates, log disposition events to Device Passports.
4. **`business` (Commercial Refurbisher & Bulk Seller):**
   - Requires verified commercial business registration.
   - Permissions: Access Business Workspace, manage proprietary SKU inventory, execute validated bulk CSV imports, create wholesale lots with MOQ thresholds, respond to B2B purchase inquiries.
5. **`moderator` (Trust & Safety Specialist):**
   - Appointed directly by Platform Administrators.
   - Permissions: Access Moderator Workspace, review and triage reported listings and bad actors, execute enforcement actions (`warning_issued`, `content_hidden`, `content_removed`, `user_suspended`, `escalated_to_admin`) with mandatory audit justifications.
6. **`admin` (Platform Administrator):**
   - Supreme operational oversight.
   - Permissions: Access Admin Workspace, inspect partner applications, grant or revoke role capabilities, inspect complete system telemetry, review immutable system audit trails.

### 2.2 Granular Permissions Matrix

| Domain Operation | Consumer | Repair Pro | Recycler | Business | Moderator | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Browse Public Marketplace | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Post Device Listing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Repair Request | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| View Unquoted Repair Queue | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Issue Itemized Repair Quote | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Create Recycling Request | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Log Verified Scale Intake | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Issue Disposal Certificate | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Manage B2B SKU Inventory | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Import Bulk Inventory (CSV) | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Create Passport Event | ✅ (User) | ✅ (Verif) | ✅ (Cert) | ✅ (Verif) | ✅ | ✅ |
| Triage Moderation Reports | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Execute Moderation Sanction | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Review Provider Applications| ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Grant / Revoke User Roles | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Platform Audit Logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Privilege Escalation Prevention Architecture

### 3.1 Strict Separation of Role Assignment

A common vulnerability in multi-role applications is permitting users to modify their own profile role via an unconstrained `UPDATE profiles SET role = 'admin'` query.

EcoLoop prevents this through three independent defense layers:
1. **Decoupled Role Storage:** Roles are never stored as a mutable column on the user's editable profile. Roles are stored exclusively in the dedicated `role_assignments` table.
2. **Database Trigger Guard:** Direct user inserts and updates on `role_assignments` are denied by RLS. Only database service-role operations or certified admin procedures can insert into `role_assignments`.
3. **Application Lifecycle Barrier:** Users requesting `repair_pro`, `recycler`, or `business` status must submit a `provider_applications` record. This record begins in `submitted` status and requires explicit human admin verification before a role assignment is created.

### 3.2 Hazardous Battery Lockout Enforcement

When a user or provider evaluates a device with a swollen, punctured, or leaking lithium battery:
- The Circular Decision Engine immediately triggers a **Critical Safety Lockout**.
- The resale and repair pathways are strictly disabled.
- The device is forced into the Certified Recycling pathway with `has_hazardous_battery = true`.
- Recyclers handling the intake are required to confirm hazardous battery handling procedures before logging weight.

---

## 4. PostgreSQL Row Level Security (RLS) Policy Specifications

Row Level Security is enabled on **all 15 ecosystem tables** in PostgreSQL:

### 4.1 Profiles & Identity
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can read basic profile info (name, avatar)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Users can only update their own profile; cannot escalate roles
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

### 4.2 Role Assignments
```sql
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;

-- Users can view their own role assignments
CREATE POLICY "Users view own role assignments" 
ON public.role_assignments FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all role assignments
CREATE POLICY "Admins view all role assignments" 
ON public.role_assignments FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
);

-- Only admins can insert or update role assignments
CREATE POLICY "Admins manage role assignments" 
ON public.role_assignments FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
);
```

### 4.3 Provider Applications
```sql
ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;

-- Applicants view their own applications
CREATE POLICY "Applicants view own applications" 
ON public.provider_applications FOR SELECT 
USING (auth.uid() = user_id);

-- Authenticated users can submit applications for themselves
CREATE POLICY "Users can submit applications" 
ON public.provider_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id AND status = 'submitted');

-- Admins can view and review all applications
CREATE POLICY "Admins manage provider applications" 
ON public.provider_applications FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
);
```

### 4.4 Repair Requests & Itemized Quotes
```sql
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_quotes ENABLE ROW LEVEL SECURITY;

-- Customer can view and create their own repair requests
CREATE POLICY "Customers view own repair requests" 
ON public.repair_requests FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers create own repair requests" 
ON public.repair_requests FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Verified repair pros can view open repair requests
CREATE POLICY "Repair pros view triage queue" 
ON public.repair_requests FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'repair_pro' AND is_active = true)
);

-- Only customers and quoting providers can view specific quotes
CREATE POLICY "Parties view repair quotes" 
ON public.repair_quotes FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.repair_requests r 
        WHERE r.id = repair_request_id AND (r.customer_id = auth.uid() OR provider_id = auth.uid())
    )
);

-- Only verified repair pros can insert quotes
CREATE POLICY "Repair pros insert quotes" 
ON public.repair_quotes FOR INSERT 
WITH CHECK (
    auth.uid() = provider_id AND
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'repair_pro' AND is_active = true)
);
```

### 4.5 Recycling Requests & Collection Events
```sql
ALTER TABLE public.recycling_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_events ENABLE ROW LEVEL SECURITY;

-- Users view own requests; assigned recyclers view their jobs
CREATE POLICY "Users and assigned recyclers view requests" 
ON public.recycling_requests FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = assigned_recycler_id);

-- Certified recyclers can view pending recycling requests
CREATE POLICY "Recyclers view pending pool" 
ON public.recycling_requests FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'recycler' AND is_active = true)
);

-- Only certified recyclers can record collection events
CREATE POLICY "Recyclers log collection events" 
ON public.collection_events FOR INSERT 
WITH CHECK (
    auth.uid() = recycler_id AND
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'recycler' AND is_active = true)
);
```

### 4.6 Business Inventory Items
```sql
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Business sellers can view and manage their own inventory items
CREATE POLICY "Businesses manage own inventory" 
ON public.inventory_items FOR ALL 
USING (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'business' AND is_active = true)
);

-- Public can view wholesale items that are in stock
CREATE POLICY "Public view active wholesale items" 
ON public.inventory_items FOR SELECT 
USING (is_wholesale = true AND quantity > 0);
```

### 4.7 Device Passport Events
```sql
ALTER TABLE public.device_passport_events ENABLE ROW LEVEL SECURITY;

-- Public can view lifecycle events for any registered device
CREATE POLICY "Public view device passport events" 
ON public.device_passport_events FOR SELECT 
USING (true);

-- Authenticated users can insert events under their actor ID
CREATE POLICY "Authenticated users log passport events" 
ON public.device_passport_events FOR INSERT 
WITH CHECK (auth.uid() = actor_id);
```

### 4.8 Moderation Reports & Audit Logs
```sql
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can file reports
CREATE POLICY "Users can file reports" 
ON public.reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- Moderators and Admins view and action reports
CREATE POLICY "Moderators view and manage reports" 
ON public.reports FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role IN ('moderator', 'admin') AND is_active = true)
);

-- Only Admins can view complete system audit logs
CREATE POLICY "Admins view audit logs" 
ON public.audit_logs FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.role_assignments WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
);

-- Insertion into audit logs is allowed for all authenticated users to record their actions
CREATE POLICY "Authenticated users write audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (auth.uid() = actor_id);
```

---

## 5. Data Privacy & Storage Security

### 5.1 Storage Isolation & File Upload Security

All binary media (device photos, diagnostic logs, verification documents) stored in Supabase Storage buckets enforce strict path-prefix ownership:
- **Bucket `device-photos`:** Objects must be located at path `${auth.uid()}/${filename}`. Storage RLS ensures that write and delete actions are permitted only when the storage path matches the authenticated caller's UUID.
- **Bucket `verification-docs`:** Access is strictly restricted to the submitting user and authorized administrators. Public reads are denied.

### 5.2 Device Sanitization & PII Erasure Standard

Prior to physical handover, the **Safe Handover Protocol** validates the following sanitization standard:
1. NIST SP 800-88 Rev. 1 compliant Clear / Purge cryptographic erasure.
2. Unlinking of OEM cloud locks (Apple Activation Lock, Android FRP, Samsung Knox).
3. Physical removal and shredding/destruction of removable flash media (microSD).
4. Permanent deletion of cellular eSIM profiles.
