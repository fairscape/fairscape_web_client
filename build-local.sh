#!/bin/bash

# First, build the React app with environment variables
VITE_FAIRSCAPE_API_URL=http://localhost:8080/api \
VITE_FAIRSCAPE_FE_URL=http://localhost:5173/ \
npm run build

DATE=$(date '+%Y-%m-%d')
# Build the Docker image with the same environment variables
docker build \
  --build-arg VITE_FAIRSCAPE_API_URL=http://localhost:8080/api \
  --build-arg VITE_FAIRSCAPE_FE_URL=http://localhost:5173/ \
  -f Dockerfile.local \
  -t ghcr.io/fairscape/fairscapefrontendlocal:RELEASE.${DATE}.v2 .

# Run the container
docker push ghcr.io/fairscape/fairscapefrontendlocal:RELEASE.${DATE}.v2