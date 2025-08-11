// 支持的语言
export type Language = "en" | "zh-cn";

// 翻译文本类型定义
export interface Translations {
	// 插件基本信息
	pluginName: string;
	pluginDescription: string;

	// 搜索面板
	advancedSearch: string;
	searchPlaceholder: string;

	// 标签筛选
	tagFilter: string;
	tagPlaceholder: string;
	clearAllTags: string;

	// 标题关键词
	titleKeywords: string;
	titlePlaceholder: string;
	clearTitle: string;

	// 内容关键词
	contentKeywords: string;
	contentPlaceholder: string;
	clearContent: string;

	// 搜索模式
	searchMode: string;
	andMode: string;
	orMode: string;

	// 关系设置
	relationSettings: string;
	twoDimensionRelation: string;
	threeDimensionMode: string;

	// 时间筛选
	timeFilter: string;
	timeRangeFilter: string;
	startTime: string;
	endTime: string;
	clearTimeRange: string;
	enableTimeFilter: string;

	// 搜索结果
	searchResults: string;
	noResults: string;
	searchCount: string;
	matchScore: string;

	// 分页
	previousPage: string;
	nextPage: string;
	pageInfo: string;

	// 设置页面
	settings: string;
	dimensionRelations: string;
	dimensionInnerRelations: string;
	tagSearchMode: string;
	tagSearchModeDesc: string;
	titleSearchMode: string;
	titleSearchModeDesc: string;
	contentSearchMode: string;
	contentSearchModeDesc: string;
	twoDimensionRelationName: string;
	twoDimensionRelationDesc: string;
	threeDimensionModeName: string;
	threeDimensionModeDesc: string;
	basicSettings: string;
	resultPageSize: string;
	resultPageSizeDesc: string;
	showMatchScore: string;
	showMatchScoreDesc: string;
	enableFuzzySearch: string;
	enableFuzzySearchDesc: string;
	showConfigPanel: string;
	showConfigPanelDesc: string;

	// 使用说明
	instructions: string;
	instructionsTitle: string;
	instructionsList: string[];
	searchModeDetail: string;
	dimensionInnerRelation: string;
	dimensionInnerModes: string[];
	dimensionOuterRelation: string;
	dimensionOuterModes: string[];
	searchExamples: string;
	exampleWorkMeeting: string;
	exampleTechLearning: string;
	shortcuts: string;
	shortcutsList: string[];

	// 搜索模式选项
	searchModeOptions: {
		tagOr: string;
		tagAnd: string;
		titleOr: string;
		titleAnd: string;
		contentOr: string;
		contentAnd: string;
		twoDimensionAnd: string;
		twoDimensionOr: string;
	};

	// 三维度模式
	threeDimensionModes: {
		allAnd: string;
		allOr: string;
		tagsAndTitleOrContent: string;
		tagsOrTitleAndContent: string;
		tagsAndTitleOrContent2: string;
		tagsOrTitleAndContent2: string;
	};

	// 命令
	commands: {
		openSearchPanel: string;
		quickSearchSelection: string;
	};

	// 通知
	notices: {
		searchCompleted: string;
		noResultsFound: string;
	};

	// UI 操作文本
	ui: {
		showHideConfig: string;
		openFile: string;
		copyPath: string;
		revealInNavigator: string;
		search: string;
		clear: string;
		pleaseEnterSearchCriteria: string;
		searching: string;
		searchFailed: string;
		searchFailedNotice: string;
		matchedTags: string;
		titleMatch: string;
		contentFragment: string;
		preview: string;
		openInNewWindow: string;
		copyFilePath: string;
		copyFileName: string;
		rename: string;
		delete: string;
		openInNewWindowFailed: string;
		filePathCopied: string;
		copyFilePathFailed: string;
		fileNameCopied: string;
		copyFileNameFailed: string;
		renameFailed: string;
		renameFile: string;
		currentFileName: string;
		newFileName: string;
		enterNewFileName: string;
		cancel: string;
		confirm: string;
		pleaseEnterFileName: string;
		fileNameExists: string;
		fileRenamed: string;
		fileDeleted: string;
		deleteFileFailed: string;
		previewFailed: string;
		createPreviewFailed: string;
		renderMarkdownFailed: string;
		dimensionRelation: string;
		combinationMode: string;
		allAndStrict: string;
		allOrLoose: string;
		tagsAndTitleOrContent: string;
		tagsOrTitleAndContent: string;
		tagsAndTitleOrContent2: string;
		tagsOrTitleAndContent2: string;
		combinationModeHint: string;
		selectTimeRange: string;
		startTimeLabel: string;
		endTimeLabel: string;
		enableTimeFilterLabel: string;
		quickSelect: string;
		lastWeek: string;
		lastMonth: string;
		lastThreeMonths: string;
		lastYear: string;
		lastTwoYears: string;
		lastThreeYears: string;
		clearTime: string;
		hideConfigPanel: string;
		showConfigPanel: string;
		timeFilterPrefix: string;
		timeFilterEnabled: string;
		removeTimeFilter: string;
	};
}
