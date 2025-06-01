# SearchPlus 插件安装指南

## 📦 文件包含

这个发布包包含以下文件：
- `SearchPlus/` - 插件文件夹
  - `main.js` - 编译后的插件代码
  - `manifest.json` - 插件元数据
  - `styles.css` - 插件样式
  - `README.md` - 使用说明

## 🔧 安装步骤

### 方法 1：手动安装（推荐）

1. **找到 Obsidian 插件目录**
   - Windows: `%APPDATA%\Obsidian\{vault-name}\.obsidian\plugins\`
   - macOS: `~/Library/Application Support/obsidian/{vault-name}/.obsidian/plugins/`
   - Linux: `~/.config/obsidian/{vault-name}/.obsidian/plugins/`

2. **复制插件文件夹**
   - 将整个 `SearchPlus` 文件夹复制到上述插件目录中
   - 最终路径应该是：`.obsidian/plugins/SearchPlus/`

3. **重启 Obsidian**（如果已经打开）

4. **启用插件**
   - 打开 Obsidian 设置 (Ctrl/Cmd + ,)
   - 转到 "第三方插件" 或 "Community plugins"
   - 找到 "SearchPlus" 并点击启用开关

### 方法 2：直接替换（如果您已经安装了旧版本）

1. 备份您的现有设置（如有需要）
2. 删除旧的 `SearchPlus` 文件夹
3. 复制新的 `SearchPlus` 文件夹到插件目录
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
- 确保 `manifest.json` 文件存在且格式正确
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

**享受高效的搜索体验！** 🎉