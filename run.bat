@echo off
REM 设置代码页为 UTF-8
chcp 65001 > nul
REM 设置标题（使用英文）
title Pixiv Downloader
REM 切换到脚本所在目录
cd /d "%~dp0"
echo 正在启动 Pixiv 画师作品下载器...
pixiv-downloader.exe
if errorlevel 1 (
    echo 程序执行失败！
    pause
    exit /b 1
)
pause 