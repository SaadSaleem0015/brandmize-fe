import React, { useState, useEffect } from "react";
import { FaVolumeUp, FaMicrophone, FaGlobe, FaStar } from "react-icons/fa";
import { voiceset2, voiceset3 } from "../../Helpers/data";

interface VoiceData {
  showName: string;
  name: string;
  voice: string;
  gender: "male" | "female" | "unknown" | "neutral";
  audioSr: string;
}
interface AssistantData {
  voice_provider: string;
  voice: string;
}

interface VoiceProps {
  assistantData: AssistantData;
  handleChange: (key: keyof AssistantData, value: string) => void;
}

const deepgramVoices: VoiceData[] = [
  { showName: "Asteria", name: "asteria", voice: "aura-asteria-en", gender: "female", audioSr: "/Audios/output_Asteria.wav" },
  { showName: "Luna", name: "luna", voice: "aura-luna-en", gender: "female", audioSr: "/Audios/output_Luna.wav" },
  { showName: "Stella", name: "stella", voice: "aura-stella-en", gender: "female", audioSr: "/Audios/output_Stella.wav" },
  { showName: "Athena", name: "athena", voice: "aura-athena-en", gender: "female", audioSr: "/Audios/output_Athena.wav" },
  { showName: "Hera", name: "hera", voice: "aura-hera-en", gender: "female", audioSr: "/Audios/output_Hera.wav" },
  { showName: "Orion", name: "orion", voice: "aura-orion-en", gender: "male", audioSr: "/Audios/output_Orion.wav" },
  { showName: "Arcas", name: "arcas", voice: "aura-arcas-en", gender: "male", audioSr: "/Audios/output_Arcas.wav" },
  { showName: "Perseus", name: "perseus", voice: "aura-perseus-en", gender: "male", audioSr: "/Audios/output_Perseus.wav" },
  { showName: "Angus", name: "angus", voice: "aura-angus-en", gender: "male", audioSr: "/Audios/output_Angus.wav" },
  { showName: "Orpheus", name: "orpheus", voice: "aura-orpheus-en", gender: "male", audioSr: "/Audios/output_Orpheus.wav" },
  { showName: "Helios", name: "helios", voice: "aura-helios-en", gender: "male", audioSr: "/Audios/output_Helios.wav" },
  { showName: "Zeus", name: "zeus", voice: "aura-zeus-en", gender: "male", audioSr: "/Audios/output_Zeus.wav" },
];

const elevenLabsVoicesSet2: VoiceData[] = voiceset2 as VoiceData[];
const elevenLabsVoicesSet3: VoiceData[] = voiceset3 as VoiceData[];

