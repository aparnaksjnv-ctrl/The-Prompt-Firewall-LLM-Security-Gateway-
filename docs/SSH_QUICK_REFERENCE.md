# Quick SSH Connection Reference

## Find Your EC2 Information
1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **Instances** → Select your instance
3. Copy **Public IPv4 address** (e.g., `3.85.123.45`)

---

## Connect via SSH

### Windows (PowerShell)
```powershell
# 1. Navigate to your Downloads folder (where .pem file is)
cd C:\Users\YOUR_USERNAME\Downloads

# 2. Fix key permissions (run once)
icacls prompt-firewall-key.pem /inheritance:r
icacls prompt-firewall-key.pem /grant:r "%username%:R"

# 3. SSH connect
ssh -i prompt-firewall-key.pem ubuntu@YOUR_EC2_IP
```

### Mac/Linux (Terminal)
```bash
# 1. Navigate to key location
cd ~/Downloads

# 2. Fix key permissions (run once)
chmod 400 prompt-firewall-key.pem

# 3. SSH connect
ssh -i prompt-firewall-key.pem ubuntu@YOUR_EC2_IP
```

---

## Example (Replace with your actual IP)
```bash
ssh -i prompt-firewall-key.pem ubuntu@3.85.123.45
```

---

## Common Issues

### "Permissions too open" error?
**Windows**: Run the `icacls` commands above  
**Mac/Linux**: Run `chmod 400 prompt-firewall-key.pem`

### "Connection refused" or "Timeout"?
1. Check EC2 Security Group has port 22 open
2. Verify EC2 is running (green circle in console)
3. Check you're using correct username: `ubuntu`

### Forgot where you saved the .pem file?
```bash
# Search for it
# Windows:
Get-ChildItem -Path C:\ -Recurse -Filter "*prompt-firewall*" 2>$null

# Mac/Linux:
find ~ -name "*prompt-firewall*" 2>/dev/null
```

---

## Once Connected (First Time Setup)
```bash
# Update system
sudo apt update

# Check if Node.js installed
node --version

# If not installed, follow AWS_DEPLOYMENT.md guide
```

---

## Quick Commands After Connected
```bash
# Check application status
pm2 status

# View logs
pm2 logs

# Restart app
pm2 restart prompt-firewall

# Check disk space
df -h

# Exit SSH
exit
```

---

**Need full deployment steps?** See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)
