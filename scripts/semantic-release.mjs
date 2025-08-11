#!/usr/bin/env node

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

/**
 * 语义化发布包创建脚本
 * 支持自动版本检测和国际化发布包
 */
async function createSemanticRelease() {
	console.log("📦 开始创建语义化发布包...");

	try {
		// 1. 获取当前版本信息
		const version = await getCurrentVersion();
		console.log(`🏷️  当前版本: ${version}`);

		// 2. 确保构建完成
		await ensureBuild();

		// 3. 创建发布目录结构
		const releaseDir = await createReleaseStructure(version);

		// 4. 复制核心文件
		await copyPluginFiles(releaseDir, version);

		// 5. 生成国际化文档
		await generateI18nDocs(releaseDir, version);

		// 6. 创建压缩包
		await createReleaseZip(releaseDir, version);

		// 7. 生成发布清单
		await generateReleaseManifest(releaseDir, version);

		console.log(`🎉 语义化发布包创建完成！`);
		console.log(`📁 发布路径: ${releaseDir}`);
		console.log(`📦 压缩包: SearchPlus-v${version}.zip`);
	} catch (error) {
		console.error("❌ 发布包创建失败:", error.message);
		process.exit(1);
	}
}

/**
 * 获取当前版本号
 */
async function getCurrentVersion() {
	try {
		// 优先从 git tag 获取版本
		try {
			const gitTag = execSync("git describe --tags --abbrev=0", {
				cwd: projectRoot,
				encoding: "utf8",
			}).trim();
			return gitTag.replace(/^v/, "");
		} catch (gitError) {
			// 如果没有 git tag，从 manifest.json 获取
			const manifestPath = join(projectRoot, "manifest.json");
			const manifest = JSON.parse(
				await fs.readFile(manifestPath, "utf8")
			);
			return manifest.version;
		}
	} catch (error) {
		throw new Error(`获取版本号失败: ${error.message}`);
	}
}

/**
 * 确保项目已构建
 */
async function ensureBuild() {
	const mainJsPath = join(projectRoot, "main.js");
	try {
		await fs.access(mainJsPath);
		console.log("✅ 检测到构建文件");
	} catch (error) {
		console.log("🔨 未检测到构建文件，开始构建...");
		try {
			execSync("pnpm run build", { cwd: projectRoot, stdio: "inherit" });
			console.log("✅ 构建完成");
		} catch (buildError) {
			throw new Error(`构建失败: ${buildError.message}`);
		}
	}
}

/**
 * 创建发布目录结构
 */
async function createReleaseStructure(version) {
	const releaseDir = join(projectRoot, "release");
	const pluginDir = join(releaseDir, "SearchPlus");

	// 清理并创建目录
	await fs.rm(releaseDir, { recursive: true, force: true });
	await fs.mkdir(releaseDir, { recursive: true });
	await fs.mkdir(pluginDir, { recursive: true });

	console.log("📁 创建发布目录结构");
	return releaseDir;
}

/**
 * 复制插件核心文件
 */
async function copyPluginFiles(releaseDir, version) {
	const pluginDir = join(releaseDir, "SearchPlus");

	console.log("📋 复制插件核心文件...");

	const coreFiles = [
		{ src: "main.js", required: true },
		{ src: "manifest.json", required: true },
		{ src: "styles.css", required: true },
		{ src: "LICENSE", required: false },
	];

	for (const file of coreFiles) {
		const srcPath = join(projectRoot, file.src);
		const destPath = join(pluginDir, file.src);

		try {
			await fs.copyFile(srcPath, destPath);
			console.log(`   ✅ ${file.src}`);
		} catch (error) {
			if (file.required) {
				throw new Error(
					`复制必需文件 ${file.src} 失败: ${error.message}`
				);
			} else {
				console.log(`   ⚠️  跳过可选文件 ${file.src}`);
			}
		}
	}
}

/**
 * 生成国际化文档
 */
