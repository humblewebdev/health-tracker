# DigitalOcean Deployment Plan - Health Tracker Application

## Overview
Comprehensive deployment strategy for deploying the Health Tracker full-stack application on DigitalOcean infrastructure.

## Architecture

### Recommended DigitalOcean Services

1. **App Platform** (Recommended for simplicity)
   - Managed platform for deploying web apps
   - Auto-scaling and load balancing
   - Automatic HTTPS with Let's Encrypt
   - GitHub integration for CI/CD
   - **Cost**: ~$12-25/month (Basic + Pro tier)

2. **Alternative: Droplets** (More control, manual setup)
   - Ubuntu 22.04 LTS Droplet
   - Docker containerization
   - Manual NGINX setup
   - **Cost**: ~$6-12/month (Basic + $7 database)

3. **Database**
   - Managed PostgreSQL Database
   - Automated backups
   - High availability option
   - **Cost**: ~$15/month (1GB RAM, 10GB storage)

### Architecture Diagram
```
┌─────────────────────────────────────────┐
│           DigitalOcean App              │
│                                         │
│  ┌──────────────┐   ┌───────────────┐  │
│  │   Frontend   │   │    Backend    │  │
│  │  (React/Vite)│   │  (Express API)│  │
│  │              │   │               │  │
│  │  Port: 80/   │   │  Port: 3001   │  │
│  │  443 (HTTPS) │   │               │  │
│  └──────────────┘   └───────────────┘  │
│         │                    │          │
└─────────┼────────────────────┼──────────┘
          │                    │
          │                    ├──────────────────┐
          │                    │                  │
          │            ┌───────▼───────┐   ┌─────▼─────┐
          │            │  PostgreSQL   │   │   Redis   │
          │            │  (Managed DB) │   │  (Cache)  │
          │            │               │   │ (Optional)│
          │            └───────────────┘   └───────────┘
          │
      ┌───▼──────┐
      │   CDN    │
      │ (Spaces) │
      │(Optional)│
      └──────────┘
```

## Deployment Options

### Option 1: App Platform (Recommended)

#### Pros
- ✅ Easiest setup and deployment
- ✅ Automatic HTTPS and SSL certificates
- ✅ Built-in CI/CD with GitHub
- ✅ Auto-scaling capabilities
- ✅ Zero-downtime deployments
- ✅ Managed infrastructure

#### Cons
- ❌ Higher cost (~$25/month total)
- ❌ Less customization
- ❌ Limited to DigitalOcean ecosystem

#### Setup Steps

##### 1. Prepare Repository
```bash
# Ensure code is in a Git repository
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/health-tracker.git
git push -u origin main
```

##### 2. Create App Platform Spec File
Create `.do/app.yaml`:

```yaml
name: health-tracker
region: nyc
services:
  # Frontend Service
  - name: frontend
    github:
      repo: yourusername/health-tracker
      branch: main
      deploy_on_push: true
    source_dir: /frontend
    build_command: npm install && npm run build
    run_command: npm run preview -- --port 8080 --host 0.0.0.0
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 8080
    routes:
      - path: /
    envs:
      - key: VITE_API_URL
        value: ${backend.PRIVATE_URL}
        type: SECRET

  # Backend Service
  - name: backend
    github:
      repo: yourusername/health-tracker
      branch: main
      deploy_on_push: true
    source_dir: /backend
    build_command: npm install && npm run build
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 3001
    routes:
      - path: /api
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3001"
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
        type: SECRET
      - key: JWT_SECRET
        scope: RUN_TIME
        type: SECRET
      - key: JWT_REFRESH_SECRET
        scope: RUN_TIME
        type: SECRET
      - key: CORS_ORIGIN
        value: https://health-tracker-app.ondigitalocean.app

# Database
databases:
  - name: db
    engine: PG
    version: "15"
    size: db-s-1vcpu-1gb
    num_nodes: 1
    production: true
```

