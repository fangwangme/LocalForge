#!/bin/bash

# 获取脚本所在的绝对路径，确保无论在哪里运行，都能定位到项目根目录
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="/usr/local/var/log"
LOG_FILE="$LOG_DIR/localforge.log"
PID_FILE="$PROJECT_DIR/.server.pid"
PORT=8092

# 确保日志目录存在
mkdir -p "$LOG_DIR" 2>/dev/null

start_server() {
    # 检查是否已经在运行
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Server is already running (PID: $(cat $PID_FILE))"
        return 1
    fi

    # 进入项目目录
    cd "$PROJECT_DIR"

    echo "=================================================="
    echo " Starting LocalForge Server..."
    echo " Project Path: $PROJECT_DIR"
    echo " URL: http://localhost:$PORT"
    echo " Log File: $LOG_FILE"
    echo "=================================================="

    # 使用 nohup 后台运行服务器
    nohup python -m http.server $PORT >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"

    echo "Server started with PID: $(cat $PID_FILE)"

    # 尝试打开默认浏览器 (macOS 使用 open 命令)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 1
        open "http://localhost:$PORT"
    fi
}

stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            echo "Stopping server (PID: $PID)..."
            kill $PID
            rm -f "$PID_FILE"
            echo "Server stopped."
        else
            echo "Server process not found. Cleaning up PID file."
            rm -f "$PID_FILE"
        fi
    else
        echo "Server is not running (no PID file found)."
    fi
}

status_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Server is running (PID: $(cat $PID_FILE))"
        echo "URL: http://localhost:$PORT"
        echo "Log: $LOG_FILE"
    else
        echo "Server is not running."
    fi
}

# 命令行参数处理
case "${1:-start}" in
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
        status_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
