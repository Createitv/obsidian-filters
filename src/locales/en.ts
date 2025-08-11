import { Translations } from "../types/i18n";

export const enUS: Translations = {
	pluginName: "SearchPlus",
	pluginDescription:
		"Advanced search plugin with tags, title, and content filtering capabilities",

	advancedSearch: "Advanced Search",
	searchPlaceholder: "Enter search terms...",

	tagFilter: "Tag Filter",
	tagPlaceholder: "e.g.: work,study,notes or work, study, notes",
	clearAllTags: "Clear all tags",

	titleKeywords: "Title Keywords",
	titlePlaceholder: "e.g.: meeting,summary or meeting, summary",
	clearTitle: "Clear title keywords",

	contentKeywords: "Content Keywords",
	contentPlaceholder:
		"e.g.: Python,machine learning or Python, machine learning",
	clearContent: "Clear content keywords",

	searchMode: "Search Mode",
	andMode: "AND",
	orMode: "OR",

	relationSettings: "Relation Settings",
	twoDimensionRelation: "Two-Dimension Relation",
	threeDimensionMode: "Three-Dimension Mode",

	timeFilter: "Time Filter",
	timeRangeFilter: "Time Range Filter",
	startTime: "Start Time",
	endTime: "End Time",
	clearTimeRange: "Clear time range",
	enableTimeFilter: "Enable time filter",

	searchResults: "Search Results",
	noResults: "No matching results found",
	searchCount: "Found {count} results",
	matchScore: "Match Score: {score}",

	previousPage: "Previous",
	nextPage: "Next",
	pageInfo: "Page {current} of {total}",

	settings: "SearchPlus Settings",
	dimensionRelations: "Intra-Dimension Relations",
	dimensionInnerRelations: "Inter-Dimension Relations",
	tagSearchMode: "Tag Search Mode",
	tagSearchModeDesc: "Relationship between multiple tags",
	titleSearchMode: "Title Search Mode",
	titleSearchModeDesc: "Relationship between multiple title keywords",
	contentSearchMode: "Content Search Mode",
	contentSearchModeDesc: "Relationship between multiple content keywords",
	twoDimensionRelationName: "Two-Dimension Relation",
	twoDimensionRelationDesc:
		"Relationship when only two search dimensions are used",
	threeDimensionModeName: "Three-Dimension Mode",
	threeDimensionModeDesc:
		"Combination strategy when three search dimensions are used",
	basicSettings: "Basic Settings",
	resultPageSize: "Results Per Page",
	resultPageSizeDesc:
		"Maximum number of search results per page (recommended: 10-50)",
	showMatchScore: "Show Match Score",
	showMatchScoreDesc:
		"Display match scores in search results (for debugging and optimization)",
	enableFuzzySearch: "Enable Fuzzy Search",
	enableFuzzySearchDesc:
		"Allow partial matching and pinyin initial matching (experimental feature)",
	showConfigPanel: "Show Config Panel",
	showConfigPanelDesc: "Show search configuration panel by default",

	instructions: "Instructions",
	instructionsTitle:
		"🔍 SearchPlus provides multi-dimensional advanced search:",
	instructionsList: [
		"Tag Filter: Multi-select and fuzzy matching for notes with specific tags",
		"Title Keywords: Search keywords in note titles",
		"Content Keywords: Search keywords in note content",
		"Each dimension can independently set AND/OR relationships",
		"Inter-dimension relationships support pairwise configuration (tags&title, tags&content, title&content)",
	],
	searchModeDetail: "Search Mode Details",
	dimensionInnerRelation: "Intra-Dimension Relations",
	dimensionInnerModes: [
		"Tag OR Mode: Match any tag (recommended)",
		"Tag AND Mode: Must contain all tags",
		"Title/Content OR Mode: Match any keyword",
		"Title/Content AND Mode: Must contain all keywords",
	],
	dimensionOuterRelation: "Inter-Dimension Relations",
	dimensionOuterModes: [
		"Tags & Title: Controls combination of tag and title conditions",
		"Tags & Content: Controls combination of tag and content conditions",
		"Title & Content: Controls combination of title and content conditions",
	],
	searchExamples: "Search Examples",
	exampleWorkMeeting:
		"Example 1: Find work-related meeting records\n• Tags: work (any mode)\n• Title: meeting,conference (OR mode)\n• Tags&Title: AND",
	exampleTechLearning:
		"Example 2: Find learning materials with specific technologies\n• Tags: learning,tech (OR mode)\n• Content: Python,machine learning (OR mode)\n• Tags&Content: AND",
	shortcuts: "Quick Operations",
	shortcutsList: [
		"Click the search icon in the left ribbon to open search panel",
		"Use 'Quick search selected text' command after selecting text in editor",
		"Tag input supports real-time suggestions and keyboard navigation (↑↓ to select, Enter to confirm)",
		"Assign custom hotkeys to plugin commands in hotkey settings",
	],

	// 搜索模式选项
	searchModeOptions: {
		tagOr: "Match any tag",
		tagAnd: "Must contain all tags",
		titleOr: "Match any keyword",
		titleAnd: "Must contain all keywords",
		contentOr: "Match any keyword",
		contentAnd: "Must contain all keywords",
		twoDimensionAnd: "Must satisfy both conditions",
		twoDimensionOr: "Satisfy any condition",
	},

	threeDimensionModes: {
		allAnd: "All AND - Strict matching",
		allOr: "All OR - Loose matching",
		tagsAndTitleOrContent: "(Tags AND Title) OR Content",
		tagsOrTitleAndContent: "(Tags OR Title) AND Content",
		tagsAndTitleOrContent2: "Tags AND (Title OR Content)",
		tagsOrTitleAndContent2: "Tags OR (Title AND Content)",
	},

	commands: {
		openSearchPanel: "Open Advanced Search Panel",
		quickSearchSelection: "Quick Search Selected Text",
	},

	notices: {
		searchCompleted: "Search completed",
		noResultsFound: "No matching results found",
	},

	// UI operations text
	ui: {
		showHideConfig: "Show/Hide config panel",
		openFile: "Open file",
		copyPath: "Copy path",
		revealInNavigator: "Reveal in file navigator",
		search: "Search",
		clear: "Clear",
		pleaseEnterSearchCriteria: "Please enter search criteria",
		searching: "Searching...",
		searchFailed: "Search failed",
		searchFailedNotice: "Search failed, please check input criteria",
		matchedTags: "Tags: ",
		titleMatch: "Title match: ",
		contentFragment: "Content fragment: ",
		preview: "Preview",
		openInNewWindow: "Open in new window",
		copyFilePath: "Copy file path",
		copyFileName: "Copy file name",
		rename: "Rename",
		delete: "Delete",
		openInNewWindowFailed: "Failed to open file in new window:",
		filePathCopied: "File path copied to clipboard",
		copyFilePathFailed: "Failed to copy file path",
		fileNameCopied: "File name copied to clipboard",
		copyFileNameFailed: "Failed to copy file name",
		renameFailed: "Failed to rename file",
		renameFile: "Rename File",
		currentFileName: "Current file name:",
		newFileName: "New file name:",
		enterNewFileName: "Enter new file name (without extension)",
		cancel: "Cancel",
		confirm: "Confirm",
		pleaseEnterFileName: "Please enter new file name",
		fileNameExists: "File name already exists, please use a different name",
		fileRenamed: "File renamed successfully",
		fileDeleted: "File deleted",
		deleteFileFailed: "Failed to delete file",
		previewFailed: "Failed to preview file",
		createPreviewFailed: "Failed to create preview window",
		renderMarkdownFailed: "Failed to render Markdown",
		dimensionRelation: "Dimension Relation",
		combinationMode: "Combination Mode",
		allAndStrict: "All AND (Strictest)",
		allOrLoose: "All OR (Loosest)",
		tagsAndTitleOrContent: "(Tags AND Title) OR Content",
		tagsOrTitleAndContent: "(Tags OR Title) AND Content",
		tagsAndTitleOrContent2: "Tags AND (Title OR Content)",
		tagsOrTitleAndContent2: "Tags OR (Title AND Content)",
		combinationModeHint:
			"💡 Choose different combination modes to precisely control the relationship between three search dimensions",
		selectTimeRange: "Select Time Range",
		startTimeLabel: "Start time:",
		endTimeLabel: "End time:",
		enableTimeFilterLabel: " Enable time filter",
		quickSelect: "Quick Select",
		lastWeek: "Last week",
		lastMonth: "Last month",
		lastThreeMonths: "Last 3 months",
		lastYear: "Last year",
		lastTwoYears: "Last 2 years",
		lastThreeYears: "Last 3 years",
		clearTime: "Clear",
		hideConfigPanel: "Hide config panel",
		showConfigPanel: "Show config panel",
		timeFilterPrefix: "Time filter: ",
		timeFilterEnabled: "Enabled",
		removeTimeFilter: "Remove time filter",
	},
};
