import { useEffect, useMemo, useState } from "react";
import { api } from "../Helpers/BackendRequest";
import { Loading } from "../Components/Loading";
import { notifyResponse } from "../Helpers/notyf";
import { Input } from "../Components/Input";
import { filterAndPaginate } from "../Helpers/filterAndPaginate";
import { PageNumbers } from "../Components/PageNumbers";
import { useSearchParams } from "react-router-dom";
import LeadModal from "../Components/LeadModal";
import { AddLeadModal } from "../Components/AddLeadModal";
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from "react-datepicker";
import ConfirmationModal from "../Components/ConfirmationModal"
import { useNavigate } from "react-router-dom";
import { FormateTime } from "../Helpers/formateTime";
import { 
  TbUserPlus, 
  TbPhone, 
  TbEye, 
  TbTrash, 
  TbFilter, 
  TbX, 
  TbCalendar,
  TbMail,
  TbDeviceMobile,
  TbUser,
  TbAlertTriangle,
  TbCheck,
  TbClock,
  TbDownload,
  TbUpload,
  TbPhoneCall,
  TbMessage,
  TbDotsVertical,
  TbChevronDown,
  TbMapPin,
  TbId
} from "react-icons/tb";
import { FiDownload, FiUpload, FiFilter, FiCalendar, FiPhone, FiMail, FiUser } from "react-icons/fi";

interface Lead extends Record<string, unknown> {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  salesforce_id: string;
  add_date: string;
  mobile: string;
  other_data?: string[];
  file_id: number;
  state: string;
  timezone: string | null;
}

interface Assistant {
  id: string;
  name: string;
  vapi_assistant_id: string;
}

