#!/bin/bash

# SearchPlus Quick Push Script
# 快速推送当前提交并触发发布的脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
TAG_NAME="v${CURRENT_VERSION}"

log_info "当前版本: ${TAG_NAME}"

# 检查是否有未提交的更改
if ! git diff --quiet || ! git diff --cached --quiet; then
    log_warning "检测到未提交的更改，将自动提交"
    
    # 自动添加所有更改
    git add .
    
    # 获取提交信息
    if [ $# -eq 0 ]; then
        COMMIT_MSG="feat: update for release ${TAG_NAME}"
    else
        COMMIT_MSG="$*"
    fi
    
    git commit -m "$COMMIT_MSG"
    log_success "更改已提交: $COMMIT_MSG"
fi

# 构建项目
log_info "构建项目..."
pnpm run build
log_success "构建完成"

# 准备发布文件
log_info "准备发布文件..."
pnpm run release:prepare
log_success "发布文件准备完成"

# 推送代码
log_info "推送代码到远程仓库..."
git push origin main
log_success "代码推送完成"

# 检查标签是否已存在并处理
if git tag -l | grep -q "^${TAG_NAME}$"; then
    log_warning "标签 ${TAG_NAME} 已存在，删除并重新创建"
    git tag -d $TAG_NAME 2>/dev/null || true
    git push origin :refs/tags/$TAG_NAME 2>/dev/null || true
    sleep 2
fi

# 创建并推送标签
log_info "创建标签: ${TAG_NAME}"
git tag -a $TAG_NAME -m "Release ${TAG_NAME}"
git push origin $TAG_NAME
log_success "标签推送完成"

# 获取仓库信息
REPO_URL=$(git remote get-url origin)
REPO_NAME=$(echo $REPO_URL | sed 's/.*github.com[:/]\([^.]*\).*/\1/')

echo ""
log_success "🎉 快速推送完成!"
echo ""
echo "📋 已完成:"
echo "  ✅ 代码提交"
echo "  ✅ 项目构建" 
echo "  ✅ 发布文件准备"
echo "  ✅ 推送到 GitHub"
echo "  ✅ 创建标签: ${TAG_NAME}"
echo ""
echo "🔄 GitHub Actions 将自动处理后续步骤"
echo "🌐 查看进度: https://github.com/${REPO_NAME}/actions"
echo "📦 发布页面: https://github.com/${REPO_NAME}/releases"
echo ""
log_info "等待几分钟让 GitHub Actions 完成构建和发布"
