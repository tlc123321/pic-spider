module.exports = {
    // 代理设置
    proxy: {
        host: '127.0.0.1',  // 代理服务器地址
        port: 7890          // 代理服务器端口
    },

    // Pixiv 登录信息
    pixiv: {
        // 从浏览器 Cookie 中获取的 PHPSESSID
        // 获取方法：
        // 1. 打开浏览器访问 pixiv.net 并登录
        // 2. 按 F12 打开开发者工具
        // 3. 在 Network 标签页中找到任意请求
        // 4. 在请求头中找到 Cookie
        // 5. 从 Cookie 中找到 PHPSESSID 的值
        PHPSESSID: '你的PHPSESSID',
        
        // 要下载的画师ID
        // 可以从画师主页URL中获取
        // 例如：https://www.pixiv.net/users/12345678
        artistId: '要下载的画师ID'
    },

    // 下载设置
    download: {
        // 下载间隔时间(毫秒)
        interval: 2000,
        
        // 下载目录（相对于项目根目录）
        directory: 'downloads'
    }
}; 