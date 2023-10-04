FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf

COPY /app/static /usr/share/nginx/html/static

CMD ["nginx", "-g", "daemon off;"]
