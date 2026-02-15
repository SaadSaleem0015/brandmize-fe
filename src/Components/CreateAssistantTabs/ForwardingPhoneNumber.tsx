import React, { useState, useEffect } from 'react';
import { 
  FaPhone, 
  FaForward, 
  FaLink, 
  FaMicrophone, 
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPhoneAlt,
  FaExchangeAlt,
  FaClipboardList,
  FaArrowRight,
  FaTimesCircle
} from 'react-icons/fa';
import { 
  TbPhone, 
  TbPhoneCall, 
  TbPhoneOff, 
  TbLink, 
  TbMicrophone,
  TbInfoCircle,
  TbCheck,
  TbX,
  TbAlertCircle,
  TbSettings,
  TbArrowForward,
  TbMessage,
  TbCopy,
  TbChevronDown,
  TbChevronUp
} from 'react-icons/tb';
import { api } from '../../Helpers/backendRequest';
import { InfoTooltip } from '../InfoTooltip';
import { notifyResponse } from '../../Helpers/notyf';

interface AssistantData {
  forwardingPhoneNumber?: string;
  attached_Number?: string; 
  endCallPhrases?: string[];
}
interface User {
  username: string;
  email: string;
}

interface PurchasedNumber {
  friendly_name: string;
  phone_number: string;
  user: User;
  date_purchased: string;
  attached?: boolean;
  attached_assistant: number;
}
interface TranscribeProps {
  assistantData: AssistantData;
  handleChange: (key: keyof AssistantData, value: string | string[]) => void;
}

