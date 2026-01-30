# 🔐 Authentication System - Login & Signup Guide

## Overview

A complete authentication system with login and signup pages, including form validation, password strength checking, and social login integration.

---

## 📁 Files Created

### Frontend
1. **login.html** - User login page
2. **signup.html** - User registration page
3. **auth.js** - Authentication logic and validation

---

## 🎯 Features

### Login Page Features
✅ Email validation  
✅ Password field  
✅ Remember me checkbox  
✅ Forgot password link  
✅ Social login buttons (Google, Facebook)  
✅ Form error handling  
✅ Loading states  
✅ Responsive design  

### Signup Page Features
✅ First name & last name fields  
✅ Email validation  
✅ Phone number (optional)  
✅ Password strength indicator  
✅ Confirm password validation  
✅ Country selection  
✅ Terms & conditions checkbox  
✅ Social signup buttons  
✅ Form error handling  
✅ Responsive design  

### Authentication Features
✅ User storage in localStorage  
✅ Token management  
✅ Session persistence  
✅ Form validation  
✅ Password strength checking  
✅ Email validation  
✅ Error messaging  
✅ API integration ready  

---

## 🔗 How It Works

### Login Flow
```
1. User enters email and password
2. Frontend validates inputs
3. Sends POST request to backend /api/auth/login
4. Backend verifies credentials
5. Returns user data and JWT token
6. Frontend saves user to localStorage
7. Redirects to home page
```

### Signup Flow
```
1. User fills out registration form
2. Frontend validates all fields
3. Checks password strength
4. Sends POST request to backend /api/auth/signup
5. Backend creates user account
6. Returns success message
7. Redirects to login page
```

---

## 📝 Form Validation

### Login Form
```javascript
Email: Required, must be valid email format
Password: Required, minimum 6 characters
```

### Signup Form
```javascript
First Name: Required, text only
Last Name: Required, text only
Email: Required, must be valid email format
Phone: Optional, 10-15 digits
Password: Required, minimum 8 characters
Confirm Password: Required, must match password
Country: Required, select from dropdown
Terms: Required, must be checked
```

### Password Strength Levels
```
Weak: Less than 8 characters
Medium: 8+ characters with letters and numbers
Strong: 8+ characters with uppercase, lowercase, numbers
Very Strong: 8+ characters with special characters
```

---

## 🔌 Backend API Integration

### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

Request:
{
    email: "user@example.com",
    password: "password123"
}

Response (Success):
{
    success: true,
    user: {
        id: "123",
        email: "user@example.com",
        name: "John Doe"
    },
    token: "eyJhbGc..."
}

Response (Error):
{
    success: false,
    message: "Invalid credentials"
}
```

### Signup Endpoint
```
POST /api/auth/signup
Content-Type: application/json

Request:
{
    firstName: "John",
    lastName: "Doe",
    email: "user@example.com",
    password: "password123",
    phone: "1234567890",
    country: "US"
}

Response (Success):
{
    success: true,
    message: "Account created successfully"
}

