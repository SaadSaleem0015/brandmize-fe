import { useState, useEffect, useMemo } from "react";
import { 
  TbPhone, 
  TbPhoneCheck, 
  TbPhoneX, 
  TbClock, 
  TbTrendingUp, 
  TbUsers, 
  TbMessage,
  TbBrandWhatsapp,
  TbBrandFacebook,
  TbMail,
  TbBrandInstagram,
  TbBrandTelegram,
  TbChartLine,
  TbCalendarStats,
  TbChartBar,
  TbChartPie,
  TbRefresh,
  TbDownload,
  TbDotsVertical,
  TbChevronRight,
  TbChevronLeft,
  TbPhoneCall,
  TbPhoneOff,
  TbPhoneIncoming,
  TbPhoneOutgoing,
  TbSpeakerphone,
  TbMicrophone2,
  TbBrain
} from "react-icons/tb";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

// Types
interface DashboardStats {
  totalCalls: number;
  totalMinutes: number;
  avgCallDuration: number;
  answeredCalls: number;
  missedCalls: number;
  connectedChannels: number;
  totalLeads: number;
  qualifiedLeads: number;
  activeAssistants: number;
}

interface CallData {
  date: string;
  calls: number;
  answered: number;
  missed: number;
  duration: number;
}

interface ChannelData {
  name: string;
  count: number;
  icon: JSX.Element;
  color: string;
  active: boolean;
}