const Voice: React.FC<VoiceProps> = ({ handleChange, assistantData }) => {
  // State for selected voice set
  const [selectedSet, setSelectedSet] = useState<string>(() => {
    // Initialize based on current assistantData
    if (assistantData.voice_provider === "11labs") {
      const voiceInSet2 = elevenLabsVoicesSet2.find(voice => voice.name === assistantData.voice);
      const voiceInSet3 = elevenLabsVoicesSet3.find(voice => voice.name === assistantData.voice);
      
      if (voiceInSet2) return "set2";
      if (voiceInSet3) return "set3";
      return "set2"; // Default to set2 for 11labs
    }
    return "set1"; // Default to set1 for deepgram
  });

  // State for selected voice
  const [selectedVoice, setSelectedVoice] = useState<VoiceData | null>(null);

  // Get voices based on selected set
  const getVoicesForSet = (set: string): VoiceData[] => {
    switch (set) {
      case "set1":
        return deepgramVoices;
      case "set2":
        return elevenLabsVoicesSet2;
      case "set3":
        return elevenLabsVoicesSet3;
      default:
        return deepgramVoices;
    }
  };

  // Get provider based on selected set
  const getProviderForSet = (set: string) => {
    return set === "set1" ? "deepgram" : "11labs";
  };

  // Get current voices based on selectedSet
  const currentVoices = getVoicesForSet(selectedSet);

  // Initialize selected voice when component mounts or selectedSet changes
  useEffect(() => {
    console.log("Selected set changed to:", selectedSet);
    console.log("Current voices count:", currentVoices.length);
    
    // Find if current voice exists in the new set
    const existingVoice = currentVoices.find(voice => voice.name === assistantData.voice);
    
    if (existingVoice) {
      // Keep the existing voice if it's in the new set
      setSelectedVoice(existingVoice);
    } else {
      // Otherwise, select the first voice from the new set
      const defaultVoice = currentVoices[0];
      setSelectedVoice(defaultVoice);
      
      // Update the voice in parent component
      if (defaultVoice) {
        handleChange("voice", defaultVoice.name);
      }
    }
    
    // Always update the provider when set changes
    const newProvider = getProviderForSet(selectedSet);
    handleChange("voice_provider", newProvider);
    
  }, [selectedSet]);

  // Also update when assistantData.voice changes externally
  useEffect(() => {
    const voices = getVoicesForSet(selectedSet);
    const voice = voices.find(v => v.name === assistantData.voice);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [assistantData.voice]);

  const handleSetChange = (set: string) => {
    console.log("Switching to set:", set);
    setSelectedSet(set);
  };

  const handleCardClick = (voice: VoiceData) => {
    setSelectedVoice(voice);
    handleChange("voice", voice.name);
  };

  const getSetInfo = (set: string) => {
    switch (set) {
      case "set1":
        return { name: "English Voices", provider: "Deepgram", icon: "🇺🇸", color: "primary" };
      case "set2":
        return { name: "Multilingual Set 1", provider: "ElevenLabs", icon: "🌍", color: "primary" };
      case "set3":
        return { name: "Multilingual Set 2", provider: "ElevenLabs", icon: "🌐", color: "primary" };
      default:
        return { name: "English Voices", provider: "Deepgram", icon: "🇺🇸", color: "primary" };
    }
  };

  const currentSetInfo = getSetInfo(selectedSet);

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <FaVolumeUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Voice Selection</h1>
                <p className="text-gray-600 text-sm">
                  Choose the perfect voice personality for your AI assistant
                </p>
              </div>
            </div>

            {/* Voice Set Selector */}
            <div className="lg:w-80">
              <label htmlFor="voiceSet" className="block text-sm font-medium text-gray-700 mb-2">
                Voice Collection
              </label>
              <select
                id="voiceSet"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-700"
                value={selectedSet}
                onChange={(e) => handleSetChange(e.target.value)}
              >
                <option value="set1">Deepgram</option>
                <option value="set2">ElevenLabs set 1</option>
                <option value="set3">ElevenLabs set 2</option>
              </select>
            </div>
          </div>

          {/* Current Set Info */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{currentSetInfo.icon}</span>
                <div>
                  <h3 className="text-base font-semibold text-gray-800">{currentSetInfo.name}</h3>
                  <p className="text-gray-600 text-sm">Powered by {currentSetInfo.provider}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Available Voices</p>
                <p className="text-xl font-bold text-primary">{currentVoices.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info - You can remove this in production */}
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          Debug: Selected Set: {selectedSet}, Voices Count: {currentVoices.length}
        </div>

        {/* Voice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentVoices.map((voice) => (
            <div
              key={voice.name}  // Changed from voice.voice to voice.name for uniqueness
              className={`group relative bg-white rounded-lg shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedVoice?.name === voice.name
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-gray-200 hover:border-primary/300"
              }`}
              onClick={() => handleCardClick(voice)}
            >
              {/* Selection Indicator */}
              {selectedVoice?.name === voice.name && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <FaStar className="w-3 h-3 text-white" />
                </div>
              )}

              <div className="p-4">
                {/* Voice Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
                      {voice.showName}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        voice.gender === 'female'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {voice.gender === 'female' ? '👩' : '👨'} {voice.gender}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FaMicrophone className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Audio Player */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Preview</span>
                  </div>
                  <audio
                    src={voice.audioSr}
                    controls
                    className="w-full h-10 rounded"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>

                {/* Voice Details */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Provider: {voice.voice.includes('aura') ? 'Deepgram' : 'ElevenLabs'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-3 mt-1">
              <FaGlobe className="w-3 h-3 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Voice Selection Tips</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Choose a voice that matches your brand personality. English voices offer the best quality,
                while multilingual voices support multiple languages for global reach. You can preview each voice
                before making your final selection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voice;