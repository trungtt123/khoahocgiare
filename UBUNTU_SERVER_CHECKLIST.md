# Ubuntu Server Pre-Deployment Checklist

## 🔍 Server Specifications Check

### **System Requirements Verification:**
```bash
# Check Ubuntu version
lsb_release -a
# Should show: Ubuntu 20.04+ or 22.04+

# Check system resources
free -h                    # Memory (minimum 2GB, recommended 4GB+)
df -h                      # Storage (minimum 20GB, recommended 50GB+)
nproc                      # CPU cores
uname -a                   # System architecture
```

### **Network Configuration:**
```bash
# Check network connectivity
ping -c 4 google.com
ping -c 4 8.8.8.8

# Check IP configuration
ip addr show                # Get server IP
curl ifconfig.me            # Get public IP

# Check DNS resolution
nslookup google.com

# Check open ports
sudo netstat -tlnp
ss -tlnp
```

---

## 🔧 Software & Dependencies Check

### **Operating System Updates:**
```bash
# Check if system is up to date
sudo apt list --upgradable

# Update package lists
sudo apt update

# Check available disk space for updates
df -h /var/cache/apt
```

### **Required Software Verification:**
```bash
# Check if Git is installed
git --version

# Check if Node.js is installed (requires 18+)
node --version
npm --version

# Check if Docker is installed
docker --version
docker-compose --version

# Check if Nginx is installed
nginx -v

# Check if PM2 is installed
pm2 --version
```

### **Missing Software Installation:**
```bash
# Install Git if missing
sudo apt install -y git

# Install Node.js 18 if missing
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 if missing
sudo npm install -g pm2

# Install Docker if missing
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose if missing
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx if missing
sudo apt install -y nginx
```

---

## 🛡️ Security Configuration Check

### **User & Access Control:**
```bash
# Check current user
whoami
id                        # User ID and groups

# Check sudo access
sudo -v                    # Should not ask for password if recently used

# Check SSH configuration
sudo cat /etc/ssh/sshd_config | grep -E "PermitRootLogin|PasswordAuthentication|PubkeyAuthentication"

# Check active SSH sessions
who
last
```

### **Firewall Status:**
```bash
# Check UFW status
sudo ufw status

# Check iptables rules
sudo iptables -L

# Check open ports
sudo netstat -tlnp | grep LISTEN
ss -tlnp | grep LISTEN
```

### **System Security:**
```bash
# Check for suspicious processes
ps aux
top

# Check system users
cat /etc/passwd | grep -E "bash|sh"

# Check sudo users
getent group sudo

# Check login attempts
sudo lastb
```

---

## 💾 Storage & Memory Check

### **Disk Space Analysis:**
```bash
# Check overall disk usage
df -h

# Check directory sizes
du -sh /var/*
du -sh /home/*
du -sh /tmp/*

# Check available space for application
# Need at least 5GB for application and dependencies
df -h /var/www
df -h /home

# Check inode usage
df -i
```

### **Memory & Performance:**
```bash
# Check memory usage
free -h
vmstat 1 5

# Check swap usage
swapon --show
free -h | grep Swap

# Check system load
uptime
top -bn1 | grep "load average"
```

---

## 🌐 Network & Domain Check

### **Domain Configuration:**
```bash
# Check if domain resolves (replace yourdomain.com)
nslookup yourdomain.com
dig yourdomain.com

# Check reverse DNS
nslookup YOUR_SERVER_IP

# Check HTTP connectivity
curl -I http://yourdomain.com
curl -I http://www.yourdomain.com

# Check port 80 and 443
telnet yourdomain.com 80
telnet yourdomain.com 443
```

### **SSL Certificate Check:**
```bash
# Check if domain has SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiry (if exists)
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🐳 Docker Environment Check

### **Docker Configuration:**
```bash
# Check Docker service status
sudo systemctl status docker

# Check if user is in docker group
groups $USER | grep docker

# Test Docker access
docker run --rm hello-world

# Check Docker networks
docker network ls

# Check existing containers
docker ps -a
```

### **Docker Compose Check:**
```bash
# Check docker-compose.yml syntax
cd /path/to/your/project
docker-compose config

# Check if PostgreSQL image can be pulled
docker pull postgres:15

# Check available disk space for Docker
docker system df
```

---

## 🔧 Port Availability Check

### **Required Ports:**
```bash
# Check if required ports are available
sudo netstat -tlnp | grep :22     # SSH (should be running)
sudo netstat -tlnp | grep :80     # HTTP
sudo netstat -tlnp | grep :443    # HTTPS
sudo netstat -tlnp | grep :3000   # Frontend
sudo netstat -tlnp | grep :3001   # Backend
sudo netstat -tlnp | grep :5432   # PostgreSQL (Docker)

# Alternative check with ss
ss -tlnp | grep -E ":(22|80|443|3000|3001|5432)"
```

### **Port Conflict Resolution:**
```bash
# Find process using specific port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process using port (if needed)
sudo kill -9 PID

# Check what services are running
sudo systemctl list-units --type=service --state=running
```

---

## 📁 File System & Permissions Check

### **Directory Structure:**
```bash
# Check if /var/www exists
ls -la /var/www/

# Create application directory if needed
sudo mkdir -p /var/www/video-platform
sudo chown $USER:$USER /var/www/video-platform

# Check write permissions
touch /var/www/video-platform/test.txt && rm /var/www/video-platform/test.txt

# Check /tmp permissions
ls -la /tmp/
```

### **User Permissions:**
```bash
# Check user groups
groups

