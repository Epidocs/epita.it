# Load app config in GitHub Actions environment

load_value() {
	# Inputs:
	local var_name="$1"
	local fallback_github_vars="$2"
	local default_value="$3"

	# Outputs:
	# Write output to `var_value` and `var_value_source`

	local var_value_tmp=''

	# Load the variable value from CONFIG_PROD
	var_value_tmp=$(echo "${CONFIG_PROD}" | jq -rcM --arg var_name "${var_name}" '.[$var_name]')
	if [ -n "${var_value_tmp}" ] && [ "${var_value_tmp}" != "null" ]; then
		var_value="${var_value_tmp}"
		var_value_source='CONFIG_PROD'
		return 0
	fi

	# Load the variable value from GITHUB_VARS
	if [ "${fallback_github_vars}" == 'true' ]; then
		var_value_tmp=$(echo "${GITHUB_VARS}" | jq -rcM --arg var_name "${var_name}" '.[$var_name]')
		if [ -n "${var_value_tmp}" ] && [ "${var_value_tmp}" != "null" ]; then
			var_value="${var_value_tmp}"
			var_value_source='GITHUB_VARS'
			return 0
		fi
	fi

	# Fallback to default value
	if [ -n "${default_value}" ]; then
		var_value="${default_value}"
		var_value_source='DEFAULT'
		return 0
	fi

	# Variable not found
	var_value=''
	var_value_source='NOT_SET'
	return 0
}

load_var() {
	# Inputs:
	local var_name="$1"
	local fallback_github_vars="$2"
	local default_value="$3"

	if [ -z "${var_name}" ]; then
		echo "ERROR: Variable name is empty" >&2
		return 1
	fi

	local var_value=''
	local var_value_source=''
	load_value "${var_name}" "${fallback_github_vars}" "${default_value}"

	if [ ${var_value_source} == 'NOT_SET' ]; then
		echo "DEBUG: Variable ${var_name} is not set" >&2
	elif [ ${var_value_source} == 'DEFAULT' ]; then
		echo "DEBUG: Variable ${var_name} loaded from default value" >&2
	else
		echo "DEBUG: Variable ${var_name} loaded from '${var_value_source}'" >&2
	fi

	if [ -z "${var_value}" ]; then
		echo "DEBUG: Variable ${var_name} is empty" >&2
	fi

	# Export the variable to GitHub Actions environment
	if [ -n "${var_value}" ]; then
		echo "${var_value}" | sed 's/^ */::add-mask::/'
	fi
	echo "Set ${var_name} (secret)"
	echo "${var_name}<<GITHUB_ENV_EOF" >> "$GITHUB_ENV"
	echo "${var_value}" >> "$GITHUB_ENV"
	echo 'GITHUB_ENV_EOF' >> "$GITHUB_ENV"
}
