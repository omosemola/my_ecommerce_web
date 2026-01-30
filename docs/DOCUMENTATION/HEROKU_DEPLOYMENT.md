# Heroku Deployment Guide

## Prerequisites
- Heroku CLI installed
- Git repository initialized
- GitHub account (optional, but recommended)

## Step-by-Step Deployment

### 1. Install Heroku CLI
```bash
# Windows (Chocolatey)
choco install heroku-cli

# Or download from https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku
```bash
heroku login
# Follow the prompts to authenticate
```

### 3. Create Heroku App
```bash
heroku create your-app-name
# Replace 'your-app-name' with your desired app name
# If you don't specify a name, Heroku will generate one
```

### 4. Add MongoDB Atlas URI
First, create a MongoDB Atlas account and cluster at https://www.mongodb.com/cloud/atlas

Then set the environment variable:
```bash
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
```

### 5. Set Other Environment Variables
```bash
heroku config:set JWT_SECRET=your_secure_jwt_secret_key
heroku config:set STRIPE_SECRET_KEY=sk_test_your_stripe_key
heroku config:set STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
heroku config:set NODE_ENV=production
```

### 6. Deploy to Heroku
```bash
# Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Add Heroku remote and deploy
git push heroku main
# or 'master' if your branch is named 'master'
```

### 7. View Logs
```bash
heroku logs --tail
```

### 8. Open Your App
```bash
heroku open
# Opens your app in a browser: https://your-app-name.herokuapp.com
```

## Verify Deployment

Check if the backend is running:
```
GET https://your-app-name.herokuapp.com/api/health
```

Expected response:
```json
{ "status": "Backend is running" }
```

## Seed Database (Optional)
Once deployed, seed the database with sample products:
```
POST https://your-app-name.herokuapp.com/api/seed
```

## Troubleshooting

### Port Issue
If you get a port error, verify server.js uses `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 3000;
```

### MongoDB Connection Error
- Check MongoDB Atlas whitelist includes 0.0.0.0 (or Heroku IPs)
- Verify the connection string format

### Environment Variables Not Set
```bash
heroku config
# Lists all set variables
```

### Logs Show Errors
```bash
heroku logs --tail --app your-app-name
```

## Update App After Changes

1. Make changes locally
2. Commit to git
3. Push to Heroku:
```bash
git push heroku main
```

## Useful Heroku Commands

```bash
heroku config              # View all environment variables
heroku config:set KEY=val # Set environment variable
heroku config:unset KEY   # Remove environment variable
heroku logs --tail        # View live logs
heroku scale web=1        # Scale dynos
heroku ps                 # View running processes
heroku destroy --app app-name  # Delete app
```

## Free Tier Limitations (Hobby Tier)
- App will sleep after 30 mins of inactivity
- Performance may be slower
- Limited database resources

## Production Considerations
- Use Heroku Dyno Pro or higher
- Set up monitoring with New Relic
- Configure auto-restart with process manager
- Use separate prod/staging apps
- Enable HTTPS (automatic with Heroku)
