import { App, PluginSettingTab, Setting } from "obsidian";
import SearchPlusPlugin from "../main";
import { SearchPlusSettings, ThreeDimensionMode } from "./types";
import { i18n } from "./i18n";
import { Language } from "./types/i18n";

/**
 * 默认设置配置
 */
export const DEFAULT_SETTINGS: SearchPlusSettings = {
	defaultTagsMode: "OR",
	defaultTitleMode: "OR",
	defaultContentMode: "AND",
	defaultTwoDimensionRelation: "AND",
	defaultThreeDimensionMode: "all_and",
	showSearchCount: false,
	resultPageSize: 20,
	enableFuzzySearch: false,
	showConfigPanel: true,
	language: "zh-cn",
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

		// 初始化国际化
		i18n.setLanguage(this.plugin.settings.language);

		containerEl.createEl("h2", { text: i18n.t("settings") });

		// 语言设置
		new Setting(containerEl)
			.setName("Language / 语言")
			.setDesc("Select plugin language / 选择插件语言")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("zh-cn", "中文")
					.addOption("en", "English")
					.setValue(this.plugin.settings.language)
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"language",
							value as Language
						);
						i18n.setLanguage(value as Language);
						this.display(); // 重新渲染页面以应用新语言
					})
			);

		// 维度内关系设置
		containerEl.createEl("h3", { text: i18n.t("dimensionRelations") });

		// 默认标签搜索模式
		new Setting(containerEl)
			.setName(i18n.t("tagSearchMode"))
			.setDesc(i18n.t("tagSearchModeDesc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption(
						"OR",
						`OR - ${
							i18n.getCurrentLanguage() === "zh-cn"
								? "任一标签匹配即可"
								: "Match any tag"
						}`
					)
					.addOption(
						"AND",
						`AND - ${
							i18n.getCurrentLanguage() === "zh-cn"
								? "必须包含所有标签"
								: "Must contain all tags"
						}`
					)
					.setValue(this.plugin.settings.defaultTagsMode)
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"defaultTagsMode",
							value as "AND" | "OR"
						);
					})
			);

		// 默认标题搜索模式
		new Setting(containerEl)
			.setName(i18n.t("titleSearchMode"))
			.setDesc(i18n.t("titleSearchModeDesc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption(
						"OR",
						`OR - ${
							i18n.getCurrentLanguage() === "zh-cn"
								? "任一关键词匹配即可"
								: "Match any keyword"
						}`
					)
					.addOption(
						"AND",
						`AND - ${
							i18n.getCurrentLanguage() === "zh-cn"
								? "必须包含所有关键词"
								: "Must contain all keywords"
						}`
					)
					.setValue(this.plugin.settings.defaultTitleMode)
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"defaultTitleMode",
							value as "AND" | "OR"
						);
					})
			);

		// 默认内容搜索模式
		new Setting(containerEl)
			.setName(i18n.t("contentSearchMode"))
			.setDesc(i18n.t("contentSearchModeDesc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption(
						"AND",
						`AND - ${i18n.t("searchModeOptions.contentAnd")}`
					)
					.addOption(
						"OR",
						`OR - ${i18n.t("searchModeOptions.contentOr")}`
					)
					.setValue(this.plugin.settings.defaultContentMode)
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"defaultContentMode",
							value as "AND" | "OR"
						);
					})
			);

		// 维度间关系设置
		containerEl.createEl("h3", { text: i18n.t("dimensionInnerRelations") });

		// 两维度关系
		new Setting(containerEl)
			.setName(i18n.t("twoDimensionRelationName"))
			.setDesc(i18n.t("twoDimensionRelationDesc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption(
						"AND",
						`AND - ${i18n.t("searchModeOptions.twoDimensionAnd")}`
					)
					.addOption(
						"OR",
						`OR - ${i18n.t("searchModeOptions.twoDimensionOr")}`
					)
					.setValue(this.plugin.settings.defaultTwoDimensionRelation)
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"defaultTwoDimensionRelation",
							value as "AND" | "OR"
						);
					})
			);

		// 三维度组合模式
		new Setting(containerEl)
			.setName(i18n.t("threeDimensionModeName"))
			.setDesc(i18n.t("threeDimensionModeDesc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("all_and", i18n.t("threeDimensionModes.allAnd"))
					.addOption("all_or", i18n.t("threeDimensionModes.allOr"))
					.addOption(
						"tags_and_title_or_content",
						i18n.t("threeDimensionModes.tagsAndTitleOrContent")
					)
					.addOption(
						"tags_or_title_and_content",
						i18n.t("threeDimensionModes.tagsOrTitleAndContent")
					)
					.addOption(
						"tags_and_title_or_content_2",
						i18n.t("threeDimensionModes.tagsAndTitleOrContent2")
					)
					.addOption(
						"tags_or_title_and_content_2",
						i18n.t("threeDimensionModes.tagsOrTitleAndContent2")
					)
					.setValue(this.plugin.settings.defaultThreeDimensionMode)
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"defaultThreeDimensionMode",
							value as ThreeDimensionMode
						);
					})
			);

		// 基本功能设置
		containerEl.createEl("h3", { text: i18n.t("basicSettings") });

		// 每页显示结果数
		new Setting(containerEl)
			.setName(i18n.t("resultPageSize"))
			.setDesc(i18n.t("resultPageSizeDesc"))
			.addSlider((slider) =>
				slider
					.setLimits(1, 100, 1)
					.setValue(this.plugin.settings.resultPageSize)
					.setDynamicTooltip()
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"resultPageSize",
							value
						);
					})
			);

		// 显示匹配分数
		new Setting(containerEl)
			.setName(i18n.t("showMatchScore"))
			.setDesc(i18n.t("showMatchScoreDesc"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showSearchCount)
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"showSearchCount",
							value
						);
					})
			);

		// 启用模糊搜索
		new Setting(containerEl)
			.setName(i18n.t("enableFuzzySearch"))
			.setDesc(i18n.t("enableFuzzySearchDesc"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableFuzzySearch)
					.onChange(async (value) => {
						await this.plugin.updateSetting(
							"enableFuzzySearch",
							value
						);
					})
			);

		// 使用说明
		const instructionsContainer = containerEl.createDiv(
			"search-plus-instructions"
		);
		instructionsContainer.createEl("h3", { text: i18n.t("instructions") });
		instructionsContainer.createEl("p", {
			text: i18n.t("instructionsTitle"),
		});

		const instructionsList = instructionsContainer.createEl("ul");
		const instructionsListItems = i18n.getTranslations().instructionsList;
		instructionsListItems.forEach((item) => {
			instructionsList.createEl("li", { text: item });
		});

		// 搜索模式说明
		const modesContainer = containerEl.createDiv("search-plus-modes");
		modesContainer.createEl("h3", { text: i18n.t("searchModeDetail") });

		const modesContent = modesContainer.createEl("div");

		// 维度内关系
		const innerRelationSection = modesContent.createEl("div");
		innerRelationSection.createEl("h4", {
			text: i18n.t("dimensionInnerRelation"),
		});
		const innerModesList = innerRelationSection.createEl("ul");
		const innerModes = i18n.getTranslations().dimensionInnerModes;
		innerModes.forEach((mode) => {
			innerModesList.createEl(
				"li"
			).innerHTML = `<strong>${mode}</strong>`;
		});

		// 维度间关系
		const outerRelationSection = modesContent.createEl("div");
		outerRelationSection.createEl("h4", {
			text: i18n.t("dimensionOuterRelation"),
		});
		const outerModesList = outerRelationSection.createEl("ul");
		const outerModes = i18n.getTranslations().dimensionOuterModes;
		outerModes.forEach((mode) => {
			outerModesList.createEl(
				"li"
			).innerHTML = `<strong>${mode}</strong>`;
		});

		// 搜索示例
		const examplesSection = modesContent.createEl("div");
		examplesSection.createEl("h4", { text: i18n.t("searchExamples") });

		const example1 = examplesSection.createEl("div");
		example1.innerHTML = i18n
			.t("exampleWorkMeeting")
			.replace(/\n/g, "<br>");

		const example2 = examplesSection.createEl("div");
		example2.innerHTML = i18n
			.t("exampleTechLearning")
			.replace(/\n/g, "<br>");

		// 快捷键说明
		const shortcutsContainer = containerEl.createDiv(
			"search-plus-shortcuts"
		);
		shortcutsContainer.createEl("h3", { text: i18n.t("shortcuts") });

		const shortcutsList = shortcutsContainer.createEl("ul");
		const shortcutsListItems = i18n.getTranslations().shortcutsList;
		shortcutsListItems.forEach((item) => {
			shortcutsList.createEl("li", { text: item });
		});
	}
}
