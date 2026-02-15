import { FaChartLine, FaClipboardCheck, FaBullseye, FaLightbulb } from 'react-icons/fa';

interface AssistantData {
  success_evalution?: string
}

const Analytics = ({ assistantData, handleChange }: { assistantData: AssistantData; handleChange: (key: keyof AssistantData, value: string) => void }) => {
  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mr-6">
              <FaChartLine className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Success Evaluation</h2>
              <p className="text-gray-600 text-lg">
                Configure how your assistant evaluates call success and performance
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <FaClipboardCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">Evaluation</p>
              <p className="text-xs text-green-600">Success Metrics</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <FaBullseye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800">Rubric</p>
              <p className="text-xs text-blue-600">Assessment Criteria</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <FaLightbulb className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-800">Prompts</p>
              <p className="text-xs text-purple-600">AI Instructions</p>
            </div>
          </div>
        </div>

        {/* Main Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaClipboardCheck className="w-5 h-5 text-green-600 mr-3" />
              Success Evaluation Configuration
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Evaluate if your call was successful. You can use the Rubric standalone or in combination with the Success Evaluation Prompt. 
              If both are provided, they are concatenated into appropriate instructions.
            </p>
          </div>

          <div className="space-y-6">
            {/* Success Evaluation Textarea */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Success Evaluation Criteria
              </label>
              <div className="relative">
                <textarea
                  className="w-full h-32 px-6 py-4 bg-white border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Enter your success evaluation criteria here..."
                  value={assistantData.success_evalution || ""}
                  onChange={(e) => handleChange('success_evalution', e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                  {assistantData.success_evalution?.length || 0} characters
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                <FaLightbulb className="w-4 h-4 text-yellow-500 inline mr-2" />
                Your expert call evaluator. Define clear criteria for measuring call success.
              </p>
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                  <FaChartLine className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">How It Works</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• <strong>Rubric:</strong> Define specific criteria and scoring for call evaluation</p>
                    <p>• <strong>Success Evaluation Prompt:</strong> Provide AI instructions for assessment</p>
                    <p>• <strong>Combined:</strong> When both are provided, they work together for comprehensive evaluation</p>
                    <p>• <strong>Real-time:</strong> Your assistant will use these criteria during and after calls</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FaBullseye className="w-4 h-4 text-blue-600 mr-2" />
                Example Success Criteria
              </h4>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  "Evaluate call success based on: 1) Customer satisfaction (1-10), 2) Problem resolution (Yes/No), 
                  3) Call duration appropriateness, 4) Professional tone maintained, 5) Follow-up actions identified. 
                  Score 8+ for successful calls."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
