# Rant2Resolve - Render Deployment Guide

## Overview
This guide will help you deploy Rant2Resolve to Render.com with both backend and frontend services.

---

## Prerequisites
1. **GitHub Account** - Repository must be on GitHub (✅ Already done)
2. **Render Account** - Free at https://render.com
3. **MongoDB Atlas Account** - Free tier at https://www.mongodb.com/cloud/atlas
4. **Google Gemini API Key** - From https://ai.google.dev

---

## Step 1: Set Up MongoDB Atlas

### Create a MongoDB Cluster:
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Click "Create" → Create a new project called "Rant2Resolve"
4. Create a cluster (use Free tier)
5. Wait for cluster to deploy (5-10 minutes)

### Get Connection String:
1. Click "Connect" on your cluster
2. Choose "Drivers" 
3. Copy the connection string
4. Replace `<username>` and `<password>` with your credentials
5. Example: `mongodb+srv://admin:password123@cluster0.mongodb.net/Rant2Resolve?retryWrites=true&w=majority`

### Create a Database User:
1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Set Read/Write to any database

---

## Step 2: Get API Keys

### Google Gemini API Key:
1. Go to https://ai.google.dev
2. Click "Get API Key"
3. Create a new API key in Google Cloud Console
4. Copy and save it securely

---

## Step 3: Deploy to Render

### Option A: Deploy Backend First

1. **Go to https://dashboard.render.com**
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository** (soumith005/Rant2Resolve)
4. **Fill in the form:**
   - **Name:** `rant2resolve-backend`
   - **Runtime:** `Node`
   - **Region:** `Singapore (Southeast Asia)`
   - **Branch:** `main`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (or paid if you want better uptime)

5. **Add Environment Variables** (click "Advanced"):
   ```
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/Rant2Resolve?retryWrites=true&w=majority
   NODE_ENV = production
   PORT = 5000
   GEMINI_API_KEY = your_api_key_here
   ```

6. **Click "Create Web Service"** and wait for deployment (5-15 minutes)

7. **Note your backend URL** - It will be something like: `https://rant2resolve-backend.onrender.com`

---

### Option B: Deploy Frontend

1. **Click "New +"** → **"Static Site"**
2. **Connect same GitHub repository**
3. **Fill in the form:**
   - **Name:** `rant2resolve-frontend`
   - **Region:** `Singapore (Southeast Asia)`
   - **Branch:** `main`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`

4. **Add Environment Variables:**
   ```
   VITE_API_URL = https://rant2resolve-backend.onrender.com
   VITE_GEMINI_API_KEY = your_api_key_here
   ```

5. **Click "Create Static Site"** and wait for deployment

6. **Your frontend URL will be** something like: `https://rant2resolve-frontend.onrender.com`

---

## Step 4: Update Backend CORS Settings

Edit `backend/server.js` and update the CORS origin to allow your frontend:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://rant2resolve-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));
```

Then push this change to GitHub - Render will auto-redeploy.

---

## Step 5: Test Your Deployment

1. **Open your frontend:** `https://rant2resolve-frontend.onrender.com`
2. **Test login functionality**
3. **Create a test issue**
4. **Check backend logs in Render dashboard for errors**

---

## Troubleshooting

### Build Failed?
- Check "Logs" in Render dashboard
- Ensure all dependencies are in package.json
- Make sure environment variables are set

### Backend Not Responding?
- Verify MongoDB connection string is correct
- Check environment variables are set
- Look at backend logs in Render

### Frontend Can't Connect to Backend?
- Verify VITE_API_URL is set correctly
- Check backend CORS settings
- Ensure backend URL doesn't have trailing slash

### Free Tier Issues?
- Free tier services spin down after 15 minutes of inactivity
- Upgrade to paid plan for production reliability
- First request will be slow (15-30 seconds)

---

## Environment Variables Summary

### Backend (.env)
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/Rant2Resolve?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_secret_key_here
```

### Frontend (.env.local)
```
VITE_API_URL=https://rant2resolve-backend.onrender.com
VITE_GEMINI_API_KEY=your_key_here
```

---

## Useful Render Commands/Links

- **View Logs:** Click service → "Logs" tab
- **Redeploy:** Click service → "Manual Deploy" → "Deploy Latest Commit"
- **Update Environment:** Click service → "Environment"
- **View Metrics:** Click service → "Metrics" tab

---

## Next Steps

1. ✅ Create MongoDB cluster and get connection string
2. ✅ Get Gemini API key
3. ✅ Deploy backend service
4. ✅ Deploy frontend service
5. ✅ Test end-to-end functionality
6. ✅ Set up custom domain (optional)

---

## Support

- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Docs:** https://expressjs.com/
- **React/Vite Docs:** https://vitejs.dev/

**Your app is now live! 🚀**
