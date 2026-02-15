import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  X,
  Loader2,
  Waves,
  Clock
} from 'lucide-react';

interface CallingUIProps {
  isVisible: boolean;
  onEndCall: () => void;
  status: 'connecting' | 'connected' | 'ended';
  agentName?: string;
  callDuration?: number;
}

const CallingUI: React.FC<CallingUIProps> = ({ 
  isVisible, 
  onEndCall, 
  status, 
  agentName = "AI Assistant",
  callDuration = 0
}) => {
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isVisible || status !== 'connected') return;

    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative h-24 bg-gradient-to-r from-primary-500 to-secondary-500">
            <button
              onClick={onEndCall}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-8 text-center relative -mt-12">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 border-4 border-white shadow-lg flex items-center justify-center`}>
                <Phone className={`w-8 h-8 ${status === 'connected' ? 'text-primary-600' : 'text-gray-600'}`} />
              </div>
              
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
              }`}>
                {status === 'connected' && (
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                )}
              </div>
            </div>

            {/* Agent Name */}
            <h2 className="text-xl font-bold text-gray-900 mb-1">{agentName}</h2>
            
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-6">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Status Message */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-600 text-sm">
                {status === 'connected' 
                  ? 'You are now connected. Speak naturally.' 
                  : 'Establishing secure connection...'}
              </p>
            </div>

            {/* Wave Animation */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full ${
                    status === 'connected' ? 'bg-primary-500' : 'bg-gray-400'
                  }`}
                  style={{
                    height: '30px',
                    animation: `waveform ${0.5 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setMuted(!muted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  muted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  !speakerOn ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={onEndCall}
                className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-110"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default CallingUI;