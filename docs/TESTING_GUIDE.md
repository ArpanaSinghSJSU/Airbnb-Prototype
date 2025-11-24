# Redux Integration Testing Guide

## Prerequisites

Before testing, you need to have the following services running:

### 1. Start Docker Desktop
Docker Desktop must be running to use MongoDB.

**Steps**:
1. Open Docker Desktop application on your Mac
2. Wait for Docker to fully start (whale icon in menu bar should be steady)
3. Verify Docker is running: `docker ps`

### 2. Start MongoDB

Once Docker is running:

```bash
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype
docker-compose up -d mongodb
```

**Verify MongoDB is running**:
```bash
docker ps | grep mongo
# Should show: gotour-mongodb container running on port 27017
```

### 3. Start Backend Server

In the project root directory:

```bash
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype

# Install dependencies (if not already done)
npm install

# Start the server
node server.js
```

**Expected Output**:
```
🚀 Server running on http://localhost:5002
✅ Connected to MongoDB successfully
```

### 4. Start Frontend

In a new terminal:

```bash
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype/frontend

# Install dependencies (if not already done)
npm install

# Start React app
npm start
```

**Expected Output**:
```
Compiled successfully!
Local: http://localhost:3000
```

---

## Test Cases

### Test 1: Redux Store Initialization ✅

**Objective**: Verify Redux store is properly configured

**Steps**:
1. Open browser to `http://localhost:3000`
2. Open DevTools (F12)
3. Go to Console tab
4. Type: `window.__REDUX_DEVTOOLS_EXTENSION__`

**Expected Result**: Should show Redux DevTools extension object (not undefined)

---

### Test 2: Login with JWT ✅

**Objective**: Test Redux authentication flow with JWT tokens

**Steps**:
1. Navigate to `http://localhost:3000`
2. Should redirect to `/login`
3. Open Redux DevTools (F12 → Redux tab)
4. Enter credentials:
   - Email: `jane@example.com`
   - Password: `password123`
5. Click "Log in"

**Expected Results**:
- ✅ Redux action dispatched: `auth/loginUser/pending`
- ✅ Redux action dispatched: `auth/loginUser/fulfilled`
- ✅ Redux state updated:
  ```json
  {
    "auth": {
      "user": { "id": "...", "name": "Jane Doe", "role": "traveler", ... },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "isAuthenticated": true,
      "loading": false,
      "error": null
    }
  }
  ```
- ✅ localStorage has `token` key
- ✅ Redirected to `/traveler/dashboard`
- ✅ Navbar shows user name and profile

**Verify JWT in Network Requests**:
1. Open DevTools → Network tab
2. Filter by XHR
3. Click any API request (e.g., bookings)
4. Check Request Headers
5. Should see: `Authorization: Bearer eyJhbGci...`

---

### Test 3: Token Persistence (Page Refresh) ✅

**Objective**: Verify JWT persists across page refreshes

**Steps**:
1. Login successfully (from Test 2)
2. Refresh the page (F5 or Cmd+R)
3. Watch Redux DevTools

**Expected Results**:
- ✅ Redux action dispatched: `auth/checkAuth/pending`
- ✅ Redux action dispatched: `auth/checkAuth/fulfilled`
- ✅ User remains logged in
- ✅ Redirected back to dashboard
- ✅ No login page shown

**What Happens Behind the Scenes**:
1. App loads, checks localStorage for token
2. If token exists, dispatches `checkAuth` action
3. Backend verifies JWT token
4. Backend returns fresh user data
5. Redux state restored

---

### Test 4: Protected Routes ✅

**Objective**: Verify routes are protected by authentication

**Steps**:
1. Logout (if logged in)
2. Try to navigate directly to: `http://localhost:3000/traveler/dashboard`

**Expected Results**:
- ✅ Redirected to `/login`
- ✅ Cannot access protected routes without authentication

**Try as Wrong Role**:
1. Login as traveler (`jane@example.com`)
2. Try to navigate to: `http://localhost:3000/owner/dashboard`

**Expected Results**:
- ✅ Redirected back to `/traveler/dashboard`
- ✅ Cannot access owner routes as traveler

---

### Test 5: Property Search (Redux State Management) ✅

**Objective**: Test property search using Redux

