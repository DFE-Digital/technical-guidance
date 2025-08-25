FROM nginxinc/nginx-unprivileged:1.27.5-alpine3.21

# Switch to root to create the user
USER root

# Create app user and group with UID/GID 10001 as per ITHC security requirements
RUN addgroup -g 10001 -S appgroup && adduser -u 10001 -S appuser -G appgroup

# COPY the build files - the base image already handles proper ownership
COPY ./build/ /usr/share/nginx/html

# Run as non-root user with UID > 10000 as per ITHC security requirements
USER 10001
