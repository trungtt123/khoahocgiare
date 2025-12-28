# Nginx Proxy Solution for CORS

## 🎯 Vấn đề
Frontend `http://103.82.26.223:3000` gọi API `http://localhost:3001` gây CORS error vì browser coi localhost là private address space.

## ✅ Giải pháp Nginx Proxy

### **Cách 1: API qua same domain (Recommended)**
```nginx
server {
    listen 80;
    server_name 103.82.26.223;

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

    # API proxy qua same domain
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
}
```

### **Cách 2: Subdomain cho API**
```nginx
# Frontend domain
server {
    listen 80;
    server_name 103.82.26.223;

    location / {
        proxy_pass http://localhost:3000;
        # ... proxy headers
    }
}

# API subdomain
server {
    listen 80;
    server_name api.103.82.26.223;

    location / {
        proxy_pass http://localhost:3001;
        # ... proxy headers
    }
}
```

## 🔧 Cập nhật Frontend

### **Option 1: Same domain (recommended)**
```javascript
// frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';  // Empty for same domain

const api = axios.create({
  baseURL: `/api`,  // Relative URL
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### **Option 2: Subdomain**
```javascript
// frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.103.82.26.223:3001';
```

## 🚀 Commands triển khai

### **1. Cập nhật Nginx config**
```bash
sudo nano /etc/nginx/sites-available/video-platform
```

### **2. Test Nginx config**
```bash
sudo nginx -t
```

### **3. Restart Nginx**
```bash
sudo systemctl restart nginx
```

### **4. Cập nhật frontend**
```bash
# Cập nhật API URL
cd /var/www/video-platform/frontend
echo "NEXT_PUBLIC_API_URL=" > .env.local
# hoặc
echo "NEXT_PUBLIC_API_URL=/api" > .env.local

# Restart frontend
pm2 restart video-frontend
```

## 📋 Quy trình hoàn chỉnh

### **Step 1: Nginx Configuration**
```bash
# Create new config
sudo nano /etc/nginx/sites-available/video-platform

# Paste config from above
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 2: Frontend Update**
```bash
cd /var/www/video-platform/frontend
nano .env.local
# Add: NEXT_PUBLIC_API_URL=/api
```

### **Step 3: Backend Update**
```bash
cd /var/www/video-platform/backend
nano .env
# Add: FRONTEND_URL=http://103.82.26.223:3000
```

### **Step 4: Restart Services**
```bash
pm2 restart all
pm2 save
```

## ✅ Kết quả mong đợi

### **API Calls sẽ là:**
```
Before: http://localhost:3001/api/auth/login ❌
After:  http://103.82.26.223/api/auth/login ✅
```

### **Không còn CORS error vì:**
- Same domain (`103.82.26.223`)
- Không có private address space
- Browser cho phép cross-origin requests

## 🌐 URL Structure sau khi fix

```
Frontend: http://103.82.26.223:3000
API:      http://103.82.26.223:3000/api/auth/login
          http://103.82.26.223:3000/api/videos
```

## 🔍 Testing

### **1. Test Nginx proxy**
```bash
curl http://103.82.26.223/api/health
# Should return backend response
```

### **2. Test frontend**
```bash
# Mở browser http://103.82.26.223:3000
# Test login
# Check Network tab -> API calls đến /api/...
```

### **3. Verify không còn CORS**
```bash
# Browser Console không nên có:
# "Access to XMLHttpRequest blocked by CORS policy"
```

**Nginx proxy là giải pháp tốt nhất cho production! 🚀**
