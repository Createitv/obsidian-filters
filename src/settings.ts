import { App, PluginSettingTab, Setting } from 'obsidian';
import SearchPlusPlugin from '../main';
import { SearchPlusSettings, ThreeDimensionMode } from './types';

/**
 * 默认设置配置
 */
export const DEFAULT_SETTINGS: SearchPlusSettings = {
	defaultTagsMode: 'OR',
	defaultTitleMode: 'OR', 
	defaultContentMode: 'AND',
	defaultTwoDimensionRelation: 'AND',
	defaultThreeDimensionMode: 'all_and',
	showSearchCount: false,
	resultPageSize: 20,
	enableFuzzySearch: false,
	showConfigPanel: true
};

/**
 * 搜索增强插件设置标签页
 */
export class SearchPlusSettingTab extends PluginSettingTab {
	plugin: SearchPlusPlugin;

	constructor(app: App, plugin: SearchPlusPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'SearchPlus 设置' });

		// 维度内关系设置
		containerEl.createEl('h3', { text: '维度内搜索关系' });

		// 默认标签搜索模式
		new Setting(containerEl)
			.setName('标签搜索模式')
			.setDesc('多个标签之间的关系')
			.addDropdown(dropdown =>
				dropdown.addOption('OR', 'OR - 任一标签匹配即可')
					.addOption('AND', 'AND - 必须包含所有标签')
					.setValue(this.plugin.settings.defaultTagsMode)
					.onChange(async (value) => {
						await this.plugin.updateSetting('defaultTagsMode', value as 'AND' | 'OR');
					})
			);

		// 默认标题搜索模式
		new Setting(containerEl)
			.setName('标题搜索模式')
			.setDesc('多个标题关键词之间的关系')
			.addDropdown(dropdown =>
				dropdown.addOption('OR', 'OR - 任一关键词匹配即可')
					.addOption('AND', 'AND - 必须包含所有关键词')
					.setValue(this.plugin.settings.defaultTitleMode)
					.onChange(async (value) => {
						await this.plugin.updateSetting('defaultTitleMode', value as 'AND' | 'OR');
					})
			);

		// 默认内容搜索模式
		new Setting(containerEl)
			.setName('内容搜索模式')
			.setDesc('多个内容关键词之间的关系')
			.addDropdown(dropdown =>
				dropdown.addOption('AND', 'AND - 必须包含所有关键词')
					.addOption('OR', 'OR - 任一关键词匹配即可')
					.setValue(this.plugin.settings.defaultContentMode)
					.onChange(async (value) => {
						await this.plugin.updateSetting('defaultContentMode', value as 'AND' | 'OR');
					})
			);

		// 维度间关系设置
		containerEl.createEl('h3', { text: '维度间搜索关系' });

		// 两维度关系
		new Setting(containerEl)
			.setName('两维度关系')
			.setDesc('当只有两个搜索维度时的关系')
			.addDropdown(dropdown =>
				dropdown.addOption('AND', 'AND - 必须同时满足两个条件')
					.addOption('OR', 'OR - 满足任一条件即可')
					.setValue(this.plugin.settings.defaultTwoDimensionRelation)
					.onChange(async (value) => {
						await this.plugin.updateSetting('defaultTwoDimensionRelation', value as 'AND' | 'OR');
					})
			);

		// 三维度组合模式
		new Setting(containerEl)
			.setName('三维度组合模式')
			.setDesc('当有三个搜索维度时的组合策略')
			.addDropdown(dropdown =>
				dropdown.addOption('all_and', '全部AND - 严格匹配')
					.addOption('all_or', '全部OR - 宽松匹配')
					.addOption('tags_and_title_or_content', '(标签AND标题) OR 内容')
					.addOption('tags_or_title_and_content', '(标签OR标题) AND 内容')
					.addOption('tags_and_title_or_content_2', '标签 AND (标题OR内容)')
					.addOption('tags_or_title_and_content_2', '标签 OR (标题AND内容)')
					.setValue(this.plugin.settings.defaultThreeDimensionMode)
					.onChange(async (value) => {
						await this.plugin.updateSetting('defaultThreeDimensionMode', value as ThreeDimensionMode);
					})
			);

		// 基本功能设置
		containerEl.createEl('h3', { text: '基本设置' });

		// 每页显示结果数
		new Setting(containerEl)
			.setName('每页显示结果数')
			.setDesc('每页最多显示多少个搜索结果（推荐 10-50）')
			.addSlider(slider =>
				slider.setLimits(1, 100, 1)
					.setValue(this.plugin.settings.resultPageSize)
					.setDynamicTooltip()
					.onChange(async (value) => {
						await this.plugin.updateSetting('resultPageSize', value);
					})
			);

		// 显示匹配分数
		new Setting(containerEl)
			.setName('显示匹配分数')
			.setDesc('在搜索结果中显示匹配分数（用于调试和优化）')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.showSearchCount)
					.onChange(async (value) => {
						await this.plugin.updateSetting('showSearchCount', value);
					})
			);

		// 启用模糊搜索
		new Setting(containerEl)
			.setName('启用模糊搜索')
			.setDesc('允许部分匹配和拼音首字母匹配（实验性功能）')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.enableFuzzySearch)
					.onChange(async (value) => {
						await this.plugin.updateSetting('enableFuzzySearch', value);
					})
			);

		// 使用说明
		const instructionsContainer = containerEl.createDiv('search-plus-instructions');
		instructionsContainer.createEl('h3', { text: '使用说明' });
		instructionsContainer.createEl('p', { text: '🔍 SearchPlus 提供多维度的高级搜索功能：' });
		
		const instructionsList = instructionsContainer.createEl('ul');
		instructionsList.createEl('li', { text: '标签筛选：支持多选和模糊匹配，可搜索包含特定标签的笔记' });
		instructionsList.createEl('li', { text: '标题关键词：在笔记标题中搜索关键词' });
		instructionsList.createEl('li', { text: '内容关键词：在笔记内容中搜索关键词' });
		instructionsList.createEl('li', { text: '每个维度都可以独立设置 AND/OR 关系' });
		instructionsList.createEl('li', { text: '维度间关系支持两两独立配置（标签&标题、标签&内容、标题&内容）' });

		// 搜索模式说明
		const modesContainer = containerEl.createDiv('search-plus-modes');
		modesContainer.createEl('h3', { text: '搜索模式详解' });
		
		const modesContent = modesContainer.createEl('div');
		modesContent.innerHTML = `
			<h4>维度内关系</h4>
			<ul>
				<li><strong>标签 OR 模式</strong>：包含任一标签即匹配（推荐）</li>
				<li><strong>标签 AND 模式</strong>：必须包含所有标签才匹配</li>
				<li><strong>标题/内容 OR 模式</strong>：包含任一关键词即匹配</li>
				<li><strong>标题/内容 AND 模式</strong>：必须包含所有关键词才匹配</li>
			</ul>
			
			<h4>维度间关系</h4>
			<ul>
				<li><strong>标签 & 标题</strong>：控制标签条件与标题条件的组合方式</li>
				<li><strong>标签 & 内容</strong>：控制标签条件与内容条件的组合方式</li>
				<li><strong>标题 & 内容</strong>：控制标题条件与内容条件的组合方式</li>
			</ul>
			
			<h4>搜索示例</h4>
			<p><strong>示例 1</strong>：查找工作相关的会议记录</p>
			<ul>
				<li>标签：工作 (任意模式)</li>
				<li>标题：会议,会面 (OR模式)</li>
				<li>标签&标题：AND</li>
			</ul>
			
			<p><strong>示例 2</strong>：查找包含特定技术的学习资料</p>
			<ul>
				<li>标签：学习,技术 (OR模式)</li>
				<li>内容：Python,机器学习 (OR模式)</li>
				<li>标签&内容：AND</li>
			</ul>
		`;

		// 快捷键说明
		const shortcutsContainer = containerEl.createDiv('search-plus-shortcuts');
		shortcutsContainer.createEl('h3', { text: '快捷操作' });
		
		const shortcutsList = shortcutsContainer.createEl('ul');
		shortcutsList.createEl('li', { text: '点击左侧功能区搜索图标打开搜索面板' });
		shortcutsList.createEl('li', { text: '在编辑器中选中文本后使用"快速搜索选中文本"命令' });
		shortcutsList.createEl('li', { text: '标签输入支持实时建议和键盘导航（↑↓选择，Enter确认）' });
		shortcutsList.createEl('li', { text: '可在快捷键设置中为插件命令分配自定义快捷键' });
	}
} 