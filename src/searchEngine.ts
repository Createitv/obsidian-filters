import { App, TFile, getAllTags, CachedMetadata } from 'obsidian';
import { SearchCriteria, SearchResult, TagSuggestion, ThreeDimensionMode, DimensionResult } from './types';

/**
 * 搜索引擎类 - 负责处理所有搜索逻辑
 */
export class SearchEngine {
	private app: App;
	private cache: Map<string, any> = new Map();

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * 执行搜索
	 * @param criteria 搜索条件
	 * @returns 搜索结果数组
	 */
	async search(criteria: SearchCriteria): Promise<SearchResult[]> {
		// 清理无效的搜索条件
		const normalizedCriteria = this.normalizeCriteria(criteria);
		
		// 如果没有搜索条件，返回空结果
		if (!this.hasCriteria(normalizedCriteria)) {
			return [];
		}

		// 获取所有 Markdown 文件
		const files = this.app.vault.getMarkdownFiles();
		const results: SearchResult[] = [];

		for (const file of files) {
			const result = await this.evaluateFile(file, normalizedCriteria);
			if (result) {
				results.push(result);
			}
		}

		// 按照匹配分数排序
		return results.sort((a, b) => b.score - a.score);
	}

	/**
	 * 清理和标准化搜索条件
	 */
	private normalizeCriteria(criteria: SearchCriteria): SearchCriteria {
		return {
			...criteria,
			tags: criteria.tags.filter(tag => tag.trim().length > 0),
			titleKeywords: criteria.titleKeywords.filter(keyword => keyword.trim().length > 0),
			contentKeywords: criteria.contentKeywords.filter(keyword => keyword.trim().length > 0)
		};
	}

	/**
	 * 检查是否有有效的搜索条件
	 */
	private hasCriteria(criteria: SearchCriteria): boolean {
		return criteria.tags.length > 0 || 
			   criteria.titleKeywords.length > 0 || 
			   criteria.contentKeywords.length > 0;
	}

	/**
	 * 评估单个文件是否匹配搜索条件
	 * @param file 文件对象
	 * @param criteria 搜索条件
	 * @returns 搜索结果或null
	 */
	private async evaluateFile(file: TFile, criteria: SearchCriteria): Promise<SearchResult | null> {
		try {
			// 获取文件内容和元数据
			const content = await this.app.vault.read(file);
			const cache = this.app.metadataCache.getFileCache(file);
			const title = file.basename;

			// 评估每个维度
			const tagResult = this.evaluateTagCriteria(cache?.tags || [], cache?.frontmatter?.tags || [], criteria);
			const titleResult = this.evaluateTitleCriteria(title, criteria);
			const contentResult = this.evaluateContentCriteria(content, criteria);

			// 动态组合评估
			const finalMatch = this.evaluateDynamicCombination(
				tagResult, titleResult, contentResult, criteria
			);

			if (!finalMatch.matches) {
				return null;
			}

			// 计算总分数
			const score = this.calculateScore(tagResult, titleResult, contentResult);

			return {
				file,
				title,
				path: file.path,
				score,
				matchedTags: tagResult.matchedItems,
				matchedTitleFragments: titleResult.matchedItems,
				matchedContentFragments: contentResult.matchedItems.slice(0, 3) // 限制显示片段数量
			};

		} catch (error) {
			console.error(`搜索文件 ${file.path} 时出错:`, error);
			return null;
		}
	}

	/**
	 * 动态组合评估
	 */
	private evaluateDynamicCombination(
		tagResult: DimensionResult,
		titleResult: DimensionResult,
		contentResult: DimensionResult,
		criteria: SearchCriteria
	): { matches: boolean } {
		const hasTagCriteria = criteria.tags.length > 0;
		const hasTitleCriteria = criteria.titleKeywords.length > 0;
		const hasContentCriteria = criteria.contentKeywords.length > 0;

		const activeDimensions = [hasTagCriteria, hasTitleCriteria, hasContentCriteria].filter(Boolean).length;

		if (activeDimensions === 1) {
			// 单一维度
			if (hasTagCriteria) return { matches: tagResult.matches };
			if (hasTitleCriteria) return { matches: titleResult.matches };
			if (hasContentCriteria) return { matches: contentResult.matches };
		} else if (activeDimensions === 2) {
			// 两维度关系
			return this.evaluateTwoDimensionRelation(
				tagResult, titleResult, contentResult, 
				hasTagCriteria, hasTitleCriteria, hasContentCriteria,
				criteria.twoDimensionRelation
			);
		} else {
			// 三维度关系
			return this.evaluateThreeDimensionRelation(
				tagResult, titleResult, contentResult, criteria.threeDimensionMode
			);
		}

		return { matches: false };
	}

	/**
	 * 评估两维度关系
	 */
	private evaluateTwoDimensionRelation(
		tagResult: DimensionResult,
		titleResult: DimensionResult,
		contentResult: DimensionResult,
		hasTagCriteria: boolean,
		hasTitleCriteria: boolean,
		hasContentCriteria: boolean,
		relation: 'AND' | 'OR'
	): { matches: boolean } {
		let results: boolean[] = [];

		if (hasTagCriteria) results.push(tagResult.matches);
		if (hasTitleCriteria) results.push(titleResult.matches);
		if (hasContentCriteria) results.push(contentResult.matches);

		if (relation === 'AND') {
			return { matches: results.every(r => r) };
		} else {
			return { matches: results.some(r => r) };
		}
	}

	/**
	 * 评估三维度关系
	 */
	private evaluateThreeDimensionRelation(
		tagResult: DimensionResult,
		titleResult: DimensionResult,
		contentResult: DimensionResult,
		mode: ThreeDimensionMode
	): { matches: boolean } {
		switch (mode) {
			case 'all_and':
				return { matches: tagResult.matches && titleResult.matches && contentResult.matches };
			
			case 'all_or':
				return { matches: tagResult.matches || titleResult.matches || contentResult.matches };
			
			case 'tags_and_title_or_content':
				return { matches: (tagResult.matches && titleResult.matches) || contentResult.matches };
			
			case 'tags_or_title_and_content':
				return { matches: (tagResult.matches || titleResult.matches) && contentResult.matches };
			
			case 'tags_and_title_or_content_2':
				return { matches: tagResult.matches && (titleResult.matches || contentResult.matches) };
			
			case 'tags_or_title_and_content_2':
				return { matches: tagResult.matches || (titleResult.matches && contentResult.matches) };
			
			default:
				return { matches: false };
		}
	}

	/**
	 * 评估标签维度
	 */
	private evaluateTagCriteria(
		cacheTags: any[],
		frontmatterTags: string[],
		criteria: SearchCriteria
	): DimensionResult {
		if (criteria.tags.length === 0) {
			return { matches: true, matchedItems: [], score: 0 };
		}

		const matchedTags: string[] = [];
		const allTags = [...cacheTags.map(t => t.tag), ...(frontmatterTags || [])];
		
		for (const searchTag of criteria.tags) {
			const normalizedSearchTag = searchTag.toLowerCase().trim();
			if (!normalizedSearchTag) continue;
			
			let tagMatched = false;
			
			for (const fileTag of allTags) {
				const cleanFileTag = fileTag.replace('#', '').toLowerCase();
				
				if (cleanFileTag === normalizedSearchTag || 
					cleanFileTag.includes(normalizedSearchTag) ||
					this.matchesPinyinInitials(cleanFileTag, normalizedSearchTag)) {
					matchedTags.push(fileTag.replace('#', ''));
					tagMatched = true;
					break;
				}
			}
			
			if (criteria.tagsMode === 'AND' && !tagMatched) {
				return { matches: false, matchedItems: [], score: 0 };
			}
		}
		
		const matches = criteria.tagsMode === 'AND' 
			? matchedTags.length === criteria.tags.length
			: matchedTags.length > 0;
		
		return {
			matches,
			matchedItems: matchedTags,
			score: matchedTags.length * 10
		};
	}

	/**
	 * 评估标题维度
	 */
	private evaluateTitleCriteria(title: string, criteria: SearchCriteria): DimensionResult {
		if (criteria.titleKeywords.length === 0) {
			return { matches: true, matchedItems: [], score: 0 };
		}

		const matchedFragments: string[] = [];
		const lowerTitle = title.toLowerCase();
		
		for (const keyword of criteria.titleKeywords) {
			const lowerKeyword = keyword.toLowerCase().trim();
			if (!lowerKeyword) continue;
			
			if (lowerTitle.includes(lowerKeyword)) {
				matchedFragments.push(keyword);
			} else if (criteria.titleMode === 'AND') {
				return { matches: false, matchedItems: [], score: 0 };
			}
		}
		
		const matches = criteria.titleMode === 'AND'
			? matchedFragments.length === criteria.titleKeywords.length
			: matchedFragments.length > 0;
		
		return {
			matches,
			matchedItems: matchedFragments,
			score: matchedFragments.length * 5
		};
	}

	/**
	 * 评估内容维度
	 */
	private evaluateContentCriteria(content: string, criteria: SearchCriteria): DimensionResult {
		if (criteria.contentKeywords.length === 0) {
			return { matches: true, matchedItems: [], score: 0 };
		}

		const matchedFragments: string[] = [];
		const lowerContent = content.toLowerCase();
		
		for (const keyword of criteria.contentKeywords) {
			const lowerKeyword = keyword.toLowerCase().trim();
			if (!lowerKeyword) continue;
			
			if (lowerContent.includes(lowerKeyword)) {
				const index = lowerContent.indexOf(lowerKeyword);
				const start = Math.max(0, index - 20);
				const end = Math.min(content.length, index + keyword.length + 20);
				const fragment = content.substring(start, end);
				matchedFragments.push(fragment);
			} else if (criteria.contentMode === 'AND') {
				return { matches: false, matchedItems: [], score: 0 };
			}
		}
		
		const matches = criteria.contentMode === 'AND'
			? matchedFragments.length === criteria.contentKeywords.length
			: matchedFragments.length > 0;
		
		return {
			matches,
			matchedItems: matchedFragments,
			score: matchedFragments.length * 1
		};
	}

	/**
	 * 重写计算分数方法以支持新的DimensionResult结构
	 */
	private calculateScore(
		tagResult: DimensionResult,
		titleResult: DimensionResult,
		contentResult: DimensionResult
	): number {
		return tagResult.score + titleResult.score + contentResult.score;
	}

	/**
	 * 检查是否为拼音首字母匹配（主要针对英文标签）
	 * @param fullTag 完整标签
	 * @param searchTerm 搜索词
	 */
	private matchesPinyinInitials(fullTag: string, searchTerm: string): boolean {
		// 提取标签的首字母
		const initials = fullTag
			.split(/[\s\-_]+/) // 按空格、连字符、下划线分割
			.map(word => word.charAt(0))
			.join('')
			.toLowerCase();
		
		// 检查搜索词是否匹配首字母
		return initials.startsWith(searchTerm);
	}

	/**
	 * 检查标签匹配 - 支持模糊匹配和独立的AND/OR模式
	 */
	private checkTagsMatch(cache: CachedMetadata | null, searchTags: string[], matchedTags: string[], tagsMode: 'AND' | 'OR'): boolean {
		if (searchTags.length === 0) return true;
		
		// 如果缓存为空，直接返回false
		if (!cache) return false;
		
		const fileTags = getAllTags(cache) || [];
		
		for (const searchTag of searchTags) {
			const normalizedSearchTag = searchTag.toLowerCase().trim();
			if (!normalizedSearchTag) continue;
			
			let tagMatched = false;
			
			// 遍历文件中的所有标签，进行模糊匹配
			for (const fileTag of fileTags) {
				const cleanFileTag = fileTag.replace('#', '').toLowerCase();
				
				// 支持多种匹配方式：
				// 1. 完全匹配
				if (cleanFileTag === normalizedSearchTag) {
					matchedTags.push(fileTag.replace('#', ''));
					tagMatched = true;
					break;
				}
				// 2. 包含匹配（部分字符串匹配）
				else if (cleanFileTag.includes(normalizedSearchTag)) {
					matchedTags.push(fileTag.replace('#', ''));
					tagMatched = true;
					break;
				}
				// 3. 拼音首字母匹配（针对英文标签）
				else if (this.matchesPinyinInitials(cleanFileTag, normalizedSearchTag)) {
					matchedTags.push(fileTag.replace('#', ''));
					tagMatched = true;
					break;
				}
			}
			
			// 根据标签模式判断
			if (tagsMode === 'AND' && !tagMatched) {
				// AND模式：如果有任何一个标签不匹配，直接返回false
				return false;
			} else if (tagsMode === 'OR' && tagMatched) {
				// OR模式：如果有任何一个标签匹配，记录并继续
				// 这里不直接返回true，因为要继续匹配其他标签
			}
		}
		
		// 最终判断
		if (tagsMode === 'AND') {
			// AND模式：所有标签都必须匹配，此时matchedTags长度应该等于searchTags长度
			return matchedTags.length === searchTags.length;
		} else {
			// OR模式：至少有一个标签匹配
			return matchedTags.length > 0;
		}
	}

	/**
	 * 获取所有可用的标签建议
	 */
	getAllTagSuggestions(): TagSuggestion[] {
		const tagCounts = new Map<string, number>();
		const files = this.app.vault.getMarkdownFiles();
		
		for (const file of files) {
			const cache = this.app.metadataCache.getFileCache(file);
			// 如果缓存为空，跳过这个文件
			if (!cache) continue;
			
			const tags = getAllTags(cache) || [];
			
			for (const tag of tags) {
				const cleanTag = tag.replace('#', '');
				tagCounts.set(cleanTag, (tagCounts.get(cleanTag) || 0) + 1);
			}
		}
		
		return Array.from(tagCounts.entries())
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count);
	}

	/**
	 * 根据输入获取匹配的标签建议
	 * @param input 用户输入的文本
	 * @returns 匹配的标签建议列表
	 */
	getMatchingTagSuggestions(input: string): TagSuggestion[] {
		if (!input.trim()) return this.getAllTagSuggestions();
		
		const allTags = this.getAllTagSuggestions();
		const normalizedInput = input.toLowerCase().trim();
		
		return allTags.filter(tagSuggestion => {
			const tag = tagSuggestion.tag.toLowerCase();
			
			// 多种匹配方式
			return tag.includes(normalizedInput) || 
			       this.matchesPinyinInitials(tag, normalizedInput) ||
			       tag.startsWith(normalizedInput);
		});
	}
} 