# E-Commerce Website - Build & Deploy

A complete full-stack e-commerce platform with frontend (HTML/CSS/JS) and Node.js/Express backend with MongoDB integration, JWT authentication, and Stripe payments.

## 📋 Features

### Frontend
- Responsive HTML pages (index, shop, product details, cart, checkout, blog, about, contact)
- CSS styling with modern design
- JavaScript cart management
- Product browsing and filtering
- Contact form
- Blog section

### Backend
- Node.js/Express server
- MongoDB database with Mongoose ODM
- User authentication with JWT tokens
- Product catalog API
- Shopping cart management
- Order processing with Stripe payment integration
- CORS support for frontend integration
- Environment-based configuration
- Comprehensive error handling

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Stripe account (for payments)

### Installation & Setup

1. **Clone or Download the Repository**
   ```bash
   cd Build-and-Deploy-Ecommerce-Website-main
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Edit `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
   NODE_ENV=development
   ```

4. **Start MongoDB** (if using local instance)
   ```bash
   mongod
   ```

5. **Run the Backend**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

6. **Open Frontend**
   - Open `index.html` in a browser
   - Or serve with a local HTTP server:
     ```bash
     python -m http.server 8000
     # Visit http://localhost:8000
     ```

---

## 📚 Documentation

### Quick Reference
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide and deployment checklist
- **[API_TESTING.md](API_TESTING.md)** - Complete API endpoint documentation
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Detailed backend configuration guide
- **[HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)** - Step-by-step Heroku deployment

### Key Files
- `server.js` - Express server with all API routes
- `package.json` - Node.js dependencies
- `.env` - Environment variables (create this file)
- `Procfile` - Heroku deployment configuration
- `FRONTEND_INTEGRATION.js` - Frontend-backend integration helper
- `script-api.js` - API client for frontend
- `style.css` - Global styles

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders & Checkout
- `POST /api/checkout` - Process checkout with Stripe
- `GET /api/orders` - Get user's orders (requires auth)

### Utility
- `GET /api/health` - Check if backend is running
- `POST /api/seed` - Seed database with sample products (dev only)

Full API documentation: [API_TESTING.md](API_TESTING.md)

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Product Model
```javascript
{
  id: Number,
  name: String,
  price: Number,
  image: String,
  description: String,
  category: String
}
```

### Order Model
```javascript
{
  userId: ObjectId,
  items: Array,
  totalPrice: Number,
  status: String,
  stripePaymentId: String,
  createdAt: Date
}
```

---

## 🔐 Authentication Flow

1. User registers with email and password
2. Password is hashed with bcryptjs
3. User logs in and receives JWT token
4. Token is included in `Authorization` header for protected routes
5. Token expires after 7 days
6. Middleware validates token on each request

---

## 💳 Payment Integration

The backend integrates with Stripe for payment processing:

1. Frontend collects card information using Stripe.js
2. Frontend sends `paymentMethodId` to backend
3. Backend creates payment intent with Stripe API
4. Payment is processed and order is created
5. Order status reflects payment result

---

## 🚢 Deployment

### Deploy to Heroku (Recommended)

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create your-app-name
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://...
   heroku config:set JWT_SECRET=your_secret
   heroku config:set STRIPE_SECRET_KEY=sk_test_...
   heroku config:set STRIPE_PUBLIC_KEY=pk_test_...
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Verify**
   ```bash
   heroku open
   ```

For detailed deployment steps: [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)

### Other Deployment Options
- Vercel (Node.js support)
- Railway.app (recommended for beginners)
- AWS EC2
- DigitalOcean Droplet

---

## 🧪 Testing

### Test with cURL
```bash
# Health check
curl http://localhost:3000/api/health

# Get products
curl http://localhost:3000/api/products

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'
```

### Test with Postman
1. Download: https://www.postman.com/downloads/
2. Import endpoints from API_TESTING.md
3. Set up environment variables
4. Run requests

### Test with VS Code REST Client
Install the "REST Client" extension and use `*.rest` files.

---

## 🐛 Common Issues

### MongoDB Connection Error
- Ensure `mongod` is running (if using local MongoDB)
- Verify connection string in `.env`
- For MongoDB Atlas, check IP whitelist includes 0.0.0.0

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### CORS Errors
- Check frontend URL is allowed
- Verify CORS middleware in server.js
- Add frontend domain to whitelist

### JWT Token Issues
- Verify token format: `Authorization: Bearer <token>`
- Check token hasn't expired
- Verify JWT_SECRET matches

---

## 📁 Project Structure

```
Build-and-Deploy-Ecommerce-Website/
├── index.html                 # Homepage
├── shop.html                  # Products page
├── sproduct.html              # Product detail page
├── cart.html                  # Shopping cart
├── checkout.html              # Checkout page
├── about.html                 # About page
├── contact.html               # Contact page
├── blog.html                  # Blog page
├── style.css                  # Main styles
├── script.js                  # Main frontend script
├── script-api.js              # API client
├── FRONTEND_INTEGRATION.js    # Integration helper
├── server.js                  # Express backend
├── package.json               # Dependencies
├── .env                        # Environment config
├── Procfile                   # Heroku config
├── .gitignore                 # Git ignore
├── QUICK_START.md             # Quick start guide
├── API_TESTING.md             # API docs
├── BACKEND_SETUP.md           # Backend setup
├── HEROKU_DEPLOYMENT.md       # Deployment guide
├── README.md                  # This file
└── img/                        # Product images
    ├── products/
    ├── banner/
    ├── features/
    └── ...
```

---

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Stripe API

### Deployment
- Heroku
- Git/GitHub
- Environment variables

---

## 🔒 Security Features

✅ Password hashing with bcryptjs  
✅ JWT token-based authentication  
✅ CORS protection  
✅ Input validation  
✅ Environment variables for sensitive data  
✅ HTTPS (automatic with Heroku)  
✅ Stripe PCI compliance  

---

## 📈 Performance Considerations

- Database indexing on frequently queried fields
- CORS enabled for frontend optimization
- Gzip compression (via Express)
- JWT caching on frontend
- Product image optimization recommended
- Consider Redis caching for products

---

## 🎓 Learning Resources

- Express.js: https://expressjs.com/
- MongoDB: https://www.mongodb.com/docs/
- Stripe: https://stripe.com/docs/api
- JWT: https://jwt.io/
- Heroku: https://devcenter.heroku.com/

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📝 License

ISC License - Feel free to use for personal or commercial projects

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs: `heroku logs --tail`
4. Open an issue on GitHub

---

## ✅ Deployment Checklist

- [ ] All dependencies installed
- [ ] .env file configured
- [ ] MongoDB connection working
- [ ] Stripe account set up
- [ ] All API endpoints tested
- [ ] Frontend integrated with backend
- [ ] Heroku app created
- [ ] Environment variables set on Heroku
- [ ] Deployment successful
- [ ] Production URL working

---

**Status**: ✅ Production Ready

**Last Updated**: January 21, 2026

---

## 🎉 Next Steps

1. **Test Locally**: Run `npm run dev` and test API endpoints
2. **Configure Stripe**: Set up Stripe account and keys
3. **Connect MongoDB**: Use local or MongoDB Atlas
4. **Deploy**: Follow HEROKU_DEPLOYMENT.md
5. **Go Live**: Update frontend URLs to production backend

Happy deploying! 🚀
