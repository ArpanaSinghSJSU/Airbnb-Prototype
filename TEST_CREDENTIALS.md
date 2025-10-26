# Test Credentials

All sample users have the password: **`password123`**

## 🧳 Traveler Accounts

| Name | Email | Password |
|------|-------|----------|
| John Smith | john.traveler@example.com | password123 |
| Emma Johnson | emma.traveler@example.com | password123 |
| Michael Chen | michael.traveler@example.com | password123 |
| Sarah Williams | sarah.traveler@example.com | password123 |

## 🏠 Owner Accounts

| Name | Email | Password |
|------|-------|----------|
| Robert Martinez | robert.owner@example.com | password123 |
| Lisa Anderson | lisa.owner@example.com | password123 |
| David Thompson | david.owner@example.com | password123 |
| Jennifer Lee | jennifer.owner@example.com | password123 |

## 📊 Sample Data Included

The database has been initialized with:
- **8 users** (4 travelers + 4 owners)
- **8 properties** (various types and locations)
- **11 bookings** (in different states: PENDING, ACCEPTED, CANCELLED)
- **12 favorites** (travelers have favorited various properties)

## 🧪 Testing Flows

### Test Traveler Flow
1. Login as **john.traveler@example.com** / **password123**
2. Search for properties
3. View property details and book
4. Check "My Bookings" to see existing bookings
5. View favorites
6. Check history for past trips

### Test Owner Flow
1. Login as **robert.owner@example.com** / **password123**
2. View dashboard statistics
3. Check "My Properties" (Robert owns 2 properties)
4. Go to "Manage Bookings" to see booking requests
5. Accept or reject pending bookings
6. Add a new property

## 🔧 Important Fixes Applied

### API Service Updates
- Fixed `bookingAPI.getMyBookings()` method (was `getTravelerBookings`)
- Fixed `bookingAPI.getPropertyBookings()` method (was `getOwnerBookings`)
- Added `bookingAPI.reject()` method
- Added `ownerAPI.getMyProperties()` method
- Added `ownerAPI.createProperty()` method
- Added `ownerAPI.deleteProperty()` method

### Backend Route Fix
- Fixed route order in `propertyRoutes.js` (specific routes before parameterized routes)
- This ensures `/properties/owner/properties` works correctly

## 🚀 Quick Start

1. Make sure backend is running: `npm start` (from project root)
2. Make sure frontend is running: `npm start` (from frontend folder)
3. Visit http://localhost:3000
4. Use any of the credentials above to login and test!

## 🐛 Issues Fixed

1. ✅ **Invalid login credentials** - Updated password hashes in database
2. ✅ **Empty bookings page** - Fixed API method names mismatch
3. ✅ **Route conflicts** - Fixed route order in property routes

Your bookings should now appear correctly! 🎉

