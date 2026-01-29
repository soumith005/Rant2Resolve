
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { Send, Hash, UserCircle, AlertCircle, Heart } from 'lucide-react';
import { ChatMessage } from '../../types';

const CommunityChat: React.FC = () => {
  const { user } = useAuth();
  const { messages, isLoading, isConnected, error, sendMessage, likeMessage } = useChat();
  const [inputText, setInputText] = useState('');
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !isConnected) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      likedBy: []
    };

    sendMessage(newMessage);
    setInputText('');
  };

  const handleLikeClick = async (messageId: string) => {
    if (!user) return;
    
    setLoadingLikes(prev => new Set([...prev, messageId]));
    try {
      await likeMessage(messageId, user.id);
    } catch (err) {
      console.error('Failed to like message:', err);
    } finally {
      setLoadingLikes(prev => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  const isMessageLikedByCurrentUser = (likedBy?: string[]): boolean => {
    if (!user || !likedBy) return false;
    return likedBy.includes(user.id);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
            <Hash size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Global Discussion</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Live Real-time Feed • University Wide
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Connected
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              Connecting...
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mb-4" />
            <p className="font-medium">Loading messages...</p>
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <UserCircle size={64} strokeWidth={1} />
            <p className="mt-4 font-medium">No messages yet. Join the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isLiked = isMessageLikedByCurrentUser(msg.likedBy);
          const isLoading = loadingLikes.has(msg.id);
          
          return (
            <div key={msg.id} className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-2 mb-1 ${msg.userId === user?.id ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-bold text-slate-800">{msg.userName}</span>
                <span className={`text-[8px] font-bold px-1 py-0.5 rounded uppercase ${msg.userRole === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {msg.userRole}
                </span>
                <span className="text-[9px] text-slate-300">{msg.timestamp}</span>
              </div>
              <div className="group">
                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                  msg.userId === user?.id 
                    ? 'bg-rose-600 text-white rounded-tr-none shadow-lg shadow-rose-100' 
                    : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200'
                }`}>
                  {msg.text}
                </div>
                {/* Like button and count */}
                <div className={`flex items-center gap-2 mt-1 ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <button
                    onClick={() => handleLikeClick(msg.id)}
                    disabled={isLoading}
                    title={isLiked ? 'Unlike' : 'Like'}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      isLiked
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Heart
                      size={16}
                      className={`transition-all ${isLiked ? 'fill-current' : ''}`}
                    />
                    <span>{msg.likes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex gap-2">
          <input 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type a real-time message..."
            disabled={!isConnected || isLoading}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button 
            type="submit"
            disabled={!isConnected || isLoading || !inputText.trim()}
            className="bg-rose-600 text-white p-3 rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityChat;