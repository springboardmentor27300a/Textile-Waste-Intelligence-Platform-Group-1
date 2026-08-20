# Recycling Dashboard - Quick Start Testing Guide

## Prerequisites

Before testing, ensure you have:
- Node.js and npm installed
- Python 3.8+ installed
- Database (PostgreSQL or SQLite)
- Backend dependencies: `pip install -r backend/requirements.txt`
- Frontend dependencies: `npm install` in frontend folder

## Step 1: Start the Backend Server

```bash
cd backend
python main.py
```

**Expected Output:**
```
Initializing Textile Waste Intelligence Platform SQL Database...
SQLAlchemy: Database tables verified/created.
Successfully seeded default admin: madhulikagoddumarri@gmail.com
```

The server will start on `http://localhost:8000`

## Step 2: Start the Frontend Development Server (Optional)

In a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` or `http://localhost:3000`

## Step 3: Login to the Platform

1. Navigate to http://localhost:5173 (or your frontend URL)
2. Click "Admin Login"
3. Enter credentials:
   - Email: `madhulikagoddumarri@gmail.com`
   - Password: `123456789`
4. Click Login

## Step 4: Access the Recycling Dashboard

After login:
1. Click on "Recycling Facility Dashboard" in the sidebar (or navigate to `/recycling-dashboard`)
2. You should see one of two states:
   - **If there's inventory data:** Dashboard with KPI cards, tables, and charts
   - **If no data:** "No data available" message

## Step 5: Test with Sample Data

### Option A: Use Seeded Data (if available)
The backend automatically seeds sample data on first startup. If you see data in the dashboard, the seeding worked.

### Option B: Add New Waste Batches
1. Navigate to "Add Waste" page
2. Fill in the form:
   - Batch ID: Enter unique ID (e.g., "TEST-001")
   - Fabric Type: Select from dropdown (Cotton, Polyester, etc.)
   - Source: Enter source (e.g., "Factory Cutting")
   - Quantity: Enter weight in kg (e.g., 100)
   - Color: Enter color
   - Condition: Select condition (Recyclable, Reusable, etc.)
   - Collection Date: Select date
3. Click "Register Batch"
4. Return to Recycling Dashboard
5. Verify the new batch appears in the table

## Step 6: Test Dashboard Features

### Test Filters
1. In the Waste Inventory section, use the filters:
   - **Material Filter:** Select a fabric type (e.g., Cotton)
   - **Status Filter:** Select a status (e.g., Pending)
   - **Date Filter:** Select a specific date

Expected: Table should show only matching records

### Test Search
1. Type in the search box (e.g., batch ID)
2. As you type, the table should filter automatically

Expected: Only matching batches appear

### Test Sort
1. Click on column headers (Batch ID, Material, Quantity)
2. Click again to reverse sort order

Expected: Table should sort by selected column

### Test Refresh
1. Click "Refresh Data" button
2. Watch for loading state

Expected: Data reloads from backend, no page refresh needed

### Test Batch Details
1. Click the eye icon on any batch in the table
2. Modal should open showing batch details

Expected: Modal displays batch information in correct format

### Test Reports
1. Click "Download Full Report" button
2. Select PDF or Excel format

Expected: 
- PDF downloads as `recycling-dashboard-report.pdf`
- Excel downloads as `recycling-dashboard-report.xlsx`

## Step 7: Test with Different User Roles

### As Textile Manufacturer
1. Create a manufacturer account (if not seeded)
2. Login with manufacturer credentials
3. Access `/recycling-dashboard`

Expected: Only their own waste records visible

### As Recycling Facility Operator
1. Create an operator account (if not seeded)
2. Login with operator credentials
3. Access `/recycling-dashboard`

Expected: All waste records from all users visible

### As Administrator
1. Already logged in as admin
2. Access `/recycling-dashboard`

Expected: All waste records visible

## Step 8: Test Error Handling

### Test Missing Auth Token
1. Open browser DevTools (F12)
2. Go to Application > Cookies
3. Delete the `twip_token` cookie
4. Refresh the dashboard page

Expected: Should redirect to login or show error

### Test Invalid Role
1. Create a user with "Sustainability Manager" role
2. Login with that account
3. Try to access `/recycling-dashboard`

Expected: Should redirect to dashboard or show forbidden message

### Test Offline Mode
1. Open browser DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Refresh dashboard or click refresh button

Expected: Error message appears: "Error loading dashboard"

## Step 9: Verify Data Calculations

1. Look at the KPI cards
2. Check these calculations:
   - **Total Weight:** Sum of all quantities
   - **Pending Batches:** Count of records with status = "Pending"
   - **Processing Rate:** (Processed / Total) × 100

Example:
```
Total Batches: 5
Total Weight: 500 kg
Pending: 2
Processed: 300 kg
Processing Rate: (300/500) × 100 = 60%
```

## Step 10: Test Charts

1. Verify charts display real data:
   - **Processing by Material:** Bar chart with fabric types
   - **Processing Status:** Pie chart with status distribution
   - **Recovery by Material:** Horizontal bar chart
   - **Recovered vs Pending:** Donut chart

Expected: Charts show actual inventory data, not fake values

## Step 11: Run Backend Tests

```bash
cd backend
python test_recycling_dashboard.py
```

Expected output:
```
============================================================
  RECYCLING DASHBOARD API TEST SUITE
============================================================
TEST 1: Admin Login
✓ Login successful

TEST 2: Recycling Dashboard Endpoint
✓ Dashboard endpoint returned data
  - success: true
  - inventory count: X

TEST 3: Dashboard with Filters
✓ Filtered dashboard returned X items

TEST 4: Textile Manufacturer Access
✓ Access to dashboard endpoint confirmed

============================================================
TEST SUMMARY
Tests passed: 4/4
✓ All tests passed!
```

## Troubleshooting

### Issue: Database connection error
**Solution:**
- For PostgreSQL: Ensure PostgreSQL is running
- Fallback: SQLite database will be created automatically

### Issue: "No data available" message
**Solution:**
- Add waste batches via "Add Waste" page
- Or seed test data via backend

### Issue: Charts not showing
**Solution:**
- Verify Recharts is installed: `npm list recharts`
- Check browser console for errors
- Ensure inventory has diverse fabric types

### Issue: Report download fails
**Solution:**
- Install reportlab: `pip install reportlab`
- Install openpyxl: `pip install openpyxl`
- Check backend logs for errors

### Issue: Styling looks wrong
**Solution:**
- Clear browser cache: Ctrl+Shift+Delete
- Rebuild frontend: `npm run build`
- Restart development server

## Performance Testing

For testing with large datasets:

1. Add 100+ waste batches to database
2. Test dashboard load time
3. Test filter performance
4. Test sort performance
5. Monitor browser memory usage

Expected: Dashboard should remain responsive with 1000+ records

## Verification Checklist

After testing, verify:
- [ ] Dashboard loads without errors
- [ ] All KPI cards show correct values
- [ ] Waste Inventory table displays data
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Batch details modal opens
- [ ] Charts display real data
- [ ] Refresh button works
- [ ] Report downloads work (PDF and Excel)
- [ ] Role-based access control works
- [ ] Error handling works correctly
- [ ] Responsive design works on mobile
- [ ] No console errors in browser

## What to Do Next

1. **If all tests pass:**
   - Proceed to staging deployment
   - Run comprehensive integration tests
   - Gather user feedback
   - Deploy to production

2. **If issues found:**
   - Check logs for detailed error messages
   - Review backend API responses in Network tab
   - Refer to troubleshooting section above
   - Check README files for additional help

## Support

For issues or questions:
1. Check browser console (F12 → Console tab)
2. Check backend logs (terminal output)
3. Review error messages in UI
4. Check implementation documentation
5. Run backend test script

## Contact

For implementation details, see:
- `RECYCLING_DASHBOARD_IMPLEMENTATION.md`
- `DEPLOYMENT_CHECKLIST.md`
- Backend code: `backend/routes/recycling.py`
- Frontend code: `frontend/src/pages/RecyclingDashboard.jsx`