Response (Error):
{
    success: false,
    message: "Email already exists"
}
```

---

## 💻 Usage Examples

### Check if User is Logged In
```javascript
if (authSystem.isLoggedIn()) {
    console.log('User is logged in');
    const user = authSystem.getCurrentUser();
    console.log(user.name);
}
```

### Get Authentication Token
```javascript
const token = authSystem.getAuthToken();
// Use in API requests
fetch('/api/orders', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
```

### Logout User
```javascript
authSystem.logout();
// or use: logout();
```

### Validate Email
```javascript
if (authSystem.validateEmail('test@example.com')) {
    console.log('Valid email');
}
```

---

## 🎨 Styling

### Login Page
- Clean, centered layout
- 400px max width
- White background with shadow
- Blue primary button
- Professional form styling
- Responsive on mobile

### Signup Page
- Similar to login
- 450px max width
- Green primary button
- Multiple form fields
- Grid layout for names
- Password strength indicator

---

## 📱 Mobile Responsive

Both pages are fully responsive:
- ✅ Mobile phones (320px+)
- ✅ Tablets (768px+)
- ✅ Desktops (1024px+)
- ✅ Touch-friendly buttons
- ✅ Readable text
- ✅ Proper spacing

---

## 🔒 Security Features

### Frontend
✅ Password strength validation  
✅ Email format validation  
✅ XSS protection via DOM methods  
✅ No password storing in localStorage  
✅ Token-based authentication  

### Backend (Configure These)
✅ Password hashing (bcryptjs)  
✅ JWT token validation  
✅ Rate limiting  
✅ HTTPS enforcement  
✅ CORS configuration  
✅ Input sanitization  

---

## 🚀 Backend Setup Required

### Add to your server.js

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Find user in database
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.firstName + ' ' + user.lastName
            },
            token: token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    const { firstName, lastName, email, password, phone, country } = req.body;
    
    try {
        // Check if user exists
        const existing = await User.findOne({ email });
        
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            country
        });
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Account created successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
```

---

## 📊 LocalStorage Structure

### Current User
```javascript
localStorage.currentUser = {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Remember Me
```javascript
localStorage.rememberMe = "true"
```

---

## 🧪 Testing

### Test Login
1. Open login.html
2. Enter email: test@example.com
3. Enter password: password123
4. Click Login
5. Should redirect to home page

### Test Signup
1. Open signup.html
2. Fill all required fields
3. Check password strength indicator
4. Click "Create Account"
5. Should redirect to login page

### Test Validation
1. Try empty fields → Shows error
2. Try invalid email → Shows error
3. Try short password → Shows error
4. Try mismatched passwords → Shows error

---

## 🔗 Navigation Links

### Update Your Navigation
Add links to auth pages in header:

```html
<li><a href="login.html">Login</a></li>
<li><a href="signup.html">Sign Up</a></li>
```

### Or Update Dynamically
```javascript
// In cart.js or main script
if (authSystem.isLoggedIn()) {
    // Show user menu
    navBar.innerHTML += `
        <li><a href="#" onclick="logout()">Logout</a></li>
    `;
} else {
    // Show login/signup
    navBar.innerHTML += `
        <li><a href="login.html">Login</a></li>
        <li><a href="signup.html">Sign Up</a></li>
    `;
}
```

---

## 📋 Checklist

- [ ] Create User model in MongoDB
- [ ] Add bcryptjs to package.json
- [ ] Add jwt to package.json
- [ ] Update server.js with auth endpoints
- [ ] Test login page
- [ ] Test signup page
- [ ] Test form validation
- [ ] Test error messages
- [ ] Test password strength
- [ ] Test localStorage persistence
- [ ] Add navigation links
- [ ] Test on mobile

---

## 🚀 Next Steps

1. **Configure Backend**
   - Update server.js with auth endpoints
   - Create User model
   - Set up database

2. **Test Authentication**
   - Create test account
   - Verify login works
   - Check token storage

3. **Integrate with Pages**
   - Add auth checks to protected pages
   - Show user info in header
   - Add logout functionality

4. **Add Extra Features**
   - Forgot password page
   - Email verification
   - Two-factor authentication
   - OAuth integration

---

## 📞 Common Issues

### "Email already exists"
✅ Use a different email address

### "Passwords do not match"
✅ Ensure confirm password matches password

### "Invalid credentials"
✅ Check email and password are correct

### "Page redirects to login"
✅ User not authenticated, login required

### "Token expired"
✅ User session expired, need to login again

---

## ✅ Status

**Login Page:** ✅ Complete  
**Signup Page:** ✅ Complete  
**Form Validation:** ✅ Complete  
**Error Handling:** ✅ Complete  
**Backend Integration:** ⏳ Ready for configuration  
**Social Login:** 📋 Placeholder (ready to implement)  

---

**Ready to use!** Implement backend endpoints and start authenticating users. 🎉
