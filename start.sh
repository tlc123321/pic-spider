#!/bin/bash
echo "正在启动 Pixiv 下载器..."
cd "$(dirname "$0")"
npm start
read -p "按回车键退出..." 