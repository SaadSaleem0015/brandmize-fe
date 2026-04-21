import { useState, useEffect } from 'react';
import { 
  Phone,
  Users, TrendingUp, BarChart3, Calendar,
  Bot, ChevronDown, Database, Zap, Globe,
  Settings
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { api } from '../../Helpers/BackendRequest';

interface DashboardStats {
  total_active_users: number;
  total_assistants: number;
  total_phone_numbers: number;
  channel_connections_per_type: Record<string, number>;
  user_growth_over_time: Array<{ date: string; count: number }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [userGrowthData, setUserGrowthData] = useState<Array<{ date: string; count: number }>>([]);

  const periodOptions = [
    { value: '30d', label: 'Last 30 Days' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
  ];

  const getPeriodLabel = (value: string) => {
    const option = periodOptions.find(opt => opt.value === value);
    return option ? option.label : 'Last 30 Days';
  };

  // Fetch dashboard data
  // Fetch dashboard data
async function fetchDashboardData() {
  setIsLoading(true);
  setError(null);

  try {
    const { data } = await api.get<DashboardStats>('/admin/dashboard');
    setStats(data);

  } catch (err: any) {

    console.error('Failed to fetch dashboard data:', err);

    setError(
      err.response?.data?.message ||
      err.message ||
      'Failed to fetch dashboard data'
    );

  } finally {

    setIsLoading(false);

  }
}


// Fetch user growth
async function fetchUserGrowth() {

  try {

    const { data } = await api.get<
      Array<{ date: string; count: number }>
    >(
      `/admin/users-stats?period=${selectedPeriod}`
    );

    setUserGrowthData(data);

  } catch (err: any) {

    console.error('Failed to fetch user growth:', err);

  }

}


// ✅ FIXED EFFECTS

useEffect(() => {
  fetchDashboardData();
  fetchUserGrowth();
}, []);


useEffect(() => {
  fetchUserGrowth();
}, [selectedPeriod]);

  // Prepare stats cards data
  const statCards = stats ? [
    { 
      title: 'Active Users', 
      value: stats.total_active_users.toLocaleString(), 
      icon: <Users className="w-5 h-5" />,
      color: 'bg-primary-50 text-primary-600'
    },
    { 
      title: 'AI Assistants', 
      value: stats.total_assistants.toLocaleString(), 
      icon: <Bot className="w-5 h-5" />,
      color: 'bg-secondary-50 text-secondary-600'
    },
    { 
      title: 'Phone Numbers', 
      value: stats.total_phone_numbers.toLocaleString(), 
      icon: <Phone className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      title: 'Channel Connections', 
      value: Object.values(stats.channel_connections_per_type).reduce((a, b) => a + b, 0).toLocaleString(), 
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-amber-50 text-amber-600'
    },
  ] : [];

  // Channel connections pie chart
  const channelChartOptions = {
    title: {
      text: 'Channel Connections',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
      },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: {
        color: '#f3f4f6',
        fontSize: 12,
      },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 40,
      textStyle: {
        color: '#6b7280',
        fontSize: 12,
      },
      itemWidth: 25,
      itemHeight: 12,
    },
    series: [
      {
        name: 'Channel Connections',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['55%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 11,
          fontWeight: '500',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
        data: stats ? Object.entries(stats.channel_connections_per_type).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: value,
        })) : [],
        color: ['#7032e5', '#5ef839', '#fbbf24', '#3b82f6', '#ef4444', '#8b5cf6'],
      },
    ],
  };

  // User growth line chart
  const userGrowthChartOptions = {
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
        return `${params[0].axisValue}<br/>New Users: ${params[0].value}`;
      },
    },
    grid: {
      top: 60,
      left: 50,
      right: 20,
      bottom: 40,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: userGrowthData.map((item) => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      axisLabel: { 
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500',
        rotate: 45,
        interval: userGrowthData.length > 30 ? Math.floor(userGrowthData.length / 10) : 0,
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
      name: 'Number of Users',
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '500',
      },
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
        name: 'New Users',
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
        symbolSize: 6,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <TrendingUp className="text-red-700 text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-500 text-center mb-6">{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor system performance and user analytics</p>
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
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.color.split(' ')[0]} ${stat.color.split(' ')[1]}`}>
                {stat.icon}
              </div>
              <Database className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Channel Connections Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          {stats && Object.keys(stats.channel_connections_per_type).length > 0 ? (
            <ReactECharts option={channelChartOptions} style={{ height: "380px" }} />
          ) : (
            <div className="h-[380px] flex flex-col items-center justify-center">
              <Globe className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No channel connections found</p>
            </div>
          )}
        </div>

        {/* User Growth Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          {userGrowthData.length > 0 ? (
            <ReactECharts option={userGrowthChartOptions} style={{ height: "380px" }} />
          ) : (
            <div className="h-[380px] flex flex-col items-center justify-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No user growth data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Phone Numbers", icon: <Phone className="w-4 h-4" />, path: "/admin/phone-numbers", color: "bg-primary-50 text-primary-700 hover:bg-primary-100" },
            { name: "Users", icon: <Users className="w-4 h-4" />, path: "/admin/users", color: "bg-secondary-50 text-secondary-700 hover:bg-secondary-100" },
            { name: "Analytics", icon: <BarChart3 className="w-4 h-4" />, path: "/admin/analytics", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
            { name: "Settings", icon: <Settings className="w-4 h-4" />, path: "/admin/settings", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => window.location.href = action.path}
              className={`${action.color} p-3 rounded-lg transition-colors duration-200 flex flex-col items-center gap-1.5 border border-transparent`}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}