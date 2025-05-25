#syntax=docker/dockerfile:1

# This Dockerfile uses the service folder as context.


# --
# Upstream images

FROM node:22-slim AS node_upstream
FROM nginx:alpine AS nginx_upstream


# --
# Base image

FROM node_upstream AS app_base

# Set app directory
WORKDIR /app


# --
# Npm image

FROM app_base AS app_npm

# Mount source code as volume
VOLUME /app

# Run npm command
COPY --link --chmod=755 ./docker/npm-entrypoint.sh /usr/local/bin/app-npm-entrypoint
ENTRYPOINT [ "app-npm-entrypoint" ]
CMD [ "--help" ]


# --
# Runtime base image

FROM app_base AS app_runtime_base

# Set runtime environment
ENV APP_ENV=dev
ENV NODE_ENV=development

# Install dev dependencies, required for build
RUN --mount=type=bind,source=./app/package.json,target=./package.json \
	--mount=type=bind,source=./app/package-lock.json,target=./package-lock.json \
	--mount=type=bind,source=./app/tsconfig.json,target=./tsconfig.json \
	--mount=type=cache,target=~/.npm \
	npm clean-install --include=dev

# Copy application source code
COPY --link ./app .


# --
# Dev image

FROM app_runtime_base AS app_dev

# Set exposed port
ARG PORT=8080
ENV PORT=${PORT}
EXPOSE ${PORT}

# Start development server
CMD [ "sh", "-c", "npm run dev -- --host --port \"${PORT}\"" ]


# --
# Prod build image

FROM app_runtime_base AS app_prod_build

# Set runtime environment
ENV APP_ENV=prod
ENV NODE_ENV=production

# Use application environment variables
ARG GITHUB_REPOSITORY_URL=""
ENV GITHUB_REPOSITORY_URL=${GITHUB_REPOSITORY_URL}
ARG GITHUB_SHA=""
ENV GITHUB_SHA=${GITHUB_SHA}

# Build application
ARG BUILD_CHECK=true
RUN if [ "${BUILD_CHECK}" = "true" ]; then \
		npm run build; \
	else \
		npm run build-only; \
	fi


# --
# Prod image

FROM nginx_upstream AS app_prod

# Set runtime environment
ENV APP_ENV=prod
ENV NODE_ENV=production

# Set app directory
WORKDIR /usr/share/nginx/html

# Copy built static website files
COPY --from=app_prod_build --link /app/dist .

# Set exposed port
ARG PORT=8080
ENV PORT=${PORT}
EXPOSE ${PORT}

# Start nginx server
CMD [ "nginx", "-g", "daemon off;" ]
