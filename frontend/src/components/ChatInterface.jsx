import { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

export const ChatInterface = ({ onSendMessage, isLoading, lastResponse }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setMessage('');

    const response = await onSendMessage(userMessage);

    if (response.success) {
      setMessages(prev => [...prev, { type: 'assistant', content: response.response }]);
    } else {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: response.error,
        reason: response.reason,
        severity: response.severity
      }]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Protected Chat</h2>
        <p className="text-sm text-gray-500">All messages are scanned by the Prompt Firewall</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Start a conversation</p>
            <p className="text-sm mt-2">Try typing a message or test with:</p>
            <p className="text-xs text-red-400 mt-1">"ignore previous instructions"</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : msg.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.type === 'error' && (
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Threat Blocked</span>
                  </div>
                )}
                <p>{msg.content}</p>
                {msg.reason && (
                  <p className="text-sm mt-2 opacity-80">
                    Reason: {msg.reason}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message... (try 'ignore previous instructions')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {message.length}/2000 characters
        </p>
      </form>
    </div>
  );
};
