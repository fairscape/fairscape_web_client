#!/bin/bash

npm run build

# Generate date in YYYY-MM-DD format
DATE=$(date '+%Y-%m-%d')

# Build the Docker image with production environment variables
sudo docker build \
  --no-cache \
  -f Dockerfile \
  -t ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}.v3 .


sudo docker push ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}.v3

#docker run -p 5173:80 ghcr.io/fairscape/fairscapefrontend:RELEASE.${DATE}