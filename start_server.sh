#!/bin/bash

# 获取脚本所在的绝对路径，确保无论在哪里运行，都能定位到项目根目录
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 进入项目目录
cd "$PROJECT_DIR"

echo "=================================================="
echo " Starting LocalForge Server..."
echo " Project Path: $PROJECT_DIR"
echo " URL: http://localhost:8000"
echo " Press Ctrl+C to stop"
echo "=================================================="

# 尝试打开默认浏览器 (macOS 使用 open 命令)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:8092"
fi

# 启动 Python 3 内置服务器
python3 -m http.server 8092
