# ECOLOOP — SYSTEM ARCHITECTURE SPECIFICATION
## The Role-Based Circular Electronics Ecosystem

**Document Version:** 2.0.0  
**Status:** Production-Grade Baseline  
**Date:** October 2026  
**Platforms:** Expo SDK 57 (React Native 0.86, React 19, TypeScript 6) | Supabase & PostgreSQL 16

---

## 1. Executive System Overview & Vision

The electronics industry produces over 62 million metric tonnes of electronic waste annually, with fewer than 22% documented as formally collected and recycled. The primary bottlenecks preventing circular recovery are:
1. **Information Asymmetry:** Consumers lack objective diagnostic guidance on whether a device is repairable, valuable for resale, or hazardous.
2. **Fragmented Stakeholder Silos:** Consumers, repair technicians, certified recyclers, refurbished device businesses, and regulators operate on disparate, uncoordinated tools.
3. **Pervasive Counterfeit & Data Privacy Fears:** Buyers distrust refurbished hardware provenance, and sellers fear personal data leakage during handovers.

**EcoLoop** solves these structural failures through **One Connected Circular Platform with Six Modular Operational Workspaces**. Rather than requiring separate mobile applications or unverified third-party websites, EcoLoop implements a unified identity model where a single authenticated user can hold multiple verified capabilities, fluidly transitioning between workspaces backed by PostgreSQL Row Level Security (RLS) and real-time state machines.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ECOLOOP APPLICATION SHELL                             │
│                  (Expo SDK 57 / React Native 0.86 / React 19)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                               WORKSPACE ROUTER                                  │
│                 Role-Based Context Switching & Permissions Engine               │
├─────────────┬─────────────┬─────────────┬─────────────┬───────────┬─────────────┤
│  Consumer   │  Repair Pro │  Recycler   │  Business   │ Moderator │    Admin    │
│  Workspace  │  Workspace  │  Workspace  │  Workspace  │ Workspace │  Workspace  │
├─────────────┴─────────────┴─────────────┴─────────────┴───────────┴─────────────┤
│                           CIRCULAR CORE SERVICES                                │
│   Circular Decision Engine  │  Device Passport Ledger  │  Safe Handover System  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                      DUAL-LAYER DATA & PERSISTENCE                              │
│   Supabase Postgres 16 (RLS + Auth)  ◄──►  Local Reactive Storage & Pub/Sub     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture & Topology

### 2.1 Technology Stack & Architectural Layers

| Layer | Component | Version / Specification | Rationale & Responsibility |
| :--- | :--- | :--- | :--- |
| **Mobile Runtime** | React Native / Expo | Expo SDK 57.0.28, RN 0.86.3 | Cross-platform native execution (iOS, Android, Web) with new React 19 concurrent renderer. |
| **Language & Typings** | TypeScript | 6.0.3 (Strict Mode) | Zero-defect type enforcement across domain models, repositories, and state machines. |
| **Design System** | Custom Apple HIG Tokens | Light/Dark Dynamic System | 4/8pt spacing grid, Apple SF-inspired typography, emerald accent tokens, WCAG AAA contrast. |
| **Permissions Service** | `permissionsService.ts` | Capability-Based RBAC | Real-time capability resolution, workspace switching, and application review. |
| **Data Layer (Cloud)** | Supabase PostgreSQL | PostgreSQL 16.x + RLS | Relational integrity, server-side tenant isolation, immutable audit logs. |
| **Data Layer (Local)** | `localPersistence.ts` | Reactive Storage Engine | Zero-latency offline caching, optimistic updates, and cross-component pub/sub broadcast. |
| **Safety Engine** | `decisionEngine.ts` | Algorithmic Diagnostics | Swollen battery lockout, carbon diversion estimation, and repair vs. resale triage. |

---

## 3. Multi-Role Identity & Permissions Model

### 3.1 Unified Identity Architecture

A user in EcoLoop registers once via Supabase Authentication, creating a primary identity record in `public.profiles`. Rather than assigning a single static role enum to the user, EcoLoop implements a **Decoupled Capability Architecture**:

```sql
profiles (id, email, full_name, avatar_url, default_role)
    ├── role_assignments (user_id, role, organization_id, is_active)
    ├── organization_members (organization_id, user_id, role)
    └── provider_applications (user_id, application_type, status)
```

1. **System Roles:**
   - `consumer`: Default capability granted to every authenticated user.
   - `repair_pro`: Granted upon verification of repair business registration and technical credential review.
   - `recycler`: Granted upon R2v3, e-Stewards, or municipal environmental licensing verification.
   - `business`: Granted upon business registration number validation for bulk inventory sellers.
   - `moderator`: Granted by administrators for trust, safety, and listing integrity triage.
   - `admin`: Platform operational capability with unrestricted oversight and audit log access.