**Steps**:
1. Login as traveler
2. Navigate to "Search" page
3. Open Redux DevTools
4. Enter search criteria:
   - City: "Seattle"
   - Check-in: Tomorrow
   - Check-out: Next week
5. Click "Search"

**Expected Results**:
- ✅ Redux action: `property/searchProperties/pending`
- ✅ Redux action: `property/searchProperties/fulfilled`
- ✅ Redux state updated:
  ```json
  {
    "property": {
      "searchResults": [
        { "id": "...", "title": "...", "city": "Seattle", ... }
      ],
      "searchLoading": false
    }
  }
  ```
- ✅ Search results displayed on page
- ✅ Network tab shows JWT in Authorization header

---

### Test 6: Create Booking (Async Redux Action) ✅

**Objective**: Test booking creation with Redux

**Steps**:
1. Login as traveler
2. Search for properties
3. Click on a property to view details
4. Fill booking form:
   - Check-in: Tomorrow
   - Check-out: +3 days
   - Guests: 2
5. Open Redux DevTools
6. Click "Book Now"

**Expected Results**:
- ✅ Redux action: `booking/createBooking/pending`
- ✅ Redux action: `booking/createBooking/fulfilled`
- ✅ Redux state updated:
  ```json
  {
    "booking": {
      "myBookings": [
        { "id": "...", "status": "PENDING", ... }
      ],
      "currentBooking": { "id": "...", "status": "PENDING", ... },
      "loading": false
    }
  }
  ```
- ✅ Success message shown
- ✅ Booking appears in "My Bookings"

---

### Test 7: Favorites Management (Optimistic Updates) ✅

**Objective**: Test adding/removing favorites

**Steps**:
1. Login as traveler
2. Navigate to "Search"
3. Find a property
4. Open Redux DevTools
5. Click the heart icon (❤️) to favorite

**Expected Results**:
- ✅ Redux action: `property/addFavorite/pending`
- ✅ Heart icon fills immediately (optimistic update)
- ✅ Redux action: `property/addFavorite/fulfilled`
- ✅ Redux state updated:
  ```json
  {
    "property": {
      "favorites": [
        { "property_id": "...", ... }
      ]
    }
  }
  ```

**Remove Favorite**:
1. Click heart icon again
2. ✅ Redux action: `property/removeFavorite/pending`
3. ✅ Heart icon empties
4. ✅ Redux action: `property/removeFavorite/fulfilled`
5. ✅ Removed from Redux state

---

### Test 8: Profile Update with User Refresh ✅

**Objective**: Test profile update triggers user data refresh

**Steps**:
1. Login as any user
2. Navigate to Profile page
3. Open Redux DevTools
4. Update profile:
   - Name: "New Name"
   - Phone: "555-1234"
5. Click "Save Changes"

**Expected Results**:
- ✅ Profile saved successfully
- ✅ Redux action: `auth/refreshUser/pending`
- ✅ Redux action: `auth/refreshUser/fulfilled`
- ✅ Redux `auth.user` updated with new data
- ✅ Navbar shows new name

**Upload Profile Picture**:
1. Click "Choose File"
2. Select an image
3. Picture uploads
4. ✅ Redux action: `auth/refreshUser/fulfilled`
5. ✅ Navbar shows new profile picture immediately

---

### Test 9: Logout (Clear State) ✅

**Objective**: Test logout clears all Redux state

**Steps**:
1. Login successfully
2. Navigate around (create bookings, favorites, etc.)
3. Open Redux DevTools
4. Note the current state (should have user, bookings, favorites, etc.)
5. Click "Logout" in navbar

**Expected Results**:
- ✅ Redux action: `auth/logoutUser/pending`
- ✅ Redux action: `auth/logoutUser/fulfilled`
- ✅ Redux state cleared:
  ```json
  {
    "auth": {
      "user": null,
      "token": null,
      "isAuthenticated": false
    }
  }
  ```
- ✅ localStorage `token` removed
- ✅ Redirected to `/login`
- ✅ Cannot access protected routes

---

### Test 10: Error Handling (Invalid Token) ✅

**Objective**: Test 401 error handling with automatic logout

**Steps**:
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Manually corrupt the token:
   - Change `token` value to: `invalid-token-12345`
4. Try to navigate to any page (e.g., refresh or go to bookings)

