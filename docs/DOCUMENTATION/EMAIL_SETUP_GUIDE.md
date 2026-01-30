# Email Notifications Setup Guide

## ✅ What's Been Implemented

1. **Automatic Order Confirmation Emails** - Sent when customer places order
2. **Manual Shipping Notification Emails** - Sent from admin dashboard
3. **Test Email Endpoint** - To verify configuration works
4. **Multiple SMTP Provider Support** - Gmail, SendGrid, Mailgun, custom SMTP

---

## 🔧 Quick Setup (Gmail - Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com
2. Click "Security" in the left menu
3. Scroll to "How you sign in to Google"
4. Enable "2-Step Verification"

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Under "Select the app" choose **Mail**
3. Under "Select the device" choose **Windows Computer**
4. Google will generate a 16-character password
5. Copy this password (remove spaces if any)

### Step 3: Configure .env File
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `xxxx xxxx xxxx xxxx` with the 16-character app password (remove spaces)

### Step 4: Restart Server
```bash
npm start
```

### Step 5: Test Configuration
- Visit: http://localhost:3000/TEST_INTEGRATION.html
- Or use debug.html to test email endpoint

---

## 🚀 Production Setup (SendGrid)

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up for a free account
3. Verify your email
4. Create an API key (Settings > API Keys > Create API Key)

### Step 2: Update .env File
```
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-api-key-here
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
```

### Step 3: Verify Sender Email
1. Go to SendGrid Dashboard
2. Go to Settings > Sender Authentication
3. Verify your sender email address

---

## 📧 Email Endpoints

### 1. Send Test Email
**Endpoint:** `POST /api/email/test`

```javascript
// Request
{
  "email": "customer@example.com"
}

// Response
{
  "success": true,
  "message": "Test email sent successfully",
  "email": "customer@example.com"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

### 2. Send Order Confirmation
**Endpoint:** `POST /api/email/send-confirmation`

```javascript
// Request
{
  "orderId": "ORD-1234567890"
}

// Response
{
  "success": true,
  "message": "Confirmation email sent",
  "orderId": "ORD-1234567890"
}
```

### 3. Send Shipping Notification
**Endpoint:** `POST /api/email/send-shipping`

```javascript
// Request
{
  "orderId": "ORD-1234567890",
  "trackingNumber": "1Z999AA10123456784"  // Optional
}

// Response
{
  "success": true,
  "message": "Shipping email sent",
  "orderId": "ORD-1234567890"
}
```

---

## 🧪 Testing Emails

### Test 1: Test Email Endpoint
```bash
# Using terminal
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'

# Or visit debug.html and use the test form
```

### Test 2: Place an Order
1. Go to http://localhost:3000/checkout.html
2. Fill in all order details
3. Place order
4. Confirmation email should arrive in ~2 seconds

### Test 3: Resend Confirmation
1. Visit admin-orders.html
2. Login with password: admin123
3. Click order ID to view details
4. Use "Resend Email" button (if available)

---

## ⚠️ Troubleshooting

### "Cannot find module 'nodemailer'"
```bash
# Solution: Install nodemailer
npm install nodemailer
```

### "Email sending failed"
- Check `.env` file credentials are correct
- For Gmail: Verify app password was created correctly
- For SendGrid: Verify API key is valid
- Check server logs for detailed error message

### "Invalid login"
- **Gmail:** 
  - Verify 2-Factor Authentication is enabled
  - Create a new App Password (old one may have expired)
  - Remove any spaces in the password
  
- **SendGrid:**
  - Verify API key starts with `SG.`
  - User should always be `apikey`
  - Verify sender email is verified in SendGrid

### "Email configuration not loaded"
- Ensure `.env` file exists in project root
- Check `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Restart server after updating `.env`

---

## 📋 Email Templates

### Order Confirmation Email
- ✅ Implemented
- Includes: Order ID, customer info, items, totals, shipping address
- Sent: Automatically when order placed
- Customizable: Edit `sendOrderConfirmationEmail()` in server.js

### Shipping Notification Email  
- ✅ Implemented
- Includes: Tracking number, estimated delivery
- Sent: Manual via admin dashboard or API
- Customizable: Edit `sendShippingNotificationEmail()` in server.js

### Test Email
- ✅ Implemented
- Verifies email configuration works
- Sent: Via `/api/email/test` endpoint

---

## 🔐 Security Notes

1. **Never commit `.env` file** - Add to .gitignore
2. **App Passwords** - Only for Gmail, specific to Mail app
3. **SendGrid API Keys** - Can be rotated if compromised
4. **Email addresses** - Are visible in transporter config but not shared

---

## 📊 Monitoring

### Check Email Status
Visit http://localhost:3000/admin-orders.html → Order Details → Email section

### Server Logs
Watch console for:
- ✉️ Confirmation email sent to: user@example.com
- ✉️ Shipping notification sent to: user@example.com
- ⚠️ Email send error: [error message]

---

## 🎯 Next Steps

1. ✅ Configure Gmail/SendGrid
2. ✅ Test with `/api/email/test` endpoint
3. ✅ Place test order to verify confirmation email
4. ✅ Check admin dashboard for email status
5. ✅ Deploy to production with environment variables

---

## 📞 Support

For issues:
1. Check server logs in terminal
2. Verify `.env` file has correct credentials
3. Test email endpoint directly with curl or Postman
4. Check spam folder for test emails
