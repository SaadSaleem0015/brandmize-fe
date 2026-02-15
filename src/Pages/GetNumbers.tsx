import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSearch, FaShoppingCart } from 'react-icons/fa';
import AvailableNumbers from '../Components/GetNumberTabs/AvailableNumbers';
import PurchasedNumbers from '../Components/GetNumberTabs/PurchasedNumbers';

const GetNumbers: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-numbers' | 'buy-numbers'>('buy-numbers');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 ">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </button>

        {/* Tab Navigation: Buy Numbers | My Numbers */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('buy-numbers')}
              className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'buy-numbers'
                  ? 'border-primary-600 text-primary bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaShoppingCart className="w-4 h-4 mr-2" />
              Buy Numbers
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                New
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('my-numbers')}
              className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'my-numbers'
                  ? 'border-primary-dark text-primary bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCheckCircle className="w-4 h-4 mr-2" />
              My Numbers
            </button>
          </div>
        </div>

        {/* Tab Content with Clean Layout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Buy Numbers Tab */}
          {activeTab === 'buy-numbers' && (
            <div>
              {/* Search Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                  <FaSearch className="w-5 h-5 text-blue-600 mr-2" />
                  Find Available Numbers
                </h2>
                <p className="text-gray-600">
                  Search for phone numbers in your desired area. Click "Purchase" to buy instantly.
                </p>
              </div>
              
              {/* Search Tips */}
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium mr-2">Tip:</span>
                  Search by area code, city, or state to find local numbers
                </div>
              </div>
              
              {/* Numbers List */}
              <div className="p-1">
                <AvailableNumbers />
              </div>
            </div>
          )}
          
          {/* My Numbers Tab */}
          {activeTab === 'my-numbers' && (
            <div>
         
              <div className="p-6">
                <PurchasedNumbers />
                
              
              </div>
            </div>
          )}
        </div>
        
        {/* Help Section */}
     
      </div>
    </div>
  );
};

export default GetNumbers;