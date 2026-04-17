// pages/Channels.tsx
import React, { useState, useEffect } from 'react';
import {
  Instagram,
  Facebook,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Building2,
  Link2,
  Unlink,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from "../Helpers/BackendRequest";
import { notifyResponse } from "../Helpers/notyf";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Types
interface InstagramAccountInfo {
  app_id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  channel_type: 'instagram';
  ai_enabled: boolean;
}

interface MessengerAccountInfo {
  app_id: string;
  name: string;
  category: string;
  channel_type: 'messenger';
  ai_enabled: boolean;
}

interface WhatsAppAccountInfo {
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  channel_type: 'whatsapp';
  ai_enabled: boolean;
}

type AccountInfo = InstagramAccountInfo | MessengerAccountInfo | WhatsAppAccountInfo;

interface ConnectionStatus {
  connected: boolean;
  accountInfo?: AccountInfo;
  loading: boolean;
  error?: string;
}

const Channels: React.FC = () => {
  const [instagramStatus, setInstagramStatus] = useState<ConnectionStatus>({
    connected: false,
    loading: true,
  });

  const [messengerStatus, setMessengerStatus] = useState<ConnectionStatus>({
    connected: false,
    loading: true,
  });

  const [whatsappStatus, setWhatsappStatus] = useState<ConnectionStatus>({
    connected: false,
    loading: true,
  });

  const [connecting] = useState<{
    instagram: boolean;
    messenger: boolean;
  }>({
    instagram: false,
    messenger: false,
  });

  const [aiToggleLoading, setAiToggleLoading] = useState<{
    instagram: boolean;
    messenger: boolean;
    whatsapp: boolean;
  }>({
    instagram: false,
    messenger: false,
    whatsapp: false,
  });

  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [whatsappForm, setWhatsappForm] = useState({ phone_number_id: '', access_token: '' });
  const [whatsappConnecting, setWhatsappConnecting] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const [showHelp, setShowHelp] = useState(false);

  // Check for success/error params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    const errorDetail = params.get('detail');

    if (success) {
      const channelName =
        success === 'instagram' ? 'Instagram' :
        success === 'messenger' ? 'Messenger' :
        'Channel';
      notifyResponse({ success: true, detail: `${channelName} connected successfully!` });
    }

    if (error) {
      const channelName =
        error === 'instagram' ? 'Instagram' :
        error === 'messenger' ? 'Messenger' :
        'Channel';
      notifyResponse({
        success: false,
        detail: errorDetail || `Failed to connect ${channelName.toLowerCase()}`,
      });
    }

    // Clean up URL
    if (success || error) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check connection status for both platforms
  const checkConnectionStatus = async () => {
    // Check Instagram connection
    try {
      const instagramResponse = await api.get('/channel/instagram/account-info');
      if (instagramResponse.data) {
        setInstagramStatus({
          connected: true,
          accountInfo: instagramResponse.data,
          loading: false,
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 404 && error.response?.status !== 401) {
        setInstagramStatus({
          connected: false,
          loading: false,
          error: 'Failed to fetch Instagram connection status',
        });
      } else {
        setInstagramStatus({
          connected: false,
          loading: false,
        });
      }
    }

    // Check Messenger connection
    try {
      const messengerResponse = await api.get('/channel/messenger/account-info');
      if (messengerResponse.data) {
        setMessengerStatus({
          connected: true,
          accountInfo: messengerResponse.data,
          loading: false,
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 404 && error.response?.status !== 401) {
        setMessengerStatus({
          connected: false,
          loading: false,
          error: 'Failed to fetch Messenger connection status',
        });
      } else {
        setMessengerStatus({
          connected: false,
          loading: false,
        });
      }
    }

    // Check WhatsApp connection
    try {
      const whatsappResponse = await api.get('/channel/whatsapp/account-info');
      if (whatsappResponse.data) {
        setWhatsappStatus({
          connected: true,
          accountInfo: whatsappResponse.data,
          loading: false,
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 404 && error.response?.status !== 401) {
        setWhatsappStatus({
          connected: false,
          loading: false,
          error: 'Failed to fetch WhatsApp connection status',
        });
      } else {
        setWhatsappStatus({
          connected: false,
          loading: false,
        });
      }
    }
  };

  const handleAIToggle = async (platform: 'instagram' | 'messenger' | 'whatsapp') => {
    const currentStatus =
      platform === 'instagram' ? instagramStatus :
      platform === 'messenger' ? messengerStatus :
      whatsappStatus;
    const accountInfo = currentStatus.accountInfo;

    if (!accountInfo) return;

    const currentEnabled = 'ai_enabled' in accountInfo ? accountInfo.ai_enabled : false;
    const newEnabled = !currentEnabled;

    setAiToggleLoading(prev => ({
      ...prev,
      [platform]: true,
    }));

    try {
      const response = await api.put('/channel/auto-reply', {
        channel_type: platform,
        ai_enabled: newEnabled,
      });

      if (response.data?.success) {
        const setter =
          platform === 'instagram' ? setInstagramStatus :
          platform === 'messenger' ? setMessengerStatus :
          setWhatsappStatus;
        setter(prev => prev.accountInfo ? {
          ...prev,
          accountInfo: { ...prev.accountInfo, ai_enabled: newEnabled } as AccountInfo,
        } : prev);

        notifyResponse(response.data, `AI auto-reply ${newEnabled ? 'enabled' : 'disabled'}.`);
      } else {
        notifyResponse(response.data ?? { success: false, detail: "Failed to update AI auto-reply setting" });
      }
    } catch (error) {
      notifyResponse(error, undefined, "Failed to update AI auto-reply setting");
    } finally {
      setAiToggleLoading(prev => ({
        ...prev,
        [platform]: false,
      }));
    }
  };

  // Generate CSRF token
  const generateCSRFToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Handle Instagram connect
  const handleInstagramConnect = () => {
    const csrfToken = generateCSRFToken();
    sessionStorage.setItem('instagram_csrf', csrfToken);
    
    const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1486358803007440&redirect_uri=https://brandmize.net/channel/instagram&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    
    window.location.href = instagramAuthUrl;
  };

  // Handle Messenger connect
  const handleMessengerConnect = () => {
    const csrfToken = generateCSRFToken();
    sessionStorage.setItem('messenger_csrf', csrfToken);
    
    const messengerAuthUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=1107315431529265&redirect_uri=https://app.brandmize.net/channel/messenger&response_type=code&scope=pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement,business_management&state=RANDOM_CSRF_TOKEN`;
    



    window.location.href = messengerAuthUrl;
  };

  // Handle disconnect
  const handleDisconnect = async (platform: 'instagram' | 'messenger' | 'whatsapp') => {
    const platformName = platform === 'instagram' ? 'Instagram' : platform === 'messenger' ? 'Messenger' : 'WhatsApp';
    if (!window.confirm(`Are you sure you want to disconnect your ${platformName} account?`)) {
      return;
    }

    try {
      const response = await api.delete(`/channel/${platform}/disconnect`);

      if (platform === 'instagram') {
        setInstagramStatus({ connected: false, loading: false });
      } else if (platform === 'messenger') {
        setMessengerStatus({ connected: false, loading: false });
      } else {
        setWhatsappStatus({ connected: false, loading: false });
      }

      notifyResponse(
        response.data ?? { success: true, detail: `${platformName} disconnected successfully` },
        `${platformName} disconnected successfully`
      );
    } catch (error) {
      notifyResponse(error, undefined, `Failed to disconnect ${platformName} account`);
    }
  };

  // Handle WhatsApp connect
  const handleWhatsAppConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappForm.phone_number_id.trim() || !whatsappForm.access_token.trim()) return;

    setWhatsappConnecting(true);
    try {
      const response = await api.post('/channel/whatsapp/connect', {
        phone_number_id: whatsappForm.phone_number_id.trim(),
        access_token: whatsappForm.access_token.trim(),
      });

      if (response.data) {
        setWhatsappStatus({
          connected: true,
          accountInfo: response.data,
          loading: false,
        });
        setShowWhatsAppForm(false);
        setWhatsappForm({ phone_number_id: '', access_token: '' });
        notifyResponse({ success: true, detail: 'WhatsApp connected successfully!' });
      }
    } catch (error) {
      notifyResponse(error, undefined, 'Failed to connect WhatsApp');
    } finally {
      setWhatsappConnecting(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setInstagramStatus(prev => ({ ...prev, loading: true }));
    setMessengerStatus(prev => ({ ...prev, loading: true }));
    setWhatsappStatus(prev => ({ ...prev, loading: true }));
    checkConnectionStatus();
    notifyResponse({ success: true, detail: "Refreshing connection status..." });
  };

  // Get platform config
  const getPlatformConfig = (platform: 'instagram' | 'messenger' | 'whatsapp') => {
    if (platform === 'instagram') {
      return {
        icon: Instagram,
        name: 'Instagram',
        gradient: 'from-purple-500 to-pink-500',
        lightGradient: 'from-purple-50 to-pink-50',
        bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:from-purple-600 hover:to-pink-600',
      };
    } else if (platform === 'messenger') {
      return {
        icon: Facebook,
        name: 'Messenger',
        gradient: 'from-blue-500 to-indigo-500',
        lightGradient: 'from-blue-50 to-indigo-50',
        bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200',
        hoverColor: 'hover:from-blue-600 hover:to-indigo-600',
      };
    } else {
      return {
        icon: WhatsAppIcon,
        name: 'WhatsApp',
        gradient: 'from-green-500 to-emerald-500',
        lightGradient: 'from-green-50 to-emerald-50',
        bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
        textColor: 'text-green-600',
        borderColor: 'border-green-200',
        hoverColor: 'hover:from-green-600 hover:to-emerald-600',
      };
    }
  };

  // Render account info
  const renderAccountInfo = (platform: 'instagram' | 'messenger' | 'whatsapp', status: ConnectionStatus) => {
    const config = getPlatformConfig(platform);
    const accountInfo = status.accountInfo;

    if (!accountInfo) {
      return (
        <div className="text-center py-8">
          <div className={`w-20 h-20 mx-auto ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
            <config.icon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connected but no details available</h3>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      );
    }

    const aiEnabled = 'ai_enabled' in accountInfo ? accountInfo.ai_enabled : false;

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            {/* Profile/Avatar */}
            {platform === 'instagram' && (accountInfo as InstagramAccountInfo).profile_picture_url ? (
              <img 
                src={(accountInfo as InstagramAccountInfo).profile_picture_url} 
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center shadow-lg`}>
                <config.icon className="w-8 h-8 text-white" />
              </div>
            )}
            
            {/* Account Details */}
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                {platform === 'whatsapp'
                  ? (accountInfo as WhatsAppAccountInfo).verified_name
                  : (accountInfo as InstagramAccountInfo | MessengerAccountInfo).name}
              </h3>
              {platform === 'instagram' && (accountInfo as InstagramAccountInfo).username && (
                <p className="text-sm text-gray-500">
                  @{(accountInfo as InstagramAccountInfo).username}
                </p>
              )}
              {platform === 'messenger' && (accountInfo as MessengerAccountInfo).category && (
                <p className="text-sm text-gray-500">
                  {(accountInfo as MessengerAccountInfo).category}
                </p>
              )}
              {platform === 'whatsapp' && (
                <p className="text-sm text-gray-500">
                  {(accountInfo as WhatsAppAccountInfo).display_phone_number}
                </p>
              )}
            </div>
          </div>
          
          {/* Status Badge and Disconnect */}
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
            </span>
            <button
              onClick={() => handleDisconnect(platform)}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
            >
              <Unlink className="w-4 h-4" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>
        </div>

        {/* App Details Card */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
            Application Details
          </h4>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <dt className="text-xs text-gray-500 mb-1">
                {platform === 'whatsapp' ? 'Phone Number ID' : 'App ID'}
              </dt>
              <dd className="text-sm font-mono text-gray-800 break-all">
                {platform === 'whatsapp'
                  ? (accountInfo as WhatsAppAccountInfo).phone_number_id
                  : (accountInfo as InstagramAccountInfo | MessengerAccountInfo).app_id}
              </dd>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <dt className="text-xs text-gray-500 mb-1">Channel Type</dt>
              <dd className="text-sm font-medium text-gray-800 capitalize">
                {accountInfo.channel_type}
              </dd>
            </div>
          </dl>
        </div>

        {/* AI Auto-Reply Toggle */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 p-2 bg-white rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">
                AI Auto-Reply
              </h4>
              <p className="text-xs text-gray-600 mt-1 max-w-md">
                Automatically reply to new {platform === 'instagram' ? 'Instagram DMs and story replies' : platform === 'messenger' ? 'Messenger conversations' : 'WhatsApp messages'} using your AI assistant.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAIToggle(platform)}
            disabled={aiToggleLoading[platform]}
            className={`relative inline-flex h-6 w-12 items-center rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 ${
              aiEnabled
                ? 'bg-primary-500 border-primary-500 shadow-sm'
                : 'bg-gray-200 border-gray-300'
            } ${aiToggleLoading[platform] ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 flex items-center justify-center ${
                aiEnabled ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            >
              
            </span>
            <span className="sr-only">
              Toggle AI auto-reply for {platform}
            </span>
          </button>
        </div>

        {/* Permissions Info */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 bg-primary-50 p-3 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-primary-500" />
          <span>Basic messaging permissions granted</span>
        </div>
      </div>
    );
  };

  // Render connect button
  const renderConnectButton = (platform: 'instagram' | 'messenger', isConnecting: boolean) => {
    const config = getPlatformConfig(platform);
    
    return (
      <div className="text-center py-8">
        <div className={`w-24 h-24 mx-auto ${config.bgColor} rounded-full flex items-center justify-center mb-4 shadow-lg`}>
          <config.icon className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Connect your {config.name} account
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Enable automated messaging and engagement for your {config.name} Business account
        </p>
        <button
          onClick={platform === 'instagram' ? handleInstagramConnect : handleMessengerConnect}
          disabled={isConnecting}
          className={`inline-flex items-center space-x-2 px-6 py-3 ${config.bgColor} text-white rounded-lg ${config.hoverColor} transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md`}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              <span>Connect {config.name}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Social Media Connections</h1>
            <p className="text-gray-600 mt-2">
              Connect your social media accounts to enable automated messaging and engagement
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:text-primary-500 hover:border-primary-300 transition-colors shadow-sm text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Status</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Instagram className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Instagram</p>
                <p className="text-lg font-semibold text-gray-800">
                  {instagramStatus.loading ? (
                    <span className="text-gray-400">Checking...</span>
                  ) : instagramStatus.connected ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-gray-600">Not Connected</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Facebook className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Messenger</p>
                <p className="text-lg font-semibold text-gray-800">
                  {messengerStatus.loading ? (
                    <span className="text-gray-400">Checking...</span>
                  ) : messengerStatus.connected ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-gray-600">Not Connected</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <WhatsAppIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="text-lg font-semibold text-gray-800">
                  {whatsappStatus.loading ? (
                    <span className="text-gray-400">Checking...</span>
                  ) : whatsappStatus.connected ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-gray-600">Not Connected</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Connection Card */}
        <div className="bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Instagram</h2>
                <p className="text-sm text-purple-100">Connect your Instagram Business account</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {instagramStatus.loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-500"></div>
                <p className="mt-4 text-gray-500">Checking connection status...</p>
              </div>
            ) : instagramStatus.connected ? (
              renderAccountInfo('instagram', instagramStatus)
            ) : (
              renderConnectButton('instagram', connecting.instagram)
            )}
            
            {instagramStatus.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Connection Error</p>
                  <p className="text-sm text-red-600">{instagramStatus.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Facebook/Messenger Connection Card */}
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Facebook className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Facebook Messenger</h2>
                <p className="text-sm text-blue-100">Connect your Facebook page for Messenger</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {messengerStatus.loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
                <p className="mt-4 text-gray-500">Checking connection status...</p>
              </div>
            ) : messengerStatus.connected ? (
              renderAccountInfo('messenger', messengerStatus)
            ) : (
              renderConnectButton('messenger', connecting.messenger)
            )}
            
            {messengerStatus.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Connection Error</p>
                  <p className="text-sm text-red-600">{messengerStatus.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Connection Card */}
        <div className="bg-white rounded-2xl shadow-md border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <WhatsAppIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">WhatsApp Business</h2>
                <p className="text-sm text-green-100">Connect your WhatsApp Business account</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {whatsappStatus.loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-500"></div>
                <p className="mt-4 text-gray-500">Checking connection status...</p>
              </div>
            ) : whatsappStatus.connected ? (
              renderAccountInfo('whatsapp', whatsappStatus)
            ) : showWhatsAppForm ? (
              <form onSubmit={handleWhatsAppConnect} className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={whatsappForm.phone_number_id}
                    onChange={e => setWhatsappForm(prev => ({ ...prev, phone_number_id: e.target.value }))}
                    placeholder="e.g. 1104414602755661"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={whatsappForm.access_token}
                      onChange={e => setWhatsappForm(prev => ({ ...prev, access_token: e.target.value }))}
                      placeholder="Your WhatsApp Business access token"
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={whatsappConnecting}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm font-medium"
                  >
                    {whatsappConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        <span>Connect WhatsApp</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowWhatsAppForm(false); setWhatsappForm({ phone_number_id: '', access_token: '' }); }}
                    className="inline-flex items-center space-x-1 px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <WhatsAppIcon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Connect your WhatsApp Business account
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Enable automated messaging and engagement for your WhatsApp Business account
                </p>
                <button
                  onClick={() => setShowWhatsAppForm(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-md"
                >
                  <Link2 className="w-5 h-5" />
                  <span>Connect WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}

            {whatsappStatus.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Connection Error</p>
                  <p className="text-sm text-red-600">{whatsappStatus.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section with Toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <HelpCircle className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-700">Need help connecting?</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${showHelp ? 'rotate-180' : ''}`} />
          </button>
          
          {showHelp && (
            <div className="px-5 pb-5">
              <div className="border-t border-primary-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <Instagram className="w-4 h-4 mr-2 text-purple-500" />
                      Instagram Requirements
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span>Must be an Instagram Business or Creator account</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span>Connected to a Facebook Page</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span>Admin access to the connected Facebook Page</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <Facebook className="w-4 h-4 mr-2 text-blue-500" />
                      Messenger Requirements
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Must have a Facebook Page</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Admin access to the Facebook Page</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>Page must have messaging enabled</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <WhatsAppIcon className="w-4 h-4 mr-2 text-green-500" />
                      WhatsApp Requirements
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>WhatsApp Business API access</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>Phone Number ID from Meta Business Suite</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>Permanent or long-lived access token</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By connecting your accounts, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Channels;