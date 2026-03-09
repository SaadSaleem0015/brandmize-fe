import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { MessageCircle } from "lucide-react";
import ChatWindow from "../Components/inbox/ChatWindow";
import ConversationList from "../Components/inbox/ConversationList";

// Mock data type
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

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    participant_name: 'Sarah Johnson',
    participant_username: '@sarahj',
    profile_picture_url: 'https://images.unsplash.com/photo-1494790108777-466fd06c7a9c?w=150',
    last_message_preview: 'Hey, thanks for getting back to me!',
    last_message_at: '2024-01-15T10:30:00Z',
    unread_count: 3,
    channel: 'instagram'
  },
  {
    id: '2',
    participant_name: 'Mike Chen',
    participant_username: 'mike.chen',
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    last_message_preview: 'When can we schedule a call?',
    last_message_at: '2024-01-15T09:15:00Z',
    unread_count: 0,
    channel: 'messenger'
  },
  {
    id: '3',
    participant_name: 'Emma Watson',
    participant_username: '+1 234 567 890',
    profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    last_message_preview: 'I received your message about the project',
    last_message_at: '2024-01-14T22:45:00Z',
    unread_count: 1,
    channel: 'whatsapp'
  },
  {
    id: '4',
    participant_name: 'Alex Thompson',
    participant_username: '@alex_t',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    last_message_preview: 'The design looks great!',
    last_message_at: '2024-01-14T18:20:00Z',
    unread_count: 0,
    channel: 'instagram'
  },
  {
    id: '5',
    participant_name: 'David Miller',
    participant_username: '@david_m',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    last_message_preview: 'The design looks great!',
    last_message_at: '2024-01-14T18:20:00Z',
    unread_count: 0,
    channel: 'instagram'
  },
  {
    id: '6',
    participant_name: 'Rachel Green',
    participant_username: '@rachel_g',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    last_message_preview: 'The design looks great!',
    last_message_at: '2024-01-14T18:20:00Z',
    unread_count: 0,
    channel: 'instagram'
  },
  {
    id: '7',
    participant_name: 'Monica Geller',
    participant_username: '@monica_g',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    last_message_preview: 'The design looks great!',
    last_message_at: '2024-01-14T18:20:00Z',
    unread_count: 0,
    channel: 'instagram'
  },
  {
    id: '8',
    participant_name: 'Chandler Bing',
    participant_username: '@chandler_b',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    last_message_preview: 'The design looks great!',
    last_message_at: '2024-01-14T18:20:00Z',
    unread_count: 0,
    channel: 'instagram'
  },
  {
    id: '9',
    participant_name: 'Joey Tribbiani',
    participant_username: '@joey_t',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    last_message_preview: 'The design looks great!',
    last_message_at: '2024-01-14T18:20:00Z',
    unread_count: 0,
    channel: 'instagram'
  },
  {
    id: '10',
    participant_name: 'Phoebe Buffay',
    participant_username: '@phoebe_b',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    last_message_preview: 'The design looks great!',
    last_message_at: '2024-01-14T18:20:00Z',
    unread_count: 0,
    channel: 'instagram'
  },
  {
    id: '11',
    participant_name: 'Ross Geller',
    participant_username: '@ross_g',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    last_message_preview: 'The design looks great!',
    last_message_at: '2024-01-14T18:20:00Z',
    unread_count: 0,
    channel: 'instagram'
  },
  {
    id: '12',
    participant_name: 'Lisa Wang',
    participant_username: 'lisa.wang',
    profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    last_message_preview: 'Can you send me the files?',
    last_message_at: '2024-01-14T14:10:00Z',
    unread_count: 2,
    channel: 'messenger'
  }
];

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const { conversationId } = useParams();

  // Load mock data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 500);
  }, []);

  // Handle URL param for conversation
  useEffect(() => {
    if (conversationId) {
      setSelectedConversation(conversationId);
      setMobileView('chat');
    }
  }, [conversationId]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setMobileView('chat');
    // Update URL without reload
    window.history.pushState({}, '', `/inbox/${id}`);
  };

  const handleBackToList = () => {
    setMobileView('list');
    window.history.pushState({}, '', '/inbox');
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header - Inside the card */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-600" />
          Unified Inbox
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          All your conversations from Instagram, Messenger, and WhatsApp
        </p>
      </div>

      {/* Main content - Takes remaining height */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Conversation List */}
        <div
          className={`
            ${mobileView === 'list' ? 'flex' : 'hidden'} 
            md:flex md:w-80 lg:w-96 flex-col border-r border-gray-200 bg-white h-full
          `}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
            loading={loading}
          />
        </div>

        {/* Chat Window */}
        <div
          className={`
            flex-1 flex flex-col bg-gray-50 min-h-0
            ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}
          `}
        >
          <ChatWindow
            conversation={selectedConversationData}
            onBack={handleBackToList}
          />
        </div>
      </div>
    </div>
  );
}