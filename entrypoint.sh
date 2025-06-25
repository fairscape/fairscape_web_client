#!/bin/sh
echo "Starting entrypoint script..."
echo "VITE_FAIRSCAPE_API_URL: $VITE_FAIRSCAPE_API_URL"
echo "SEMANTIC_SEARCH_ENABLED: $SEMANTIC_SEARCH_ENABLED"

if [ -n "$VITE_FAIRSCAPE_API_URL" ]; then
echo "Updating API URL from default to: $VITE_FAIRSCAPE_API_URL"
sed -i "s|http://localhost:8080/api|${VITE_FAIRSCAPE_API_URL}|g" /usr/share/nginx/html/index.html
else
echo "No VITE_FAIRSCAPE_API_URL provided, keeping default"
fi

if [ "$SEMANTIC_SEARCH_ENABLED" = "true" ]; then
echo "Enabling semantic search..."
sed -i "s|window.SEMANTIC_SEARCH_ENABLED = false;|window.SEMANTIC_SEARCH_ENABLED = true;|g" /usr/share/nginx/html/index.html
echo "Semantic search enabled"
else
echo "Semantic search disabled (SEMANTIC_SEARCH_ENABLED: '$SEMANTIC_SEARCH_ENABLED')"
fi

echo "Final index.html content:"
grep -E "(API_URL|SEMANTIC_SEARCH_ENABLED)" /usr/share/nginx/html/index.html

exec "$@"