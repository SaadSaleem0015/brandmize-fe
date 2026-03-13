// Components/inbox/ConversationList.tsx
import { formatDistanceToNow } from 'date-fns';
import { Instagram, Facebook, MessageCircle, RefreshCw } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Conversation } from '../../Helpers/inbox.types';
import { useState } from 'react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
  onRefresh: () => void;
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

const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
      <MessageCircle className="w-8 h-8 text-primary-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
    <p className="text-sm text-gray-500 mb-6">
      Connect your social accounts to start receiving messages
    </p>
    <button
      onClick={onRefresh}
      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
    >
      Refresh
    </button>
  </div>
);

export default function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect, 
  loading,
  onRefresh 
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations
    .filter(conv => 
      conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participant.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100 bg-white">
          <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Loading your inbox…
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-50">
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-2.5 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100 bg-white space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {filteredConversations.length} {filteredConversations.length === 1 ? 'thread' : 'threads'}
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search conversations..."
          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Conversation List */}
      {filteredConversations.length === 0 ? (
        <div className="flex-1 overflow-y-auto">
          <EmptyState onRefresh={onRefresh} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="px-2.5 py-2 space-y-1.5">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={`
                  w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-all
                  hover:bg-gray-50 hover:shadow-sm
                  ${selectedId === conversation.id 
                    ? 'bg-primary-50 border border-primary-100 shadow-sm' 
                    : 'border border-transparent'}
                `}
              >
                {/* Profile Picture */}
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      conversation.participant.profile_picture_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.participant.name)}&background=7032e5&color=fff`
                    }
                    alt={conversation.participant.name}
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.participant.name)}&background=7032e5&color=fff`;
                    }}
                  />
                  {/* Channel Indicator */}
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
                  {/* Top row: name + time */}
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.participant.name}
                    </h3>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Middle row: last message preview */}
                  {/* <p
                    className={`truncate mb-1 ${
                      conversation.unread_count > 0
                        ? 'text-xs text-gray-900 font-medium'
                        : 'text-xs text-gray-600'
                    }`}
                  >
                    {conversation.last_message_preview || 'No messages yet'}
                  </p> */}

                  {/* Bottom row: username + unread badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-gray-700 truncate max-w-[65%]">
                      {conversation.last_message_preview || "No messages yet"}
                    </span>

                    {/* {conversation.unread_count > 0 && (
                      <span className="inline-flex min-w-[1.5rem] h-5 items-center justify-center rounded-full bg-primary-600 text-white text-[11px] font-semibold shadow-sm">
                        {conversation.unread_count}
                      </span>
                    )} */}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}