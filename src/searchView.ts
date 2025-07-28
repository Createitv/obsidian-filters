import { 
	ItemView, 
	WorkspaceLeaf, 
	Setting, 
	ButtonComponent, 
	DropdownComponent,
	Notice,
	TFile
} from 'obsidian';
import { SearchEngine } from './searchEngine';
import { SearchCriteria, SearchResult, TagSuggestion, SearchPlusSettings, ThreeDimensionMode } from './types';
import SearchPlusPlugin from '../main';

export const SEARCH_PLUS_VIEW_TYPE = "search-plus-view";

/**
 * 搜索增强视图类
 */
export class SearchPlusView extends ItemView {
	private plugin: SearchPlusPlugin;
	private searchEngine: SearchEngine;
	private currentResults: SearchResult[] = [];
	private currentCriteria: SearchCriteria = {
		tags: [],
		tagsMode: 'OR',
		titleKeywords: [],
		titleMode: 'OR',
		contentKeywords: [],
		contentMode: 'AND',
		twoDimensionRelation: 'AND',
		threeDimensionMode: 'all_and',
		timeRange: {
			startTime: null,
			endTime: null,
			enabled: false
		}
	};

	// UI 元素
	private tagsInput: HTMLInputElement;
	private titleInput: HTMLInputElement;
	private contentInput: HTMLInputElement;
	private tagsModeButton: HTMLElement;
	private titleModeButton: HTMLElement;
	private contentModeButton: HTMLElement;
	private relationContainer: HTMLElement;
	private twoDimensionButton: HTMLElement;
	private threeDimensionSelect: HTMLSelectElement;
	private resultsContainer: HTMLElement;
	private statusElement: HTMLElement;
	
