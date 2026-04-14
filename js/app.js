window.App = (function () {
  var GameEngine = window.GameEngine;
  var GameUI = window.GameUI;
  var GridRenderer = window.GridRenderer;
  var InputHandler = window.InputHandler;
  var Storage = window.Storage;
  var Statistics = window.Statistics;
  var DailyChallenge = window.DailyChallenge;
  var Utils = window.SudokuUtils;

  var currentPage = 'home';

  function init() {
    applyTheme();
    showHome();
  }

  function showHome() {
    currentPage = 'home';
    GameEngine.destroyGame();
    InputHandler.unbindEvents();
    var app = document.getElementById('app');
    var saves = Storage.getSaves();
    var dailyData = DailyChallenge.getDailyData();
    var dailyCompleted = DailyChallenge.isDailyCompleted();
    var stats = Statistics.getStats();
    var totalGames = Statistics.getTotalGames();
    var totalWins = Statistics.getTotalWins();
    var html = '';
    html += '<div class="home-page">';
    html += '<header class="home-header">';
    html += '<h1 class="app-title">数独大师</h1>';
    html += '<button class="icon-btn" id="btn-settings" title="设置">⚙️</button>';
    html += '</header>';
    html += '<div class="quick-actions">';
    html += '<div class="action-card" id="card-continue">';
    if (saves.length > 0) {
      var s = saves[0];
      html += '<div class="action-icon">▶️</div>';
      html += '<div class="action-label">继续游戏</div>';
      html += '<div class="action-sub">' + GameUI.getModeLabel(s.mode) + ' · ' + GameUI.getDifficultyLabel(s.difficulty) + '</div>';
    } else {
      html += '<div class="action-icon">▶️</div>';
      html += '<div class="action-label">继续游戏</div>';
      html += '<div class="action-sub">暂无存档</div>';
    }
    html += '</div>';
    html += '<div class="action-card" id="card-daily">';
    html += '<div class="action-icon">📅</div>';
    html += '<div class="action-label">每日挑战</div>';
    html += '<div class="action-sub">' + (dailyCompleted ? '已完成 ✓' : '连胜 ' + dailyData.streak + ' 天') + '</div>';
    html += '</div>';
    html += '<div class="action-card" id="card-stats">';
    html += '<div class="action-icon">📊</div>';
    html += '<div class="action-label">统计数据</div>';
    html += '<div class="action-sub">胜率 ' + (totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0) + '%</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="section-title">选择游戏模式</div>';
    html += '<div class="mode-card" id="mode-classic">';
    html += '<div class="mode-header"><span class="mode-icon">🧩</span><span class="mode-name">经典数独</span><span class="mode-size">9×9</span></div>';
    html += '<div class="mode-difficulties">';
    html += '<button class="diff-btn" data-mode="classic" data-diff="quick">快速</button>';
    html += '<button class="diff-btn" data-mode="classic" data-diff="easy">简单</button>';
    html += '<button class="diff-btn primary" data-mode="classic" data-diff="medium">中等</button>';
    html += '<button class="diff-btn" data-mode="classic" data-diff="hard">困难</button>';
    html += '<button class="diff-btn" data-mode="classic" data-diff="expert">专家</button>';
    html += '<button class="diff-btn" data-mode="classic" data-diff="master">大师</button>';
    html += '</div></div>';
    html += '<div class="mode-card" id="mode-killer">';
    html += '<div class="mode-header"><span class="mode-icon">💀</span><span class="mode-name">杀手数独</span><span class="mode-size">9×9</span></div>';
    html += '<div class="mode-difficulties">';
    html += '<button class="diff-btn" data-mode="killer" data-diff="easy">简单</button>';
    html += '<button class="diff-btn primary" data-mode="killer" data-diff="medium">中等</button>';
    html += '<button class="diff-btn" data-mode="killer" data-diff="hard">困难</button>';
    html += '<button class="diff-btn" data-mode="killer" data-diff="expert">专家</button>';
    html += '</div></div>';
    html += '<div class="mode-card" id="mode-jigsaw">';
    html += '<div class="mode-header"><span class="mode-icon">🧩</span><span class="mode-name">拼图数独</span><span class="mode-size">9×9</span></div>';
    html += '<div class="mode-difficulties">';
    html += '<button class="diff-btn" data-mode="jigsaw" data-diff="easy">简单</button>';
    html += '<button class="diff-btn primary" data-mode="jigsaw" data-diff="medium">中等</button>';
    html += '<button class="diff-btn" data-mode="jigsaw" data-diff="hard">困难</button>';
    html += '<button class="diff-btn" data-mode="jigsaw" data-diff="expert">专家</button>';
    html += '</div></div>';
    html += '<div class="mode-row">';
    html += '<div class="mode-card mini" id="mode-mini">';
    html += '<div class="mode-header"><span class="mode-icon">🔹</span><span class="mode-name">迷你数独</span></div>';
    html += '<div class="mode-difficulties">';
    html += '<button class="diff-btn" data-mode="mini6x6" data-diff="easy">6×6</button>';
    html += '<button class="diff-btn" data-mode="mini4x4" data-diff="easy">4×4</button>';
    html += '</div></div>';
    html += '<div class="mode-card mini" id="mode-giant">';
    html += '<div class="mode-header"><span class="mode-icon">🔷</span><span class="mode-name">巨无霸数独</span><span class="mode-size">16×16</span></div>';
    html += '<div class="mode-difficulties">';
    html += '<button class="diff-btn" data-mode="giant" data-diff="easy">简单</button>';
    html += '<button class="diff-btn" data-mode="giant" data-diff="medium">中等</button>';
    html += '<button class="diff-btn" data-mode="giant" data-diff="hard">困难</button>';
    html += '</div></div>';
    html += '</div>';
    html += '<div class="mode-card" id="mode-circular">';
    html += '<div class="mode-header"><span class="mode-icon">⭕</span><span class="mode-name">环状数独</span><span class="mode-size">5环×10段</span></div>';
    html += '<div class="mode-difficulties">';
    html += '<button class="diff-btn" data-mode="circular" data-diff="easy">简单</button>';
    html += '<button class="diff-btn primary" data-mode="circular" data-diff="medium">中等</button>';
    html += '<button class="diff-btn" data-mode="circular" data-diff="hard">困难</button>';
    html += '</div></div>';
    html += '</div>';
    app.innerHTML = html;
    bindHomeEvents();
  }

  function bindHomeEvents() {
    document.querySelectorAll('.diff-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = this.dataset.mode;
        var diff = this.dataset.diff;
        startGame(mode, diff);
      });
    });
    var continueCard = document.getElementById('card-continue');
    if (continueCard) {
      continueCard.addEventListener('click', function () {
        var saves = Storage.getSaves();
        if (saves.length > 0) {
          continueGame(saves[0]);
        }
      });
    }
    var dailyCard = document.getElementById('card-daily');
    if (dailyCard) {
      dailyCard.addEventListener('click', function () {
        startGame('daily', 'medium');
      });
    }
    var statsCard = document.getElementById('card-stats');
    if (statsCard) {
      statsCard.addEventListener('click', function () {
        showStatistics();
      });
    }
    var settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function () {
        showSettings();
      });
    }
  }

  function startGame(mode, difficulty) {
    currentPage = 'game';
    var app = document.getElementById('app');
    app.innerHTML =
      '<div class="game-page">' +
      '<header class="game-header">' +
      '<button class="icon-btn" id="btn-back">←</button>' +
      '<div id="game-status"></div>' +
      '<button class="icon-btn" id="btn-pause">⏸</button>' +
      '</header>' +
      '<div id="grid-container" class="grid-wrapper"></div>' +
      '<div id="loading-indicator" class="loading-indicator" style="display:none;"><div class="loading-spinner"></div><span>生成谜题中...</span></div>' +
      '<div id="toolbar" class="toolbar-wrapper"></div>' +
      '<div id="number-pad" class="numpad-wrapper"></div>' +
      '</div>' +
      '<div id="pause-overlay" class="pause-overlay" style="display:none;">' +
      '<div class="pause-content">' +
      '<h2>游戏暂停</h2>' +
      '<button class="btn btn-primary" id="btn-resume">继续</button>' +
      '<button class="btn btn-secondary" id="btn-quit">退出</button>' +
      '</div></div>' +
      '<div id="modal" class="modal" style="display:none;"></div>';
    GameUI.init();
    InputHandler.bindEvents();
    GameEngine.createGame(mode, difficulty);
    var backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        GameEngine.autoSave();
        showHome();
      });
    }
    var pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        GameEngine.pauseGame();
        GameUI.showPauseOverlay();
      });
    }
    var resumeBtn = document.getElementById('btn-resume');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        GameEngine.resumeGame();
        GameUI.hidePauseOverlay();
      });
    }
    var quitBtn = document.getElementById('btn-quit');
    if (quitBtn) {
      quitBtn.addEventListener('click', function () {
        GameEngine.autoSave();
        GameUI.hidePauseOverlay();
        showHome();
      });
    }
  }

  function continueGame(saveData) {
    currentPage = 'game';
    var app = document.getElementById('app');
    app.innerHTML =
      '<div class="game-page">' +
      '<header class="game-header">' +
      '<button class="icon-btn" id="btn-back">←</button>' +
      '<div id="game-status"></div>' +
      '<button class="icon-btn" id="btn-pause">⏸</button>' +
      '</header>' +
      '<div id="grid-container" class="grid-wrapper"></div>' +
      '<div id="loading-indicator" class="loading-indicator" style="display:none;"><div class="loading-spinner"></div><span>加载中...</span></div>' +
      '<div id="toolbar" class="toolbar-wrapper"></div>' +
      '<div id="number-pad" class="numpad-wrapper"></div>' +
      '</div>' +
      '<div id="pause-overlay" class="pause-overlay" style="display:none;">' +
      '<div class="pause-content">' +
      '<h2>游戏暂停</h2>' +
      '<button class="btn btn-primary" id="btn-resume">继续</button>' +
      '<button class="btn btn-secondary" id="btn-quit">退出</button>' +
      '</div></div>' +
      '<div id="modal" class="modal" style="display:none;"></div>';
    GameUI.init();
    InputHandler.bindEvents();
    GameEngine.loadGame(saveData);
    var backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        GameEngine.autoSave();
        showHome();
      });
    }
    var pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        GameEngine.pauseGame();
        GameUI.showPauseOverlay();
      });
    }
    var resumeBtn = document.getElementById('btn-resume');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', function () {
        GameEngine.resumeGame();
        GameUI.hidePauseOverlay();
      });
    }
    var quitBtn = document.getElementById('btn-quit');
    if (quitBtn) {
      quitBtn.addEventListener('click', function () {
        GameEngine.autoSave();
        GameUI.hidePauseOverlay();
        showHome();
      });
    }
  }

  function showSettings() {
    var settings = Storage.getSettings();
    var modal = document.getElementById('modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    modal.innerHTML =
      '<div class="modal-overlay">' +
      '<div class="modal-content settings-modal">' +
      '<h2>设置</h2>' +
      '<div class="setting-item"><span>主题</span><select id="set-theme"><option value="auto"' + (settings.theme === 'auto' ? ' selected' : '') + '>自动</option><option value="light"' + (settings.theme === 'light' ? ' selected' : '') + '>浅色</option><option value="dark"' + (settings.theme === 'dark' ? ' selected' : '') + '>深色</option></select></div>' +
      '<div class="setting-item"><span>自动检查</span><label class="switch"><input type="checkbox" id="set-autocheck"' + (settings.autoCheck ? ' checked' : '') + '><span class="slider"></span></label></div>' +
      '<div class="setting-item"><span>高亮重复</span><label class="switch"><input type="checkbox" id="set-highlightdup"' + (settings.highlightDuplicates ? ' checked' : '') + '><span class="slider"></span></label></div>' +
      '<div class="setting-item"><span>高亮相同数字</span><label class="switch"><input type="checkbox" id="set-highlightsame"' + (settings.highlightSameNumber ? ' checked' : '') + '><span class="slider"></span></label></div>' +
      '<div class="setting-item"><span>高亮关联区域</span><label class="switch"><input type="checkbox" id="set-highlightrel"' + (settings.highlightRelated ? ' checked' : '') + '><span class="slider"></span></label></div>' +
      '<div class="setting-item"><span>显示计时器</span><label class="switch"><input type="checkbox" id="set-timer"' + (settings.showTimer ? ' checked' : '') + '><span class="slider"></span></label></div>' +
      '<div class="setting-item"><span>错误限制(3次)</span><label class="switch"><input type="checkbox" id="set-errorlimit"' + (settings.errorLimit ? ' checked' : '') + '><span class="slider"></span></label></div>' +
      '<div class="setting-item"><span>音效</span><label class="switch"><input type="checkbox" id="set-sound"' + (settings.soundEnabled ? ' checked' : '') + '><span class="slider"></span></label></div>' +
      '<div class="modal-actions"><button class="btn btn-primary" id="btn-save-settings">保存</button><button class="btn btn-secondary" id="btn-cancel-settings">取消</button></div>' +
      '</div></div>';
    modal.style.display = 'block';
    document.getElementById('btn-save-settings').addEventListener('click', function () {
      var newSettings = {
        theme: document.getElementById('set-theme').value,
        autoCheck: document.getElementById('set-autocheck').checked,
        highlightDuplicates: document.getElementById('set-highlightdup').checked,
        highlightSameNumber: document.getElementById('set-highlightsame').checked,
        highlightRelated: document.getElementById('set-highlightrel').checked,
        showTimer: document.getElementById('set-timer').checked,
        errorLimit: document.getElementById('set-errorlimit').checked,
        soundEnabled: document.getElementById('set-sound').checked,
        language: 'zh',
      };
      Storage.saveSettings(newSettings);
      applyTheme();
      modal.style.display = 'none';
      var game = GameEngine.getGame();
      if (game) GameUI.renderGame(game);
    });
    document.getElementById('btn-cancel-settings').addEventListener('click', function () {
      modal.style.display = 'none';
    });
  }

  function showStatistics() {
    var stats = Statistics.getStats();
    var modal = document.getElementById('modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    var html = '<div class="modal-overlay"><div class="modal-content stats-modal">';
    html += '<h2>统计数据</h2>';
    var totalGames = Statistics.getTotalGames();
    var totalWins = Statistics.getTotalWins();
    html += '<div class="stats-overview">';
    html += '<div class="stat-box"><div class="stat-value">' + totalGames + '</div><div class="stat-label">总场次</div></div>';
    html += '<div class="stat-box"><div class="stat-value">' + totalWins + '</div><div class="stat-label">胜利</div></div>';
    html += '<div class="stat-box"><div class="stat-value">' + (totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0) + '%</div><div class="stat-label">胜率</div></div>';
    html += '</div>';
    var modes = ['classic', 'killer', 'jigsaw', 'mini6x6', 'mini4x4', 'giant', 'circular'];
    for (var m = 0; m < modes.length; m++) {
      var mode = modes[m];
      if (stats[mode]) {
        html += '<div class="stats-mode"><h3>' + GameUI.getModeLabel(mode) + '</h3>';
        for (var diff in stats[mode]) {
          var d = stats[mode][diff];
          html += '<div class="stat-row"><span>' + GameUI.getDifficultyLabel(diff) + '</span><span>胜 ' + d.won + '/' + d.played + '</span><span>最佳 ' + (d.bestTime === Infinity ? '-' : Utils.formatTime(d.bestTime)) + '</span></div>';
        }
        html += '</div>';
      }
    }
    var dailyData = DailyChallenge.getDailyData();
    html += '<div class="stats-mode"><h3>每日挑战</h3>';
    html += '<div class="stat-row"><span>连胜</span><span>' + dailyData.streak + ' 天</span></div>';
    html += '<div class="stat-row"><span>总计完成</span><span>' + dailyData.totalCompleted + ' 次</span></div>';
    html += '</div>';
    html += '<div class="modal-actions"><button class="btn btn-primary" id="btn-close-stats">关闭</button></div>';
    html += '</div></div>';
    modal.innerHTML = html;
    modal.style.display = 'block';
    document.getElementById('btn-close-stats').addEventListener('click', function () {
      modal.style.display = 'none';
    });
  }

  function applyTheme() {
    var settings = Storage.getSettings();
    var theme = settings.theme || 'auto';
    if (theme === 'auto') {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  return {
    init: init,
    showHome: showHome,
    startGame: startGame,
    showSettings: showSettings,
    showStatistics: showStatistics,
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
