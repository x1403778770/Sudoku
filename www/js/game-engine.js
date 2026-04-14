window.GameEngine = (function () {
  var Utils = window.SudokuUtils;
  var Solver = window.SudokuSolver;
  var Storage = window.Storage;
  var Statistics = window.Statistics;
  var Generator = window.SudokuGenerator;
  var KillerGenerator = window.KillerGenerator;
  var JigsawGenerator = window.JigsawGenerator;
  var CircularGenerator = window.CircularGenerator;
  var DailyChallenge = window.DailyChallenge;

  var game = null;
  var timerInterval = null;
  var onTimerUpdate = null;
  var onGameComplete = null;
  var onGameLost = null;
  var onStateChange = null;
  var onLoading = null;

  function createGame(mode, difficulty, puzzleData) {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (onLoading) onLoading(true);
    setTimeout(function () {
      try {
        if (!puzzleData) {
          switch (mode) {
            case 'classic':
              puzzleData = Generator.generateClassic(difficulty);
              break;
            case 'mini6x6':
              puzzleData = Generator.generateMini6x6(difficulty);
              break;
            case 'mini4x4':
              puzzleData = Generator.generateMini4x4(difficulty);
              break;
            case 'killer':
              puzzleData = KillerGenerator.generate(difficulty);
              break;
            case 'jigsaw':
              puzzleData = JigsawGenerator.generate(difficulty);
              break;
            case 'giant':
              puzzleData = Generator.generateGiant(difficulty);
              break;
            case 'circular':
              puzzleData = CircularGenerator.generate(difficulty);
              break;
            case 'daily':
              puzzleData = DailyChallenge.generateDailyPuzzle();
              break;
            default:
              puzzleData = Generator.generateClassic(difficulty);
          }
        }
        initGameFromPuzzle(puzzleData, mode, difficulty);
      } catch (e) {
        console.error('Puzzle generation failed:', e);
        puzzleData = Generator.generateClassic('easy');
        initGameFromPuzzle(puzzleData, mode, difficulty);
      }
      if (onLoading) onLoading(false);
    }, 50);
  }

  function initGameFromPuzzle(puzzleData, mode, difficulty) {
    var size = puzzleData.size || 9;
    game = {
      id: Utils.generateUUID(),
      mode: puzzleData.mode || mode,
      difficulty: puzzleData.difficulty || difficulty,
      size: size,
      puzzle: Utils.deepCopy(puzzleData.puzzle),
      solution: Utils.deepCopy(puzzleData.solution),
      playerBoard: Utils.deepCopy(puzzleData.puzzle),
      notes: [],
      killerCages: puzzleData.killerCages || null,
      jigsawRegions: puzzleData.jigsawRegions || null,
      segments: puzzleData.segments || null,
      isDaily: puzzleData.isDaily || false,
      dailyDate: puzzleData.dailyDate || null,
      timer: 0,
      errors: 0,
      maxErrors: 3,
      hintsUsed: 0,
      maxHints: 3,
      undoStack: [],
      redoStack: [],
      selectedCell: null,
      noteMode: false,
      paused: false,
      completed: false,
      lost: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < (game.mode === 'circular' ? (game.segments || 10) : size); c++) {
        game.notes.push({ row: r, col: c, values: [] });
      }
    }
    startTimer();
    if (onStateChange) onStateChange(game);
  }

  function loadGame(saveData) {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    game = Utils.deepCopy(saveData);
    game.paused = false;
    game.completed = false;
    game.lost = false;
    startTimer();
    if (onStateChange) onStateChange(game);
    return game;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function () {
      if (game && !game.paused && !game.completed && !game.lost) {
        game.timer++;
        if (onTimerUpdate) onTimerUpdate(game.timer);
      }
    }, 1000);
  }

  function pauseGame() {
    if (game) {
      game.paused = true;
      if (onStateChange) onStateChange(game);
    }
  }

  function resumeGame() {
    if (game) {
      game.paused = false;
      if (onStateChange) onStateChange(game);
    }
  }

  function selectCell(row, col) {
    if (!game || game.completed || game.lost) return;
    game.selectedCell = { row: row, col: col };
    if (onStateChange) onStateChange(game);
  }

  function clearSelection() {
    if (!game) return;
    game.selectedCell = null;
    if (onStateChange) onStateChange(game);
  }

  function placeNumber(num) {
    if (!game || !game.selectedCell || game.completed || game.lost) return;
    var row = game.selectedCell.row;
    var col = game.selectedCell.col;
    if (game.puzzle[row][col] !== 0) return;
    if (game.noteMode) {
      toggleNote(row, col, num);
      return;
    }
    var prevValue = game.playerBoard[row][col];
    var prevNotes = getNoteAt(row, col).values.slice();
    game.undoStack.push({
      type: 'place',
      row: row,
      col: col,
      prevValue: prevValue,
      prevNotes: prevNotes,
      newValue: num,
    });
    game.redoStack = [];
    game.playerBoard[row][col] = num;
    setNoteAt(row, col, []);
    var settings = Storage.getSettings();
    if (settings.autoCheck && num !== game.solution[row][col]) {
      game.errors++;
      if (settings.errorLimit && game.errors >= game.maxErrors) {
        game.lost = true;
        clearInterval(timerInterval);
        if (onGameLost) onGameLost(game);
      }
    }
    checkCompletion();
    autoSave();
    if (onStateChange) onStateChange(game);
  }

  function eraseCell() {
    if (!game || !game.selectedCell || game.completed || game.lost) return;
    var row = game.selectedCell.row;
    var col = game.selectedCell.col;
    if (game.puzzle[row][col] !== 0) return;
    var prevValue = game.playerBoard[row][col];
    var prevNotes = getNoteAt(row, col).values.slice();
    if (prevValue === 0 && prevNotes.length === 0) return;
    game.undoStack.push({
      type: 'erase',
      row: row,
      col: col,
      prevValue: prevValue,
      prevNotes: prevNotes,
    });
    game.redoStack = [];
    game.playerBoard[row][col] = 0;
    setNoteAt(row, col, []);
    autoSave();
    if (onStateChange) onStateChange(game);
  }

  function toggleNote(row, col, num) {
    var note = getNoteAt(row, col);
    var idx = note.values.indexOf(num);
    var prevNotes = note.values.slice();
    if (idx >= 0) {
      note.values.splice(idx, 1);
    } else {
      note.values.push(num);
      note.values.sort();
    }
    game.undoStack.push({
      type: 'note',
      row: row,
      col: col,
      prevNotes: prevNotes,
      newNotes: note.values.slice(),
    });
    game.redoStack = [];
    autoSave();
    if (onStateChange) onStateChange(game);
  }

  function getNoteAt(row, col) {
    for (var i = 0; i < game.notes.length; i++) {
      if (game.notes[i].row === row && game.notes[i].col === col) {
        return game.notes[i];
      }
    }
    return { row: row, col: col, values: [] };
  }

  function setNoteAt(row, col, values) {
    for (var i = 0; i < game.notes.length; i++) {
      if (game.notes[i].row === row && game.notes[i].col === col) {
        game.notes[i].values = values;
        return;
      }
    }
  }

  function toggleNoteMode() {
    if (!game) return;
    game.noteMode = !game.noteMode;
    if (onStateChange) onStateChange(game);
  }

  function useHint() {
    if (!game || game.completed || game.lost) return false;
    if (game.hintsUsed >= game.maxHints) return false;
    var emptyCells = [];
    for (var r = 0; r < game.size; r++) {
      for (var c = 0; c < (game.mode === 'circular' ? (game.segments || 10) : game.size); c++) {
        if (game.playerBoard[r][c] === 0 || game.playerBoard[r][c] !== game.solution[r][c]) {
          emptyCells.push([r, c]);
        }
      }
    }
    if (emptyCells.length === 0) return false;
    var cell;
    if (game.selectedCell) {
      var sr = game.selectedCell.row;
      var sc = game.selectedCell.col;
      if (game.playerBoard[sr][sc] === 0 || game.playerBoard[sr][sc] !== game.solution[sr][sc]) {
        cell = [sr, sc];
      }
    }
    if (!cell) {
      cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    var row = cell[0];
    var col = cell[1];
    var prevValue = game.playerBoard[row][col];
    var prevNotes = getNoteAt(row, col).values.slice();
    game.undoStack.push({
      type: 'hint',
      row: row,
      col: col,
      prevValue: prevValue,
      prevNotes: prevNotes,
      newValue: game.solution[row][col],
    });
    game.redoStack = [];
    game.playerBoard[row][col] = game.solution[row][col];
    setNoteAt(row, col, []);
    game.hintsUsed++;
    game.selectedCell = { row: row, col: col };
    checkCompletion();
    autoSave();
    if (onStateChange) onStateChange(game);
    return true;
  }

  function undo() {
    if (!game || game.undoStack.length === 0 || game.completed || game.lost) return;
    var action = game.undoStack.pop();
    game.redoStack.push(action);
    switch (action.type) {
      case 'place':
      case 'hint':
        game.playerBoard[action.row][action.col] = action.prevValue;
        setNoteAt(action.row, action.col, action.prevNotes);
        if (action.type === 'hint') game.hintsUsed--;
        break;
      case 'erase':
        game.playerBoard[action.row][action.col] = action.prevValue;
        setNoteAt(action.row, action.col, action.prevNotes);
        break;
      case 'note':
        setNoteAt(action.row, action.col, action.prevNotes);
        break;
    }
    autoSave();
    if (onStateChange) onStateChange(game);
  }

  function redo() {
    if (!game || game.redoStack.length === 0 || game.completed || game.lost) return;
    var action = game.redoStack.pop();
    game.undoStack.push(action);
    switch (action.type) {
      case 'place':
      case 'hint':
        game.playerBoard[action.row][action.col] = action.newValue;
        setNoteAt(action.row, action.col, []);
        if (action.type === 'hint') game.hintsUsed++;
        break;
      case 'erase':
        game.playerBoard[action.row][action.col] = 0;
        setNoteAt(action.row, action.col, []);
        break;
      case 'note':
        setNoteAt(action.row, action.col, action.newNotes);
        break;
    }
    autoSave();
    if (onStateChange) onStateChange(game);
  }

  function checkCompletion() {
    if (!game) return;
    var size = game.size;
    var cols = game.mode === 'circular' ? (game.segments || 10) : size;
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < cols; c++) {
        if (game.playerBoard[r][c] !== game.solution[r][c]) return;
      }
    }
    game.completed = true;
    clearInterval(timerInterval);
    if (game.isDaily) {
      DailyChallenge.markDailyCompleted();
    }
    var isNewRecord = Statistics.recordWin(game.mode, game.difficulty, game.timer, game.errors, game.hintsUsed);
    if (onGameComplete) onGameComplete(game, isNewRecord);
  }

  function getProgress() {
    if (!game) return 0;
    var total = 0;
    var filled = 0;
    var size = game.size;
    var cols = game.mode === 'circular' ? (game.segments || 10) : size;
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < cols; c++) {
        if (game.puzzle[r][c] === 0) {
          total++;
          if (game.playerBoard[r][c] !== 0) filled++;
        }
      }
    }
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }

  function getConflictsForCell(row, col) {
    if (!game || game.playerBoard[row][col] === 0) return [];
    var num = game.playerBoard[row][col];
    if (game.mode === 'circular') {
      var conflicts = [];
      for (var s = 0; s < (game.segments || 10); s++) {
        if (s !== col && game.playerBoard[row][s] === num) conflicts.push([row, s]);
      }
      for (var r = 0; r < game.size; r++) {
        if (r !== row && game.playerBoard[r][col] === num) conflicts.push([r, col]);
      }
      return conflicts;
    }
    return Solver.getConflicts(game.playerBoard, row, col, num, game.size, game.jigsawRegions);
  }

  function getRelatedCells(row, col) {
    if (!game) return [];
    var related = [];
    var size = game.size;
    if (game.mode === 'circular') {
      for (var s = 0; s < (game.segments || 10); s++) {
        if (s !== col) related.push([row, s]);
      }
      for (var r = 0; r < size; r++) {
        if (r !== row) related.push([r, col]);
      }
      return related;
    }
    for (var c = 0; c < size; c++) {
      if (c !== col) related.push([row, c]);
    }
    for (var r2 = 0; r2 < size; r2++) {
      if (r2 !== row) related.push([r2, col]);
    }
    if (game.jigsawRegions) {
      var regionId = game.jigsawRegions[row][col];
      for (var r3 = 0; r3 < size; r3++) {
        for (var c3 = 0; c3 < size; c3++) {
          if (game.jigsawRegions[r3][c3] === regionId && !(r3 === row && c3 === col)) {
            var exists = false;
            for (var k = 0; k < related.length; k++) {
              if (related[k][0] === r3 && related[k][1] === c3) { exists = true; break; }
            }
            if (!exists) related.push([r3, c3]);
          }
        }
      }
    } else {
      var boxSize = size === 9 ? 3 : size === 6 ? 3 : size === 4 ? 2 : size === 16 ? 4 : 3;
      var boxH = size === 6 ? 2 : boxSize;
      var boxW = size === 6 ? 3 : boxSize;
      var boxRow = Math.floor(row / boxH) * boxH;
      var boxCol = Math.floor(col / boxW) * boxW;
      for (var r4 = boxRow; r4 < boxRow + boxH; r4++) {
        for (var c4 = boxCol; c4 < boxCol + boxW; c4++) {
          if (!(r4 === row && c4 === col)) {
            var exists2 = false;
            for (var k2 = 0; k2 < related.length; k2++) {
              if (related[k2][0] === r4 && related[k2][1] === c4) { exists2 = true; break; }
            }
            if (!exists2) related.push([r4, c4]);
          }
        }
      }
    }
    return related;
  }

  function getCellsWithNumber(num) {
    if (!game) return [];
    var cells = [];
    var size = game.size;
    var cols = game.mode === 'circular' ? (game.segments || 10) : size;
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < cols; c++) {
        if (game.playerBoard[r][c] === num) cells.push([r, c]);
      }
    }
    return cells;
  }

  function autoSave() {
    if (!game) return;
    game.updatedAt = new Date().toISOString();
    Storage.saveGame(game);
  }

  function destroyGame() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    game = null;
  }

  function getGame() {
    return game;
  }

  function setCallbacks(callbacks) {
    if (callbacks.onTimerUpdate) onTimerUpdate = callbacks.onTimerUpdate;
    if (callbacks.onGameComplete) onGameComplete = callbacks.onGameComplete;
    if (callbacks.onGameLost) onGameLost = callbacks.onGameLost;
    if (callbacks.onStateChange) onStateChange = callbacks.onStateChange;
    if (callbacks.onLoading) onLoading = callbacks.onLoading;
  }

  return {
    createGame: createGame,
    loadGame: loadGame,
    pauseGame: pauseGame,
    resumeGame: resumeGame,
    selectCell: selectCell,
    clearSelection: clearSelection,
    placeNumber: placeNumber,
    eraseCell: eraseCell,
    toggleNoteMode: toggleNoteMode,
    useHint: useHint,
    undo: undo,
    redo: redo,
    getProgress: getProgress,
    getConflictsForCell: getConflictsForCell,
    getRelatedCells: getRelatedCells,
    getCellsWithNumber: getCellsWithNumber,
    getGame: getGame,
    destroyGame: destroyGame,
    setCallbacks: setCallbacks,
    autoSave: autoSave,
  };
})();
