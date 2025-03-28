FROM nginxinc/nginx-unprivileged:1.27.4-alpine3.21

COPY ./build/ /usr/share/nginx/html
