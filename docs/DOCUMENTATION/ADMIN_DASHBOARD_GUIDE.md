# 🔐 Admin Dashboard - Complete Setup Guide

## What You Have

✅ **Professional Admin Dashboard** with:
- Password-protected login
- Order statistics & analytics
- Search & filter functionality
- View detailed order information
- Export orders to CSV
- Delete orders
- Mobile responsive design

---

## How to Access the Admin Dashboard

### Step 1: Start Your Server
```bash
cd your-project-folder
node server.js
```

You should see:
```
🚀 Server running on port 3000
📁 Using file-based storage at [path]/data
🔐 Default admin password: admin123 (change via ADMIN_PASSWORD env var)
```

### Step 2: Open Admin Dashboard
Go to: `http://localhost:3000/admin-orders.html`

### Step 3: Login
- **Default Password:** `admin123`
- Click "Login" button

---

## Admin Dashboard Features

### 📊 Statistics
- **Total Orders** - All orders ever placed
- **Total Revenue** - Sum of all order totals
- **This Month** - Orders placed this month
- **Average Order Value** - Average order amount

### 🔍 Search & Filter
- Search by order ID
- Search by customer email
- Search by customer name
- Real-time filtering

### 👁️ View Order Details
- Click any order ID to see full details:
  - Customer info
  - Shipping address
  - All items ordered
  - Order totals
  - Payment method
  - Order timestamp

### 💾 Export to CSV
- Click "Export CSV" button
- Download all orders as spreadsheet
- Perfect for accounting/analysis

### 🗑️ Delete Orders
- Remove orders if needed
- Confirmation popup for safety

---

## Changing the Admin Password

### Option 1: Environment Variable (Recommended)
Set the `ADMIN_PASSWORD` environment variable before starting server:

**On Windows (PowerShell):**
```powershell
$env:ADMIN_PASSWORD="your-new-password"
node server.js
```

**On Mac/Linux:**
```bash
ADMIN_PASSWORD="your-new-password" node server.js
```

**In .env file:**
```
ADMIN_PASSWORD=your-new-password
```

### Option 2: Hardcode (Not Recommended)
Edit `server.js` line where it says:
```javascript
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
```

Change `'admin123'` to your password.

---

## After Deployment

### When Deployed to Production:

**For Heroku:**
```bash
heroku config:set ADMIN_PASSWORD="your-strong-password"
```

**For Other Platforms:**
- Set `ADMIN_PASSWORD` environment variable
- Or use their config dashboard

### Access After Deployment:
```
https://your-domain.com/admin-orders.html
```

Login with your admin password!

---

## Security Tips 🔒

1. **Change Default Password IMMEDIATELY**
   - Use a strong, unique password
   - Don't use "admin123" in production!

2. **HTTPS Only**
   - Always use HTTPS (not HTTP)
   - Passwords are sent in requests

3. **Who Can Access**
   - Only you should know the password
   - Don't share the admin link publicly

4. **Regular Backups**
   - Back up `data/orders.json` regularly
   - Stores all customer data

5. **Limit Access**
   - Consider adding IP whitelist (advanced)
   - Restrict to your office IP only

---

## What's Stored in Orders?

Each order contains:
```
✓ Order ID (unique)
✓ Timestamp
✓ Customer name, email, phone
✓ Shipping address (full)
✓ Items ordered (names, prices, quantities)
✓ Order totals (subtotal, tax, shipping, total)
✓ Payment method
✓ Order status
```

---

## File Locations

After orders are placed:
- **Orders saved to:** `data/orders.json`
- **Admin page:** `admin-orders.html`
- **Server code:** `server.js`

You can manually check `data/orders.json` to see all orders as JSON!

---

## Testing the Admin Dashboard

### Create a Test Order:
1. Go to checkout page
2. Add items to cart
3. Fill checkout form (use any test data)
4. Click "Place Order"
5. You'll be redirected to success page with order ID

### View in Admin Dashboard:
1. Go to `admin-orders.html`
2. Login with password
3. Your test order appears in the table!
4. Click order ID to see full details

---

## Troubleshooting

### "No orders yet"
- ✓ No one has placed orders
- ✓ Create a test order to see it appear

### "Invalid admin password"
- ✓ Check ADMIN_PASSWORD env variable
- ✓ Verify you typed password correctly
- ✓ Default is "admin123"

### Orders not loading
- ✓ Check server is running
- ✓ Check browser console for errors (F12)
- ✓ Make sure you're logged in

### Can't login
- ✓ Close browser, clear cache, try again
- ✓ Check localStorage isn't full
- ✓ Try a different browser

---

## Next Steps

After admin dashboard:

1. **Add Email Notifications** (Priority 2)
   - Order confirmation emails
   - Shipping updates

2. **Add Payment Processing** (Priority 1)
   - Stripe integration
   - Real payment handling

3. **Add More Features**
   - Update order status
   - Print invoices
   - Customer accounts
   - Order tracking page

---

## API Endpoints (For Reference)

Admin only endpoints (require token):

### Login
```
POST /api/admin/login
Body: { "password": "admin123" }
Response: { "token": "...", "success": true }
```

### Get Dashboard
```
GET /api/admin/dashboard
Header: Authorization: Bearer [token]
Response: { "stats": {...}, "orders": [...] }
```

### Delete Order
```
DELETE /api/admin/orders/ORD-12345
Header: Authorization: Bearer [token]
```

---

## Summary

✅ Admin dashboard is ready to use
✅ Password protected
✅ View all order details
✅ Search and filter
✅ Export to CSV
✅ Mobile responsive

**Your store is now trackable!** 🎉

Questions? Check the code in `admin-orders.html` - it's well commented!