**Expected Results**:
- ✅ API request fails with 401 Unauthorized
- ✅ Axios interceptor catches error
- ✅ Token removed from localStorage
- ✅ Redirected to `/login`
- ✅ Error message shown (optional)

---

## Redux DevTools Features to Try

### 1. Action List
- See all dispatched actions in chronological order
- Click any action to see its payload
- Color-coded by status (pending, fulfilled, rejected)

### 2. State Inspector
- View entire Redux state tree
- Expand/collapse objects
- See state before/after each action

### 3. Diff View
- Shows what changed in state
- Added items highlighted in green
- Removed items highlighted in red

### 4. Time-Travel Debugging
- Slider to jump to any previous state
- Click "Jump" button on any action
- App UI updates to show that state
- Great for debugging

### 5. Action Dispatch
- Manually dispatch actions from DevTools
- Test edge cases without UI interaction
- Example: Dispatch `auth/logout` to test logout

---

## Common Issues & Solutions

### Issue: "Token expired" error

**Solution**:
- JWT tokens expire after 7 days (configurable)
- Logout and login again to get fresh token
- Or implement refresh token flow

### Issue: Redux state resets on page refresh

**Solution**:
- Should not happen if token is in localStorage
- Check `App.js` has `checkAuth` in useEffect
- Verify token is valid (not expired)

### Issue: API requests missing Authorization header

**Solution**:
- Check axios interceptor in `api.js`
- Verify token exists in localStorage
- Check Network tab for header

### Issue: "Cannot read property of undefined" in Redux

**Solution**:
- Initial state might not match
- Check selectors are using optional chaining: `state.auth?.user`
- Verify reducer handles all action types

### Issue: Redux DevTools not showing

**Solution**:
- Install Redux DevTools browser extension
- Check `store.js` has `devTools: true`
- Reload page with DevTools open

---

## Performance Monitoring

### Redux Action Performance
Watch for slow actions in Redux DevTools:
- Login should complete in < 500ms
- Search should complete in < 1s
- Booking creation should complete in < 500ms

### Network Requests
Check Network tab for:
- Proper caching (304 Not Modified)
- Reasonable payload sizes
- No redundant requests

---

## Testing Checklist

- [ ] Docker Desktop is running
- [ ] MongoDB container is running
- [ ] Backend server is running on port 5002
- [ ] Frontend is running on port 3000
- [ ] Redux DevTools extension installed
- [ ] Can login with test credentials
- [ ] JWT token stored in localStorage
- [ ] Token persists after page refresh
- [ ] API requests include Authorization header
- [ ] Protected routes redirect to login
- [ ] Property search works
- [ ] Booking creation works
- [ ] Favorites add/remove works
- [ ] Profile update refreshes user data
- [ ] Logout clears state and redirects
- [ ] 401 errors trigger automatic logout

---

## Test Credentials

### Traveler Account
```
Email: jane@example.com
Password: password123
Role: traveler
```

### Owner Account
```
Email: john@example.com
Password: password123
Role: owner
```

---

## What to Look For in Redux DevTools

### Successful Login Flow
```
1. auth/loginUser/pending
   State: { loading: true, error: null }

2. auth/loginUser/fulfilled
   State: { 
     user: { id, name, email, role },
     token: "eyJ...",
     isAuthenticated: true,
     loading: false
   }
```

### Successful Search Flow
```
1. property/searchProperties/pending
   State: { searchLoading: true }

2. property/searchProperties/fulfilled
   State: { 
     searchResults: [...properties],
     searchLoading: false
   }
```

### Failed Action Flow
```
1. booking/createBooking/pending
   State: { loading: true }

2. booking/createBooking/rejected
   State: { 
     loading: false,
     error: "Booking dates overlap"
   }
```

---

## Quick Start Commands

```bash
# Terminal 1: Start MongoDB
docker-compose up -d mongodb

# Terminal 2: Start Backend
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype
node server.js

# Terminal 3: Start Frontend
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype/frontend
npm start
```

Then open `http://localhost:3000` and start testing!

---

## Need Help?

1. Check `PHASE2_COMPLETE.md` for detailed implementation docs
2. Check Redux DevTools for state and actions
3. Check browser console for errors
4. Check Network tab for API requests
5. Check backend logs for server errors

Happy Testing! 🚀

