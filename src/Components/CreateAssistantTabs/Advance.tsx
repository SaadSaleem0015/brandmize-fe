import { useState } from 'react';
import Switch from 'react-switch';
import Slider from 'react-input-slider';
import { FaShieldAlt, FaCog, FaComments, FaClock, FaMicrophone, FaVideo, FaVolumeUp, FaRobot } from 'react-icons/fa';

const Advance = () => {
  const [hipaaCompliance, setHipaaCompliance] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [silenceTimeout, setSilenceTimeout] = useState(560);
  const [responseDelay, setResponseDelay] = useState(1);
  const [llmRequestDelay, setLlmRequestDelay] = useState(2.5);
  const [interruptionThreshold, setInterruptionThreshold] = useState(3);
  const [maxDuration, setMaxDuration] = useState(3100);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Privacy Settings Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mr-6">
              <FaShieldAlt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Privacy & Security</h2>
              <p className="text-gray-600 text-lg">
                Configure privacy settings and compliance options for your assistant
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* HIPAA Compliance */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <FaShieldAlt className="w-6 h-6 text-white" />
                </div>
        <div>
                  <label className="text-lg font-semibold text-gray-900 mb-2 block">HIPAA Compliance</label>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    When enabled, no logs, recordings, or transcriptions will be stored. 
                    This ensures complete privacy for sensitive conversations.
                  </p>
                </div>
        </div>
        <Switch
          onChange={setHipaaCompliance}
          checked={hipaaCompliance}
                onColor="#dc2626"
                offColor="#d1d5db"
          uncheckedIcon={false}
          checkedIcon={false}
                height={28}
                width={56}
        />
      </div>

            {/* Audio Recording */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <FaMicrophone className="w-6 h-6 text-white" />
                </div>
        <div>
                  <label className="text-lg font-semibold text-gray-900 mb-2 block">Audio Recording</label>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Record the conversation with the assistant for quality assurance and training purposes.
                  </p>
                </div>
        </div>
        <Switch
          onChange={setAudioRecording}
          checked={audioRecording}
                onColor="#2563eb"
                offColor="#d1d5db"
          uncheckedIcon={false}
          checkedIcon={false}
                height={28}
                width={56}
        />
      </div>

            {/* Video Recording */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <FaVideo className="w-6 h-6 text-white" />
                </div>
        <div>
                  <label className="text-lg font-semibold text-gray-900 mb-2 block">Video Recording</label>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Enable video recording during web calls. This will record the video of your user.
                  </p>
                </div>
        </div>
        <Switch
          onChange={setVideoRecording}
          checked={videoRecording}
                onColor="#9333ea"
                offColor="#d1d5db"
          uncheckedIcon={false}
          checkedIcon={false}
                height={28}
                width={56}
        />
            </div>
          </div>
      </div>

        {/* Pipeline Configuration Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mr-6">
              <FaCog className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Pipeline Configuration</h2>
              <p className="text-gray-600 text-lg">
                Fine-tune the behavior and timing of your assistant's conversation flow
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Silence Timeout */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <FaClock className="w-5 h-5 text-blue-600 mr-3" />
        <div>
                    <label className="text-lg font-semibold text-gray-900">Silence Timeout</label>
                    <p className="text-gray-600 text-sm">Auto-end call after inactivity</p>
                  </div>
        </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
          <Slider
            axis="x"
            x={silenceTimeout}
            xmax={600}
            xmin={0}
            onChange={({ x }) => setSilenceTimeout(x)}
            styles={{
                        track: { backgroundColor: '#dbeafe', height: 8, borderRadius: 4 },
                        active: { backgroundColor: '#3b82f6', height: 8, borderRadius: 4 },
                        thumb: { width: 24, height: 24, backgroundColor: '#1d4ed8', borderRadius: '50%', border: '3px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                      }}
                    />
                  </div>
          <input
            type="number"
            value={silenceTimeout}
                    className="w-24 px-4 py-2 text-center border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
            onChange={(e) => setSilenceTimeout(Number(e.target.value))}
          />
        </div>
                <p className="text-sm text-gray-500 mt-2">Current: {formatTime(silenceTimeout)}</p>
      </div>

              {/* Response Delay */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <FaRobot className="w-5 h-5 text-green-600 mr-3" />
        <div>
                    <label className="text-lg font-semibold text-gray-900">Response Delay</label>
                    <p className="text-gray-600 text-sm">Wait time before assistant speaks</p>
                  </div>
        </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
          <Slider
            axis="x"
            x={responseDelay}
            xmax={5}
            xmin={0}
            onChange={({ x }) => setResponseDelay(x)}
            styles={{
                        track: { backgroundColor: '#d1fae5', height: 8, borderRadius: 4 },
                        active: { backgroundColor: '#10b981', height: 8, borderRadius: 4 },
                        thumb: { width: 24, height: 24, backgroundColor: '#059669', borderRadius: '50%', border: '3px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                      }}
                    />
                  </div>
          <input
            type="number"
            value={responseDelay}
                    className="w-24 px-4 py-2 text-center border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-lg"
            onChange={(e) => setResponseDelay(Number(e.target.value))}
          />
                </div>
                <p className="text-sm text-gray-500 mt-2">Current: {responseDelay}s</p>
        </div>
      </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* LLM Request Delay */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center mb-4">
                  <FaCog className="w-5 h-5 text-purple-600 mr-3" />
        <div>
                    <label className="text-lg font-semibold text-gray-900">LLM Request Delay</label>
                    <p className="text-gray-600 text-sm">Wait after punctuation before LLM</p>
                  </div>
        </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
          <Slider
            axis="x"
            x={llmRequestDelay}
            xmax={5}
            xmin={0}
            onChange={({ x }) => setLlmRequestDelay(x)}
            styles={{
                        track: { backgroundColor: '#f3e8ff', height: 8, borderRadius: 4 },
                        active: { backgroundColor: '#a855f7', height: 8, borderRadius: 4 },
                        thumb: { width: 24, height: 24, backgroundColor: '#9333ea', borderRadius: '50%', border: '3px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                      }}
                    />
                  </div>
          <input
            type="number"
            value={llmRequestDelay}
                    className="w-24 px-4 py-2 text-center border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg"
            onChange={(e) => setLlmRequestDelay(Number(e.target.value))}
          />
        </div>
                <p className="text-sm text-gray-500 mt-2">Current: {llmRequestDelay}s</p>
      </div>

              {/* Interruption Threshold */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center mb-4">
                  <FaVolumeUp className="w-5 h-5 text-orange-600 mr-3" />
        <div>
                    <label className="text-lg font-semibold text-gray-900">Interruption Threshold</label>
                    <p className="text-gray-600 text-sm">Words needed to interrupt assistant</p>
                  </div>
        </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
          <Slider
            axis="x"
            x={interruptionThreshold}
            xmax={10}
            xmin={1}
            onChange={({ x }) => setInterruptionThreshold(x)}
            styles={{
                        track: { backgroundColor: '#fed7aa', height: 8, borderRadius: 4 },
                        active: { backgroundColor: '#f97316', height: 8, borderRadius: 4 },
                        thumb: { width: 24, height: 24, backgroundColor: '#ea580c', borderRadius: '50%', border: '3px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                      }}
                    />
                  </div>
          <input
            type="number"
            value={interruptionThreshold}
                    className="w-24 px-4 py-2 text-center border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-lg"
            onChange={(e) => setInterruptionThreshold(Number(e.target.value))}
          />
        </div>
                <p className="text-sm text-gray-500 mt-2">Current: {interruptionThreshold} words</p>
      </div>

              {/* Maximum Duration */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                <div className="flex items-center mb-4">
                  <FaClock className="w-5 h-5 text-indigo-600 mr-3" />
        <div>
                    <label className="text-lg font-semibold text-gray-900">Maximum Duration</label>
                    <p className="text-gray-600 text-sm">Maximum call length</p>
                  </div>
        </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
          <Slider
            axis="x"
            x={maxDuration}
            xmax={3600}
            xmin={0}
            onChange={({ x }) => setMaxDuration(x)}
            styles={{
                        track: { backgroundColor: '#e0e7ff', height: 8, borderRadius: 4 },
                        active: { backgroundColor: '#6366f1', height: 8, borderRadius: 4 },
                        thumb: { width: 24, height: 24, backgroundColor: '#4f46e5', borderRadius: '50%', border: '3px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                      }}
                    />
                  </div>
          <input
            type="number"
            value={maxDuration}
                    className="w-24 px-4 py-2 text-center border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-lg"
            onChange={(e) => setMaxDuration(Number(e.target.value))}
          />
                </div>
                <p className="text-sm text-gray-500 mt-2">Current: {formatTime(maxDuration)}</p>
              </div>
        </div>
      </div>
    </div>

        {/* Messages Configuration Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl flex items-center justify-center mr-6">
              <FaComments className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Message Configuration</h2>
              <p className="text-gray-600 text-lg">
                Customize the messages sent to and from your assistant
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3">Client Messages</label>
                <input 
                  type="text" 
                  placeholder="Enter client message template..."
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
                />
        </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3">Server Messages</label>
                <input 
                  type="text" 
                  placeholder="Enter server message template..."
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                />
              </div>
        </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3">End Call Message</label>
                <input 
                  type="text" 
                  value="See you soon" 
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300" 
                />
        </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3">Idle Messages</label>
                <input 
                  type="text" 
                  placeholder="Enter idle message template..."
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300" 
                />
              </div>
            </div>
        </div>

          {/* Additional Message Settings */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center mb-4">
                <FaClock className="w-5 h-5 text-indigo-600 mr-3" />
        <div>
                  <label className="text-lg font-semibold text-gray-900">Max Idle Messages</label>
                  <p className="text-gray-600 text-sm">Maximum idle messages per call</p>
                </div>
        </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
          <Slider
            axis="x"
            x={silenceTimeout}
            xmax={600}
            xmin={0}
            onChange={({ x }) => setSilenceTimeout(x)}
            styles={{
                      track: { backgroundColor: '#e0e7ff', height: 8, borderRadius: 4 },
                      active: { backgroundColor: '#6366f1', height: 8, borderRadius: 4 },
                      thumb: { width: 24, height: 24, backgroundColor: '#4f46e5', borderRadius: '50%', border: '3px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                    }}
                  />
                </div>
          <input
            type="number"
            value={silenceTimeout}
                  className="w-24 px-4 py-2 text-center border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-lg"
            onChange={(e) => setSilenceTimeout(Number(e.target.value))}
          />
        </div>
      </div>

            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
              <div className="flex items-center mb-4">
                <FaClock className="w-5 h-5 text-teal-600 mr-3" />
        <div>
                  <label className="text-lg font-semibold text-gray-900">Idle Timeout</label>
                  <p className="text-gray-600 text-sm">Seconds before idle message</p>
                </div>
        </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
          <Slider
            axis="x"
            x={silenceTimeout}
            xmax={600}
            xmin={0}
            onChange={({ x }) => setSilenceTimeout(x)}
            styles={{
                      track: { backgroundColor: '#ccfbf1', height: 8, borderRadius: 4 },
                      active: { backgroundColor: '#14b8a6', height: 8, borderRadius: 4 },
                      thumb: { width: 24, height: 24, backgroundColor: '#0f766e', borderRadius: '50%', border: '3px solid #ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
                    }}
                  />
                </div>
          <input
            type="number"
            value={silenceTimeout}
                  className="w-24 px-4 py-2 text-center border-2 border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-lg"
            onChange={(e) => setSilenceTimeout(Number(e.target.value))}
          />
              </div>
            </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Advance;
