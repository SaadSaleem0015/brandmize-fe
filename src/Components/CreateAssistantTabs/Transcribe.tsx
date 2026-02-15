import React, { useState, useEffect } from 'react';

interface AssistantData {
  transcribe_provider: string;
  transcribe_language: string;
  transcribe_model: string;
}

interface TranscribeProps {
  assistantData: AssistantData;
  handleChange: (key: keyof AssistantData, value: string) => void;
}

const Transcribe: React.FC<TranscribeProps> = ({ assistantData, handleChange }) => {
  const TranscribeOptions: Record<string, string[]> = {
    'deepgram': ['nova-2', 'nova-2-general', 'nova-2-meeting', 'nova-2-phonecall'],
    //  'Nova 2 Finance', 'Nova 2 Conversational AI', 'Nova 2 Voicemail', 'Nova 2 Video', 'Nova 2 Medical', 'Nova 2 Drive Thru', 'Nova 2 Automotive'
    // 'talkscriber': ['whisper'],
    // 'gladia': ['fast', 'accurate'],
  };

  const languageOptions = [
    { code: 'en', label: 'en' },
    { code: 'en-US', label: 'en-US' },
    // { code: 'es', label: 'Spanish' },
    // { code: 'fr', label: 'French' },
    // { code: 'ru', label: 'Russian' },
    // { code: 'zh', label: 'Chinese' },
    // { code: 'ko', label: 'Korean' },
    // { code: 'ja', label: 'Japanese' },
    // { code: 'pt', label: 'Portuguese' },
    // { code: 'tr', label: 'Turkish' },
    // { code: 'pl', label: 'Polish' },
    // { code: 'ca', label: 'Catalan' },
    // { code: 'nl', label: 'Dutch' },
    // { code: 'ar', label: 'Arabic' },
    // { code: 'sv', label: 'Swedish' },
    // { code: 'it', label: 'Italian' },
    // { code: 'id', label: 'Indonesian' },
    // { code: 'hi', label: 'Hindi' },
    // { code: 'fi', label: 'Finnish' },
    // { code: 'vi', label: 'Vietnamese' },
    // { code: 'he', label: 'Hebrew' },
    // { code: 'uk', label: 'Ukrainian' },
    // { code: 'ms', label: 'Malay' },
    // { code: 'cs', label: 'Czech' },
    // { code: 'ro', label: 'Romanian' },
    // { code: 'da', label: 'Danish' },
    // { code: 'hu', label: 'Hungarian' },
    // { code: 'ta', label: 'Tamil' },
    // { code: 'no', label: 'Norwegian' },
    // { code: 'th', label: 'Thai' },
    // { code: 'ur', label: 'Urdu' },
    // { code: 'hr', label: 'Croatian' },
    // { code: 'bg', label: 'Bulgarian' },
    // { code: 'lt', label: 'Lithuanian' },
    // { code: 'la', label: 'Latin' },
    // { code: 'ml', label: 'Malayalam' },
    // { code: 'si', label: 'Sinhalese' },
    // { code: 'kn', label: 'Kannada' },
    // { code: 'mk', label: 'Macedonian' },
    // { code: 'br', label: 'Breton' },
    // { code: 'eu', label: 'Basque' },
    // { code: 'is', label: 'Icelandic' },
    // { code: 'hy', label: 'Armenian' },
    // { code: 'ne', label: 'Nepali' },
    // { code: 'mn', label: 'Mongolian' },
    // { code: 'bs', label: 'Bosnian' },
    // { code: 'kk', label: 'Kazakh' },
    // { code: 'sq', label: 'Albanian' },
    // { code: 'sw', label: 'Swahili' },
    // { code: 'gl', label: 'Galician' },
    // { code: 'mr', label: 'Marathi' },
    // { code: 'pa', label: 'Punjabi' },
    // { code: 'yo', label: 'Yoruba' },
    // { code: 'so', label: 'Somali' },
    // { code: 'af', label: 'Afrikaans' },
    // { code: 'tl', label: 'Tagalog' },
    // { code: 'mg', label: 'Malagasy' },
    // { code: 'as', label: 'Assamese' },
    // { code: 'tt', label: 'Tatar' },
    // { code: 'ht', label: 'Haitian Creole' },
    // { code: 'uz', label: 'Uzbek' },
    // { code: 'fo', label: 'Faroese' },
    // { code: 'sd', label: 'Sindhi' },
    // { code: 'gu', label: 'Gujarati' },
    // { code: 'am', label: 'Amharic' },
    // { code: 'yi', label: 'Yiddish' },
    // { code: 'lo', label: 'Lao' },
    // { code: 'nn', label: 'Norwegian Nynorsk' },
    // { code: 'mt', label: 'Maltese' },
    // { code: 'sa', label: 'Sanskrit' },
    // { code: 'lb', label: 'Luxembourgish' },
    // { code: 'my', label: 'Burmese' },
    // { code: 'bo', label: 'Tibetan' },
    // { code: 'su', label: 'Sundanese' },
    // { code: 'yue', label: 'Cantonese' },
  };

  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const newAvailableModels = TranscribeOptions[assistantData.transcribe_provider] || [];
    setAvailableModels(newAvailableModels);

    if (newAvailableModels.length > 0 && assistantData.transcribe_model !== newAvailableModels[0]) {
      handleChange('transcribe_model', newAvailableModels[0]); 
    }
  }, [assistantData.transcribe_provider]);

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <FaMicrophone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Transcription Settings</h1>
              <p className="text-gray-600 text-sm">
                Configure how your assistant processes and understands voice input
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaCog className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Provider</p>
              <p className="text-xs text-gray-600">Deepgram</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaGlobe className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Language</p>
              <p className="text-xs text-gray-600">English</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaBrain className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Model</p>
              <p className="text-xs text-gray-600">Nova-2</p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaCog className="w-4 h-4 text-primary mr-2" />
            Configuration Options
          </h2>

          <div className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <FaCog className="w-4 h-4 text-primary" />
                </div>
          <div>
                  <h3 className="text-base font-semibold text-gray-800">Transcription Provider</h3>
                  <p className="text-gray-600 text-sm">Choose the service that will handle voice-to-text conversion</p>
                </div>
              </div>

            <select
              value={assistantData.transcribe_provider}
              onChange={(e) => handleChange('transcribe_provider', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-700"
            >
                <option value="deepgram">Deepgram - Advanced AI Transcription</option>
            </select>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <FaGlobe className="w-4 h-4 text-primary" />
          </div>
          <div>
                  <h3 className="text-base font-semibold text-gray-800">Language Support</h3>
                  <p className="text-gray-600 text-sm">Select the primary language for transcription</p>
                </div>
              </div>

            <select
              value={assistantData.transcribe_language}
              onChange={(e) => handleChange('transcribe_language', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-700"
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <FaBrain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800">AI Model</h3>
                  <p className="text-gray-600 text-sm">Choose the specific AI model for optimal transcription quality</p>
          </div>
        </div>

            <select
              value={assistantData.transcribe_model}
              onChange={(e) => handleChange('transcribe_model', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-700"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-1">
                <FaMicrophone className="w-3 h-3 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">About Transcription</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Transcription settings determine how accurately your assistant converts spoken words to text.
                  The selected provider, language, and model will affect both accuracy and processing speed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transcribe;
