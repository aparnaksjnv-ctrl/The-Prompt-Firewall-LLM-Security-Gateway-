import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'security_audit.log' })
  ]
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

const threatPatterns = [
  /ignore\s+previous\s+instructions/gi,
  /ignore\s+the\s+above/gi,
  /pretend\s+you\s+are/gi,
  /roleplay\s+as/gi,
  /system\s+override/gi,
  /jailbreak/gi,
  /DAN\s+mode/gi,
  /developer\s+mode/gi,
  /ignore\s+your\s+programming/gi,
  /bypass\s+restrictions/gi,
  /disregard\s+safety/gi,
  /act\s+as\s+if\s+you/gi,
  /new\s+instructions:/gi,
  /system\s+prompt:/gi,
  /you\s+are\s+now/gi
];

let stats = {
  totalRequests: 0,
  blockedRequests: 0,
  allowedRequests: 0
};

const securityEvents = [];

function evaluateThreat(input) {
  const normalizedInput = input.toLowerCase();
  
  for (const pattern of threatPatterns) {
    if (pattern.test(normalizedInput)) {
      const match = input.match(pattern);
      return {
        threat: true,
        reason: `Detected pattern: "${match[0]}"`,
        severity: 'high',
        pattern: pattern.toString()
      };
    }
  }
  
  if (normalizedInput.length > 2000) {
    return {
      threat: true,
      reason: 'Input exceeds maximum allowed length',
      severity: 'medium',
      pattern: 'length_check'
    };
  }
  
  return {
    threat: false,
    reason: 'No threats detected',
    severity: 'none'
  };
}

function logSecurityEvent(event) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event_id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...event
  };
  
  securityEvents.unshift(logEntry);
  if (securityEvents.length > 1000) {
    securityEvents.pop();
  }
  
  logger.info('Security Event', logEntry);
  io.emit('security_event', logEntry);
}

app.post('/api/chat', async (req, res) => {
  const { message, session_id } = req.body;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  stats.totalRequests++;
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Message is required',
      request_id: requestId
    });
  }
  
  const evaluation = evaluateThreat(message);
  
  if (evaluation.threat) {
    stats.blockedRequests++;
    
    logSecurityEvent({
      event_type: 'threat_detected',
      severity: evaluation.severity,
      source_ip: req.ip || req.socket.remoteAddress,
      session_id: session_id || 'anonymous',
      request_id: requestId,
      user_input: message,
      user_input_preview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      threat_classification: 'prompt_injection',
      matched_pattern: evaluation.pattern,
      evaluator_reason: evaluation.reason,
      action_taken: 'blocked'
    });
    
    io.emit('stats_update', stats);
    
    return res.status(403).json({
      success: false,
      error: 'Potential security threat detected',
      threat: true,
      reason: evaluation.reason,
      severity: evaluation.severity,
      request_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  stats.allowedRequests++;
  
  logSecurityEvent({
    event_type: 'request_allowed',
    severity: 'info',
    source_ip: req.ip || req.socket.remoteAddress,
    session_id: session_id || 'anonymous',
    request_id: requestId,
    user_input_preview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
    threat_classification: 'none',
    action_taken: 'forwarded_to_responder'
  });
  
  const mockResponses = [
    "I understand your request. Here's what I can help you with...",
    "That's an interesting question. Let me think about it...",
    "I can certainly assist with that. Here's my response...",
    "Thanks for reaching out. Here's what I found...",
    "I'd be happy to help. Here's my take on that..."
  ];
  
  const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  io.emit('stats_update', stats);
  
  res.json({
    success: true,
    response: mockResponse,
    evaluated: true,
    threat: false,
    request_id: requestId,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/logs', (req, res) => {
  const { limit = 50, severity, start_time, end_time } = req.query;
  
  let filteredEvents = [...securityEvents];
  
  if (severity) {
    filteredEvents = filteredEvents.filter(e => e.severity === severity);
  }
  
  if (start_time) {
    filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= new Date(start_time));
  }
  
  if (end_time) {
    filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) <= new Date(end_time));
  }
  
  res.json({
    logs: filteredEvents.slice(0, parseInt(limit)),
    total: filteredEvents.length,
    page: 1
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    ...stats,
    protection_rate: stats.totalRequests > 0 
      ? ((stats.blockedRequests / stats.totalRequests) * 100).toFixed(2)
      : 0,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.emit('stats_update', stats);
  socket.emit('initial_events', securityEvents.slice(0, 20));
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🛡️  Prompt Firewall Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Security logs: ./security_audit.log`);
});
