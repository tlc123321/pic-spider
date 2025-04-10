process.title = 'Pixiv Downloader';  // 设置进程标题为英文

// 设置终端编码
process.stdout.setEncoding('utf8');
// 设置命令行编码
if (process.platform === 'win32') {
    try {
        require('child_process').execSync('chcp 65001', { stdio: 'ignore' });
    } catch (e) {
        // 忽略错误
    }
}

// 启用原生的 Windows 控制台输入
if (process.platform === 'win32') {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.close();
}

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');

// 全局变量
let downloadDir;
let httpsAgent;
let pixivApi;
let config;

// 下载统计
const stats = {
    total: 0,
    success: 0,
    failed: 0,
    remaining: 0
};

// 清屏并显示广告
console.clear();
console.log('\x1b[36m----------------------------------------\x1b[0m');
console.log('\x1b[36m|        灌注b站是超超捏喵             |\x1b[0m');
console.log('\x1b[36m|      灌注b站是超超捏谢谢喵           |\x1b[0m');
console.log('\x1b[36m----------------------------------------\x1b[0m\n');

// 显示版本信息
console.log('Pixiv 画师作品下载器 v1.0.0');
console.log('请按提示输入以下信息：\n');

// 获取用户配置
async function getUserConfig() {
    const questions = [
        {
            type: 'text',
            name: 'proxyPort',
            message: '代理端口（默认：7890）：',
            initial: '7890',
            onRender() {
                // 防止 prompts 清屏
                this.firstRender = false;
            }
        },
        {
            type: 'text',
            name: 'PHPSESSID',
            message: 'PHPSESSID（从浏览器Cookie获取）：',
            validate: value => value.length > 0 ? true : '请输入有效的PHPSESSID'
        },
        {
            type: 'text',
            name: 'artistId',
            message: '画师ID：',
            validate: value => /^\d+$/.test(value) ? true : '请输入有效的画师ID（纯数字）'
        },
        {
            type: 'number',
            name: 'interval',
            message: '下载间隔（毫秒，默认：2000）：',
            initial: 2000
        },
        {
            type: 'text',
            name: 'downloadPath',
            message: '下载目录（默认：当前目录下的downloads）：',
            initial: 'downloads'
        },
        {
            type: 'confirm',
            name: 'useProxy',
            message: '是否使用代理？',
            initial: true
        },
        {
            type: 'text',
            name: 'proxyUrl',
            message: '请输入代理地址（如：http://127.0.0.1:7890）：',
            when: answers => answers.useProxy
        }
    ];

    const response = await prompts(questions, {
        onCancel: () => {
            return false;
        },
        // 使用原生输入输出
        stdin: process.stdin,
        stdout: process.stdout
    });
    
    // 如果用户取消了输入，返回null
    if (!response.proxyPort || !response.PHPSESSID || !response.artistId) {
        return null;
    }

    return {
        proxy: {
            host: '127.0.0.1',
            port: parseInt(response.proxyPort)
        },
        pixiv: {
            PHPSESSID: response.PHPSESSID,
            artistId: response.artistId
        },
        download: {
            interval: response.interval,
            directory: response.downloadPath
        },
        useProxy: response.useProxy,
        proxyUrl: response.proxyUrl
    };
}

// 更新并显示下载进度
function showProgress() {
    process.stdout.write('\x1b[2J\x1b[0f');  // 清屏
    console.log('下载进度：');
    console.log(`总数: ${stats.total}`);
    console.log(`成功: ${stats.success}`);
    console.log(`失败: ${stats.failed}`);
    console.log(`剩余: ${stats.remaining}`);
    console.log('------------------------');
}

// 下载图片函数
async function downloadImage(url, filepath, proxyUrl) {
    try {
        const options = {
            responseType: 'stream',
            headers: {
                'Referer': 'https://www.pixiv.net/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            httpsAgent: proxyUrl ? new HttpsProxyAgent(proxyUrl) : new https.Agent({
                rejectUnauthorized: false
            }),
            timeout: 30000,
            maxRedirects: 5
        };

        const response = await axios.get(url, options);
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                stats.success++;
                stats.remaining--;
                showProgress();
                resolve();
            });
            writer.on('error', (err) => {
                stats.failed++;
                stats.remaining--;
                showProgress();
                reject(err);
            });
        });
    } catch (error) {
        stats.failed++;
        stats.remaining--;
        showProgress();
        console.error(`下载失败: ${url} - ${error.message}`);
        throw error;
    }
}

