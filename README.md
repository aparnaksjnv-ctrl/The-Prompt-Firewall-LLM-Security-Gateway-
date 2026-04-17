# 🛡️ The Prompt Firewall

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/aparnaksjnv-ctrl/The-Prompt-Firewall-LLM-Security-Gateway-)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2-blue.svg)](https://reactjs.org/)
[![Groq](https://img.shields.io/badge/Groq-LLM-purple.svg)](https://groq.com/)

> A **dual-LLM reverse proxy** and SOC (Security Operations Center) dashboard designed to actively detect, log, and mitigate prompt injection and jailbreak attacks against LLM-powered applications in real-time.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Demo](#demo)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Security Features](#security-features)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## 🎯 Overview

Large Language Models (LLMs) are vulnerable to adversarial inputs that can bypass safety guidelines, extract sensitive system prompts, or manipulate the model into generating harmful content. **The Prompt Firewall** acts as an intelligent security gateway between users and AI systems.

### How It Works

1. **User Input** → Sent to **Evaluator LLM** (security classifier)
2. **Threat Detected?** → Blocked, logged to SOC dashboard
3. **Safe Input** → Forwarded to **Responder LLM** (primary AI)
4. **AI Response** → Returned to user

All security events are logged with **tamper-evident forensic logging** for compliance and analysis.

---

## 🏗️ Architecture

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐     Threat?      ┌─────────────────┐
│   EVALUATOR LLM         │ ────────────────▶│  Block & Alert  │
│   (Llama-3.1-8B)        │                  │  SOC Dashboard  │
│   Security Classifier   │                  │  Audit Logs     │
└────────┬────────────────┘     Safe          └─────────────────┘
         │
         │ Safe Input
         ▼
┌─────────────────────────┐
│   RESPONDER LLM         │
│   (Llama-3.3-70B)       │
│   Primary AI Assistant  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│  User Response  │
└─────────────────┘
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PROMPT FIREWALL                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)        Backend (Node.js + Express) │
│  ┌──────────────────────┐       ┌──────────────────────┐      │
│  │ • SOC Dashboard      │       │ • Threat Evaluation  │      │
│  │ • Real-time Events   │◄─────▶│ • Dual-LLM Proxy     │      │
│  │ • Chat Interface     │  WS   │ • Forensic Logging   │      │
│  └──────────────────────┘       └──────────────────────┘      │
│                                          │                    │
│                                          ▼                    │
│                              ┌──────────────────────┐         │
│                              │ Groq API             │         │
│                              │ • Evaluator LLM      │         │
│                              │ • Responder LLM      │         │
│                              └──────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🔒 Security
- **Dual-LLM Architecture**: Dedicated security classifier + primary AI
- **Real-time Threat Detection**: Prompt injection, jailbreak attempts, system overrides
- **Forensic Audit Logging**: Tamper-evident SHA-256 hashed logs with chain verification
- **SIEM Integration**: Export logs in JSON/CSV format for Splunk, ELK, etc.
- **Input Validation**: Max 4000 character limit with rejection logging
- **Rate Limiting**: Express-rate-limit prevents DoS attacks
- **Security Headers**: Helmet.js protection

### 📊 Monitoring
- **SOC Dashboard**: Real-time security event stream
- **Threat Severity**: Color-coded alerts (🔴 High / 🟡 Medium / 🟢 Low)
- **Live Statistics**: Blocked/Allowed counts, protection rate
- **WebSocket Updates**: Instant alert notifications

### 🔧 Production Ready
- **Log Rotation**: Daily rotation, 30-day retention, gzip compression
- **Error Handling**: Graceful degradation with mock mode fallback
- **Environment Configuration**: Secure API key management
- **Health Checks**: `/api/health` endpoint for monitoring

---

## 🎬 Demo

![SOC Dashboard Demo](docs/demo.gif)

*Real-time threat detection and blocking demonstration*

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Groq API Key ([Get one free](https://console.groq.com))

### 1. Clone & Install
```bash
git clone https://github.com/aparnaksjnv-ctrl/The-Prompt-Firewall-LLM-Security-Gateway-.git
cd The-Prompt-Firewall-LLM-Security-Gateway-

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 3. Start Services
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 📦 Installation

### Backend Dependencies
```bash
cd backend
npm install express cors helmet express-rate-limit socket.io winston groq-sdk rotating-file-stream dotenv
```

### Frontend Dependencies
```bash
cd frontend
npm install react react-dom socket.io-client lucide-react
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer
```

---

## ⚙️ Configuration

### Environment Variables

Create `backend/.env`:

```env
# Required: Groq API Key for LLM integration
GROQ_API_KEY=your_groq_api_key_here

# Optional: Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=production

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Groq API Key
Get a free API key at [console.groq.com](https://console.groq.com)

---

## 📚 API Documentation

### Endpoints

#### POST `/api/chat`
Process a chat message through the security firewall.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "session_id": "user-session-123",
  "conversation_history": []
}
```

**Response (Safe):**
```json
{
  "success": true,
  "response": "I'm doing well, thank you! How can I help you today?",
  "evaluated": true,
  "threat": false,
  "confidence": 1,
  "request_id": "req_1234567890_abc123",
  "timestamp": "2026-03-29T12:00:00.000Z",
  "mock_mode": false
}
```

**Response (Threat Detected):**
```json
{
  "success": false,
  "error": "Potential security threat detected",
  "threat": true,
  "reason": "Prompt injection attempt detected",
  "severity": "high",
  "confidence": 0.95,
  "attack_type": "prompt_injection",
  "request_id": "req_1234567890_def456",
  "timestamp": "2026-03-29T12:00:00.000Z"
}
```

#### GET `/api/logs`
Query security event logs with filtering.

**Parameters:**
- `limit` (number): Maximum events to return (default: 50)
- `severity` (string): Filter by severity (info, low, medium, high, critical)
- `start_time` (ISO date): Filter events after this time
- `end_time` (ISO date): Filter events before this time

#### GET `/api/logs/siem`
Export logs in SIEM-compatible format.

**Parameters:**
- `limit` (number): Maximum events (default: 1000)
- `format` (string): `json` or `csv` (default: json)

#### GET `/api/stats`
Get current firewall statistics.

**Response:**
```json
{
  "totalRequests": 1000,
  "blockedRequests": 45,
  "allowedRequests": 955,
  "protection_rate": "4.50",
  "timestamp": "2026-03-29T12:00:00.000Z"
}
```

#### GET `/api/health`
Health check endpoint for monitoring.

---

## 🌐 Deployment

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### AWS Deployment Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Route 53  │────▶│ CloudFront  │────▶│  S3 Bucket  │
│   (DNS)     │     │   (CDN)     │     │  (Frontend) │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   API GW    │────▶│   EC2/      │────▶│  CloudWatch │
│             │     │   Lambda    │     │   (Logs)    │
└─────────────┘     └─────────────┘     └─────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Groq API          │
                    │   (LLM Provider)    │
                    └─────────────────────┘
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure `FRONTEND_URL` to your domain
3. Set up log aggregation (CloudWatch, DataDog, etc.)
4. Enable HTTPS with valid SSL certificates

---

## 🔐 Security Features

### Threat Detection
The Evaluator LLM detects:
- **Prompt Injection**: "Ignore previous instructions..."
- **Jailbreak Attempts**: "DAN mode", "Developer mode"
- **System Override**: "You are now...", "System prompt:"
- **Role Play Attacks**: "Pretend you are..."
- **Delimiter Attacks**: Special character bypasses

### Forensic Logging
- **Immutable logs**: SHA-256 chain hashing prevents tampering
- **Integrity verification**: Each entry includes cryptographic proof
- **Audit trail**: Complete request lifecycle tracking
- **Compliance ready**: Supports SOC2, ISO 27001 requirements

### Input Sanitization
- Maximum 4000 character limit
- UTF-8 encoding validation
- HTML/script injection prevention
- Rate limiting (100 req/15min per IP)

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Socket.io-client** - Real-time updates
- **Lucide React** - Icons

### Backend
- **Node.js 20** - Runtime
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **Groq SDK** - LLM API client
- **Winston** - Logging
- **Rotating-file-stream** - Log rotation
- **Helmet** - Security headers
- **Express-rate-limit** - Rate limiting

### LLM Models
- **Evaluator**: Llama-3.1-8B-Instruct (via Groq)
- **Responder**: Llama-3.3-70B-Versatile (via Groq)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🗺️ Roadmap

### Version 1.1 (Q2 2026)
- [ ] Custom rule engine for threat patterns
- [ ] Multi-language support
- [ ] User authentication and sessions
- [ ] Export logs to CSV/JSON

### Version 1.2 (Q3 2026)
- [ ] Machine learning-based threat detection
- [ ] Integration with external SIEMs (Splunk, ELK)
- [ ] Webhook notifications (Slack, Teams)
- [ ] Admin panel for configuration

### Version 2.0 (Q4 2026)
- [ ] Enterprise features (RBAC, audit trails)
- [ ] Multi-tenant architecture
- [ ] Plugin system for custom evaluators
- [ ] Open-source release

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Aparna KSNV**
- GitHub: [@aparnaksjnv-ctrl](https://github.com/aparnaksjnv-ctrl)
- LinkedIn: [Your LinkedIn](www.linkedin.com/in/aparna-kallayil-sajeev-)

---

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for providing fast LLM inference
- [Meta](https://ai.meta.com/) for Llama models
- [React](https://reactjs.org/) and [Express](https://expressjs.com/) communities

---

<p align="center">
  Made with ❤️ for AI security
</p>
