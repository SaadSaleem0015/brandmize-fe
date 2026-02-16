import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { api } from "../Helpers/BackendRequest"
import * as XLSX from "xlsx"
import { PageNumbers } from "../Components/PageNumbers"
import { Loading } from "../Components/Loading"
import { FormateTime } from "../Helpers/formateTime"
import { formatDuration } from "../Helpers/formatDuration"
import { Dialog } from "@headlessui/react"
import LeadModal from "../Components/LeadModal"
import AudioPlayer from "react-modern-audio-player"
import ConfirmationModal from "../Components/ConfirmationModal"
import { notifyResponse } from "../Helpers/notyf"
import { formatCallEndedReason } from "../Helpers/formateCallEndReason"
import { 
  Download, Search, Filter, ChevronDown, Phone, Clock, User, 
  CheckCircle, XCircle, ArrowRight, PhoneOff, Volume2, 
  Eye, Trash2, Calendar, BarChart3, TrendingUp, Mic,
  MessageSquare, FileText, Play, Pause, MoreVertical,
  AlertCircle, CheckSquare, Square, X, ChevronLeft, ChevronRight
} from "lucide-react"

interface Lead {
  id: number
  first_name: string
  last_name: string
  email: string
  salesforce_id: string
  add_date: string
  mobile: string
  other_data?: string[]
  file_id: number
}

interface CallLog extends Record<string, unknown> {
  id?: number
  customer_number?: string
  call_started_at?: string
  customer_name?: string
  call_ended_at?: string
  cost?: number
  call_duration?: number
  call_ended_reason?: string
  status?: string
  transcript?: string
  recording_url?: string
  call_id?: string
  lead_id?: number
  criteria_satisfied?: boolean
  ended_reason?: string
  successEvalution?: string
}

const dispositionOptions = [
  { value: "", label: "All Reasons", icon: CheckCircle, color: "gray" },
  { value: "customer-ended-call", label: "Customer Ended", icon: PhoneOff, color: "green" },
  { value: "silence-timed-out", label: "Silence Timeout", icon: Clock, color: "orange" },
  { value: "customer-did-not-answer", label: "No Answer", icon: XCircle, color: "yellow" },
  { value: "twilio-failed-to-connect-call", label: "Failed Connect", icon: XCircle, color: "red" },
  { value: "assistant-forwarded-call", label: "Call Forwarded", icon: ArrowRight, color: "blue" },
]

const rowsPerPageOptions = [10, 25, 50, 100]

