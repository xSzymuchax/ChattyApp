#!/bin/sh
# script running services in container
set -eu

export AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://127.0.0.1:3001}"
export USER_SERVICE_URL="${USER_SERVICE_URL:-http://127.0.0.1:3002}"
export CHAT_SERVICE_URL="${CHAT_SERVICE_URL:-http://127.0.0.1:3003}"
export GAME_SERVICE_URL="${GAME_SERVICE_URL:-http://127.0.0.1:3004}"
export REALTIME_GATEWAY_URL="${REALTIME_GATEWAY_URL:-http://127.0.0.1:3300}"

public_port="${PORT:-3000}"
export PORT="$public_port"

pid_file=/tmp/service-pids
: > "$pid_file"

stop_all() {
    if [ -f "$pid_file" ]; then
        kill $(cat "$pid_file") 2>/dev/null || true
    fi
}

trap 'stop_all; exit 0' TERM INT

start() {
    service="$1"
    port="$2"
    shift 2
    echo "starting ${service} on ${port}"
    (
        cd "/app/${service}"
        export PORT="$port"
        while [ "$#" -gt 0 ]; do
            export "$1"
            shift
        done
        exec node src/server.js
    ) &
    echo $! >> "$pid_file"
}

db_host="${DATABASE_HOST:-localhost}"
db_port="${DATABASE_PORT:-5432}"

start auth-service 3001 \
    "DATABASE_HOST=${db_host}" \
    "DATABASE_PORT=${db_port}" \
    "DATABASE_NAME=${AUTH_DATABASE_NAME:-auth_db}" \
    "DATABASE_USER=${AUTH_DATABASE_USER:-auth_service}" \
    "DATABASE_PASSWORD=${AUTH_DATABASE_PASSWORD:-auth_service}"
start user-service 3002 \
    "DATABASE_HOST=${db_host}" \
    "DATABASE_PORT=${db_port}" \
    "DATABASE_NAME=${USER_DATABASE_NAME:-user_db}" \
    "DATABASE_USER=${USER_DATABASE_USER:-user_service}" \
    "DATABASE_PASSWORD=${USER_DATABASE_PASSWORD:-user_service}"
start chat-service 3003 \
    "DATABASE_HOST=${db_host}" \
    "DATABASE_PORT=${db_port}" \
    "DATABASE_NAME=${CHAT_DATABASE_NAME:-chat_db}" \
    "DATABASE_USER=${CHAT_DATABASE_USER:-chat_service}" \
    "DATABASE_PASSWORD=${CHAT_DATABASE_PASSWORD:-chat_service}"
start game-service 3004
start realtime-gateway 3300
start api-gateway 3000

echo "starting proxy on ${public_port}"
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile &
echo $! >> "$pid_file"

while true; do
    for pid in $(cat "$pid_file"); do
        if ! kill -0 "$pid" 2>/dev/null; then
            echo "process ${pid} stopped"
            stop_all
            exit 1
        fi
    done
    sleep 2
done
