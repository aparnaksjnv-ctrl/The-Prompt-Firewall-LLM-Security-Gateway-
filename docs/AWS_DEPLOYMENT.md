# AWS Free Tier Deployment Guide

## Overview
Deploy The Prompt Firewall on AWS Free Tier (750 hours/month free for 12 months)

## Architecture (Free Tier)
```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐      ┌──────────────────────┐    │
│  │   EC2 (t2.micro)    │      │   S3 Bucket          │    │
│  │   - Ubuntu 22.04    │──────│   - Static Website   │    │
│  │   - Node.js Backend │      │   - Frontend Hosting │    │
│  │   - Port 3001       │      │                      │    │
│  │   - SSH Port 22     │      │                      │    │
│  └─────────────────────┘      └──────────────────────┘    │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────┐                                    │
│  │   Security Group    │                                    │
│  │   - HTTP (80)       │                                    │
│  │   - HTTPS (443)     │                                    │
│  │   - Custom (3001)   │                                    │
│  │   - SSH (22)        │                                    │
│  └─────────────────────┘                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Launch EC2 Instance

### 1.1 Create AWS Account
1. Go to https://aws.amazon.com/free/
2. Sign up for Free Tier (requires credit card, but won't charge if within limits)
3. Complete identity verification

### 1.2 Launch EC2 Instance
1. Go to **EC2 Dashboard** → **Launch Instance**
2. **Name**: `prompt-firewall-server`
3. **AMI**: Ubuntu Server 22.04 LTS (Free Tier eligible)
4. **Instance Type**: `t2.micro` (Free Tier: 750 hrs/month)
5. **Key Pair**: 
   - Click **Create new key pair**
   - Name: `prompt-firewall-key`
   - Type: RSA
   - Format: `.pem` (Mac/Linux) or `.ppk` (Windows)
   - **Download and SAVE this file securely!**

6. **Network Settings**:
   - VPC: Default
   - Subnet: Any availability zone
   - Auto-assign public IP: **Enable**

7. **Security Group** (Firewall Rules):
   ```
   Type          Protocol    Port Range    Source
   ────────────────────────────────────────────────
   SSH           TCP         22            My IP (your computer)
   HTTP          TCP         80            0.0.0.0/0
   HTTPS         TCP         443           0.0.0.0/0
   Custom TCP    TCP         3001          0.0.0.0/0 (Backend API)
   ```

8. **Storage**: 20 GB (Free Tier limit)
9. Click **Launch Instance**

---

## Step 2: Connect to EC2 via SSH

### Windows (PowerShell / Terminal)
```powershell
# Navigate to where you saved the .pem file
cd C:\Users\YourUsername\Downloads

# Set correct permissions (required)
icacls prompt-firewall-key.pem /inheritance:r
icacls prompt-firewall-key.pem /grant:r "%username%:R"

# Connect via SSH
ssh -i prompt-firewall-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Mac/Linux (Terminal)
```bash
# Navigate to key location
cd ~/Downloads

# Set correct permissions
chmod 400 prompt-firewall-key.pem

# Connect via SSH
ssh -i prompt-firewall-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Find Your EC2 Public IP
1. Go to **EC2 Dashboard** → **Instances**
2. Select your instance
3. Copy **Public IPv4 address** (e.g., `3.85.123.45`)

---

## Step 3: Deploy Application on EC2

Once connected via SSH, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install Git
sudo apt install git -y

# Clone repository
git clone https://github.com/aparnaksjnv-ctrl/The-Prompt-Firewall-LLM-Security-Gateway-.git
cd The-Prompt-Firewall-LLM-Security-Gateway-/backend

# Install dependencies
npm install

# Create environment file
nano .env
```

### Edit .env file:
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP:3001
GROQ_API_KEY=your_actual_groq_api_key_here
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Start the application
npm start
```

---

## Step 4: Keep Application Running (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start with PM2
pm2 start server.js --name "prompt-firewall"

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup
# Copy and run the command shown

# Check status
pm2 status
pm2 logs prompt-firewall
```

---

## Step 5: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/prompt-firewall
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/prompt-firewall /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 6: Access Your Application

- **API**: http://YOUR_EC2_PUBLIC_IP/api/health
- **Frontend**: (Deploy to S3 - see below)

---

## Optional: Deploy Frontend to S3

1. **Create S3 Bucket**:
   - Name: `prompt-firewall-frontend`
   - Uncheck "Block all public access"
   - Enable static website hosting

2. **Build Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Upload to S3**:
   - Upload `dist/` folder contents to S3
   - Set bucket policy for public read

4. **Update CORS** in backend `.env`:
   ```env
   FRONTEND_URL=http://prompt-firewall-frontend.s3-website-us-east-1.amazonaws.com
   ```

---

## Useful Commands

```bash
# Check application logs
pm2 logs prompt-firewall

# Restart application
pm2 restart prompt-firewall

# Monitor resources
pm2 monit

# Check disk space
df -h

# Check memory
free -h

# Update application
cd ~/The-Prompt-Firewall-LLM-Security-Gateway-
git pull
pm2 restart prompt-firewall
```

---

## Free Tier Limits (Don't exceed!)

| Service | Free Tier Limit |
|---------|----------------|
| EC2 t2.micro | 750 hours/month |
| S3 | 5 GB storage |
| Data Transfer | 15 GB out/month |
| EBS | 30 GB storage |

---

## Troubleshooting

### Can't connect via SSH?
- Verify Security Group has port 22 open to your IP
- Check key file permissions (400 on Mac/Linux)
- Ensure using correct username: `ubuntu`

### Application won't start?
- Check logs: `pm2 logs`
- Verify `.env` file exists with GROQ_API_KEY
- Check port 3001 not in use: `sudo lsof -i :3001`

### 502 Bad Gateway?
- Verify backend running: `pm2 status`
- Check Nginx config: `sudo nginx -t`
- Check firewall: `sudo ufw status`

---

## Next Steps

1. **Set up Domain**: Use Route 53 or Cloudflare
2. **Enable HTTPS**: Use Certbot (Let's Encrypt)
3. **Monitoring**: CloudWatch or external service
4. **Backups**: Create EBS snapshots

---

**Your Prompt Firewall is now live on AWS! 🎉**
