#!/bin/bash
# Production smoke checks for the public frontend and API domains.

set -euo pipefail

: "${DOMAIN:?Need DOMAIN, for example www.linany.com}"
: "${API_DOMAIN:?Need API_DOMAIN, for example api.linany.com}"

FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-https://${DOMAIN}}"
API_ORIGIN="${API_ORIGIN:-https://${API_DOMAIN}}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_status() {
    local name=$1
    local url=$2
    local expected=$3
    local status

    status="$(curl -k -s -o /dev/null -w '%{http_code}' "$url")"
    if [ "$status" != "$expected" ]; then
        log_error "$name expected HTTP $expected but got $status: $url"
        return 1
    fi

    log_info "$name OK ($status): $url"
}

check_redirect() {
    local name=$1
    local url=$2
    local expected_status=$3
    local expected_location=$4
    local result
    local status
    local redirect_url

    result="$(curl -k -s -o /dev/null -w '%{http_code} %{redirect_url}' "$url")"
    status="${result%% *}"
    redirect_url="${result#* }"

    if [ "$status" != "$expected_status" ] || [ "$redirect_url" != "$expected_location" ]; then
        log_error "$name expected '$expected_status $expected_location' but got '$status $redirect_url'"
        return 1
    fi

    log_info "$name OK ($status -> $redirect_url)"
}

check_cors() {
    local url="${API_ORIGIN}/api/v1/health"
    local header

    header="$(curl -k -s -D - -o /dev/null -H "Origin: ${FRONTEND_ORIGIN}" "$url" | tr -d '\r' | awk 'BEGIN{IGNORECASE=1} /^access-control-allow-origin:/ {print $2; exit}')"

    if [ "$header" != "$FRONTEND_ORIGIN" ]; then
        log_error "CORS expected access-control-allow-origin: ${FRONTEND_ORIGIN}, got: ${header:-<missing>}"
        return 1
    fi

    log_info "CORS OK (${header})"
}

main() {
    log_info "Running production smoke checks"
    log_info "Frontend: ${FRONTEND_ORIGIN}"
    log_info "API: ${API_ORIGIN}"

    check_status "Frontend health" "${FRONTEND_ORIGIN}/health" "200"
    check_status "API health" "${API_ORIGIN}/api/v1/health" "200"
    check_redirect "Legacy main-domain API redirect" "${FRONTEND_ORIGIN}/api/v1/health" "308" "${API_ORIGIN}/api/v1/health"
    check_status "Install script" "${FRONTEND_ORIGIN}/install-cn.ps1" "200"
    check_cors

    log_info "Production smoke checks passed"
}

main "$@"
