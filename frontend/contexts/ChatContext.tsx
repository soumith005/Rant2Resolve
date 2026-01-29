import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '../types';
import chatService from '../services/chatService';

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  sendMessage: (message: ChatMessage) => void;
  loadMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  likeMessage: (messageId: string, userId: string) => Promise<any>;
  updateMessageLikes: (messageId: string, likes: number, likedBy: string[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection and set up listeners
  useEffect(() => {
    setIsLoading(true);
    
    // Initialize socket
    chatService.initializeSocket();

    // Subscribe to socket events
    chatService.subscribe('connected', () => {
      console.log('Chat context: Connected');
      setIsConnected(true);
      setError(null);
    });

    chatService.subscribe('disconnected', () => {
      console.log('Chat context: Disconnected');
      setIsConnected(false);
    });

    chatService.subscribe('loadMessages', (loadedMessages: ChatMessage[]) => {
      console.log('Chat context: Loading messages', loadedMessages.length);
      setMessages(loadedMessages);
      setIsLoading(false);
    });

    chatService.subscribe('newMessage', (newMessage: ChatMessage) => {
      console.log('Chat context: New message received', newMessage);
      setMessages(prev => {
        // Prevent duplicates: check if message with same id already exists
        if (prev.some(m => m.id === newMessage.id)) {
          console.log('Chat context: Duplicate message ignored', newMessage.id);
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    chatService.subscribe('messageError', (errorData: any) => {
      console.error('Chat context: Message error', errorData);
      setError(errorData?.error || 'Failed to send message');
    });

    chatService.subscribe('messageLiked', (data: any) => {
      console.log('Chat context: Message liked', data);
      setMessages(prev =>
        prev.map(m =>
          m.id === data.messageId
            ? { ...m, likes: data.likes, likedBy: data.likedBy }
            : m
        )
      );
    });

    return () => {
      // Cleanup listeners on unmount if needed
      // Note: We keep the socket connected for real-time updates
    };
  }, []);

  // Load initial messages from API if socket hasn't loaded them yet
  useEffect(() => {
    if (messages.length === 0 && isConnected && isLoading) {
      const loadInitialMessages = async () => {
        try {
          const fetchedMessages = await chatService.fetchMessages();
          setMessages(fetchedMessages);
          setIsLoading(false);
        } catch (err) {
          console.error('Error loading initial messages:', err);
          setError('Failed to load messages');
          setIsLoading(false);
        }
      };

      loadInitialMessages();
    }
  }, [isConnected, isLoading, messages.length]);

  const sendMessage = useCallback((message: ChatMessage) => {
    if (!isConnected) {
      setError('Not connected to chat server');
      return;
    }
    chatService.sendMessage(message);
  }, [isConnected]);

  const loadMessages = useCallback((loadedMessages: ChatMessage[]) => {
    setMessages(loadedMessages);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const likeMessage = useCallback(async (messageId: string, userId: string) => {
    try {
      const response = await chatService.likeMessage(messageId, userId);
      // Update local state optimistically
      if (response.success) {
        setMessages(prev =>
          prev.map(m =>
            m.id === messageId
              ? { ...m, likes: response.data.likes, likedBy: response.data.likedBy }
              : m
          )
        );
      }
      return response;
    } catch (err) {
      console.error('Error liking message in context:', err);
      throw err;
    }
  }, []);

  const updateMessageLikes = useCallback((messageId: string, likes: number, likedBy: string[]) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, likes, likedBy }
          : m
      )
    );
  }, []);

  const value: ChatContextType = {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    loadMessages,
    addMessage,
    clearMessages,
    likeMessage,
    updateMessageLikes
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
