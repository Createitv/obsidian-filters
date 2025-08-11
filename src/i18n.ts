import { Language, Translations } from "./types/i18n";
import { zhCN } from "./locales/zh-cn";
import { enUS } from "./locales/en";

// 翻译映射
const translations: Record<Language, Translations> = {
	"zh-cn": zhCN,
	en: enUS,
};

/**
 * 国际化管理类
 */
export class I18n {
	private currentLanguage: Language = "zh-cn";
	private translations: Translations;

	constructor() {
		this.detectLanguage();
		this.translations = translations[this.currentLanguage];
	}

	/**
	 * 检测当前语言
	 */
	private detectLanguage() {
		// 从 Obsidian 的语言设置中检测，如果无法检测则使用系统语言
		const obsidianLanguage =
			(window as any).app?.vault?.adapter?.getResourcePath?.("") || "";

		// 检测浏览器语言
		const browserLanguage =
			navigator.language || navigator.languages?.[0] || "en";

		if (browserLanguage.toLowerCase().includes("zh")) {
			this.currentLanguage = "zh-cn";
		} else {
			this.currentLanguage = "en";
		}
	}

	/**
	 * 设置语言
	 */
	setLanguage(language: Language) {
		this.currentLanguage = language;
		this.translations = translations[language];
	}

	/**
	 * 获取当前语言
	 */
	getCurrentLanguage(): Language {
		return this.currentLanguage;
	}

	/**
	 * 获取翻译文本
	 */
	t(key: string): string {
		const keys = key.split(".");
		let value: any = this.translations;

		for (const k of keys) {
			value = value?.[k];
			if (value === undefined) {
				console.warn(`Translation key not found: ${key}`);
				return key;
			}
		}

		return value;
	}

	/**
	 * 获取翻译文本并替换参数
	 */
	tp(key: string, params: Record<string, any>): string {
		let text = this.t(key);

		for (const [param, value] of Object.entries(params)) {
			text = text.replace(
				new RegExp(`\\{${param}\\}`, "g"),
				String(value)
			);
		}

		return text;
	}

	/**
	 * 获取所有翻译
	 */
	getTranslations(): Translations {
		return this.translations;
	}
}

// 创建全局实例
export const i18n = new I18n();
