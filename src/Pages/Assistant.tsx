import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPhone, FiMoreVertical } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../Helpers/BackendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { TbTrash, TbPhoneCall, TbBrain, TbMicrophone, TbWaveSine, TbSettings, TbDotsVertical } from "react-icons/tb";
import { FaPencilAlt, FaPhone, FaRobot, FaRegClock, FaRegCalendarAlt } from "react-icons/fa";
import { MdOutlineSmartToy, MdOutlineVoiceChat, MdOutlineModelTraining } from "react-icons/md";
import ConfirmationModal from "../Components/ConfirmationModal";
import Vapi from "@vapi-ai/web";
import { PageNumbers } from "../Components/PageNumbers";
import { filterAndPaginateAssis } from "../Helpers/filterAndPaginate";
import { Loading } from "../Components/Loading";
import CallingUI from "../Components/CallingUI";
import CallForm from "../Components/CallForm";
import { HiOutlineCalendar } from "react-icons/hi";

interface Agent extends Record<string, unknown> {
  add_voice_id_manually: boolean;
  first_message: string;
  id: number;
  knowledgeBase: number;
  leadsfile: number;
  maxTokens: number;
  model: string;
  name: string;
  provider: string;
  systemPrompt: string;
  temperature: number;
  transcribe_language: string;
  transcribe_model: string;
  transcribe_provider: string;
  user_id: number;
  voice: string;
  voice_provider: string;
  vapi_assistant_id: string;
  category: string;
  assistant_toggle?: boolean;
  description?: string;
  created_at?: string;
}

interface FormData {
  name: string;
}

