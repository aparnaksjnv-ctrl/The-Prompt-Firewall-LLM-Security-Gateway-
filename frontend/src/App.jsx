import { useState } from 'react';
import { Shield, Zap, GitBranch } from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import { SecurityLog } from './components/SecurityLog';
import { ChatInterface } from './components/ChatInterface';
import { StatsBar } from './components/StatsBar';

function App() {
  const { isConnected, securityEvents, stats, sendMessage } = useSocket();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message) => {
    setIsLoading(true);
    const response = await sendMessage(message);
    setIsLoading(false);
    return response;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prompt Firewall</h1>
                <p className="text-sm text-gray-500">LLM Security Gateway • Dual-LLM Architecture</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GitBranch className="w-4 h-4" />
                <span>v1.0.0</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <Zap className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
                {isConnected ? 'Live' : 'Offline'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <StatsBar stats={stats} isConnected={isConnected} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-1">
            <SecurityLog events={securityEvents} />
          </div>
          <div className="lg:col-span-2">
            <ChatInterface 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
        <p>
          Protected by The Prompt Firewall • 
          <a href="https://github.com/aparnaksjnv-ctrl/The-Prompt-Firewall-LLM-Security-Gateway-" 
             className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
