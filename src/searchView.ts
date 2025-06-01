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
		threeDimensionMode: 'all_and'
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
		
		// 标题
		configContainer.createEl('h3', { text: '高级搜索' });

		// 标签筛选
		const tagsContainer = configContainer.createDiv('search-input-container');
		const tagsHeader = tagsContainer.createDiv('search-input-header');
		const tagsLabelContainer = tagsHeader.createDiv('search-label-container');
		tagsLabelContainer.createEl('span', { text: '标签筛选', cls: 'search-label' });
		
		// 创建标签模式按钮
		this.tagsModeButton = tagsHeader.createEl('button', {
			cls: 'search-mode-button',
			text: this.currentCriteria.tagsMode
		});
		this.tagsModeButton.addEventListener('click', async () => {
			this.currentCriteria.tagsMode = this.currentCriteria.tagsMode === 'AND' ? 'OR' : 'AND';
			await this.plugin.updateSetting('defaultTagsMode', this.currentCriteria.tagsMode);
			this.updateModeButtons();
			await this.performSearch();
		});

		const tagsInputContainer = tagsContainer.createDiv('search-input-field');
		this.tagsInput = tagsInputContainer.createEl('input', {
			type: 'text',
			placeholder: '例如：工作,学习,笔记',
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
		const titleContainer = configContainer.createDiv('search-input-container');
		const titleHeader = titleContainer.createDiv('search-input-header');
		const titleLabelContainer = titleHeader.createDiv('search-label-container');
		titleLabelContainer.createEl('span', { text: '标题关键词', cls: 'search-label' });
		
		// 创建标题模式按钮
		this.titleModeButton = titleHeader.createEl('button', {
			cls: 'search-mode-button',
			text: this.currentCriteria.titleMode
		});
		this.titleModeButton.addEventListener('click', async () => {
			this.currentCriteria.titleMode = this.currentCriteria.titleMode === 'AND' ? 'OR' : 'AND';
			await this.plugin.updateSetting('defaultTitleMode', this.currentCriteria.titleMode);
			this.updateModeButtons();
			await this.performSearch();
		});

		const titleInputContainer = titleContainer.createDiv('search-input-field');
		this.titleInput = titleInputContainer.createEl('input', {
			type: 'text',
			placeholder: '例如：会议,总结,计划',
			cls: 'search-input'
		});
		this.titleInput.addEventListener('input', async () => {
			this.updateTitleKeywordsFromInput();
			this.updateDynamicRelations();
			await this.performSearch();
		});

		// 内容关键词
		const contentContainer = configContainer.createDiv('search-input-container');
		const contentHeader = contentContainer.createDiv('search-input-header');
		const contentLabelContainer = contentHeader.createDiv('search-label-container');
		contentLabelContainer.createEl('span', { text: '内容关键词', cls: 'search-label' });
		
		// 创建内容模式按钮
		this.contentModeButton = contentHeader.createEl('button', {
			cls: 'search-mode-button',
			text: this.currentCriteria.contentMode
		});
		this.contentModeButton.addEventListener('click', async () => {
			this.currentCriteria.contentMode = this.currentCriteria.contentMode === 'AND' ? 'OR' : 'AND';
			await this.plugin.updateSetting('defaultContentMode', this.currentCriteria.contentMode);
			this.updateModeButtons();
			await this.performSearch();
		});

		const contentInputContainer = contentContainer.createDiv('search-input-field');
		this.contentInput = contentInputContainer.createEl('input', {
			type: 'text',
			placeholder: '例如：重要,待办,想法',
			cls: 'search-input'
		});
		this.contentInput.addEventListener('input', async () => {
			this.updateContentKeywordsFromInput();
			this.updateDynamicRelations();
			await this.performSearch();
		});

		// 动态维度间关系容器
		this.relationContainer = configContainer.createDiv('search-input-container dynamic-relations');
		this.relationContainer.style.display = 'none'; // 初始隐藏

		// 操作按钮
		const buttonContainer = configContainer.createDiv('search-plus-buttons');
		
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
					const currentTags = currentValue.split(',').map(tag => tag.trim());
					
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
				const currentTags = value.split(',');
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
			value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
			[];
	}

	/**
	 * 从输入框更新标题关键词
	 */
	private updateTitleKeywordsFromInput() {
		const value = this.titleInput.value.trim();
		this.currentCriteria.titleKeywords = value ? 
			value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0) : 
			[];
	}

	/**
	 * 从输入框更新内容关键词
	 */
	private updateContentKeywordsFromInput() {
		const value = this.contentInput.value.trim();
		this.currentCriteria.contentKeywords = value ? 
			value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0) : 
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
			threeDimensionMode: this.plugin.settings.defaultThreeDimensionMode
		};
		
		// 重置界面控件
		this.updateModeButtons();
		
		// 隐藏动态关系配置
		this.updateDynamicRelations();
		
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
} 