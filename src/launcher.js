const { spawn } = require('child_process');
const path = require('path');

// 使用子进程运行主程序
const child = spawn('node', [path.join(__dirname, 'index.js')], {
    stdio: 'inherit',
    shell: true
});

child.on('error', (error) => {
    console.error('程序启动失败:', error);
    console.log('\n按 Enter 键退出...');
});

child.on('exit', (code) => {
    if (code !== 0) {
        console.log(`\n程序异常退出，退出码: ${code}`);
        console.log('\n按 Enter 键退出...');
    }
}); 