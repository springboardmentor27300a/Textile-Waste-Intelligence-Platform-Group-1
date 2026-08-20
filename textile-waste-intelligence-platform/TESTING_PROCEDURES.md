# Recycling Dashboard API Fix - Test & Deployment Checklist

## ✅ Issues Fixed

1. ✓ **Vite Proxy Configuration** - Added `/api` proxy to route requests to backend
2. ✓ **Error Handling** - Enhanced frontend to detect and report specific error types
3. ✓ **Frontend Build** - Rebuilt successfully with no errors
4. ✓ **Backend Status** - Verified API returns JSON (not HTML)

---

## 📋 Pre-Testing Checklist

Before testing, ensure:

- [ ] Backend code has no syntax errors: `python -m py_compile backend/routes/recycling.py`
- [ ] Frontend build succeeds: `npm run build` (no errors)
- [ ] Both servers can be started
- [ ] Port 8000 (backend) is available
- [ ] Port 5173 (frontend dev) is available

---

## 🚀 Quick Start Testing

### Terminal 1: Start Backend
```bash
cd C:\Projects\textile_waste_platform\backend
python main.py
```

**Expected Output:**
```
Initializing Textile Waste Intelligence Platform SQL Database...
SQLAlchemy: Database tables verified/created.
Successfully seeded default admin: madhulikagoddumarri@gmail.com
Successfully seeded default inventory dataset.
```

### Terminal 2: Start Frontend
```bash
cd C:\Projects\textile_waste_platform\frontend
npm run dev
```

**Expected Output:**
```
VITE v5.4.4  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🧪 Dashboard Testing Procedures

### Test 1: Dashboard Loads Without Errors
1. Open `http://localhost:5173` in browser
2. Click "Admin Login"
3. Enter credentials:
   - Email: `madhulikagoddumarri@gmail.com`
   - Password: `123456789`
4. Click Login
5. Navigate to `/recycling-dashboard` (via sidebar or direct URL)

**Expected Result**: Dashboard loads with real inventory data (4 seeded records)
- [ ] No "Error loading dashboard" message
- [ ] No red error banner
- [ ] Real data displays from database

### Test 2: Verify API Response is JSON (Not HTML)
1. Keep dashboard open
2. Open Browser DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Find request to `/api/recycling/dashboard`
6. Click on it
7. Go to Response tab

**Expected Result**: Response is valid JSON
```json
{
  "success": true,
  "summary": { ... },
  "inventory": [
    { "batch_id": "B-COT88", "fabric_type": "Cotton", ... },
    { "batch_id": "B-DEN45", "fabric_type": "Denim", ... },
    ...
  ]
}
```

**NOT**: `<!doctype html>` or any HTML code

### Test 3: Inventory Data Display
1. Look at "Waste Inventory" section
2. Should show a table with 4 rows (seeded data)

**Expected Data:**
| Batch ID | Material | Quantity | Condition | Status |
|----------|----------|----------|-----------|--------|
| B-COT88 | Cotton | 250.0 kg | Reusable | Recycled |
| B-DEN45 | Denim | 180.0 kg | Recyclable | Collected |
| B-POL02 | Polyester | 120.0 kg | Damaged | Processing |
| B-WOO71 | Wool | 90.0 kg | Reusable | Pending |

### Test 4: KPI Cards Display Correct Calculations
1. Look at top KPI cards (Total Batches, Total Weight, etc.)

**Expected Values (from seeded data):**
- Total Batches: 4
- Total Weight: 640.0 kg
- Processing Rate: Check calculation is correct
- Recovery %: Based on recyclable materials

### Test 5: Search Functionality
1. In search box, type "COT"
2. Table should filter to show only "B-COT88"
3. Clear search box, all 4 records should appear again

**Expected Result**:
- [ ] Search filters records in real-time
- [ ] No API errors when searching
- [ ] Clear search shows all records

### Test 6: Filter Functionality
1. **Material Filter**: Select "Cotton"
   - Expected: Only B-COT88 shown
2. **Status Filter**: Select "Recycled"
   - Expected: Only B-COT88 shown (status=Recycled)
3. **Clear Filters**: Click to reset
   - Expected: All 4 records shown

**Expected Result**:
- [ ] Filters work correctly
- [ ] API is called with filter parameters
- [ ] Results update without page refresh

### Test 7: Sort Functionality
1. Click on "Quantity" column header
2. Table should sort by quantity (ascending)
3. Click again, should sort descending

**Expected Order (ascending):**
1. B-WOO71 (90.0 kg)
2. B-POL02 (120.0 kg)
3. B-DEN45 (180.0 kg)
4. B-COT88 (250.0 kg)

### Test 8: Batch Details Modal
1. Click the "View" icon (👁️) on any batch row
2. Modal should open showing full batch details

**Expected Modal Content:**
- Batch ID
- Fabric Type
- Quantity
- Condition
- Processing Status
- Collection Date
- Recyclability Score
- Other details

- [ ] Modal opens without errors
- [ ] Data displays correctly
- [ ] Close button works

### Test 9: Refresh Button
1. Click "Refresh Data" button
2. Loading state should appear briefly
3. Data should reload from backend

- [ ] Refresh button works
- [ ] Loading indicator shows
- [ ] Data updates

