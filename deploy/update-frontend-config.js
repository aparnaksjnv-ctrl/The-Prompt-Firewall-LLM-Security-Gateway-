// Update frontend configuration for production deployment
const fs = require('fs');
const path = require('path');

// Configuration
const EC2_PUBLIC_IP = '54.158.46.238'; // Your EC2 public IP
const S3_BUCKET_URL = 'http://prompt-firewall-frontend-aparnaksjnv.s3-website-us-east-1.amazonaws.com'; // S3 website URL

// Update useSocket.js
const useSocketPath = path.join(__dirname, '../frontend/src/hooks/useSocket.js');
let useSocketContent = fs.readFileSync(useSocketPath, 'utf8');

// Replace localhost with EC2 IP
useSocketContent = useSocketContent.replace(
  "const BACKEND_URL = 'http://localhost:3001';",
  `const BACKEND_URL = 'http://${EC2_PUBLIC_IP}:3001';`
);

fs.writeFileSync(useSocketPath, useSocketContent);
console.log('✅ Updated useSocket.js with EC2 backend URL');

// Update server.js CORS configuration
const serverPath = path.join(__dirname, '../backend/server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Update CORS to allow S3 and localhost
const corsConfig = `cors({
  origin: [
    'http://prompt-firewall-frontend-aparnaksjnv.s3-website-us-east-1.amazonaws.com',
    'http://localhost:5173',
    process.env.FRONTEND_URL || "http://localhost:5173"
  ]
})`;

serverContent = serverContent.replace(
  "cors({\n  origin: process.env.FRONTEND_URL || \"http://localhost:5173\"\n})",
  corsConfig
);

fs.writeFileSync(serverPath, serverContent);
console.log('✅ Updated server.js CORS configuration for CloudFront');

console.log('🚀 Frontend configuration updated for production deployment!');
