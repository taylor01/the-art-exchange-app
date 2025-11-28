# Deployment Guide - GitHub Container Registry (GHCR)

This guide covers deploying The Art Exchange web app using Docker images from GitHub Container Registry (ghcr.io).

## Overview

The GitHub Actions workflow automatically builds and pushes Docker images to GHCR on every push to `main` or when tags are created.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- GitHub account with access to the repository

## GitHub Actions Workflow

The workflow (`.github/workflows/build-and-push.yml`) automatically:
1. Builds the Docker image on push to `main` or on tag creation
2. Pushes to `ghcr.io/taylor01/the-art-exchange-app`
3. Tags images with:
   - `latest` (for main branch)
   - `main` (for main branch)
   - `v1.0.0`, `v1.0`, `v1` (for version tags)

## Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and update with your production values:

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# API Configuration - UPDATE THIS FOR PRODUCTION
VITE_API_URL=https://api.theartexch.com/api/v1

# Docker Configuration
IMAGE_TAG=latest
PORT=3001
```

### 2. Make GitHub Packages Public (Optional)

By default, GHCR packages are private. To make it public:

1. Go to https://github.com/taylor01/the-art-exchange-app/pkgs/container/the-art-exchange-app
2. Click "Package settings"
3. Scroll to "Danger Zone"
4. Click "Change visibility" → "Public"

### 3. Authenticate Docker with GHCR (if using private packages)

```bash
# Create a Personal Access Token (PAT) with read:packages scope
# Go to: Settings → Developer settings → Personal access tokens → Tokens (classic)

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u your-username --password-stdin
```

## Deployment

### Deploy with Docker Compose (Recommended)

```bash
# Pull and start the container
docker-compose pull
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop container
docker-compose down
```

### Deploy with Docker CLI

```bash
# Pull the image
docker pull ghcr.io/taylor01/the-art-exchange-app:latest

# Run the container
docker run -d \
  --name art-exchange-web \
  -p 3001:80 \
  --env-file .env \
  --restart unless-stopped \
  ghcr.io/taylor01/the-art-exchange-app:latest
```

## Updating the Application

### Using Specific Versions

```bash
# Update IMAGE_TAG in .env
IMAGE_TAG=v1.2.3

# Pull and restart
docker-compose pull
docker-compose up -d
```

### Using Latest

```bash
# Pull latest and restart
docker-compose pull
docker-compose up -d
```

### Rolling Back

```bash
# Use a specific tag
IMAGE_TAG=v1.2.2 docker-compose up -d
```

## Production Deployment

### 1. Server Setup

```bash
# On your production server
git clone https://github.com/taylor01/the-art-exchange-app.git
cd the-art-exchange-app

# Create production .env
cp .env.example .env
# Edit .env with production values
nano .env
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Verify Deployment

```bash
# Check container status
docker-compose ps

# Check health
curl http://localhost:3001/health

# View logs
docker-compose logs -f web
```

## Reverse Proxy Setup

For production, run behind nginx or Caddy for SSL/TLS:

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

## CI/CD Pipeline

### Triggering Builds

**On Push to Main:**
```bash
git push origin main
# Builds and tags: latest, main-<sha>
```

**Creating a Release:**
```bash
git tag v1.0.0
git push origin v1.0.0
# Builds and tags: v1.0.0, v1.0, v1, latest
```

### Automated Deployment

You can extend the GitHub Actions workflow to automatically deploy on successful builds:

```yaml
# Add to .github/workflows/docker-publish.yml
- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
  run: |
    # SSH to server and pull/restart
    ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

## Monitoring

### Check Container Health

```bash
# View container status
docker-compose ps

# Check health endpoint
curl http://localhost:3001/health

# View real-time logs
docker-compose logs -f web
```

### Resource Usage

```bash
# View container stats
docker stats art-exchange-web
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs web

# Check if port is already in use
sudo lsof -i :3001

# Verify .env file
cat .env
```

### Image Pull Fails

```bash
# For private packages, authenticate
echo $GITHUB_TOKEN | docker login ghcr.io -u your-username --password-stdin

# Verify image exists
docker manifest inspect ghcr.io/taylor01/the-art-exchange-app:latest
```

### Cannot Access Application

```bash
# Verify container is running
docker-compose ps

# Check health endpoint
curl http://localhost:3001/health

# Verify port mapping
docker port art-exchange-web

# Check firewall rules
sudo ufw status
```

## Local Development with GHCR Image

To test the production image locally:

```bash
# Pull the image
docker-compose pull

# Start with local .env
docker-compose up

# Access at http://localhost:3001
```

## Build Locally (Optional)

If you want to build locally instead of pulling from GHCR:

```bash
# Remove the image line in docker-compose.yml and add build
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    # ... rest of config

# Build and start
docker-compose up --build -d
```

## Security

### Environment Variables

- Never commit `.env` with production secrets
- Use `.env.example` as a template
- Keep API URLs and sensitive configs in `.env`

### GHCR Authentication

- Use Personal Access Tokens (PATs) for authentication
- Scope tokens to `read:packages` (minimum required)
- Rotate tokens regularly
- Use GitHub Actions secrets for CI/CD

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove images (optional)
docker rmi ghcr.io/your-username/the-art-exchange-app:latest

# Prune unused images
docker image prune -a
```
