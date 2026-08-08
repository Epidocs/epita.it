#!/bin/sh
# Lint Dockerfiles across the repo, using hadolint
# (https://github.com/hadolint/hadolint).
#
# Usage: check_docker_lint.sh [dockerfile...]
#
# Dockerfiles to lint can be passed as command line arguments, or via the
# DOCKER_LINT_FILES environment variable (one entry per line). Otherwise,
# DOCKER_LINT_DEFAULT_FILES is used ('app/Dockerfile' by default).
#
# Files that do not exist are skipped (no failure).
#
# DOCKER_LINT_CONFIG_PATH sets the path to an optional hadolint config file
# (relative to the repo root). Default is '.hadolint.yaml'. If not found, no
# config is used and hadolint's defaults apply.
#
# If found in PATH, the `hadolint` binary is used directly. Otherwise, a
# docker fallback is used (hadolint/hadolint image), streaming each file's
# content via stdin so no bind mount is required.
#
# DOCKER_LINT_HADOLINT_IMAGE_TAG sets the tag of the hadolint/hadolint image
# used by the docker fallback. Default is 'latest'.
#
# The lint level can also be set via the -l/--level option (takes precedence
# over DOCKER_LINT_LEVEL). DOCKER_LINT_LEVEL sets the minimum severity
# threshold that fails the lint (style, info, warning, error, ignore).
# Default is 'info'.
set -u

files=''
lint_level=''

usage() {
	echo "Usage: ${0##*/} [-l|--level <level>] [dockerfile...]"
}

after_dashdash='false'
while [ "$#" -gt 0 ]; do
	arg="$1"
	if [ "${after_dashdash}" = 'true' ]; then
		files="$(printf '%s\n%s' "${files}" "${arg}")"
		shift
		continue
	fi
	case "${arg}" in
		-h|--help)
			usage
			exit 0
			;;
		-l|--level)
			[ "$#" -lt 2 ] && { usage; exit 1; }
			lint_level="$2"
			shift
			;;
		--level=*)
			lint_level="${arg#--level=}"
			;;
		--)
			after_dashdash='true'
			;;
		-*)
			usage >&2
			exit 1
			;;
		*)
			files="$(printf '%s\n%s' "${files}" "${arg}")"
			;;
	esac
	shift
done

[ -z "${files}" ] && files="${DOCKER_LINT_FILES:-}"
[ -z "${files}" ] && files="${DOCKER_LINT_DEFAULT_FILES:-}"
[ -z "${files}" ] && files='app/Dockerfile'
if [ -z "${files}" ]; then
	echo 'No Dockerfiles to lint' >&2
	exit 0
fi

current_dir="${0%/*}"
[ "${current_dir}" = "$0" ] && current_dir='.'
repo_dir="$(CDPATH= cd -- "${current_dir}/.." && pwd)"

config_path="${DOCKER_LINT_CONFIG_PATH:-}"
[ -z "${config_path}" ] && config_path='.hadolint.yaml'
has_config='false'
[ -f "${repo_dir}/${config_path}" ] && has_config='true'

hadolint_image_tag="${DOCKER_LINT_HADOLINT_IMAGE_TAG:-}"
[ -z "${hadolint_image_tag}" ] && hadolint_image_tag='latest'

[ -z "${lint_level}" ] && lint_level="${DOCKER_LINT_LEVEL:-}"
[ -z "${lint_level}" ] && lint_level='info'
case "${lint_level}" in
	style|info|warning|error|ignore) ;;
	*)
		echo "Invalid DOCKER_LINT_LEVEL '${lint_level}' (expected style|info|warning|error|ignore)" >&2
		exit 1
		;;
esac

if command -v hadolint > /dev/null 2>&1; then
	if [ "${has_config}" = 'true' ]; then
		run_hadolint() {
			local file="$1"
			hadolint --config "${repo_dir}/${config_path}" --failure-threshold "${lint_level}" "${file}"
		}
	else
		run_hadolint() {
			local file="$1"
			hadolint --failure-threshold "${lint_level}" "${file}"
		}
	fi
