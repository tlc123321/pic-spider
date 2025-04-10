const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function convertToIco() {
    try {
        // 读取原始 jpg 图片
        const inputPath = path.join(__dirname, '../logo/logo.jpg');
        const pngPath = path.join(__dirname, '../logo/temp.png');
        const outputPath = path.join(__dirname, '../logo/logo.ico');

        // 先转换为 PNG
        await sharp(inputPath)
            .resize(256, 256)
            .png()
            .toFile(pngPath);

        // 将 PNG 转换为 ICO
        const buf = await pngToIco(pngPath);
        fs.writeFileSync(outputPath, buf);

        // 清理临时文件
        fs.unlinkSync(pngPath);

        console.log('图标转换成功！');
    } catch (error) {
        console.error('图标转换失败:', error);
        console.error('错误详情:', error.message);
    }
}

convertToIco(); 