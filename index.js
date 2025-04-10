const fs = require('fs');
const path = require('path');

const download = async () => {
  try {
    console.log('开始下载...');
    
    // 创建日志文件
    const logPath = path.join(__dirname, 'download_log.txt');
    const logStream = fs.createWriteStream(logPath, { flags: 'a' });
    
    // 重定向console.log和console.error到文件
    const log = (message) => {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}\n`;
      console.log(message);
      logStream.write(logMessage);
    };

    // 验证输入
    if (!phpsessid || !userId || !downloadPath) {
      log('请确保所有必填信息都已填写！');
      await waitForEnter();
      return;
    }

    // 创建下载目录
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }

    const options = {
      headers: {
        'Cookie': `PHPSESSID=${phpsessid}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    if (useProxy) {
      log(`使用代理地址: ${proxyAddress}`);
      const httpsAgent = new HttpsProxyAgent(proxyAddress);
      options.agent = httpsAgent;
    }

    log('正在获取作品列表...');
    const response = await axios.get(`https://www.pixiv.net/ajax/user/${userId}/profile/all`, options);
    
    if (!response.data.body.illusts) {
      log('未找到任何作品，请检查用户ID是否正确！');
      await waitForEnter();
      return;
    }

    const illustIds = Object.keys(response.data.body.illusts);
    log(`找到 ${illustIds.length} 个作品`);

    for (const illustId of illustIds) {
      try {
        log(`正在处理作品 ${illustId}...`);
        const illustResponse = await axios.get(`https://www.pixiv.net/ajax/illust/${illustId}`, options);
        const illustData = illustResponse.data.body;
        
        const imageUrl = illustData.urls.original;
        const fileName = path.basename(imageUrl);
        const filePath = path.join(downloadPath, fileName);

        if (fs.existsSync(filePath)) {
          log(`文件已存在，跳过: ${fileName}`);
          continue;
        }

        log(`下载中: ${fileName}`);
        const imageResponse = await axios.get(imageUrl, {
          ...options,
          responseType: 'stream',
          headers: {
            ...options.headers,
            'Referer': 'https://www.pixiv.net/'
          }
        });

        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(filePath);
          imageResponse.data.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        log(`下载完成: ${fileName}`);
        // 添加延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        log(`下载作品 ${illustId} 时出错:`, error.message);
        continue; // 继续下载下一个作品
      }
    }

    log('所有作品下载完成！');
    await waitForEnter();
    
  } catch (error) {
    const errorMessage = `发生错误: ${error.message}\n详细错误信息: ${error.stack}`;
    console.error(errorMessage);
    fs.appendFileSync(path.join(__dirname, 'error_log.txt'), errorMessage);
    await waitForEnter();
  } finally {
    if (logStream) {
      logStream.end();
    }
  }
};

// 添加等待用户输入的函数
function waitForEnter() {
  console.log('\n按 Enter 键继续...');
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });
}

// 在主程序最后添加错误处理
process.on('unhandledRejection', (error) => {
  const errorMessage = `未处理的Promise错误: ${error.message}\n${error.stack}`;
  console.error(errorMessage);
  fs.appendFileSync(path.join(__dirname, 'error_log.txt'), errorMessage);
}); 