# SearchPlus 开发和发布指南

## 🛠 开发环境设置

```bash
# 安装依赖
npm install

# 开发模式（实时编译）
npm run dev

# 构建生产版本
npm run build
```

## 📦 自动化发布流程

我们提供了一套完整的自动化发布脚本，无需手动复制文件！

### 🚀 一键发布（推荐）

```bash
# 构建 + 打包 + 压缩，一步到位
npm run release
```

这个命令会：
1. 🔨 编译 TypeScript 代码
2. 📋 复制必要文件到 `release/SearchPlus/`
3. 📝 自动生成文档（README、安装指南、发布说明）
4. 📦 创建 ZIP 压缩包
5. ✅ 显示完成信息

### 🎯 分步执行

如果需要更精细的控制，可以分步执行：

```bash
# 1. 构建并准备发布文件
npm run release:prepare

# 2. 仅创建压缩包
npm run release:zip

# 3. 构建+打包（不创建ZIP）
npm run release:package
```

### 📁 输出文件结构

运行发布脚本后，会在 `release/` 文件夹中生成：

```
release/
├── SearchPlus/                    # 可直接分发的插件文件夹
│   ├── main.js                   # 编译后的插件代码
│   ├── manifest.json             # 插件元数据
│   ├── styles.css                # 插件样式
│   └── README.md                 # 使用说明
├── INSTALL.md                    # 详细安装指南
├── RELEASE_NOTES.md              # 发布说明（自动生成版本信息）
└── SearchPlus-v1.0.0.zip         # 完整发布包
```

## 🔄 版本管理

```bash
# 更新版本号（会同时更新 manifest.json 和 versions.json）
npm run version

# 然后发布新版本
npm run release
```

## 📤 分发方式

### 方式 1：压缩包分发（推荐）
- 分享 `SearchPlus-v1.0.0.zip` 文件
- 用户解压后按照 INSTALL.md 安装

### 方式 2：文件夹分发
- 直接分享 `release/SearchPlus/` 文件夹
- 用户复制到插件目录即可

### 方式 3：GitHub Release
- 将 ZIP 文件上传到 GitHub Release
- 附带 RELEASE_NOTES.md 的内容

## 🧹 清理

```bash
# 手动清理发布文件
rm -rf release/

# 发布脚本会自动清理旧文件，无需手动操作
```

## 📋 发布检查清单

每次发布前请确认：

- [ ] 代码构建无错误 (`npm run build`)
- [ ] 功能测试通过
- [ ] 版本号已更新 (`npm run version`)
- [ ] manifest.json 信息正确
- [ ] 运行 `npm run release` 生成发布包
- [ ] 检查生成的文件完整性

## 🔧 脚本详细说明

| 脚本命令 | 功能描述 |
|---------|---------|
| `npm run dev` | 开发模式，监听文件变化实时编译 |
| `npm run build` | 构建生产版本 |
| `npm run release:copy` | 复制文件并生成文档 |
| `npm run release:prepare` | 构建 + 复制文件 |
| `npm run release:zip` | 创建 ZIP 压缩包 |
| `npm run release:package` | 完整打包流程（不含提示） |
| `npm run release` | 一键发布（推荐使用） |
| `npm run version` | 版本号管理 |

## 🤖 自动化特性

- ✅ 自动读取 `manifest.json` 中的版本号
- ✅ 自动生成带版本号的文件名
- ✅ 自动生成当前日期的发布说明
- ✅ 自动清理旧的发布文件
- ✅ 智能错误处理和提示

现在您可以专注于开发，发布流程完全自动化！🎉 