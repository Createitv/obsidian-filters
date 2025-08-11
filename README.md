# SearchPlus - Advanced Search Plugin for Obsidian

English | [中文](README_CN.md)

> 🔍 Powerful multi-dimensional advanced search capabilities for Obsidian

## ✨ Features

### 🎯 Multi-Dimensional Search
- **Tag Filter**: Multi-select with fuzzy matching to quickly find notes with specific tags
- **Title Keywords**: Precise keyword search within note titles
- **Content Keywords**: Deep search within note content
- **Time Range Filter**: Filter search results by creation time

### ⚙️ Flexible Search Logic
- **Intra-Dimension Relations**: Each dimension can independently set AND/OR relationships
  - Tag Mode: OR (match any) or AND (match all)
  - Title Mode: OR (any keyword) or AND (all keywords)
  - Content Mode: OR (any keyword) or AND (all keywords)

- **Inter-Dimension Relations**: Smart combination of different search dimensions
  - Two-Dimension Relation: AND (satisfy both) or OR (satisfy either)
  - Three-Dimension Mode: 6 combination strategies for complex search needs

### 🚀 Smart Features
- **Real-time Search Suggestions**: Auto-display tag suggestions while typing
- **Fuzzy Matching**: Support partial matching and pinyin initial matching
- **Search Result Highlighting**: Highlight matched content fragments
- **Paginated Browsing**: Smooth browsing experience with large result sets
- **Match Score Display**: Help understand search result relevance

### 🌐 Multi-Language Support
- Chinese Interface
- English Interface
- Runtime language switching

## 📦 Installation

### Method 1: Obsidian Community Plugins
1. Open Obsidian Settings
2. Go to "Community Plugins"
3. Search for "SearchPlus"
4. Click Install and Enable

### Method 2: Manual Installation
1. Download the latest release from [Releases](https://github.com/your-username/obsidian-search-plus/releases)
2. Extract the `SearchPlus` folder to your Obsidian plugins directory:
   - Windows: `%APPDATA%\Obsidian\plugins\`
   - macOS: `~/Library/Application Support/obsidian/plugins/`
   - Linux: `~/.config/obsidian/plugins/`
3. Restart Obsidian
4. Enable SearchPlus plugin in Settings

## 🎮 Usage Guide

### Quick Start
1. **Open Search Panel**: Click the search icon in the left toolbar
2. **Enter Search Criteria**:
   - Enter tags in the tag filter box, comma-separated
   - Enter title content to search in the title keywords box
   - Enter content to search in the content keywords box
3. **Adjust Search Mode**: Click AND/OR buttons to switch search logic
4. **View Results**: Search results display in real-time, click to open notes

### Search Examples

#### Example 1: Find Work-Related Meeting Records
```
Tag Filter: work
Title Keywords: meeting,conference
Search Mode:
- Tags: OR (any mode)
- Title: OR (any keyword match)
- Tags&Title: AND (must satisfy both)
```

#### Example 2: Find Technical Learning Materials
```
Tag Filter: learning,tech
Content Keywords: Python,machine learning
Search Mode:
- Tags: OR (any tag match)
- Content: OR (any keyword match)
- Tags&Content: AND (must satisfy both)
```

### Advanced Search Strategies

#### Three-Dimension Search Modes
When using tags, title, and content dimensions simultaneously, choose from:

1. **All AND**: Strict matching, all conditions must be satisfied
2. **All OR**: Loose matching, any condition satisfied
3. **(Tags AND Title) OR Content**: Tags and title must both be satisfied, or content satisfied
4. **(Tags OR Title) AND Content**: Tags or title satisfied, and content must be satisfied
5. **Tags AND (Title OR Content)**: Tags must be satisfied, title or content satisfied
6. **Tags OR (Title AND Content)**: Tags satisfied, or both title and content satisfied

#### Time Filtering
- Click the time filter button to set time range
- Support start time and end time
- Can set only start time or end time
- Filter based on note creation time

## ⚙️ Settings Options

### Search Behavior Settings
- **Default Search Mode**: Set default AND/OR relationship for each dimension
- **Results Per Page**: Control number of search results per page (recommended 10-50)
- **Show Match Score**: Enable to display match degree for each result
- **Enable Fuzzy Search**: Allow partial matching and pinyin initial matching

### Interface Settings
- **Language Settings**: Switch between Chinese and English
- **Show Config Panel**: Whether to show search configuration panel by default

## 🎯 Usage Tips

### Tag Search Tips
- Support Chinese and English comma separation: `work,study` or `work，study`
- Support fuzzy matching: Enter `learn` to match `learning`, `learned`, etc.
- Support initial matching: Enter `js` to match `javascript`

### Keyword Search Tips
- Use quotes for exact matching: `"machine learning"`
- Separate multiple keywords with commas: `Python,algorithm,data structure`
- Support mixed Chinese and English search

### Quick Operations
- **Hotkeys**: Assign hotkeys to plugin commands in Obsidian hotkey settings
- **Selection Search**: Select text and use "Quick search selected text" command
- **Keyboard Navigation**: Tag input supports ↑↓ selection, Enter to confirm

## 🔧 Development

### Project Structure
```
src/
├── types/                 # Type definitions
│   └── i18n.ts           # Internationalization types
├── locales/              # Language files
│   ├── zh-cn.ts          # Chinese translations
│   └── en.ts             # English translations
├── searchEngine.ts       # Search engine core
├── searchView.ts         # Search interface
├── settings.ts           # Settings page
├── i18n.ts              # Internationalization manager
└── types.ts             # Main type definitions
```

### Build Commands
```bash
# Development mode
npm run dev

# Production build
npm run build

# Create release package
npm run release
```

### Contributing
Issues and Pull Requests are welcome!

1. Fork this repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Create Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Thanks to all developers and users who contributed to this project!

---

If this plugin helps you, please consider giving it a ⭐️ star!

Questions or suggestions? Feel free to discuss in [GitHub Issues](https://github.com/your-username/obsidian-search-plus/issues).

**Note**: This plugin requires Obsidian 0.15.0 or higher.