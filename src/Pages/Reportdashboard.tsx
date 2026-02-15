import React, { useState, useEffect } from "react";
import { api } from "../Helpers/backendRequest";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Calendar, Download, Filter, X, ChevronDown, 
  Clock, Phone, User, CheckCircle, XCircle,
  BarChart3, TrendingUp, CalendarDays, ArrowUpRight
} from "lucide-react";

interface CallLog extends Record<string, unknown> {
  id?: number;
  customer_number?: string;
  call_started_at?: string;
  customer_name?: string;
  call_ended_at?: string;
  cost?: number;
  call_duration?: number;
  call_ended_reason?: string;
  status?: string;
  transcript?: string;
  recording_url?: string;
  call_id?: string;
  lead_id?: number;
  criteria_satisfied?: boolean;
}

const ReportDashboard: React.FC = () => {
  const [totalCalls, setTotalCalls] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isDataFound, setIsDataFound] = useState<boolean>(true);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setTempStartDate(dates[0]);
    setTempEndDate(dates[1]);
  };

  const applyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setFilterModalVisible(false);
  };

  const resetFilter = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setStartDate(null);
    setEndDate(null);
    setActiveFilter(null);
    setFilterModalVisible(false);
  };

  const applyQuickFilter = (filterType: string) => {
    const now = new Date();
    let start: Date | null, end: Date | null;

    switch (filterType) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        start = new Date(now.setDate(now.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "last7":
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case "last14":
        start = new Date(now.setDate(now.getDate() - 14));
        end = new Date();
        break;
      case "last30":
        start = new Date(now.setDate(now.getDate() - 30));
        end = new Date();
        break;
      default:
        start = null;
        end = null;
        break;
    }

    setTempStartDate(start);
    setTempEndDate(end);
    setActiveFilter(filterType);
  };

  const exportToExcel = () => {
    if (callLogs.length === 0) {
      alert("No data available to export.");
      return;
    }

    const filteredData = callLogs.filter((log) => {
      if (!startDate || !endDate) return true;
      const logDate = new Date(log.call_started_at || "");
      return logDate >= startDate && logDate <= endDate;
    });

    const worksheetData = filteredData.map((log) => ({
      "Customer Name": log.customer_name || "N/A",
      "Customer Number": log.customer_number || "N/A",
      "Call Duration (Minutes)": log.call_duration
        ? (log.call_duration / 60).toFixed(2)
        : "0",
      "Call Started At": log.call_started_at 
        ? new Date(log.call_started_at).toLocaleString() 
        : "N/A",
      "Call Ended Reason": log.call_ended_reason || "N/A",
      Status: log.status || "N/A",
      "Criteria Satisfied": log.criteria_satisfied ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usage Report");
    XLSX.writeFile(workbook, `Usage_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    const fetchCallLogs = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get<CallLog[]>("/user/call-logs-detail");
        const list = Array.isArray(data) ? data : [];
        let callLogsData: CallLog[] = list;
  
        if (startDate && endDate) {
          callLogsData = callLogsData.filter((log: CallLog) => {
            const logDate = new Date(log.call_started_at || "");
            return logDate >= startDate && logDate <= endDate;
          });
        }
  
        const sortedLogs = callLogsData.sort((a, b) => {
          const dateA = new Date(a.call_started_at || 0);
          const dateB = new Date(b.call_started_at || 0);
          return dateB.getTime() - dateA.getTime();
        });
  
        setIsDataFound(sortedLogs.length > 0);
        setCallLogs(sortedLogs);
  
        const convertToMinutes = (seconds?: number): number =>
          seconds ? parseFloat((seconds / 60).toFixed(2)) : 0;
  
        const totalCallsCount = sortedLogs.length;
        const totalMinutesCount = sortedLogs.reduce(
          (acc: number, log: CallLog) =>
            acc + convertToMinutes(log.call_duration), 0
        );

        setTotalCalls(totalCallsCount);
        setTotalMinutes(parseFloat(totalMinutesCount.toFixed(2)));
      } catch (error) {
        console.error("Error fetching call logs:", error);
        setIsDataFound(false);
        setCallLogs([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCallLogs();
  }, [startDate, endDate]);

  // Format date range display
  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    return "All time";
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Report Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your call performance and analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Display */}
          {(startDate || endDate) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{getDateRangeText()}</span>
              <button 
                onClick={resetFilter}
                className="ml-1 p-0.5 hover:bg-primary-100 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Filter Button */}
          <button
            onClick={() => setFilterModalVisible(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            disabled={!isDataFound}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-400 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Call Minutes Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Call Minutes</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {isLoading ? "—" : (isDataFound ? totalMinutes : "0")}
                </h2>
                <span className="text-xs font-medium text-gray-400">mins</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-gray-600">Total conversation time</span>
            </div>
          </div>
        </div>

        {/* Number of Calls Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Number of Calls</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {isLoading ? "—" : (isDataFound ? totalCalls : "0")}
                </h2>
                <span className="text-xs font-medium text-gray-400">calls</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-secondary-50 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-secondary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              <BarChart3 className="w-3.5 h-3.5 text-secondary-600" />
              <span className="text-gray-600">Total inbound/outbound</span>
            </div>
          </div>
        </div>

        {/* Average Call Duration Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Duration</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {isLoading 
                    ? "—" 
                    : (isDataFound && totalCalls > 0 
                      ? (totalMinutes / totalCalls).toFixed(2) 
                      : "0.00")}
                </h2>
                <span className="text-xs font-medium text-gray-400">min</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-accent-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5 text-accent-600" />
              <span className="text-gray-600">Average per call</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Calls Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Calls</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest {Math.min(callLogs.length, 10)} call activities
            </p>
          </div>
          {isDataFound && (
            <button className="text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 bg-primary-50 rounded-lg">
              View all
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : !isDataFound ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-base font-medium text-gray-900 mb-1">No calls found</h4>
              <p className="text-sm text-gray-500 text-center max-w-md">
                There are no call logs available for the selected date range.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criteria
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {callLogs.slice(0, 10).map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-700" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {log.customer_name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.customer_number || "No number"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {log.call_duration 
                            ? (log.call_duration / 60).toFixed(2) 
                            : "0.00"} min
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {log.call_started_at 
                          ? new Date(log.call_started_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${log.status?.toLowerCase() === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : log.status?.toLowerCase() === 'missed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {log.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.criteria_satisfied ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">Satisfied</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400">
                          <XCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">Not met</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {filterModalVisible && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 transform transition-all duration-300 animate-in fade-in zoom-in">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Filter className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Filter Call Logs</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Narrow down your call history
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilterModalVisible(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Quick Filters */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "today", label: "Today" },
                    { key: "yesterday", label: "Yesterday" },
                    { key: "last7", label: "Last 7 Days" },
                    { key: "last14", label: "Last 14 Days" },
                    { key: "last30", label: "Last 30 Days" }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => applyQuickFilter(filter.key)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all
                        ${activeFilter === filter.key
                          ? "bg-primary-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Range */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Custom Date Range
                </label>
                <div className="relative">
                  <DatePicker
                    selected={tempStartDate}
                    onChange={handleDateChange}
                    startDate={tempStartDate as Date}
                    endDate={tempEndDate as Date}
                    selectsRange
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholderText="Select start and end date"
                    calendarClassName="rounded-xl shadow-lg border-0"
                  />
                  <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Active Filters Summary */}
              {(tempStartDate || tempEndDate || activeFilter) && (
                <div className="mb-6 p-3 bg-primary-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary-700">Active filters</span>
                    <button
                      onClick={resetFilter}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeFilter && (
                      <span className="px-2 py-1 bg-white rounded-lg text-xs text-primary-700">
                        {activeFilter.replace(/(\d+)/, ' $1 Days')}
                      </span>
                    )}
                    {tempStartDate && tempEndDate && (
                      <span className="px-2 py-1 bg-white rounded-lg text-xs text-primary-700">
                        {tempStartDate.toLocaleDateString()} - {tempEndDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setFilterModalVisible(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilter}
                  className="flex-1 px-4 py-3 bg-primary-400 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDashboard;