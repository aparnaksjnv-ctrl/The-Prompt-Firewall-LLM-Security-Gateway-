#!/bin/bash

# Backend Deployment Script - Hybrid Approach
# Deploys Node.js backend to EC2 instance

echo "🚀 Starting Backend Deployment..."

# Configuration
EC2_USER="ubuntu"
EC2_HOST="54.158.46.238"
KEY_PATH="C:/Users/aparn/Downloads/prompt-firewall-key.pem"
APP_DIR="/home/ubuntu/prompt-firewall"
NODE_VERSION="20"

# Connect to EC2 and setup
echo "🔧 Setting up EC2 instance..."
ssh -i $KEY_PATH $EC2_USER@$EC2_HOST << 'EOF'

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create app directory
mkdir -p /home/ubuntu/prompt-firewall
cd /home/ubuntu/prompt-firewall

# Install dependencies
npm init -y
npm install express cors helmet express-rate-limit socket.io winston groq-sdk rotating-file-stream dotenv

# Create swap space for memory optimization
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo echo '/swapfile none swap sw 0 0' >> /etc/fstab

EOF

# Copy backend files to EC2
echo "📤 Copying backend files..."
scp -i $KEY_PATH -r backend/* $EC2_USER@$EC2_HOST:$APP_DIR/

# Setup environment and start service
echo "🔥 Starting backend service..."
ssh -i $KEY_PATH $EC2_USER@$EC2_HOST << 'EOF'

cd /home/ubuntu/prompt-firewall

# Create .env file
cat > .env << 'ENVEOF'
PORT=3001
FRONTEND_URL=http://prompt-firewall-frontend-aparnaksjnv.s3-website-us-east-1.amazonaws.com
NODE_ENV=production
GROQ_API_KEY=your_groq_api_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
ENVEOF

# Start with PM2
pm2 start server.js --name "prompt-firewall"
pm2 save
pm2 startup

# Setup firewall
sudo ufw allow 22
sudo ufw allow 3001
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

EOF

echo "✅ Backend deployment completed!"
echo "🌐 Backend URL: http://$EC2_HOST:3001"
echo "📊 Health Check: http://$EC2_HOST:3001/api/health"
