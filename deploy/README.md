# 🚀 Hybrid Deployment Guide - AWS Free Tier

## 📋 Overview
This guide deploys the Prompt Firewall using a hybrid approach:
- **Frontend**: S3 + CloudFront (static hosting)
- **Backend**: EC2 t2.micro (Node.js server)
- **Cost**: $0/month within AWS Free Tier limits

## 🏗️ Architecture
```
User → CloudFront → S3 (Frontend) → EC2 (Backend API/WebSocket)
```

## 📦 Prerequisites
1. AWS Account with Free Tier
2. AWS CLI installed and configured
3. Your existing EC2 instance access
4. Domain name (optional)

## 🛠️ Step 1: Setup AWS Resources

### 1.1 Create S3 Bucket
```bash
aws s3 mb s3://prompt-firewall-frontend --region us-east-1
```

### 1.2 Create CloudFront Distribution
1. Go to AWS Console → CloudFront
2. Create Distribution → Origin: S3 bucket
3. Allow public access
4. Note the Distribution ID

### 1.3 Setup EC2 Security Group
Add these inbound rules to your EC2 security group:
- HTTP (80) from 0.0.0.0/0
- HTTPS (443) from 0.0.0.0/0
- Custom TCP (3001) from 0.0.0.0/0

## 🔧 Step 2: Configure Application

### 2.1 Update Configuration
```bash
node deploy/update-frontend-config.js
```

Edit the generated files and replace:
- `YOUR_EC2_PUBLIC_IP` with your EC2 public IP
- `YOUR_CLOUDFRONT_DOMAIN` with your CloudFront domain

### 2.2 Add Environment Variables
Create `backend/.env`:
```env
PORT=3001
FRONTEND_URL=https://your-cloudfront-domain.cloudfront.net
NODE_ENV=production
GROQ_API_KEY=your_groq_api_key_here
```

## 🚀 Step 3: Deploy Backend

### 3.1 Run Backend Deployment
```bash
chmod +x deploy/backend-deploy.sh
./deploy/backend-deploy.sh
```

### 3.2 Verify Backend
```bash
curl http://your-ec2-public-ip:3001/api/health
```

## 📤 Step 4: Deploy Frontend

### 4.1 Update Deployment Script
Edit `deploy/frontend-deploy.sh` and replace:
- `YOUR_CLOUDFRONT_DISTRIBUTION_ID` with your distribution ID

### 4.2 Run Frontend Deployment
```bash
chmod +x deploy/frontend-deploy.sh
./deploy/frontend-deploy.sh
```

## ✅ Step 5: Verify Deployment

### 5.1 Test Frontend
Visit your CloudFront URL and verify:
- UI loads correctly
- WebSocket connection established
- Security events appear in real-time

### 5.2 Test Backend
```bash
curl http://your-ec2-public-ip:3001/api/stats
```

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check server.js CORS configuration
2. **WebSocket Connection Failed**: Verify EC2 security group allows port 3001
3. **403 Forbidden**: Check S3 bucket policy
4. **CloudFront 503**: Ensure S3 bucket is publicly accessible

### Debug Commands:
```bash
# Check EC2 logs
ssh -i key.pem ubuntu@your-ec2-ip "pm2 logs"

# Check S3 permissions
aws s3api get-bucket-policy --bucket prompt-firewall-frontend

# Test CloudFront
curl -I https://your-cloudfront-domain.cloudfront.net
```

## 💰 Cost Monitoring

### Free Tier Usage:
- EC2: 750 hours/month (t2.micro)
- S3: 5GB storage
- CloudFront: 1TB data transfer

### Set Up Billing Alerts:
1. AWS Console → Billing → Budgets
2. Create budget for $0/month
3. Set alerts at 50% and 90%

## 🔄 Updates and Maintenance

### Update Frontend:
```bash
cd frontend
npm run build
aws s3 sync build/ s3://prompt-firewall-frontend --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Update Backend:
```bash
scp -i key.pem -r backend/* ubuntu@your-ec2-ip:~/prompt-firewall/
ssh -i key.pem ubuntu@your-ec2-ip "cd prompt-firewall && pm2 restart prompt-firewall"
```

## 🎯 Success Criteria
- [ ] Frontend accessible via CloudFront URL
- [ ] Backend API responding on port 3001
- [ ] WebSocket connections working
- [ ] Real-time security events displaying
- [ ] All features functional as localhost

## 📞 Support
If you encounter issues:
1. Check AWS CloudWatch logs
2. Verify security group settings
3. Test individual components separately
4. Review this guide's troubleshooting section

---

**🎉 Your Prompt Firewall is now live on AWS with professional cybersecurity UI!**
