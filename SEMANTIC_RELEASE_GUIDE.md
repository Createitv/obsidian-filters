# 语义化发布指南 / Semantic Release Guide

[English](#english) | [中文](#中文)

## English

### 🚀 Introduction

This project uses semantic versioning and automated releases through conventional commits and semantic-release. This ensures consistent, predictable version bumps and changelog generation.

### 📋 Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)  
- **perf**: A code change that improves performance (triggers patch version bump)
- **docs**: Documentation only changes (triggers patch version bump)
- **style**: Changes that don't affect code meaning (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files (no release)

#### Examples

```bash
# New feature (minor version bump: 1.0.0 → 1.1.0)
feat: add time range filtering for search results

# Bug fix (patch version bump: 1.0.0 → 1.0.1)
fix: resolve issue with tag matching in fuzzy search

# Performance improvement
perf: optimize search algorithm for large note collections

# Breaking change (major version bump: 1.0.0 → 2.0.0)
feat!: redesign search API with new filtering options

BREAKING CHANGE: The search method signature has changed from search(query) to search(criteria)
```

### 🔧 Setup Instructions

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Setup pnpm environment** (if needed):
   ```bash
   node scripts/setup-pnpm.mjs
   ```

3. **Verify setup**:
   ```bash
   pnpm run build
   pnpm run semantic-release --dry-run
   ```

### 📦 Release Process

#### Automatic Release (Recommended)

1. **Commit with conventional format**:
   ```bash
   git add .
   git commit -m "feat: add new search dimension for file size"
   git push origin main
   ```

2. **GitHub Actions will automatically**:
   - Analyze commit messages
   - Determine version bump
   - Update version files
   - Generate changelog
   - Create GitHub release
   - Publish release package

#### Manual Release

```bash
# Run semantic release locally
pnpm run semantic-release

# Or prepare release package manually
pnpm run semantic-release:prepare
```

### 🎯 Version Bumping Rules

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor | 1.0.0 → 1.1.0 |
| `fix:`, `perf:`, `docs:` | Patch | 1.0.0 → 1.0.1 |
| `feat!:`, `BREAKING CHANGE` | Major | 1.0.0 → 2.0.0 |
| `chore:`, `ci:`, `test:` | No release | - |

### 📝 Configuration Files

- `.releaserc.json` - Semantic release configuration
- `package.json` - NPM scripts and dependencies
- `.github/workflows/semantic-release.yml` - GitHub Actions workflow

### 🛠 Available Scripts

```bash
# Development
pnpm run dev                    # Watch mode with hot reload
pnpm run build                  # Production build

# Release
pnpm run semantic-release       # Run semantic release
pnpm run semantic-release:prepare  # Prepare release package
pnpm run release                # Traditional release (fallback)

# Utility
pnpm run clean                  # Clean build artifacts
pnpm run lint                   # Run linting
pnpm run test                   # Run tests
```

### 🔍 Troubleshooting

**Release not triggered?**
- Ensure commit follows conventional format
- Check that you're pushing to `main` or `master` branch
- Verify GitHub Actions has necessary permissions

**Version not bumping correctly?**
- Review commit message format
- Check `.releaserc.json` configuration
- Look at GitHub Actions logs for errors

---

## 中文

### 🚀 简介

本项目使用语义化版本控制和基于约定式提交的自动发布。通过 semantic-release 工具确保版本号的一致性和可预测性，并自动生成变更日志。

### 📋 提交信息格式

遵循[约定式提交](https://www.conventionalcommits.org/zh-hans/)规范：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

#### 类型说明

- **feat**: 新功能 (触发次版本号更新)
- **fix**: 错误修复 (触发修订版本号更新)
- **perf**: 性能优化 (触发修订版本号更新)
- **docs**: 仅文档更改 (触发修订版本号更新)
- **style**: 不影响代码含义的更改（空格、格式化等）
- **refactor**: 既不修复错误也不添加功能的代码更改
- **test**: 添加缺失的测试或更正现有测试
- **build**: 影响构建系统或外部依赖的更改
- **ci**: 对 CI 配置文件和脚本的更改
- **chore**: 不修改 src 或测试文件的其他更改（不发布）

#### 示例

```bash
# 新功能 (次版本号更新: 1.0.0 → 1.1.0)
feat: 添加搜索结果的时间范围筛选功能

# 错误修复 (修订版本号更新: 1.0.0 → 1.0.1)
fix: 修复模糊搜索中标签匹配的问题

# 性能优化
perf: 优化大量笔记的搜索算法

# 破坏性更改 (主版本号更新: 1.0.0 → 2.0.0)
feat!: 重新设计搜索 API，增加新的筛选选项

BREAKING CHANGE: 搜索方法签名从 search(query) 改为 search(criteria)
```

### 🔧 环境设置

1. **安装依赖**：
   ```bash
   pnpm install
   ```

2. **设置 pnpm 环境**（如需要）：
   ```bash
   node scripts/setup-pnpm.mjs
   ```

3. **验证设置**：
   ```bash
   pnpm run build
   pnpm run semantic-release --dry-run
   ```

### 📦 发布流程

#### 自动发布（推荐）

1. **使用约定式格式提交**：
   ```bash
   git add .
   git commit -m "feat: 添加文件大小的新搜索维度"
   git push origin main
   ```

2. **GitHub Actions 将自动**：
   - 分析提交信息
   - 确定版本更新类型
   - 更新版本文件
   - 生成变更日志
   - 创建 GitHub 发布
   - 发布插件包

#### 手动发布

```bash
# 本地运行语义化发布
pnpm run semantic-release

# 或手动准备发布包
pnpm run semantic-release:prepare
```

### 🎯 版本更新规则

| 提交类型 | 版本更新 | 示例 |
|----------|----------|------|
| `feat:` | 次版本 | 1.0.0 → 1.1.0 |
| `fix:`, `perf:`, `docs:` | 修订版本 | 1.0.0 → 1.0.1 |
| `feat!:`, `BREAKING CHANGE` | 主版本 | 1.0.0 → 2.0.0 |
| `chore:`, `ci:`, `test:` | 不发布 | - |

### 📝 配置文件

- `.releaserc.json` - 语义化发布配置
- `package.json` - NPM 脚本和依赖
- `.github/workflows/semantic-release.yml` - GitHub Actions 工作流

### 🛠 可用脚本

```bash
# 开发
pnpm run dev                    # 监听模式，热重载
pnpm run build                  # 生产构建

# 发布
pnpm run semantic-release       # 运行语义化发布
pnpm run semantic-release:prepare  # 准备发布包
pnpm run release                # 传统发布（备用）

# 工具
pnpm run clean                  # 清理构建文件
pnpm run lint                   # 运行代码检查
pnpm run test                   # 运行测试
```

### 🔍 故障排除

**发布未触发？**
- 确保提交遵循约定式格式
- 检查是否推送到 `main` 或 `master` 分支
- 验证 GitHub Actions 具有必要权限

**版本号未正确更新？**
- 检查提交信息格式
- 查看 `.releaserc.json` 配置
- 查看 GitHub Actions 日志中的错误信息

---

## 📚 相关资源

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [semantic-release](https://github.com/semantic-release/semantic-release)
- [GitHub Actions](https://docs.github.com/en/actions)