##### 3. Deploy via DigitalOcean Console

1. Log in to DigitalOcean
2. Go to **Apps** → **Create App**
3. Connect to GitHub repository
4. Select the repository
5. Configure using `app.yaml` spec
6. Set environment variables (secrets):
   - `JWT_SECRET`: Generate strong secret
   - `JWT_REFRESH_SECRET`: Generate strong secret
7. Click **Create Resources**
8. Wait for deployment (~5-10 minutes)

##### 4. Configure Environment Variables

In DigitalOcean App Settings:
```
# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=[auto-provided by DigitalOcean]
JWT_SECRET=[your-secret-key]
JWT_REFRESH_SECRET=[your-refresh-secret]
CORS_ORIGIN=https://your-app.ondigitalocean.app

# Frontend
VITE_API_URL=https://your-app.ondigitalocean.app/api
```

##### 5. Database Migration

Run migrations after first deployment:
```bash
# Connect to backend console
doctl apps logs [app-id] --type=run

# Or use database connection string
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Option 2: Droplet Deployment (More Control)

#### Setup Steps

##### 1. Create Droplet
1. Go to DigitalOcean → **Droplets** → **Create Droplet**
2. Choose:
   - **Ubuntu 22.04 LTS**
   - **Basic plan** ($6-12/month)
   - **1 GB RAM / 1 CPU** minimum
   - **SSH keys** for authentication
   - **Region**: Choose closest to users

##### 2. Initial Server Setup
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install NGINX
apt install -y nginx

# Install Docker (optional, for containerization)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install PM2 (process manager)
npm install -g pm2

# Setup firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

##### 3. Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE health_tracker;
CREATE USER health_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE health_tracker TO health_user;
\q
```

##### 4. Deploy Application
```bash
# Create app directory
mkdir -p /var/www/health-tracker
cd /var/www/health-tracker

# Clone repository
git clone https://github.com/yourusername/health-tracker.git .

# Setup backend
cd backend
npm install
npm run build

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://health_user:secure_password@localhost:5432/health_tracker
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=https://yourdomain.com
EOF

# Run migrations
npx prisma migrate deploy

# Start backend with PM2
pm2 start dist/server.js --name health-api
pm2 save
pm2 startup

# Setup frontend
cd ../frontend
npm install

# Update API URL in .env
echo "VITE_API_URL=https://yourdomain.com/api" > .env

# Build frontend
npm run build

# Copy build to web root
cp -r dist/* /var/www/html/
```

##### 5. NGINX Configuration
```bash
# Create NGINX config
cat > /etc/nginx/sites-available/health-tracker << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/health-tracker /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

##### 6. Setup SSL with Let's Encrypt
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is setup automatically
certbot renew --dry-run
```

### Option 3: Docker Deployment

#### Create Dockerfiles

**backend/Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: health_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: health_tracker
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://health_user:${POSTGRES_PASSWORD}@postgres:5432/health_tracker
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: https://yourdomain.com
    depends_on:
      - postgres
    ports:
      - "3001:3001"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: https://yourdomain.com/api
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  pgdata:
```

**Deploy with Docker Compose**
```bash
# On the droplet
docker-compose up -d

# View logs
docker-compose logs -f

# Update application
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

## Database Management

### DigitalOcean Managed Database

1. Create database cluster:
   ```
   - Go to Databases → Create Database Cluster
   - Choose PostgreSQL 15
   - Select size (1GB RAM minimum)
   - Choose region
   - Enable daily backups
   ```

2. Connection details:
   ```
   Host: db-postgresql-nyc1-12345.ondigitalocean.com
   Port: 25060
   Database: defaultdb
   User: doadmin
   Password: [auto-generated]
   ```

3. Configure connection pooling
4. Enable automated backups
5. Setup read replicas (optional, for scaling)

### Backup Strategy

