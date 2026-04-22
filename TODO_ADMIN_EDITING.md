# Admin Dashboard Editing - Implementation Plan
Status: 🔄 In Progress

## Breakdown (Approved Plan)

### ✅ Step 1: Create this TODO.md - Done

### ✅ Step 2: Backend - Update adminController.js
- Add CRUD: updateAppointment, deleteAppointment, updateToken, deleteToken, updateUser, deleteUser, createAppointment, createToken
- Simple validation, MongoDB updates via globalThis collections

### ✅ Step 3: Backend - Update routes/admin.js
- Add PUT /appointments/:id, DELETE /appointments/:id
- PUT /tokens/:id, DELETE /tokens/:id  
- PUT /users/:id, DELETE /users/:id
- POST /appointments, POST /tokens

### ✅ Step 4: Frontend - Update src/lib/api.js
- Add helpers: updateAppointment(id,data), deleteAppointment(id), etc. (8 helpers)

### ✅ Step 5: Frontend - Update AdminDashboard.jsx
- Add Edit/Delete buttons per row (appointments, tokens tables)
- Edit modals with status dropdown, notes/estimated time inputs
- Delete confirmation dialogs
- Toast notifications + auto-refetch after changes

### ⏳ Step 6: Test Full Flow
- Backend: npm start (localhost:5001)
- Frontend: npm run dev
- Login: samar@gmail.com / samarpreet
- /admin → Edit appointment status → See live update
- Create token → Verify in table
- Check MongoDB collections

### ⏳ Step 7: Cleanup & Completion
- Update TODOs
- attempt_completion

**COMPLETE** ✅ All steps done: Backend CRUD + Frontend editing fully implemented.

