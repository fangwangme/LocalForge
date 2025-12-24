#!/bin/bash

# Configuration
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_DIR="$PROJECT_DIR/data"
PID_FILE="$PROJECT_DIR/.server.pid"
LOG_FILE="$DATA_DIR/server.log"

# Auto-detect environment based on directory name
# LocalForge-dev -> DEV (port 8093)
# LocalForge     -> MAIN (port 8092)
DIR_NAME=$(basename "$PROJECT_DIR")
if [[ "$DIR_NAME" == *"-dev"* ]]; then
    ENV_MODE="DEV"
    PORT=8093
else
    ENV_MODE="MAIN"
    PORT=8092
fi

# Default State
ACTION="start"     # start | stop | restart | status

# Helper: Print Usage
usage() {
    echo "Usage: $0 [action]"
    echo ""
    echo "Actions:"
    echo "  start       Start the server (default)"
    echo "  stop        Stop the server"
    echo "  restart     Restart the server"
    echo "  status      Check server status"
    echo ""
    echo "Environment: $ENV_MODE (Port: $PORT)"
    echo ""
    exit 1
}

# 1. Parsing Arguments (Single Pass)
while [[ $# -gt 0 ]]; do
    case "$1" in
        start|stop|restart|status)
            ACTION="$1"
            shift
            ;;
        --help|-h)
            usage
            ;;
        *)
            echo "Unknown argument: $1"
            usage
            ;;
    esac
done

# 2. Setup Context
MODE_LABEL="$ENV_MODE"
if [ ! -d "$DATA_DIR" ]; then
    mkdir -p "$DATA_DIR"
fi

# 3. Actions
start_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "⚠️  $MODE_LABEL Server is already running (PID: $(cat "$PID_FILE"), Port: $PORT)"
        return 0
    fi

    echo "🚀 Starting LocalForge ($MODE_LABEL)..."
    cd "$PROJECT_DIR"
    
    # Using Python http.server as requested (Zero Dependency)
    nohup python -m http.server $PORT >> "$LOG_FILE" 2>&1 &
    
    NEW_PID=$!
    echo $NEW_PID > "$PID_FILE"
    
    echo "   • PID:  $NEW_PID"
    echo "   • Port: $PORT"
    echo "   • Log:  $LOG_FILE"
    echo "   • URL:  http://localhost:$PORT"

    # Only auto-open browser in Production mode on macOS
    if [ "$TARGET_MODE" == "prod" ] && [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 1
        open "http://localhost:$PORT"
    fi
}

stop_server() {
    echo "🛑 Stopping LocalForge ($MODE_LABEL)..."
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            echo "   ✅ Stopped Server (PID: $PID)"
        else
            echo "   ⚠️  PID file stale, cleaning up."
        fi
        rm -f "$PID_FILE"
    else
        echo "   ⚪ No server running."
    fi
}

check_status() {
    echo "--- $MODE_LABEL Server Status ---"
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "✅ Running (PID: $(cat "$PID_FILE"), Port: $PORT)"
        echo "   URL: http://localhost:$PORT"
    else
        echo "⚪ Stopped"
    fi
    echo "----------------------------"
}


# 4. Dispatch
case "$ACTION" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 1
        start_server
        ;;
    status)
        check_status
        ;;
esac
