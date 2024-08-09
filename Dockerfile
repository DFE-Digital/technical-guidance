FROM nginxinc/nginx-unprivileged:1.26.1

COPY ./build/ /usr/share/nginx/html
