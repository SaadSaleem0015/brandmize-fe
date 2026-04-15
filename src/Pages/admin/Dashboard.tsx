import { useState, useEffect } from 'react';
import { 
  Search, Filter, MessageSquare, Phone, Mail,
  MoreVertical, Clock, Star, Archive, Trash2,
  Users, TrendingUp, BarChart3, Calendar, Download, Eye,
  Bot, Workflow, ChevronDown
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

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

export function AdminDashboard() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
  ];

  const getPeriodLabel = (value: string) => {
    const option = periodOptions.find(opt => opt.value === value);
    return option ? option.label : 'Last 30 Days';
  };

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

  // Mock chart data
  const userGrowthData = [
    { date: 'Jan', count: 120 },
    { date: 'Feb', count: 145 },
    { date: 'Mar', count: 178 },
    { date: 'Apr', count: 210 },
    { date: 'May', count: 256 },
    { date: 'Jun', count: 310 },
  ];

  const plData = {
    total_call_cost: 12450,
    total_purchased_number_cost: 8750,
    total_call_profit: 28900,
    total_purchased_number_profit: 15600,
    net_profit: 23300,
  };

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        setConversations(mockConversations);
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
  };

  // Chart options for user growth
  const chartOptions = {
    title: {
      text: 'User Growth',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: {
        color: '#f3f4f6',
        fontSize: 12,
      },
      formatter: function (params: any) {
        return `${params[0].axisValue}<br/>Users: ${params[0].value}`;
      },
    },
    grid: {
      top: 60,
      left: 50,
      right: 20,
      bottom: 30,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: userGrowthData.map((item) => item.date),
      axisLabel: { 
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500',
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500',
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Users',
        type: 'line',
        data: userGrowthData.map((item) => item.count),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#7032e5',
        },
        itemStyle: {
          color: '#7032e5',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(112, 50, 229, 0.15)' },
              { offset: 1, color: 'rgba(112, 50, 229, 0.02)' },
            ],
          },
        },
        animationDuration: 800,
        symbol: 'circle',
        symbolSize: 7,
      },
    ],
  };

  // Chart options for financial overview
  const plChartOptions = {
    title: {
      text: 'Financial Overview',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: {
        color: '#f3f4f6',
        fontSize: 12,
      },
      formatter: function (params: any) {
        return params
          .map(
            (param: any) => `${param.seriesName}: $${param.value.toLocaleString()}`
          )
          .join('<br/>');
      },
    },
    legend: {
      data: ['Cost', 'Profit'],
      left: 'center',
      bottom: 5,
      textStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '500',
      },
      itemWidth: 25,
      itemHeight: 12,
    },
    grid: {
      top: 60,
      left: 60,
      right: 30,
      bottom: 50,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['Call Cost', 'Number Cost', 'Total Cost', 'Call Profit', 'Number Profit', 'Net Profit'],
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500',
        rotate: 15,
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500',
        formatter: function (value: number) {
          return `$${(value / 1000).toFixed(0)}k`;
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Cost',
        type: 'bar',
        data: [
          plData.total_call_cost,
          plData.total_purchased_number_cost,
          plData.total_call_cost + plData.total_purchased_number_cost,
          0,
          0,
          0,
        ],
        barWidth: '30%',
        itemStyle: {
          color: '#ef4444',
          borderRadius: [4, 4, 0, 0],
        },
        animationDuration: 800,
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => `$${(params.value / 1000).toFixed(0)}k`,
          fontSize: 10,
          color: '#ef4444',
          fontWeight: '600',
        },
      },
      {
        name: 'Profit',
        type: 'bar',
        data: [
          0,
          0,
          0,
          plData.total_call_profit,
          plData.total_purchased_number_profit,
          plData.net_profit,
        ],
        barWidth: '30%',
        itemStyle: {
          color: '#10b981',
          borderRadius: [4, 4, 0, 0],
        },
        animationDuration: 800,
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => `$${(params.value / 1000).toFixed(0)}k`,
          fontSize: 10,
          color: '#10b981',
          fontWeight: '600',
        },
      },
    ],
  };

  const stats = [
    { title: 'Total Conversations', value: '1,247', change: '+12.5%', trend: 'up', icon: <MessageSquare className="w-5 h-5" /> },
    { title: 'Active Agents', value: '24', change: '+2', trend: 'up', icon: <Users className="w-5 h-5" /> },
    { title: 'Avg Response Time', value: '2m 34s', change: '-45s', trend: 'down', icon: <Clock className="w-5 h-5" /> },
    { title: 'Satisfaction Rate', value: '94.2%', change: '+3.1%', trend: 'up', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor conversations, agents, and system performance</p>
        </div>
        
        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:border-gray-400 transition-colors min-w-[160px] shadow-sm"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="flex-1 text-left">{getPeriodLabel(selectedPeriod)}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showPeriodDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPeriodDropdown(false)} />
              <div className="absolute right-0 mt-2 w-full min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {periodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedPeriod(option.value);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedPeriod === option.value 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-emerald-700' : 'text-red-700'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm max-w-2xl">
          <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search conversations, contacts, messages..."
            className="bg-transparent border-none focus:outline-none w-full text-gray-700 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Filter className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <ReactECharts option={chartOptions} style={{ height: "360px" }} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <ReactECharts option={plChartOptions} style={{ height: "360px" }} />
        </div>
      </div>


      {/* Bottom Actions */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">System Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Reports", icon: "📊", color: "bg-primary-50 text-primary-700 hover:bg-primary-100" },
            { name: "Users", icon: "👥", color: "bg-secondary-50 text-secondary-700 hover:bg-secondary-100" },
            { name: "Settings", icon: "⚙️", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
            { name: "Logs", icon: "📋", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
          ].map((action, index) => (
            <button
              key={index}
              className={`${action.color} p-3 rounded-lg transition-colors duration-200 flex flex-col items-center gap-1.5 border border-transparent`}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-xs font-medium">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}