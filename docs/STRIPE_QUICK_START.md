# 🔑 Stripe Setup Quick Start

## Get Your Stripe Keys (5 minutes)

### 1. Sign Up at Stripe
- Visit https://stripe.com
- Click "Start now" or "Sign up"
- Create free account (no credit card needed for testing)

### 2. Navigate to API Keys
- Dashboard → Developers (top right)
- Click "API Keys" in left menu
- You'll see two sections: **Publishable Key** and **Secret Key**
- Keep this page open

### 3. Add to .env File
Create a file named `.env` in your project root (same folder as server.js):

```env
# Stripe Payment Keys
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Other
ADMIN_PASSWORD=admin123
PORT=3000
```

**Replace:**
- `pk_test_YOUR_KEY_HERE` with your Publishable Key
- `sk_test_YOUR_KEY_HERE` with your Secret Key

### 4. Restart Server
```bash
node server.js
```

---

## ✅ That's It!

Your store now accepts payments with Stripe. 🎉

### Test Payment:
1. Go to `http://localhost:3000`
2. Add item to cart
3. Go to checkout
4. Use test card: **4242 4242 4242 4242**
5. Any future date, any 3-digit CVC

---

## 📋 Checklist

- [ ] Stripe account created
- [ ] API keys copied
- [ ] .env file created
- [ ] Keys added to .env
- [ ] Server restarted
- [ ] Test payment successful
- [ ] Order appears in admin dashboard

---

## 🆘 Issues?

| Problem | Solution |
|---------|----------|
| Stripe button not working | Check STRIPE_PUBLIC_KEY in .env |
| Payment declined | Use test card 4242 4242 4242 4242 |
| Order not saved | Check data/orders.json permissions |
| Email not sent | Verify EMAIL_USER and PASSWORD |
| "Cannot find module" | Run `npm install stripe` |

---

## 🔄 Files Modified

- ✅ `server.js` - Added Stripe endpoints
- ✅ `checkout.html` - Added Stripe payment form
- ✅ Created `STRIPE_INTEGRATION_GUIDE.md` - Full documentation

---

## 🚀 You're Ready!

Start accepting payments immediately. Test thoroughly before going live.