### Test 10: Report Download
1. Click "Download Full Report" button
2. Select PDF
3. File should download as `recycling-dashboard-report.pdf`
4. Repeat for Excel format

- [ ] PDF downloads successfully
- [ ] Excel downloads successfully
- [ ] Files are not empty

### Test 11: Charts Display
1. Scroll down to see charts
2. Look for:
   - Processing by Material (bar chart)
   - Processing Status (pie chart)
   - Material Analytics (bar chart)
   - Status Analytics (donut chart)

- [ ] All charts render without errors
- [ ] Charts show real data
- [ ] No console errors

---

## 🔍 Error Handling Tests

### Test 12: Missing Authentication
1. Open DevTools Console
2. Run: `localStorage.removeItem('twip_token')`
3. Refresh dashboard
4. Should redirect to login or show auth error

**Expected**: 401 error handling works

### Test 13: Invalid Token
1. Set invalid token: `localStorage.setItem('twip_token', 'invalid_token')`
2. Refresh dashboard

**Expected**: "Invalid or expired user token" error message

### Test 14: Backend Not Running
1. Stop backend server (Ctrl+C in backend terminal)
2. Refresh dashboard
3. Should show error: "Backend unavailable" or similar

**Expected**: Network error handling works

---

## 📊 Verification Checklist

After completing all tests, verify:

- [ ] Dashboard loads without "Error loading dashboard"
- [ ] API response is JSON (not HTML) in DevTools
- [ ] All 4 seeded inventory records display
- [ ] KPI calculations are correct
- [ ] Search filters data correctly
- [ ] Filter dropdowns work
- [ ] Sort functionality works
- [ ] Batch details modal opens
- [ ] Charts render with data
- [ ] Refresh button works
- [ ] Report downloads work (PDF & Excel)
- [ ] Error handling shows proper messages
- [ ] No console errors (F12 → Console)
- [ ] No network errors (F12 → Network)

---

## 🎯 Expected Console Output (No Errors)

**Browser Console (F12):**
Should be empty or only show React warnings (not errors)

**Backend Terminal Output:**
```
Initializing Textile Waste Intelligence Platform SQL Database...
SQLAlchemy: Database tables verified/created.
Successfully seeded default admin: madhulikagoddumarri@gmail.com
Successfully seeded default inventory dataset.
INFO:     Started server process [XXXX]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🚨 Troubleshooting

### Issue: Still Getting "Error loading dashboard"

**Step 1: Check Backend**
```bash
# Verify backend is running
curl -H "Authorization: Bearer test" http://127.0.0.1:8000/api/recycling/dashboard
```
Should return JSON (not connection refused)

**Step 2: Check DevTools Network Tab**
1. F12 → Network tab
2. Look for request to `/api/recycling/dashboard`
3. Check:
   - Response Status (should be 2xx, 401, or 403)
   - Response Content-Type (should be `application/json`)
   - Response Body (should be JSON, not HTML)

**Step 3: Check Console Errors**
1. F12 → Console tab
2. Look for error messages
3. Full error text will help identify issue

**Step 4: Restart Services**
```bash
# Kill and restart frontend
Ctrl+C in frontend terminal
npm run dev

# Kill and restart backend
Ctrl+C in backend terminal
python main.py
```

**Step 5: Clear Cache**
- Clear browser cache (Ctrl+Shift+Del)
- Clear localStorage: `localStorage.clear()` in console
- Restart browser

### Issue: Getting HTML Response Instead of JSON

**This means the Vite proxy is not working:**
1. Verify `frontend/vite.config.js` has proxy configuration
2. Restart frontend dev server: `npm run dev`
3. Clear browser cache
4. Check that backend is accessible: `curl http://127.0.0.1:8000/docs`

### Issue: 403 Forbidden Error

**Possible causes:**
1. User role not authorized (only Admins and Recycling Operators allowed)
2. Using wrong account (use admin account)
3. Backend role check failing

**Solution:**
- Login with admin: `madhulikagoddumarri@gmail.com` / `123456789`
- Check backend logs for role information

### Issue: 404 Not Found

**Means endpoint doesn't exist:**
1. Verify backend `routes/recycling.py` has the endpoint
2. Verify `main.py` includes recycling router
3. Check endpoint path is exactly `/api/recycling/dashboard`

---

## 📝 Files Changed Summary

| File | Change | Reason |
|------|--------|--------|
| `frontend/vite.config.js` | Added proxy config | Route `/api/` to backend |
| `frontend/src/pages/RecyclingDashboard.jsx` | Enhanced error handling | Detect and report JSON parse errors |

---

## ✅ Final Status

- **Backend Endpoint**: `GET /api/recycling/dashboard` ✓ Working
- **Frontend Proxy**: Vite config ✓ Configured
- **Error Handling**: Enhanced ✓ Implemented
- **Frontend Build**: ✓ Success (no errors)
- **Real Data**: ✓ 4 seeded inventory records available

**Ready to test!**

---

## Next Steps

1. ✓ Start both servers
2. ✓ Run through all 14 tests
3. ✓ Verify all expected results
4. ✓ Check no errors in console
5. **→** If all tests pass: Ready for production deployment
6. **→** If any tests fail: Check troubleshooting section

---

**Created**: 2026-08-14  
**Status**: Ready for Testing