const Assistant = () => {
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [callAgentId, setCallAgentId] = useState<number | null>(null);
  const [vapiAssitantId, setVapiAssitantId] = useState<string>("");
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('ended');
  const [callerName, setCallerName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { label: "All Assistants", value: "all", icon: TbBrain, color: "primary" },
    { label: "Warming Lead", value: "warming_lead", icon: TbWaveSine, color: "blue" },
    { label: "Contacting Lead", value: "contacting_lead", icon: TbPhoneCall, color: "green" },
  ];

  const [callButton, setCallButton] = useState<{
    assistantId: number | null;
    status: "Talk" | "EndCall" | "Connecting";
  }>({
    assistantId: 0,
    status: "Talk",
  });

  const navigate = useNavigate();

  const {
    filteredItems: filteredAgentList,
    pagesCount,
    pageNumbers,
  } = useMemo(() => {
    let filtered = agentList;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(agent => agent.category === selectedCategory);
    }
    
    return filterAndPaginateAssis(filtered, search, currentPage);
  }, [agentList, search, currentPage, selectedCategory]);

  const vapi = useMemo(() => {
    return new Vapi("a18e104d-aa6d-40d2-a71a-8c31bd54ce19");
  }, []);

  const getAssistants = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Agent[]>("/get-user-assistants");
      const agents: Agent[] = Array.isArray(data) ? data : [];
      const enhancedAgents = agents.map(agent => ({
        ...agent,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
      setAgentList(enhancedAgents);
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
      setAgentList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssistant = () => {
    navigate("/assistant/createassistant");
  };

  const handleCallAgent = (vapiAssistantId: string, id: number) => {
    if (localStorage.getItem("trialMessage")) {
      const trailMessageIs = localStorage.getItem("trialMessage");

      if (trailMessageIs === "Your free trial has expired") {
        notifyResponse({
          success: false,
          detail: "Can't make call after trial expired",
        });
        return;
      }
    }

    setVapiAssitantId(vapiAssistantId);
    setCallAgentId(id);
    setShowCallModal(true);
  };

  const handleFormSubmit = async (
    data: FormData,
    action: "testCall" | "phoneCall"
  ) => {
    setLoading(true);
    setCallerName(data.name);
    
    try {
      if (action === "phoneCall") {
        setShowCallModal(false);
        setCallStatus('connecting');
        
        const { data: resData } = await api.post<{ success?: boolean; detail?: string }>(
          `/phone-call/${vapiAssitantId}/${data.name}`,
          data
        );
        notifyResponse(resData ?? {});
        setLoading(false);
      }
      
      if (action === "testCall") {
        setShowCallModal(false);
        setCallStatus('connecting');
        startCall(data);
        setLoading(false);
      }
    } catch {
      console.log("Error in handleFormSubmit:");
      setCallStatus('ended');
    }
  };

  const startCall = (data: FormData) => {
    const assistantOverrides = {
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-2",
        language: "en-AU" as const,
      },
      recordingEnabled: false,
      variableValues: {
        first_name: data.name,
        last_name: "",
        email: "",
        mobile_no: "",
        add_date: "",
        custom_field_01: "",
        custom_field_02: "",
      },
    };

    try {
      vapi.start(vapiAssitantId, assistantOverrides);

      setCallButton({
        assistantId: callAgentId,
        status: "Connecting",
      });

      vapi.on("call-start", () => {
        setCallStatus('connected');
        setCallButton({
          assistantId: callAgentId,
          status: "EndCall",
        });
      });

      vapi.on("call-end", () => {
        setCallStatus('ended');
        setCallButton({
          assistantId: null,
          status: "Talk",
        });
      });

      vapi.on("error", (e) => {
        console.error("Error occurred:", e);
        setCallStatus('ended');
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus('ended');
    }
  };

  const endCall = () => {
    vapi.stop();
    setCallStatus('ended');
    setCallButton({
      assistantId: 0,
      status: "Talk",
    });
  };

  const handleDeleteAssistant = async () => {
    if (selectedAgentId !== null) {
      try {
        const { data } = await api.delete<{ success?: boolean; detail?: string }>(`/assistants/${selectedAgentId}`);
        notifyResponse(data ?? {});
        if (data?.success) {
          setAgentList((prevAgents) =>
            prevAgents.filter((agent) => agent.id !== selectedAgentId)
          );
        }
      } catch (error) {
        console.error("Failed to delete assistant:", error);
        notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to delete assistant" });
      } finally {
        setShowModal(false);
      }
    }
  };

  const handleShowDeleteModal = (id: number) => {
    setSelectedAgentId(id);
    setShowModal(true);
  };

  const handleUpdateAssistant = async (id: number) => {
    navigate(`/assistant/createassistant?id=${id}`);
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Recently";
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return past.toLocaleDateString();
  };

  const getProviderIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case 'deepgram': return <TbWaveSine className="w-4 h-4" />;
      case '11labs': return <TbMicrophone className="w-4 h-4" />;
      default: return <MdOutlineVoiceChat className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    getAssistants();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
         
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">AI Assistant Hub</h1>
              <p className="text-gray-500 mt-1">Create and manage your intelligent AI companions</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="w-4 h-4 text-gray-400" />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                placeholder="Search assistants..."
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateAssistant}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-400 text-white font-medium rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-200"
            >
              <FiPlus className="w-4 h-4" />
              Create Assistant
            </button>
          </div>
        </div>

        {/* Calendar Integration Banner */}
        <div className="bg-primary-50 rounded-xl border border-blue-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <HiOutlineCalendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Looking to create an appointment booking assistant?
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  You need to add your calendar first to enable scheduling features.
                </p>
              </div>
            </div>
            <Link
              to="/calendar-integration"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary-500 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium border border-blue-200 shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Calendar
            </Link>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.value;
            const colorClasses = {
              primary: isActive ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300',
              blue: isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300',
              green: isActive ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border-gray-200 hover:border-green-300',
            };
            
            return (
              <button
                key={category.value}
                onClick={() => {
                  setSelectedCategory(category.value);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isActive 
                    ? colorClasses[category.color as keyof typeof colorClasses] + ' shadow-md' 
                    : colorClasses[category.color as keyof typeof colorClasses]
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : `text-${category.color}-600`}`} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Assistants</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{agentList.length}</h3>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <MdOutlineSmartToy className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Warming Leads</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">
                  {agentList.filter(a => a.category === 'warming_lead').length}
                </h3>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TbWaveSine className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Contacting Leads</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">
                  {agentList.filter(a => a.category === 'contacting_lead').length}
                </h3>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <TbPhoneCall className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Assistants Grid/Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredAgentList.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>Assistant</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <TbBrain className="w-4 h-4" />
                          Model
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <TbMicrophone className="w-4 h-4" />
                          Voice
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FaRegClock className="w-4 h-4" />
                          Created
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAgentList.map((agent) => {
                      const isActiveCall = callButton.assistantId === agent.id;
                      
                      return (
                        <tr 
                          key={agent.id} 
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary-700">
                                  {agent.name?.charAt(0).toUpperCase() || 'A'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {agent.name}
                                  </span>
                                  {agent.category && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      agent.category === 'warming_lead' 
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                        : 'bg-green-100 text-green-800 border border-green-200'
                                    }`}>
                                      {agent.category === 'warming_lead' ? '🔥 Warming' : '📞 Contacting'}
                                    </span>
                                  )}
                                </div>
                                {agent.description && (
                                  <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                    {agent.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                                <MdOutlineModelTraining className="w-3.5 h-3.5 text-purple-600" />
                              </div>
                              <span className="text-sm text-gray-700">
                                {agent.model?.split('-')[0] || 'Default'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                agent.voice_provider?.toLowerCase() === 'deepgram' 
                                  ? 'bg-blue-100' 
                                  : 'bg-amber-100'
                              }`}>
                                {getProviderIcon(agent.voice_provider)}
                              </div>
                              <span className="text-sm text-gray-700">
                                {agent.voice_provider || 'Default'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600">
                              <FaRegClock className="w-3.5 h-3.5 text-gray-400 mr-2" />
                              {getTimeAgo(agent.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Call Button */}
                              {!isActiveCall ? (
                                <button
                                  onClick={() => handleCallAgent(agent.vapi_assistant_id, agent.id)}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-400 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                                >
                                  <FaPhone className="w-3 h-3" />
                                  <span>Call</span>
                                </button>
                              ) : callButton.status === "Connecting" ? (
                                <button className="inline-flex items-center gap-2 px-3 py-2 bg-primary-400 text-white text-xs font-medium rounded-lg cursor-not-allowed">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Connecting...</span>
                                </button>
                              ) : callButton.status === "EndCall" ? (
                                <button
                                  onClick={endCall}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors animate-pulse shadow-sm"
                                >
                                  <FaPhone className="w-3 h-3 rotate-135" />
                                  <span>End Call</span>
                                </button>
                              ) : null}

                              {/* Edit Button */}
                              <button
                                onClick={() => handleUpdateAssistant(agent.id)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Edit Assistant"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleShowDeleteModal(agent.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Assistant"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>

                              {/* More Actions (Mobile) */}
                              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
                                <TbDotsVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagesCount > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-medium text-gray-900">{(currentPage - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium text-gray-900">
                        {Math.min(currentPage * 10, filteredAgentList.length)}
                      </span>{' '}
                      of <span className="font-medium text-gray-900">{filteredAgentList.length}</span> assistants
                    </div>
                    
                    <PageNumbers
                      pageNumbers={pageNumbers}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      pagesCount={pagesCount}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MdOutlineSmartToy className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assistants found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {search || selectedCategory !== 'all' 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Create your first AI assistant to start making calls and engaging with leads."}
              </p>
              {!search && selectedCategory === 'all' && (
                <button
                  onClick={handleCreateAssistant}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-primary-400 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                >
                  <FiPlus className="w-5 h-5" />
                  Create Your First Assistant
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Call Form Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <CallForm
              onSubmit={handleFormSubmit}
              onClose={() => setShowCallModal(false)}
            />
          </div>
        </div>
      )}

      {/* Calling UI */}
      <CallingUI
        isVisible={callStatus !== 'ended'}
        onEndCall={endCall}
        status={callStatus}
        agentName={callerName ? `${callerName}` : "AI Assistant"}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteAssistant}
        title="Delete Assistant"
        message="Are you sure you want to delete this assistant? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Assistant;