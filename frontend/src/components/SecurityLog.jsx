import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Bug, Lock, EyeOff, UserX, Terminal } from 'lucide-react';

const SecurityLogItem = ({ event }) => {
  const getThreatIcon = (threatType, severity) => {
    // Threat type specific icons
    switch (threatType) {
      case 'prompt_injection':
        return <Terminal className="w-5 h-5 text-crimson-red" />;
      case 'jailbreak':
        return <Bug className="w-5 h-5 text-crimson-red" />;
      case 'system_override':
        return <Lock className="w-5 h-5 text-crimson-red" />;
      case 'delimiter_attack':
        return <EyeOff className="w-5 h-5 text-amber-warning" />;
      case 'role_play':
        return <UserX className="w-5 h-5 text-amber-warning" />;
      default:
        return getSeverityIcon(severity);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <ShieldAlert className="w-5 h-5 text-crimson-red" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-amber-warning" />;
      case 'info':
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-green" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'console-error threat-flash';
      case 'medium':
        return 'console-user';
      case 'info':
      default:
        return 'console-system';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getLogLevel = (event) => {
    if (event.event_type === 'threat_detected') return 'CRITICAL';
    if (event.event_type === 'scan_completed') return 'INFO';
    if (event.event_type === 'connection_established') return 'INFO';
    if (event.event_type === 'message_processed') return 'INFO';
    return 'DEBUG';
  };

  const getEventDescription = (event) => {
    switch (event.event_type) {
      case 'threat_detected':
        return `THREAT_BLOCKED: ${event.threat_classification?.toUpperCase() || 'UNKNOWN'} - ${event.evaluator_reason || 'Suspicious pattern detected'}`;
      case 'scan_completed':
        return `SCANNING: Analyzing prompt for injection patterns...`;
      case 'connection_established':
        return `CONNECTION: New client session established`;
      case 'message_processed':
        return `PROCESSED: Prompt sanitized and forwarded to LLM`;
      default:
        return `MONITORING: Security checkpoint passed`;
    }
  };

  const shouldFlash = event.event_type === 'threat_detected' && 
                      (Date.now() - new Date(event.timestamp).getTime()) < 3000;

  return (
    <div className={`p-4 mb-3 rounded-lg border terminal-text ${getSeverityColor(event.severity)} ${
      shouldFlash ? 'threat-flash' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getThreatIcon(event.threat_classification, event.severity)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <span className="text-sm font-mono text-gray-300">
              [{formatTime(event.timestamp)}] [{getLogLevel(event)}] [{event.event_type?.replace(/_/g, '_').toUpperCase()}] - {getEventDescription(event)}
            </span>
          </div>
          
          {event.user_input_preview && (
            <div className="mb-2">
              <span className="text-xs text-gray-500">INPUT:</span>
              <p className="text-sm text-gray-300 mt-1 font-mono bg-black/30 p-2 rounded border-l-2 border-cyan-400">
                &gt; {event.user_input_preview}
              </p>
            </div>
          )}
          
          {event.evaluator_reason && (
            <div className="mb-2">
              <span className="text-xs text-gray-500">ANALYSIS:</span>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                {event.evaluator_reason}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {event.confidence && (
              <span className="px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                CONF: {(event.confidence * 100).toFixed(0)}%
              </span>
            )}
            {event.session_id && (
              <span>SESSION: {event.session_id.substring(0, 8)}...</span>
            )}
            {event.request_id && (
              <span>REQ: {event.request_id.substring(0, 8)}...</span>
            )}
            {event.source_ip && (
              <span>SRC: {event.source_ip}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SecurityLog = ({ events }) => {
  return (
    <div className="glass-card h-full border-0">
      <div className="flex items-center gap-3 mb-6 p-4 border-b border-gray-800">
        <div className="glass-card p-2 glow-blue">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white terminal-text">SECURITY_EVENTS</h2>
          <p className="text-xs text-gray-400 terminal-text">REAL_TIME_MONITORING</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-green rounded-full animate-pulse"></div>
          <span className="bg-gray-800 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full terminal-text border border-cyan-400/30">
            COUNT: {events.length}
          </span>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-350px)] p-4 space-y-0">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500 relative">
            {/* Shield Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <Shield className="w-64 h-64 text-emerald-green" />
            </div>
            
            {/* Foreground Content */}
            <div className="relative z-10">
              <div className="relative mb-4">
                <ShieldCheck className="w-16 h-16 mx-auto text-emerald-green" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-emerald-green/20 rounded-full animate-ping"></div>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-300 terminal-text mb-2">NO_EVENTS_DETECTED</p>
              <p className="text-sm text-gray-500 terminal-text">System monitoring active...</p>
            </div>
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
