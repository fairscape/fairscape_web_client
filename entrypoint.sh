#!/bin/bash

sed -i "s|{{API_URL}}|${VITE_FAIRSCAPE_API_URL:-http://localhost:8080/api}|g" /usr/share/nginx/html/index.html

exec "$@"