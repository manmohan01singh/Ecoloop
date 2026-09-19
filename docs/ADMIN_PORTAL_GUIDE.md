# EcoLoop Admin Portal Guide

## 🛡️ Admin Dashboard Overview

The **Admin Portal** is a protected area accessible only to users with `admin` role. It provides comprehensive platform management capabilities.

---

## 📍 How to Access

### Navigation
1. **Login** with an admin account
2. Look for **"🛡️ Admin Panel"** at the **bottom of the sidebar**
   - It appears in **red** color with a divider line above it
   - Only visible to users with `role: 'admin'`

### Direct URL
- **Admin Dashboard:** http://localhost:5173/admin

### Security
- ✅ Protected route - redirects non-admins to `/dashboard`
- ✅ Role-based access control
- ✅ Sidebar item only visible to admin users

---

## 🎛️ Admin Dashboard Tabs

The admin portal has **5 main tabs**:

### 1. **Overview Tab** 📊
**Purpose:** High-level platform statistics

**Displays:**
- Total users count
- Total communities
- Total posts
- Total locations
- Total providers
- Total reports
- Recent activity summary
- Platform growth metrics

**Actions:** View-only dashboard

---

### 2. **Pengguna (Users) Tab** 👥
**Purpose:** User management

**Displays:**
- List of all registered users (paginated, 30 per page)
- User details: Name, Email, Role, Verification status, Karma
- Registration date
- Account status

**Actions:**
- ✅ **Update user role** (dropdown)
  - Options: `user`, `moderator`, `admin`
- ✅ **Change verification status** (dropdown)
  - Options: `unverified`, `community_verified`, `admin_verified`
- ⚠️ **Ban/Suspend** (planned - not yet implemented)

**Use Cases:**
- Promote active users to moderators
- Verify user accounts manually
- Upgrade users to admin role
- Monitor user registration trends

---

### 3. **Lokasi (Locations) Tab** 🗺️
**Purpose:** Location verification management

**Displays:**
- List of **pending locations** submitted by users
- Location details:
  - Name, type (recycling center, waste bank, etc.)
  - Address, coordinates
  - Submitter info
  - Operating hours, contact
  - Current verification status

**Actions:**
- ✅ **Approve location** → Sets `verificationStatus` to `admin_verified`
- ✅ **Reject location** → Sets status to `rejected`
- 🔄 Real-time list update after action

**Verification Statuses:**
- `unverified` - Just submitted, pending review
- `community_verified` - Upvoted by 10+ users
- `admin_verified` - Approved by admin ✅
- `rejected` - Rejected by admin ❌

**Use Cases:**
- Verify legitimate waste management locations
- Remove fake or duplicate submissions
- Ensure map accuracy
- Quality control for location database

---

### 4. **Provider Tab** 🔧
**Purpose:** Service provider verification

**Displays:**
- List of **pending service providers** (repair shops, waste collectors)
- Provider details:
  - Business name
  - Service type
  - Location
  - Contact information
  - Certification/documents (if uploaded)
  - User who registered the provider

**Actions:**
- ✅ **Verify provider** → Sets `verificationStatus` to `verified`
- ✅ **Reject provider** → Sets status to `rejected`
- 🔄 List updates after action

**Provider Types:**
- Repair shops
- Waste collectors
- Recycling facilities
- E-waste handlers

**Use Cases:**
- Verify legitimate businesses
- Prevent spam/fraudulent listings
- Build trusted provider network
- Quality assurance for repair services

---

### 5. **Laporan (Reports) Tab** ⚠️
**Purpose:** User-submitted issue reports management

**Displays:**
- List of **pending waste/environmental reports**
- Report details:
  - Title, description
  - Category (illegal dumping, overflowing bins, etc.)
  - Location coordinates
  - Photos (if uploaded)
  - Severity level
  - Reporter info
  - Upvote count (community validation)
  - Current status

**Actions:**
- ✅ **Update status** → Change between:
  - `reported` - Initial submission
  - `under_review` - Admin investigating
  - `verified` - Confirmed legitimate issue
  - `resolved` - Issue fixed
  - `rejected` - False report or duplicate
