#!/bin/sh
# Audit known vulnerabilities on Node projects in the repo, via the package
# manager of each project (pnpm, yarn, npm).
#
# Usage: check_node_audit.sh [dir...]        (from the repo root)
#
# Directories to audit can be passed as command line arguments, or via the
# NODE_AUDIT_DIRS environment variable (one entry per line). Otherwise,
# NODE_AUDIT_DEFAULT_DIRS is used ('app' by default).
#
# NODE_AUDIT_LEVEL sets the minimum severity threshold that fails the scan
# (info, low, moderate, high, critical). Default is 'high'.
#
# Package managers are detected from lockfiles and used if installed in PATH.
# A preferred package manager can be specified in package.json via the
# `packageManager` field and will be used if it matches a lockfile present.
#
# Projects without a lockfile are ignored (no failure). Projects with a lockfile
# but without any installed package manager will fail with error (exit code 2).
# Projects with vulnerabilities above the threshold will fail with exit code 1.
set -u

dirs=''

usage() {
	echo "Usage: ${0##*/} [dir...]"
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

[ -z "$dirs" ] && dirs="${NODE_AUDIT_DIRS:-}"
[ -z "$dirs" ] && dirs="${NODE_AUDIT_DEFAULT_DIRS:-}"
[ -z "$dirs" ] && dirs='app'
if [ -z "$dirs" ]; then
	echo "No directories to audit" >&2
	exit 0
fi

audit_level="${NODE_AUDIT_LEVEL:-}"
if [ -z "${audit_level}" ]; then
	audit_level='high'
fi
case "${audit_level}" in
	info|low|moderate|high|critical) ;;
	*)
		echo "Invalid NODE_AUDIT_LEVEL '$audit_level' (expected info|low|moderate|high|critical)" >&2
		exit 1
		;;
esac

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

run_audit() {
	local pm="$1"
	local dir="$2"
	case "${pm}" in
		npm)
			if ! command -v npm >/dev/null 2>&1; then
				echo "⚠️  npm not found on PATH" >&2
				return 2
			fi
			(cd "${dir}" && npm audit --audit-level="${audit_level}")
			;;
		pnpm)
			if ! command -v pnpm >/dev/null 2>&1; then
				echo "⚠️  pnpm not found on PATH" >&2
				return 2
			fi
			(cd "${dir}" && pnpm audit --audit-level="${audit_level}")
			;;
		yarn)
			if ! command -v yarn >/dev/null 2>&1; then
				echo "⚠️  yarn not found on PATH" >&2
				return 2
			fi
			run_yarn_audit "${dir}"
			;;
	esac
	if [ "$?" -ne 0 ]; then
		return 1
	fi
}

run_yarn_audit() {
	local dir="$1"
	local yarn_legacy='false'
	case "$(cd "${dir}" && yarn --version 2> /dev/null)" in
		1.*) yarn_legacy='true' ;;
	esac
	if [ "${yarn_legacy}" = 'true' ]; then
		# Yarn 1.x (classic)
		# Exit code is a bitmask of severities found we filter ourselves
		(cd "${dir}" && yarn audit --level "${audit_level}")
		local yarn_rc=$?
		[ "$yarn_rc" -eq 0 ] && return 0
		local yarn_mask=0
		case "${audit_level}" in
			info) yarn_mask=31 ;; # Bits 0-4
			low) yarn_mask=30 ;; # Bits 1-4
			moderate) yarn_mask=28 ;; # Bits 2-4
			high) yarn_mask=24 ;; # Bits 3-4
			critical) yarn_mask=16 ;; # Bit 4
		esac
		if [ "$((yarn_rc & yarn_mask))" -ne 0 ]; then
			return 1
		fi
		return 0
	fi
	# Yarn 2+ (berry)
	(cd "${dir}" && yarn npm audit --severity "${audit_level}")
}

audited=0
failed_audits=''
failed_configs=''

audit_dir() {
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
	local pm="$(detect_package_manager "${dir}")"
	if [ -z "${pm}" ]; then
		echo "ℹ️  Skipping ${dir}: No lockfile found in directory"
		return 0
	fi
	echo "📋 Running ${pm} audit for ${dir}..."
	audited=$((audited + 1))
	run_audit "${pm}" "${dir}"
	local audit_rc="$?"
	if [ "${audit_rc}" -eq 2 ]; then
		failed_configs="$(printf '%s\n%s' "${failed_configs}" "${dir}")"
	elif [ "${audit_rc}" -eq 1 ]; then
		failed_audits="$(printf '%s\n%s' "${failed_audits}" "${dir}")"
	fi
}

nb_dirs="$(printf '%s\n' "$dirs" | grep -c .)"
if [ "${nb_dirs}" -eq 0 ]; then
	echo 'ℹ️  No Node projects to audit (NODE_AUDIT_DIRS is empty)'
	exit 0
fi
if [ "${nb_dirs}" -eq 1 ]; then
	echo "Auditing 1 Node project (level '${audit_level}')..."
else
	echo "Auditing ${nb_dirs} Node projects (level '${audit_level}')..."
fi

while IFS= read -r dir; do
	audit_dir "${dir}"
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
if [ -n "${failed_audits}" ]; then
	nb_failed_audits="$(printf '%s\n' "${failed_audits}" | grep -c .)"
	echo "❌ ${nb_failed_audits} project(s) with vulnerabilities (>= ${audit_level}):"
	printf '%s\n' "${failed_audits}" | while IFS= read -r dir; do
		[ -z "${dir}" ] && continue
		echo "  - ${dir}"
	done
	exit 1
fi
if [ "$audited" -eq 0 ]; then
	echo "ℹ️  No Node projects audited"
	exit 0
fi
echo "✅ Node audit passed on ${audited} project(s) (level '${audit_level}')"
