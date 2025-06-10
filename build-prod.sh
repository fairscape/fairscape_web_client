#!/bin/bash

VITE_FAIRSCAPE_API_URL=https://fairscape.net/api \
VITE_FAIRSCAPE_FE_URL=http://fairscape.net/view/ \
npm run build

# Generate date in YYYY-MM-DD format
DATE=$(date '+%Y-%m-%d')

# Build the Docker image with production environment variables
docker build \
  --no-cache \
  -f Dockerfile \
  -t ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}.v2 .


docker push ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}.v2

#docker run -p 5173:80 ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}