FROM nginx:1.25.3-alpine3.18-slim

COPY ./build/ /usr/share/nginx/html
