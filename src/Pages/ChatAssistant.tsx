import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';
import { MessageSquare, Send, User } from 'lucide-react';
import Select from 'react-select';
import { ChevronDown, FileText, X } from 'lucide-react';
import { api } from '../Helpers/BackendRequest';
import { notifyResponse } from '../Helpers/notyf';
import { Loading } from '../Components/Loading';
import { TbCloudUpload, TbSend } from 'react-icons/tb';

// Types
interface Document {
  id: number;
  file_name: string;
  file_type: string;
  path: string;
  user_id: number;
  vapi_file_id: string;
  created_at: string;
  updated_at: string;
}

interface Assistant {
  id?: number;
  name: string;
  description: string;
  system_prompt: string;
  model: string;
  temperature: number;
  tone: string;
  document_ids: number[];
}

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Available OpenAI models
const OPENAI_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Fast, efficient for most tasks' },
  { value: 'gpt-4o', label: 'GPT-4o', description: 'Latest GPT-4o model' },
  { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo', description: 'Advanced reasoning' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Cost-effective' },
];

// Tone options
const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'empathetic', label: 'Empathetic' },
];

// Custom styles for react-select
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? '#7032e5' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(112, 50, 229, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#7032e5',
    },
    padding: '2px',
    borderRadius: '0.5rem',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#7032e5' 
      : state.isFocused 
        ? '#e5dbff' 
        : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    '&:active': {
      backgroundColor: '#5e27c9',
    },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#e5dbff',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: '#4a1fa3',
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: '#4a1fa3',
    '&:hover': {
      backgroundColor: '#7032e5',
      color: 'white',
    },
  }),
};

const ChatAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'test'>('config');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasAssistant, setHasAssistant] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assistantId = searchParams.get("id");
  
  // Chat states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. Configure me first and then we can chat!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Assistant form state
  const [assistant, setAssistant] = useState<Assistant>({
    name: '',
    description: '',
    system_prompt: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    tone: 'professional',
    document_ids: [],
  });

  // Fetch documents and check existing assistant
  useEffect(() => {
    fetchDocuments();
    checkExistingAssistant();
  }, []);

  // Check if user already has a chat assistant
  const checkExistingAssistant = async () => {
    setIsDataLoaded(false);
    try {
      const { data } = await api.get<{
        success: boolean;
        detail?: string;
        assistants?: Assistant[];
      }>("/chat/assistant");

      const existing = Array.isArray(data?.assistants) ? data.assistants[0] : undefined;

      if (existing) {
        setAssistant({
          id: existing.id,
          name: existing.name || "",
          description: (existing as any).description || "",
          system_prompt: (existing as any).system_prompt || "",
          model: existing.model || "gpt-4o-mini",
          temperature: existing.temperature || 0.7,
          tone: (existing as any).tone || "professional",
          document_ids: (existing as any).document_ids || [],
        });
        setHasAssistant(true);

        // Initialize chat with assistant's intro message
        setMessages([
          {
            id: 1,
            type: "assistant",
            content:
              (existing as any).first_message ||
              "Hello! I'm your chat assistant. How can I help you today?",
            timestamp: new Date(),
          },
        ]);
      } else {
        setHasAssistant(false);
      }
    } catch (error) {
      console.error("Error checking assistant:", error);
      setHasAssistant(false);
    } finally {
      setIsDataLoaded(true);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Document[]>('/vapi_docs');
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Fallback to empty array if API fails
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssistant(prev => ({
      ...prev,
      [name]: name === 'temperature' ? parseFloat(value) : value
    }));
  };

  const handleDocumentsChange = (selected: any) => {
    setAssistant(prev => ({
      ...prev,
      document_ids: selected ? selected.map((item: any) => item.value) : []
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    
    try {
      if (assistantId && hasAssistant) {
        // Update existing assistant
        const { data } = await api.put<{ success?: boolean; detail?: string }>(
          `/update_assistant/${assistantId}`,
          {
            name: assistant.name,
            description: assistant.description,
            system_prompt: assistant.system_prompt,
            model: assistant.model,
            temperature: assistant.temperature,
            tone: assistant.tone,
            document_ids: assistant.document_ids,
          }
        );
        notifyResponse(data ?? {});
        if (data?.success) {
          setHasAssistant(true);
          // Enable test tab after successful publish
          setActiveTab('test');
        }
      } else {
        // Create new assistant
        const { data } = await api.post<{ success?: boolean; detail?: string; id?: number }>(
          "/chat/assistant",
          {
            name: assistant.name,
            description: assistant.description,
            system_prompt: assistant.system_prompt,
            model: assistant.model,
            temperature: assistant.temperature,
            tone: assistant.tone,
            document_ids: assistant.document_ids,
          }
        );
        notifyResponse(data ?? {});
        if (data?.success) {
          setHasAssistant(true);
          // Enable test tab after successful publish
          setActiveTab('test');
          if (data.id) {
            // Update URL with assistant ID
            navigate(`/chat-assistant?id=${data.id}`, { replace: true });
          }
        }
      }
    } catch (error) {
      console.error('Error saving assistant:', error);
      notifyResponse({ 
        success: false, 
        detail: (error as any)?.response?.data?.detail ?? 'Failed to save assistant' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping || !hasAssistant) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Build history from previous messages only (exclude current question)
      const history = messages.map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.content,
      }));

      // Call chat API endpoint with question + history
      const { data } = await api.post<any>("/chat/test", {
        question: currentInput,
        history,
      });

      // Response might be plain string or an object with a message/answer field
      const answer =
        typeof data === "string"
          ? data
          : data?.answer || data?.message || data?.response || data?.detail;

      const assistantMessage: Message = {
        id: messages.length + 2,
        type: "assistant",
        content:
          answer ||
          'It seems like I could not understand the response from the server. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message in chat
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      notifyResponse({ 
        success: false, 
        detail: (error as any)?.response?.data?.detail ?? 'Failed to send message' 
      });
    } finally {
      setIsTyping(false);
    }
  };

  const documentOptions = documents.map(doc => ({
    value: doc.id,
    label: doc.file_name,
    fileType: doc.file_type,
    path: doc.path
  }));

  const isButtonsDisabled = saving || (assistantId ? !isDataLoaded : false);

  return (
    <div className=" bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
         
          <div className="w-14 h-14 bg-primary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
            <FaRobot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {assistantId ? 'Edit Chat Assistant' : 'Create Chat Assistant'}
            </h1>
            <p className="text-gray-500 mt-1">
              Configure your AI chat assistant's behavior and test it
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
                  onClick={() => setActiveTab('config')}
                  className={`flex-1 md:flex-none px-5 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'config'
                      ? 'bg-white text-primary-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <FaRobot className={`text-sm ${activeTab === 'config' ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span>Configuration</span>
                </button>

                <button
                  onClick={() => setActiveTab('test')}
                  disabled={!hasAssistant}
                  className={`flex-1 md:flex-none px-5 py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'test'
                      ? 'bg-white text-primary-600 shadow-sm border border-gray-200'
                      : !hasAssistant
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <MessageSquare className={`text-sm ${activeTab === 'test' ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span>Test</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {assistantId ? (
                  // Edit Mode Buttons
                  <button
                    className={`px-5 py-2.5 flex items-center gap-2 text-sm font-medium rounded-xl transition-all shadow-sm ${
                      isButtonsDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-400 text-white hover:bg-primary-600 shadow-lg shadow-primary-200'
                    }`}
                    onClick={handleSubmit}
                    disabled={isButtonsDisabled}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <TbSend className="w-4 h-4" />
                        <span>Update & Test</span>
                      </>
                    )}
                  </button>
                ) : (
                  // Create Mode Buttons
                  <button
                    className={`px-5 py-2.5 flex items-center gap-2 text-sm font-medium rounded-xl transition-all shadow-sm ${
                      saving
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-400 text-white hover:bg-primary-600 shadow-lg shadow-primary-200'
                    }`}
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <TbCloudUpload className="w-4 h-4" />
                        <span>Publish & Test</span>
                      </>
                    )}
                  </button>
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
                {activeTab === 'config' && (
                  <div className="space-y-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Assistant Name <span className="text-primary-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={assistant.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-colors"
                            placeholder="e.g., Customer Support Assistant"
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            id="description"
                            name="description"
                            value={assistant.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-colors"
                            placeholder="Brief description of your assistant"
                          />
                        </div>
                      </div>

                      {/* System Prompt */}
                      <div>
                        <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700 mb-1">
                          System Prompt <span className="text-primary-500">*</span>
                        </label>
                        <textarea
                          id="system_prompt"
                          name="system_prompt"
                          value={assistant.system_prompt}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-colors"
                          placeholder="Define your assistant's behavior, constraints, and expertise..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Detailed instructions that define how your assistant should behave
                        </p>
                      </div>

                      {/* Model and Temperature */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                            OpenAI Model <span className="text-primary-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="model"
                              name="model"
                              value={assistant.model}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 appearance-none bg-white transition-colors"
                            >
                              {OPENAI_MODELS.map(model => (
                                <option key={model.value} value={model.value}>
                                  {model.label} - {model.description}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                            Temperature: {assistant.temperature}
                          </label>
                          <input
                            type="range"
                            id="temperature"
                            name="temperature"
                            min="0"
                            max="2"
                            step="0.1"
                            value={assistant.temperature}
                            onChange={handleInputChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Precise</span>
                            <span>Balanced</span>
                            <span>Creative</span>
                          </div>
                        </div>
                      </div>

                      {/* Tone */}
                      <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                          Conversation Tone
                        </label>
                        <div className="relative">
                          <select
                            id="tone"
                            name="tone"
                            value={assistant.tone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 appearance-none bg-white transition-colors"
                          >
                            {TONE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Knowledge Base Files */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Knowledge Base Files
                        </label>
                        {loading ? (
                          <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                          </div>
                        ) : (
                          <Select
                            isMulti
                            name="documents"
                            options={documentOptions}
                            value={documentOptions.filter(option => 
                              assistant.document_ids.includes(option.value)
                            )}
                            onChange={handleDocumentsChange}
                            styles={selectStyles}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select knowledge base files..."
                            formatOptionLabel={(data: any) => (
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-primary-500" />
                                <span>{data.label}</span>
                                <span className="ml-2 text-xs text-gray-400">.{data.fileType}</span>
                              </div>
                            )}
                          />
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Select documents to enhance your assistant with domain-specific knowledge
                        </p>
                      </div>

                      {/* Selected Files Preview */}
                      {assistant.document_ids.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">
                            Selected Files ({assistant.document_ids.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {assistant.document_ids.map((id) => {
                              const doc = documents.find(d => d.id === id);
                              return doc ? (
                                <span
                                  key={id}
                                  className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700"
                                >
                                  <FileText className="w-3 h-3 mr-1 text-primary-500" />
                                  {doc.file_name}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAssistant(prev => ({
                                        ...prev,
                                        document_ids: prev.document_ids.filter(docId => docId !== id)
                                      }));
                                    }}
                                    className="ml-2 text-gray-400 hover:text-primary-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {activeTab === 'test' && (
                  <div className="flex flex-col h-[calc(100vh-24rem)]">
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`flex max-w-[80%] ${
                              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                            } items-start space-x-3 space-x-reverse`}
                          >
                            {/* Avatar */}
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                message.type === 'user'
                                  ? 'bg-primary-500'
                                  : 'bg-primary-400'
                              }`}
                            >
                              {message.type === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <FaRobot className="w-4 h-4 text-white" />
                              )}
                            </div>

                            {/* Message Bubble */}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                message.type === 'user'
                                  ? 'bg-primary-500 text-white rounded-tr-none'
                                  : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.type === 'user' ? 'text-primary-100' : 'text-gray-400'
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-xs text-gray-500">Assistant is typing...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 bg-white p-4">
                      <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-colors"
                          disabled={!hasAssistant || isTyping}
                        />
                        <button
                          type="submit"
                          disabled={!inputMessage.trim() || isTyping || !hasAssistant}
                          className="p-3 bg-primary-400 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        {hasAssistant 
                          ? 'This assistant has access to your knowledge base documents'
                          : 'Please publish the assistant first to enable testing'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className={`w-2 h-2 rounded-full ${activeTab === 'config' ? 'bg-primary-600' : 'bg-gray-300'}`}></span>
          <span className={`w-2 h-2 rounded-full ${activeTab === 'test' ? 'bg-primary-600' : 'bg-gray-300'}`}></span>
          <span className="ml-2">{activeTab === 'config' ? 'Configuration' : 'Test'} Mode</span>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
