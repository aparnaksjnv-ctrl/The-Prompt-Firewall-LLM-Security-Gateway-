import { Shield, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

export const StatsBar = ({ stats, isConnected }) => {
  const total = stats.totalRequests || 0;
  const blocked = stats.blockedRequests || 0;
  const allowed = stats.allowedRequests || 0;
  const protectionRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'System Online' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span className="text-sm">
              <strong>{allowed.toLocaleString()}</strong> Allowed
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span className="text-sm">
              <strong>{blocked.toLocaleString()}</strong> Blocked
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm">
              <strong>{total.toLocaleString()}</strong> Total
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-full">
          <span className="text-sm font-bold">{protectionRate}%</span>
          <span className="text-xs">Threats Blocked</span>
        </div>
      </div>
    </div>
  );
};
