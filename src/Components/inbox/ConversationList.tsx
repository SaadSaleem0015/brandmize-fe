import { formatDistanceToNow } from 'date-fns';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface Conversation {
  id: string;
  participant_name: string;
  participant_username: string;
  profile_picture_url: string;
  last_message_preview: string;
  last_message_at: string;
  unread_count: number;
  channel: 'instagram' | 'messenger' | 'whatsapp';
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'instagram':
      return <Instagram className="w-3.5 h-3.5" />;
    case 'messenger':
      return <Facebook className="w-3.5 h-3.5" />;
    case 'whatsapp':
      return <FaWhatsapp className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

const getChannelBadgeColor = (channel: string) => {
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

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
      <MessageCircle className="w-8 h-8 text-primary-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
    <p className="text-sm text-gray-500 mb-6">
      Connect your social accounts to start receiving messages
    </p>
    <div className="space-y-3 w-full max-w-xs">
      <button className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        <Instagram className="w-4 h-4" />
        Connect Instagram
      </button>
      <button className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
        <Facebook className="w-4 h-4" />
        Connect Messenger
      </button>
      <button className="w-full px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
        <FaWhatsapp className="w-4 h-4" />
        Connect WhatsApp
      </button>
    </div>
  </div>
);

export default function ConversationList({ conversations, selectedId, onSelect, loading }: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-white">
          <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Loading your inbox…
          </p>
        </div>
        
        {/* Scrollable Loading Skeletons */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-11 h-11 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-white">
          <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Connect your channels to start receiving messages
          </p>
        </div>
        
        {/* Scrollable Empty State */}
        <div className="flex-1 overflow-y-auto">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {conversations.length} active threads
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Conversation List - This will scroll independently */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`
                w-full flex items-start gap-3 px-3.5 py-3 rounded-xl transition-colors
                hover:bg-gray-50
                ${selectedId === conversation.id ? 'bg-primary-50 border border-primary-100' : 'border border-transparent'}
              `}
            >
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <img
                  src={conversation.profile_picture_url}
                  alt={conversation.participant_name}
                  className="w-11 h-11 rounded-full object-cover"
                />
                {/* Channel Indicator - Small badge */}
                <div className={`
                  absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white
                  flex items-center justify-center text-white
                  ${getChannelBadgeColor(conversation.channel)}
                `}>
                  <span className="text-[10px]">
                    {getChannelIcon(conversation.channel)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-medium text-gray-900 truncate">
                    {conversation.participant_name}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 truncate mb-1.5">
                  {conversation.last_message_preview}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 truncate max-w-[60%]">
                    {conversation.participant_username.startsWith('@') 
                      ? conversation.participant_username 
                      : `@${conversation.participant_username}`}
                  </span>
                  
                  {/* Unread Badge */}
                  {conversation.unread_count > 0 && (
                    <span className="bg-primary-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}