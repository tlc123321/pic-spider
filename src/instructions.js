const instructions = `Pixiv 画师作品下载器使用说明
==========================

一、软件介绍
-----------
本软件用于批量下载 Pixiv 画师的所有作品。

二、快速开始
-----------
1. 双击"Pixiv画师作品下载器"快捷方式运行程序（请不要直接运行 exe 文件）
2. 在弹出的窗口中输入画师ID
3. 选择是否需要使用代理
4. 如果选择使用代理，输入代理地址（如：http://127.0.0.1:7890）
5. 程序会自动创建 downloads 文件夹并下载该画师的所有作品

三、获取画师ID的方法
-----------------
1. 打开想要下载的画师主页
2. 查看浏览器地址栏
3. 地址类似：https://www.pixiv.net/users/12345678
4. 其中的数字 12345678 就是画师ID

四、代理设置说明
-------------
1. 如果无法直接访问 Pixiv，请选择使用代理
2. 常见的代理地址格式：
   - HTTP代理：http://127.0.0.1:7890
   - SOCKS代理：socks5://127.0.0.1:7890
3. 端口号根据你的代理软件设置可能不同

五、下载说明
----------
- 下载的图片会保存在程序目录下的 downloads 文件夹中
- 每个画师的作品会保存在以其 ID 命名的子文件夹中
- 如果下载中断，再次运行时会自动跳过已下载的图片
- 下载时会显示进度信息

六、常见问题
----------
1. 闪退问题：
   - 请使用快捷方式启动程序
   - 确保已正确安装代理软件（如果需要）

2. 下载失败：
   - 检查代理是否正常运行
   - 确认网络连接是否正常
   - 检查画师ID是否正确

3. 中文乱码：
   - 使用记事本打开此文件时显示乱码，请使用 VS Code 等编辑器打开

4. 粘贴问题：
   - 使用 Ctrl+V 粘贴
   - 或右键点击窗口标题栏 > 编辑 > 粘贴
   - 或右键单击终端窗口（需要启用快速编辑模式）

七、注意事项
----------
1. 下载的图片仅供个人使用
2. 请遵守 Pixiv 的使用条款
3. 建议不要设置过短的下载间隔，以免被限制
4. 如果下载中断，可以重新运行程序继续下载

八、关于作者
----------
灌注b站是超超捏喵
灌注b站是超超捏谢谢喵

九、免责声明
----------
本软件仅供学习交流使用，请勿用于商业用途。
使用本软件所造成的任何问题由使用者自行承担。

如有问题或建议，欢迎反馈！`;

module.exports = instructions; 