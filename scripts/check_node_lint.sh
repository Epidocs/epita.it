#!/bin/sh
# Lint Node projects in the repo, via the package manager of each project
# (pnpm, yarn, npm).
#
# Usage: check_node_lint.sh [--fix] [dir...]        (from the repo root)
#
# With --fix (or -f), the `--fix` argument is passed to the lint script so that
# the linter applies its fixes, if it supports it.
#
# Directories to lint can be passed as command line arguments, or via the
# NODE_LINT_DIRS environment variable (one entry per line). Otherwise,
# NODE_LINT_DEFAULT_DIRS is used ('app' by default).
#
# NODE_LINT_SCRIPT sets the name of the package.json script to run. Default is
# 'lint'.
#
# Package managers are detected from lockfiles and used if installed in PATH.
# A preferred package manager can be specified in package.json via the
# `packageManager` field and will be used if it matches a lockfile present.
#
# Projects without a lockfile or without the lint script are ignored (no
# failure). Projects with a lockfile but without any installed package manager
# will fail with error (exit code 2). Projects with lint issues will fail with
# exit code 1.
set -u

dirs=''
fix='false'

usage() {
	echo "Usage: ${0##*/} [--fix] [dir...]"
}

after_dashdash='false'
while [ "$#" -gt 0 ]; do
	arg="$1"
	if [ "${after_dashdash}" = 'true' ]; then
		dirs="$(printf '%s\n%s' "${dirs}" "${arg}")"
		shift
		continue
	fi
	case "${arg}" in
		-h|--help)
			usage
			exit 0
			;;
		-f|--fix)
			fix='true'
			;;
		--)
			after_dashdash='true'
			;;
		-*)
			usage >&2
			exit 1
			;;
		*)
			dirs="$(printf '%s\n%s' "${dirs}" "${arg}")"
			;;
	esac
	shift
done

[ -z "$dirs" ] && dirs="${NODE_LINT_DIRS:-}"
[ -z "$dirs" ] && dirs="${NODE_LINT_DEFAULT_DIRS:-}"
[ -z "$dirs" ] && dirs='app'
if [ -z "$dirs" ]; then
	echo "No directories to lint" >&2
	exit 0
fi

lint_script="${NODE_LINT_SCRIPT:-}"
[ -z "${lint_script}" ] && lint_script='lint'

detect_package_manager() {
	local dir="$1"
	# Detect package manager candidates from available lockfiles
	local candidates=''
	[ -f "${dir}/pnpm-lock.yaml" ] && candidates="${candidates} pnpm"
	[ -f "${dir}/yarn.lock" ] && candidates="${candidates} yarn"
	{ [ -f "${dir}/package-lock.json" ] || [ -f "${dir}/npm-shrinkwrap.json" ]; } && candidates="$candidates npm"
	[ -z "${candidates}" ] && return 0
	# Get preferred package manager
	local pm_field="$(
		sed -n \
			's/.*"packageManager"[[:space:]]*:[[:space:]]*"\([a-z]*\)@.*/\1/p' \
			"${dir}/package.json" \
			2>/dev/null \
		| head -n 1
	)"
	# Return preferred package manager if detected
	if [ -n "${pm_field}" ] && echo "${candidates}" | grep -q " ${pm_field}"; then
		echo "${pm_field}"
		return 0
	fi
	# Otherwise, return first package manager candidate
	echo "${candidates# }" | cut -d' ' -f1
}

has_lint_script() {
	local dir="$1"
	grep -q "\"${lint_script}\"[[:space:]]*:" "${dir}/package.json" 2>/dev/null
}

run_lint() {
	local pm="$1"
	local dir="$2"
	if ! command -v "${pm}" >/dev/null 2>&1; then
		echo "⚠️  ${pm} not found on PATH" >&2
		return 2
	fi
	if [ "${fix}" = 'true' ]; then
		# npm needs '--' to forward arguments to the script
		if [ "${pm}" = 'npm' ]; then
			(cd "${dir}" && npm run "${lint_script}" -- --fix)
		else
			(cd "${dir}" && "${pm}" run "${lint_script}" --fix)
		fi
	else
		(cd "${dir}" && "${pm}" run "${lint_script}")
	fi
	if [ "$?" -ne 0 ]; then
		return 1
	fi
}

linted=0
failed_lints=''
failed_configs=''

lint_dir() {
	local dir="$1"
	[ -z "${dir}" ] && return 0
	echo ''
	if [ ! -d "${dir}" ]; then
		echo "ℹ️  Skipping ${dir}: Directory not found"
		return 0
	fi
	if [ ! -f "${dir}/package.json" ]; then
		echo "ℹ️  Skipping ${dir}: No package.json in directory"
		return 0
	fi
	if ! has_lint_script "${dir}"; then
		echo "ℹ️  Skipping ${dir}: No '${lint_script}' script in package.json"
		return 0
	fi
	local pm="$(detect_package_manager "${dir}")"
	if [ -z "${pm}" ]; then
		echo "ℹ️  Skipping ${dir}: No lockfile found in directory"
		return 0
	fi
	if [ "${fix}" = 'true' ]; then
		echo "📋 Running ${pm} run ${lint_script} --fix for ${dir}..."
	else
		echo "📋 Running ${pm} run ${lint_script} for ${dir}..."
	fi
	linted=$((linted + 1))
	run_lint "${pm}" "${dir}"
	local lint_rc="$?"
	if [ "${lint_rc}" -eq 2 ]; then
		failed_configs="$(printf '%s\n%s' "${failed_configs}" "${dir}")"
	elif [ "${lint_rc}" -eq 1 ]; then
		failed_lints="$(printf '%s\n%s' "${failed_lints}" "${dir}")"
	fi
}

nb_dirs="$(printf '%s\n' "$dirs" | grep -c .)"
if [ "${nb_dirs}" -eq 0 ]; then
	echo 'ℹ️  No Node projects to lint (NODE_LINT_DIRS is empty)'
	exit 0
fi
if [ "${nb_dirs}" -eq 1 ]; then
	echo "Linting 1 Node project (script '${lint_script}')..."
else
	echo "Linting ${nb_dirs} Node projects (script '${lint_script}')..."
fi

while IFS= read -r dir; do
	lint_dir "${dir}"
done <<EOF
$dirs
EOF

echo ''
if [ -n "${failed_configs}" ]; then
	nb_failed_configs="$(printf '%s\n' "${failed_configs}" | grep -c .)"
	echo "❌ ${nb_failed_configs} project(s) with errors:"
	printf '%s\n' "${failed_configs}" | while IFS= read -r dir; do
		[ -z "${dir}" ] && continue
		echo "  - ${dir}"
	done
	exit 2
fi
if [ -n "${failed_lints}" ]; then
	nb_failed_lints="$(printf '%s\n' "${failed_lints}" | grep -c .)"
	echo "❌ ${nb_failed_lints} project(s) with lint issues:"
	printf '%s\n' "${failed_lints}" | while IFS= read -r dir; do
		[ -z "${dir}" ] && continue
		echo "  - ${dir}"
	done
	exit 1
fi
if [ "$linted" -eq 0 ]; then
	echo "ℹ️  No Node projects linted"
	exit 0
fi
echo "✅ Node lint passed on ${linted} project(s) (script '${lint_script}')"
