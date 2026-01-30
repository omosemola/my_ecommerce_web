# API Testing Guide

## Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://your-app-name.herokuapp.com`

## Testing Tools
- Postman (GUI) - https://www.postman.com/downloads/
- curl (CLI)
- VS Code REST Client Extension
- Thunder Client

## Authentication
Most endpoints require a JWT token. After login/register, include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully"
}
```

---

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Save the token for subsequent requests!**

---

### 2. Product Endpoints

#### Get All Products
```
GET /api/products
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "id": 1,
    "name": "Premium Headphones",
    "price": 79.99,
    "image": "img/products/f1.jpg",
    "description": "High-quality wireless headphones",
    "category": "electronics"
  },
  ...
]
```

---

#### Get Single Product
```
GET /api/products/:id
```

Replace `:id` with the MongoDB object ID.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": 1,
  "name": "Premium Headphones",
  "price": 79.99,
  "image": "img/products/f1.jpg",
  "description": "High-quality wireless headphones",
  "category": "electronics"
}
```

---

### 3. Checkout/Order Endpoints

#### Checkout
```
POST /api/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "name": "Premium Headphones",
      "price": 79.99,
      "quantity": 1,
      "image": "img/products/f1.jpg"
    }
  ],
  "totalPrice": 79.99,
  "paymentMethodId": "pm_1234567890"
}
```

**Note:** `paymentMethodId` is obtained from Stripe.js in the frontend.

**Response (Success):**
```json
{
  "orderId": "507f1f77bcf86cd799439012",
  "status": "completed"
}
```

---

#### Get User Orders
```
GET /api/orders
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "items": [...],
    "totalPrice": 79.99,
    "status": "completed",
    "stripePaymentId": "pi_1234567890",
    "createdAt": "2024-01-20T12:00:00.000Z"
  }
]
```

---

### 4. Health Check

#### Check Backend Status
```
GET /api/health
```

**Response:**
```json
{
  "status": "Backend is running"
}
```

---

### 5. Database Seeding (Development Only)

#### Seed Sample Products
```
POST /api/seed
```

**Response:**
```json
{
  "message": "Database seeded successfully",
  "productsAdded": 6
}
```

---

## Testing with curl

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products (with token)
```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Orders
```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing with Postman

1. **Import Collection**: Create a new collection with the endpoints listed above
2. **Environment Variables**: Set up:
   - `base_url` = `http://localhost:3000`
   - `token` = (set after login)
3. **Pre-request Script** (for auto-token): Add script to capture token from login response
4. **Collection Runner**: Run all tests sequentially

---

## Expected Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Server Error |

---

## Common Errors

### 401 Unauthorized
- **Cause**: Missing or invalid JWT token
- **Solution**: Include valid token in Authorization header

### 500 MongoDB Connection Error
- **Cause**: MongoDB not running or wrong URI
- **Solution**: Check `.env` and start MongoDB

### 400 Bad Request
- **Cause**: Missing or invalid request body
- **Solution**: Verify JSON format and required fields

---

## Frontend Integration

The frontend should:
1. Call `/api/auth/register` or `/api/auth/login`
2. Store the returned JWT token
3. Include token in all authenticated requests
4. Call `/api/products` to display products
5. Call `/api/checkout` with Stripe payment method ID
6. Call `/api/orders` to show order history

See `FRONTEND_INTEGRATION.js` for example implementation.