async function generateI18nDocs(releaseDir, version) {
	console.log("📝 生成国际化文档...");

	// 生成插件内README（中英双语）
	const pluginReadme = await generatePluginReadme(version);
	await fs.writeFile(
		join(releaseDir, "SearchPlus", "README.md"),
		pluginReadme
	);

	// 生成安装指南（中英双语）
	const installGuide = await generateInstallGuide(version);
	await fs.writeFile(join(releaseDir, "INSTALL.md"), installGuide);

	// 复制项目README文件
	try {
		await fs.copyFile(
			join(projectRoot, "README.md"),
			join(releaseDir, "README.md")
		);
		await fs.copyFile(
			join(projectRoot, "README_CN.md"),
			join(releaseDir, "README_CN.md")
		);
		console.log("   ✅ 复制项目README文件");
	} catch (error) {
		console.log("   ⚠️  跳过项目README文件");
	}
}

/**
 * 生成插件README（双语版）
 */
async function generatePluginReadme(version) {
	return `# SearchPlus - Advanced Search Plugin

[English](#english) | [中文](#中文)

## English

### 🚀 Quick Installation

1. Copy the entire \`SearchPlus\` folder to your Obsidian plugins directory:
   \`\`\`
   .obsidian/plugins/SearchPlus/
   \`\`\`

2. Open Obsidian Settings → Community Plugins → Enable "SearchPlus"

3. Click the filter icon 🔍 in the left sidebar to start using!

### ✨ Key Features

- **Multi-dimensional Search**: Search tags, titles, and content simultaneously
- **Smart Relationship Configuration**: Dynamic interface based on search dimensions
- **Real-time Tag Suggestions**: Auto-suggest available tags while typing
- **Flexible Combination Modes**: Support complex AND/OR logic combinations

### 🎯 Usage

#### Single Dimension Search
- Tags only: Find notes with specific tags
- Title only: Search notes with keywords in titles
- Content only: Search notes with keywords in content

#### Multi-dimensional Search
- **Two dimensions**: Automatically shows AND/OR relationship buttons
- **Three dimensions**: Provides 6 combination modes

### 🔧 Search Tips

1. **Tag Input**: Separate multiple tags with commas, supports fuzzy matching
2. **Keyword Input**: Separate multiple keywords with commas
3. **Real-time Search**: Results update as you type
4. **Clear Reset**: Click clear button to reset all conditions

---

## 中文

### 🚀 快速安装

1. 将整个 \`SearchPlus\` 文件夹复制到您的 Obsidian 插件目录：
   \`\`\`
   .obsidian/plugins/SearchPlus/
   \`\`\`

2. 在 Obsidian 中打开设置 → 第三方插件 → 启用 "SearchPlus"

3. 点击左侧功能区的筛选图标 🔍 开始使用！

### ✨ 主要功能

- **多维度搜索**：同时搜索标签、标题、内容
- **智能关系配置**：根据输入动态显示关系设置
- **实时标签建议**：输入时自动提示可用标签
- **灵活组合模式**：支持复杂的 AND/OR 组合逻辑

### 🎯 使用方法

#### 单一维度搜索
- 只输入标签：搜索包含特定标签的笔记
- 只输入标题：搜索标题包含关键词的笔记  
- 只输入内容：搜索内容包含关键词的笔记

#### 多维度组合搜索
- **两个维度**：自动显示 AND/OR 关系按钮
- **三个维度**：提供6种组合模式选择

### 🔧 搜索技巧

1. **标签输入**：用逗号分隔多个标签，支持模糊匹配
2. **关键词输入**：用逗号分隔多个关键词
3. **实时搜索**：输入时自动搜索，无需手动点击
4. **清空重置**：点击清空按钮重置所有条件

---

**Version / 版本**: ${version}  
**Compatibility / 兼容性**: Obsidian 0.15.0+  
**Author / 作者**: SearchPlus Team`;
}

/**
 * 生成安装指南（双语版）
 */