- ✅ **Add admin note** → Internal notes for tracking

**Status Colors:**
- 🟡 `reported` - Yellow
- 🔵 `under_review` - Blue
- 🟣 `verified` - Purple
- 🟢 `resolved` - Green
- ⚫ `rejected` - Gray

**Use Cases:**
- Coordinate with authorities on waste issues
- Track problem resolution
- Filter out spam reports
- Respond to community concerns
- Generate environmental impact data

---

## 🔧 Admin API Endpoints

All admin endpoints are in `/api/admin/` and require authentication + admin role:

```
GET  /api/admin/dashboard              # Overview statistics
GET  /api/admin/users                  # List all users (paginated)
PUT  /api/admin/users/:id              # Update user role/status
GET  /api/admin/locations/pending      # Pending locations
PUT  /api/admin/locations/:id/verify   # Approve/reject location
GET  /api/admin/providers/pending      # Pending providers
PUT  /api/admin/providers/:id/verify   # Approve/reject provider
GET  /api/admin/reports/pending        # Pending reports
PUT  /api/reports/:id/status           # Update report status
```

---

## 👤 Creating an Admin User

### Option 1: Direct Database Update
```sql
UPDATE "Users" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Option 2: Register + Upgrade
1. Register a new account normally
2. Login to PostgreSQL
3. Run the SQL command above
4. Logout and login again to refresh role

### Option 3: Seed Script (Development)
Modify `backend/src/seed.js` to create an admin user:
```javascript
await User.create({
  name: 'Admin User',
  email: 'admin@ecoloop.com',
  password: await bcrypt.hash('admin123', 10),
  role: 'admin',
  verificationStatus: 'admin_verified',
});
```

Then run:
```bash
cd backend
npm run seed
```

---

## 🎯 Admin Workflows

### Workflow 1: Location Verification
```
1. User submits new location via /map
2. Location appears with status "unverified"
3. Community can upvote (10+ = "community_verified")
4. Admin reviews in Locations tab
5. Admin clicks "Approve" or "Reject"
6. Status updates to "admin_verified" or "rejected"
7. Verified locations appear on map with verified badge
```

### Workflow 2: Provider Onboarding
```
1. Business owner registers provider via /repair
2. Provider submitted with status "pending"
3. Admin reviews business details
4. Admin verifies legitimacy (check documents, contact)
5. Admin clicks "Verify" or "Reject"
6. Verified providers appear in repair services list
7. Users can book repair services with verified providers
```

### Workflow 3: Report Management
```
1. User submits waste problem report via /reports
2. Report appears with status "reported"
3. Admin reviews in Reports tab
4. Admin changes status to "under_review"
5. Admin coordinates with local authorities
6. Issue gets resolved
7. Admin updates status to "resolved" + adds note
8. Reporter gets notification of resolution
```

### Workflow 4: User Moderation
```
1. User joins platform (role: "user")
2. User becomes active community member
3. Admin promotes to "moderator" role
4. Moderator can manage posts in communities
5. If needed, admin can verify user account manually
6. Admin can also ban problematic users (future feature)
```

---

## 📊 Statistics & Metrics

The **Overview tab** provides key metrics:

### Platform Health
- Total registered users
- User growth rate
- Active users (last 30 days)

### Community Activity
- Total communities created
- Total posts published
- Total comments
- Voting activity

### Environmental Impact
- Verified locations count
- Reports submitted
- Reports resolved
- Provider network size

### Content Moderation
- Pending verifications (locations + providers)
- Pending reports
- Flagged content (future feature)

---

## 🔐 Security & Permissions

### Role Hierarchy
```
admin > moderator > user
```

### Admin Capabilities
- ✅ Full platform access
- ✅ User management
- ✅ Content verification
- ✅ Report management
- ✅ System configuration (future)
- ✅ Analytics access

### Moderator Capabilities (Community-Level)
- ✅ Delete posts/comments in their communities
- ✅ Pin posts
- ✅ Manage community rules
- ⚠️ Cannot access admin panel
- ⚠️ Cannot verify locations/providers

### Regular User
- ❌ No admin access
- ❌ Cannot verify content
- ✅ Can submit locations/reports
- ✅ Can upvote for community verification

---

## 🚧 Future Admin Features (Planned)

### Content Moderation
- 🔲 Flagged posts/comments review
- 🔲 Bulk actions (delete, approve)
- 🔲 Content filtering rules
- 🔲 Automated spam detection

### User Management
- 🔲 Ban/suspend users
- 🔲 View user activity logs
- 🔲 Search users by email/name
- 🔲 Bulk role updates

### Analytics Dashboard
- 🔲 Growth charts
- 🔲 Engagement metrics
- 🔲 Geographic distribution
- 🔲 Export data to CSV

### System Configuration
- 🔲 Platform settings editor
- 🔲 Email templates
- 🔲 Notification preferences
- 🔲 Feature flags

### Community Management
- 🔲 Featured communities
- 🔲 Verify communities
- 🔲 Dissolve inactive communities
- 🔲 Transfer ownership

---

## 📱 Admin Panel UI/UX

### Design Features
- 🎨 Red accent color (vs emerald for regular users)
- 🛡️ Shield icon for admin-specific features
- 📑 Tab-based navigation
- 📊 Card-based statistics
- 🎯 Quick action buttons
- 🔄 Real-time updates
- 📱 Responsive design

### Visual Indicators
- **Red buttons** = Admin actions
- **Shield icon** = Admin-only content
- **Checkmark** = Verified/approved
- **X icon** = Rejected/removed
- **Clock icon** = Pending review

---

## 🐛 Troubleshooting

### Issue: "Cannot access /admin"
**Cause:** User doesn't have admin role  
**Solution:** Update user role in database:
```sql
UPDATE "Users" SET role = 'admin' WHERE id = 'your-user-id';
```

### Issue: "Admin Panel link not visible"
**Cause:** User role not properly set or not logged in  
**Solution:** 
1. Check user role in database
2. Logout and login again to refresh session
3. Clear browser cache

### Issue: "Pending items not showing"
**Cause:** No pending items exist  
**Solution:** 
1. Submit test location/provider as regular user
2. Check database for `verificationStatus = 'unverified'`

### Issue: "Actions not working"
**Cause:** Backend API error or network issue  
**Solution:**
1. Check browser console for errors
2. Verify backend is running
3. Check API endpoint responses
4. Review backend logs

---

## 📞 Admin Support

### Database Queries for Admins

Check pending verifications:
```sql
-- Pending locations
SELECT * FROM "Locations" WHERE "verificationStatus" = 'unverified';

