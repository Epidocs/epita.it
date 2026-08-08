#!/bin/sh
# Scan for committed secrets across the full git history, using gitleaks
# (https://github.com/gitleaks/gitleaks).
#
# Usage: check_secrets_scan.sh [-u|--update-baseline]
#
# If found in PATH, the `gitleaks` binary is used directly. Otherwise, a docker
# fallback is used (zricethezav/gitleaks image).
#
# SECRETS_SCAN_BASELINE_PATH sets the path to an optional gitleaks baseline
# file (relative to the repo root). The baseline can capture known false
# positives already reviewed manually (e.g. well-known test tokens, etc.).
# This allows the scan to fail only on new findings (absent from the baseline)
# so that a real secret introduced in a future commit would still be detected.
#
# SECRETS_SCAN_GITLEAKS_IMAGE_TAG sets the tag of the zricethezav/gitleaks
# image used by the docker fallback. Default is 'latest'.
#
# Option -u, --update-baseline (re)generates the baseline file from the
# findings currently present in the repo, instead of scanning against it. ALWAYS
# review the diff before committing it: this accepts silently everything
# present at run time, including any real secret lying around.
set -u

mode='scan'

usage() {
	echo "Usage: ${0##*/} [-u|--update-baseline]"
}

while [ "$#" -gt 0 ]; do
	arg="$1"
	case "${arg}" in
		-h|--help)
			usage
			exit 0
			;;
		-u|--update-baseline)
			mode='update-baseline'
			;;
		--)
			;;
		*)
			usage >&2
			exit 1
			;;
	esac
	shift
done

current_dir="${0%/*}"
[ "${current_dir}" = "$0" ] && current_dir='.'
repo_dir="$(CDPATH= cd -- "${current_dir}/.." && pwd)"

baseline_path="${SECRETS_SCAN_BASELINE_PATH:-}"
[ -z "${baseline_path}" ] && baseline_path='.gitleaks-baseline.json'
has_baseline='false'
[ -f "${repo_dir}/${baseline_path}" ] && has_baseline='true'

gitleaks_image_tag="${SECRETS_SCAN_GITLEAKS_IMAGE_TAG:-}"
[ -z "${gitleaks_image_tag}" ] && gitleaks_image_tag='latest'

# Gitleaks arguments
if [ "${mode}" = 'update-baseline' ]; then
	host_args="--report-format json --report-path ${repo_dir}/${baseline_path}"
	container_args="--report-format json --report-path /repo/${baseline_path}"
elif [ "${has_baseline}" = 'true' ]; then
	host_args="--baseline-path ${repo_dir}/${baseline_path}"
	container_args="--baseline-path /repo/${baseline_path}"
else
	host_args=''
	container_args=''
fi

if command -v gitleaks >/dev/null 2>&1; then
	run_gitleaks() {
		gitleaks git "${repo_dir}" --no-banner ${host_args}
	}
elif command -v docker >/dev/null 2>&1; then
	docker_image="zricethezav/gitleaks:${gitleaks_image_tag}"
	if docker run --rm -v "${repo_dir}:/probe" --entrypoint sh "${docker_image}" -c 'test -d /probe/.git' >/dev/null 2>&1; then
		run_gitleaks() {
			docker run --rm \
				-e GIT_DISCOVERY_ACROSS_FILESYSTEM=1 \
				-v "${repo_dir}:/repo" \
				"${docker_image}" \
				git /repo --no-banner ${container_args}
		}
	else
		# Bind mount is not available, so we stream an archive of the repo
		# directory to the container and use it for the scan.
		if [ "${mode}" = 'update-baseline' ]; then
			run_gitleaks() {
				local container_id="$(
					docker create -i --entrypoint sh "${docker_image}" \
						-c "mkdir -p /repo && tar -xf - -C /repo && gitleaks git /repo --no-banner ${container_args}"
				)"
				[ -z "${container_id}" ] && return 2
				tar -cf - -C "${repo_dir}" . | docker start -ai "${container_id}"
				local gitleaks_rc=$?
				local gitleaks_baseline="$(mktemp)"
				[ "${gitleaks_rc}" -ge 2 ] && return "${gitleaks_rc}"
				docker cp "${container_id}:/repo/${baseline_path}" "${gitleaks_baseline}" > /dev/null 2>&1
				if [ $? -eq 0 ]; then
					mv "${gitleaks_baseline}" "${repo_dir}/${baseline_path}" > /dev/null 2>&1
				else
					rm -f "${gitleaks_baseline}" > /dev/null 2>&1
					gitleaks_rc=2
				fi
				docker rm -f "${container_id}" > /dev/null 2>&1
				return "${gitleaks_rc}"
			}
		else
			run_gitleaks() {
				tar -cf - -C "${repo_dir}" . \
				| docker run --rm -i \
					--entrypoint sh \
					"${docker_image}" \
					-c "mkdir -p /repo && tar -xf - -C /repo && gitleaks git /repo --no-banner ${container_args}"
			}
		fi
	fi
else
	echo '⚠️  Skipped scan: Neither Gitleaks nor Docker found on PATH' >&2
	exit 0
fi

echo 'Scanning for committed secrets in git repo history...'

echo ''
if [ "${mode}" = 'update-baseline' ]; then
	echo "📋 Regenerating gitleaks baseline at ${baseline_path}..."
else
	if [ "${has_baseline}" = 'true' ]; then
		echo "📋 Running gitleaks (baseline: ${baseline_path})..."
	else
		echo '📋 Running gitleaks (no baseline found)...'
	fi
fi
run_gitleaks
gitleaks_rc=$?

echo ''
if [ "${mode}" = 'update-baseline' ]; then
	if [ "${gitleaks_rc}" -ge 2 ] || [ ! -f "${repo_dir}/${baseline_path}" ]; then
		echo '❌ Baseline generation failed'
		exit 1
	fi
	echo "✅ Baseline written to ${baseline_path}"
	exit 0
fi
if [ "${gitleaks_rc}" -ne 0 ]; then
	echo '❌ New secrets found in git repo history'
else
	echo '✅ No new secrets found in git repo history'
fi
exit "${gitleaks_rc}"
