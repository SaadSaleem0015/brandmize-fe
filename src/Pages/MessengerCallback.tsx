// pages/channel/messenger.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../Helpers/BackendRequest';

const MessengerCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetail, setErrorDetail] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorReason = params.get('error_reason');

        // Check if user denied access
        if (error || errorReason) {
          const errorMsg = errorReason || error || 'Access denied by user';
          setErrorMessage('Facebook Access Denied');
          setErrorDetail(errorMsg);
          setStatus('error');
          return;
        }

        // Validate code is present
        if (!code) {
          setErrorMessage('Missing Authorization Code');
          setErrorDetail('No authorization code received from Facebook');
          setStatus('error');
          return;
        }

        setStatus('processing');

        // Send code as query parameter
        const response = await api.post(`/channel/messenger/connect?code=${encodeURIComponent(code)}`);

        console.log('Messenger API response:', response.data);

        // If we get here, it means the backend successfully processed the connection
        setStatus('success');

      } catch (error: any) {
        console.error('Messenger callback error:', error);
        
        // Handle 500 error with custom message
        if (error.response?.status === 500) {
          setErrorMessage('Messenger Connection Failed');
          setErrorDetail(error.response?.data?.detail || 'Server error occurred');
        } 
        // Handle other errors
        else if (error.response?.data?.detail) {
          // Handle FastAPI validation errors
          if (Array.isArray(error.response.data.detail)) {
            const details = error.response.data.detail.map((err: any) => err.msg).join(', ');
            setErrorMessage('Validation Error');
            setErrorDetail(details);
          } else {
            // Split the error message into title and detail
            const errorText = error.response.data.detail;
            if (errorText.includes(':')) {
              const [title, ...detailParts] = errorText.split(':');
              setErrorMessage(title);
              setErrorDetail(detailParts.join(':').trim());
            } else {
              setErrorMessage('Connection Failed');
              setErrorDetail(errorText);
            }
          }
        } else if (error.response?.data?.error) {
          setErrorMessage('Connection Failed');
          setErrorDetail(error.response.data.error);
        } else if (error.message) {
          setErrorMessage('Connection Error');
          setErrorDetail(error.message);
        } else {
          setErrorMessage('Connection Failed');
          setErrorDetail('An unknown error occurred');
        }
        
        setStatus('error');
      }
    };

    handleCallback();
  }, []);

  // Handle retry - go back to channels and reopen connect flow
  const handleRetry = () => {
    navigate('/channels?retry=messenger');
  };

  // Handle return to channels
  const handleReturnToChannels = () => {
    navigate('/channels');
  };

  // Handle try again with different permissions
  const handleTryAgain = () => {
    // Generate new state
    const state = Math.random().toString(36).substring(2, 15);
    
    const redirectUri = import.meta.env.DEV 
      ? 'http://localhost:5173/channel/messenger'
      : 'https://vortician.com/channel/messenger';
    
    // Build Facebook OAuth URL
    const messengerAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth` +
      `?client_id=1442925387269173` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement` +
      `&state=${state}`;
    
    window.location.href = messengerAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          {status === 'processing' && (
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
              <Facebook className="w-10 h-10 text-white" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {status === 'processing' && 'Connecting Messenger...'}
          {status === 'success' && 'Messenger Connected!'}
          {status === 'error' && (errorMessage || 'Connection Failed')}
        </h1>

        {/* Message */}
        {status === 'processing' && (
          <p className="text-gray-600 mb-6">
            Please wait while we complete the connection...
          </p>
        )}

        {status === 'success' && (
          <>
            <p className="text-gray-600 mb-6">
              Your Facebook page has been successfully connected.
            </p>
            <div className="space-y-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-full"></div>
              </div>
              <button
                onClick={handleReturnToChannels}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Return to Channels
              </button>
            </div>
          </>
        )}

        {/* Error State with Actions */}
        {status === 'error' && (
          <div className="space-y-6">
            {/* Error Detail Box */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
              <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
              <p className="text-sm text-red-600 break-words">{errorDetail}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleTryAgain}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={handleReturnToChannels}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Channels</span>
              </button>

              {/* Help Text */}
              <div className="pt-4 text-sm text-gray-500 border-t border-gray-200">
                <p className="font-medium text-gray-700 mb-2">Why did this happen?</p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Make sure you have a Facebook Page</li>
                  <li>Grant all requested permissions during connection</li>
                  <li>You need admin access to the Facebook Page</li>
                  <li>Page must have messaging enabled</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerCallback;