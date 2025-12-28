# Ubuntu Deployment Guide - Video Platform

## 🚀 Overview
Hướng dẫn deploy video platform lên Ubuntu server với production-ready setup.

## 📋 Prerequisites

### **Server Requirements:**
- Ubuntu 20.04+ hoặc 22.04+
- Minimum 2GB RAM (recommended 4GB+)
- Minimum 20GB storage (recommended 50GB+)
- SSH access với sudo privileges
- Domain name (optional but recommended)

### **Software Required:**
- Node.js 18+ 
- PM2 (Process Manager)
- Nginx (Web Server)
- Docker & Docker Compose
- Git
- SSL Certificate (Let's Encrypt)

---

## 🔧 Step 1: Server Setup

### **Update System:**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip htop
```

### **Install Node.js:**
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x.x
npm --version
```

### **Install PM2:**
```bash
sudo npm install -g pm2
```

### **Install Docker & Docker Compose:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Re-login to apply Docker group changes
newgrp docker
```

### **Install Nginx:**
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 Step 2: Deploy Application

### **Clone Repository:**
```bash
# Create application directory
sudo mkdir -p /var/www/video-platform
sudo chown $USER:$USER /var/www/video-platform
cd /var/www/video-platform

# Clone your code (replace with your repo)
git clone https://github.com/trungtt123/khoahocgiare.git .
# Or upload files manually using scp/ftp
```

### **Setup Environment Files:**

#### **Backend .env:**
```bash
cd /var/www/video-platform/backend
cp .env.example .env
nano .env
```

```env
# Production Environment Variables
NODE_ENV=production
PORT=3001

# Database (using Docker PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/videodb"

# JWT Secret (generate strong secret)
JWT_SECRET="your-super-secure-jwt-secret-here-change-this"

# Abyss.to API Key (if needed)
ABYSS_API_KEY="your-abyss-api-key-here"

# Frontend URL (update with your domain)
FRONTEND_URL="https://yourdomain.com"
```

#### **Frontend Environment:**
```bash
cd ../frontend
nano .env.local
```

```env
# Production API URL
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"
```

---

## 🐳 Step 3: Database Setup

### **Start PostgreSQL with Docker:**
```bash
cd /var/www/video-platform
docker-compose up -d postgres

# Wait for database to be ready
docker-compose logs postgres

# Should see: "database system is ready to accept connections"
```

### **Setup Database:**
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data (admin user)
npm run seed
```

---

## 🔨 Step 4: Build Applications

### **Build Backend:**
```bash
cd /var/www/video-platform/backend

# Build TypeScript
npm run build

# Test production build
npm start
# Should see: "Server running on port 3001"
# Press Ctrl+C to stop
```

### **Build Frontend:**
```bash
cd /var/www/video-platform/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Test production build
npm start
# Should see: "started server on http://localhost:3000"
# Press Ctrl+C to stop
```

---

## 🚀 Step 5: PM2 Process Management

### **Create PM2 Ecosystem File:**
```bash
cd /var/www/video-platform
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'video-backend',
      script: './backend/dist/index.js',
      cwd: '/var/www/video-platform/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'video-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/video-platform/frontend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
```

### **Start Applications with PM2:**
```bash
# Create logs directory
mkdir -p /var/www/video-platform/logs

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Check status
pm2 status
pm2 logs
```

---

## 🌐 Step 6: Nginx Configuration

### **Create Nginx Config:**
```bash
sudo nano /etc/nginx/sites-available/video-platform
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### **Enable Site:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/video-platform /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Step 7: SSL Certificate (Let's Encrypt)

### **Install Certbot:**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### **Get SSL Certificate:**
```bash
# Replace yourdomain.com with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts for email and terms
```

### **Auto-renew SSL:**
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔍 Step 8: Security & Monitoring

### **Firewall Setup:**
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### **System Monitoring:**
```bash
# Monitor PM2 processes
pm2 monit

# Check system resources
htop
df -h
free -h

# Check logs
pm2 logs
tail -f /var/www/video-platform/logs/backend-error.log
tail -f /var/www/video-platform/logs/frontend-error.log
```

### **Database Backup:**
```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/video-platform"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec videodb pg_dump -U postgres videodb > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to cron (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 🧪 Step 9: Post-Deployment Testing

### **Basic Tests:**
```bash
# Check if applications are running
pm2 status

# Test API endpoints
curl -X GET http://localhost:3001/api/videos
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'

# Test frontend
curl -I http://localhost:3000

# Check Nginx
curl -I http://yourdomain.com
```

### **Browser Tests:**
1. **Frontend**: `https://yourdomain.com`
2. **API Test**: `https://yourdomain.com/api/videos`
3. **Login**: Test admin/user login
4. **Video Upload**: Test video upload
5. **Video Playback**: Test video watching
6. **Mobile Responsive**: Test on mobile
7. **SSL**: Check HTTPS works

---

## 🔄 Step 10: Maintenance & Updates

### **Update Process:**
```bash
cd /var/www/video-platform

# Pull latest changes
git pull origin main

# Update dependencies
cd backend && npm install
cd ../frontend && npm install

# Rebuild applications
cd backend && npm run build
cd ../frontend && npm run build

# Restart PM2 processes
pm2 restart all

# Check status
pm2 status
pm2 logs
```

### **Common Commands:**
```bash
# PM2 management
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart all         # Restart all apps
pm2 stop all            # Stop all apps
pm2 delete all          # Delete all apps
pm2 monit               # Monitor dashboard

# Database management
docker-compose ps postgres
docker-compose logs postgres
docker exec -it videodb psql -U postgres -d videodb

# Nginx management
sudo nginx -t           # Test config
sudo systemctl reload nginx
sudo systemctl restart nginx
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **Application won't start:**
```bash
# Check logs
pm2 logs video-backend
pm2 logs video-frontend

# Check port conflicts
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001

# Check environment variables
cd /var/www/video-platform/backend && cat .env
```

#### **Database connection issues:**
```bash
# Check PostgreSQL container
docker-compose ps postgres
docker-compose logs postgres

# Test connection
docker exec -it videodb psql -U postgres -d videodb -c "SELECT 1;"
```

#### **Nginx issues:**
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Restart Nginx
sudo systemctl restart nginx
```

#### **SSL Issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 📊 Performance Optimization

### **Recommended Settings:**
```bash
# Increase file limits for high traffic
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize PostgreSQL performance
sudo nano /var/lib/docker/volumes/postgres_data/_data/postgresql.conf
# Add: shared_buffers = 256MB
# Add: effective_cache_size = 1GB
# Add: maintenance_work_mem = 64MB

# Restart PostgreSQL
docker-compose restart postgres
```

### **Monitoring Setup:**
```bash
# Install monitoring tools
sudo apt install -y iotop nethogs

# Monitor real-time performance
iotop                    # Disk I/O
nethogs                  # Network usage
htop                     # System processes
pm2 monit                # Application monitoring
```

---

## ✅ Deployment Checklist

### **Pre-Deployment:**
- [ ] Ubuntu server ready with SSH access
- [ ] Domain name pointed to server IP
- [ ] Environment variables configured
- [ ] Database credentials secure
- [ ] SSL certificate ready

### **Post-Deployment:**
- [ ] Applications running (PM2 status)
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Database backup setup
- [ ] Monitoring configured
- [ ] Login functionality tested
- [ ] Video upload/playback tested
- [ ] Mobile responsiveness tested

---

## 🎯 Production URL Structure

```
https://yourdomain.com              → Frontend (Next.js)
https://yourdomain.com/api/*        → Backend API (Express)
https://yourdomain.com/admin        → Admin Dashboard
https://yourdomain.com/login        → Login Page
```

**Deployment Complete! 🚀**
