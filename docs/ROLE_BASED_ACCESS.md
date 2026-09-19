# Role-Based Access Control (RBAC) in EcoLoop

## 🔐 User Roles

### 1. **Regular User** (default)
- Standard platform access
- Green theme (emerald colors)
- Basic Leaf icon
- Can participate in all community features

### 2. **Moderator** (community-level)
- Manage posts in specific communities
- Blue badge indicator
- Shield icon
- Can delete inappropriate posts
- Can pin posts in their communities

### 3. **Admin** (platform-level)
- Full platform access
- Red theme accent
- Crown icon
- "Admin Mode" indicator
- Access to admin panel
- Can moderate all content
- Can verify locations, providers, reports

### 4. **Special Roles**
- `repair_provider` - Purple badge
- `business` - Indigo badge
- `recycler` - Green badge
- `organization` - Amber badge

---

## 🎨 Visual Differences

### **Regular User Interface:**
- ✅ Standard emerald/green color scheme
- ✅ Leaf icon in sidebar
- ✅ White top bar
- ✅ Regular border colors (gray)
- ✅ User icon in profile section
- ✅ Standard navigation menu

### **Admin Interface:**
- ✅ Red color accents
- ✅ Crown icon in sidebar and profile
- ✅ Red borders on sidebar
- ✅ Red-tinted top bar background
- ✅ "Admin Mode" text indicator
- ✅ Red badge next to username
- ✅ Admin Panel menu item (bottom of sidebar)
- ✅ Shield icon in top bar

---

## 📊 Feature Access Matrix

| Feature | User | Moderator | Admin |
|---------|------|-----------|-------|
| **General** |
| Browse communities | ✅ | ✅ | ✅ |
| Create posts | ✅ | ✅ | ✅ |
| Vote & comment | ✅ | ✅ | ✅ |
| Create community | ✅ | ✅ | ✅ |
| Join/leave community | ✅ | ✅ | ✅ |
| **Community Management** |
| Delete own posts | ✅ | ✅ | ✅ |
| Delete any post in community | ❌ | ✅ (own community) | ✅ (all) |
| Pin posts | ❌ | ✅ (own community) | ✅ (all) |
| Edit community settings | ❌ | ✅ (if community admin) | ✅ (all) |
| Manage members | ❌ | ✅ (own community) | ✅ (all) |
| **Admin Features** |
| Access admin panel | ❌ | ❌ | ✅ |
| Verify locations | ❌ | ❌ | ✅ |
| Verify providers | ❌ | ❌ | ✅ |
| Manage reports | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View platform stats | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |

---

## 🏗️ Implementation Details

### Sidebar Differences

#### Regular User Sidebar:
```
┌─────────────────────┐
│ 🍃 EcoLoop         │  ← Green Leaf
├─────────────────────┤
│ Navigation Items... │  ← Gray borders
│                     │
├─────────────────────┤
│ 👤 John Doe        │  ← User icon
│    john@email.com   │
│ 🚪 Logout          │
└─────────────────────┘
```

#### Admin Sidebar:
```
┌─────────────────────┐
│ 👑 EcoLoop         │  ← Red Crown
│    Admin Mode       │  ← Red text
├─────────────────────┤
│ Navigation Items... │  ← Red borders
│                     │
│ ─────────────────   │  ← Separator
│ 🛡️ Admin Panel     │  ← Red text, admin only
├─────────────────────┤
│ 👑 Admin User      │  ← Crown icon
│    admin@email.com  │
│    [Admin] badge    │  ← Red badge
│ 🚪 Logout          │
└─────────────────────┘
```

### Top Bar Differences

#### Regular User:
```
┌────────────────────────────────────┐
│ ☰  🍃 EcoLoop                     │  ← Gray border
└────────────────────────────────────┘
```

#### Admin:
```
┌────────────────────────────────────┐
│ ☰  👑 EcoLoop    🛡️ Admin Mode    │  ← Red tint + indicator
└────────────────────────────────────┘
```

---

## 🔒 Backend Authorization

### Middleware Protection

```javascript
// Admin-only routes
router.get('/admin/dashboard', authenticate, requireAdmin, getDashboard);

// Moderator or admin
router.delete('/posts/:id', authenticate, requireModeratorOrAdmin, deletePost);

// Community admin
router.put('/communities/:id', authenticate, requireCommunityAdmin, updateCommunity);
```

### Role Checks

```javascript
// Check if user is admin
const isAdmin = user?.role === 'admin';

// Check if user can moderate community
const isModerator = memberRole === 'moderator' || memberRole === 'admin' || user?.role === 'admin';

// Check if user owns content
const isOwner = content.authorId === user.id;

// Combined check
const canDelete = isOwner || isModerator;
```

---

## 🎯 Community-Level Roles

Each community has its own role system:

### **Member** (default)
- Can view posts
- Can vote and comment
- Can create posts in community

### **Moderator**
- All member permissions
- Can delete posts in community
- Can pin important posts
- Can manage reports within community
- Blue "Moderator" badge in community

