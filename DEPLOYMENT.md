# Deployment Guide

This guide covers deploying The Art Exchange web app using Docker with two configurations: development and production with Traefik SSL.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

## Development

For local development, use the base `docker-compose.yml`:

```bash
# Build and run locally
docker-compose up --build

# Access at http://localhost:3001
```

The development setup:
- Builds from local Dockerfile
- Exposes port 3001 directly
- No SSL (uses HTTP)
- Uses local .env configuration

### Development Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1

# Docker Configuration
NODE_ENV=development
PORT=3001
```

## Production Deployment

For production deployment with Traefik and automatic SSL:

### Initial Setup

1. **Configure environment variables:**
   ```bash
   # Copy and edit .env file
   cp .env.example .env
   ```

   Update the following variables:
   ```env
   # API Configuration
   VITE_API_URL=https://api.theartexch.com/api/v1

   # Production Configuration
   NODE_ENV=production
   IMAGE_TAG=latest

   # Traefik/SSL Configuration
   DOMAIN=app.theartexch.com
   ACME_EMAIL=your-email@example.com
   ```

2. **Ensure DNS is configured:**
   - Point your domain to your droplet's IP address
   - Allow propagation time (usually a few minutes)

3. **Firewall configuration:**
   ```bash
   # Allow HTTP and HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Deploy

```bash
# Pull latest image and start with production config
docker-compose -f docker-compose.yml -f docker-compose.production.yml pull
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

### How Production Works

The production setup:
- Uses pre-built image from GHCR (`ghcr.io/taylor01/the-art-exchange-app`)
- Traefik container handles:
  - Port 80 (HTTP) - redirects to HTTPS
  - Port 443 (HTTPS) - serves traffic with SSL
  - Automatic Let's Encrypt SSL certificate provisioning
  - Automatic certificate renewal (every 90 days)
  - SSL certificates stored in Docker volume (persist across restarts)
- Web container:
  - No exposed ports (private network only)
  - Traefik routes traffic to it via Docker network

### Useful Commands

```bash
# View logs
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs -f

# View only Traefik logs
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs -f traefik

# View only web logs
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs -f web

# Restart services
docker-compose -f docker-compose.yml -f docker-compose.production.yml restart

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.production.yml down

# Update to latest image
docker-compose -f docker-compose.yml -f docker-compose.production.yml pull
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

## Architecture

```
Development:
  localhost:3001 → nginx container (port 3001)

Production:
  Internet (80/443) → Traefik → nginx container (private network)
                        ↓
                  Let's Encrypt SSL
```

## Health Checks

The container includes a health check endpoint at `/health`:

```bash
# Development
curl http://localhost:3001/health

# Production
curl https://app.theartexch.com/health
```

Both should return: `healthy`

## Troubleshooting

### Check container logs
```bash
# Development
docker-compose logs web

# Production
docker-compose -f docker-compose.yml -f docker-compose.production.yml logs web
```

### Check container status
```bash
# Development
docker-compose ps

# Production
docker-compose -f docker-compose.yml -f docker-compose.production.yml ps
```

### Access container shell
```bash
# Development
docker-compose exec web sh

# Production
docker-compose -f docker-compose.yml -f docker-compose.production.yml exec web sh
```

### SSL Certificate Issues

If Let's Encrypt fails:
1. Check Traefik logs: `docker-compose -f docker-compose.yml -f docker-compose.production.yml logs traefik`
2. Verify DNS points to your server: `nslookup your-domain.com`
3. Ensure ports 80/443 are open: `sudo ufw status`
4. Verify domain in .env matches DNS: `grep DOMAIN .env`
5. Ensure ACME_EMAIL is set: `grep ACME_EMAIL .env`

### Certificate Testing

For testing, you can use Let's Encrypt staging by adding to Traefik command in `docker-compose.production.yml`:
```yaml
- "--certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
```

Remove this line once testing is complete to get production certificates.

## Updating the Application

### Development
```bash
# Rebuild and restart
docker-compose up -d --build
```

### Production
```bash
# Pull latest image from GHCR
docker-compose -f docker-compose.yml -f docker-compose.production.yml pull

# Restart with new image
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

## Production Checklist

- [ ] Set production API URL in `.env` (VITE_API_URL)
- [ ] Set `DOMAIN` in `.env` (your domain name)
- [ ] Set `ACME_EMAIL` in `.env` for Let's Encrypt notifications
- [ ] Configure DNS records pointing to server
- [ ] Configure firewall rules (ports 80, 443)
- [ ] Test health check endpoint
- [ ] Monitor SSL certificate issuance in Traefik logs
- [ ] Verify HTTPS works and HTTP redirects to HTTPS
