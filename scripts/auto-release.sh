#!/bin/bash

# SearchPlus Auto Release Script
# 自动推送代码并创建GitHub Release的脚本

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在正确的目录
if [ ! -f "package.json" ] || [ ! -f "manifest.json" ]; then
    log_error "请在项目根目录运行此脚本"
    exit 1
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
log_info "当前版本: v${CURRENT_VERSION}"

# 检查是否有未提交的更改
if ! git diff --quiet || ! git diff --cached --quiet; then
    log_warning "检测到未提交的更改"
    echo "请选择操作:"
    echo "1. 提交更改并继续"
    echo "2. 取消操作"
    read -p "请输入选择 [1/2]: " choice
    
    case $choice in
        1)
            read -p "请输入提交信息: " commit_message
            if [ -z "$commit_message" ]; then
                commit_message="feat: release v${CURRENT_VERSION}"
            fi
            git add .
            git commit -m "$commit_message"
            log_success "更改已提交"
            ;;
        2)
            log_info "操作已取消"
            exit 0
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
fi

# 询问是否需要更新版本
echo ""
echo "版本管理选项:"
echo "1. 使用当前版本 (v${CURRENT_VERSION})"
echo "2. 更新版本号"
read -p "请选择 [1/2]: " version_choice

if [ "$version_choice" = "2" ]; then
    echo "版本更新类型:"
    echo "1. Patch (bug fix) - 1.0.6 -> 1.0.7"
    echo "2. Minor (new feature) - 1.0.6 -> 1.1.0" 
    echo "3. Major (breaking change) - 1.0.6 -> 2.0.0"
    echo "4. 手动输入版本号"
    read -p "请选择 [1/2/3/4]: " bump_type
    
    case $bump_type in
        1)
            # Patch version bump (x.y.z -> x.y.z+1)
            OLD_VERSION=$(node -p "require('./package.json').version")
            NEW_VERSION=$(node -e "
                const pkg = require('./package.json');
                const [major, minor, patch] = pkg.version.split('.').map(Number);
                const newVer = \`\${major}.\${minor}.\${patch + 1}\`;
                pkg.version = newVer;
                require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, '\t') + '\n');
                console.log('v' + newVer);
            ")
            ;;
        2)
            # Minor version bump (x.y.z -> x.y+1.0)
            OLD_VERSION=$(node -p "require('./package.json').version")
            NEW_VERSION=$(node -e "
                const pkg = require('./package.json');
                const [major, minor, patch] = pkg.version.split('.').map(Number);
                const newVer = \`\${major}.\${minor + 1}.0\`;
                pkg.version = newVer;
                require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, '\t') + '\n');
                console.log('v' + newVer);
            ")
            ;;
        3)
            # Major version bump (x.y.z -> x+1.0.0)
            OLD_VERSION=$(node -p "require('./package.json').version")
            NEW_VERSION=$(node -e "
                const pkg = require('./package.json');
                const [major, minor, patch] = pkg.version.split('.').map(Number);
                const newVer = \`\${major + 1}.0.0\`;
                pkg.version = newVer;
                require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, '\t') + '\n');
                console.log('v' + newVer);
            ")
            ;;
        4)
            read -p "请输入新版本号 (例如: 1.0.7): " manual_version
            NEW_VERSION="v${manual_version}"
            node -e "
                const pkg = require('./package.json');
                pkg.version = '${manual_version}';
                require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, '\t') + '\n');
            "
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
    
    # 更新 manifest.json 中的版本
    node -e "
        const fs = require('fs');
        const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
        manifest.version = '${NEW_VERSION#v}';
        fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, '\t') + '\n');
    "
    
    log_success "版本已更新到: ${NEW_VERSION}"
    CURRENT_VERSION=${NEW_VERSION#v}
    
    # 提交版本更改
    git add package.json manifest.json
    git commit -m "chore: bump version to ${NEW_VERSION}"
    log_success "版本更改已提交"
fi

# 构建项目
log_info "开始构建项目..."
if ! pnpm run build; then
    log_error "构建失败"
    exit 1
fi
log_success "项目构建完成"

# 准备发布文件
log_info "准备发布文件..."
if ! pnpm run release:prepare; then
    log_error "发布准备失败"
    exit 1
fi
log_success "发布文件准备完成"

# 检查 release 目录
if [ ! -d "release/SearchPlus" ]; then
    log_error "release/SearchPlus 目录不存在"
    exit 1
fi

# 显示将要上传的文件
log_info "将要上传的文件:"
find release -type f -name "*" | sed 's/^/  /'

# 确认是否继续
echo ""
read -p "是否继续推送并创建 Release? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    log_info "操作已取消"
    exit 0
fi

# 推送代码到远程仓库
log_info "推送代码到远程仓库..."
CURRENT_BRANCH=$(git branch --show-current)
git push origin $CURRENT_BRANCH
log_success "代码推送完成"

# 创建并推送标签
TAG_NAME="v${CURRENT_VERSION}"
log_info "创建标签: ${TAG_NAME}"

# 检查标签是否已存在
if git tag -l | grep -q "^${TAG_NAME}$"; then
    log_warning "标签 ${TAG_NAME} 已存在"
    read -p "是否删除现有标签并重新创建? [y/N]: " delete_tag
    if [[ $delete_tag =~ ^[Yy]$ ]]; then
        git tag -d $TAG_NAME
        git push origin :refs/tags/$TAG_NAME
        log_success "已删除现有标签"
    else
        log_error "标签已存在，操作终止"
        exit 1
    fi
fi

# 创建标签
git tag -a $TAG_NAME -m "Release ${TAG_NAME}"
git push origin $TAG_NAME
log_success "标签推送完成: ${TAG_NAME}"

# 等待 GitHub Actions 完成
log_info "等待 GitHub Actions 构建完成..."
echo "你可以在以下链接查看构建状态:"
echo "https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"

# 完成提示
echo ""
log_success "🎉 自动发布流程完成!"
echo ""
echo "📋 完成的操作:"
echo "  ✅ 代码构建"
echo "  ✅ 发布文件准备"
echo "  ✅ 代码推送到 GitHub"
echo "  ✅ 创建并推送标签: ${TAG_NAME}"
echo ""
echo "🔄 GitHub Actions 将自动:"
echo "  - 构建项目"
echo "  - 创建 GitHub Release"
echo "  - 上传 release 目录中的文件"
echo ""
echo "🌐 发布页面: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases"
echo ""
log_info "请等待几分钟让 GitHub Actions 完成构建和发布"
