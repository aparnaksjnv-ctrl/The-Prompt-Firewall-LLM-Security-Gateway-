import { Shield, ShieldCheck, ShieldAlert, Activity, Radar, ShieldX } from 'lucide-react';

export const StatsBar = ({ stats, isConnected }) => {
  const total = stats.totalRequests || 0;
  const blocked = stats.blockedRequests || 0;
  const allowed = stats.allowedRequests || 0;
  const protectionRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : 0;

  return (
    <div className="glass-card p-6 border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* System Status with Radar Animation */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {isConnected ? (
                <div className="radar-scan">
                  <Radar className="w-6 h-6 text-emerald-green" />
                </div>
              ) : (
                <ShieldX className="w-6 h-6 text-crimson-red" />
              )}
            </div>
            <div>
              <span className={`text-sm font-bold terminal-text ${isConnected ? 'status-online' : 'status-offline'}`}>
                {isConnected ? 'SYSTEM_ONLINE' : 'SYSTEM_OFFLINE'}
              </span>
              <div className="text-xs text-gray-400 terminal-text">
                {isConnected ? 'MONITORING_ACTIVE' : 'CONNECTION_LOST'}
              </div>
            </div>
          </div>
          
          {/* Allowed Requests */}
          <div className="flex items-center gap-3 group relative">
            <div className="glass-card p-2 glow-emerald">
              <ShieldCheck className="w-5 h-5 text-emerald-green" />
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-green terminal-text">
                {allowed.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 terminal-text">ALLOWED</div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="font-semibold text-emerald-green mb-1">Safe Prompts</div>
              <div>Total prompts sanitized and forwarded to LLM</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
            </div>
          </div>
          
          {/* Blocked Requests */}
          <div className="flex items-center gap-3 group relative">
            <div className="glass-card p-2 glow-crimson">
              <ShieldAlert className="w-5 h-5 text-crimson-red" />
            </div>
            <div>
              <div className="text-lg font-bold text-crimson-red terminal-text">
                {blocked.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 terminal-text">BLOCKED</div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="font-semibold text-crimson-red mb-1">Threats Blocked</div>
              <div>Prompts containing malicious patterns detected</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
            </div>
          </div>
          
          {/* Total Requests */}
          <div className="flex items-center gap-3 group relative">
            <div className="glass-card p-2 glow-blue">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400 terminal-text">
                {total.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 terminal-text">TOTAL_REQUESTS</div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="font-semibold text-blue-400 mb-1">Total Processed</div>
              <div>Total prompts analyzed by the firewall</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
            </div>
          </div>
        </div>
        
        {/* Protection Rate with Dynamic Color */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-2xl font-bold terminal-text ${
              parseFloat(protectionRate) > 20 ? 'text-crimson-red' :
              parseFloat(protectionRate) > 10 ? 'text-amber-warning' :
              'text-emerald-green'
            }`}>
              {protectionRate}%
            </div>
            <div className="text-xs text-gray-400 terminal-text">THREATS_BLOCKED</div>
          </div>
          <div className="w-3 h-16 threat-gauge relative">
            <div 
              className="absolute bottom-0 w-full bg-white transition-all duration-700"
              style={{ height: `${Math.min(parseFloat(protectionRate), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
