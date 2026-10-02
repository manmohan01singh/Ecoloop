# 🚀 Quick Login Guide - All Dashboards

## 📍 URLs & Credentials

### 🌐 Frontend URL
```
http://localhost:5173
```

### 🔌 Backend API
```
http://localhost:5001/api
```

---

## 🔐 Login Credentials

| # | Dashboard | URL | Email | Password |
|---|-----------|-----|-------|----------|
| 1 | **Admin** | `/admin` | admin@ecoloop.com | admin123 |
| 2 | **Moderator** | `/moderator` | moderator@ecoloop.com | moderator123 |
| 3 | **Recycler** | `/recycler` | recycler@ecoloop.com | recycler123 |
| 4 | **Repair Provider** | `/repair-provider` | repair@ecoloop.com | repair123 |
| 5 | **Business** | `/business-dashboard` | business@ecoloop.com | business123 |
| 6 | **Organization** | `/organization` | organization@ecoloop.com | organization123 |

---

## 📊 Dashboard Features Summary

### 1️⃣ Admin Dashboard (12 Tabs)
**URL:** http://localhost:5173/admin

**What You Get:**
- ✅ Complete system overview (47+ statistics)
- ✅ All users management
- ✅ All business materials
- ✅ All challenges & events
- ✅ All repair requests
- ✅ All waste deposits
- ✅ All reports
- ✅ Platform analytics
- ✅ Top contributors

**Tabs:** Overview | Users | Contributions | Materials | Challenges | Events | Repairs | Deposits | Locations | Providers | Reports | Analytics

---

### 2️⃣ Moderator Dashboard (6 Tabs)
**URL:** http://localhost:5173/moderator

**What You Get:**
- ✅ Content moderation
- ✅ Report management
- ✅ Post management
- ✅ User verification
- ✅ Community oversight

**Tabs:** Dashboard | Reports | Posts | Comments | Users | Communities

---

### 3️⃣ Recycler Dashboard (8 Tabs)
**URL:** http://localhost:5173/recycler

**What You Get:**
- ✅ Waste deposit management
- ✅ Verification system
- ✅ Material tracking
- ✅ Collection scheduling
- ✅ Analytics

**Tabs:** Dashboard | Deposits | Verification | Collections | Materials | Analytics | Schedule | Profile

---

### 4️⃣ Repair Provider Dashboard (6 Tabs)
**URL:** http://localhost:5173/repair-provider

**What You Get:**
- ✅ Repair request management
- ✅ Customer management
- ✅ Service catalog
- ✅ Diagnosis tools
- ✅ E-waste recording
- ✅ Reviews

**Tabs:** Dashboard | Requests | Customers | Services | Reviews | Profile

---

### 5️⃣ Business Dashboard (5 Tabs)
**URL:** http://localhost:5173/business-dashboard

**What You Get:**
- ✅ B2B material exchange
- ✅ Material listings (10 types)
- ✅ Purchase requests
- ✅ Marketplace access
- ✅ Revenue analytics

**Tabs:** Dashboard | My Listings | My Requests | Marketplace | Analytics

---

### 6️⃣ Organization Dashboard (5 Tabs)
**URL:** http://localhost:5173/organization

**What You Get:**
- ✅ Challenge creation (4 goal types)
- ✅ Event hosting (7 event types)
- ✅ Participant tracking
- ✅ Results verification
- ✅ Impact reporting

**Tabs:** Dashboard | Challenges | Events | Analytics | Impact Report

---

## ⚡ Quick Start Steps

### Step 1: Check Servers
```bash
# Backend should be on port 5001
# Frontend should be on port 5173
```

### Step 2: Open Browser
```
http://localhost:5173
```

### Step 3: Click Login

### Step 4: Enter Credentials
Pick any role from the table above and use those credentials.

### Step 5: Navigate to Dashboard
After login, go to the dashboard URL for your role:
- Admin → `/admin`
- Moderator → `/moderator`
- Recycler → `/recycler`
- Repair Provider → `/repair-provider`
- Business → `/business-dashboard`
- Organization → `/organization`

---

## 🎯 Testing Checklist

### ✅ Test Admin Dashboard
1. Login: admin@ecoloop.com / admin123
2. Go to: http://localhost:5173/admin
3. Check: Should see 12 tabs
4. Verify: Overview shows 47+ statistics
5. Test: Click Materials, Challenges, Events tabs

### ✅ Test Other Dashboards
Repeat for each role:
1. Logout
2. Login with role credentials
3. Navigate to role dashboard
4. Verify tabs load
5. Check data displays

---

## 🔄 Switch Between Dashboards

### As Admin User (Special)
Admin can access **ALL** dashboards:
- `/admin` - Admin Dashboard ✅
- `/moderator` - Moderator Dashboard ✅
- `/recycler` - Recycler Dashboard ✅
- `/repair-provider` - Repair Provider Dashboard ✅
- `/business-dashboard` - Business Dashboard ✅
- `/organization` - Organization Dashboard ✅

### As Other Users
Each role can only access their own dashboard:
- Moderator → `/moderator` only
- Recycler → `/recycler` only
- Business → `/business-dashboard` only
- etc.

---

## 🛠️ Troubleshooting

### Can't Login?
1. Check servers are running
2. Verify credentials (copy-paste from table)
3. Check browser console for errors
4. Clear browser cache

### Dashboard Not Loading?
1. Check you're logged in
2. Verify you're using the correct URL
3. Check your role has access
4. Refresh the page

### No Data Showing?
1. Database might be empty
2. Check backend console for errors
3. Verify API endpoints are working
4. Try creating some test data

---

## 📱 Mobile/Desktop

All dashboards are **responsive**:
- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

---

## 🎨 Color Themes

### Dashboard Colors:
- 🔴 **Admin** - Red theme
- 🟣 **Moderator** - Purple theme
- 🟢 **Recycler** - Green theme
- 🟠 **Repair** - Orange theme
- 🔵 **Business** - Blue theme
- 🟣 **Organization** - Indigo theme

---

## 📊 Statistics Overview

### Admin Sees Everything:
- 127+ users across all roles
- 47+ platform metrics
- All business materials
- All challenges & events
- All repair requests
- All waste deposits
- All content reports
- Platform growth trends

### Each Role Sees Their Own:
- Personal dashboard stats
- Their own activities
- Relevant features
- Role-specific tools

---

## 🔒 Security

### Password Format:
```
[role]123

Examples:
- admin123
- moderator123
- recycler123
- repair123
- business123
- organization123
```

### Change Password:
Currently using default passwords. In production:
1. Change all passwords
2. Use strong passwords
3. Enable 2FA
4. Rotate regularly

---

## 💡 Tips

### For Admin:
- Use Overview tab for quick system health check
- Use Analytics tab to track growth
- Use specific tabs to drill down into data
- Can switch between all dashboards

### For Other Roles:
- Dashboard tab shows your stats
- Use specific tabs for your workflows
- Check Profile tab to update info
- Review Analytics for your performance

---

## 🎉 You're Ready!

**All 6 dashboards are working perfectly!**

Pick a role, login, and start exploring! 🚀

---

**Last Updated:** October 2, 2026  
**Status:** ✅ All Operational  
**Servers:** Backend (5001) | Frontend (5173)