2. **Capability Resolution Matrix:**
   When any workspace or action is accessed, `permissionsService.getPermissions(userId)` computes an active capability set:

   | Capability Flag | Consumer | Repair Pro | Recycler | Business | Moderator | Admin |
   | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
   | `canBrowseExplore` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
   | `canPostListing` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
   | `canQuoteRepairs` | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
   | `canProcessEwaste` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
   | `canManageInventory`| ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
   | `canModerate` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
   | `canAdminister` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.2 Provider Application & Verification Lifecycle

Unprivileged consumers who wish to provide commercial repair or recycling services initiate an application via `ProviderApplicationModal.tsx`:

```
┌───────────┐    Submit Application    ┌─────────────┐
│   Draft   │ ───────────────────────► │  Submitted  │
└───────────┘                          └──────┬──────┘
                                              │ Admin Reviews Documents
                                              ▼
                                      ┌───────────────┐
                                      │ Under Review  │
                                      └───────┬───────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
                 ┌──────────────┐                            ┌──────────────┐
                 │   Approved   │                            │   Rejected   │
                 └──────┬───────┘                            └──────────────┘
                        │
                        ▼ (Atomic Transaction)
        1. Grant role in `role_assignments`
        2. Create entry in `provider_profiles`
        3. Notify applicant via Activity Ledger
```

---

## 4. The Six Operational Workspaces

### 4.1 Consumer Workspace
- **Home Hub (`HomeScreen.tsx`):** Circular tools spotlight, category navigation, embodied carbon tracker, quick-action routing (Repair, Recycle, Sell, Buy).
- **Marketplace (`ExploreScreen.tsx`):** Search, category filtering, condition grades (A+, A, B, C, For Parts), environmental CO2 diversion badges.
- **Post a Device Journey (`PostDeviceScreen.tsx`):** Multi-step listing creation with condition assessment, image attachments, and immediate marketplace registration.
- **Activity Ledger (`ActivityScreen.tsx`):** Chronological, categorized notification ledger tracking transaction updates, quotes received, and circular impact milestones.
- **Profile & Preferences (`ProfileScreen.tsx`):** Account details, Appearance modes (System, Light, Dark), Workspace Switcher access, and Provider Application entry.

### 4.2 Repair Specialist Workspace (`RepairProWorkspace.tsx`)
- **Triage Queue:** Unquoted customer repair tickets filtered by device category, urgency (standard vs. express), and geographic vicinity.
- **Itemized Quoting Engine:** Dynamic quote modal allowing technicians to specify:
  - Parts replacement cost (USD/CAD)
  - Certified labor cost
  - Diagnostic and intake fee
  - Estimated turnaround time (days)
  - Service warranty duration (e.g., 90 days, 180 days)
  - Detailed diagnostic repair plan
- **Active Repair Jobs State Machine:**
  `submitted` ➔ `quoted` ➔ `accepted` ➔ `scheduled` ➔ `in_progress` ➔ `completed`.

### 4.3 Certified Recycler Workspace (`RecyclerWorkspace.tsx`)
- **Collection Request Queue:** E-waste disposal requests sorted by device category, quantity, and hazardous battery warnings.
- **Verified Scale Intake:** Technicians log physical intake events with measured scale weight (kg), hazardous material handling notes, and processing stages (`dismantled`, `materials_recovered`, `certified_destruction`).
- **Digital Disposal Certificates:** Automatic issuance of cryptographic, tamper-evident Certificates of Responsible Recycling (e.g., `CERT-RCY-2026-XXXX`).

### 4.4 Business & Electronics Seller Workspace (`BusinessWorkspace.tsx`)
- **Inventory Management:** Centralized stock ledger tracking SKU, device category, brand, model, condition grade, unit price, and refurbished inspection status.
- **Wholesale Lot Management:** B2B wholesale flags with minimum order quantity (MOQ) controls.
- **Bulk CSV Importer:** High-performance, schema-validated importer capable of parsing hundreds of inventory rows with real-time error reporting and rollback protection.

### 4.5 Trust & Moderation Workspace (`ModeratorWorkspace.tsx`)
- **Flagged Report Triage:** Queue of user-reported listings and actors tagged with violations (`spam`, `counterfeit`, `hazardous_item`, `prohibited_device`, `fraud`).
- **Enforcement Suite:** Action execution (`warning_issued`, `content_hidden`, `content_removed`, `user_suspended`, `escalated_to_admin`) requiring mandatory written justification.
- **Audit Compliance:** Every moderator intervention records an immutable entry into `moderation_actions` and `audit_logs`.

