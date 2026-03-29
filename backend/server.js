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
import { evaluateThreat } from './services/evaluator.js';
import { getResponse } from './services/responder.js';

dotenv.config();

const USE_MOCK_MODE = !process.env.GROQ_API_KEY;

if (USE_MOCK_MODE) {
  console.log('⚠️  Running in MOCK MODE - No GROQ_API_KEY found');
  console.log('   Add GROQ_API_KEY to .env file to enable real LLM integration');
}

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

let stats = {
  totalRequests: 0,
  blockedRequests: 0,
  allowedRequests: 0
};

const securityEvents = [];

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

// Legacy mock threat detection (fallback mode)
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

function evaluateThreatMock(input) {
  const normalizedInput = input.toLowerCase();
  
  for (const pattern of threatPatterns) {
    if (pattern.test(normalizedInput)) {
      const match = input.match(pattern);
      return {
        threat: true,
        reason: `Detected pattern: "${match[0]}"`,
        severity: 'high',
        confidence: 0.9,
        attack_type: 'prompt_injection',
        pattern: pattern.toString(),
        mock: true
      };
    }
  }
  
  if (normalizedInput.length > 2000) {
    return {
      threat: true,
      reason: 'Input exceeds maximum allowed length',
      severity: 'medium',
      confidence: 1.0,
      attack_type: 'length_check',
      mock: true
    };
  }
  
  return {
    threat: false,
    reason: 'No threats detected',
    severity: 'none',
    confidence: 1.0,
    attack_type: 'none',
    mock: true
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
  const { message, session_id, conversation_history } = req.body;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[Server] Received chat request: ${requestId}`);
  console.log(`[Server] Message: "${message?.substring(0, 50)}..."`);
  
  try {
    stats.totalRequests++;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
        request_id: requestId
      });
    }
    
    console.log(`[Server] Starting evaluation for: ${requestId}`);
    
    // Phase 2: Use real LLM evaluator
    let evaluation;
    try {
      if (USE_MOCK_MODE) {
        console.log('[Server] Using mock evaluator');
        evaluation = evaluateThreatMock(message);
      } else {
        console.log('[Server] Calling LLM evaluator...');
        evaluation = await evaluateThreat(message);
        console.log('[Server] Evaluator result:', evaluation);
      }
    } catch (evalError) {
      console.error('[Server] Evaluation error:', evalError.message);
      evaluation = {
        threat: true,
        reason: 'Evaluation system error - blocking for safety',
        severity: 'high',
        confidence: 1.0,
        attack_type: 'system_error',
        fallback: true
      };
    }
  
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
      threat_classification: evaluation.attack_type || 'prompt_injection',
      confidence: evaluation.confidence,
      evaluator_reason: evaluation.reason,
      action_taken: 'blocked',
      mock_mode: USE_MOCK_MODE || evaluation.mock || false
    });
    
    io.emit('stats_update', stats);
    
    return res.status(403).json({
      success: false,
      error: 'Potential security threat detected',
      threat: true,
      reason: evaluation.reason,
      severity: evaluation.severity,
      confidence: evaluation.confidence,
      attack_type: evaluation.attack_type,
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
    confidence: evaluation.confidence,
    action_taken: 'forwarded_to_responder'
  });
  
  // Phase 2: Get response from Responder LLM (or mock)
  let aiResponse;
  try {
    if (USE_MOCK_MODE) {
      // Mock response for testing
      const mockResponses = [
        "I understand your request. Here's what I can help you with...",
        "That's an interesting question. Let me think about it...",
        "I can certainly assist with that. Here's my response...",
        "Thanks for reaching out. Here's what I found...",
        "I'd be happy to help. Here's my take on that..."
      ];
      aiResponse = {
        success: true,
        response: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        mock: true
      };
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      // Real LLM response
      aiResponse = await getResponse(message, conversation_history || []);
    }
  } catch (error) {
    console.error('Responder error:', error);
    aiResponse = {
      success: false,
      response: 'I apologize, but I encountered an error generating a response. Please try again.',
      error: error.message
    };
  }
  
  io.emit('stats_update', stats);
  
  res.json({
    success: true,
    response: aiResponse.response,
    evaluated: true,
    threat: false,
    confidence: evaluation.confidence,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    mock_mode: aiResponse.mock || false
  });
  } catch (error) {
    console.error('[Server] Unhandled error in chat endpoint:', error.message);
    console.error('[Server] Error stack:', error.stack);
    
    // Write error to file for debugging
    const fs = await import('fs');
    const errorLog = `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\n\n`;
    fs.appendFileSync('error.log', errorLog);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message,
      request_id: requestId
    });
  }
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
  console.log(`🤖 Mode: ${USE_MOCK_MODE ? 'MOCK (add GROQ_API_KEY for real LLM)' : 'LIVE (Dual-LLM Architecture)'}`);
});
