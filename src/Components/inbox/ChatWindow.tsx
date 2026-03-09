import { useState } from 'react';
import { ArrowLeft, Send, Paperclip, Image, Smile } from 'lucide-react';
import { Instagram, Facebook } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'participant';
  timestamp: string;
  type: 'text' | 'image' | 'file';
  media_url?: string;
}

interface Conversation {
  id: string;
  participant_name: string;
  participant_username: string;
  profile_picture_url: string;
  channel: 'instagram' | 'messenger' | 'whatsapp';
}

interface ChatWindowProps {
  conversation?: Conversation;
  onBack: () => void;
}

// Mock messages
const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hi there! I have a question about your services',
    sender: 'participant',
    timestamp: '2024-01-15T10:00:00Z',
    type: 'text'
  },
  {
    id: '2',
    content: 'Of course! How can I help you today?',
    sender: 'user',
    timestamp: '2024-01-15T10:05:00Z',
    type: 'text'
  },
  {
    id: '3',
    content: 'I saw your pricing page and was wondering about the enterprise plan',
    sender: 'participant',
    timestamp: '2024-01-15T10:10:00Z',
    type: 'text'
  },
  {
    id: '4',
    content: 'We have custom enterprise solutions. Would you like to schedule a call with our sales team?',
    sender: 'user',
    timestamp: '2024-01-15T10:12:00Z',
    type: 'text'
  },
  {
    id: '5',
    content: 'Yes, that would be great! Here\'s what I\'m looking for',
    sender: 'participant',
    timestamp: '2024-01-15T10:15:00Z',
    type: 'text'
  },
  {
    id: '6',
    content: 'Check out this screenshot of what I need',
    sender: 'participant',
    timestamp: '2024-01-15T10:15:00Z',
    type: 'image',
    media_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
  },
  {
    id: '7',
    content: 'Perfect! I\'ll share this with our team',
    sender: 'user',
    timestamp: '2024-01-15T10:20:00Z',
    type: 'text'
  },
  {
    id: '8',
    content: 'When would be a good time for a call?',
    sender: 'user',
    timestamp: '2024-01-15T10:21:00Z',
    type: 'text'
  },
  {
    id: '9',
    content: 'Tomorrow at 2 PM works for me',
    sender: 'participant',
    timestamp: '2024-01-15T10:25:00Z',
    type: 'text'
  }
];

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

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages] = useState<Message[]>(mockMessages);

  if (!conversation) {
    return <EmptyChatState />;
  }

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // Handle send message
    console.log('Sending:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gray-50">
      {/* Chat Header - Fixed */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
        {/* Back button for mobile */}
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 md:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Profile Picture */}
        <img
          src={conversation.profile_picture_url}
          alt={conversation.participant_name}
          className="w-10 h-10 rounded-full object-cover"
        />

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-gray-900 truncate">
              {conversation.participant_name}
            </h2>
            {/* Channel Indicator */}
            <div className={`
              w-5 h-5 rounded-full flex items-center justify-center text-white
              ${getChannelHeaderColor(conversation.channel)}
            `}>
              {getChannelIcon(conversation.channel)}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {conversation.participant_username.startsWith('@') 
              ? conversation.participant_username 
              : `@${conversation.participant_username}`}
          </p>
        </div>
      </div>

      {/* Messages - Scrollable Area - This will scroll independently */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 md:px-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'text' && (
                <div
                  className={`
                    max-w-[70%] px-4 py-2 rounded-2xl
                    ${message.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-200'
                    }
                  `}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {message.type === 'image' && (
                <div className="max-w-[70%]">
                  <img
                    src={message.media_url}
                    alt="Shared"
                    className="rounded-2xl shadow-sm border border-gray-200 max-w-full h-auto"
                  />
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'} text-gray-500`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Smile className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}