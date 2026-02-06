import { useState, useEffect } from 'react';
import { 
  Search, Filter, MessageSquare, Phone, Mail,
  MoreVertical, Clock, Star, Archive, Trash2,
  Users, TrendingUp, BarChart3, Calendar, Download, Eye,
  Bot, Workflow
} from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  department: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  starred: boolean;
  assigned: boolean;
  avatar?: string;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

export function AdminDashboard() {
  const [activeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Statistics data
  const stats: StatCard[] = [
    {
      title: 'Total Conversations',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-primary-100 text-primary-600'
    },
    {
      title: 'Active Agents',
      value: '24',
      change: '+2',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-secondary-100 text-secondary-600'
    },
    {
      title: 'Avg Response Time',
      value: '2m 34s',
      change: '-45s',
      trend: 'down',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-accent-100 text-accent-600'
    },
    {
      title: 'Satisfaction Rate',
      value: '94.2%',
      change: '+3.1%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600'
    }
  ];


  // Mock conversations data
  const mockConversations: Conversation[] = [
    { id: '1', name: 'Olivia Evans', department: 'Marketing', lastMessage: 'Hello! I wanted to ask which services and types of facial treatments you offer at your spa?', time: '16:17', unread: false, starred: true, assigned: true },
    { id: '2', name: 'Hannah Brown', department: 'Marketing', lastMessage: 'Hello Olivia. You can find more information about our services and prices below 😊', time: '15:42', unread: true, starred: false, assigned: false },
    { id: '3', name: 'Noah Taylor', department: 'Headquarters', lastMessage: 'How about tomorrow at 3PM?', time: '14:30', unread: false, starred: true, assigned: true },
    { id: '4', name: 'Harry Jones', department: 'Location London', lastMessage: 'Thank you so much! I will let you know...', time: '13:15', unread: false, starred: false, assigned: false },
    { id: '5', name: 'Amelia Davies', department: 'Headquarters', lastMessage: 'That works for me! Then let\'s have our...', time: '12:45', unread: true, starred: false, assigned: true },
    { id: '6', name: 'Ivy Williams', department: 'Marketing', lastMessage: 'Thank you very much! I will go ahead a...', time: '11:20', unread: false, starred: true, assigned: false },
    { id: '7', name: 'Edward Norton', department: 'Headquarters', lastMessage: 'Dear Sir or Madam, I hope you are doing...', time: '10:05', unread: true, starred: false, assigned: true },
    { id: '8', name: 'Sophia Miller', department: 'Support', lastMessage: 'I need help with my recent purchase...', time: '09:30', unread: false, starred: false, assigned: false },
  ];

  useEffect(() => {
    // In real app, fetch conversations from API
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        // const response = await api.get('/conversations');
        // setConversations(response.data);
        setConversations(mockConversations); // Using mock data for now
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(conv => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return conv.unread;
    if (activeFilter === 'assigned') return conv.assigned;
    if (activeFilter === 'starred') return conv.starred;
    if (activeFilter === 'marketing') return conv.department === 'Marketing';
    if (activeFilter === 'support') return conv.department === 'Support';
    return true;
  }).filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectConversation = (id: string) => {
    setSelectedConversations(prev =>
      prev.includes(id)
        ? prev.filter(convId => convId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`${action} selected conversations:`, selectedConversations);
    // Implement bulk action logic here
  };

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Search Bar - Inline with content */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-2.5 max-w-2xl">
          <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search conversations, contacts, messages..."
            className="bg-transparent border-none focus:outline-none w-full placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Filter className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.title} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Conversation Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversation List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">All Conversations</h2>
                        <p className="text-gray-600 text-sm">Recent customer interactions</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition">
                          <Download className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedConversations.length > 0 && (
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-sm text-gray-600">
                          {selectedConversations.length} selected
                        </span>
                        <button 
                          onClick={() => handleBulkAction('archive')}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
                        >
                          <Archive className="w-4 h-4 inline mr-2" />
                          Archive
                        </button>
                        <button 
                          onClick={() => handleBulkAction('delete')}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition"
                        >
                          <Trash2 className="w-4 h-4 inline mr-2" />
                          Delete
                        </button>
                      </div>
                    )}

                    {/* Tabs */}
                    <div className="flex space-x-1 border-b border-gray-200">
                      <button className={`px-4 py-2 text-sm font-medium ${activeFilter === 'all' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}>
                        All Conversations
                      </button>
                      <button className={`px-4 py-2 text-sm font-medium ${activeFilter === 'unread' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}>
                        Unread
                      </button>
                      <button className={`px-4 py-2 text-sm font-medium ${activeFilter === 'starred' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}>
                        Starred
                      </button>
                    </div>
                  </div>

                  {/* Conversation List */}
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    {isLoading ? (
                      <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading conversations...</p>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      filteredConversations.map((conv) => (
                        <div 
                          key={conv.id}
                          className={`p-4 hover:bg-gray-50 transition ${conv.unread ? 'bg-blue-50' : ''} ${
                            selectedConversations.includes(conv.id) ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <input
                              type="checkbox"
                              checked={selectedConversations.includes(conv.id)}
                              onChange={() => toggleSelectConversation(conv.id)}
                              className="mt-1"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {conv.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h3 className="font-medium text-gray-900">{conv.name}</h3>
                                      {conv.assigned && (
                                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                                          Assigned
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500">{conv.department}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">{conv.time}</span>
                                  <button className="p-1 hover:bg-gray-200 rounded transition">
                                    {conv.starred ? (
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    ) : (
                                      <Star className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                  <button className="p-1 hover:bg-gray-200 rounded transition">
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                  </button>
                                </div>
                              </div>
                              <p className={`text-sm truncate ${conv.unread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                {conv.lastMessage}
                              </p>
                              <div className="flex items-center space-x-4 mt-3">
                                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                  <MessageSquare className="w-4 h-4 inline mr-1" />
                                  Reply
                                </button>
                                <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                                  <Phone className="w-4 h-4 inline mr-1" />
                                  Call
                                </button>
                                <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                                  <Eye className="w-4 h-4 inline mr-1" />
                                  View
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Quick Stats & Actions */}
              <div className="space-y-6">
                {/* AI Agent Status */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">AI Agent Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Active</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Support Agent</p>
                          <p className="text-sm text-gray-600">AI Chatbot</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                          <Bot className="w-5 h-5 text-secondary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Sales Agent</p>
                          <p className="text-sm text-gray-600">WhatsApp Auto</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">Online</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 px-4 rounded-xl transition">
                    Configure AI Agent
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition flex flex-col items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-2">
                        <Workflow className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Automation</span>
                    </button>
                    <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition flex flex-col items-center">
                      <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center mb-2">
                        <BarChart3 className="w-5 h-5 text-secondary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Integrations</span>
                    </button>
                    <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition flex flex-col items-center">
                      <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center mb-2">
                        <BarChart3 className="w-5 h-5 text-accent-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Analytics</span>
                    </button>
                    <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition flex flex-col items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Team</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">AI Agent responded</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New email conversation</p>
                        <p className="text-xs text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Missed call logged</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
  );
}