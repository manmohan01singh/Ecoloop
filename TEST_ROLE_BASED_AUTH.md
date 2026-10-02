# Test Plan: Role-Based Authentication System

## Quick Test Checklist

### ✅ Registration Tests

#### Test 1: Register as Regular User
```
1. Navigate to: http://localhost:5173/register
2. Fill form:
   - Name: Test User
   - Email: testuser@example.com
   - Password: test123
   - Role: Regular User
3. Submit
4. Expected: Redirect to /dashboard
5. Expected: No error toasts
```

#### Test 2: Register as Recycler
```
1. Navigate to: http://localhost:5173/register
2. Fill form:
   - Name: Test Recycler
   - Email: testrecycler@example.com
   - Password: test123
   - Role: Recycler
3. Submit
4. Expected: Redirect to /recycler
5. Expected: No error toasts
```

#### Test 3: Register as Repair Provider
```
1. Navigate to: http://localhost:5173/register
2. Fill form:
   - Name: Test Repair
   - Email: testrepair@example.com
   - Password: test123
   - Role: Repair Provider
3. Submit
4. Expected: Redirect to /repair-provider
5. Expected: No error toasts
```

#### Test 4: Register as Business
```
1. Navigate to: http://localhost:5173/register
2. Fill form:
   - Name: Test Business
   - Email: testbusiness@example.com
   - Password: test123
   - Role: Business
3. Submit
4. Expected: Redirect to /business-dashboard
5. Expected: No error toasts
```

#### Test 5: Register as Organization
```
1. Navigate to: http://localhost:5173/register
2. Fill form:
   - Name: Test NGO
   - Email: testngo@example.com
   - Password: test123
   - Role: Organization/NGO
3. Submit
4. Expected: Redirect to /organization
5. Expected: No error toasts
```

---

### ✅ Login Tests with Existing Accounts

#### Test 6: Login as Admin
```
1. Navigate to: http://localhost:5173/login
2. Credentials:
   - Email: admin@ecoloop.com
   - Password: admin123
3. Submit
4. Expected: Redirect to /admin
5. Expected: No error toasts
6. Expected: Dashboard loads without errors
```

#### Test 7: Login as Moderator
```
1. Navigate to: http://localhost:5173/login
2. Credentials:
   - Email: moderator@ecoloop.com
   - Password: moderator123
3. Submit
4. Expected: Redirect to /moderator
5. Expected: No error toasts
6. Expected: Dashboard loads with empty data gracefully
```

#### Test 8: Login as Recycler
```
1. Navigate to: http://localhost:5173/login
2. Credentials:
   - Email: recycler@ecoloop.com
   - Password: recycler123
3. Submit
4. Expected: Redirect to /recycler
5. Expected: No error toasts
6. Expected: Dashboard shows empty stats gracefully
```

#### Test 9: Login as Repair Provider
```
1. Navigate to: http://localhost:5173/login
2. Credentials:
   - Email: repair@ecoloop.com
   - Password: repair123
3. Submit
4. Expected: Redirect to /repair-provider
5. Expected: No error toasts
6. Expected: Dashboard loads without error toasts
```

#### Test 10: Login as Business
```
1. Navigate to: http://localhost:5173/login
2. Credentials:
   - Email: business@ecoloop.com
   - Password: business123
3. Submit
4. Expected: Redirect to /business-dashboard
5. Expected: No error toasts
6. Expected: Dashboard loads gracefully
```

#### Test 11: Login as Organization
```
1. Navigate to: http://localhost:5173/login
2. Credentials:
   - Email: organization@ecoloop.com
   - Password: organization123
3. Submit
4. Expected: Redirect to /organization
5. Expected: No error toasts
6. Expected: Dashboard shows challenges and events properly
```

---

### ✅ Dashboard Navigation Tests

#### Test 12: Recycler Dashboard Tabs
```
1. Login as recycler@ecoloop.com
2. Navigate through all tabs:
   - Dashboard
   - Requests
   - Pickups
   - Collections
   - Drives
   - Organizations
   - Impact
   - Profile
3. Expected: No "Failed to load" toasts
4. Expected: Empty states shown gracefully
5. Expected: Console logs only (no user-facing errors)
```

#### Test 13: Moderator Dashboard Tabs
```
1. Login as moderator@ecoloop.com
2. Navigate through all tabs:
   - Dashboard
   - Reports
   - Posts
   - Comments
   - Users
   - Communities
3. Expected: No "Failed to load" toasts
4. Expected: Empty states shown gracefully
5. Expected: Stats show 0 values gracefully
```

#### Test 14: Organization Dashboard
```
1. Login as organization@ecoloop.com
2. Check:
   - Challenges tab shows 5 challenges
   - Events tab shows 10 events
   - Impact summary loads without errors
3. Expected: No error toasts
4. Expected: Data displays correctly
```

---

### ✅ Error Handling Tests

#### Test 15: API Failure Handling
```
1. Login to any dashboard
2. Open browser console
3. Check network tab for failed requests
4. Expected: Failed API calls don't show toast errors
5. Expected: Console.log messages appear instead
6. Expected: Empty data states displayed to user
```

#### Test 16: Invalid Login
```
1. Navigate to: http://localhost:5173/login
2. Try invalid credentials:
   - Email: wrong@email.com
   - Password: wrong123
3. Submit
4. Expected: Error toast "Invalid email or password"
5. Expected: Stay on login page
```

#### Test 17: Duplicate Email Registration
```
1. Navigate to: http://localhost:5173/register
2. Try to register with existing email:
   - Email: admin@ecoloop.com
3. Submit
4. Expected: Error toast "Email already registered"
5. Expected: Stay on register page
```

---

### ✅ Role Dropdown UI Tests

#### Test 18: Role Selection Helper Text
```
1. Navigate to: http://localhost:5173/register
2. Change role dropdown and verify helper text:
   - Regular User → "Track devices and participate in community"
   - Recycler → "Manage recycling operations and collections"
   - Repair Provider → "Offer repair services to the community"
   - Business → "B2B material exchange and trading"
   - Organization/NGO → "Host events and challenges for the community"
   - Moderator → "Moderate content and manage reports"
3. Expected: Helper text changes dynamically
4. Expected: UI is responsive and clear
```

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ No "Failed to load dashboard" error toasts
- ✅ Proper role-based redirection after login/register
- ✅ Graceful empty states when data unavailable
- ✅ Console logs for debugging (not user-facing errors)
- ✅ All 6 existing role accounts work correctly
- ✅ New registrations redirect to correct dashboards
- ✅ Professional, clean user experience

---

## 🐛 Common Issues (None Expected)

If you encounter any issues:
1. Check browser console for actual errors
2. Verify backend is running on port 5001
3. Verify frontend is running on port 5173
4. Check database connection
5. Verify Redis is running

---

## 📊 Expected Results Summary

| Test Category | Tests | Expected Pass |
|---------------|-------|---------------|
| Registration | 5 | ✅ 5/5 |
| Login | 6 | ✅ 6/6 |
| Dashboard Navigation | 3 | ✅ 3/3 |
| Error Handling | 3 | ✅ 3/3 |
| UI Tests | 1 | ✅ 1/1 |
| **TOTAL** | **18** | **✅ 18/18** |

---

**All systems operational and ready for testing!** 🚀
