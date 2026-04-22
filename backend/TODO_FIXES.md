# Dashboard Error Fixes - Implementation Plan

## Status: Starting Step 1/5

**1. Fix BSON Version (CRITICAL - blocks all DB ops)**
- Install mongodb@^6.8.0 driver
```
cd careconnect-hub/backend && npm install mongodb@^6.8.0
```
- Why: Mongoose 8.7 needs bson 6.x, native driver bundled version mismatches

**2. dashboardController.js - Add null guards + Mongoose**
- `if (!req.auth?.id) return 401`
- Replace globalThis.*Collection → globalThis.User.findById etc.

**3. authMiddleware.js - Strengthen validation**
- Check `if (!decoded.id)`

**4. Other controllers - Mongoose consistency**
- appointmentController.js, tokenController.js

**5. Test & Restart**
- npm start
- curl -H 'Authorization: Bearer <token>' http://localhost:5001/api/dashboard

**Progress: 0/5 complete**
