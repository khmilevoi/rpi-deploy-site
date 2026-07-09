FROM nginx:alpine
COPY index.html styles.css copy.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