const UsageReport: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "audio">("overview")
  const [selectedLogDetails, setSelectedLogDetails] = useState<CallLog | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [dispositionFilter, setDispositionFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState<boolean>(false)
  const [phoneNumberDetails, setPhoneNumberDetails] = useState<CallLog[] | null>(null)
  const [isDispositionOpen, setIsDispositionOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const total = callLogs.length
    const completed = callLogs.filter(log => log.status === "Completed").length
    const uniqueCallers = new Set(callLogs.map(log => log.customer_number)).size
    const qualified = callLogs.filter(log => log.criteria_satisfied).length
    const avgDuration = callLogs.reduce((acc, log) => acc + (log.call_duration || 0), 0) / (total || 1)
    
    return { total, completed, uniqueCallers, qualified, avgDuration }
  }, [callLogs])

  const customFilterAndPaginate = (
    items: CallLog[],
    searchTerm: string,
    disposition: string,
    page: number,
    itemsPerPage = 10,
  ) => {
    let filteredItems = items.filter((item) => {
      const searchableText = `${item.customer_name || ""} ${item.customer_number || ""}`.toLowerCase()
      return searchableText.includes(searchTerm.toLowerCase())
    })

    if (disposition) {
      filteredItems = filteredItems.filter((item) => item.call_ended_reason === disposition)
    }

    const totalItems = filteredItems.length
    const pagesCount = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    return {
      filteredItems: paginatedItems,
      pagesCount,
      startIndex,
      endIndex,
      totalItems,
    }
  }

  const {
    filteredItems: filteredCallLogs,
    pagesCount,
    startIndex,
    totalItems,
  } = useMemo(
    () => customFilterAndPaginate(callLogs, search, dispositionFilter, currentPage, itemsPerPage),
    [callLogs, search, dispositionFilter, currentPage, itemsPerPage],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, dispositionFilter, itemsPerPage])

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const { data } = await api.get<CallLog[]>("/user/call-logs-detail")
        const logsList = Array.isArray(data) ? data : []
        if (logsList.length > 0) {
          const sortedLogs = [...logsList].sort((a, b) => {
            const dateA = new Date(a.call_started_at || 0)
            const dateB = new Date(b.call_started_at || 0)
            return dateB.getTime() - dateA.getTime()
          })
          setCallLogs(sortedLogs)
        } else {
          setCallLogs([])
        }
      } catch (error) {
        console.error("Failed to fetch call logs:", error)
        setCallLogs([])
      }
    }
    fetchCallLogs()
  }, [])

  const handleDeleteLog = async () => {
    if (selectedLogId !== null) {
      try {
        const { data } = await api.delete<{ success?: boolean; detail?: string }>(`/call_log/${selectedLogId}`)
        notifyResponse(data ?? {})
        setCallLogs((prevLogs) => prevLogs.filter((log) => log.call_id !== selectedLogId))
      } catch (error) {
        console.error("Failed to delete call log:", error)
        notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to delete log" })
      } finally {
        setShowDeleteModal(false)
      }
    }
  }

  const handleShowDetailsModal = async (id: string) => {
    setLoading(true)
    setSelectedLogId(id)
    setActiveTab("overview")
    try {
      const { data: callDetails } = await api.get<CallLog>(`/call/${id}`)
      setSelectedLogDetails(callDetails ?? null)
      setShowDetailsModal(true)
    } catch (error) {
      console.error("Failed to fetch call details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShowDeleteModal = (id: string) => {
    setSelectedLogId(id)
    setShowDeleteModal(true)
  }

  const handleCloseLeadModal = () => {
    setShowLeadModal(false)
    setSelectedLead(null)
  }

  const exportToExcel = () => {
    const data = filteredCallLogs.map((log) => ({
      "Call ID": log.call_id,
      "Customer Name": log.customer_name || "Unknown",
      "Customer Number": log.customer_number || "N/A",
      "Date & Time": log.call_started_at ? FormateTime(log.call_started_at) : "N/A",
      "Duration": log.call_duration ? formatDuration(log.call_duration) : "--:--",
      "Status": log.status || "Unknown",
      "End Reason": log.call_ended_reason ? formatCallEndedReason(log.call_ended_reason) : "N/A",
      "Qualified": log.criteria_satisfied ? "Yes" : "No",
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Call Logs")
    XLSX.writeFile(wb, `Call_Logs_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handlePhoneNumberDetail = async (num: string) => {
    setLoading(true)
    try {
      const { data } = await api.get<CallLog[]>(`/specific-number-call-logs/${num}`)
      setPhoneNumberDetails(Array.isArray(data) ? data : [])
      setShowPhoneNumberModal(true)
    } catch (error) {
      console.error("Error fetching phone number details:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.round(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getDispositionColor = (reason: string | undefined) => {
    switch (reason) {
      case "customer-ended-call": return "bg-green-50 text-green-700 border-green-200"
      case "customer-did-not-answer": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "silence-timed-out": return "bg-orange-50 text-orange-700 border-orange-200"
      case "twilio-failed-to-connect-call": return "bg-red-50 text-red-700 border-red-200"
      case "assistant-forwarded-call": return "bg-blue-50 text-blue-700 border-blue-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredCallLogs.map(log => log.call_id || "").filter(Boolean))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const getSelectedOptionLabel = () => {
    const option = dispositionOptions.find(opt => opt.value === dispositionFilter)
    return option ? option.label : "All Reasons"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Call Analytics</h1>
            <p className="text-gray-500 mt-1">Monitor and analyze your AI assistant's call performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              disabled={filteredCallLogs.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Calls</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">All time call volume</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</h3>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{((stats.completed / stats.total) * 100 || 0).toFixed(1)}% success rate</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Unique Callers</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.uniqueCallers}</h3>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Distinct contacts</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Qualified Leads</p>
                <h3 className="text-2xl font-bold text-primary-600 mt-1">{stats.qualified}</h3>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{((stats.qualified / stats.total) * 100 || 0).toFixed(1)}% conversion</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Duration</p>
                <h3 className="text-2xl font-bold text-purple-600 mt-1">{formatTime(stats.avgDuration)}</h3>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Average call length</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Call Logs</h2>
                  <p className="text-sm text-gray-500">View and manage your call history</p>
                </div>
              </div>
              
              {/* Selected count badge */}
              {selectedRows.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                  <span className="text-sm font-medium text-primary-700">{selectedRows.length} selected</span>
                  <button 
                    onClick={() => setSelectedRows([])}
                    className="p-0.5 hover:bg-primary-100 rounded"
                  >
                    <X className="w-3.5 h-3.5 text-primary-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Search Calls
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name or phone number..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Disposition Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  End Call Reason
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDispositionOpen(!isDispositionOpen)}
                    className="flex items-center justify-between w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{getSelectedOptionLabel()}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDispositionOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isDispositionOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDispositionOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
                        {dispositionOptions.map((option) => {
                          const Icon = option.icon
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setDispositionFilter(option.value)
                                setIsDispositionOpen(false)
                              }}
                              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                                dispositionFilter === option.value ? "bg-primary-50 text-primary-700" : "text-gray-700"
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${
                                dispositionFilter === option.value ? "text-primary-600" : `text-${option.color}-500`
                              }`} />
                              <span>{option.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rows Per Page */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Show
                </label>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    {rowsPerPageOptions.map((option) => (
                      <option key={option} value={option}>{option} entries</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Logs Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-6 py-4">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center"
                    >
                      {selectAll ? (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Caller
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Duration
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date & Time
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      End Reason
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <div className="flex justify-center">
                        <Loading />
                      </div>
                    </td>
                  </tr>
                ) : filteredCallLogs.length > 0 ? (
                  filteredCallLogs.map((log, index) => {
                    const isSelected = selectedRows.includes(log.call_id || "")
                    return (
                      <tr 
                        key={log.id || index} 
                        className={`hover:bg-gray-50 transition-colors group ${isSelected ? "bg-primary-50/50" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => log.call_id && handleSelectRow(log.call_id)}
                            className="flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-primary-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                              <span className="text-primary-700 font-medium text-sm">
                                {log.customer_name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {log.customer_name || "Unknown Caller"}
                                </p>
                                {log.criteria_satisfied && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                                    <CheckCircle className="w-3 h-3" />
                                    Qualified
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => log.customer_number && handlePhoneNumberDetail(log.customer_number)}
                                className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
                              >
                                {log.customer_number || "No number"}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {log.call_duration ? formatTime(log.call_duration) : "--:--"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {log.call_started_at ? FormateTime(log.call_started_at) : "--"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDispositionColor(log.call_ended_reason)}`}>
                            {log.call_ended_reason ? formatCallEndedReason(log.call_ended_reason) : "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.status === "Completed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {log.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => log.call_id && handleShowDetailsModal(log.call_id)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => log.call_id && handleShowDeleteModal(log.call_id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Call"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all lg:hidden">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Phone className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No call logs found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                          {search || dispositionFilter 
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Your AI assistant hasn't received any calls yet. Calls will appear here once they start coming in."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination & Footer */}
          {pagesCount > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to{" "}
                  <span className="font-medium text-gray-900">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{" "}
                  <span className="font-medium text-gray-900">{totalItems}</span> calls
                </div>
                
                {pagesCount > 1 && (
                  <PageNumbers
                    pageNumbers={Array.from({ length: pagesCount }, (_, i) => i + 1)}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pagesCount={pagesCount}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Details Modal */}
      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      Call Details
                    </Dialog.Title>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-900">
                        {selectedLogDetails?.customer_name || "Unknown Caller"}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        {selectedLogDetails?.customer_number || "No number"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="px-6 flex space-x-8">
                {[
                  { id: "overview", label: "Overview", icon: FileText },
                  { id: "transcript", label: "Transcript", icon: MessageSquare },
                  { id: "audio", label: "Audio", icon: Volume2 },
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-primary-600 text-primary-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "overview" && selectedLogDetails && (
                <div className="space-y-8">
                  {/* Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedLogDetails.status === "Completed" ? "bg-green-500" : "bg-yellow-500"
                        }`} />
                        <span className="text-sm font-medium text-gray-900">
                          {selectedLogDetails.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Duration</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {selectedLogDetails.call_duration ? formatDuration(selectedLogDetails.call_duration) : "--:--"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Qualified</p>
                      <div className="flex items-center gap-2">
                        {selectedLogDetails.criteria_satisfied ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">No</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Call Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Started At</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedLogDetails.call_started_at ? FormateTime(selectedLogDetails.call_started_at) : "--"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Ended At</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedLogDetails.call_ended_at ? FormateTime(selectedLogDetails.call_ended_at) : "--"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">End Reason</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedLogDetails.ended_reason || "--"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Additional Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Call ID</span>
                          <span className="text-sm font-mono text-gray-900">
                            {selectedLogDetails.call_id || "--"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Lead ID</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedLogDetails.lead_id || "--"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "audio" && (
                <div className="space-y-4">
                  {selectedLogDetails?.recording_url ? (
                    <>
                      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                        <Volume2 className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-medium text-gray-900">Call Recording</span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <AudioPlayer
                          playList={[{ 
                            id: 1, 
                            name: "Call Recording", 
                            src: selectedLogDetails.recording_url,
                            artist: selectedLogDetails.customer_name || "Unknown Caller"
                          }]}
                          activeUI={{ all: true, progress: "waveform" }}
                          placement={{
                            player: "bottom",
                            volume: "right",
                            trackList: "none"
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Volume2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Recording Available</h3>
                      <p className="text-gray-500">This call doesn't have an associated audio recording.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "transcript" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900">Conversation Transcript</span>
                  </div>
                  
                  {selectedLogDetails?.transcript ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        {selectedLogDetails.transcript.split("\n").map((line, index) => {
                          const isAI = line.startsWith("AI:")
                          const isUser = line.startsWith("User:")
                          
                          if (!isAI && !isUser) return null
                          
                          const speaker = isAI ? "AI Assistant" : "Customer"
                          const message = line.replace(/^(AI:|User:)\s*/, "")
                          
                          return (
                            <div key={index} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                              <div className={`max-w-[80%] rounded-xl p-4 ${
                                isAI 
                                  ? "bg-primary-50 border border-primary-100" 
                                  : "bg-gray-100 border border-gray-200"
                              }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={`w-2 h-2 rounded-full ${isAI ? "bg-primary-500" : "bg-gray-500"}`} />
                                  <span className="text-xs font-medium text-gray-700">{speaker}</span>
                                </div>
                                <p className="text-sm text-gray-900">{message}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Available</h3>
                      <p className="text-gray-500">This call doesn't have a transcript.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2.5 bg-primary-400 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Phone Number Details Modal */}
      <Dialog open={showPhoneNumberModal} onClose={() => setShowPhoneNumberModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Call History
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {phoneNumberDetails?.[0]?.customer_number || "Phone Number"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPhoneNumberModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {phoneNumberDetails && phoneNumberDetails.length > 0 ? (
                <div className="space-y-4">
                  {phoneNumberDetails.map((detail, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {detail.call_started_at ? FormateTime(detail.call_started_at) : "--"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Duration: {detail.call_duration ? formatTime(detail.call_duration) : "--:--"}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDispositionColor(detail.call_ended_reason)}`}>
                          {detail.call_ended_reason ? formatCallEndedReason(detail.call_ended_reason) : "Unknown"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Call History</h3>
                  <p className="text-gray-500">This number hasn't made any calls yet.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowPhoneNumberModal(false)}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteLog}
        title="Delete Call Log"
        message="Are you sure you want to delete this call log? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Lead Modal */}
      <LeadModal lead={selectedLead} isOpen={showLeadModal} onClose={handleCloseLeadModal} />
    </div>
  )
}

export default UsageReport