import { useState } from 'react';
import { Shield, Zap, GitBranch, Activity, Radar, AlertTriangle } from 'lucide-react';
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

  const threatLevel = stats.totalRequests > 0 ? (stats.blockedRequests / stats.totalRequests) * 100 : 0;

  return (
    <div className="main-container">
      {/* Scan Line Effect */}
      <div className="scanline" />
      
      <header className="glass-card border-0 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="glass-card p-3 glow-blue">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white terminal-text">PROMPT_FIREWALL</h1>
                <p className="text-sm text-gray-400 terminal-text">LLM_SECURITY_GATEWAY • DUAL_LLM_ARCHITECTURE</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Threat Level Gauge */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 terminal-text">THREAT_LEVEL</span>
                <div className="w-2 h-20 threat-gauge relative">
                  <div 
                    className="absolute bottom-0 w-full bg-white transition-all duration-500"
                    style={{ height: `${threatLevel}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-cyan-400 terminal-text">
                  {threatLevel.toFixed(1)}%
                </span>
              </div>
              
              {/* Dynamic Status Indicator */}
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="heartbeat">
                      <Activity className="w-5 h-5 text-emerald-green" />
                    </div>
                    <span className="text-sm font-medium status-online terminal-text">SYSTEM_ONLINE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-crimson-red" />
                    <span className="text-sm font-medium status-offline terminal-text">SYSTEM_OFFLINE</span>
                  </div>
                )}
              </div>
              
              {/* Version */}
              <div className="flex items-center gap-2 text-sm text-gray-400 terminal-text">
                <GitBranch className="w-4 h-4" />
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
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

      <footer className="glass-card border-0 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-gray-400 terminal-text">
            <span className="text-cyan-400">PROTECTED_BY</span> :: 
            <span className="text-emerald-green ml-2">PROMPT_FIREWALL</span> • 
            <a href="https://github.com/aparnaksjnv-ctrl/The-Prompt-Firewall-LLM-Security-Gateway-" 
               className="text-blue-400 hover:text-cyan-400 ml-2 transition-colors" 
               target="_blank" rel="noopener noreferrer">
              GITHUB_REPO
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
