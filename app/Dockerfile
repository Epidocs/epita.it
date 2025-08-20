#syntax=docker/dockerfile:1

# This Dockerfile uses the service folder as context.


# --
# Global build arguments

ARG UID=1001


# --
# Upstream images

FROM node:22-slim AS node_upstream
FROM bitnami/nginx:1.29 AS nginx_upstream


# --
# Base image

FROM node_upstream AS app_base

# Set app directory
WORKDIR /app

# Use temporary directory as home
ENV HOME=/tmp


# --
# Build base image

FROM app_base AS app_build_base

# Install pnpm
RUN --mount=type=cache,target=~/.npm \
	npm install -g pnpm


# --
# Build dev image

FROM app_build_base AS app_build_dev

# Copy app build configuration
COPY --link ./app/package.json ./app/pnpm-lock.yaml ./

# Install app development dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
	pnpm install --frozen-lockfile


# --
# CLI image

FROM app_build_base AS app_cli

ARG UID

# Install sudo
# (hadolint: Ignore non-pinned apt package version)
# hadolint ignore=DL3008
RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
	--mount=type=cache,sharing=locked,target=/var/lib/apt \
	apt-get update && \
	apt-get install -y --no-install-recommends sudo && \
	echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Create user 'user' in group 'root' & 'sudo'
RUN USERNAME="$(getent passwd "${UID}" | cut -d: -f1)"; \
	if [ -z "${USERNAME}" ]; then \
		useradd -lm -u "${UID}" -U -G 0,sudo user; \
	else \
		usermod -a -G 0,sudo "${USERNAME}"; \
	fi

# Run as non-root user
USER ${UID}:0

# Mount source code
VOLUME /app

# Run CLI command
COPY --link --chmod=755 ./docker/cli-entrypoint.sh /usr/local/bin/app-cli-entrypoint
ENTRYPOINT [ "app-cli-entrypoint" ]
CMD [ "--help" ]


# --
# Test base image

FROM app_build_base AS app_test_base

# Build arguments
ARG UID

# Set runtime environment
ENV APP_ENV=test
ENV NODE_ENV=development

# Copy app development dependencies
COPY --link --from=app_build_dev --chown="${UID}:0" /app/node_modules ./node_modules


# --
# Test unit image

FROM app_test_base AS app_test_unit

# Build arguments
ARG UID

# Copy source code
COPY --link --chown="${UID}:0" ./app .

# Run as non-root user
USER ${UID}:0

CMD [ "sh", "-c", "pnpm run test:vitest" ]


# --
# Test E2E image

FROM app_test_base AS app_test_e2e

# Build arguments
ARG UID

# Configure Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/etc/playwright/browsers

# Install Playwright dependencies
# (hadolint: Ignore non-pinned apt package version)
# hadolint ignore=DL3008
RUN --mount=type=bind,source=./app/package.json,target=package.json \
	--mount=type=cache,sharing=locked,target=/var/cache/apt \
	--mount=type=cache,sharing=locked,target=/var/lib/apt \
	pnpm exec playwright install --with-deps

# Copy source code
COPY --link --chown="${UID}:0" ./app .

# Build application
RUN pnpm run build-only

# Run as non-root user
USER ${UID}:0

CMD [ "sh", "-c", "pnpm run test:playwright --output /tmp/playwright/test-results" ]


# --
# Dev image

FROM app_base AS app_dev

ARG UID

# Set runtime environment
ENV APP_ENV=dev
ENV NODE_ENV=development

# Copy app development dependencies
COPY --link --from=app_build_dev --chown="${UID}:0" /app/node_modules ./node_modules

# Copy source code
COPY --link --chown="${UID}:0" ./app .
RUN mkdir -p ./.astro && chown -R "${UID}:0" ./.astro

# Create user 'user' in group 'root'
RUN USERNAME="$(getent passwd "${UID}" | cut -d: -f1)"; \
	if [ -z "${USERNAME}" ]; then \
		useradd -lm -u "${UID}" -U -G 0 user; \
	else \
		usermod -a -G 0 "${USERNAME}"; \
	fi

# Run as non-root user
USER ${UID}:0

# Set exposed port
ARG PORT=8080
ENV PORT=${PORT}
EXPOSE ${PORT}

# Start development server
CMD [ "sh", "-c", "npm run dev -- --host --port \"${PORT}\"" ]


# --
# Prod build image

FROM app_base AS app_prod_build

ARG UID

# Set runtime environment
ENV APP_ENV=prod
ENV NODE_ENV=production

# Copy app development dependencies
COPY --link --from=app_build_dev --chown="${UID}:0" /app/node_modules ./node_modules

# Copy source code
COPY --link --chown="${UID}:0" ./app .

# Set app environment variables
# : Deployment configuration
ARG GITHUB_REPOSITORY_URL=''
ENV GITHUB_REPOSITORY_URL=${GITHUB_REPOSITORY_URL}
ARG GITHUB_SHA=''
ENV GITHUB_SHA=${GITHUB_SHA}
ARG VERSION_TAG=''
ENV VERSION_TAG=${VERSION_TAG}
# : Astro configuration
ARG ASTRO_SITE_URL=''
ENV ASTRO_SITE_URL=${ASTRO_SITE_URL}
ARG ASTRO_BASE_PATH=''
ENV ASTRO_BASE_PATH=${ASTRO_BASE_PATH}
ARG ASTRO_ASSETS_PREFIX=''
ENV ASTRO_ASSETS_PREFIX=${ASTRO_ASSETS_PREFIX}
# : Application configuration
# Add env vars for your application here.

# Build application
ARG BUILD_CHECK='true'
RUN if [ "${BUILD_CHECK}" = 'true' ]; then \
		npm run build; \
	else \
		npm run build-only; \
	fi


# --
# Prod image

FROM nginx_upstream AS app_prod

# Set runtime environment
ENV APP_ENV=prod

# Copy app production built files
COPY --from=app_prod_build --link /app/dist .

# Set exposed port
ARG PORT=8080
ENV NGINX_HTTP_PORT_NUMBER=${PORT}
EXPOSE ${PORT}
