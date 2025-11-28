#!/bin/sh
set -e

# Generate runtime config from environment variables
envsubst '${VITE_API_URL}' < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js

# Start nginx
exec "$@"
