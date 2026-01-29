# Chat System API Documentation

## Base URL
```
http://localhost:5000/api/chat
```

---

## REST API Endpoints

### 1. Send Message
**Endpoint:** `POST /api/chat/message`

**Description:** Save a new message to the database

**Request Body:**
```json
{
  "message": "Hello everyone!",
  "senderId": "user_123",
  "senderName": "John Doe",
  "role": "STUDENT"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | ✅ | The message text (max 500 chars recommended) |
| senderId | string | ✅ | Unique user ID |
| senderName | string | ✅ | Display name of sender |
| role | string | ✅ | User role: "STUDENT" or "ADMIN" |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "message": "Hello everyone!",
    "senderId": "user_123",
    "senderName": "John Doe",
    "role": "STUDENT",
    "timestamp": "2024-01-01T14:30:00.000Z",
    "createdAt": "2024-01-01T14:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "All fields (message, senderId, senderName, role) are required"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello everyone!",
    "senderId": "user_123",
    "senderName": "John Doe",
    "role": "STUDENT"
  }'
```

---

### 2. Get Messages
**Endpoint:** `GET /api/chat/messages`

**Description:** Fetch messages with pagination

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Number of messages to fetch |
| skip | number | 0 | Number of messages to skip |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "message": "First message",
      "senderId": "user_123",
      "senderName": "John Doe",
      "role": "STUDENT",
      "timestamp": "2024-01-01T14:30:00.000Z",
      "createdAt": "2024-01-01T14:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "message": "Second message",
      "senderId": "user_456",
      "senderName": "Jane Smith",
      "role": "ADMIN",
      "timestamp": "2024-01-01T14:31:00.000Z",
      "createdAt": "2024-01-01T14:31:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "skip": 0
  }
}
```

**Example cURL:**
```bash
# Get 50 messages (default)
curl http://localhost:5000/api/chat/messages

# Get 10 messages
curl http://localhost:5000/api/chat/messages?limit=10

# Get 10 messages, skip first 20
curl http://localhost:5000/api/chat/messages?limit=10&skip=20
```

**Example JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:5000/api/chat/messages?limit=50');
const data = await response.json();
console.log(data.data); // Array of messages
```

---

### 3. Clear Messages (Admin/Testing)
**Endpoint:** `DELETE /api/chat/clear`

**Description:** Delete all messages from database (testing purposes)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All messages cleared"
}
```

**Example cURL:**
```bash
curl -X DELETE http://localhost:5000/api/chat/clear
```

---

## Socket.IO Events

### Connection Flow

```
Client → Server: "join_chat"
         ↓
Server → Client: "load_messages" (100 previous messages)
         ↓
Server → Client: "receive_message" (real-time new messages)
```

---

### 1. Join Chat
**Event:** `join_chat`

**Direction:** Client → Server

**Description:** Join the global chat room and request previous messages

**Example:**
```javascript
socket.emit('join_chat');
```

**Server Response:**
Server will emit `load_messages` with previous 100 messages

---

### 2. Send Message
**Event:** `send_message`

**Direction:** Client → Server

**Description:** Send a new message to the global chat

**Payload:**
```json
{
  "userId": "user_123",
  "userName": "John Doe",
  "userRole": "STUDENT",
  "text": "Hello everyone!",
  "id": "1704067200000"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| userId | string | User's unique ID |
| userName | string | Display name |
| userRole | string | "STUDENT" or "ADMIN" |
| text | string | Message content |
| id | string | Unique message ID (client-generated) |

**Example:**
```javascript
socket.emit('send_message', {
  userId: 'user_123',
  userName: 'John Doe',
  userRole: 'STUDENT',
  text: 'Hello everyone!',
  id: Date.now().toString()
});
```

**Server Behavior:**
1. Saves message to MongoDB
2. Broadcasts to all connected users

---

### 3. Load Messages
**Event:** `load_messages`

**Direction:** Server → Client

**Description:** Server sends previous messages when client joins

**Payload:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "message": "First message",
    "senderId": "user_123",
    "senderName": "John Doe",
    "role": "STUDENT",
    "timestamp": "2024-01-01T14:30:00.000Z",
    "createdAt": "2024-01-01T14:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "message": "Second message",
    "senderId": "user_456",
    "senderName": "Jane Smith",
    "role": "ADMIN",
    "timestamp": "2024-01-01T14:31:00.000Z",
    "createdAt": "2024-01-01T14:31:00.000Z"
  }
]
```

**Example:**
```javascript
socket.on('load_messages', (messages) => {
  console.log('Loaded', messages.length, 'messages');
  messages.forEach(msg => {
    console.log(msg.senderName + ':', msg.message);
  });
});
```

---

### 4. Receive Message
**Event:** `receive_message`

**Direction:** Server → Client (Broadcast)

**Description:** Real-time message broadcast to all connected users

**Payload:**
```json
{
  "id": "1704067200000",
  "userId": "user_123",
  "userName": "John Doe",
  "userRole": "STUDENT",
  "text": "Hello everyone!",
  "timestamp": "02:30 PM"
}
```

**Example:**
```javascript
socket.on('receive_message', (message) => {
  console.log(message.userName + ' says: ' + message.text);
  // Update UI with new message
});
```

---

### 5. Message Error
**Event:** `message_error`

**Direction:** Server → Client

**Description:** Error notification when message fails to save

**Payload:**
```json
{
  "error": "Failed to send message"
}
```

**Example:**
```javascript
socket.on('message_error', (error) => {
  console.error('Message failed:', error.error);
  // Show error to user
});
```

---

## Error Handling

### Database Errors
If MongoDB fails, the server logs the error but stays running. Messages can't be saved/retrieved.

**Server Log:**
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```

