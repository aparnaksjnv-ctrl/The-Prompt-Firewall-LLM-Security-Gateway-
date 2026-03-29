import { createStream } from 'rotating-file-stream';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '..', 'logs');
const MAX_SIZE = '10M';
const MAX_FILES = 30;

// Store last log hash for tamper-evident chain
let lastLogHash = null;

// Create rotating log stream
const auditStream = createStream('security_audit.json', {
  path: LOG_DIR,
  size: MAX_SIZE,
  maxFiles: MAX_FILES,
  compress: 'gzip',
  interval: '1d',
  immutable: true
});

/**
 * Generate SHA-256 hash of log entry
 */
function generateHash(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Create tamper-evident audit log entry
 */
export function createForensicLog(eventData) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event_id: `evt_${Date.now()}_${crypto.randomUUID()}`,
    ...eventData,
    chain_hash: lastLogHash,
    _forensic: {
      version: '1.0',
      integrity: null,
      environment: process.env.NODE_ENV || 'development'
    }
  };
  
  // Calculate integrity hash including chain reference
  logEntry._forensic.integrity = generateHash({
    ...logEntry,
    _forensic: undefined
  });
  
  // Update chain for next entry
  lastLogHash = logEntry._forensic.integrity;
  
  return logEntry;
}

/**
 * Write audit log entry
 */
export function writeAuditLog(logEntry) {
  const line = JSON.stringify(logEntry) + '\n';
  auditStream.write(line);
}

/**
 * Get current chain hash (for verification)
 */
export function getChainHash() {
  return lastLogHash;
}

/**
 * Verify log entry integrity
 */
export function verifyLogIntegrity(logEntry) {
  const originalHash = logEntry._forensic?.integrity;
  if (!originalHash) return false;
  
  const calculatedHash = generateHash({
    ...logEntry,
    _forensic: undefined
  });
  
  return originalHash === calculatedHash;
}

export default {
  createForensicLog,
  writeAuditLog,
  getChainHash,
  verifyLogIntegrity
};
