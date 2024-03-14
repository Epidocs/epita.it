#syntax=docker/dockerfile:1.4

# This Dockerfile uses the service folder as context.


# --
# Upstream images

FROM node:20-slim AS node_upstream
FROM nginx:alpine AS nginx_upstream


# --
# Npm image

FROM node_upstream AS npm

# Create app directory
WORKDIR /app

# Source code should be mounted here
VOLUME /app

COPY --link --chmod=755 ./docker-npm-entrypoint.sh /usr/local/bin/docker-npm-entrypoint

ENTRYPOINT [ "docker-npm-entrypoint" ]
CMD [ "--help" ]


# --
# Base image

FROM node_upstream AS app_base

# GitHub context environment variables
ARG GITHUB_REPOSITORY_URL=""
ENV GITHUB_REPOSITORY_URL=${GITHUB_REPOSITORY_URL}
ARG GITHUB_SHA=""
ENV GITHUB_SHA=${GITHUB_SHA}

# Create app directory
WORKDIR /app


# --
# Dev image

FROM app_base AS app_dev

ENV APP_ENV=dev
ENV NODE_ENV=development

# Source code should be mounted here
VOLUME /app
VOLUME /app/node_modules

COPY --link --chmod=755 ./docker-dev-command.sh /usr/local/bin/docker-dev-command

CMD [ "docker-dev-command" ]


# --
# Prod build image

FROM app_base AS app_prod_build

ENV APP_ENV=prod
ENV NODE_ENV=production

# Install dev dependencies, required for build
COPY --link ./app/package*.json ./app/tsconfig*.json ./app/astro.config.mjs .
RUN npm clean-install --include=dev && \
	npm cache clean --force

# Copy source code for build
COPY --link ./app .

# Build application
RUN npm run build


# --
# Prod image

FROM nginx_upstream AS app_prod

ENV APP_ENV=prod
ENV NODE_ENV=production

# Set app directory
WORKDIR /usr/share/nginx/html

# Copy built static website files
COPY --from=app_prod_build --link /app/dist .
