#!/bin/sh
if [ -n "$VITE_FAIRSCAPE_API_URL" ]; then
  sed -i "s|http://localhost:8080/api|${VITE_FAIRSCAPE_API_URL}|g" /usr/share/nginx/html/index.html
fi
exec "$@"