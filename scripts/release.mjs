#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * 自动化发布脚本
 * 构建完成后自动复制文件到release文件夹并创建发布包
 */
async function createRelease() {
    console.log('📦 开始创建发布包...');
    
    const releaseDir = join(projectRoot, 'release');
    const pluginDir = join(releaseDir, 'SearchPlus');
    
    try {
        // 1. 清理并创建release目录
        console.log('🧹 清理旧的release文件夹...');
        await fs.rm(releaseDir, { recursive: true, force: true });
        await fs.mkdir(releaseDir, { recursive: true });
        await fs.mkdir(pluginDir, { recursive: true });
        
        // 2. 复制插件核心文件
        console.log('📋 复制插件文件...');
        const coreFiles = ['main.js', 'manifest.json', 'styles.css'];
        
        for (const file of coreFiles) {
            const srcPath = join(projectRoot, file);
            const destPath = join(pluginDir, file);
            await fs.copyFile(srcPath, destPath);
            console.log(`   ✅ 复制 ${file}`);
        }
        
        // 3. 创建插件README
        console.log('📝 创建插件使用说明...');
        const pluginReadme = await generatePluginReadme();
        await fs.writeFile(join(pluginDir, 'README.md'), pluginReadme);
        
        // 4. 创建安装指南
        console.log('📖 创建安装指南...');
        const installGuide = await generateInstallGuide();
        await fs.writeFile(join(releaseDir, 'INSTALL.md'), installGuide);
        
        // 5. 创建发布说明
        console.log('📄 创建发布说明...');
        const releaseNotes = await generateReleaseNotes();
        await fs.writeFile(join(releaseDir, 'RELEASE_NOTES.md'), releaseNotes);
        
        // 6. 读取版本信息
        const manifestPath = join(projectRoot, 'manifest.json');
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
        const version = manifest.version;
        
        console.log(`🎉 发布包创建完成！版本：v${version}`);
        console.log(`📁 发布路径：${releaseDir}`);
        console.log('');
        console.log('🚀 下一步：');
        console.log('   运行 npm run release:zip 创建压缩包');
        console.log('   或者直接分享 SearchPlus 文件夹');
        
    } catch (error) {
        console.error('❌ 发布包创建失败:', error.message);
        process.exit(1);
    }
}

async function generatePluginReadme() {
    return `# SearchPlus - 高级搜索插件

## 🚀 快速安装

1. 将整个 \`SearchPlus\` 文件夹复制到您的 Obsidian 插件目录：
   \`\`\`
   .obsidian/plugins/SearchPlus/
   \`\`\`

2. 在 Obsidian 中打开设置 → 第三方插件 → 启用 "SearchPlus"

3. 点击左侧功能区的筛选图标 🔍 开始使用！

## ✨ 主要功能

- **多维度搜索**：同时搜索标签、标题、内容
- **智能关系配置**：根据输入动态显示关系设置
- **实时标签建议**：输入时自动提示可用标签
- **灵活组合模式**：支持复杂的 AND/OR 组合逻辑

## 🎯 使用方法

### 单一维度搜索
- 只输入标签：搜索包含特定标签的笔记
- 只输入标题：搜索标题包含关键词的笔记  
- 只输入内容：搜索内容包含关键词的笔记

### 多维度组合搜索
- **两个维度**：自动显示 AND/OR 关系按钮
- **三个维度**：提供6种组合模式选择：
  - 全部AND (最严格)
  - 全部OR (最宽松)  
  - (标签AND标题) OR 内容
  - (标签OR标题) AND 内容
  - 标签 AND (标题OR内容)
  - 标签 OR (标题AND内容)

## 🔧 搜索技巧

1. **标签输入**：用逗号分隔多个标签，支持模糊匹配
2. **关键词输入**：用逗号分隔多个关键词
3. **实时搜索**：输入时自动搜索，无需手动点击
4. **清空重置**：点击清空按钮重置所有条件

## 📝 版本信息

- 版本：1.0.0
- 兼容性：Obsidian 0.15.0+
- 作者：SearchPlus Team

---

**需要帮助？** 查看插件设置页面中的详细使用说明和示例。`;
}

