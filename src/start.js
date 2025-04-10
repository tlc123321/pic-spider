#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');

try {
    console.log('正在启动 Pixiv 画师作品下载器...\n');
    execSync('node ' + path.join(__dirname, 'index.js'), { stdio: 'inherit' });
} catch (error) {
    console.error('程序执行失败:', error.message);
    console.log('\n按 Enter 键退出...');
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
} 