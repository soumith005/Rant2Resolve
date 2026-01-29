# Render Deployment - Quick Setup Card

## 🚀 Quick Checklist

- [ ] Create MongoDB Atlas account & cluster
- [ ] Get MongoDB connection string
- [ ] Get Google Gemini API key
- [ ] Create Render account at render.com
- [ ] Deploy backend service
- [ ] Deploy frontend service
- [ ] Test the application

---

## 📋 Information You'll Need

### MongoDB Connection String
Format: `mongodb+srv://username:password@cluster0.mongodb.net/Rant2Resolve?retryWrites=true&w=majority`

Where to find:
1. Go to MongoDB Atlas Dashboard
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your DB user credentials

### Gemini API Key
1. Go to https://ai.google.dev
2. Click "Get API Key"
3. Create in Google Cloud Console
4. Copy the key

---

## 🎯 Deployment Steps

### Step 1: Deploy Backend
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Configure:
   - Name: `rant2resolve-backend`
   - Runtime: `Node`
   - Region: `Singapore`
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
5. Add Environment Variables:
   - `MONGO_URI` → Your MongoDB connection string
   - `NODE_ENV` → `production`
   - `PORT` → `5000`
   - `GEMINI_API_KEY` → Your API key
   - `FRONTEND_URL` → (leave blank for now)
6. Click "Create Web Service"
7. Wait for deployment (5-15 minutes)
8. Copy your backend URL (e.g., https://rant2resolve-backend.onrender.com)

### Step 2: Deploy Frontend
1. Click "New +" → "Static Site"
2. Select same GitHub repository
3. Configure:
   - Name: `rant2resolve-frontend`
   - Region: `Singapore`
   - Build: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. Add Environment Variables:
   - `VITE_API_URL` → `https://rant2resolve-backend.onrender.com` (your backend URL)
   - `VITE_GEMINI_API_KEY` → Your API key
5. Click "Create Static Site"
6. Wait for deployment
7. Your frontend URL will appear (e.g., https://rant2resolve-frontend.onrender.com)

### Step 3: Update Backend CORS
1. Edit `backend/server.js` (already done ✅)
2. The CORS is now configured to accept frontend URL
3. Push to GitHub
4. Backend will auto-redeploy

### Step 4: Test
1. Open your frontend URL in browser
2. Try logging in
3. Create a test issue
4. Check for any errors

---

## 🔑 Environment Variables Reference

### Backend (.env)
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/Rant2Resolve?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://rant2resolve-frontend.onrender.com
GEMINI_API_KEY=your_key
JWT_SECRET=strong_random_string
```

### Frontend (.env.local)
```
VITE_API_URL=https://rant2resolve-backend.onrender.com
VITE_GEMINI_API_KEY=your_key
```

---

## 📊 Monitor Your Services

After deployment:
1. Click on each service in Render dashboard
2. Check "Logs" tab for errors
3. Monitor "Metrics" tab for performance
4. Use "Manual Deploy" to redeploy latest changes

---

## ❓ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Build fails | Check dependencies in package.json |
| Backend not responding | Verify MongoDB connection string |
| Frontend can't connect | Check VITE_API_URL is correct |
| Slow first load | Free tier auto-sleep after 15 min inactivity |
| Login not working | Check JWT_SECRET is set on backend |

---

## 💡 Pro Tips

1. **Use strong JWT_SECRET** - Generate a random string
2. **Keep MongoDB Atlas credentials safe** - Don't commit .env to GitHub
3. **Monitor free tier limits** - 750 hours/month per service
4. **Enable auto-deploy** - Push to GitHub and services auto-update
5. **Check logs frequently** - Most issues visible in Render logs

---

**Your Rant2Resolve app will be live at:**
- Frontend: `https://rant2resolve-frontend.onrender.com`
- Backend API: `https://rant2resolve-backend.onrender.com`
