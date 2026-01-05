# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

ARG BUILD_VERSION=dev

LABEL org.opencontainers.image.title="Life Binder" \
      org.opencontainers.image.description="Local-first, encrypted end-of-life planning and information management" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/w0rldart/lifebinder"

# Explicitly remove the default index page Nginx provides
USER root
RUN rm -rf /usr/share/nginx/html/*.html
USER nginx

# SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# CRA output
COPY --from=build --chown=nginx:nginx /app/build/client /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