async function generateInstallGuide() {
    return `# SearchPlus 插件安装指南

## 📦 文件包含

这个发布包包含以下文件：
- \`SearchPlus/\` - 插件文件夹
  - \`main.js\` - 编译后的插件代码
  - \`manifest.json\` - 插件元数据
  - \`styles.css\` - 插件样式
  - \`README.md\` - 使用说明

## 🔧 安装步骤

### 方法 1：手动安装（推荐）

1. **找到 Obsidian 插件目录**
   - Windows: \`%APPDATA%\\Obsidian\\{vault-name}\\.obsidian\\plugins\\\`
   - macOS: \`~/Library/Application Support/obsidian/{vault-name}/.obsidian/plugins/\`
   - Linux: \`~/.config/obsidian/{vault-name}/.obsidian/plugins/\`

2. **复制插件文件夹**
   - 将整个 \`SearchPlus\` 文件夹复制到上述插件目录中
   - 最终路径应该是：\`.obsidian/plugins/SearchPlus/\`

3. **重启 Obsidian**（如果已经打开）

4. **启用插件**
   - 打开 Obsidian 设置 (Ctrl/Cmd + ,)
   - 转到 "第三方插件" 或 "Community plugins"
   - 找到 "SearchPlus" 并点击启用开关

### 方法 2：直接替换（如果您已经安装了旧版本）

1. 备份您的现有设置（如有需要）
2. 删除旧的 \`SearchPlus\` 文件夹
3. 复制新的 \`SearchPlus\` 文件夹到插件目录
4. 重启 Obsidian

## ✅ 验证安装

安装成功后，您应该能看到：
- 左侧功能区出现筛选图标 🔍
- 设置页面中出现 "SearchPlus" 配置项
- 可以使用 Ctrl/Cmd + P 搜索 "SearchPlus" 相关命令

## 🚀 开始使用

1. 点击左侧功能区的筛选图标
2. 在右侧面板输入搜索条件
3. 查看实时搜索结果

## 🛠 故障排除

**插件没有出现在列表中？**
- 检查文件夹路径是否正确
- 确保 \`manifest.json\` 文件存在且格式正确
- 重启 Obsidian 并刷新插件列表

**功能区图标没有显示？**
- 确保插件已启用
- 检查是否有错误信息在控制台中（F12 开发者工具）

**搜索功能不工作？**
- 检查是否有笔记存在
- 尝试不同的搜索条件
- 查看设置页面的配置

## 📞 技术支持

如果遇到问题，请：
1. 查看插件的 README.md 文件
2. 检查 Obsidian 控制台的错误信息
3. 确保 Obsidian 版本 ≥ 0.15.0

---

**享受高效的搜索体验！** 🎉`;
}

async function generateReleaseNotes() {
    // 读取当前版本和日期
    const manifestPath = join(projectRoot, 'manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const version = manifest.version;
    const date = new Date().toLocaleDateString('zh-CN');
    
    return `# SearchPlus v${version} 发布说明

## 🎉 首次发布

这是 SearchPlus 高级搜索插件的首个正式版本！

## ✨ 核心功能

### 🔍 多维度搜索
- **标签筛选**：支持多标签选择和模糊匹配
- **标题搜索**：在笔记标题中搜索关键词
- **内容搜索**：在笔记内容中搜索关键词
- **实时搜索**：输入时即时显示结果

### 🧠 智能关系配置
- **动态界面**：根据输入的搜索维度自动显示相应配置
- **单维度**：无需配置关系，直接搜索
- **两维度**：简单的 AND/OR 关系选择
- **三维度**：6种复杂组合模式：
  - 全部AND (最严格)
  - 全部OR (最宽松)
  - (标签AND标题) OR 内容
  - (标签OR标题) AND 内容
  - 标签 AND (标题OR内容)
  - 标签 OR (标题AND内容)

### 🎯 用户体验优化
- **标签建议**：输入时自动提示可用标签
- **键盘导航**：支持方向键选择建议
- **清空重置**：一键清空所有搜索条件
- **记忆设置**：保存用户的配置偏好

### 🎨 界面设计
- **现代化UI**：简洁美观的搜索界面
- **主题适配**：完美适配 Obsidian 的深色/浅色主题
- **响应式设计**：在不同屏幕尺寸下都有良好体验
- **动画效果**：平滑的界面过渡

## 🔧 技术特性

- **TypeScript 开发**：类型安全，维护性强
- **模块化架构**：代码结构清晰，易于扩展
- **性能优化**：搜索算法高效，支持大量笔记
- **兼容性**：支持 Obsidian 0.15.0+

## 📦 安装说明

1. 下载 \`SearchPlus-v${version}.zip\` 文件
2. 解压后将 \`SearchPlus\` 文件夹复制到 \`.obsidian/plugins/\` 目录
3. 在 Obsidian 设置中启用插件
4. 点击左侧功能区的筛选图标开始使用

详细安装步骤请参考 \`INSTALL.md\` 文件。

## 🚀 使用方法

### 快速开始
1. 点击左侧功能区的筛选图标 🔍
2. 在搜索面板中输入条件
3. 查看实时搜索结果

### 高级用法
- 使用逗号分隔多个标签或关键词
- 利用组合模式进行精确搜索
- 通过设置页面自定义默认行为

## 🐛 已知问题

- 暂无已知严重问题

## 🔮 后续计划

- 支持正则表达式搜索
- 添加搜索历史功能
- 支持保存和管理搜索模板
- 增加更多的搜索过滤选项

## 💝 致谢

感谢所有测试用户的反馈和建议！

---

**版本**：${version}  
**发布时间**：${date}  
**兼容性**：Obsidian 0.15.0+  
**文件大小**：~13KB`;
}

// 运行脚本
createRelease(); 