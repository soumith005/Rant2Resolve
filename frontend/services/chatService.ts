import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../types';
import { api } from './api';

const SOCKET_URL = process.env.VITE_API_URL || 'http://localhost:5000';

class ChatService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  // Initialize socket connection
  initializeSocket(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.setupSocketListeners();
    }
    return this.socket;
  }

  // Setup socket event listeners
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to chat server');
      this.socket?.emit('join_chat');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      this.emit('disconnected');
    });

    this.socket.on('load_messages', (messages: any[]) => {
      console.log('📨 Loaded previous messages:', messages.length);
      this.emit('loadMessages', messages);
    });

    this.socket.on('receive_message', (message: any) => {
      console.log('📝 New message received:', message);
      // Ensure id is consistently the database _id (not the temporary client id)
      const normalizedMessage = {
        ...message,
        id: message.id || message._id
      };
      this.emit('newMessage', normalizedMessage);
    });

    this.socket.on('message_error', (error: any) => {
      console.error('❌ Message error:', error);
      this.emit('messageError', error);
    });

    this.socket.on('messageLiked', (data: any) => {
      console.log('❤️ Message liked:', data);
      this.emit('messageLiked', data);
    });
  }

  // Send a message
  sendMessage(message: ChatMessage): void {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.emit('send_message', {
      userId: message.userId,
      userName: message.userName,
      userRole: message.userRole,
      text: message.text,
      id: message.id
    });
  }

  // Fetch messages from backend API
  async fetchMessages(limit: number = 50, skip: number = 0): Promise<ChatMessage[]> {
    try {
      const response = await api.get(`/chat/messages?limit=${limit}&skip=${skip}`);

      if (response?.success) {
        return response.data.map((msg: any) => ({
          id: msg._id,
          userId: msg.senderId,
          userName: msg.senderName,
          userRole: msg.role,
          text: msg.message,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Subscribe to chat events
  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Unsubscribe from chat events
  unsubscribe(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  // Emit events to listeners
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Like or unlike a message
  async likeMessage(messageId: string, userId: string): Promise<any> {
    try {
      const response = await api.post(`/chat/messages/${messageId}/like`, { userId });
      
      // Emit socket event to notify other clients in real-time
      if (response.success && this.socket) {
        console.log('❤️ Broadcasting message liked event:', response.data);
        this.socket.emit('message_liked', {
          messageId: response.data.messageId,
          likes: response.data.likes,
          likedBy: response.data.likedBy
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error liking message:', error);
      throw error;
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new ChatService();
