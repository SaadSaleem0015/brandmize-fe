// Components/inbox/ChatWindow.tsx
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Paperclip, Image, Check, CheckCheck } from 'lucide-react';
import { Instagram, Facebook } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { api } from '../../Helpers/BackendRequest';
import { notifyResponse } from '../../Helpers/notyf';
import { Conversation, Message } from '../../Helpers/inbox.types';

interface ChatWindowProps {
  conversation?: Conversation;
  onBack: () => void;
  onMessageSent?: () => void;
}

const getChannelHeaderColor = (channel?: string) => {
  switch (channel) {
    case 'instagram':
      return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'messenger':
      return 'bg-blue-500';
    case 'whatsapp':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getChannelIcon = (channel?: string) => {
  switch (channel) {
    case 'instagram':
      return <Instagram className="w-4 h-4" />;
    case 'messenger':
      return <Facebook className="w-4 h-4" />;
    case 'whatsapp':
      return <FaWhatsapp className="w-4 h-4" />;
    default:
      return null;
  }
};

const MessageStatus = ({ status }: { status: Message['status'] }) => {
  switch (status) {
    case 'sent':
      return <Check className="w-3 h-3 text-gray-400" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    default:
      return null;
  }
};

const EmptyChatState = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
      <Send className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Select a conversation to start chatting
    </h3>
    <p className="text-sm text-gray-500">
      Your messages from Instagram, Messenger, and WhatsApp will appear here
    </p>
  </div>
);

export default function ChatWindow({ conversation, onBack, onMessageSent }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation) {
      fetchMessages(1);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (pageNum: number) => {
    if (!conversation) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/omni/conversations/${conversation.id}/messages?page=${pageNum}&limit=20`);
      
      if (response.data) {
        const newMessages = response.data.messages || response.data;
        
        if (pageNum === 1) {
          setMessages(newMessages);
        } else {
          setMessages(prev => [...newMessages, ...prev]);
        }
        
        setHasMore(response.data.has_more || false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      notifyResponse(error, '', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchMessages(page + 1);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic update
    const tempMessage: Message = {
      id: Date.now(),
      content: messageContent,
      sender: 'human_agent',
      timestamp: Date.now(),
      type: 'text',
      status: 'sent'
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await api.post(`/omni/conversations/${conversation.id}/send-message`, {
        message: messageContent
      });

      if (response.data) {
        // Replace temp message with actual message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? { ...response.data, status: 'delivered' } : msg
          )
        );
        onMessageSent?.();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      notifyResponse(error, '', 'Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageContent); // Restore message
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (type: 'image' | 'file', file: File) => {
    if (!conversation) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await api.post(`/omni/conversations/${conversation.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        setMessages(prev => [...prev, response.data]);
        onMessageSent?.();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      notifyResponse(error, '', 'Failed to upload file');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!conversation) {
    return <EmptyChatState />;
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gray-50">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-white flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 md:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <img
          src={conversation.participant.profile_picture_url}
          alt={conversation.participant.name}
          className="w-9 h-9 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.participant.name)}&background=7032e5&color=fff`;
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-gray-900 truncate">
              {conversation.participant.name}
            </h2>
            <div className={`
              w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0
              ${getChannelHeaderColor(conversation.channel)}
            `}>
              {getChannelIcon(conversation.channel)}
            </div>
          </div>
          <p className="text-xs text-gray-500 truncate">
            {conversation.participant.username}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 md:px-5">
        {/* Load More */}
        {hasMore && (
          <div className="text-center mb-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more messages'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'human_agent' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'text' && (
                <div className="max-w-[72%] group">
                  <div
                    className={`
                      px-3 py-1.5 rounded-2xl relative
                      ${message.sender === 'human_agent'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-200'
                      }
                    `}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-0.5 ${message.sender === 'human_agent' ? 'text-primary-100' : 'text-gray-400'}`}>
                      <span className="text-[10px]">{formatTime(message.timestamp)}</span>
                      {message.sender === 'human_agent' && (
                        <MessageStatus status={message.status} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(message.type === 'image' || message.type === 'video') && (
                <div className="max-w-[72%]">
                  {message.type === 'image' ? (
                    <img
                      src={message.media_url}
                      alt="Shared"
                      className="rounded-2xl shadow-sm border border-gray-200 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.media_url, '_blank')}
                    />
                  ) : (
                    <video
                      src={message.media_url}
                      controls
                      className="rounded-2xl shadow-sm border border-gray-200 max-w-full h-auto"
                    />
                  )}
                  <div className={`flex items-center gap-1 mt-0.5 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} text-gray-400`}>
                    <span className="text-[10px]">{formatTime(message.timestamp)}</span>
                    {message.sender === 'user' && (
                      <MessageStatus status={message.status} />
                    )}
                  </div>
                </div>
              )}

              {message.type === 'file' && (
                <div className="max-w-[72%]">
                  <a
                    href={message.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      block px-3 py-2 rounded-2xl
                      ${message.sender === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm truncate">Download File</span>
                    </div>
                  <div className={`flex items-center justify-end gap-1 mt-0.5 ${message.sender === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                      <span className="text-[10px]">{formatTime(message.timestamp)}</span>
                      {message.sender === 'user' && (
                        <MessageStatus status={message.status} />
                      )}
                    </div>
                  </a>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-3 py-2.5 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload('file', file);
            }}
          />
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload('image', file);
            }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Upload image"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={sending}
          />
          
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}