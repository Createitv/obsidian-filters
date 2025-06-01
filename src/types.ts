// 三维度组合模式枚举
export type ThreeDimensionMode = 
	| 'tags_and_title_or_content'    // (标签 AND 标题) OR 内容
	| 'tags_or_title_and_content'    // (标签 OR 标题) AND 内容
	| 'tags_and_title_or_content_2'  // 标签 AND (标题 OR 内容)
	| 'tags_or_title_and_content_2'  // 标签 OR (标题 AND 内容)
	| 'all_and'                      // 全部 AND
	| 'all_or';                      // 全部 OR

// 时间范围接口
export interface TimeRange {
	// 开始时间（时间戳毫秒）
	startTime: number | null;
	// 结束时间（时间戳毫秒）
	endTime: number | null;
	// 是否启用时间筛选
	enabled: boolean;
}

// 搜索类型定义
export interface SearchPlusSettings {
	// 默认标签搜索模式
	defaultTagsMode: 'AND' | 'OR';
	// 默认标题搜索模式
	defaultTitleMode: 'AND' | 'OR';
	// 默认内容搜索模式
	defaultContentMode: 'AND' | 'OR';
	// 默认两维度关系
	defaultTwoDimensionRelation: 'AND' | 'OR';
	// 默认三维度组合模式
	defaultThreeDimensionMode: ThreeDimensionMode;
	// 是否显示搜索计数
	showSearchCount: boolean;
	// 每页显示的搜索结果数量
	resultPageSize: number;
	// 是否启用模糊搜索
	enableFuzzySearch: boolean;
	// 是否默认显示配置面板
	showConfigPanel: boolean;
}

// 搜索条件接口
export interface SearchCriteria {
	// 标签列表（多选）
	tags: string[];
	// 标签之间的搜索模式
	tagsMode: 'AND' | 'OR';
	// 标题关键词列表
	titleKeywords: string[];
	// 标题关键词之间的搜索模式
	titleMode: 'AND' | 'OR';
	// 内容关键词列表
	contentKeywords: string[];
	// 内容关键词之间的搜索模式
	contentMode: 'AND' | 'OR';
	// 两维度关系（当只有两个维度时使用）
	twoDimensionRelation: 'AND' | 'OR';
	// 三维度组合模式（当有三个维度时使用）
	threeDimensionMode: ThreeDimensionMode;
	// 时间范围筛选
	timeRange: TimeRange;
}

// 搜索结果接口
export interface SearchResult {
	// 文件对象
	file: any;
	// 文件路径
	path: string;
	// 文件标题
	title: string;
	// 匹配的标签
	matchedTags: string[];
	// 匹配的标题片段
	matchedTitleFragments: string[];
	// 匹配的内容片段
	matchedContentFragments: string[];
	// 匹配分数
	score: number;
}

// 标签建议接口
export interface TagSuggestion {
	tag: string;
	count: number;
}

// 维度评估结果接口
export interface DimensionResult {
	matches: boolean;
	matchedItems: string[];
	score: number;
} 