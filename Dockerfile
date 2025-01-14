FROM nginxinc/nginx-unprivileged:1.27.3-alpine3.20

COPY ./build/ /usr/share/nginx/html
