# Quick Start - Real-Time Chat System

## ⚡ What Was Implemented

A **WhatsApp/Slack-style real-time university chat system** where:
- ✅ Messages persist in MongoDB database
- ✅ Messages sync in real-time via Socket.IO
- ✅ Messages don't disappear when navigating between pages
- ✅ Works after page refresh (loaded from database)
- ✅ Shows connection status and error handling
- ✅ User-friendly UI with loading states

---

## 🚀 How to Run

### 1. Start MongoDB
```bash
# Make sure MongoDB is running on your system
# Default: mongodb://127.0.0.1:27017/Rant2Resolve
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
# Output: 🚀 Server running on http://localhost:5000
```

### 3. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
# Output: Will show Vite server URL (usually http://localhost:5173)
```

### 4. Open in Browser
- Go to `http://localhost:5173`
- Login with your account
- Navigate to "Global Discussion" / Chat section
- Start sending messages!

---

## 📝 Testing the Chat

### Test 1: Real-Time Messaging
1. Open chat in two browser windows (or two browsers)
2. Send message from Window 1
3. ✅ Should appear instantly in Window 2

### Test 2: Persistence (Navigation)
1. Send a message in chat
2. Navigate to "Dashboard" or another page
3. Go back to chat
4. ✅ Message should still be there

### Test 3: Persistence (Refresh)
1. Send a message
2. Press F5 to refresh page
3. ✅ Message should load from database

### Test 4: Connection Status
1. Look at top-right of chat header
2. ✅ Should show green "Connected" indicator
3. Stop backend server
4. ✅ Should change to red "Connecting..." indicator

### Test 5: Multiple Users
1. Have 2-3 users logged in (different accounts)
2. All send messages
3. ✅ All messages appear for all users in real-time

---

## 📂 New Files Created

### Backend
- `backend/src/models/ChatMessage.js` - MongoDB schema for messages
- `backend/src/controllers/chatController.js` - API endpoints
- `backend/src/routes/chat.js` - Chat routes

### Frontend
- `frontend/services/chatService.ts` - Socket.IO & API management
- `frontend/contexts/ChatContext.tsx` - Global chat state

### Updated Files
- `backend/server.js` - Added chat routes & Socket.IO handling
- `frontend/App.tsx` - Wrapped with ChatProvider
- `frontend/pages/shared/CommunityChat.tsx` - Refactored to use Context

---

## 🔌 Backend APIs

### Send Message
```bash
POST http://localhost:5000/api/chat/message
Content-Type: application/json

{
  "message": "Hello everyone!",
  "senderId": "user123",
  "senderName": "John Doe",
  "role": "STUDENT"
}
```

### Get Messages
```bash
GET http://localhost:5000/api/chat/messages?limit=50&skip=0
```

### Socket.IO Events
```javascript
// Client → Server
socket.emit('send_message', {
  userId: 'user123',
  userName: 'John Doe',
  userRole: 'STUDENT',
  text: 'Hello!',
  id: 'msg123'
});

// Server → Client (initial load)
socket.on('load_messages', (messages) => {
  // messages = [{ ... }, { ... }]
});

// Server → Client (new message)
socket.on('receive_message', (message) => {
  // message = { userId, userName, userRole, text, timestamp, id }
});
```

---

## 🐛 Debugging

### Check Backend Logs
```
Should see:
✅ MongoDB Connection Established
🚀 Server running on http://localhost:5000
Socket Connected: (socket-id)
User (socket-id) joined global chat
```

### Check Browser Console (Frontend)
```
Should see:
✅ Connected to chat server
📨 Loaded previous messages: X
📝 New message received: { ... }
```

### Database Check
```bash
# Using MongoDB client
use Rant2Resolve
db.chatmessages.find().pretty()

# Should show all sent messages with timestamps
```

---

## ✨ Features

### User Experience
- **Auto-scroll** to latest message
- **Connection status** indicator (green/red dot)
- **Loading spinner** while fetching
- **Error alerts** if something goes wrong
- **Message styling** - different colors for you vs others
- **User badges** - Shows STUDENT or ADMIN role

### Reliability
- **Reconnection** with retry logic (auto-reconnect if disconnected)
- **Fallback** to REST API if Socket.IO has issues
- **Duplicate prevention** - same message won't appear twice
- **Database persistence** - messages survive page refresh

### Developer Experience
- **Easy to extend** - Clean separation of concerns
- **TypeScript** support with proper typing
- **Error handling** - User-friendly error messages
- **Logging** - Console logs for debugging

---

## 🔐 Security Notes (For Production)

⚠️ **Currently open for testing. In production:**
- Add JWT authentication to `/api/chat/message`
- Sanitize message input (prevent XSS)
- Add rate limiting
- Change CORS to specific domain
- Use HTTPS for Socket.IO

---

## 📊 How Data Flows

```
User Types & Sends
        ↓
ChatContext.sendMessage()
        ↓
Socket.IO emits 'send_message'
        ↓
Backend receives & saves to MongoDB
        ↓
Backend broadcasts 'receive_message' to all users
        ↓
All users receive message in real-time
        ↓
UI updates with new message
```

---

## 🎯 What Makes This Different From Before

| Before | After |
|--------|-------|
| Local state only | ✅ Persistent database |
| Messages lost on navigation | ✅ Global state persists |
| Lost on page refresh | ✅ Loads from database |
| No real-time sync | ✅ Socket.IO real-time |
| No user info shown | ✅ Name, role, timestamp |
| No error handling | ✅ Error alerts & status |

---

## 💡 Pro Tips

1. **Open DevTools** (F12) and go to Network tab to see Socket.IO packets
2. **Multiple Windows** - Open chat in 2 windows and test real-time sync
3. **Slow Motion** - Chrome DevTools can throttle to simulate slow connection
4. **Clear Messages** - `DELETE http://localhost:5000/api/chat/clear` (for testing)

---

## 🆘 Need Help?

1. **Check backend logs** - terminal where you ran `npm run dev`
2. **Check browser console** - F12 → Console tab
3. **Verify MongoDB** - Is it running?
4. **Verify APIs** - Test with Postman/cURL
5. **Check URLs** - Backend on :5000? Frontend on :5173?

---

## 📱 Example Message Format

```json
{
  "id": "1704067200000",
  "userId": "user_001",
  "userName": "Alice Johnson",
  "userRole": "STUDENT",
  "text": "Does anyone know about the assignment deadline?",
  "timestamp": "02:30 PM"
}
```

Stored in MongoDB as:
```json
{
  "_id": ObjectId("..."),
  "message": "Does anyone know about the assignment deadline?",
  "senderId": "user_001",
  "senderName": "Alice Johnson",
  "role": "STUDENT",
  "timestamp": ISODate("2024-01-01T14:30:00.000Z"),
  "createdAt": ISODate("2024-01-01T14:30:00.000Z")
}
```

---

## ✅ Checklist Before Going Live

- [ ] MongoDB is running
- [ ] Backend server started (`npm run dev`)
- [ ] Frontend server started (`npm run dev`)
- [ ] Can send/receive messages
- [ ] Messages persist after refresh
- [ ] Can navigate pages without losing messages
- [ ] Error handling works (try stopping backend)
- [ ] Multiple users can chat simultaneously

---

Enjoy your new real-time chat system! 🎉