	// 新增UI元素
	private configContainer: HTMLElement;
	private timeRangeModal: HTMLElement;
	private timeDisplayElement: HTMLElement;
	private configToggleButton: HTMLElement;
	private dateButton: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: SearchPlusPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.searchEngine = new SearchEngine(this.app);
	}

	getViewType() {
		return SEARCH_PLUS_VIEW_TYPE;
	}

	getDisplayText() {
		return "搜索增强";
	}

	getIcon() {
		return "filter";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('search-plus-container');

		// 创建搜索配置区域
		this.createSearchConfig(container);
		
		// 创建搜索结果区域
		this.createResultsArea(container);
		
		// 初始化搜索模式
		this.currentCriteria.twoDimensionRelation = this.plugin.settings.defaultTwoDimensionRelation;
		this.currentCriteria.threeDimensionMode = this.plugin.settings.defaultThreeDimensionMode;
		this.currentCriteria.tagsMode = this.plugin.settings.defaultTagsMode;
		this.currentCriteria.titleMode = this.plugin.settings.defaultTitleMode;
		this.currentCriteria.contentMode = this.plugin.settings.defaultContentMode;
		
		this.updateModeButtons();
		this.updateDynamicRelations();
	}

	async onClose() {
		// 清理资源
	}

	/**
	 * 创建搜索配置区域
	 */
	private createSearchConfig(container: Element) {
		const configContainer = container.createDiv('search-plus-config');
		
		// 创建标题栏
		const headerContainer = configContainer.createDiv('search-plus-header');
		const headerTitleContainer = headerContainer.createDiv('search-plus-title-container');
		headerTitleContainer.createEl('h3', { text: '高级搜索' });
		
		// 创建工具栏
		const toolbarContainer = headerContainer.createDiv('search-plus-toolbar');
		
		// 时间筛选按钮
		this.dateButton = toolbarContainer.createEl('button', {
			cls: 'search-plus-toolbar-button',
			title: '时间范围筛选'
		});
		this.dateButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
		this.dateButton.addEventListener('click', () => this.showTimeRangeModal());
		
		// 配置切换按钮
		this.configToggleButton = toolbarContainer.createEl('button', {
			cls: 'search-plus-toolbar-button',
			title: '显示/隐藏配置面板'
		});
		this.updateConfigToggleButton();
		this.configToggleButton.addEventListener('click', () => this.toggleConfigPanel());
		
		// 时间范围显示
		this.timeDisplayElement = configContainer.createDiv('time-range-display');
		this.timeDisplayElement.style.display = 'none';
		this.updateTimeDisplay();
		
		// 配置面板容器
		this.configContainer = configContainer.createDiv('search-plus-config-panel');
		this.configContainer.style.display = this.plugin.settings.showConfigPanel ? 'block' : 'none';

		// 标签筛选
		const tagsContainer = this.configContainer.createDiv('search-input-container');
		const tagsHeader = tagsContainer.createDiv('search-input-header');
		const tagsLabelContainer = tagsHeader.createDiv('search-label-container');
		tagsLabelContainer.createEl('span', { text: '标签筛选', cls: 'search-label' });
		
		// 创建右侧按钮容器
		const tagsButtonsContainer = tagsHeader.createDiv('search-buttons-container');
		
		// 创建标签模式按钮
		this.tagsModeButton = tagsButtonsContainer.createEl('button', {
			cls: 'search-mode-button',
			text: this.currentCriteria.tagsMode
		});
		this.tagsModeButton.addEventListener('click', async () => {
			this.currentCriteria.tagsMode = this.currentCriteria.tagsMode === 'AND' ? 'OR' : 'AND';
			await this.plugin.updateSetting('defaultTagsMode', this.currentCriteria.tagsMode);
			this.updateModeButtons();
			await this.performSearch();
		});
		
		// 创建标签清除按钮（图标）
		const tagsClearButton = tagsButtonsContainer.createEl('button', {
			cls: 'search-clear-icon',
			title: '清除所有标签'
		});
		tagsClearButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
		tagsClearButton.addEventListener('click', async () => {
			this.tagsInput.value = '';
			this.currentCriteria.tags = [];
			this.updateDynamicRelations();
			await this.performSearch();
		});

		const tagsInputContainer = tagsContainer.createDiv('search-input-field');
		this.tagsInput = tagsInputContainer.createEl('input', {
			type: 'text',
			placeholder: '例如：工作,学习,笔记 或 工作，学习，笔记',
			cls: 'search-input'
		});
		this.tagsInput.addEventListener('input', async () => {
			this.updateTagsFromInput();
			this.updateDynamicRelations();
			await this.performSearch();
		});
		
		// 添加标签建议功能
		this.setupTagSuggestions(this.tagsInput);

		// 标题关键词
		const titleContainer = this.configContainer.createDiv('search-input-container');
		const titleHeader = titleContainer.createDiv('search-input-header');
		const titleLabelContainer = titleHeader.createDiv('search-label-container');
		titleLabelContainer.createEl('span', { text: '标题关键词', cls: 'search-label' });
		
		// 创建右侧按钮容器
		const titleButtonsContainer = titleHeader.createDiv('search-buttons-container');
		
		// 创建标题模式按钮
		this.titleModeButton = titleButtonsContainer.createEl('button', {
			cls: 'search-mode-button',
			text: this.currentCriteria.titleMode
		});
		this.titleModeButton.addEventListener('click', async () => {
			this.currentCriteria.titleMode = this.currentCriteria.titleMode === 'AND' ? 'OR' : 'AND';
			await this.plugin.updateSetting('defaultTitleMode', this.currentCriteria.titleMode);
			this.updateModeButtons();
			await this.performSearch();
		});
		
		// 创建标题清除按钮（图标）
		const titleClearButton = titleButtonsContainer.createEl('button', {
			cls: 'search-clear-icon',
			title: '清除所有标题关键词'
		});
		titleClearButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
		titleClearButton.addEventListener('click', async () => {
			this.titleInput.value = '';
			this.currentCriteria.titleKeywords = [];
			this.updateDynamicRelations();
			await this.performSearch();
		});

		const titleInputContainer = titleContainer.createDiv('search-input-field');
		this.titleInput = titleInputContainer.createEl('input', {
			type: 'text',
			placeholder: '例如：会议,总结,计划 或 会议，总结，计划',
			cls: 'search-input'
		});
		this.titleInput.addEventListener('input', async () => {
			this.updateTitleKeywordsFromInput();
			this.updateDynamicRelations();
			await this.performSearch();
		});

		// 内容关键词
		const contentContainer = this.configContainer.createDiv('search-input-container');
		const contentHeader = contentContainer.createDiv('search-input-header');
		const contentLabelContainer = contentHeader.createDiv('search-label-container');
		contentLabelContainer.createEl('span', { text: '内容关键词', cls: 'search-label' });
		
		// 创建右侧按钮容器
		const contentButtonsContainer = contentHeader.createDiv('search-buttons-container');
		
		// 创建内容模式按钮
		this.contentModeButton = contentButtonsContainer.createEl('button', {
			cls: 'search-mode-button',
			text: this.currentCriteria.contentMode
		});
		this.contentModeButton.addEventListener('click', async () => {
			this.currentCriteria.contentMode = this.currentCriteria.contentMode === 'AND' ? 'OR' : 'AND';
			await this.plugin.updateSetting('defaultContentMode', this.currentCriteria.contentMode);
			this.updateModeButtons();
			await this.performSearch();
		});
		
		// 创建内容清除按钮（图标）
		const contentClearButton = contentButtonsContainer.createEl('button', {
			cls: 'search-clear-icon',
			title: '清除所有内容关键词'
		});
		contentClearButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
		contentClearButton.addEventListener('click', async () => {
			this.contentInput.value = '';
			this.currentCriteria.contentKeywords = [];
			this.updateDynamicRelations();
			await this.performSearch();
		});

		const contentInputContainer = contentContainer.createDiv('search-input-field');
		this.contentInput = contentInputContainer.createEl('input', {
			type: 'text',
			placeholder: '例如：重要,待办,想法 或 重要，待办，想法',
			cls: 'search-input'
		});
		this.contentInput.addEventListener('input', async () => {
			this.updateContentKeywordsFromInput();
			this.updateDynamicRelations();
			await this.performSearch();
		});

		// 动态维度间关系容器
		this.relationContainer = this.configContainer.createDiv('search-input-container dynamic-relations');
		this.relationContainer.style.display = 'none'; // 初始隐藏

		// 操作按钮
		const buttonContainer = this.configContainer.createDiv('search-plus-buttons');
		
		new ButtonComponent(buttonContainer)
			.setButtonText('搜索')
			.setClass('mod-cta')
			.onClick(async () => {
				await this.performSearch();
			});

		new ButtonComponent(buttonContainer)
			.setButtonText('清空')
			.onClick(() => {
				this.clearSearch();
			});
	}

	/**
	 * 更新模式按钮的显示
	 */
	private updateModeButtons() {
		if (this.tagsModeButton) {
			this.tagsModeButton.textContent = this.currentCriteria.tagsMode;
			this.tagsModeButton.className = `search-mode-button ${this.currentCriteria.tagsMode.toLowerCase()}`;
		}
		
		if (this.titleModeButton) {
			this.titleModeButton.textContent = this.currentCriteria.titleMode;
			this.titleModeButton.className = `search-mode-button ${this.currentCriteria.titleMode.toLowerCase()}`;
		}
		
		if (this.contentModeButton) {
			this.contentModeButton.textContent = this.currentCriteria.contentMode;
			this.contentModeButton.className = `search-mode-button ${this.currentCriteria.contentMode.toLowerCase()}`;
		}
		
		if (this.twoDimensionButton) {
			this.twoDimensionButton.textContent = this.currentCriteria.twoDimensionRelation;
			this.twoDimensionButton.className = `search-mode-button ${this.currentCriteria.twoDimensionRelation.toLowerCase()}`;
		}
		
		if (this.threeDimensionSelect) {
			this.threeDimensionSelect.value = this.currentCriteria.threeDimensionMode;
		}
	}

	/**
	 * 创建搜索结果区域
	 */
	private createResultsArea(container: Element) {
		const resultsSection = container.createDiv('search-plus-results-section');
		
		// 状态信息
		this.statusElement = resultsSection.createDiv('search-plus-status');
		this.statusElement.setText('请输入搜索条件');
		
		// 结果容器
		this.resultsContainer = resultsSection.createDiv('search-plus-results');
	}

	/**
	 * 设置标签建议功能
	 */
	private setupTagSuggestions(inputEl: HTMLInputElement) {
		let suggestionsContainer: HTMLElement | null = null;
		
		// 创建建议容器
		const createSuggestionsContainer = () => {
			if (suggestionsContainer) {
				suggestionsContainer.remove();
			}
			
			suggestionsContainer = document.createElement('div');
			suggestionsContainer.className = 'tag-suggestions-container';
			suggestionsContainer.style.cssText = `
				position: absolute;
				top: 100%;
				left: 0;
				right: 0;
				background: var(--background-primary);
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				max-height: 200px;
				overflow-y: auto;
				z-index: 1000;
				box-shadow: var(--shadow-s);
				display: none;
			`;
			
			// 将建议容器添加到输入框的父元素
			const parentEl = inputEl.parentElement?.parentElement;
			if (parentEl) {
				parentEl.style.position = 'relative';
				parentEl.appendChild(suggestionsContainer);
			}
		};
		
		// 显示标签建议
		const showSuggestions = (suggestions: any[]) => {
			if (!suggestionsContainer) createSuggestionsContainer();
			if (!suggestionsContainer) return;
			
			suggestionsContainer.empty();
			
			if (suggestions.length === 0) {
				suggestionsContainer.style.display = 'none';
				return;
			}
			
			// 限制显示数量，避免列表过长
			const maxSuggestions = 10;
			const displaySuggestions = suggestions.slice(0, maxSuggestions);
			
			displaySuggestions.forEach(suggestion => {
				const suggestionEl = suggestionsContainer!.createDiv('tag-suggestion-item');
				suggestionEl.style.cssText = `
					padding: 8px 12px;
					cursor: pointer;
					border-bottom: 1px solid var(--background-modifier-border-hover);
					display: flex;
					justify-content: space-between;
					align-items: center;
				`;
				
				const tagEl = suggestionEl.createSpan('tag-name');
				tagEl.textContent = suggestion.tag;
				tagEl.style.fontWeight = '500';
				
				const countEl = suggestionEl.createSpan('tag-count');
				countEl.textContent = `(${suggestion.count})`;
				countEl.style.cssText = `
					color: var(--text-muted);
					font-size: 0.85em;
				`;
				
				// 鼠标悬停效果
				suggestionEl.addEventListener('mouseenter', () => {
					suggestionEl.style.background = 'var(--background-modifier-hover)';
				});
				
				suggestionEl.addEventListener('mouseleave', () => {
					suggestionEl.style.background = '';
				});
				
				// 点击选择标签
				suggestionEl.addEventListener('click', () => {
					const currentValue = inputEl.value;
					const currentTags = currentValue.split(/[,，]/).map(tag => tag.trim());
					
					// 移除最后一个不完整的标签（正在输入的）
					if (currentTags.length > 0) {
						currentTags.pop();
					}
					
					// 添加选中的标签
					currentTags.push(suggestion.tag);
					
					// 更新输入框的值
					inputEl.value = currentTags.filter(tag => tag.length > 0).join(', ') + ', ';
					inputEl.focus();
					
					// 隐藏建议
					suggestionsContainer!.style.display = 'none';
					
					// 触发搜索
					this.updateTagsFromInput();
					this.performSearch();
				});
			});
			
			suggestionsContainer.style.display = 'block';
		};
		
		// 输入事件处理
		let searchTimeout: NodeJS.Timeout;
		inputEl.addEventListener('input', () => {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => {
				const value = inputEl.value;
				const currentTags = value.split(/[,，]/);
				const lastTag = currentTags[currentTags.length - 1]?.trim() || '';
				
				if (lastTag.length > 0) {
					// 获取匹配的标签建议
					const suggestions = this.searchEngine.getMatchingTagSuggestions(lastTag);
					showSuggestions(suggestions);
				} else {
					if (suggestionsContainer) {
						suggestionsContainer.style.display = 'none';
					}
				}
			}, 300); // 300ms 延迟，避免频繁搜索
		});
		
		// 聚焦时显示所有标签
		inputEl.addEventListener('focus', () => {
			const value = inputEl.value;
			if (!value.trim()) {
				const allSuggestions = this.searchEngine.getAllTagSuggestions();
				showSuggestions(allSuggestions.slice(0, 10)); // 只显示前10个
			}
		});
		
		// 失焦时隐藏建议（延迟以允许点击建议）
		inputEl.addEventListener('blur', () => {
			setTimeout(() => {
				if (suggestionsContainer) {
					suggestionsContainer.style.display = 'none';
				}
			}, 200);
		});
		
		// 键盘导航支持
		inputEl.addEventListener('keydown', (e) => {
			if (!suggestionsContainer || suggestionsContainer.style.display === 'none') return;
			
			const suggestions = suggestionsContainer.querySelectorAll('.tag-suggestion-item');
			const currentActive = suggestionsContainer.querySelector('.tag-suggestion-active');
			let activeIndex = -1;
			
			if (currentActive) {
				activeIndex = Array.from(suggestions).indexOf(currentActive as HTMLElement);
			}
			
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
					break;
				case 'ArrowUp':
					e.preventDefault();
					activeIndex = Math.max(activeIndex - 1, -1);
					break;
				case 'Enter':
					e.preventDefault();
					if (activeIndex >= 0) {
						(suggestions[activeIndex] as HTMLElement).click();
					}
					return;
				case 'Escape':
					suggestionsContainer.style.display = 'none';
					return;
			}
			
			// 更新活动项
			suggestions.forEach((item, index) => {
				if (index === activeIndex) {
					item.classList.add('tag-suggestion-active');
					(item as HTMLElement).style.background = 'var(--background-modifier-hover)';
				} else {
					item.classList.remove('tag-suggestion-active');
					(item as HTMLElement).style.background = '';
				}
			});
		});
	}

	/**
	 * 显示标签建议
	 */
	private showTagSuggestions() {
		// 这个方法现在被上面的 setupTagSuggestions 替代
		// 保留空实现以避免其他地方的调用出错
	}

	/**
	 * 从输入框更新标签列表
	 */
	private updateTagsFromInput() {
		const value = this.tagsInput.value.trim();
		this.currentCriteria.tags = value ? 
			value.split(/[,，]/).map(tag => tag.trim()).filter(tag => tag.length > 0) : 
			[];
	}

	/**
	 * 从输入框更新标题关键词
	 */
	private updateTitleKeywordsFromInput() {
		const value = this.titleInput.value.trim();
		this.currentCriteria.titleKeywords = value ? 
			value.split(/[,，]/).map(keyword => keyword.trim()).filter(keyword => keyword.length > 0) : 
			[];
	}

	/**
	 * 从输入框更新内容关键词
	 */
	private updateContentKeywordsFromInput() {
		const value = this.contentInput.value.trim();
		this.currentCriteria.contentKeywords = value ? 
			value.split(/[,，]/).map(keyword => keyword.trim()).filter(keyword => keyword.length > 0) : 
			[];
	}

	/**
	 * 执行搜索
	 */
	private async performSearch() {
		try {
			// 显示搜索中状态
			this.statusElement.setText('搜索中...');
			this.resultsContainer.empty();

			// 执行搜索
			this.currentResults = await this.searchEngine.search(this.currentCriteria);
			
			// 显示搜索结果
			this.displayResults();
			
		} catch (error) {
			console.error('搜索失败:', error);
			new Notice('搜索失败，请检查输入条件');
			this.statusElement.setText('搜索失败');
		}
	}

	/**
	 * 显示搜索结果
	 */
	private displayResults() {
		this.resultsContainer.empty();
		
		if (this.currentResults.length === 0) {
			this.statusElement.setText('未找到匹配的结果');
			this.resultsContainer.createDiv('no-results').setText('没有找到符合条件的笔记');
			return;
		}

		// 更新状态信息
		this.statusElement.setText(`找到 ${this.currentResults.length} 个结果`);

		// 显示结果列表
		for (const result of this.currentResults.slice(0, this.plugin.settings.resultPageSize)) {
			this.createResultItem(result);
		}

		// 如果结果太多，显示更多按钮
		if (this.currentResults.length > this.plugin.settings.resultPageSize) {
			const moreButton = this.resultsContainer.createDiv('show-more-button');
			new ButtonComponent(moreButton)
				.setButtonText(`显示更多 (还有 ${this.currentResults.length - this.plugin.settings.resultPageSize} 个结果)`)
				.onClick(() => {
					this.showMoreResults();
				});
		}
	}

	/**
	 * 创建单个搜索结果项
	 */
	private createResultItem(result: SearchResult) {
		const resultEl = this.resultsContainer.createDiv('search-result-item');
		
		// 文件标题（可点击）
		const titleEl = resultEl.createDiv('result-title');
		titleEl.setText(result.title);
		titleEl.addClass('clickable-title');
		titleEl.addEventListener('click', () => {
			this.openFile(result.file);
		});

		// 文件路径
		const pathEl = resultEl.createDiv('result-path');
		pathEl.setText(result.path);

		// 匹配信息
		const matchesEl = resultEl.createDiv('result-matches');
		
		if (result.matchedTags.length > 0) {
			const tagsEl = matchesEl.createDiv('matched-tags');
			tagsEl.createSpan('match-label').setText('标签: ');
			result.matchedTags.forEach(tag => {
				const tagSpan = tagsEl.createSpan('tag-match');
				tagSpan.setText(`#${tag}`);
			});
		}

		if (result.matchedTitleFragments.length > 0) {
			const titleMatchEl = matchesEl.createDiv('matched-title');
			titleMatchEl.createSpan('match-label').setText('标题匹配: ');
			titleMatchEl.createSpan('match-text').setText(result.matchedTitleFragments.join(', '));
		}

		if (result.matchedContentFragments.length > 0) {
			const contentMatchEl = matchesEl.createDiv('matched-content');
			contentMatchEl.createSpan('match-label').setText('内容片段: ');
			// 只显示第一个匹配片段，避免界面过长
			contentMatchEl.createSpan('match-text').setText(result.matchedContentFragments[0] + '...');
		}

		// 分数显示（调试用）
		if (this.plugin.settings.showSearchCount) {
			const scoreEl = resultEl.createDiv('result-score');
			scoreEl.setText(`匹配分数: ${result.score}`);
		}

		// 添加右键菜单功能
		this.setupContextMenu(resultEl, result.file);
	}

	/**
	 * 显示更多结果
	 */
	private showMoreResults() {
		// 清除现有结果
		this.resultsContainer.empty();
		
		// 显示所有结果
		for (const result of this.currentResults) {
			this.createResultItem(result);
		}
	}

	/**
	 * 打开文件
	 */
	private async openFile(file: TFile) {
		const leaf = this.app.workspace.getUnpinnedLeaf();
		await leaf.openFile(file);
		this.app.workspace.setActiveLeaf(leaf);
	}

	/**
	 * 设置右键菜单
	 */
	private setupContextMenu(element: HTMLElement, file: TFile) {
		element.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			this.showContextMenu(e, file);
		});
	}

	/**
	 * 显示右键菜单
	 */
	private showContextMenu(event: MouseEvent, file: TFile) {
		// 移除现有的右键菜单
		const existingMenu = document.querySelector('.search-result-context-menu');
		if (existingMenu) {
			existingMenu.remove();
		}

		// 创建右键菜单
		const menu = document.createElement('div');
		menu.className = 'search-result-context-menu';
		menu.style.cssText = `
			position: fixed;
			top: ${event.clientY}px;
			left: ${event.clientX}px;
			background: var(--background-primary);
			border: 1px solid var(--background-modifier-border);
			border-radius: 6px;
			box-shadow: var(--shadow-l);
			z-index: 1000;
			min-width: 180px;
			padding: 4px 0;
		`;

		// 菜单项
		const menuItems = [
			{
				text: '预览',
				icon: '👁️',
				action: () => this.previewFile(file)
			},
			{
				text: '打开',
				icon: '📄',
				action: () => this.openFile(file)
			},
			{
				text: '在新标签页打开',
				icon: '📋',
				action: () => this.openFileInNewTab(file)
			},
			{
				text: '在新窗口打开',
				icon: '🪟',
				action: () => this.openFileInNewWindow(file)
			},
			{ type: 'separator' },
			{
				text: '复制文件路径',
				icon: '📁',
				action: () => this.copyFilePath(file)
			},
			{
				text: '复制文件名',
				icon: '📝',
				action: () => this.copyFileName(file)
			},
			{ type: 'separator' },
			{
				text: '重命名',
				icon: '✏️',
				action: () => this.renameFile(file)
			},
			{
				text: '删除',
				icon: '🗑️',
				action: () => this.deleteFile(file)
			}
		];

		// 创建菜单项
		menuItems.forEach(item => {
			if (item.type === 'separator') {
				const separator = menu.createDiv('context-menu-separator');
				separator.style.cssText = `
					height: 1px;
					background: var(--background-modifier-border);
					margin: 4px 0;
				`;
			} else {
				const menuItem = menu.createDiv('context-menu-item');
				menuItem.style.cssText = `
					padding: 8px 12px;
					cursor: pointer;
					display: flex;
					align-items: center;
					gap: 8px;
					font-size: 14px;
				`;

				const icon = menuItem.createSpan('menu-item-icon');
				icon.textContent = item.icon || '';
				icon.style.fontSize = '16px';

				const text = menuItem.createSpan('menu-item-text');
				text.textContent = item.text || '';

				// 鼠标悬停效果
				menuItem.addEventListener('mouseenter', () => {
					menuItem.style.background = 'var(--background-modifier-hover)';
				});

				menuItem.addEventListener('mouseleave', () => {
					menuItem.style.background = '';
				});

				// 点击事件
				menuItem.addEventListener('click', () => {
					if (item.action) {
						item.action();
					}
					menu.remove();
				});
			}
		});

		// 添加到页面
		document.body.appendChild(menu);

		// 点击外部关闭菜单
		const closeMenu = (e: MouseEvent) => {
			if (!menu.contains(e.target as Node)) {
				menu.remove();
				document.removeEventListener('click', closeMenu);
			}
		};

		// 延迟添加事件监听器，避免立即触发
		setTimeout(() => {
			document.addEventListener('click', closeMenu);
		}, 0);
	}

	/**
	 * 在新标签页打开文件
	 */
	private async openFileInNewTab(file: TFile) {
		const activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf) {
			new Notice('无法创建新标签页');
			return;
		}
		const leaf = this.app.workspace.createLeafBySplit(activeLeaf, 'vertical', true);
		await leaf.openFile(file);
		this.app.workspace.setActiveLeaf(leaf);
	}

	/**
	 * 在新窗口打开文件
	 */
	private async openFileInNewWindow(file: TFile) {
		try {
			// 使用 Obsidian API 在新窗口打开文件
			const leaf = this.app.workspace.getLeaf("window"); // 指定在新窗口
			await leaf.openFile(file);
			this.app.workspace.setActiveLeaf(leaf);
		} catch (error) {
			console.error('在新窗口打开文件失败:', error);
			// 如果新窗口打开失败，回退到新标签页
			await this.openFileInNewTab(file);
		}
	}

	/**
	 * 复制文件路径
	 */
	private async copyFilePath(file: TFile) {
		try {
			await navigator.clipboard.writeText(file.path);
			new Notice('文件路径已复制到剪贴板');
		} catch (error) {
			console.error('复制文件路径失败:', error);
			new Notice('复制文件路径失败');
		}
	}

	/**
	 * 复制文件名
	 */
	private async copyFileName(file: TFile) {
		try {
			// 去掉文件扩展名
			const fileNameWithoutExtension = file.basename;
			await navigator.clipboard.writeText(fileNameWithoutExtension);
			new Notice('文件名已复制到剪贴板');
		} catch (error) {
			console.error('复制文件名失败:', error);
			new Notice('复制文件名失败');
		}
	}



	/**
	 * 重命名文件
	 */
	private async renameFile(file: TFile) {
		try {
			// 创建重命名对话框
			this.showRenameModal(file);
		} catch (error) {
			console.error('重命名文件失败:', error);
			new Notice('重命名文件失败');
		}
	}

	/**
	 * 显示重命名对话框
	 */
	private showRenameModal(file: TFile) {
		// 移除现有的重命名对话框
		const existingModal = document.querySelector('.rename-modal');
		if (existingModal) {
			existingModal.remove();
		}

		// 创建模态框
		const modal = this.containerEl.createDiv('rename-modal');
		modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 1000;
		`;

		const modalContent = modal.createDiv('rename-modal-content');
		modalContent.style.cssText = `
			background: var(--background-primary);
			border-radius: 8px;
			padding: 20px;
			min-width: 320px;
			max-width: 400px;
		`;

		// 标题
		modalContent.createEl('h3', { text: '重命名文件' });

		// 当前文件名显示
		const currentNameContainer = modalContent.createDiv('current-name-container');
		currentNameContainer.createEl('label', { text: '当前文件名：' });
		const currentNameSpan = currentNameContainer.createEl('span', { text: file.name });
		currentNameSpan.style.cssText = 'color: var(--text-muted); font-family: var(--font-monospace);';

		// 新文件名输入
		const inputContainer = modalContent.createDiv('new-name-container');
		inputContainer.createEl('label', { text: '新文件名：' });
		const input = inputContainer.createEl('input', {
			type: 'text',
			value: file.basename, // 不包含扩展名
			placeholder: '输入新文件名（不包含扩展名）'
		});
		input.style.cssText = `
			width: 100%;
			padding: 8px;
			margin-top: 4px;
			border: 1px solid var(--background-modifier-border);
			border-radius: 4px;
			background: var(--background-primary);
			color: var(--text-normal);
		`;

		// 扩展名显示
		const extensionContainer = modalContent.createDiv('extension-container');
		const extensionSpan = extensionContainer.createEl('span', { text: `扩展名：${file.extension}` });
		extensionSpan.style.cssText = 'color: var(--text-muted); font-size: 0.9em;';

		// 按钮组
		const buttonContainer = modalContent.createDiv('rename-modal-buttons');
		buttonContainer.style.cssText = `
			display: flex;
			justify-content: flex-end;
			gap: 8px;
			margin-top: 20px;
		`;

		// 取消按钮
		const cancelButton = buttonContainer.createEl('button', { text: '取消', cls: 'mod-muted' });
		cancelButton.addEventListener('click', () => {
			modal.remove();
		});

		// 确认按钮
		const confirmButton = buttonContainer.createEl('button', { text: '重命名', cls: 'mod-cta' });
		confirmButton.addEventListener('click', async () => {
			const newName = input.value.trim();
			if (!newName) {
				new Notice('请输入新文件名');
				return;
			}

			try {
				// 构建新的文件路径
				const newPath = file.path.replace(file.basename, newName);
				
				// 检查新文件名是否已存在
				const existingFile = this.app.vault.getAbstractFileByPath(newPath);
				if (existingFile && existingFile !== file) {
					new Notice('文件名已存在，请使用其他名称');
					return;
				}

				// 执行重命名
				await this.app.fileManager.renameFile(file, newName + '.' + file.extension);
				new Notice('文件重命名成功');
				modal.remove();
				
				// 重新执行搜索以更新结果
				await this.performSearch();
			} catch (error) {
				console.error('重命名文件失败:', error);
				new Notice('重命名文件失败');
			}
		});

		// 聚焦到输入框
		setTimeout(() => {
			input.focus();
			input.select();
		}, 100);

		// 回车键确认
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				confirmButton.click();
			} else if (e.key === 'Escape') {
				cancelButton.click();
			}
		});

		// 点击外部关闭
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});
	}

	/**
	 * 预览文件
	 */
	private async previewFile(file: TFile) {
		try {
			// 移除现有的预览窗口
			const existingPreview = document.querySelector('.file-preview-modal');
			if (existingPreview) {
				existingPreview.remove();
			}

			// 创建预览模态框
			const modal = this.containerEl.createDiv('file-preview-modal');
			modal.style.cssText = `
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(0, 0, 0, 0.5);
				display: flex;
				align-items: center;
				justify-content: center;
				z-index: 1000;
			`;

			const modalContent = modal.createDiv('file-preview-content');
			modalContent.style.cssText = `
				background: var(--background-primary);
				border-radius: 8px;
				width: 80%;
				height: 80%;
				max-width: 800px;
				max-height: 600px;
				display: flex;
				flex-direction: column;
				overflow: hidden;
			`;

			// 标题栏
			const header = modalContent.createDiv('preview-header');
			header.style.cssText = `
				padding: 12px 16px;
				border-bottom: 1px solid var(--background-modifier-border);
				display: flex;
				justify-content: space-between;
				align-items: center;
				background: var(--background-secondary);
			`;

			// 标题和图标容器
			const titleContainer = header.createDiv('preview-title-container');
			titleContainer.style.cssText = `
				display: flex;
				align-items: center;
				gap: 8px;
				flex: 1;
			`;

			// 打开文件按钮
			const openButton = titleContainer.createEl('button', { 
				cls: 'preview-action-button mod-cta',
				title: '打开文件'
			});

			// 新标签页打开按钮
			const openInNewTabButton = titleContainer.createEl('button', { 
				cls: 'preview-action-button mod-cta',
				title: '在新标签页打开'
			});

			const title = titleContainer.createEl('h3', { text: file.name });
			title.style.margin = '0';
			openButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline></svg>`;
			
			// 新标签页图标
			openInNewTabButton.innerHTML = `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15,3 21,3 21,9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
			openButton.style.cssText = `
				padding: 6px;
				border: 1px solid var(--interactive-accent);
				border-radius: 4px;
				background: var(--interactive-accent);
				color: var(--text-on-accent);
				cursor: pointer;
				transition: all 0.2s ease;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				width: 28px;
				height: 28px;
				box-sizing: border-box;
			`;

			// 新标签页按钮样式（一半大小）
			openInNewTabButton.style.cssText = `
				padding: 3px;
				border: 1px solid var(--interactive-accent);
				border-radius: 3px;
				background: var(--interactive-accent);
				color: var(--text-on-accent);
				cursor: pointer;
				transition: all 0.2s ease;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				width: 14px;
				height: 14px;
				box-sizing: border-box;
			`;
			openButton.addEventListener('click', () => {
				modal.remove();
				this.openFile(file);
			});

			openInNewTabButton.addEventListener('click', () => {
				modal.remove();
				this.openFileInNewTab(file);
			});

			const closeButton = header.createEl('button', { text: '×', cls: 'mod-muted' });
			closeButton.style.cssText = `
				background: none;
				border: none;
				font-size: 20px;
				cursor: pointer;
				padding: 0;
				width: 24px;
				height: 24px;
				display: flex;
				align-items: center;
				justify-content: center;
			`;
			closeButton.addEventListener('click', () => modal.remove());

			// 内容区域
			const contentArea = modalContent.createDiv('preview-content');
			contentArea.style.cssText = `
				flex: 1;
				padding: 16px;
				overflow-y: auto;
				background: var(--background-primary);
			`;

			// 显示加载状态
			contentArea.innerHTML = '<div style="text-align: center; padding: 20px;">加载中...</div>';

			try {
				// 读取文件内容
				const content = await this.app.vault.read(file);
				
				// 根据文件类型处理内容
				if (file.extension === 'md') {
					// Markdown 文件，使用 Obsidian 的渲染器
					await this.renderMarkdownContent(contentArea, file, content);
				} else {
					// 其他文件类型，显示原始内容
					contentArea.innerHTML = `<pre style="white-space: pre-wrap; font-family: var(--font-monospace); line-height: 1.6;">${this.escapeHtml(content)}</pre>`;
				}

				// 添加文件信息
				const fileInfo = modalContent.createDiv('preview-file-info');
				fileInfo.style.cssText = `
					padding: 8px 16px;
					border-top: 1px solid var(--background-modifier-border);
					background: var(--background-secondary);
					font-size: 0.9em;
					color: var(--text-muted);
				`;
				fileInfo.innerHTML = `
					<span>路径: ${file.path}</span>
					<span style="margin-left: 16px;">大小: ${this.formatFileSize(file.stat.size)}</span>
					<span style="margin-left: 16px;">修改时间: ${new Date(file.stat.mtime).toLocaleString('zh-CN')}</span>
				`;

			} catch (error) {
				console.error('预览文件失败:', error);
				contentArea.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-error);">无法预览文件内容</div>';
			}

			// 点击外部关闭
			modal.addEventListener('click', (e) => {
				if (e.target === modal) {
					modal.remove();
				}
			});

			// ESC 键关闭
			const handleKeydown = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					modal.remove();
					document.removeEventListener('keydown', handleKeydown);
				}
			};
			document.addEventListener('keydown', handleKeydown);

		} catch (error) {
			console.error('创建预览窗口失败:', error);
			new Notice('预览文件失败');
		}
	}

	/**
	 * 转义 HTML 字符
	 */
	private escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * 渲染 Markdown 内容
	 */
	private async renderMarkdownContent(contentArea: HTMLElement, file: TFile, content: string) {
		try {
			// 创建临时容器来渲染 Markdown
			const tempContainer = document.createElement('div');
			tempContainer.className = 'markdown-preview-view';
			tempContainer.style.cssText = `
				background: transparent;
				color: var(--text-normal);
				font-family: var(--font-text);
				line-height: 1.6;
				padding: 0;
				margin: 0;
			`;
			
			// 使用 Obsidian 的 Markdown 渲染
			await this.app.vault.process(file, (data) => {
				// 这里我们可以使用 Obsidian 的渲染功能
				// 但由于 API 限制，我们使用简化的渲染
				return data;
			});
			
			// 简单的 Markdown 渲染（基础功能）
			const renderedContent = this.simpleMarkdownRender(content);
			tempContainer.innerHTML = renderedContent;
			
			// 清空内容区域并添加渲染后的内容
			contentArea.innerHTML = '';
			contentArea.appendChild(tempContainer);
			
		} catch (error) {
			console.error('渲染 Markdown 失败:', error);
			// 回退到原始内容显示
			contentArea.innerHTML = `<pre style="white-space: pre-wrap; font-family: var(--font-monospace); line-height: 1.6;">${this.escapeHtml(content)}</pre>`;
		}
	}

	/**
	 * 简单的 Markdown 渲染
	 */
	private simpleMarkdownRender(content: string): string {
		// 基础的 Markdown 渲染
		let rendered = content;
		
		// 处理代码块（需要在其他处理之前）
		rendered = rendered.replace(/```([\s\S]*?)```/g, (match, code) => {
			return `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
		});
		
		// 标题
		rendered = rendered.replace(/^### (.*$)/gim, '<h3>$1</h3>');
		rendered = rendered.replace(/^## (.*$)/gim, '<h2>$1</h2>');
		rendered = rendered.replace(/^# (.*$)/gim, '<h1>$1</h1>');
		
		// 粗体和斜体
		rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
		rendered = rendered.replace(/\*(.*?)\*/g, '<em>$1</em>');
		
		// 行内代码
		rendered = rendered.replace(/`([^`]+)`/g, '<code>$1</code>');
		
		// 链接
		rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
		
		// 处理列表
		const lines = rendered.split('\n');
		let inList = false;
		let listType = '';
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.match(/^[\*\-] /)) {
				if (!inList) {
					lines[i] = '<ul>' + line.replace(/^[\*\-] (.*)/, '<li>$1</li>');
					inList = true;
					listType = 'ul';
				} else {
					lines[i] = line.replace(/^[\*\-] (.*)/, '<li>$1</li>');
				}
			} else if (line.match(/^\d+\. /)) {
				if (!inList || listType !== 'ol') {
					if (inList) {
						lines[i-1] += '</ul>';
					}
					lines[i] = '<ol>' + line.replace(/^\d+\. (.*)/, '<li>$1</li>');
					inList = true;
					listType = 'ol';
				} else {
					lines[i] = line.replace(/^\d+\. (.*)/, '<li>$1</li>');
				}
			} else if (inList && line.trim() === '') {
				// 空行结束列表
				lines[i-1] += `</${listType}>`;
				inList = false;
				listType = '';
			}
		}
		
		// 如果列表没有正确结束，添加结束标签
		if (inList) {
			lines[lines.length - 1] += `</${listType}>`;
		}
		
		rendered = lines.join('\n');
		
		// 段落处理
		rendered = rendered.replace(/\n\n/g, '</p><p>');
		rendered = '<p>' + rendered + '</p>';
		
		// 清理空段落和多余的标签
		rendered = rendered.replace(/<p><\/p>/g, '');
		rendered = rendered.replace(/<p><ul>/g, '<ul>');
		rendered = rendered.replace(/<\/ul><\/p>/g, '</ul>');
		rendered = rendered.replace(/<p><ol>/g, '<ol>');
		rendered = rendered.replace(/<\/ol><\/p>/g, '</ol>');
		
		return rendered;
	}

	/**
	 * 清理渲染后的内容
	 */
	private cleanupRenderedContent(element: HTMLElement) {
		// 移除一些不需要的元素和属性
		const elementsToRemove = element.querySelectorAll('.cm-editor, .cm-content, .cm-line, .cm-active, .cm-cursor');
		elementsToRemove.forEach(el => el.remove());
		
		// 移除一些可能影响显示的样式
		const styleElements = element.querySelectorAll('style');
		styleElements.forEach(el => el.remove());
		
		// 移除一些可能影响布局的类名
		element.classList.remove('markdown-preview-view', 'markdown-source-view');
		
		// 清理内联样式中的一些属性
		const allElements = element.querySelectorAll('*');
		allElements.forEach(el => {
			if (el instanceof HTMLElement) {
				// 移除可能影响显示的样式
				el.style.removeProperty('position');
				el.style.removeProperty('top');
				el.style.removeProperty('left');
				el.style.removeProperty('z-index');
			}
		});
	}

	/**
	 * 格式化文件大小
	 */
	private formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	/**
	 * 删除文件
	 */
	private async deleteFile(file: TFile) {
		try {
			// 使用 Obsidian 的文件删除功能
			await this.app.vault.delete(file);
			new Notice('文件已删除');
			// 重新执行搜索以更新结果
			await this.performSearch();
		} catch (error) {
			console.error('删除文件失败:', error);
			new Notice('删除文件失败');
		}
	}

	/**
	 * 清空搜索
	 */
	private clearSearch() {
		// 清空输入框
		this.tagsInput.value = '';
		this.titleInput.value = '';
		this.contentInput.value = '';
		
		// 重置搜索条件和模式，使用插件设置的默认值
		this.currentCriteria = {
			tags: [],
			tagsMode: this.plugin.settings.defaultTagsMode,
			titleKeywords: [],
			titleMode: this.plugin.settings.defaultTitleMode,
			contentKeywords: [],
			contentMode: this.plugin.settings.defaultContentMode,
			twoDimensionRelation: this.plugin.settings.defaultTwoDimensionRelation,
			threeDimensionMode: this.plugin.settings.defaultThreeDimensionMode,
			timeRange: {
				startTime: null,
				endTime: null,
				enabled: false
			}
		};
		
		// 重置界面控件
		this.updateModeButtons();
		
		// 隐藏动态关系配置
		this.updateDynamicRelations();
		
		// 更新时间显示
		this.updateTimeDisplay();
		
		// 清空结果
		this.currentResults = [];
		this.resultsContainer.empty();
		this.statusElement.setText('请输入搜索条件');
	}

	/**
	 * 动态更新维度间关系配置
	 */
	private updateDynamicRelations() {
		const hasTagCriteria = this.currentCriteria.tags.length > 0;
		const hasTitleCriteria = this.currentCriteria.titleKeywords.length > 0;
		const hasContentCriteria = this.currentCriteria.contentKeywords.length > 0;
		
		const activeDimensions = [hasTagCriteria, hasTitleCriteria, hasContentCriteria].filter(Boolean).length;
		
		// 清空现有内容
		this.relationContainer.empty();
		
		if (activeDimensions <= 1) {
			// 单一维度或无维度，隐藏关系配置
			this.relationContainer.style.display = 'none';
		} else if (activeDimensions === 2) {
			// 两个维度，显示简单的AND/OR选择
			this.relationContainer.style.display = 'block';
			this.createTwoDimensionRelation();
		} else {
			// 三个维度，显示复杂的组合选择
			this.relationContainer.style.display = 'block';
			this.createThreeDimensionRelation();
		}
	}

	/**
	 * 创建两维度关系配置
	 */
	private createTwoDimensionRelation() {
		const header = this.relationContainer.createDiv('search-input-header');
		header.createEl('span', { text: '维度关系', cls: 'search-label' });
		
		this.twoDimensionButton = header.createEl('button', {
			cls: 'search-mode-button',
			text: this.currentCriteria.twoDimensionRelation
		});
		
		this.twoDimensionButton.addEventListener('click', async () => {
			this.currentCriteria.twoDimensionRelation = this.currentCriteria.twoDimensionRelation === 'AND' ? 'OR' : 'AND';
			await this.plugin.updateSetting('defaultTwoDimensionRelation', this.currentCriteria.twoDimensionRelation);
			this.twoDimensionButton.textContent = this.currentCriteria.twoDimensionRelation;
			this.twoDimensionButton.className = `search-mode-button ${this.currentCriteria.twoDimensionRelation.toLowerCase()}`;
			await this.performSearch();
		});
		
		// 设置按钮样式
		this.twoDimensionButton.className = `search-mode-button ${this.currentCriteria.twoDimensionRelation.toLowerCase()}`;
	}

	/**
	 * 创建三维度关系配置
	 */
	private createThreeDimensionRelation() {
		const header = this.relationContainer.createDiv('search-input-header');
		header.createEl('span', { text: '组合模式', cls: 'search-label' });
		
		const selectContainer = this.relationContainer.createDiv('search-input-field');
		this.threeDimensionSelect = selectContainer.createEl('select', {
			cls: 'search-select'
		});
		
		// 添加选项
		const options = [
			{ value: 'all_and', text: '全部AND (最严格)' },
			{ value: 'all_or', text: '全部OR (最宽松)' },
			{ value: 'tags_and_title_or_content', text: '(标签AND标题) OR 内容' },
			{ value: 'tags_or_title_and_content', text: '(标签OR标题) AND 内容' },
			{ value: 'tags_and_title_or_content_2', text: '标签 AND (标题OR内容)' },
			{ value: 'tags_or_title_and_content_2', text: '标签 OR (标题AND内容)' }
		];
		
		options.forEach(option => {
			const optionEl = this.threeDimensionSelect.createEl('option', {
				value: option.value,
				text: option.text
			});
			if (option.value === this.currentCriteria.threeDimensionMode) {
				optionEl.selected = true;
			}
		});
		
		this.threeDimensionSelect.addEventListener('change', async () => {
			this.currentCriteria.threeDimensionMode = this.threeDimensionSelect.value as ThreeDimensionMode;
			await this.plugin.updateSetting('defaultThreeDimensionMode', this.currentCriteria.threeDimensionMode);
			await this.performSearch();
		});
		
		// 添加说明文字
		const hintDiv = this.relationContainer.createDiv('relation-hint');
		hintDiv.setText('💡 选择不同的组合模式来精确控制三个搜索维度的关系');
	}

	/**
	 * 显示时间范围选择器
	 */
	private showTimeRangeModal() {
		// 创建模态框
		const modal = this.containerEl.createDiv('time-range-modal');
		modal.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 1000;
		`;

		const modalContent = modal.createDiv('time-range-modal-content');
		modalContent.style.cssText = `
			background: var(--background-primary);
			border-radius: 8px;
			padding: 20px;
			min-width: 320px;
			max-width: 400px;
		`;

		// 标题
		modalContent.createEl('h3', { text: '选择时间范围' });

		// 开始时间
		const startTimeContainer = modalContent.createDiv('time-input-container');
		startTimeContainer.createEl('label', { text: '开始时间：' });
		const startTimeInput = startTimeContainer.createEl('input', {
			type: 'datetime-local'
		});
		if (this.currentCriteria.timeRange.startTime) {
			startTimeInput.value = new Date(this.currentCriteria.timeRange.startTime).toISOString().slice(0, 16);
		}

		// 结束时间
		const endTimeContainer = modalContent.createDiv('time-input-container');
		endTimeContainer.createEl('label', { text: '结束时间：' });
		const endTimeInput = endTimeContainer.createEl('input', {
			type: 'datetime-local'
		});
		if (this.currentCriteria.timeRange.endTime) {
			endTimeInput.value = new Date(this.currentCriteria.timeRange.endTime).toISOString().slice(0, 16);
		}

		// 启用开关
		const enableContainer = modalContent.createDiv('time-enable-container');
		const enableCheckbox = enableContainer.createEl('input', {
			type: 'checkbox'
		});
		enableCheckbox.checked = this.currentCriteria.timeRange.enabled;
		enableContainer.createEl('label', { text: ' 启用时间筛选' });

		// 快捷选择
		const quickContainer = modalContent.createDiv('time-quick-container');
		quickContainer.createEl('h4', { text: '快捷选择' });
		const quickButtons = quickContainer.createDiv('time-quick-buttons');

		const quickOptions = [
			{ text: '最近一周', days: 7 },
			{ text: '最近一月', days: 30 },
			{ text: '最近三月', days: 90 },
			{ text: '最近一年', days: 365 },
			{ text: '最近两年', days: 730 },
			{ text: '最近三年', days: 1095 },
		];

		quickOptions.forEach(option => {
			const btn = quickButtons.createEl('button', { text: option.text, cls: 'mod-cta' });
			btn.style.marginRight = '8px';
			btn.addEventListener('click', () => {
				const now = Date.now();
				const startTime = now - (option.days * 24 * 60 * 60 * 1000);
				startTimeInput.value = new Date(startTime).toISOString().slice(0, 16);
				endTimeInput.value = new Date(now).toISOString().slice(0, 16);
				enableCheckbox.checked = true;
			});
		});

		// 按钮组
		const buttonContainer = modalContent.createDiv('time-modal-buttons');
		buttonContainer.style.cssText = `
			display: flex;
			justify-content: flex-end;
			gap: 8px;
			margin-top: 20px;
		`;

		// 清除按钮
		const clearButton = buttonContainer.createEl('button', { text: '清除', cls: 'mod-muted' });
		clearButton.addEventListener('click', () => {
			this.currentCriteria.timeRange = {
				startTime: null,
				endTime: null,
				enabled: false
			};
			this.updateTimeDisplay();
			this.performSearch();
			modal.remove();
		});

		// 取消按钮
		const cancelButton = buttonContainer.createEl('button', { text: '取消', cls: 'mod-muted' });
		cancelButton.addEventListener('click', () => {
			modal.remove();
		});

		// 确认按钮
		const confirmButton = buttonContainer.createEl('button', { text: '确认', cls: 'mod-cta' });
		confirmButton.addEventListener('click', () => {
			this.currentCriteria.timeRange = {
				startTime: startTimeInput.value ? new Date(startTimeInput.value).getTime() : null,
				endTime: endTimeInput.value ? new Date(endTimeInput.value).getTime() : null,
				enabled: enableCheckbox.checked
			};
			this.updateTimeDisplay();
			this.performSearch();
			modal.remove();
		});

		// 点击外部关闭
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});
	}

	/**
	 * 更新配置切换按钮
	 */
	private updateConfigToggleButton() {
		const isVisible = this.plugin.settings.showConfigPanel;
		this.configToggleButton.innerHTML = isVisible 
			? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg>`
			: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"></path></svg>`;
		this.configToggleButton.title = isVisible ? '隐藏配置面板' : '显示配置面板';
	}

	/**
	 * 切换配置面板的显示状态
	 */
	private async toggleConfigPanel() {
		const newState = !this.plugin.settings.showConfigPanel;
		await this.plugin.updateSetting('showConfigPanel', newState);
		this.configContainer.style.display = newState ? 'block' : 'none';
		
		// 同时控制时间筛选显示
		if (newState) {
			// 显示配置时，根据时间筛选启用状态决定是否显示
			this.updateTimeDisplay();
		} else {
			// 隐藏配置时，强制隐藏时间筛选显示
			this.timeDisplayElement.style.display = 'none';
		}
		
		this.updateConfigToggleButton();
	}

	/**
	 * 更新时间显示
	 */
	private updateTimeDisplay() {
		// 如果配置面板隐藏，则时间筛选也隐藏
		if (!this.plugin.settings.showConfigPanel || !this.currentCriteria.timeRange.enabled) {
			this.timeDisplayElement.style.display = 'none';
			return;
		}

		this.timeDisplayElement.style.display = 'block';
		const { startTime, endTime } = this.currentCriteria.timeRange;
		
		let displayText = '时间筛选：';
		if (startTime && endTime) {
			const startStr = new Date(startTime).toLocaleDateString('zh-CN');
			const endStr = new Date(endTime).toLocaleDateString('zh-CN');
			displayText += `${startStr} 至 ${endStr}`;
		} else if (startTime) {
			const startStr = new Date(startTime).toLocaleDateString('zh-CN');
			displayText += `${startStr} 之后`;
		} else if (endTime) {
			const endStr = new Date(endTime).toLocaleDateString('zh-CN');
			displayText += `${endStr} 之前`;
		} else {
			displayText += '已启用';
		}

		// 添加删除按钮
		this.timeDisplayElement.innerHTML = `
			<span class="time-range-text">${displayText}</span>
			<button class="time-range-remove" title="移除时间筛选">×</button>
		`;

		const removeButton = this.timeDisplayElement.querySelector('.time-range-remove') as HTMLElement;
		removeButton?.addEventListener('click', () => {
			this.currentCriteria.timeRange = {
				startTime: null,
				endTime: null,
				enabled: false
			};
			this.updateTimeDisplay();
			this.performSearch();
		});
	}
} 