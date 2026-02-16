import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaRobot, FaMicrophone } from "react-icons/fa";
import Model from "../Components/CreateAssistantTabs/Model";
import Voice from "../Components/CreateAssistantTabs/Voice";
import { api } from "../Helpers/BackendRequest";
import { notifyResponse } from "../Helpers/notyf";
import ForwardingPhoneNumber from "../Components/CreateAssistantTabs/ForwardingPhoneNumber";
import { MdPhoneForwarded } from "react-icons/md";
import { Loading } from "../Components/Loading";
import { TbDeviceFloppy, TbSend, TbCloudUpload } from "react-icons/tb";

interface AssistantData {
  id?: number;
  name: string;
  provider: string;
  first_message: string;
  model: string;
  systemPrompt: string;
  knowledgeBase: string[];
  temperature: number;
  maxTokens: number;
  transcribe_provider: string;
  transcribe_language: string;
  transcribe_model: string;
  voice_provider: string;
  voice: string;
  voice_model: string;
  forwardingPhoneNumber: string;
  endCallPhrases: string[];
  attached_Number: string | null;
  draft: boolean;
  assistant_toggle: boolean | null;
}

const CreateAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Model" | "Voice" | "forwadingPhone">("Model");
  const [loading, setLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("contacting_lead");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assistantId = searchParams.get("id");

  const [assistantData, setAssistantData] = useState<AssistantData>({
    name: "New Assistant",
    provider: "openai",
    first_message: "Hello, this is Ava. How may I assist you today?",
    model: "gpt-4o-mini",
    systemPrompt: "I'm your virtual assistant. How can I help you today? I can provide information about our products, assist with placing orders, or help with any questions you may have. Just let me know what you're looking for!",
    knowledgeBase: [],
    temperature: 0.5,
    maxTokens: 250,
    transcribe_provider: "google",
    transcribe_language: "Multilingual",
    transcribe_model: "gemini-2.0-flash",
    voice_provider: "11labs",
    voice: "21m00Tcm4TlvDq8ikWAM",
    voice_model: "eleven_flash_v2_5",
    forwardingPhoneNumber: "",
    endCallPhrases: [],
    attached_Number: null,
    draft: false,
    assistant_toggle: null,
  });

  const handleChange = (
    key: keyof AssistantData,
    value: string | number | string[] | boolean
  ) => {
    setAssistantData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchAssistantData = async () => {
      if (assistantId) {
        setIsDataLoaded(false);
        try {
          const { data } = await api.get<AssistantData & { category?: string }>(`/get-assistant/${assistantId}`);
          if (data && typeof data === 'object' && 'name' in data) {
            const updatedResponse: AssistantData = {
              ...data,
              provider: "openai",
              model: (data as AssistantData).model || "gpt-4o-mini"
            };
            setAssistantData(updatedResponse);
            setSelectedCategory(data.category || "contacting_lead");
          }
        } catch (error) {
          console.error("Failed to fetch assistant data:", error);
        } finally {
          setIsDataLoaded(true);
        }
      } else {
        setIsDataLoaded(true);
      }
    };

    fetchAssistantData();
  }, [assistantId]);

  const handleUpdate = async () => {
    if (!assistantId) return;
    setLoading(true);
    try {
      const { data } = await api.put<{ success?: boolean; detail?: string }>(
        `/update_assistant/${assistantId}`,
        { ...assistantData }
      );
      notifyResponse(data ?? {});
      if (data?.success) {
        navigate("/assistant");
      }
    } catch (error) {
      console.error("Failed to update assistant:", error);
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to update assistant" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
  
    try {
      const { data } = await api.post("/assistants", {
        ...assistantData,
      });
  
      notifyResponse(data ?? {});
      if (data?.success) {
        navigate("/assistant");
      }
    } catch (error) {
      console.error("Error:", error);
      notifyResponse({ success: false, detail: (error as any)?.response?.data?.detail ?? "Failed to create assistant" });
    } finally {
      setLoading(false);
    }
  };
  


  const handlePublish = () => {
    handleSubmit();
  };


  const isButtonsDisabled = loading || (assistantId && !isDataLoaded);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/assistant")}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Back to Assistants"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-14 h-14 bg-primary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
            <FaRobot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {assistantId ? "Edit Assistant" : "Create New Assistant"}
            </h1>
            <p className="text-gray-500 mt-1">
              Configure your AI assistant's behavior, voice, and phone settings
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs and Actions Bar */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 bg-gray-100/80 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("Model")}
                  className={`flex-1 md:flex-none px-5 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "Model"
                      ? "bg-white text-primary-600 shadow-sm border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <FaRobot className={`text-sm ${activeTab === "Model" ? "text-primary-600" : "text-gray-500"}`} />
                  <span>Model</span>
                </button>

                <button
                  onClick={() => setActiveTab("Voice")}
                  className={`flex-1 md:flex-none px-5 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "Voice"
                      ? "bg-white text-primary-600 shadow-sm border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <FaMicrophone className={`text-sm ${activeTab === "Voice" ? "text-primary-600" : "text-gray-500"}`} />
                  <span>Voice</span>
                </button>

                <button
                  onClick={() => setActiveTab("forwadingPhone")}
                  className={`flex-1 md:flex-none px-5 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "forwadingPhone"
                      ? "bg-white text-primary-600 shadow-sm border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <MdPhoneForwarded className={`text-sm ${activeTab === "forwadingPhone" ? "text-primary-600" : "text-gray-500"}`} />
                  <span>Phone</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Category Select - Uncomment if needed */}
                {/* <select
                  className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  value={selectedCategory}
                  disabled={assistantId && !isDataLoaded}
                >
                  <option value="warming_lead">🔥 Warming Lead</option>
                  <option value="contacting_lead">📞 Contacting Lead</option>
                </select> */}

                {assistantId ? (
                  // Edit Mode Buttons
                  <>
                    
                    <button
                      className={`px-5 py-2.5 flex items-center gap-2 text-sm font-medium rounded-xl transition-all shadow-sm ${
                        isButtonsDisabled
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-primary-400 text-white hover:bg-primary-600 shadow-lg shadow-primary-200"
                      }`}
                      onClick={assistantData.draft ? handlePublish : () => handleUpdate(false)}
                      disabled={isButtonsDisabled}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{assistantData.draft ? "Publishing..." : "Updating..."}</span>
                        </>
                      ) : (
                        <>
                          <TbSend className="w-4 h-4" />
                          <span>{assistantData.draft ? "Publish" : "Update"}</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  // Create Mode Buttons
                  <>
             
                    <button
                      className={`px-5 py-2.5 flex items-center gap-2 text-sm font-medium rounded-xl transition-all shadow-sm ${
                        loading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-primary-400 text-white hover:bg-primary-600 shadow-lg shadow-primary-200"
                      }`}
                      onClick={() => handleSubmit()}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <TbCloudUpload className="w-4 h-4" />
                          <span>Publish</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {!isDataLoaded && assistantId ? (
              <div className="flex items-center justify-center py-12">
                <Loading />
              </div>
            ) : (
              <>
                {activeTab === "Model" && (
                  <Model
                    assistantData={assistantData}
                    handleChange={handleChange}
                    setAssistantData={setAssistantData}
                  />
                )}
                {activeTab === "Voice" && (
                  <Voice assistantData={assistantData} handleChange={handleChange} />
                )}
                {activeTab === "forwadingPhone" && (
                  <ForwardingPhoneNumber
                    assistantData={assistantData}
                    handleChange={handleChange}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className={`w-2 h-2 rounded-full ${activeTab === "Model" ? "bg-primary-600" : "bg-gray-300"}`}></span>
          <span className={`w-2 h-2 rounded-full ${activeTab === "Voice" ? "bg-primary-600" : "bg-gray-300"}`}></span>
          <span className={`w-2 h-2 rounded-full ${activeTab === "forwadingPhone" ? "bg-primary-600" : "bg-gray-300"}`}></span>
          <span className="ml-2">{activeTab} Configuration</span>
        </div>
      </div>
    </div>
  );
};

export default CreateAssistant;