export function Leads() {
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editStateModalVisible, setEditStateModalVisible] = useState(false);
  const [newStateValue, setNewStateValue] = useState('');

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(undefined);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(undefined);
  const [salesforceId, setSalesforceId] = useState('');
  const [tempSalesforceId, setTempSalesforceId] = useState('');
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [leadIdsToDelete, setLeadIdsToDelete] = useState<number[]>([]);
  const [leadToAddDnc, setLeadToAddDnc] = useState<number | null>(null);
  const [dncConfirmationModalVisible, setDncConfirmationModalVisible] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const { filteredItems: filteredLeads, pagesCount, pageNumbers } = useMemo(() => {
    const fromDate = startDate ? new Date(startDate) : undefined;
    const toDate = endDate ? new Date(endDate) : undefined;
    
    return filterAndPaginate(leads, search, currentPage, 10, 7, fromDate, toDate, salesforceId); 
  }, [leads, search, currentPage, startDate, endDate, salesforceId]); 

  useEffect(() => {
    fetchAssistants();
    fetchLeads(); 
  }, []);
  const navigate = useNavigate();

  const urlFile = searchParams.get("url");
  
  const fetchLeads = async () => {
    const fileId = searchParams.get("file_id");
    setLoading(true);
    try {
      const { data } = await api.get<Lead[]>(
        fileId ? `/leads?file_id=${fileId}` : "/leads"
      );
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistants = async () => {
    try {
      const { data } = await api.get<Assistant[]>('/get-user-assistants');
      setAssistants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      setAssistants([]);
    }
  };

  const handleFilterApply = () => {
    setSalesforceId(tempSalesforceId);
    setEndDate(tempEndDate);
    setStartDate(tempStartDate);
    setFilterModalVisible(false);
    setCurrentPage(1);
  };

  const remove = async (leadIds: number[]) => {
    try {
      const { data } = await api.delete<{ success?: boolean; detail?: string }>("/leads", { data: { ids: leadIds } });
      notifyResponse(data ?? {});
      if (data?.success) {
        setLeads(oldLeads => oldLeads.filter(lead => !leadIds.includes(lead.id)));
        setSelectedRows([]);
        setSelectAll(false);
      }
    } catch (error) {
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to delete leads" });
    }
  };

  const handleConfirmAddLeadToDNC = async () => {
    const leadId = leadToAddDnc;
    try {
      const { data } = await api.post<{ success?: boolean; detail?: string }>(`/add-lead-todnc/${leadId}`);
      notifyResponse(data ?? {});
      setDncConfirmationModalVisible(false);
      setLeadToAddDnc(null);
    } catch (error) {
      console.log(error);
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to add lead to DNC" });
    }
  };

  const handleCall = async () => {
    setLoading(true);
    if (selectedLead) {
      try {
        const { data } = await api.post<{ success?: boolean; detail?: string }>(`/assistant-call/${selectedAssistant}/${selectedLead.id}`);
        notifyResponse(data ?? {});
        setModalVisible(false);
      } catch (error) {
        console.error("Failed to Call:", error);
        notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Call failed" });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const handleCallModal = (lead: Lead) => {
    setSelectedLead(lead);
    setModalVisible(true);
  };

  const handleCloseAssitantModal = () => {
    setModalVisible(false);
    setSelectedAssistant(null);
  };

  const handleAddLeadModalOpen = () => {
    setIsAddLeadModalOpen(true);
  };

  const handleAddLeadModalClose = () => {
    setIsAddLeadModalOpen(false);
  };

  const handleDeleteConfirmation = (leadIds: number[]) => {
    setLeadIdsToDelete(leadIds);
    setConfirmationModalVisible(true);
  };

  const handleAddLeadToDNC = (leadId: number) => {
    setLeadToAddDnc(leadId);
    setDncConfirmationModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    await remove(leadIdsToDelete);
    setConfirmationModalVisible(false);
  };
  
  const handleAddLead = async (lead: { 
    first_name: string; 
    last_name: string; 
    email: string; 
    mobile: string; 
    startDate: string; 
    salesforce_id: string;
  }) => {
    const fileId = searchParams.get("file_id");
    const leadData = {
      ...lead,
      add_date: lead.startDate,
      file_id: fileId ? Number(fileId) : null
    };

    try {
      const { data } = await api.post<{ success?: boolean; detail?: string }>("/add_manually_lead", leadData);
      notifyResponse(data ?? {});
      if (data?.success) {
        setLeads([...leads, leadData as Lead]);
      }
    } catch (error) {
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to add lead" });
    }
    fetchLeads();
  };

  const handleResetFilters = () => {
    setTempEndDate(undefined);
    setTempSalesforceId('');
    setTempStartDate(undefined);
    setEndDate(undefined);
    setSalesforceId('');
    setStartDate(undefined);
  };

  const handleUpdateState = async () => {
    if (!editingLead) return;
    
    try {
      setLoading(true);
      const state = newStateValue;
      const { data } = await api.put<{ success?: boolean; detail?: string }>(`/update-lead-state/${editingLead.id}`, { state });
      notifyResponse(data ?? {});
      if (data?.success) {
        setLeads(leads.map(lead => 
          lead.id === editingLead.id ? {
            ...lead, 
            state: newStateValue,
            timezone: "corrected" 
          } : lead
        ));
        setEditStateModalVisible(false);
      }
    } catch (error) {
      console.error("Error updating state:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredLeads.map(lead => lead.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  useEffect(() => {
    if (selectedRows.length > 0) {
      setShowBulkActions(true);
    } else {
      setShowBulkActions(false);
    }
  }, [selectedRows]);

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <Loading />
          </div>
        </div>
      )}
        <button
        type="button"
        onClick={() => navigate("/view-leads")}
        className="flex items-center gap-2 text-primary-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Files
      </button>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-500 mt-2">
            Manage and track your leads across all campaigns
          </p>
        </div>
        
        {!urlFile && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterModalVisible(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <TbFilter className="w-5 h-5" />
              Filter
            </button>
            <button
              onClick={handleAddLeadModalOpen}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-200"
            >
              <TbUserPlus className="w-5 h-5" />
              Add Lead
            </button>
            <AddLeadModal
              isOpen={isAddLeadModalOpen}
              onClose={handleAddLeadModalClose}
              onSubmit={handleAddLead}
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{leads.length}</h3>
            </div>
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <TbUser className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">Across all campaigns</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">With State</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                {leads.filter(l => l.state && l.state !== "N/A").length}
              </h3>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TbMapPin className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">Location data available</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Need Attention</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">
                {leads.filter(l => l.timezone === null).length}
              </h3>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <TbAlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">Missing timezone data</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">This Page</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{filteredLeads.length}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <TbCalendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">Current filtered view</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={search}
                onChange={e => {
                  setSearch(e.currentTarget.value);
                  setCurrentPage(1);
                }}
                placeholder="Search leads by name, email, or phone..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Active Filters */}
            {(startDate || endDate || salesforceId) && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm">
                <TbFilter className="w-4 h-4" />
                <span className="font-medium">Active Filters</span>
                <button
                  onClick={handleResetFilters}
                  className="ml-2 p-0.5 hover:bg-primary-100 rounded"
                >
                  <TbX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="px-5 py-3 bg-primary-50/50 border-b border-primary-100 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-primary-700">
                  {selectedRows.length} leads selected
                </span>
                <button
                  onClick={() => setSelectedRows([])}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteConfirmation(selectedRows)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium border border-gray-200"
                >
                  <TbTrash className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
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
                      <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
                        <TbCheck className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded hover:border-primary-400 transition-colors"></div>
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <TbUser className="w-4 h-4" />
                    Lead Information
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <TbDeviceMobile className="w-4 h-4" />
                    Contact Details
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <TbMapPin className="w-4 h-4" />
                    Location
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => {
                  const isSelected = selectedRows.includes(lead.id);
                  const needsStateFix = lead.timezone === null;
                  
                  return (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-gray-50 transition-colors group ${
                        isSelected ? 'bg-primary-50/30' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectRow(lead.id)}
                          className="flex items-center justify-center"
                        >
                          {isSelected ? (
                            <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
                              <TbCheck className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-primary-400 transition-colors"></div>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary-700">
                              {lead.first_name?.[0]}{lead.last_name?.[0]}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                {lead.first_name} {lead.last_name}
                              </p>
                              {needsStateFix && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  <TbAlertTriangle className="w-3 h-3 mr-1" />
                                  Fix Required
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <TbClock className="w-3 h-3" />
                              <span>Added {FormateTime(lead.add_date)}</span>
                              {lead.salesforce_id && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">ID: {lead.salesforce_id.slice(0, 8)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <TbMail className="w-3.5 h-3.5 text-gray-400 mr-2" />
                            <span className="text-gray-600">{lead.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <TbDeviceMobile className="w-3.5 h-3.5 text-gray-400 mr-2" />
                            <span className="text-gray-900 font-medium">{lead.mobile}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {needsStateFix ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{lead.state || "N/A"}</span>
                            <button
                              onClick={() => {
                                setEditingLead(lead);
                                setNewStateValue(lead.state);
                                setEditStateModalVisible(true);
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-100 transition-colors"
                            >
                              <TbAlertTriangle className="w-3.5 h-3.5 mr-1" />
                              Fix State
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-900">{lead.state || "Unknown"}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleCallModal(lead)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Call Lead"
                          >
                            <TbPhoneCall className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleModal(lead)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <TbEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmation([lead.id])}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <TbTrash className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
                            <TbDotsVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <TbUser className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        {search || startDate || endDate || salesforceId
                          ? "Try adjusting your search or filters to find what you're looking for."
                          : "Upload a file or add a lead manually to get started."}
                      </p>
                      {!urlFile && !search && !startDate && !endDate && !salesforceId && (
                        <button
                          onClick={handleAddLeadModalOpen}
                          className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-primary-400 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
                        >
                          <TbUserPlus className="w-5 h-5" />
                          Add Your First Lead
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        {filteredLeads.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{((currentPage - 1) * 10) + 1}</span> to{' '}
                <span className="font-medium text-gray-900">
                  {Math.min(currentPage * 10, filteredLeads.length)}
                </span>{' '}
                of <span className="font-medium text-gray-900">{filteredLeads.length}</span> leads
              </div>
              
              {pagesCount > 1 && (
                <PageNumbers
                  pageNumbers={pageNumbers}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pagesCount={pagesCount}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit State Modal */}
      {editStateModalVisible && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TbAlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Update Lead State</h2>
                  <p className="text-sm text-gray-500 mt-1">Fix timezone issue by updating state</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Correct State
                </label>
                <input
                  value={newStateValue}
                  onChange={(e) => setNewStateValue(e.target.value)}
                  placeholder="e.g., California, New York, Texas"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will update the lead's state and automatically fix the timezone
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditStateModalVisible(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateState}
                  disabled={!newStateValue.trim()}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    newStateValue.trim()
                      ? 'bg-primary-400 text-white hover:bg-primary-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Update State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <TbPhoneCall className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Call Lead</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedLead?.first_name} {selectedLead?.last_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select AI Assistant
                </label>
                <select
                  value={selectedAssistant || ''}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                  disabled={loading}
                >
                  <option value="" disabled>Choose an assistant...</option>
                  {assistants.map((assistant) => (
                    <option key={assistant.id} value={assistant.vapi_assistant_id}>
                      {assistant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseAssitantModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCall}
                  disabled={!selectedAssistant || loading}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    !selectedAssistant || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-400 text-white hover:bg-primary-600 shadow-lg shadow-primary-200'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Calling...
                    </>
                  ) : (
                    <>
                      <TbPhone className="w-4 h-4" />
                      Start Call
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {filterModalVisible && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TbFilter className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Filter Leads</h2>
                    <p className="text-sm text-gray-500 mt-1">Narrow down your lead list</p>
                  </div>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reset all
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                {/* Date Range */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TbCalendar className="text-gray-400" />
                      </div>
                      <DatePicker
                        selected={tempStartDate}
                        onChange={(date) => setTempStartDate(date as Date)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholderText="Start date"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TbCalendar className="text-gray-400" />
                      </div>
                      <DatePicker
                        selected={tempEndDate}
                        onChange={(date) => setTempEndDate(date as Date)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholderText="End date"
                      />
                    </div>
                  </div>
                </div>

                {/* Salesforce ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Salesforce ID
                  </label>
                  <input
                    value={tempSalesforceId}
                    onChange={(e) => setTempSalesforceId(e.target.value)}
                    placeholder="Enter Salesforce ID"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setFilterModalVisible(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFilterApply}
                  className="flex-1 px-4 py-3 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        show={confirmationModalVisible}
        onClose={() => setConfirmationModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationModal
        show={dncConfirmationModalVisible}
        onClose={() => setDncConfirmationModalVisible(false)}
        onConfirm={handleConfirmAddLeadToDNC}
        title="Add to DNC"
        message="Are you sure you want to add this lead to the Do Not Call list? This action cannot be undone."
        confirmText="Add to DNC"
        cancelText="Cancel"
        type="warning"
      />

      {/* Lead Details Modal */}
      <LeadModal
        lead={selectedLead}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}