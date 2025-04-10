const ws = require('windows-shortcuts');
const path = require('path');

function setIcon() {
    const exePath = path.resolve(__dirname, '../dist/pixiv-downloader.exe');
    const shortcutPath = path.resolve(__dirname, '../dist/Pixiv画师作品下载器.lnk');
    const icoPath = path.resolve(__dirname, '../logo/logo.ico');

    ws.create(shortcutPath, {
        target: exePath,
        icon: icoPath,
        desc: 'Pixiv 画师作品下载器'
    }, function(err) {
        if (err) {
            console.error('创建快捷方式失败:', err);
        } else {
            console.log('快捷方式创建成功！');
        }
    });
}

setIcon(); 