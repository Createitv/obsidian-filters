#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 确保 release 目录存在
const releaseDir = path.join(rootDir, "release");
const pluginDir = path.join(releaseDir, "SearchPlus");

if (!fs.existsSync(releaseDir)) {
	fs.mkdirSync(releaseDir, { recursive: true });
}

if (!fs.existsSync(pluginDir)) {
	fs.mkdirSync(pluginDir, { recursive: true });
}

console.log("📦 准备发布文件...");

// 复制插件核心文件
const filesToCopy = [
	{ src: "main.js", dest: "SearchPlus/main.js" },
	{ src: "manifest.json", dest: "SearchPlus/manifest.json" },
	{ src: "styles.css", dest: "SearchPlus/styles.css" },
	{ src: "README.md", dest: "README.md" },
	{ src: "README_CN.md", dest: "README_CN.md" },
	{ src: "LICENSE", dest: "LICENSE" },
];

filesToCopy.forEach((file) => {
	const srcPath = path.join(rootDir, file.src);
	const destPath = path.join(releaseDir, file.dest);

	if (fs.existsSync(srcPath)) {
		// 确保目标目录存在
		const destDir = path.dirname(destPath);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		}

		fs.copyFileSync(srcPath, destPath);
		console.log(`✅ 已复制: ${file.src} -> release/${file.dest}`);
	} else {
		console.warn(`⚠️  文件不存在: ${file.src}`);
	}
});

// 获取版本信息
const packageJson = JSON.parse(
	fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
);
const version = packageJson.version;

// 创建安装指南
const installGuide = `# Installation Guide / 安装指南

## English
1. Download the latest release from GitHub
2. Extract the SearchPlus folder to your Obsidian plugins directory:
   - Windows: \`%APPDATA%\\Obsidian\\plugins\\\`
   - macOS: \`~/Library/Application Support/obsidian/plugins/\`
   - Linux: \`~/.config/obsidian/plugins/\`
3. Enable the plugin in Obsidian Settings > Community Plugins

## 中文
1. 从 GitHub 下载最新版本
2. 将 SearchPlus 文件夹解压到 Obsidian 插件目录：
   - Windows: \`%APPDATA%\\Obsidian\\plugins\\\`
   - macOS: \`~/Library/Application Support/obsidian/plugins/\`
   - Linux: \`~/.config/obsidian/plugins/\`
3. 在 Obsidian 设置 > 第三方插件中启用插件

## 📁 Package Contents / 包含文件

- \`SearchPlus/main.js\` - Plugin main file / 插件主文件
- \`SearchPlus/manifest.json\` - Plugin manifest / 插件清单  
- \`SearchPlus/styles.css\` - Plugin styles / 插件样式
- \`README.md\` - English documentation / 英文文档
- \`README_CN.md\` - Chinese documentation / 中文文档
- \`LICENSE\` - License file / 许可证文件

## 🔧 Version / 版本
v${version}
`;

fs.writeFileSync(path.join(releaseDir, "INSTALL.md"), installGuide);
console.log("✅ 已创建: INSTALL.md");

// 更新发布说明
const releaseNotes = `# SearchPlus v${version} 发布说明

## 🎉 版本更新

这是 SearchPlus 高级搜索插件的 v${version} 版本！

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
- **三维度**：6种复杂组合模式

### 🎯 用户体验优化
- **标签建议**：输入时自动提示可用标签
- **键盘导航**：支持方向键选择建议
- **清空重置**：一键清空所有搜索条件
- **记忆设置**：保存用户的配置偏好

## 📦 安装说明

1. 下载 \`SearchPlus-v${version}.zip\` 文件
2. 解压后将 \`SearchPlus\` 文件夹复制到 \`.obsidian/plugins/\` 目录
3. 在 Obsidian 设置中启用插件
4. 点击左侧功能区的筛选图标开始使用

详细安装步骤请参考 \`INSTALL.md\` 文件。

---

**版本**：${version}  
**兼容性**：Obsidian 0.15.0+  
**文件大小**：~13KB
`;

fs.writeFileSync(path.join(releaseDir, "RELEASE_NOTES.md"), releaseNotes);
console.log("✅ 已创建: RELEASE_NOTES.md");

console.log("\n🎉 发布文件准备完成!");
console.log("\n📁 Release 目录内容:");
console.log("release/");
console.log("├── SearchPlus/");
console.log("│   ├── main.js");
console.log("│   ├── manifest.json");
console.log("│   └── styles.css");
console.log("├── INSTALL.md");
console.log("├── RELEASE_NOTES.md");
console.log("├── README.md");
console.log("├── README_CN.md");
console.log("└── LICENSE");
console.log(`\n📦 可以运行以下命令创建压缩包:`);
console.log(
	`cd release && zip -r SearchPlus-v${version}.zip SearchPlus/ INSTALL.md RELEASE_NOTES.md README.md README_CN.md LICENSE`
);