**Client Receives:**
```javascript
socket.on('message_error', (error) => {
  // { error: 'Failed to send message' }
});
```

### Network Errors
Socket.IO automatically handles disconnection and reconnection:
- **Reconnection delay:** 1000ms
- **Max delay:** 5000ms
- **Max attempts:** 5

**Socket Connection Events:**
```javascript
socket.on('connect', () => {
  console.log('Connected'); // Socket connected successfully
});

socket.on('disconnect', () => {
  console.log('Disconnected'); // Socket disconnected
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

## Rate Limiting (Not Implemented)

**Recommended for Production:**
```javascript
// Max 5 messages per second per user
const rateLimit = {
  windowMs: 1000, // 1 second
  maxRequests: 5
};
```

---

## Data Validation (Current)

| Field | Validation |
|-------|-----------|
| message | Required, non-empty string |
| senderId | Required, non-empty string |
| senderName | Required, non-empty string |
| role | Required, must be "STUDENT" or "ADMIN" |

**Recommended for Production:**
- Max message length: 500 characters
- Sanitize HTML/script tags
- Rate limit per user
- Validate sender exists in database

---

## Example: Complete Chat Flow

```javascript
// 1. Connect to server
const socket = io('http://localhost:5000');

// 2. Join chat and load messages
socket.on('connect', () => {
  socket.emit('join_chat');
});

// 3. Receive previous messages
socket.on('load_messages', (messages) => {
  console.log('Loaded', messages.length, 'messages');
  renderMessages(messages);
});

// 4. User sends a message
function sendMessage(text) {
  socket.emit('send_message', {
    userId: 'user_123',
    userName: 'John Doe',
    userRole: 'STUDENT',
    text: text,
    id: Date.now().toString()
  });
}

// 5. Receive new messages in real-time
socket.on('receive_message', (message) => {
  console.log('New message:', message);
  addMessageToUI(message);
});

// 6. Handle errors
socket.on('message_error', (error) => {
  console.error('Error:', error.error);
  showErrorToUser(error.error);
});

// 7. Monitor connection
socket.on('disconnect', () => {
  console.log('Disconnected - will reconnect automatically');
});
```

---

## Performance Considerations

### Message Pagination
```javascript
// Load 50 messages at a time (efficient)
GET /api/chat/messages?limit=50&skip=0

// Load next batch
GET /api/chat/messages?limit=50&skip=50
```

### Indexes
Messages are indexed by `createdAt` for efficient sorting:
```javascript
chatMessageSchema.index({ createdAt: -1 });
```

### Memory
- Socket.IO stores up to 100 previous messages in memory per connection
- Full chat history stored in MongoDB

---

## CORS Configuration

**Current (Development):**
```javascript
cors: {
  origin: "*",  // Allow all origins
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}
```

**Recommended for Production:**
```javascript
cors: {
  origin: "https://yourdomain.com",  // Specific domain
  methods: ["GET", "POST"],
  credentials: true
}
```

---

## Testing with Postman/cURL

### 1. Test GET Messages
```bash
curl http://localhost:5000/api/chat/messages
```

### 2. Test POST Message
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message",
    "senderId": "user_001",
    "senderName": "Test User",
    "role": "STUDENT"
  }'
```

### 3. Test DELETE Clear
```bash
curl -X DELETE http://localhost:5000/api/chat/clear
```

---

## WebSocket Frames (Socket.IO)

Socket.IO uses WebSocket protocol under the hood. Example frames:

**Connection:**
```
→ GET /socket.io/?EIO=4&transport=websocket
← HTTP 101 Switching Protocols
```

**Join Event:**
```
→ 42["join_chat"]
← [ACK]
```

**Send Message:**
```
→ 42["send_message",{"userId":"...","userName":"...","text":"..."}]
← 2["receive_message",{"userId":"...","userName":"...","text":"..."}]
```

---

## Frontend Integration Example

```typescript
// services/chatService.ts
class ChatService {
  async fetchMessages() {
    const response = await api.get('/chat/messages');
    return response.data;
  }

  sendMessage(message) {
    this.socket.emit('send_message', message);
  }

  onNewMessage(callback) {
    this.socket.on('receive_message', callback);
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (message saved) |
| 400 | Bad Request (missing fields) |
| 500 | Server Error (DB issue) |

---

## Need More Help?

Check:
1. Backend logs: `npm run dev` output
2. Browser console: F12 → Console tab
3. Network tab: F12 → Network → WS (WebSocket)
4. Database: MongoDB client for stored messages

Enjoy! 🎉
