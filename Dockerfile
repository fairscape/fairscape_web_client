# Use the official Nginx image as a parent image
FROM nginx:alpine

# Copy the static content to Nginx's default public directory
COPY dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]