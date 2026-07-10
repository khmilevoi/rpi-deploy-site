FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY src/index.html src/styles.css src/copy.js src/robots.txt src/sitemap.xml src/llms.txt /usr/share/nginx/html/
COPY src/assets/ /usr/share/nginx/html/assets/
