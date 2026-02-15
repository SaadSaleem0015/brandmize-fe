import { useState } from 'react';
import Switch from 'react-switch';
import { FaCog, FaPhone, FaKeypad, FaForward, FaMicrophone, FaRocket, FaCheckCircle } from 'react-icons/fa';

const Functions = () => {
  const [endCallFunction, setEndCallFunction] = useState(false);
  const [dialKeypad, setDialKeypad] = useState(false);
  const [forwardingPhoneNumber, setForwardingPhoneNumber] = useState('');
  const [endCallPhrases, setEndCallPhrases] = useState('');

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-orange-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mr-6">
              <FaCog className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Predefined Functions</h2>
              <p className="text-gray-600 text-lg">
                Enable and configure pre-built functions for common use cases
              </p>
            </div>
          </div>

          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <FaPhone className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-800">Call Control</p>
              <p className="text-xs text-orange-600">End calls intelligently</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <FaKeypad className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800">Keypad Access</p>
              <p className="text-xs text-blue-600">Dial and navigate</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <FaForward className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">Call Forwarding</p>
              <p className="text-xs text-green-600">Route calls efficiently</p>
            </div>
          </div>
        </div>

        {/* Main Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaRocket className="w-5 h-5 text-orange-600 mr-3" />
            Function Configuration
          </h3>

          <div className="space-y-8">
            {/* End Call Function */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mr-4 mt-1">
                    <FaPhone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <label className="text-xl font-semibold text-gray-900 mb-2 block">Enable End Call Function</label>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      This will allow the assistant to end the call from its side. 
                      Best for GPT-4 and bigger models.
                    </p>
                  </div>
                </div>
            <Switch
              onChange={() => setEndCallFunction(!endCallFunction)}
              checked={endCallFunction}
                  onColor="#ea580c"
                  offColor="#d1d5db"
              uncheckedIcon={false}
              checkedIcon={false}
                  height={28}
                  width={56}
            />
          </div>
              {endCallFunction && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center text-green-600">
                    <FaCheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">End Call Function Enabled</span>
                  </div>
                </div>
              )}
        </div>

            {/* Dial Keypad */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 mt-1">
                    <FaKeypad className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <label className="text-xl font-semibold text-gray-900 mb-2 block">Dial Keypad</label>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      This sets whether the assistant can dial digits on the keypad 
                      for interactive voice response systems.
                    </p>
                  </div>
                </div>
            <Switch
              onChange={() => setDialKeypad(!dialKeypad)}
              checked={dialKeypad}
                  onColor="#2563eb"
                  offColor="#d1d5db"
              uncheckedIcon={false}
              checkedIcon={false}
                  height={28}
                  width={56}
            />
          </div>
              {dialKeypad && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center text-blue-600">
                    <FaCheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Keypad Access Enabled</span>
                  </div>
                </div>
              )}
        </div>

            {/* Forwarding Phone Number */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <FaForward className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Forwarding Phone Number</label>
                  <p className="text-gray-600 text-sm mb-4">
                    Set the phone number where calls should be forwarded when needed.
                  </p>
          <input
            type="text"
            value={forwardingPhoneNumber}
            onChange={(e) => setForwardingPhoneNumber(e.target.value)}
                    placeholder="Enter forwarding phone number..."
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
          />
                </div>
              </div>
        </div>

            {/* End Call Phrases */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4 mt-1">
                  <FaMicrophone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-lg font-semibold text-gray-900 mb-2">End Call Phrases</label>
                  <p className="text-gray-600 text-sm mb-4">
                    Define phrases that will signal the end of a call. 
                    These help create natural conversation endings.
                  </p>
          <textarea
            value={endCallPhrases}
            onChange={(e) => setEndCallPhrases(e.target.value)}
                    placeholder="Enter phrases that will end the call (e.g., Thank you for contacting us, Have a great day, Goodbye)..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Separate multiple phrases with commas or new lines
                  </p>
                </div>
              </div>
            </div>
        </div>

          {/* Help Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <FaCog className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Function Benefits</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• <strong>End Call Function:</strong> Gives your assistant control over call termination</p>
                  <p>• <strong>Dial Keypad:</strong> Enables interaction with IVR systems and phone menus</p>
                  <p>• <strong>Call Forwarding:</strong> Routes calls to appropriate departments or agents</p>
                  <p>• <strong>End Call Phrases:</strong> Creates natural conversation endings</p>
                </div>
              </div>
            </div>
          </div>
      </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-end">
          <button className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <FaRocket className="w-5 h-5 inline mr-2" />
            Publish Functions
        </button>
        </div>
      </div>
    </div>
  );
};

export default Functions;
