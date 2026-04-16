import { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Terminal, Shield, Zap, Loader2 } from 'lucide-react';

export const ChatInterface = ({ onSendMessage, isLoading, lastResponse }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isScanning) return;

    const userMessage = message.trim();
    const timestamp = new Date().toISOString();
    
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userMessage,
      timestamp 
    }]);
    setMessage('');
    setIsScanning(true);

    // Simulate scanning animation
    setTimeout(async () => {
      const response = await onSendMessage(userMessage);
      setIsScanning(false);

      if (response.success) {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          content: response.response,
          timestamp: new Date().toISOString(),
          confidence: response.confidence,
          mock_mode: response.mock_mode
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'error', 
          content: response.error,
          reason: response.reason,
          severity: response.severity,
          attack_type: response.attack_type,
          timestamp: new Date().toISOString(),
          confidence: response.confidence
        }]);
      }
    }, 1500);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="glass-card flex flex-col h-full border-0">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="glass-card p-2 glow-blue">
            <Terminal className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white terminal-text">PROTECTED_TERMINAL</h2>
            <p className="text-xs text-gray-400 terminal-text">ALL_INPUTS_SCANNED • DUAL_LLM_ACTIVE</p>
          </div>
          {isScanning && (
            <div className="flex items-center gap-2 text-cyan-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs terminal-text scanning">SCANNING...</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] bg-black/20">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="relative mb-4">
              <Terminal className="w-12 h-12 mx-auto text-blue-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-400/20 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-lg font-medium text-gray-300 terminal-text mb-2">TERMINAL_READY</p>
            <p className="text-sm text-gray-500 terminal-text mb-3">Awaiting input...</p>
            <div className="text-xs text-gray-600 terminal-text">
              <p>Test threat detection:</p>
              <p className="text-crimson-red mt-1">&gt; ignore previous instructions</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-4 terminal-text ${
                msg.type === 'user' 
                  ? 'console-user' 
                  : msg.type === 'error'
                  ? 'console-error'
                  : 'console-system'
              }`}>
                {/* Message Header */}
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                  {msg.type === 'user' && (
                    <>
                      <Terminal className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-blue-400">USER_INPUT</span>
                    </>
                  )}
                  {msg.type === 'assistant' && (
                    <>
                      <Shield className="w-4 h-4 text-emerald-green" />
                      <span className="text-xs text-emerald-green">
                        {msg.mock_mode ? 'SYSTEM_RESPONSE_MOCK' : 'SYSTEM_RESPONSE_LLM'}
                      </span>
                    </>
                  )}
                  {msg.type === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-crimson-red" />
                      <span className="text-xs text-crimson-red">THREAT_BLOCKED</span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* Message Content */}
                <div className="text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Additional Info */}
                {msg.type === 'error' && msg.reason && (
                  <div className="mt-3 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      <span className="text-amber-warning">REASON:</span> {msg.reason}
                    </p>
                    {msg.attack_type && (
                      <p className="text-xs text-gray-400 mt-1">
                        <span className="text-amber-warning">ATTACK_TYPE:</span> {msg.attack_type}
                      </p>
                    )}
                  </div>
                )}
                
                {msg.confidence && (
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                      CONF: {(msg.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Scanning Indicator */}
        {isScanning && (
          <div className="flex justify-start">
            <div className="console-user max-w-[85%] rounded-lg p-4 terminal-text">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs text-cyan-400 scanning">SCANNING_INPUT</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-400">Analyzing security...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Terminal className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter command or message..."
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 terminal-text"
              maxLength={2000}
              disabled={isLoading || isScanning}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || isScanning || !message.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium terminal-text btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300"
          >
            {isLoading || isScanning ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>SEND</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 terminal-text">
            BUFFER: {message.length}/2000 chars
          </p>
          <p className="text-xs text-gray-600 terminal-text">
            Press ENTER to transmit
          </p>
        </div>
      </form>
    </div>
  );
};
