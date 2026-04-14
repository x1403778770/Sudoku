window.InputHandler = (function () {
  var GameEngine = window.GameEngine;
  var bound = false;
  var gridBound = false;
  var numpadBound = false;
  var toolbarBound = false;

  function bindEvents() {
    if (bound) return;
    bound = true;
    document.addEventListener('keydown', handleKeyDown);
  }

  function unbindEvents() {
    bound = false;
    document.removeEventListener('keydown', handleKeyDown);
    gridBound = false;
    numpadBound = false;
    toolbarBound = false;
  }

  function handleKeyDown(e) {
    var game = GameEngine.getGame();
    if (!game || game.completed || game.lost || game.paused) return;
    var key = e.key;
    if (key >= '1' && key <= '9') {
      e.preventDefault();
      GameEngine.placeNumber(parseInt(key));
    } else if (key === '0' && (game.size === 16 || game.mode === 'circular')) {
      e.preventDefault();
      GameEngine.placeNumber(10);
    } else if (key.toLowerCase() >= 'a' && key.toLowerCase() <= 'g' && game.size === 16) {
      e.preventDefault();
      var num = key.toLowerCase().charCodeAt(0) - 86;
      GameEngine.placeNumber(num);
    } else if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault();
      GameEngine.eraseCell();
    } else if (key === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        GameEngine.redo();
      } else {
        GameEngine.undo();
      }
    } else if (key === 'n' || key === 'N') {
      e.preventDefault();
      GameEngine.toggleNoteMode();
    } else if (key === 'h' || key === 'H') {
      e.preventDefault();
      GameEngine.useHint();
    } else if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      e.preventDefault();
      handleArrowKey(key, game);
    }
  }

  function handleArrowKey(key, game) {
    if (!game.selectedCell) {
      GameEngine.selectCell(0, 0);
      return;
    }
    var row = game.selectedCell.row;
    var col = game.selectedCell.col;
    var maxRow = game.size - 1;
    var maxCol = (game.mode === 'circular' ? (game.segments || 10) : game.size) - 1;
    switch (key) {
      case 'ArrowUp':
        if (row > 0) GameEngine.selectCell(row - 1, col);
        break;
      case 'ArrowDown':
        if (row < maxRow) GameEngine.selectCell(row + 1, col);
        break;
      case 'ArrowLeft':
        if (col > 0) GameEngine.selectCell(row, col - 1);
        break;
      case 'ArrowRight':
        if (col < maxCol) GameEngine.selectCell(row, col + 1);
        break;
    }
  }

  function handleGridClick(e) {
    var cell = e.target.closest('.grid-cell');
    if (!cell) return;
    var row = parseInt(cell.dataset.row);
    var col = parseInt(cell.dataset.col);
    if (!isNaN(row) && !isNaN(col)) {
      GameEngine.selectCell(row, col);
    }
  }

  function handleNumpadClick(e) {
    var btn = e.target.closest('.num-btn');
    if (!btn || btn.classList.contains('disabled')) return;
    var num = parseInt(btn.dataset.num);
    if (!isNaN(num)) {
      GameEngine.placeNumber(num);
    }
  }

  function handleToolbarClick(e) {
    var btn = e.target.closest('.tool-btn');
    if (!btn) return;
    if (btn.id === 'btn-undo') GameEngine.undo();
    else if (btn.id === 'btn-redo') GameEngine.redo();
    else if (btn.id === 'btn-erase') GameEngine.eraseCell();
    else if (btn.id === 'btn-notes') GameEngine.toggleNoteMode();
    else if (btn.id === 'btn-hint') GameEngine.useHint();
  }

  function bindGridClick(container) {
    if (gridBound) return;
    gridBound = true;
    container.addEventListener('click', handleGridClick);
  }

  function bindNumberPad(container) {
    if (numpadBound) return;
    numpadBound = true;
    container.addEventListener('click', handleNumpadClick);
  }

  function bindToolbar(container) {
    if (toolbarBound) return;
    toolbarBound = true;
    container.addEventListener('click', handleToolbarClick);
  }

  return {
    bindEvents: bindEvents,
    unbindEvents: unbindEvents,
    bindGridClick: bindGridClick,
    bindNumberPad: bindNumberPad,
    bindToolbar: bindToolbar,
  };
})();
