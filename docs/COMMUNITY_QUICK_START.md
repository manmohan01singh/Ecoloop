# Community Feature - Quick Start Guide

## 🚀 Getting Started

### 1. Database Setup
Make sure your PostgreSQL database is running and migrations are complete:

```bash
cd backend
npm run seed
```

This creates all necessary tables including:
- Communities
- CommunityMembers
- Posts
- PostVotes
- Comments

### 2. Start the Backend
```bash
cd backend
npm start
```
Backend runs on: http://localhost:5000

### 3. Start the Frontend
```bash
cd ..
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 📱 User Flow

### Creating a Community
1. Navigate to `/communities`
2. Click "Buat Komunitas" (top right)
3. Fill in:
   - Name (3-50 characters, alphanumeric + spaces)
   - Description (optional, max 500 chars)
   - Category (choose from 13 options)
   - Privacy (Public or Private)
4. Click "Buat Komunitas"
5. Automatically redirects to community page

### Joining a Community
1. Browse communities at `/communities` OR
2. See popular communities sidebar on `/community`
3. Click on any community card
4. Click "Bergabung" button
5. Instantly joined (no approval for public communities)

### Creating a Post
1. Navigate to `/community`
2. Click "Buat Post" (top right) OR
3. From within a community, click "Buat Post"
4. Fill in:
   - Community (optional, dropdown of joined communities)
   - Title (required, max 300 chars)
   - Content (optional, markdown-ready)
   - Category
   - Flair (optional)
5. Click "Buat Post"
6. Redirects to post detail page

### Voting & Commenting
1. Click any post to view details
2. Use ↑ (upvote) or ↓ (downvote) arrows
3. Vote changes color when active
4. Score updates in real-time
5. Scroll down to add comments
6. Comments support nested replies

---

## 🎨 UI Components Reference

### Category Colors
Each category has a distinct color scheme:
- `recycling` → Green
- `repair` → Orange
- `ewaste` → Blue
- `plastic` → Cyan
- `textile` → Purple
- `sustainability` → Emerald
- `circular_business` → Indigo
- `waste_problems` → Red
- `food_organic` → Lime
- `general` → Gray

### Icons Used
- `Users` → Member count
- `MessageSquare` → Comments/posts
- `ArrowUp/ArrowDown` → Voting
- `Plus` → Create actions
- `Shield` → Verified badge
- `Lock` → Private community
- `Calendar` → Dates
- `Search` → Search functionality
- `Loader2` → Loading states

---

## 🔌 API Endpoints Quick Reference

### Communities
```
GET    /api/communities              # List all (public)
GET    /api/communities/:slug        # Get single (auth optional)
POST   /api/communities              # Create (auth required)
PUT    /api/communities/:id          # Update (admin only)
POST   /api/communities/:id/join     # Join (auth required)
DELETE /api/communities/:id/leave    # Leave (auth required)
GET    /api/communities/:id/members  # List members
```

### Posts
```
GET    /api/posts                    # List all (query: sort, category, communityId)
GET    /api/posts/:id                # Get single with comments
POST   /api/posts                    # Create (auth required)
POST   /api/posts/:id/vote           # Vote (auth required, body: {value: 1|-1|0})
POST   /api/posts/:id/comments       # Add comment (auth required)
DELETE /api/posts/:id                # Delete (auth required, author or mod)
```

---

## 🧪 Testing Scenarios

### Test 1: Create & Join Community
```
1. Register/login as user A
2. Navigate to /communities
3. Click "Buat Komunitas"
4. Create "Zero Waste Jakarta" community
5. Verify redirect to /community/zero_waste_jakarta
6. Logout
7. Login as user B
8. Navigate to /communities
9. Find "Zero Waste Jakarta"
10. Click and join
11. Verify member count incremented
```

### Test 2: Post & Vote Flow
```
1. Login as user A
2. Join any community
3. Navigate to /community/create-post
4. Select the community
5. Create post "Tips Daur Ulang Plastik"
6. Verify post appears in community
7. Login as user B
8. Navigate to the post
9. Upvote the post
10. Verify score increases to 1
11. Login as user C
12. Downvote the same post
13. Verify score is now 0
```

### Test 3: Comment Thread
```
1. Login and open any post
2. Add comment "Great tips!"
3. Logout and login as another user
4. Reply to the comment
5. Verify nested structure
6. Check original commenter got notification
```

---

## 🐛 Common Issues & Solutions

### Issue: "Community not found"
**Cause:** Accessing `/community/:slug` with wrong slug format  
**Solution:** Slugs are lowercase with underscores (e.g., `zero_waste` not `Zero Waste`)

### Issue: "Join community to post"
**Cause:** Trying to post to community without being a member  
**Solution:** Join the community first via "Bergabung" button

### Issue: Posts not showing
**Cause:** No posts in selected community or wrong filter  
**Solution:** Check post count on community header, try changing sort option

### Issue: Vote not working
**Cause:** Not logged in  
**Solution:** Authentication required for voting, toast will prompt login

### Issue: Can't create community
**Cause:** Name already taken or invalid characters  
**Solution:** Try different name, use only letters, numbers, spaces, underscores

---

## 📊 Database Queries (Troubleshooting)

### Check communities
```sql
SELECT id, name, slug, "memberCount", "postCount", category 
FROM "Communities" 
WHERE "deletedAt" IS NULL;
```

### Check memberships
```sql
SELECT cm.role, u.name as user_name, c.name as community_name
FROM "CommunityMembers" cm
JOIN "Users" u ON cm."userId" = u.id
JOIN "Communities" c ON cm."communityId" = c.id;
```

### Check posts
```sql
SELECT p.title, p.upvotes, p.downvotes, u.name as author, c.name as community
FROM "Posts" p
JOIN "Users" u ON p."authorId" = u.id
LEFT JOIN "Communities" c ON p."communityId" = c.id
WHERE p."isRemoved" = false
ORDER BY p."createdAt" DESC
LIMIT 10;
```

---

## 🎯 Feature Flags

Currently hardcoded, but you can modify:

### Sort Options (Community.jsx)
```javascript
const SORT_OPTIONS = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'Terbaru', icon: Clock },
  { value: 'top', label: 'Top', icon: TrendingUp },
  { value: 'discussed', label: 'Terdiskusi', icon: MessageSquare },
];
```

### Categories (Multiple files)
To add a new category:
1. Update Community model enum
2. Add to CATEGORIES array in CreatePost/CreateCommunity
3. Add color to CATEGORY_COLORS object
4. Run migration to update enum

---

## 🔐 Authorization Rules

### Public Actions (No Auth)
- ✅ Browse communities
- ✅ View posts
- ✅ Read comments

### Authenticated Actions
- ✅ Create community
- ✅ Join/leave community
- ✅ Create post
- ✅ Vote on posts
- ✅ Add comments

### Community Admin Only
- ✅ Update community settings
- ✅ Edit description, cover image
- ✅ Manage rules

### Author or Moderator
- ✅ Delete posts
- ✅ Delete comments

---

## 📞 Support & Resources

- **Backend Docs:** `docs/API_DESIGN.md`
- **Database Schema:** `docs/DATABASE_SCHEMA.md`
- **Status Report:** `docs/COMMUNITY_STATUS.md`
- **Main README:** `README.md`

---

**Happy Building! 🌱♻️**
