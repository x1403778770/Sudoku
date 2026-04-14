window.GameUI = (function () {
  var GameEngine = window.GameEngine;
  var GridRenderer = window.GridRenderer;
  var InputHandler = window.InputHandler;
  var Storage = window.Storage;
  var Statistics = window.Statistics;
  var DailyChallenge = window.DailyChallenge;
  var Utils = window.SudokuUtils;

  var gridContainer = null;
  var numberPadContainer = null;
  var toolbarContainer = null;
  var statusContainer = null;

  function init() {
    gridContainer = document.getElementById('grid-container');
    numberPadContainer = document.getElementById('number-pad');
    toolbarContainer = document.getElementById('toolbar');
    statusContainer = document.getElementById('game-status');
    GameEngine.setCallbacks({
      onTimerUpdate: updateTimer,
      onGameComplete: showCompletionModal,
      onGameLost: showLostModal,
      onStateChange: renderGame,
      onLoading: showLoading,
    });
    InputHandler.bindEvents();
    if (gridContainer) InputHandler.bindGridClick(gridContainer);
    if (toolbarContainer) InputHandler.bindToolbar(toolbarContainer);
    if (numberPadContainer) InputHandler.bindNumberPad(numberPadContainer);
  }

  function renderGame(game) {
    if (!game) return;
    var settings = Storage.getSettings();
    if (gridContainer) {
      GridRenderer.renderGrid(gridContainer, game, settings);
    }
    if (toolbarContainer) {
      GridRenderer.renderToolbar(toolbarContainer, game);
    }
    if (numberPadContainer) {
      GridRenderer.renderNumberPad(numberPadContainer, game);
    }
    if (statusContainer) {
      updateStatus(game);
    }
  }

  function showLoading(isLoading) {
    var el = document.getElementById('loading-indicator');
    if (el) {
      el.style.display = isLoading ? 'flex' : 'none';
    }
    var gridEl = document.getElementById('grid-container');
    if (gridEl) {
      gridEl.style.opacity = isLoading ? '0.3' : '1';
    }
  }

  function updateStatus(game) {
    if (!statusContainer || !game) return;
    var progress = GameEngine.getProgress();
    var settings = Storage.getSettings();
    var errorDisplay = settings.errorLimit ? game.errors + '/' + game.maxErrors : game.errors.toString();
    var modeLabel = getModeLabel(game.mode);
    var diffLabel = getDifficultyLabel(game.difficulty);
    statusContainer.innerHTML =
      '<div class="status-bar">' +
      '<span class="status-mode">' + modeLabel + ' · ' + diffLabel + '</span>' +
      '<span class="status-timer" id="timer-display">' + Utils.formatTime(game.timer) + '</span>' +
      '</div>' +
      '<div class="status-info">' +
      '<span class="status-errors">错误 ' + errorDisplay + '</span>' +
      '<span class="status-progress">完成 ' + progress + '%</span>' +
      '</div>';
  }

  function updateTimer(seconds) {
    var el = document.getElementById('timer-display');
    if (el) el.textContent = Utils.formatTime(seconds);
  }

  function showCompletionModal(game, isNewRecord) {
    var modal = document.getElementById('modal');
    if (!modal) return;
    var modeLabel = getModeLabel(game.mode);
    var diffLabel = getDifficultyLabel(game.difficulty);
    modal.innerHTML =
      '<div class="modal-overlay">' +
      '<div class="modal-content completion-modal">' +
      '<div class="modal-icon">🎉</div>' +
      '<h2>恭喜完成！</h2>' +
      '<div class="modal-stats">' +
      '<div class="stat-row"><span>模式</span><span>' + modeLabel + '</span></div>' +
      '<div class="stat-row"><span>难度</span><span>' + diffLabel + '</span></div>' +
      '<div class="stat-row"><span>用时</span><span>' + Utils.formatTime(game.timer) + '</span></div>' +
      '<div class="stat-row"><span>错误</span><span>' + game.errors + ' 次</span></div>' +
      '<div class="stat-row"><span>提示</span><span>' + game.hintsUsed + ' 次</span></div>' +
      '</div>' +
      (isNewRecord ? '<div class="new-record">⭐ 新纪录！</div>' : '') +
      '<div class="modal-actions">' +
      '<button class="btn btn-primary" id="btn-play-again">再来一局</button>' +
      '<button class="btn btn-secondary" id="btn-back-home">返回主页</button>' +
      '</div>' +
      '</div>' +
      '</div>';
    modal.style.display = 'block';
    document.getElementById('btn-play-again').addEventListener('click', function () {
      modal.style.display = 'none';
      App.startGame(game.mode, game.difficulty);
    });
    document.getElementById('btn-back-home').addEventListener('click', function () {
      modal.style.display = 'none';
      App.showHome();
    });
  }

  function showLostModal(game) {
    var modal = document.getElementById('modal');
    if (!modal) return;
    modal.innerHTML =
      '<div class="modal-overlay">' +
      '<div class="modal-content lost-modal">' +
      '<div class="modal-icon">😔</div>' +
      '<h2>游戏结束</h2>' +
      '<p>错误次数已达上限</p>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-primary" id="btn-retry">重新开始</button>' +
      '<button class="btn btn-secondary" id="btn-back-home2">返回主页</button>' +
      '</div>' +
      '</div>' +
      '</div>';
    modal.style.display = 'block';
    document.getElementById('btn-retry').addEventListener('click', function () {
      modal.style.display = 'none';
      App.startGame(game.mode, game.difficulty);
    });
    document.getElementById('btn-back-home2').addEventListener('click', function () {
      modal.style.display = 'none';
      App.showHome();
    });
  }

  function showPauseOverlay() {
    var overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  function hidePauseOverlay() {
    var overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function getModeLabel(mode) {
    var labels = {
      classic: '经典数独',
      mini6x6: '迷你数独 6×6',
      mini4x4: '迷你数独 4×4',
      killer: '杀手数独',
      jigsaw: '拼图数独',
      giant: '巨无霸数独',
      circular: '环状数独',
      daily: '每日挑战',
    };
    return labels[mode] || mode;
  }

  function getDifficultyLabel(diff) {
    var labels = {
      quick: '快速',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      expert: '专家',
      master: '大师',
    };
    return labels[diff] || diff;
  }

  return {
    init: init,
    renderGame: renderGame,
    updateStatus: updateStatus,
    showPauseOverlay: showPauseOverlay,
    hidePauseOverlay: hidePauseOverlay,
    getModeLabel: getModeLabel,
    getDifficultyLabel: getDifficultyLabel,
  };
})();