```bash
# Automated daily backups (DigitalOcean Managed DB handles this)

# Manual backup
pg_dump -h host -U user -d database > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h host -U user -d database < backup_20240115.sql
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}

      - name: Deploy to App Platform
        run: |
          doctl apps create-deployment ${{ secrets.APP_ID }} --wait

      # Alternative: Deploy to Droplet via SSH
      - name: Deploy to Droplet
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.DROPLET_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/health-tracker
            git pull origin main
            cd backend
            npm install
            npm run build
            pm2 restart health-api
            cd ../frontend
            npm install
            npm run build
            cp -r dist/* /var/www/html/
```

## Monitoring & Maintenance

### Monitoring Tools

1. **DigitalOcean Monitoring** (built-in)
   - CPU, memory, disk usage
   - Network traffic
   - Alerts and notifications

2. **Application Monitoring**
   ```bash
   # Install PM2 Plus for advanced monitoring
   pm2 install pm2-logrotate
   pm2 plus
   ```

3. **Database Monitoring**
   - Query performance
   - Connection pool stats
   - Slow query log

### Log Management

```bash
# PM2 logs
pm2 logs health-api

# NGINX logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

## Security Checklist

- [ ] Enable DigitalOcean Cloud Firewall
- [ ] Setup SSH key authentication (disable password login)
- [ ] Configure HTTPS/SSL with Let's Encrypt
- [ ] Use environment variables for secrets
- [ ] Enable database connection encryption
- [ ] Setup automated security updates
- [ ] Configure rate limiting
- [ ] Enable CORS properly
- [ ] Use strong JWT secrets
- [ ] Regular security audits

## Cost Estimation

### App Platform (Recommended)
```
Frontend: $5/month (Basic tier)
Backend: $5/month (Basic tier)
PostgreSQL Database: $15/month (1GB)
Total: ~$25/month
```

### Droplet + Managed Database
```
Droplet (1GB): $6/month
PostgreSQL Database: $15/month
Total: ~$21/month
```

### Droplet Only (Self-managed)
```
Droplet (2GB): $12/month
Total: ~$12/month
```

## Scaling Considerations

### Horizontal Scaling
- App Platform: Enable auto-scaling
- Droplets: Add load balancer + multiple droplets

### Vertical Scaling
- Upgrade droplet size
- Increase database resources

### Database Scaling
- Read replicas for heavy read operations
- Connection pooling (PgBouncer)
- Database sharding (future consideration)

## Rollback Strategy

### App Platform
```bash
# Rollback to previous deployment
doctl apps list-deployments [app-id]
doctl apps create-deployment [app-id] --commit [previous-commit-sha]
```

### Droplet
```bash
# Git rollback
git checkout [previous-commit]
npm run build
pm2 restart all
```

## Domain Configuration

1. Purchase domain (DigitalOcean Domains or external)
2. Add domain to DigitalOcean
3. Configure DNS records:
   ```
   A     @       points to [droplet-ip]
   A     www     points to [droplet-ip]
   CNAME api     points to [app-domain]
   ```
4. Update CORS_ORIGIN in backend
5. Update VITE_API_URL in frontend

## Post-Deployment Checklist

- [ ] Application is accessible via HTTPS
- [ ] Database migrations completed
- [ ] Environment variables set correctly
- [ ] SSL certificate valid
- [ ] Monitoring setup and working
- [ ] Backups configured
- [ ] CI/CD pipeline tested
- [ ] Error logging working
- [ ] Performance acceptable
- [ ] Security scan completed

## Maintenance Tasks

### Daily
- Monitor error logs
- Check application health

### Weekly
- Review performance metrics
- Check disk space usage
- Review security logs

### Monthly
- Database optimization
- Review and update dependencies
- Security patches
- Cost analysis

## Support & Resources

- DigitalOcean Documentation: https://docs.digitalocean.com
- DigitalOcean Community: https://www.digitalocean.com/community
- DigitalOcean Support: Available 24/7 (paid plans)
- Status Page: https://status.digitalocean.com
