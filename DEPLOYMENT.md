# Deployment Guide

This guide covers deploying The Art Exchange web app using Docker.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

## Environment Variables

Before building, create a `.env.production.local` file with your production API URL:

```bash
cp .env.production .env.production.local
# Edit .env.production.local with your actual API URL
```

## Building the Docker Image

### Option 1: Using Docker directly

```bash
# Build the image
docker build -t the-art-exchange-app:latest .

# Run the container
docker run -d \
  --name art-exchange-web \
  -p 3001:80 \
  --restart unless-stopped \
  the-art-exchange-app:latest
```

### Option 2: Using Docker Compose (recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## Accessing the Application

Once running, the application will be available at:
- http://localhost:3001

## Production Deployment

### Port Configuration

By default, the container exposes port 80 internally and maps to port 3001 on the host. To change this:

**Docker Compose:**
Edit `docker-compose.yml` and change the ports mapping:
```yaml
ports:
  - "80:80"  # Map to port 80 on host
```

**Docker CLI:**
```bash
docker run -d -p 80:80 the-art-exchange-app:latest
```

### Reverse Proxy Setup (Nginx/Caddy)

For production, you'll typically run this behind a reverse proxy for SSL/TLS:

**Example Nginx config:**
```nginx
server {
    listen 443 ssl http2;
    server_name theartexch.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Environment-Specific Builds

To build with different environment files:

```bash
# Copy the appropriate env file before building
cp .env.production.local .env
docker build -t the-art-exchange-app:production .
```

## Health Checks

The container includes a health check endpoint at `/health`:

```bash
curl http://localhost:3001/health
# Should return: healthy
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Check container logs
```bash
docker-compose logs web
```

### Check container status
```bash
docker-compose ps
```

### Access container shell
```bash
docker-compose exec web sh
```

### Verify nginx config
```bash
docker-compose exec web nginx -t
```

## Resource Limits

To set memory and CPU limits:

**Docker Compose:**
```yaml
services:
  web:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

**Docker CLI:**
```bash
docker run -d \
  --memory="512m" \
  --cpus="0.5" \
  -p 3001:80 \
  the-art-exchange-app:latest
```

## Production Checklist

- [ ] Set production API URL in `.env.production.local`
- [ ] Build Docker image with production environment
- [ ] Configure reverse proxy for SSL/TLS
- [ ] Set up proper DNS records
- [ ] Configure firewall rules
- [ ] Set up monitoring/logging
- [ ] Configure automated backups (if applicable)
- [ ] Test health check endpoint
- [ ] Set resource limits based on server capacity