// 获取用户作品列表
async function getUserIllusts(userId, proxyUrl, PHPSESSID) {
    const pixivApi = axios.create({
        baseURL: 'https://www.pixiv.net/ajax',
        headers: {
            'Referer': 'https://www.pixiv.net/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Cookie': `PHPSESSID=${encodeURIComponent(PHPSESSID)}; lang=zh`
        },
        httpsAgent: proxyUrl ? new HttpsProxyAgent(proxyUrl) : new https.Agent({
            rejectUnauthorized: false,
            keepAlive: true
        }),
        timeout: 30000,
        maxRetries: 3,
        retryDelay: 1000
    });

    try {
        const response = await pixivApi.get(`/user/${userId}/profile/all`);
        if (!response.data.body.illusts) {
            return [];
        }

        const illustIds = Object.keys(response.data.body.illusts);
        console.log(`找到 ${illustIds.length} 个作品ID`);
        stats.total = illustIds.length;
        stats.remaining = illustIds.length;
        showProgress();

        const illusts = [];
        for (let i = 0; i < illustIds.length; i++) {
            const id = illustIds[i];
            console.log(`正在获取作品详情 (${i + 1}/${illustIds.length}): ${id}`);
            try {
                const details = await pixivApi.get(`/illust/${id}`);
                illusts.push(details.data.body);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`获取作品详情失败: ${id}`, error.message);
                continue;
            }
        }

        return illusts;
    } catch (error) {
        console.error('获取作品列表失败:', error.message);
        throw error;
    }
}

// 获取用户信息
async function getUserInfo(userId, proxyUrl, PHPSESSID) {
    const pixivApi = axios.create({
        baseURL: 'https://www.pixiv.net/ajax',
        headers: {
            'Referer': 'https://www.pixiv.net/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Cookie': `PHPSESSID=${encodeURIComponent(PHPSESSID)}; lang=zh`
        },
        httpsAgent: proxyUrl ? new HttpsProxyAgent(proxyUrl) : new https.Agent({
            rejectUnauthorized: false,
            keepAlive: true
        })
    });

    try {
        const response = await pixivApi.get(`/user/${userId}`);
        if (!response.data.body) {
            throw new Error('获取用户信息失败');
        }
        return response.data.body;
    } catch (error) {
        console.error('获取用户信息失败:', error.message);
        // 返回一个默认的用户信息
        return {
            name: userId
        };
    }
}

async function waitForExit() {
    console.log('\n按 Enter 键退出...');
    return new Promise(resolve => {
        process.stdin.resume();
        process.stdin.on('data', () => {
            process.stdin.pause();
            resolve();
        });
    });
}

async function main() {
    try {
        // 获取用户配置
        config = await getUserConfig();
        if (!config) {
            throw new Error('用户取消了操作');
        }

        // 创建下载目录
        downloadDir = path.resolve(process.cwd(), config.download.directory);
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        const userId = config.pixiv.artistId;
        const PROXY = config.useProxy ? config.proxyUrl : null;
        const PHPSESSID = config.pixiv.PHPSESSID;

        // 获取作者信息
        console.log('正在获取作者信息...');
        const userInfo = await getUserInfo(userId, PROXY, PHPSESSID);
        const artistName = userInfo.name.replace(/[<>:"/\\|?*]/g, '_');
        
        // 创建用户目录
        const userDir = path.join(downloadDir, `${artistName}_${userId}`);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir);
        }

        console.log('正在获取作品列表...');
        const illusts = await getUserIllusts(userId, PROXY, PHPSESSID);
        
        // 初始化统计数据
        stats.total = illusts.length;
        stats.remaining = illusts.length;
        stats.success = 0;
        stats.failed = 0;
        
        showProgress();

        for (let i = 0; i < illusts.length; i++) {
            const illust = illusts[i];
            const imageUrl = illust.urls.original;
            const safeTitle = illust.title.replace(/[<>:"/\\|?*]/g, '_');
            const filename = `${illust.id}_${safeTitle}.jpg`;
            const filepath = path.join(userDir, filename);

            console.log(`\n开始下载 (${i + 1}/${illusts.length}): ${filename}`);

            // 检查文件是否已存在
            if (fs.existsSync(filepath)) {
                console.log(`文件已存在，跳过: ${filename}`);
                stats.success++;
                stats.remaining--;
                showProgress();
                continue;
            }

            try {
                await downloadImage(imageUrl, filepath, PROXY);
                console.log(`下载成功: ${filename}`);
                await new Promise(resolve => setTimeout(resolve, config.download.interval));
            } catch (error) {
                console.error(`下载失败: ${filename}`, error.message);
                continue;
            }
        }

        console.log('\n下载完成统计：');
        console.log(`作者: ${artistName}`);
        console.log(`总数: ${stats.total}`);
        console.log(`成功: ${stats.success}`);
        console.log(`失败: ${stats.failed}`);
        
        if (stats.failed > 0) {
            console.log('\n注意：有部分文件下载失败，请检查日志并重试。');
        }
    } catch (error) {
        console.error('程序执行失败:', error.message);
        await waitForExit();
    }
}

// 错误处理
process.on('uncaughtException', async (error) => {
    console.error('\n发生未处理的错误:', error);
    try {
        await waitForExit();
    } catch (e) {
        console.error('\n等待退出时发生错误:', e);
    }
    process.exit(1);
});

process.on('unhandledRejection', async (error) => {
    console.error('\n发生未处理的 Promise 拒绝:', error);
    try {
        await waitForExit();
    } catch (e) {
        console.error('\n等待退出时发生错误:', e);
    }
    process.exit(1);
});

// 启动程序
main().catch(async error => {
    console.error('\n程序执行失败:', error);
    try {
        await waitForExit();
    } catch (e) {
        console.error('\n等待退出时发生错误:', e);
    }
    process.exit(1);
}); 