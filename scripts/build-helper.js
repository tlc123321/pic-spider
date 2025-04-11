const fs = require('fs');
const path = require('path');
const instructions = require('../src/instructions');

function generateInstructions() {
  const distPath = path.join(__dirname, '../dist');
  
  // 确保dist目录存在
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  // 写入说明文件
  fs.writeFileSync(
    path.join(distPath, '使用说明.txt'),
    instructions,
    'utf8'
  );

  console.log('使用说明文件已生成');
}

generateInstructions(); 