# 数独大师 (Sudoku Master)

一款基于 HTML5 的多模式数独游戏，支持经典数独、杀手数独、拼图数独、迷你数独、巨无霸数独和环状数独。支持 Web 在线玩、打包为 Windows 桌面应用。

## 🎮 游戏模式

| 模式 | 棋盘 | 说明 |
|------|------|------|
| 经典数独 | 9×9 | 6级难度（快速/简单/中等/困难/专家/大师） |
| 迷你数独 | 6×6 / 4×4 | 适合初学者和儿童 |
| 杀手数独 | 9×9 | 结合数和玩法，无预填数字 |
| 拼图数独 | 9×9 | 不规则宫格划分 |
| 巨无霸数独 | 16×16 | 1-9+A-G，支持缩放 |
| 环状数独 | 5环×10段 | 圆形棋盘，0-9数字 |

## ✨ 功能特性

- **游戏辅助：** 撤销/重做、笔记模式、提示、擦除
- **智能高亮：** 自动检查、高亮重复/相同数字/关联区域
- **主题切换：** 浅色/深色/跟随系统
- **存档系统：** 自动保存，最多5个存档槽
- **每日挑战：** 基于日期的统一谜题，连胜统计
- **统计系统：** 完成数、最佳用时、胜率
- **键盘支持：** 方向键导航、数字键输入、快捷键
- **响应式设计：** 适配手机/平板/桌面

## 🚀 快速开始

### 方式一：直接运行桌面应用（推荐）

下载并运行 `SudokuMaster.exe`：
- [下载最新版本](https://github.com/x1403778770/Sudoku/releases)
- 解压后双击 `SudokuMaster.exe` 即可开始游戏
- 无需安装任何依赖，完全离线可用

### 方式二：Web 在线玩

用浏览器打开 `www/index.html` 即可：

```bash
# 方式1：直接打开
start www/index.html

# 方式2：使用本地服务器（推荐）
npx serve .
# 或
python -m http.server 8080
```

### 方式三：自行打包桌面应用

```bash
# 安装依赖
npm install

# 打包 Windows 应用
npm run build

# 打包完成后，应用位于 release/win-unpacked/SudokuMaster.exe
```

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| 1-9 | 填入数字 |
| A-G | 填入10-16（巨无霸模式） |
| 方向键 | 移动选中格子 |
| Backspace/Delete | 擦除 |
| N | 切换笔记模式 |
| H | 使用提示 |
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |

## 📁 项目结构

```
Sudoku/
├── www/                    # Web 应用目录
│   ├── index.html         # 入口页面
│   ├── css/               # 样式文件
│   │   ├── main.css       # 主样式
│   │   ├── grid.css       # 棋盘网格样式
│   │   ├── themes.css     # 主题配色
│   │   ├── animations.css # 动画效果
│   │   └── responsive.css # 响应式样式
│   └── js/                 # 脚本文件
│       ├── utils.js           # 工具函数
│       ├── sudoku-solver.js   # 数独求解器
│       ├── sudoku-generator.js# 数独生成器
│       ├── killer-generator.js# 杀手数独生成器
│       ├── jigsaw-generator.js# 拼图数独生成器
│       ├── circular-generator.js# 环状数独生成器
│       ├── storage.js         # 本地存储管理
│       ├── statistics.js      # 统计数据管理
│       ├── daily-challenge.js# 每日挑战
│       ├── game-engine.js     # 游戏引擎
│       ├── grid-renderer.js   # 棋盘渲染
│       ├── input-handler.js    # 输入处理
│       ├── game-ui.js         # 游戏界面
│       └── app.js             # 应用入口
├── main.js                 # Electron 主进程
├── package.json            # 项目配置
├── capacitor.config.json   # Capacitor 配置
├── requirements.md         # 需求文档
└── README.md               # 本文档
```

## 🛠️ 技术栈

- **前端：** 原生 HTML5 + CSS3 + JavaScript（无框架依赖）
- **样式：** CSS Variables + Flexbox/Grid
- **存储：** localStorage
- **桌面打包：** Electron + electron-builder
- **移动打包：** Capacitor（Android APK）

## 🌐 浏览器兼容

- Chrome 80+
- Safari 14+
- Firefox 80+
- Edge 80+

## 📦 构建发布

### Windows 桌面应用

```bash
npm run build
# 输出：release/win-unpacked/SudokuMaster.exe
```

### Android APK

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
# 在 Android Studio 中构建 APK
```

## 📄 License

MIT