const ForwardingPhoneNumber: React.FC<TranscribeProps> = ({ assistantData, handleChange }) => {
  const [purchasedNumbers, setPurchasedNumbers] = useState<PurchasedNumber[]>([]);
  const [showPromptExample, setShowPromptExample] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    attach: true,
    forward: true,
    phrases: true,
    status: false
  });

  useEffect(() => {
    fetchPurchasedNumbers();
  }, []);

  const fetchPurchasedNumbers = async () => {
    try {
      const { data } = await api.get<PurchasedNumber[]>('/purchased_numbers');
      setPurchasedNumbers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching purchased numbers:', error);
    }
  };

  const handleEndCallPhrasesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Split by commas or new lines and filter empty strings
    const phrases = value.split(/[,\n]+/).map(p => p.trim()).filter(p => p);
    handleChange('endCallPhrases', phrases);
  };

  const getPhrasesText = () => {
    if (!assistantData.endCallPhrases || assistantData.endCallPhrases.length === 0) return '';
    return assistantData.endCallPhrases.join('\n');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyPromptExample = () => {
    const example = `"Forward calls to ${assistantData.forwardingPhoneNumber || '[your number]'} when:
- The user specifically asks to speak with a human representative
- The user says 'speak to an agent', 'talk to a person', or similar phrases
- Technical questions arise that require human expertise
- The user becomes frustrated or requests escalation

Use these trigger phrases:
- 'speak to a human'
- 'talk to an agent'
- 'connect me to support'
- 'I need a person'`;

    navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    notifyResponse({ success: true, detail: "Prompt example copied!" });
  };

  return (
    <div className="min-h-full bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
              <FaPhone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Phone Number Configuration</h1>
              <p className="text-gray-500 mt-1">Configure phone settings and call management for your assistant</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <TbPhone className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="text-gray-500 text-xs">Attached</p>
                <p className="font-medium text-gray-900">{assistantData.attached_Number ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <TbPhone className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-sm">
                <p className="text-gray-500 text-xs">Forwarding</p>
                <p className="font-medium text-gray-900">{assistantData.forwardingPhoneNumber ? 'Set' : 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Configuration Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Attach Phone Number Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('attach')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FaLink className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">Attach Phone Number</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Link a purchased phone number to your assistant</p>
                </div>
              </div>
              {expandedSections.attach ? (
                <TbChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <TbChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.attach && (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaPhoneAlt className="text-gray-400" />
                    </div>
                    <select
                      value={assistantData.attached_Number || ''}
                      onChange={(e) => handleChange('attached_Number', e.target.value)}
                      className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
                    >
                      <option value="" disabled>Choose a phone number...</option>
                      {purchasedNumbers.map(number => (
                        <option key={number.phone_number} value={number.phone_number}>
                          {number.phone_number} {number.friendly_name ? `(${number.friendly_name})` : ''} 
                          {number.attached_assistant ? " (Already Attached)" : ""}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <TbChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {assistantData.attached_Number && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                      <FaCheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        Number {assistantData.attached_Number} will be attached to this assistant
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Forwarding Phone Number Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('forward')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <TbPhone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">Forwarding Phone Number</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Set up call forwarding to an external number</p>
                </div>
              </div>
              {expandedSections.forward ? (
                <TbChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <TbChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.forward && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {/* Forwarding Input */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Forwarding Number
                      </label>
                      <InfoTooltip
                        content={
                          <div className="text-sm space-y-3 max-w-md">
                            <p className="font-medium">How call forwarding works:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <FaArrowRight className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                                <span>Calls will be forwarded to this number when triggered</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <FaArrowRight className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                                <span>Add forwarding instructions in your system prompt</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <FaArrowRight className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                                <span>Test with sample conversations to ensure proper triggering</span>
                              </li>
                            </ul>
                          </div>
                        }
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaPhoneAlt className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="+1 (234) 567-8900"
                        value={assistantData.forwardingPhoneNumber || ""}
                        onChange={(e) => handleChange('forwardingPhoneNumber', e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Prompt Instructions */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <button
                      onClick={() => setShowPromptExample(!showPromptExample)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <FaExclamationTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-amber-800">Important: System Prompt Required</p>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Add forwarding instructions in your system prompt
                          </p>
                        </div>
                      </div>
                      {showPromptExample ? (
                        <TbChevronUp className="w-5 h-5 text-amber-600" />
                      ) : (
                        <TbChevronDown className="w-5 h-5 text-amber-600" />
                      )}
                    </button>

                    {showPromptExample && (
                      <div className="mt-4 p-4 bg-gray-900 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-gray-400 font-mono">Example System Prompt Instructions</p>
                          <button
                            onClick={copyPromptExample}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            {copied ? (
                              <>
                                <FaCheckCircle className="w-3 h-3 text-green-400" />
                                <span className="text-xs text-gray-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <TbCopy className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                          {`"Forward calls to ${assistantData.forwardingPhoneNumber || '[your number]'} when:
• The user asks to speak with a human
• The user says 'talk to an agent' or similar
• Technical questions require human expertise
• The user becomes frustrated

Trigger phrases to watch for:
• 'speak to a human'
• 'talk to an agent'
• 'connect me to support'
• 'I need a person'"`}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Example Format */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <FaInfoCircle className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-600">
                      Format: Include country code. Example: <span className="font-mono text-primary-600">+1234567890</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* End Call Phrases Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('phrases')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <TbMessage className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">End Call Phrases</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Define phrases that will trigger call termination</p>
                </div>
              </div>
              {expandedSections.phrases ? (
                <TbChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <TbChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.phrases && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700">
                        End Call Phrases
                      </label>
                      <InfoTooltip
                        content={
                          <div className="text-sm">
                            <p>Enter phrases that will cause the assistant to end the call.</p>
                            <p className="mt-1">Separate multiple phrases with commas or new lines.</p>
                            <p className="mt-2 text-primary-500">Examples: goodbye, thank you, end call, that's all</p>
                          </div>
                        }
                      />
                    </div>
                    <textarea
                      value={getPhrasesText()}
                      rows={5}
                      placeholder="goodbye, thank you, end call, that's all, have a nice day"
                      onChange={handleEndCallPhrasesChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {assistantData.endCallPhrases && assistantData.endCallPhrases.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm font-medium text-blue-800 mb-2">Active End Call Phrases:</p>
                      <div className="flex flex-wrap gap-2">
                        {assistantData.endCallPhrases.map((phrase, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 border border-blue-200"
                          >
                            <TbX className="w-3 h-3 text-gray-400" />
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current Status Section */}
          <div>
            <button
              onClick={() => toggleSection('status')}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <TbInfoCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-900">Current Configuration</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Overview of your current phone settings</p>
                </div>
              </div>
              {expandedSections.status ? (
                <TbChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <TbChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.status && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <p className="text-xs font-medium text-blue-800 mb-2">Attached Number</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {assistantData.attached_Number || (
                        <span className="text-gray-400">Not attached</span>
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <p className="text-xs font-medium text-purple-800 mb-2">Forwarding Number</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {assistantData.forwardingPhoneNumber || (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <p className="text-xs font-medium text-green-800 mb-2">End Phrases</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {assistantData.endCallPhrases?.length 
                        ? `${assistantData.endCallPhrases.length} phrase${assistantData.endCallPhrases.length > 1 ? 's' : ''} configured`
                        : <span className="text-gray-400">Not set</span>
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help & Documentation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* How It Works */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaInfoCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Attach:</strong> Link a purchased number to your assistant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Forward:</strong> Route calls to external numbers when needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>End Phrases:</strong> Define natural conversation endings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl border border-primary-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TbInfoCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Quick Tips</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Always test forwarding with a sample call</li>
                  <li>• Use clear trigger phrases in system prompts</li>
                  <li>• Include country codes for all numbers</li>
                  <li>• Update end phrases based on call patterns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardingPhoneNumber;