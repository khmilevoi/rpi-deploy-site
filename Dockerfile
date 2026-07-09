FROM nginx:alpine
COPY src/index.html src/styles.css src/copy.js /usr/share/nginx/html/
COPY src/assets/ /usr/share/nginx/html/assets/
