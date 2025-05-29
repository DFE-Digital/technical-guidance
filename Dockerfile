FROM nginxinc/nginx-unprivileged:1.27.5-alpine3.21

COPY ./build/ /usr/share/nginx/html