### **Admin** (community creator)
- All moderator permissions
- Can edit community settings
- Can manage moderators
- Can delete community
- Red "Admin" badge in community
- Appears at top of member list

---

## 🚀 Admin Actions

### User Management
```
Admin can:
✅ View all users
✅ Change user roles (user ↔ moderator ↔ admin)
✅ Change verification status
✅ Ban/suspend users (future)
✅ View user activity logs (future)
```

### Content Moderation
```
Admin can:
✅ Delete any post/comment
✅ Remove inappropriate content
✅ Verify communities
✅ Pin platform-wide announcements
```

### Platform Management
```
Admin can:
✅ Verify locations
✅ Verify providers
✅ Review and resolve reports
✅ View platform statistics
✅ Manage system settings (future)
```

---

## 📱 Mobile View

### Regular User Mobile:
- Hamburger menu opens gray sidebar
- Standard green branding

### Admin Mobile:
- Hamburger menu opens red-bordered sidebar
- Crown icon visible
- "Admin" badge under logo
- Admin Panel visible at bottom

---

## 🔧 How to Assign Roles

### Via Database:
```sql
-- Make user an admin
UPDATE "Users" SET role = 'admin' WHERE email = 'user@example.com';

-- Make user a moderator
UPDATE "Users" SET role = 'moderator' WHERE email = 'user@example.com';

-- Reset to regular user
UPDATE "Users" SET role = 'user' WHERE email = 'user@example.com';
```

### Via Admin Panel:
1. Login as admin
2. Go to Admin Panel → Users tab
3. Find user in list
4. Change role dropdown
5. Automatically saved

### Community Roles:
```sql
-- Make user community admin
UPDATE "CommunityMembers" 
SET role = 'admin' 
WHERE "userId" = 'user-id' AND "communityId" = 'community-id';

-- Make user community moderator
UPDATE "CommunityMembers" 
SET role = 'moderator' 
WHERE "userId" = 'user-id' AND "communityId" = 'community-id';
```

---

## 🎨 Theme Colors

### Regular User Theme:
- Primary: `emerald-600` (#059669)
- Accent: `teal-600` (#0d9488)
- Borders: `gray-200` (#e5e7eb)
- Icons: Leaf, User

### Admin Theme:
- Primary: `red-600` (#dc2626)
- Accent: `red-500` (#ef4444)
- Borders: `red-200` (#fecaca)
- Icons: Crown, Shield
- Background tints: `red-50` (#fef2f2)

---

## ⚠️ Security Considerations

### Frontend Protection:
✅ Role-based UI hiding (cosmetic)
✅ Navigation guards
✅ Component-level permissions

### Backend Protection (CRITICAL):
✅ Middleware authentication
✅ Role verification on every request
✅ Database-level constraints
✅ Input validation
✅ Authorization checks before actions

**Note:** Frontend restrictions are for UX only. Real security is enforced on the backend!

---

## 📊 Role Badge Component

Usage in components:
```jsx
import RoleBadge from '../components/ui/RoleBadge';

// Display user role
<RoleBadge role={user.role} size="sm" />

// Examples:
<RoleBadge role="admin" />        // Red with Crown
<RoleBadge role="moderator" />     // Blue with Shield
<RoleBadge role="user" />          // Gray with User
```

---

## 🔄 Role Hierarchy

```
Platform Level:
Admin > Moderator > User

Community Level:
Community Admin > Community Moderator > Community Member

Combined:
Platform Admin > Community Admin > Community Moderator > Regular User
```

**Note:** Platform admins can moderate ALL communities, regardless of community role.

---

## ✨ Visual Indicators Summary

| Role | Color | Icon | Badge | Sidebar Border |
|------|-------|------|-------|----------------|
| User | Green | 🍃 Leaf | None | Gray |
| Moderator | Blue | 🛡️ Shield | Blue | Gray |
| Admin | Red | 👑 Crown | Red | Red |

---

## 🎯 Testing Different Roles

### Login Accounts:
```
Regular User:
Email: demo@ecoloop.com
Password: demo123

Admin User:
Email: admin@ecoloop.com
Password: admin123

Repair Provider:
Email: eko@ecoloop.com
Password: demo123
```

### What to Test:
1. **Regular User:**
   - Notice green theme
   - No admin panel in sidebar
   - Can't delete others' posts
   - Standard navigation

2. **Admin:**
   - Notice red theme accents
   - "Admin Mode" indicator visible
   - Admin panel at bottom of sidebar
   - Can delete any post
   - Crown icon everywhere

3. **Community Admin:**
   - Create a community (become admin)
   - See "Admin" badge in that community
   - Can manage that community
   - No platform-wide admin access

---

**Last Updated:** 2026-09-18  
**Features Implemented:** Visual distinction, role badges, admin indicators, moderation tools  
**Security Level:** Frontend + Backend protected  
**Status:** ✅ Production Ready
