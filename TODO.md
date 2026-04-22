# Role-Based Dashboard with Admin Seeding - Implementation Plan

## Completed: 1/5

### 1. [x] Create TODO.md ✅ 
### 2. [x] Seed Admin User ✅
- Edit `backend/config/database.js`
- Added admin seed logic: samar@gmail.com / samarpreet (bcrypt hash), role: 'admin'

### 3. [x] Fix Login Hardcode ✅
- Edit `backend/controllers/authController.js`
- Changed 'drsamar@gmail.com' → 'samar@gmail.com' in login role override

### 4. [x] Update Server Console Hint ✅
- Edit `backend/server.js`
- Changed admin login message to new credentials

### 5. [ ] Test & Verify
- Backend: `npm start` (or restart)
- Frontend: `npm run dev`
- Test register patient → /dashboard
- Test admin login samar@gmail.com/samarpreet → /admin (all data visible)
- Check MongoDB collections

### 6. [ ] Complete Task


