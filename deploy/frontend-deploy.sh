#!/bin/bash

# Frontend Deployment Script - Hybrid Approach
# Deploys React build to S3 and configures CloudFront

echo "🚀 Starting Frontend Deployment..."

# Configuration
BUCKET_NAME="prompt-firewall-frontend-aparnaksjnv"
REGION="us-east-1"

# Build the React app
echo "📦 Building React application..."
cd frontend
npm run build

# Deploy to S3
echo "📤 Uploading to S3 bucket..."
aws s3 sync build/ s3://$BUCKET_NAME --delete

# Set public access
echo "🔓 Setting public access permissions..."
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
    }
  ]
}'

echo "✅ Frontend deployment completed!"
echo "🌐 S3 URL: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
echo "📝 Note: Set up CloudFront manually in AWS Console for better performance"
