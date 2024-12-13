#!/bin/bash

VITE_FAIRSCAPE_API_URL=https://fairscape.net/api \
VITE_FAIRSCAPE_FE_URL=http://fairscape.net/ \
npm run build

# Generate date in YYYY-MM-DD format
DATE=$(date '+%Y-%m-%d')

# Build the Docker image with production environment variables
docker build \
  --build-arg VITE_FAIRSCAPE_API_URL=${PROD_API_URL} \
  --build-arg VITE_FAIRSCAPE_FE_URL=${PROD_FE_URL} \
  -f Dockerfile \
  -t ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}.v3 .


docker push ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}.v3

docker run -p 5173:80 ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}.v2