async function generateInstallGuide(version) {
	return `# SearchPlus Installation Guide / SearchPlus 安装指南

[English](#english) | [中文](#中文)

## English

### 📦 Package Contents

This release package contains:
- \`SearchPlus/\` - Plugin folder
  - \`main.js\` - Compiled plugin code
  - \`manifest.json\` - Plugin metadata
  - \`styles.css\` - Plugin styles
  - \`README.md\` - Usage instructions

### 🔧 Installation Steps

#### Method 1: Manual Installation (Recommended)

1. **Locate Obsidian plugins directory**
   - Windows: \`%APPDATA%\\Obsidian\\{vault-name}\\.obsidian\\plugins\\\`
   - macOS: \`~/Library/Application Support/obsidian/{vault-name}/.obsidian/plugins/\`
   - Linux: \`~/.config/obsidian/{vault-name}/.obsidian/plugins/\`

2. **Copy plugin folder**
   - Copy the entire \`SearchPlus\` folder to the plugins directory
   - Final path should be: \`.obsidian/plugins/SearchPlus/\`

3. **Restart Obsidian** (if already open)

4. **Enable the plugin**
   - Open Obsidian Settings (Ctrl/Cmd + ,)
   - Go to "Community plugins"
   - Find "SearchPlus" and toggle it on

### ✅ Verify Installation

After successful installation, you should see:
- Filter icon 🔍 appears in the left sidebar
- "SearchPlus" appears in settings
- SearchPlus commands available in Command Palette (Ctrl/Cmd + P)

### 🚀 Getting Started

1. Click the filter icon in the left sidebar
2. Enter search criteria in the right panel
3. View real-time search results

---

## 中文

### 📦 包含文件

这个发布包包含以下文件：
- \`SearchPlus/\` - 插件文件夹
  - \`main.js\` - 编译后的插件代码
  - \`manifest.json\` - 插件元数据
  - \`styles.css\` - 插件样式
  - \`README.md\` - 使用说明

### 🔧 安装步骤

#### 方法 1：手动安装（推荐）

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

### ✅ 验证安装

安装成功后，您应该能看到：
- 左侧功能区出现筛选图标 🔍
- 设置页面中出现 "SearchPlus" 配置项
- 可以使用 Ctrl/Cmd + P 搜索 "SearchPlus" 相关命令

### 🚀 开始使用

1. 点击左侧功能区的筛选图标
2. 在右侧面板输入搜索条件
3. 查看实时搜索结果

---

**Version / 版本**: ${version}  
**Release Date / 发布日期**: ${new Date().toLocaleDateString()}  
**File Size / 文件大小**: ~15KB`;
}

/**
 * 创建发布压缩包
 */
async function createReleaseZip(releaseDir, version) {
	console.log("📦 创建发布压缩包...");

	try {
		const zipFileName = `SearchPlus-v${version}.zip`;
		const zipPath = join(releaseDir, zipFileName);

		// 使用系统命令创建zip文件
		execSync(
			`cd "${releaseDir}" && zip -r "${zipFileName}" SearchPlus/ INSTALL.md README.md README_CN.md 2>/dev/null || true`,
			{
				cwd: releaseDir,
			}
		);

		console.log(`   ✅ 创建压缩包: ${zipFileName}`);

		// 检查文件大小
		const stats = await fs.stat(zipPath);
		const sizeKB = Math.round(stats.size / 1024);
		console.log(`   📊 压缩包大小: ${sizeKB}KB`);
	} catch (error) {
		console.log("   ⚠️  创建压缩包失败，请手动创建");
	}
}

/**
 * 生成发布清单
 */
async function generateReleaseManifest(releaseDir, version) {
	console.log("📋 生成发布清单...");

	const manifest = {
		version: version,
		releaseDate: new Date().toISOString(),
		files: [
			{
				name: "SearchPlus/",
				description: "Plugin folder containing all necessary files",
				required: true,
			},
			{
				name: "INSTALL.md",
				description: "Bilingual installation guide",
				required: false,
			},
			{
				name: "README.md",
				description: "English project documentation",
				required: false,
			},
			{
				name: "README_CN.md",
				description: "Chinese project documentation",
				required: false,
			},
		],
		compatibility: {
			obsidianVersion: "0.15.0+",
			platforms: ["Windows", "macOS", "Linux"],
		},
		languages: ["en", "zh-cn"],
	};

	await fs.writeFile(
		join(releaseDir, "release-manifest.json"),
		JSON.stringify(manifest, null, 2)
	);

	console.log("   ✅ 发布清单已生成");
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
	createSemanticRelease();
}