elif command -v docker > /dev/null 2>&1; then
	docker_image="hadolint/hadolint:${hadolint_image_tag}"
	if [ "${has_config}" = 'true' ]; then
		docker run --rm \
			-v "${repo_dir}:/probe" \
			--entrypoint sh \
			"${docker_image}" \
			-c 'test -n "$(ls -A /probe)"' \
			> /dev/null 2>&1
		if [ "$?" -eq 0 ]; then
			run_hadolint() {
				local file="$1"
				docker run --rm -i \
					-v "${repo_dir}/${config_path}:/.hadolint.yaml:ro" \
					"${docker_image}" \
					hadolint --config /.hadolint.yaml --failure-threshold "${lint_level}" - \
					< "${file}"
			}
		else
			# Bind mount is not available, so we copy the config file into the container.
			run_hadolint() {
				local file="$1"
				local container_id="$(
					docker create -i --entrypoint sh "${docker_image}" \
						-c "hadolint --config /.hadolint.yaml --failure-threshold '${lint_level}' -"
				)"
				[ -z "${container_id}" ] && return 2
				docker cp "${repo_dir}/${config_path}" "${container_id}":/.hadolint.yaml > /dev/null 2>&1
				[ "$?" -ne 0 ] && return 2
				docker start -ai "${container_id}" < "${file}"
				local hadolint_rc="$?"
				docker rm -f "${container_id}" > /dev/null 2>&1
				return "${hadolint_rc}"
			}
		fi
	else
		run_hadolint() {
			local file="$1"
			docker run --rm -i \
				"${docker_image}" \
				hadolint --failure-threshold "${lint_level}" - \
				< "${file}"
		}
	fi
else
	echo '⚠️  Skipped lint: Neither Hadolint nor Docker found on PATH' >&2
	exit 0
fi

nb_files="$(printf '%s\n' "$files" | grep -c .)"
if [ "${nb_files}" -eq 0 ]; then
	echo 'ℹ️  No Dockerfiles to lint (DOCKER_LINT_FILES is empty)'
	exit 0
fi

if [ "${has_config}" = 'true' ]; then
	if [ "${nb_files}" -eq 1 ]; then
		echo "Linting 1 Dockerfile (level '${lint_level}') (config: ${config_path})..."
	else
		echo "Linting ${nb_files} Dockerfiles (level '${lint_level}') (config: ${config_path})..."
	fi
else
	if [ "${nb_files}" -eq 1 ]; then
		echo "Linting 1 Dockerfile (level '${lint_level}') (default config)..."
	else
		echo "Linting ${nb_files} Dockerfiles (level '${lint_level}') (default config)..."
	fi
fi

linted=0
failed_lints=''

lint_file() {
	local file="$1"
	[ -z "${file}" ] && return 0
	echo ''
	if [ ! -f "${repo_dir}/${file}" ]; then
		echo "ℹ️  Skipping ${file}: File not found"
		return 0
	fi
	echo "📋 Running hadolint for ${file}..."
	linted=$((linted + 1))
	run_hadolint "${repo_dir}/${file}"
	if [ "$?" -ne 0 ]; then
		failed_lints="$(printf '%s\n%s' "${failed_lints}" "${file}")"
	fi
}

while IFS= read -r file; do
	lint_file "${file}"
done <<EOF
$files
EOF

echo ''
if [ -n "${failed_lints}" ]; then
	nb_failed_lints="$(printf '%s\n' "${failed_lints}" | grep -c .)"
	echo "❌ ${nb_failed_lints} Dockerfile(s) with lint issues (level '${lint_level}'):"
	printf '%s\n' "${failed_lints}" | while IFS= read -r file; do
		[ -z "${file}" ] && continue
		echo "  - ${file}"
	done
	exit 1
fi
if [ "${linted}" -eq 0 ]; then
	echo 'ℹ️  No Dockerfiles linted'
	exit 0
fi
echo "✅ Docker lint passed on ${linted} Dockerfile(s) (level '${lint_level}')"