-- Pending providers
SELECT * FROM "Providers" WHERE "verificationStatus" = 'pending';

-- Pending reports
SELECT * FROM "Reports" WHERE status IN ('reported', 'under_review');
```

View admin users:
```sql
SELECT id, name, email, role FROM "Users" WHERE role = 'admin';
```

Platform statistics:
```sql
-- Total users
SELECT COUNT(*) FROM "Users";

-- Total communities
SELECT COUNT(*) FROM "Communities";

-- Total posts
SELECT COUNT(*) FROM "Posts" WHERE "isRemoved" = false;
```

---

## ✅ Admin Checklist

Daily tasks:
- [ ] Review pending location verifications
- [ ] Review pending provider verifications
- [ ] Check new reports for urgent issues
- [ ] Monitor user registrations

Weekly tasks:
- [ ] Review resolved reports
- [ ] Check platform statistics
- [ ] Identify inactive providers
- [ ] Review user feedback

Monthly tasks:
- [ ] Audit admin actions
- [ ] Review growth metrics
- [ ] Clean up rejected submissions
- [ ] Update community guidelines

---

**Admin Portal Status:** ✅ Fully Functional  
**Last Updated:** 2026-09-18  
**Current Admin Features:** Overview, Users, Locations, Providers, Reports  
**Future Features:** 5+ planned enhancements  
**Access Level:** Admin only (`role: 'admin'`)
