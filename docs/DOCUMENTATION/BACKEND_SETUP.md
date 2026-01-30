# E-commerce Backend Setup & Deployment Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Stripe account (for payment processing)

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Update the `.env` file with your actual values:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
NODE_ENV=development
```

### 3. Start MongoDB (if running locally)
```bash
mongod
```

### 4. Run the Backend
```bash
npm run dev    # Development with auto-reload
npm start      # Production
```

The backend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register a new user
  ```json
  { "name": "John", "email": "john@example.com", "password": "pass123" }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  { "email": "john@example.com", "password": "pass123" }
  ```
  Response: `{ "token": "jwt_token", "user": {...} }`

### Products
- **GET** `/api/products` - Get all products
- **GET** `/api/products/:id` - Get single product

### Orders & Checkout
- **POST** `/api/checkout` - Create order (requires auth token)
  ```json
  { "items": [...], "totalPrice": 99.99, "paymentMethodId": "pm_..." }
  ```

- **GET** `/api/orders` - Get user's orders (requires auth token)

### Health Check
- **GET** `/api/health` - Check if backend is running

## Frontend Integration

1. **Update your HTML** to include the new `script-api.js`:
   ```html
   <script src="script-api.js"></script>
   ```

2. **Use the CartManager** to manage shopping cart:
   ```javascript
   cart.addToCart(product, quantity);
   cart.removeFromCart(productId);
   cart.checkout();
   ```

3. **Use the AuthManager** for authentication:
   ```javascript
   auth.login(email, password);
   auth.register(name, email, password);
   auth.logout();
   ```

## Deployment Options

### Option 1: Heroku (Free tier available)
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB Atlas URI to Heroku config
heroku config:set MONGODB_URI=your_mongodb_atlas_uri

# Deploy
git push heroku main
```

### Option 2: Vercel (Node.js Support)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 3: Railway.app
1. Push your code to GitHub
2. Connect your repo to Railway
3. Set environment variables
4. Deploy automatically

### Option 4: AWS/DigitalOcean
- Use an EC2 instance or Droplet
- SSH into the server
- Clone repo, install dependencies, run with PM2

## Database Seeding (Optional)

Add this route to seed initial products:
```javascript
app.post('/api/seed', async (req, res) => {
  const products = [
    { id: 1, name: 'Product 1', price: 10.99, image: 'img/products/f1.jpg', category: 'electronics' },
    // Add more products
  ];
  await Product.insertMany(products);
  res.json({ message: 'Database seeded' });
});
```

## Security Best Practices
- ✅ Use environment variables for sensitive data
- ✅ Enable CORS only for your frontend domain
- ✅ Hash passwords with bcrypt
- ✅ Use JWT for authentication
- ✅ Validate all user inputs
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows
```

**MongoDB connection error:**
- Check if MongoDB is running
- Verify MongoDB URI in .env
- Use MongoDB Atlas for cloud database

**CORS errors:**
- Ensure frontend URL is in CORS whitelist
- Frontend and backend should be on same domain or add CORS headers

---

## Next Steps
1. Add product images to database
2. Implement email notifications
3. Add order tracking
4. Integrate Stripe payment UI
5. Setup automated backups
