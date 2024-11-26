#!/bin/bash

# First, build the React app with environment variables
VITE_FAIRSCAPE_API_URL=http://localhost:8080/api \
VITE_FAIRSCAPE_FE_URL=http://localhost:5173/ \
npm run build

# Build the Docker image with the same environment variables
docker build \
  --build-arg VITE_FAIRSCAPE_API_URL=http://localhost:8080/api \
  --build-arg VITE_FAIRSCAPE_FE_URL=http://localhost:5173/ \
  -f Dockerfile.local \
  -t my-local-app .

# Run the container
docker run -p 5173:5173 my-local-app