### 4.6 Platform Operations & Administrator Workspace (`AdminWorkspace.tsx`)
- **Circular Telemetry:** Live aggregate platform metrics (total devices diverted, aggregate e-waste mass in kilograms, verified CO2 diverted in kilograms).
- **Application Verification Console:** Complete review suite for repair, recycler, and business partner applications with document inspection and one-click role provisioning.
- **Access Governance:** Manual role assignment and revocation management console.
- **Platform Audit Trail:** Comprehensive system log viewer showing actor IDs, timestamps, affected entities, and JSON metadata.

---

## 5. Circular Domain Engines & Trust Primitives

### 5.1 Circular Decision Engine (`decisionEngine.ts`)

The Circular Decision Engine implements an algorithmic assessment matrix that guides users to the environmentally and economically optimal pathway:

```
                        Input Device Data
                (Category, Age, Functional State,
                  Physical Screen/Body, Battery)
                                │
                                ▼
                     Hazardous Battery Check
                 (Swollen, Leaking, Punctured?)
                                │
                 ┌──────────────┴──────────────┐
              YES│                             │NO
                 ▼                             ▼
        CRITICAL LOCKOUT              Evaluate Economics
     Force Certified E-Waste        • Market Resale Value
    Lock Out Resale & Repair       • Estimated Repair Cost
                                    • CO2 Embodied Factor
                                               │
                                               ▼
                                      Compare Resale vs Repair
                                      Net Repair > Resale As-Is?
                                               │
                                ┌──────────────┴──────────────┐
                             YES│                             │NO
                                ▼                             ▼
                         PRIORITIZE REPAIR             PRIORITIZE RESALE / RECYCLE
```

### 5.2 Circular Device Passport (`DevicePassportModal.tsx`)

The Device Passport serves as an immutable lifecycle ledger for any electronic asset, indexed by IMEI, serial number, or marketplace listing UUID.

Each event includes:
- `eventType`: `first_listed`, `ownership_transfer`, `reported_repair`, `verified_repair`, `parts_replaced`, `refurbishment_inspection`, `recycler_collected`, `responsibly_processed`.
- `verificationTier`:
  1. `user_reported`: Self-declared by consumer.
  2. `provider_reported`: Logged by registered provider.
  3. `evidence_backed`: Accompanied by diagnostic logs, receipts, or test reports.
  4. `certified`: Issued by licensed OEM, R2v3 recycler, or certified technician.

### 5.3 Interactive Safe Handover Protocol (`SafeHandoverModal.tsx`)

To eliminate physical theft, transaction disputes, and data leakage, EcoLoop provides a 6-step interactive checklist:
1. **Cloud & Anti-Theft Disconnect:** Disabling iCloud / Google Factory Reset Protection (FRP).
2. **Cryptographic Factory Wipe:** Executing verified hardware-level sanitization.
3. **Physical Media Extraction:** Removal of SIM and microSD cards.
4. **Physical Battery Integrity Inspection:** Visual verification that battery has no swelling or seam separation.
5. **Functional Inspection Checklist:** Screen touch responsiveness, camera, charging port, and audio tests.
6. **Mutual Verification Code Exchange:** One-time cryptographic confirmation pin between parties.

---

## 6. Persistence & Data Flow Architecture

EcoLoop utilizes a **Hybrid Dual-Layer Persistence Strategy**:

1. **Remote Cloud Layer (Supabase PostgreSQL):**
   - Authoritative source of truth for all multi-user interactions, transactions, and audit logs.
   - Enforced by PostgreSQL Row Level Security (RLS) ensuring strict tenant isolation.
   - Database foreign keys with cascading updates and deletes where appropriate.

2. **Local Reactive Persistence Layer (`localPersistence.ts`):**
   - In-memory cache backed by asynchronous storage keys.
   - Reactive pub/sub pattern (`subscribeTo*`) allowing zero-delay optimistic UI re-rendering.
   - Full mock and offline fallback fixtures guaranteeing immediate development and demo readiness.

3. **Workspace Data Repositories (`workspaceRepositories.ts`):**
   - High-level domain services orchestrating business logic, validation, ID generation, and dual-layer synchronization.

---

## 7. UI/UX & Design System Architecture

EcoLoop adheres strictly to the **Apple Human Interface Guidelines (HIG)**:
- **Spatial Grid:** Rigid 4pt/8pt increments across all padding, margins, and component dimensions.
- **Color Token Architecture:** Semantic color tokens (`labelPrimary`, `labelSecondary`, `labelTertiary`, `tint`, `background`, `cardElevated`) maintaining identical keys across Light and Dark themes.
- **Lighting & Depth:** Subtle emerald ambient glows in dark mode (`rgba(16, 185, 129, 0.20)`) and tinted soft shadows in light mode.
- **Accessible Touch Targets:** Minimum 44×44pt touch bounding boxes on all buttons, selectors, and interactive rows.
- **Fluid Layouts:** Full support for dynamic safe-area insets (`useSafeAreaInsets`) across mobile devices and web viewports.
