import { Plugin, WorkspaceLeaf } from 'obsidian';

// 导入自定义模块
import { SearchPlusSettings } from './src/types';
import { DEFAULT_SETTINGS, SearchPlusSettingTab } from './src/settings';
import { SearchPlusView, SEARCH_PLUS_VIEW_TYPE } from './src/searchView';

/**
 * SearchPlus 插件主类
 * 提供标签、标题、内容的高级组合搜索功能
 */
export default class SearchPlusPlugin extends Plugin {
	settings: SearchPlusSettings;

	/**
	 * 插件加载时执行
	 */
	async onload() {
		// 加载设置
		await this.loadSettings();

		// 注册搜索视图
		this.registerView(
			SEARCH_PLUS_VIEW_TYPE,
			(leaf) => new SearchPlusView(leaf, this)
		);

		// 在左侧功能区添加搜索图标
		const ribbonIconEl = this.addRibbonIcon('filter', 'SearchPlus - 高级搜索', (evt: MouseEvent) => {
			// 激活或打开搜索视图
			this.activateSearchView();
		});
		ribbonIconEl.addClass('search-plus-ribbon-icon');

		// 添加命令：打开搜索面板
		this.addCommand({
			id: 'open-search-plus',
			name: '打开高级搜索面板',
			callback: () => {
				this.activateSearchView();
			}
		});

		// 添加命令：快速搜索当前选中的文本
		this.addCommand({
			id: 'quick-search-selection',
			name: '快速搜索选中文本',
			editorCallback: (editor, view) => {
				const selectedText = editor.getSelection().trim();
				if (selectedText) {
					this.activateSearchView(selectedText);
				}
			}
		});

		// 添加设置标签页
		this.addSettingTab(new SearchPlusSettingTab(this.app, this));

		console.log('SearchPlus 插件已加载');
	}

	/**
	 * 插件卸载时执行
	 */
	onunload() {
		console.log('SearchPlus 插件已卸载');
	}

	/**
	 * 激活搜索视图
	 * @param initialSearch 初始搜索内容（可选）
	 */
	async activateSearchView(initialSearch?: string) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(SEARCH_PLUS_VIEW_TYPE);

		if (leaves.length > 0) {
			// 如果已经存在搜索视图，就使用现有的
			leaf = leaves[0];
		} else {
			// 创建新的搜索视图，放在右侧边栏
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({ 
					type: SEARCH_PLUS_VIEW_TYPE, 
					active: true 
				});
			}
		}

		// 显示侧边栏（如果折叠的话）
		if (leaf) {
			workspace.revealLeaf(leaf);

			// 如果提供了初始搜索内容，设置到内容关键词中
			if (initialSearch && leaf.view instanceof SearchPlusView) {
				// 这里可以调用视图的方法设置初始搜索内容
				// 由于当前视图类还没有公开方法，暂时留空
				// 可以在后续版本中添加 setInitialSearch 方法
			}
		}
	}

	/**
	 * 加载设置
	 */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * 保存设置
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * 获取当前设置
	 */
	getSettings(): SearchPlusSettings {
		return this.settings;
	}

	/**
	 * 更新特定设置项
	 * @param key 设置键
	 * @param value 设置值
	 */
	async updateSetting<K extends keyof SearchPlusSettings>(
		key: K, 
		value: SearchPlusSettings[K]
	) {
		this.settings[key] = value;
		await this.saveSettings();
	}
}
