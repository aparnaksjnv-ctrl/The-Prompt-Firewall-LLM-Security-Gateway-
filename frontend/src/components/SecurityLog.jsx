import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const SecurityLogItem = ({ event }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`p-3 mb-2 rounded-lg border ${getSeverityColor(event.severity)}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(event.severity)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm capitalize">
              {event.event_type?.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(event.timestamp)}
            </span>
          </div>
          {event.user_input_preview && (
            <p className="text-sm text-gray-700 mt-1 truncate">
              "{event.user_input_preview}"
            </p>
          )}
          {event.evaluator_reason && (
            <p className="text-xs text-gray-500 mt-1">
              {event.evaluator_reason}
            </p>
          )}
          {event.matched_pattern && (
            <p className="text-xs text-red-600 mt-1">
              Pattern: {event.matched_pattern.substring(0, 50)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const SecurityLog = ({ events }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">Security Events</h2>
        <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
          {events.length}
        </span>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-300px)] space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-green-400" />
            <p>No security events yet</p>
            <p className="text-sm">System is monitoring...</p>
          </div>
        ) : (
          events.map((event, index) => (
            <SecurityLogItem key={event.event_id || index} event={event} />
          ))
        )}
      </div>
    </div>
  );
};
