# 数独大师 (Sudoku Master)

一款基于 HTML5 的多模式数独游戏，支持经典数独、杀手数独、拼图数独、迷你数独、巨无霸数独和环状数独。

## 游戏模式

| 模式 | 棋盘 | 说明 |
|------|------|------|
| 经典数独 | 9×9 | 6级难度（快速/简单/中等/困难/专家/大师） |
| 迷你数独 | 6×6 / 4×4 | 适合初学者和儿童 |
| 杀手数独 | 9×9 | 结合数和玩法，无预填数字 |
| 拼图数独 | 9×9 | 不规则宫格划分 |
| 巨无霸数独 | 16×16 | 1-9+A-G，支持缩放 |
| 环状数独 | 5环×10段 | 圆形棋盘，0-9数字 |

## 功能特性

- **游戏辅助：** 撤销/重做、笔记模式、提示、擦除
- **智能高亮：** 自动检查、高亮重复/相同数字/关联区域
- **主题切换：** 浅色/深色/跟随系统
- **存档系统：** 自动保存，最多5个存档槽
- **每日挑战：** 基于日期的统一谜题，连胜统计
- **统计系统：** 完成数、最佳用时、胜率
- **键盘支持：** 方向键导航、数字键输入、快捷键

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装依赖

```bash
npm install
```

### 运行游戏

```bash
npm start
```

### 打包成 exe

```bash
npm run build
```

打包完成后，可执行文件位于 `exe-output\win-unpacked\SudokuMaster.exe`，双击即可运行。

### 快捷键

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

## 项目结构

```
Sudoku/
├── main.js                # Electron 主进程
├── package.json           # 项目配置
├── www/
│   ├── index.html         # 入口页面
│   ├── css/
│   │   ├── main.css       # 主样式
│   │   ├── grid.css       # 棋盘网格样式
│   │   ├── themes.css     # 主题配色
│   │   ├── animations.css # 动画效果
│   │   └── responsive.css # 响应式样式
│   └── js/
│       ├── app.js         # 应用入口
│       ├── game-engine.js # 游戏引擎
│       ├── game-ui.js     # 游戏界面
│       ├── grid-renderer.js    # 棋盘渲染
│       ├── input-handler.js    # 输入处理
│       ├── sudoku-generator.js # 数独生成器
│       ├── sudoku-solver.js    # 数独求解器
│       ├── killer-generator.js # 杀手数独生成器
│       ├── jigsaw-generator.js # 拼图数独生成器
│       ├── circular-generator.js # 环状数独生成器
│       ├── daily-challenge.js   # 每日挑战
│       ├── statistics.js        # 统计数据管理
│       ├── storage.js           # 本地存储管理
│       └── utils.js             # 工具函数
└── .gitignore             # Git 忽略配置
```

## 技术栈

- **前端：** HTML5 + CSS3 + JavaScript（无框架依赖）
- **桌面端：** Electron + electron-builder
- **样式：** CSS Variables + Flexbox/Grid
- **存储：** localStorage

## License

MIT
