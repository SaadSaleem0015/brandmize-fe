// Components/inbox/ChatWindow.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Paperclip, Image, Check, CheckCheck } from 'lucide-react';
import { Instagram, Facebook } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { api } from '../../Helpers/BackendRequest';
import { notifyResponse } from '../../Helpers/notyf';
import { Conversation, Message } from '../../Helpers/inbox.types';

interface ChatWindowProps {
  conversation?: Conversation;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onBack: () => void;
  onMessageSent: (tempId: number, actualMessage: Message) => void;
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

// Updated MessageStatus component
const MessageStatus = ({ status, isFromAgent }: { status?: Message['status']; isFromAgent: boolean }) => {
  if (!isFromAgent) return null; // Don't show status for customer messages
  
  // For messages loaded from history, they should show double tick
  if (status === 'delivered' || status === 'read') {
    return (
      <div className="flex items-center">
        <Check className="w-3 h-3 text-gray-400" />
        <Check className="w-3 h-3 text-gray-400 -ml-1" />
      </div>
    );
  }
  
  // For messages with read receipt
  // if (status === 'read') {
  //   return (
  //     <div className="flex items-center">
  //       <Check className="w-3 h-3 text-blue-500" />
  //       <Check className="w-3 h-3 text-blue-500 -ml-1" />
  //     </div>
  //   );
  // }
  
  // For sent messages (optimistic updates)
  if (status === 'sent') {
    return (
      <div className="flex items-center">
        <Check className="w-3 h-3 text-gray-400" />
      </div>
    );
  }
  
  // Default - show single tick for any agent message without specific status
  return (
    <div className="flex items-center">
      <Check className="w-3 h-3 text-gray-400" />
    </div>
  );
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

export default function ChatWindow({ 
  conversation, 
  messages, 
  setMessages, 
  onBack, 
  onMessageSent 
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isFirstLoad = useRef(true);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation) {
      fetchMessages(1);
    } else {
      setMessages([]);
      setPage(1);
      setHasMore(true);
    }
  }, [conversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!isFirstLoad.current && messages.length > 0) {
      scrollToBottom();
    }
    isFirstLoad.current = false;
  }, [messages.length]);

  const fetchMessages = async (pageNum: number) => {
    if (!conversation) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/omni/conversations/${conversation.id}/messages?page=${pageNum}&limit=20`);
      
      if (response.data) {
        const newMessages = response.data.messages || response.data;
        
        // For messages loaded from history, set status to 'delivered' for agent messages
        const messagesWithStatus = newMessages.map((msg: Message) => {
          if (msg.sender === 'human_agent' && !msg.status) {
            return { ...msg, status: 'delivered' };
          }
          return msg;
        });
        
        if (pageNum === 1) {
          setMessages(messagesWithStatus);
          setTimeout(scrollToBottom, 100);
        } else {
          setMessages(prev => [...messagesWithStatus, ...prev]);
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

  // const handleSend = async () => {
  //   if (!newMessage.trim() || !conversation || sending) return;

  //   const messageContent = newMessage.trim();
  //   setNewMessage('');
  //   setSending(true);

  //   // Create temporary message with SINGLE tick (sent status)
  //   const tempId = Date.now();
  //   const tempMessage: Message = {
  //     id: tempId,
  //     content: messageContent,
  //     sender: 'human_agent',
  //     timestamp: Date.now(),
  //     type: 'text',
  //     status: 'sent',  // Single tick
  //     media_url: null
  //   };
    
  //   // Add temp message to UI immediately
  //   setMessages(prev => [...prev, tempMessage]);
  //   scrollToBottom();

  //   try {
  //     // Send to API
  //     const response = await api.post(`/omni/conversations/${conversation.id}/send-message`, {
  //       message: messageContent
  //     });

  //     if (response.data) {
  //       // Don't add message here - wait for WebSocket echo
  //       // Just notify parent that message was sent successfully
  //       onMessageSent(tempId, response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //     notifyResponse(error, '', 'Failed to send message');
  //     // Remove temp message on error
  //     setMessages(prev => prev.filter(msg => msg.id !== tempId));
  //     setNewMessage(messageContent);
  //   } finally {
  //     setSending(false);
  //   }
  // };


// In ChatWindow.tsx - handleSend function
const handleSend = async () => {
  if (!newMessage.trim() || !conversation || sending) return;

  const messageContent = newMessage.trim();
  setNewMessage('');
  setSending(true);

  // Generate a truly unique temporary ID that we can match later
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const tempMessage: Message = {
    id: tempId as any, // Temporary ID
    content: messageContent,
    sender: 'human_agent',
    timestamp: Date.now(),
    type: 'text',
    status: 'sent',  // Single tick
    media_url: null
  };
  
  // Add temp message to UI
  setMessages(prev => [...prev, tempMessage]);
  scrollToBottom();

  try {
    // Store temp ID in sessionStorage or context to match with echo
    sessionStorage.setItem(`pending_${tempId}`, JSON.stringify({
      content: messageContent,
      timestamp: Date.now()
    }));
    
    const response = await api.post(`/omni/conversations/${conversation.id}/send-message`, {
      message: messageContent
    });

    if (response.data) {
      // Don't do anything here - wait for WebSocket
      console.log('Message sent successfully, waiting for echo...');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    notifyResponse(error, '', 'Failed to send message');
    setMessages(prev => prev.filter(msg => msg.id !== tempId));
    setNewMessage(messageContent);
    sessionStorage.removeItem(`pending_${tempId}`);
  } finally {
    setSending(false);
  }
};

  
  // Function to update message status when echo arrives
  const updateMessageStatus = useCallback((tempId: number, actualMessage: Message) => {
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === tempId) {
          // Update temp message with actual data and DOUBLE tick
          return {
            ...actualMessage,
            status: 'delivered'  // Double tick
          };
        }
        return msg;
      })
    );
  }, []);

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
        scrollToBottom();
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
    const date = formatDate(message.timestamp);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

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
          src={conversation.participant.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.participant.name)}&background=7032e5&color=fff`}
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

        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex justify-center mb-3">
                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {date}
                </span>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-2 ${
                    message.sender === 'human_agent' ? 'justify-end' : 'justify-start'
                  }`}
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
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div className={`flex items-center justify-end gap-1 mt-0.5 ${
                          message.sender === 'human_agent' ? 'text-primary-100' : 'text-gray-400'
                        }`}>
                          <span className="text-[10px]">{formatTime(message.timestamp)}</span>
                          {/* Show status only for agent messages */}
                          <MessageStatus 
                            status={message.status} 
                            isFromAgent={message.sender === 'human_agent'} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(message.type === 'image' || message.type === 'video') && (
                    <div className="max-w-[72%]">
                      {message.type === 'image' ? (
                        <img
                          src={message.media_url || ''}
                          alt="Shared"
                          className="rounded-2xl shadow-sm border border-gray-200 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => message.media_url && window.open(message.media_url, '_blank')}
                        />
                      ) : (
                        <video
                          src={message.media_url || ''}
                          controls
                          className="rounded-2xl shadow-sm border border-gray-200 max-w-full h-auto"
                        />
                      )}
                      <div className={`flex items-center gap-1 mt-0.5 ${
                        message.sender === 'human_agent' ? 'justify-end' : 'justify-start'
                      } text-gray-400`}>
                        <span className="text-[10px]">{formatTime(message.timestamp)}</span>
                        <MessageStatus 
                          status={message.status} 
                          isFromAgent={message.sender === 'human_agent'} 
                        />
                      </div>
                    </div>
                  )}

                  {message.type === 'file' && (
                    <div className="max-w-[72%]">
                      <a
                        href={message.media_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          block px-3 py-2 rounded-2xl
                          ${message.sender === 'human_agent'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm truncate">Download File</span>
                        </div>
                        <div className={`flex items-center justify-end gap-1 mt-0.5 ${
                          message.sender === 'human_agent' ? 'text-primary-100' : 'text-gray-400'
                        }`}>
                          <span className="text-[10px]">{formatTime(message.timestamp)}</span>
                          <MessageStatus 
                            status={message.status} 
                            isFromAgent={message.sender === 'human_agent'} 
                          />
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-3 py-2.5 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          {/* <input
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
          </button> */}
          
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