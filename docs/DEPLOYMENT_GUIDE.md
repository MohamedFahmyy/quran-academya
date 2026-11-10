# Al Quran Academy Website – Production Deployment Guide

This document provides a production-grade guide for deploying the official website and Privacy Policy of **Al Quran Academy** (`com.alquranacademy.app`) to a live Linux server (Ubuntu 22.04 / 24.04 LTS or Debian 12).

---

## 1. Architecture Overview

- **Domain:** `https://alquran-academya.online`
- **Application Framework:** Node.js (v18.x / v20.x / v22.x LTS) with Express.js & EJS
- **Process Manager:** PM2 (Cluster Mode, 2 instances or max cores)
- **Reverse Proxy & TLS Termination:** Nginx + Let's Encrypt SSL
- **Local Application Port:** `3000` (Bound locally to `127.0.0.1:3000`)
- **Default Locale:** Arabic (`/ar`), with English (`/en`) support

---

## 2. Server Prerequisites

Connect to your production server via SSH:

```bash
ssh user@your-server-ip
```

Ensure system packages are updated and essential utilities are installed:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx
```

### Install Node.js (LTS) & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Verify versions:
```bash
node -v # Should be v20.x or newer
npm -v  # Should be v10.x or newer
pm2 -v
```

---

## 3. Application Setup

### Step 3.1: Create Web Directory
```bash
sudo mkdir -p /var/www/alquran-academy-website
sudo chown -R $USER:$USER /var/www/alquran-academy-website
cd /var/www/alquran-academy-website
```

### Step 3.2: Transfer or Clone Codebase
Transfer the files from the project directory (`D:\laragon\www\MuslimProApp_website`) or clone from Git:
```bash
# Verify directory contents
ls -la
# Expected: package.json, ecosystem.config.js, src/, public/, locales/, docs/
```

### Step 3.3: Production Environment Variables
Create the production `.env` file:
```bash
cat << 'EOF' > /var/www/alquran-academy-website/.env
NODE_ENV=production
PORT=3000
APP_NAME=Al Quran Academy
APP_URL=https://alquran-academya.online
PACKAGE_NAME=com.alquranacademy.app
SUPPORT_EMAIL=support@alquran-academya.online
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

### Step 3.4: Install Production Dependencies
```bash
cd /var/www/alquran-academy-website
npm ci --omit=dev
```

---

## 4. PM2 Process Configuration

The application includes `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'alquran-academy-web',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

### Launch and Enable PM2 Startup:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2-startup install -u $USER --hp /home/$USER
```

Verify running processes:
```bash
pm2 status
pm2 logs alquran-academy-web --lines 20
```

---

## 5. Nginx Reverse Proxy Configuration

Create an Nginx server block configuration for the domain:

```bash
sudo nano /etc/nginx/sites-available/alquran-academya.online
```

Paste the following configuration:

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=al_quran_limit:10m rate=15r/s;

server {
    listen 80;
    listen [::]:80;
    server_name alquran-academya.online www.alquran-academya.online;

    # Certbot challenge validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all plain HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name alquran-academya.online www.alquran-academya.online;

    # SSL Certificates (managed by Certbot)
    # ssl_certificate /etc/letsencrypt/live/alquran-academya.online/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/alquran-academya.online/privkey.pem;

    # TLS Parameters & Hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml image/svg+xml;

    # Static Assets Caching
    location ~* \.(ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        root /var/www/alquran-academy-website/public;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
    }

    # Health Check Bypass
    location = /health {
        proxy_pass http://127.0.0.1:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Application Reverse Proxy
    location / {
        limit_req zone=al_quran_limit burst=25 nodelay;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the configuration and test Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/alquran-academya.online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL Certificate Installation (Let's Encrypt)

Obtain free automated TLS certificates:
```bash
sudo certbot --nginx -d alquran-academya.online -d www.alquran-academya.online
```

Certbot will automatically install certificates and set up automatic renewal cron jobs (`systemctl status certbot.timer`).

---

## 7. Firewall (UFW) Configuration

Allow SSH, HTTP, and HTTPS traffic:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 8. Post-Deployment Verification Checklist

Execute these checks to verify healthy deployment:

1. **Local Node Process:**
   ```bash
   curl -I http://127.0.0.1:3000/health
   # Expected: HTTP/1.1 200 OK
   ```

2. **Public HTTPS Health Check:**
   ```bash
   curl -I https://alquran-academya.online/health
   # Expected: HTTP/2 200 OK
   ```

3. **Language Redirection:**
   ```bash
   curl -I https://alquran-academya.online/
   # Expected: HTTP/2 301 Moved Permanently -> Location: /ar
   ```

4. **Privacy Policy Endpoints:**
   ```bash
   curl -I https://alquran-academya.online/privacy-policy
   # Expected: HTTP/2 301 Moved Permanently -> Location: /ar/privacy-policy

   curl -I https://alquran-academya.online/ar/privacy-policy
   # Expected: HTTP/2 200 OK

   curl -I https://alquran-academya.online/en/privacy-policy
   # Expected: HTTP/2 200 OK
   ```

5. **Search Engine Assets:**
   ```bash
   curl -I https://alquran-academya.online/robots.txt
   curl -I https://alquran-academya.online/sitemap.xml
   ```

---

## 9. Ongoing Maintenance & Upgrades

### Pull Updates & Reload (Zero Downtime)
```bash
cd /var/www/alquran-academy-website
git pull origin main
npm ci --omit=dev
pm2 reload ecosystem.config.js --env production
```

### Log Monitoring
```bash
# Realtime logs
pm2 logs alquran-academy-web

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