interface CallTypeData {
  name: string;
  value: number;
  color: string;
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    totalMinutes: 0,
    avgCallDuration: 0,
    answeredCalls: 0,
    missedCalls: 0,
    connectedChannels: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    activeAssistants: 0
  });
  const [callHistory, setCallHistory] = useState<CallData[]>([]);
  const [callDistribution, setCallDistribution] = useState<CallTypeData[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      // Generate dates based on time range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const dates = Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), days - 1 - i);
        return format(date, 'yyyy-MM-dd');
      });

      // Generate call history
      const history = dates.map(date => {
        const totalCalls = Math.floor(Math.random() * 50) + 20;
        const answered = Math.floor(totalCalls * (0.6 + Math.random() * 0.3));
        const missed = totalCalls - answered;
        const avgDuration = Math.floor(Math.random() * 180) + 60; // 1-4 minutes in seconds
        
        return {
          date: format(new Date(date), 'MMM dd'),
          calls: totalCalls,
          answered,
          missed,
          duration: avgDuration * totalCalls / 60 // total minutes
        };
      });

      // Calculate totals
      const totalCalls = history.reduce((sum, day) => sum + day.calls, 0);
      const totalMinutes = history.reduce((sum, day) => sum + day.duration, 0);
      const answeredCalls = history.reduce((sum, day) => sum + day.answered, 0);
      const missedCalls = history.reduce((sum, day) => sum + day.missed, 0);

      // Call type distribution
      const distribution = [
        { name: 'Answered', value: answeredCalls, color: '#22c55e' },
        { name: 'Missed', value: missedCalls, color: '#ef4444' },
        { name: 'Voicemail', value: Math.floor(totalCalls * 0.1), color: '#f59e0b' }
      ];

      // Recent activity
      const activity = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        type: ['call', 'lead', 'assistant'][Math.floor(Math.random() * 3)],
        status: ['completed', 'missed', 'qualified'][Math.floor(Math.random() * 3)],
        name: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'][Math.floor(Math.random() * 4)],
        time: `${Math.floor(Math.random() * 60)} minutes ago`,
        duration: Math.floor(Math.random() * 300) + 30,
        channel: ['Phone', 'WhatsApp', 'SMS'][Math.floor(Math.random() * 3)]
      }));

      setStats({
        totalCalls,
        totalMinutes: Math.round(totalMinutes),
        avgCallDuration: Math.round(totalMinutes * 60 / totalCalls),
        answeredCalls,
        missedCalls,
        connectedChannels: 4,
        totalLeads: 2347,
        qualifiedLeads: 892,
        activeAssistants: 3
      });

      setCallHistory(history);
      setCallDistribution(distribution);
      setRecentActivity(activity);
      setLoading(false);
    };

    generateMockData();
  }, [timeRange]);

  // Channel data
  const channels: ChannelData[] = [
    { name: 'Phone', count: 1247, icon: <TbPhone className="w-5 h-5" />, color: 'bg-blue-500', active: true },
    { name: 'WhatsApp', count: 892, icon: <TbBrandWhatsapp className="w-5 h-5" />, color: 'bg-green-500', active: true },
    { name: 'SMS', count: 456, icon: <TbMessage className="w-5 h-5" />, color: 'bg-purple-500', active: true },
    { name: 'Email', count: 234, icon: <TbMail className="w-5 h-5" />, color: 'bg-yellow-500', active: true },
    { name: 'Facebook', count: 0, icon: <TbBrandFacebook className="w-5 h-5" />, color: 'bg-blue-600', active: false },
    { name: 'Instagram', count: 0, icon: <TbBrandInstagram className="w-5 h-5" />, color: 'bg-pink-500', active: false },
  ];

  const activeChannels = channels.filter(c => c.active);

  // Custom tooltip styles
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your calls today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  timeRange === range.value
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <TbRefresh className="w-5 h-5 text-gray-600" />
          </button>
          
          <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <TbDownload className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Calls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Calls</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCalls.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TbPhoneCall className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <TbTrendingUp className="w-4 h-4" />
              +12.5%
            </span>
            <span className="text-gray-400">vs last period</span>
          </div>
        </div>

        {/* Total Minutes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Minutes</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalMinutes.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <TbClock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Avg {stats.avgCallDuration}s per call</span>
          </div>
        </div>

        {/* Answer Rate */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Answer Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {Math.round((stats.answeredCalls / stats.totalCalls) * 100)}%
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <TbPhoneCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">{stats.answeredCalls} answered</span>
            <span className="text-gray-400">•</span>
            <span className="text-red-600">{stats.missedCalls} missed</span>
          </div>
        </div>

        {/* Qualified Leads */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Qualified Leads</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.qualifiedLeads.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <TbUsers className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{Math.round((stats.qualifiedLeads / stats.totalLeads) * 100)}% conversion</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Call Volume</h3>
              <p className="text-sm text-gray-500 mt-1">Daily call activity over time</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Missed</span>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={callHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnswered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="answered" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#colorAnswered)" 
                  name="Answered"
                />
                <Area 
                  type="monotone" 
                  dataKey="missed" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fill="url(#colorMissed)" 
                  name="Missed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Call Distribution Pie */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Call Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={callDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {callDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry, index) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
            {callDistribution.map((item) => (
              <div key={item.name} className="text-center">
                <p className="text-xs text-gray-500">{item.name}</p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row - Channels & Duration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Channels */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Connected Channels</h3>
              <p className="text-sm text-gray-500 mt-1">{activeChannels.length} active channels</p>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Manage
            </button>
          </div>
          
          <div className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${channel.color} bg-opacity-10 rounded-xl flex items-center justify-center ${
                    channel.active ? 'opacity-100' : 'opacity-50'
                  }`}>
                    <div className={channel.active ? channel.color.replace('bg-', 'text-') : 'text-gray-400'}>
                      {channel.icon}
                    </div>
                  </div>
                  <div>
                    <p className={`font-medium ${channel.active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {channel.name}
                    </p>
                    {channel.active && (
                      <p className="text-xs text-gray-500">{channel.count.toLocaleString()} conversations</p>
                    )}
                    {!channel.active && (
                      <p className="text-xs text-gray-400">Not connected</p>
                    )}
                  </div>
                </div>
                {!channel.active && (
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call Duration Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Call Duration Trends</h3>
              <p className="text-sm text-gray-500 mt-1">Average call duration per day</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Duration (min)</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="duration" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Duration (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Third Row - Assistant Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Assistants Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Assistants</h3>
              <p className="text-sm text-gray-500 mt-1">{stats.activeAssistants} active assistants</p>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Sales Assistant', calls: 847, status: 'active', avatar: 'SA' },
              { name: 'Support Bot', calls: 623, status: 'active', avatar: 'SB' },
              { name: 'Lead Qualifier', calls: 412, status: 'active', avatar: 'LQ' },
              { name: 'Appointment Setter', calls: 0, status: 'inactive', avatar: 'AS' },
            ].map((assistant) => (
              <div key={assistant.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    assistant.status === 'active' 
                      ? 'bg-gradient-to-br from-primary-100 to-primary-50' 
                      : 'bg-gray-100'
                  }`}>
                    <span className={`text-sm font-semibold ${
                      assistant.status === 'active' ? 'text-primary-700' : 'text-gray-400'
                    }`}>
                      {assistant.avatar}
                    </span>
                  </div>
                  <div>
                    <p className={`font-medium ${
                      assistant.status === 'active' ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {assistant.name}
                    </p>
                    {assistant.status === 'active' ? (
                      <p className="text-xs text-gray-500">{assistant.calls} calls this month</p>
                    ) : (
                      <p className="text-xs text-gray-400">Not configured</p>
                    )}
                  </div>
                </div>
                {assistant.status === 'active' ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">
                    Setup
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500 mt-1">Latest calls and lead interactions</p>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.type === 'call' 
                      ? 'bg-blue-100 text-blue-600'
                      : activity.type === 'lead'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'call' ? <TbPhone className="w-5 h-5" /> :
                     activity.type === 'lead' ? <TbUsers className="w-5 h-5" /> :
                     <TbBrain className="w-5 h-5" />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{activity.name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                        activity.status === 'missed' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500">{activity.channel}</p>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.duration && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <p className="text-xs text-gray-500">{Math.floor(activity.duration / 60)}:{(activity.duration % 60).toString().padStart(2, '0')} min</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <TbDotsVertical className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Summary */}

    </div>
  );
}