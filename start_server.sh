#!/bin/bash

# Configuration
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_DIR="$PROJECT_DIR/data"
PROD_PID="$PROJECT_DIR/.server.pid"
DEBUG_PID="$PROJECT_DIR/.server.debug.pid"
PROD_LOG="/dev/null"
DEBUG_LOG="$DATA_DIR/debug.log"

PROD_PORT=8092
DEBUG_PORT=8093

# Default State
TARGET_MODE="prod" # prod | debug
ACTION="start"     # start | stop | restart | status

# Helper: Print Usage
usage() {
    echo "Usage: $0 [action] [options]"
    echo ""
    echo "Actions:"
    echo "  start       Start the server (default)"
    echo "  stop        Stop the server"
    echo "  restart     Restart the server"
    echo "  status      Check server status"
    echo ""
    echo "Options:"
    echo "  --debug, -d   Target the Debug Instance (Port $DEBUG_PORT)"
    echo "  --help, -h    Show this message"
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
        --debug|-d)
            TARGET_MODE="debug"
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

# 2. Setup Context based on Mode
if [ "$TARGET_MODE" == "debug" ]; then
    PID_FILE="$DEBUG_PID"
    LOG_FILE="$DEBUG_LOG"
    PORT=$DEBUG_PORT
    MODE_LABEL="DEBUG"
    # Ensure Data Dir exists for debug logs
    if [ ! -d "$DATA_DIR" ]; then
        mkdir -p "$DATA_DIR"
    fi
else
    PID_FILE="$PROD_PID"
    LOG_FILE="$PROD_LOG"
    PORT=$PROD_PORT
    MODE_LABEL="PRODUCTION"
    # Data dir check is good practice anyway
    if [ ! -d "$DATA_DIR" ]; then
        mkdir -p "$DATA_DIR"
    fi
fi

# 3. Actions
start_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "⚠️  $MODE_LABEL Server is already running (PID: $(cat "$PID_FILE"), Port: $PORT)"
        return 0
    fi

    echo "🚀 Starting LocalForge ($MODE_LABEL)..."
    cd "$PROJECT_DIR"
    
    nohup python3 -m http.server $PORT >> "$LOG_FILE" 2>&1 &
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
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if kill -0 $OLD_PID 2>/dev/null; then
            echo "🛑 Stopping $MODE_LABEL Server (PID: $OLD_PID)..."
            kill $OLD_PID
            rm -f "$PID_FILE"
            echo "   ✅ Stopped."
        else
            echo "⚠️  Process $OLD_PID not found. Cleaning up stale PID file."
            rm -f "$PID_FILE"
        fi
    else
        echo "ℹ️  $MODE_LABEL Server is not running."
    fi
}

check_status() {
    # Check Prod
    echo "--- Server Status ---"
    if [ -f "$PROD_PID" ] && kill -0 $(cat "$PROD_PID") 2>/dev/null; then
        echo "✅ PRODUCTION: Running (PID: $(cat "$PROD_PID"), Port: $PROD_PORT)"
    else
        echo "⚪ PRODUCTION: Stopped"
    fi

    # Check Debug
    if [ -f "$DEBUG_PID" ] && kill -0 $(cat "$DEBUG_PID") 2>/dev/null; then
        echo "✅ DEBUG:      Running (PID: $(cat "$DEBUG_PID"), Port: $DEBUG_PORT)"
    else
        echo "⚪ DEBUG:      Stopped"
    fi
    echo "---------------------"
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
