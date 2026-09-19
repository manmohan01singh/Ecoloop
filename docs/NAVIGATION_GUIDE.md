# EcoLoop Navigation Guide

## 🧭 Where to Find the Community Feature

### For Non-Logged In Users (Public Pages)

#### **Top Header Navigation**
When you visit the homepage at http://localhost:5173/, you'll see the header with these links:

```
┌─────────────────────────────────────────────────────┐
│  🍃 EcoLoop  |  Home  Community  Communities  Features  Impact  |  Login  Get Started  │
└─────────────────────────────────────────────────────┘
```

**Click on:**
- **"Community"** → Go to `/community` (Main feed with all posts)
- **"Communities"** → Go to `/communities` (Browse all communities)

---

### For Logged-In Users (Protected Pages)

#### **Left Sidebar Navigation**
Once you login and access the dashboard, you'll see a full sidebar menu:

```
┌─────────────────┐
│  🍃 EcoLoop     │
├─────────────────┤
│ 📊 Dashboard    │
│ 📱 Devices      │
│ 📈 Impact       │
│ 👥 Community    │ ← NEW!
│ 📦 Marketplace  │
│ 🗺️  Map         │
│ 🔧 Repair       │
│ 🏆 Challenges   │
│ 📅 Events       │
│ ⚠️  Reports      │
│ 🏢 Business     │
│ 📊 Eco Impact   │
├─────────────────┤
│ 👤 User Profile │
│ 🚪 Logout       │
└─────────────────┘
```

**Click on "👥 Community"** in the sidebar to access the community feed.

---

## 📍 All Community-Related Pages

### 1. **Main Community Feed** 
**URL:** `/community`  
**Navigation:** Sidebar → "Community" OR Header → "Community"  
**Features:**
- View all posts from all communities
- Sort by: Hot, New, Top, Discussed
- Upvote/downvote posts
- See popular communities in sidebar
- "Buat Post" button to create posts

### 2. **Browse All Communities**
**URL:** `/communities`  
**Navigation:** Header → "Communities"  
**Features:**
- Grid view of all communities
- Search communities by name
- Filter by category
- See member counts and post counts
- "Buat Komunitas" button to create new community

### 3. **Community Detail Page**
**URL:** `/community/:slug` (e.g., `/community/zero_waste_jakarta`)  
**Navigation:** Click any community name from the feed or communities list  
**Features:**
- Community header with cover image
- Join/Leave button
- View all posts from this specific community
- Community info sidebar (rules, stats)

### 4. **Create Post**
**URL:** `/community/create-post`  
**Navigation:** 
- From main feed: Click "Buat Post" button (top right)
- From community detail: Click "Buat Post" button  
**Features:**
- Choose community (optional)
- Write title and content
- Select category
- Add flair

### 5. **Create Community**
**URL:** `/community/create`  
**Navigation:** From `/communities` page, click "Buat Komunitas" button  
**Features:**
- Name your community
- Add description
- Choose category
- Set public/private

### 6. **Post Detail**
**URL:** `/community/post/:id`  
**Navigation:** Click any post title from the feed  
**Features:**
- Full post view
- Upvote/downvote
- Read all comments
- Add comments
- Nested replies

---

## 🎯 Quick Access Paths

### Path 1: Browse & Join a Community
```
Home → Communities → Click a community card → Join → Create Post
```

### Path 2: Create Your Own Community
```
Login → Communities → Buat Komunitas → Fill form → Submit
```

### Path 3: Post to Feed
```
Login → Community (sidebar) → Buat Post → Choose community → Submit
```

### Path 4: Engage with Posts
```
Community Feed → Click post → Read → Vote → Comment
```

---

## 📱 Mobile Navigation

On mobile devices, the navigation works differently:

### Before Login
1. Tap the **☰ Menu** icon (top right)
2. Menu drops down showing:
   - Home
   - Community ← NEW!
   - Communities ← NEW!
   - Features
   - Login
   - Get Started

### After Login
1. Tap the **☰ Menu** icon (top left)
2. Sidebar slides in showing all 12 menu items including Community

---

## 🔍 Search & Discovery

### Finding Communities
1. Go to `/communities`
2. Use the **search bar** to search by name
3. Use the **category dropdown** to filter
4. Click any community card to view details

### Finding Posts
1. Go to `/community` 
2. Use **sort options**: Hot, New, Top, Discussed
3. Click **category tags** to filter by category
4. Browse **popular communities** in the right sidebar

---

## 💡 Pro Tips

1. **Quick Post Creation**: The "Buat Post" button appears in both the main feed and within community pages
2. **Community Context**: When creating a post from within a community page, that community is auto-selected
3. **Popular Communities**: The right sidebar on `/community` shows the top 8 communities by member count
4. **Direct Links**: You can bookmark specific communities like `/community/zero_waste` for quick access
5. **Category Navigation**: Click category pills to filter posts (functionality to be fully implemented)

---

## 🚀 Getting Started Checklist

- [ ] Visit http://localhost:5173/
- [ ] Click "Community" in the header
- [ ] Browse existing posts
- [ ] Click "Communities" to see all communities
- [ ] Register/Login to unlock full features
- [ ] After login, see "Community" in the sidebar
- [ ] Create your first community
- [ ] Join other communities
- [ ] Create your first post
- [ ] Vote and comment on posts

---

## 🎨 Visual Cues

Look for these icons to identify community features:

- 👥 **Users icon** = Community/Members
- 💬 **Message Square** = Posts/Comments
- ⬆️ **Arrow Up** = Upvote
- ⬇️ **Arrow Down** = Downvote
- ➕ **Plus icon** = Create (Post/Community)
- 🔍 **Search icon** = Search functionality
- 🛡️ **Shield icon** = Verified community
- 🔒 **Lock icon** = Private community

---

**Navigation Updated:** 2026-09-18  
**New Sidebar Items:** 9 additional menu items  
**Public Header:** Community links added  
**Mobile Menu:** Community links added
