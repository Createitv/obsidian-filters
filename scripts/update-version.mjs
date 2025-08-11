#!/usr/bin/env node

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

/**
 * 更新版本号脚本
 * 由 semantic-release 调用，自动更新 manifest.json 和 versions.json
 */
async function updateVersion(newVersion) {
	if (!newVersion) {
		console.error("❌ 错误: 未提供版本号");
		console.log("用法: node update-version.mjs <version>");
		process.exit(1);
	}

	console.log(`🔧 更新版本号为: ${newVersion}`);

	try {
		// 1. 更新 manifest.json
		await updateManifest(newVersion);

		// 2. 更新 versions.json
		await updateVersionsFile(newVersion);

		// 3. 更新 package.json
		await updatePackageJson(newVersion);

		console.log("✅ 版本号更新完成！");
	} catch (error) {
		console.error("❌ 版本号更新失败:", error.message);
		process.exit(1);
	}
}

/**
 * 更新 manifest.json 文件
 */
async function updateManifest(version) {
	const manifestPath = join(projectRoot, "manifest.json");

	try {
		const manifestContent = await fs.readFile(manifestPath, "utf8");
		const manifest = JSON.parse(manifestContent);

		const oldVersion = manifest.version;
		manifest.version = version;

		await fs.writeFile(manifestPath, JSON.stringify(manifest, null, "\t"));
		console.log(`   📄 manifest.json: ${oldVersion} → ${version}`);
	} catch (error) {
		throw new Error(`更新 manifest.json 失败: ${error.message}`);
	}
}

/**
 * 更新 versions.json 文件
 */
async function updateVersionsFile(version) {
	const versionsPath = join(projectRoot, "versions.json");

	try {
		let versions = {};

		// 如果文件存在，读取现有版本信息
		try {
			const versionsContent = await fs.readFile(versionsPath, "utf8");
			versions = JSON.parse(versionsContent);
		} catch (error) {
			// 文件不存在或格式错误，创建新的
			console.log("   📝 创建新的 versions.json 文件");
		}

		// 获取当前 Obsidian 最低版本要求
		const manifestPath = join(projectRoot, "manifest.json");
		const manifestContent = await fs.readFile(manifestPath, "utf8");
		const manifest = JSON.parse(manifestContent);
		const minAppVersion = manifest.minAppVersion || "0.15.0";

		// 添加新版本
		versions[version] = minAppVersion;

		await fs.writeFile(versionsPath, JSON.stringify(versions, null, "\t"));
		console.log(
			`   📄 versions.json: 添加版本 ${version} (minAppVersion: ${minAppVersion})`
		);
	} catch (error) {
		throw new Error(`更新 versions.json 失败: ${error.message}`);
	}
}

/**
 * 更新 package.json 文件
 */
async function updatePackageJson(version) {
	const packagePath = join(projectRoot, "package.json");

	try {
		const packageContent = await fs.readFile(packagePath, "utf8");
		const packageJson = JSON.parse(packageContent);

		const oldVersion = packageJson.version;
		packageJson.version = version;

		await fs.writeFile(
			packagePath,
			JSON.stringify(packageJson, null, "\t")
		);
		console.log(`   📄 package.json: ${oldVersion} → ${version}`);
	} catch (error) {
		throw new Error(`更新 package.json 失败: ${error.message}`);
	}
}

// 从命令行参数获取版本号
const newVersion = process.argv[2];
updateVersion(newVersion);