# Check if user can create files in home directory
touch ~/test.txt && rm ~/test.txt

# Check sudo permissions without password
sudo -n true
```

---

## 🔄 Backup & Recovery Check

### **Backup Strategy:**
```bash
# Check if backup directory exists
ls -la /var/backups/

# Create backup directory if needed
sudo mkdir -p /var/backups/video-platform

# Check available space for backups
df -h /var/backups

# Test backup command (for PostgreSQL)
docker exec postgres pg_dump --help 2>/dev/null || echo "PostgreSQL not running yet"
```

### **System Recovery:**
```bash
# Check if systemd is working
systemctl --version

# Check if logs are working
journalctl --since yesterday --no-pager | tail -20

# Check if cron is working
systemctl status cron
```

---

## 📊 Performance & Monitoring Check

### **System Performance:**
```bash
# Check CPU usage
top -bn1 | grep "Cpu(s)"

# Check memory pressure
cat /proc/meminfo | grep -E "MemTotal|MemAvailable|SwapTotal|SwapFree"

# Check disk I/O
iostat -x 1 3 2>/dev/null || echo "iostat not available"

# Check network latency
ping -c 4 8.8.8.8
```

### **Monitoring Tools:**
```bash
# Install basic monitoring tools
sudo apt install -y htop iotop nethogs

# Test monitoring tools
htop --version
iotop --version
nethogs --version
```

---

## ✅ Pre-Deployment Validation

### **Final Checklist:**
```bash
# Create validation script
cat << 'EOF' > /tmp/deploy_check.sh
#!/bin/bash

echo "=== System Requirements ==="
echo "OS Version: $(lsb_release -d | cut -f2)"
echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Storage: $(df -h / | tail -1 | awk '{print $2}')"
echo "CPU Cores: $(nproc)"

echo -e "\n=== Software Versions ==="
echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo "NPM: $(npm --version 2>/dev/null || echo 'Not installed')"
echo "Docker: $(docker --version 2>/dev/null | cut -d' ' -f3 | cut -d',' -f1 || echo 'Not installed')"
echo "Docker Compose: $(docker-compose --version 2>/dev/null | cut -d' ' -f3 | cut -d',' -f1 || echo 'Not installed')"
echo "Nginx: $(nginx -v 2>&1 | cut -d'/' -f2 || echo 'Not installed')"
echo "PM2: $(pm2 --version 2>/dev/null || echo 'Not installed')"

echo -e "\n=== Port Availability ==="
for port in 3000 3001 5432; do
    if sudo netstat -tlnp | grep ":$port " > /dev/null; then
        echo "Port $port: IN USE"
    else
        echo "Port $port: AVAILABLE"
    fi
done

echo -e "\n=== Docker Status ==="
if systemctl is-active --quiet docker; then
    echo "Docker Service: RUNNING"
else
    echo "Docker Service: STOPPED"
fi

echo -e "\n=== User Permissions ==="
if groups $USER | grep -q docker; then
    echo "Docker Group: YES"
else
    echo "Docker Group: NO (run: sudo usermod -aG docker \$USER)"
fi

echo -e "\n=== Disk Space ==="
echo "Root: $(df -h / | tail -1 | awk '{print $4}' available)"
echo "Var: $(df -h /var | tail -1 | awk '{print $4}' available)"

EOF

chmod +x /tmp/deploy_check.sh
/tmp/deploy_check.sh
```

---

## 🚨 Critical Issues Resolution

### **Must Fix Before Deploy:**
1. **Memory < 2GB** → Upgrade server or optimize memory usage
2. **Storage < 20GB** → Clean up disk or upgrade storage
3. **Node.js < 18** → Install correct version
4. **Docker not running** → Start Docker service
5. **Ports 3000/3001/5432 in use** → Stop conflicting services
6. **User not in docker group** → Add user to docker group
7. **Insufficient disk space** → Clean up or upgrade storage

### **Optional but Recommended:**
1. **SSL certificate** → Install after Nginx setup
2. **Domain pointing** → Configure DNS records
3. **Backup system** → Set up automated backups
4. **Monitoring tools** → Install performance monitoring
5. **Firewall rules** → Configure security policies

---

## 📋 Deployment Readiness Score

### **Calculate Your Score:**
- **System Requirements**: 25 points (2GB RAM, 20GB storage, Ubuntu 20.04+)
- **Software Installation**: 25 points (Node.js 18+, Docker, Nginx, PM2)
- **Network Configuration**: 20 points (Domain, DNS, ports available)
- **Security Setup**: 15 points (SSH, firewall, user permissions)
- **Performance**: 15 points (Disk space, memory, CPU)

### **Score Interpretation:**
- **90-100 points**: ✅ Ready for production deployment
- **70-89 points**: ⚠️ Minor issues to fix
- **50-69 points**: 🔧 Significant configuration needed
- **< 50 points**: ❌ Server not ready for deployment

---

## 🎯 Next Steps After Passing Check

### **Proceed With:**
1. **Deploy Application** → Follow deployment guide
2. **Configure Nginx** → Set up reverse proxy
3. **Install SSL** → Configure HTTPS
4. **Set Up Monitoring** → Configure alerts and logs
5. **Test Functionality** → Verify all features work
6. **Performance Tuning** → Optimize for production

### **Monitor For:**
- Application crashes or errors
- Database connection issues
- SSL certificate expiration
- Disk space usage
- Memory usage patterns
- Network latency issues

**Server Ready for Deployment! 🚀**
