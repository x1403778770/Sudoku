window.SudokuSolver = (function () {
  function isValidPlacement(board, row, col, num, size, regions) {
    for (var c = 0; c < size; c++) {
      if (c !== col && board[row][c] === num) return false;
    }
    for (var r = 0; r < size; r++) {
      if (r !== row && board[r][col] === num) return false;
    }
    if (regions) {
      var regionId = regions[row][col];
      for (var r2 = 0; r2 < size; r2++) {
        for (var c2 = 0; c2 < size; c2++) {
          if (regions[r2][c2] === regionId && !(r2 === row && c2 === col) && board[r2][c2] === num) {
            return false;
          }
        }
      }
    } else {
      var boxSize = size === 9 ? 3 : size === 6 ? 3 : size === 4 ? 2 : size === 16 ? 4 : 3;
      var boxH = size === 6 ? 2 : boxSize;
      var boxW = size === 6 ? 3 : boxSize;
      var boxRow = Math.floor(row / boxH) * boxH;
      var boxCol = Math.floor(col / boxW) * boxW;
      for (var r3 = boxRow; r3 < boxRow + boxH; r3++) {
        for (var c3 = boxCol; c3 < boxCol + boxW; c3++) {
          if (!(r3 === row && c3 === col) && board[r3][c3] === num) return false;
        }
      }
    }
    return true;
  }

  function solve(board, size, regions) {
    var empty = findEmpty(board, size);
    if (!empty) return true;
    var row = empty[0];
    var col = empty[1];
    for (var num = 1; num <= size; num++) {
      if (isValidPlacement(board, row, col, num, size, regions)) {
        board[row][col] = num;
        if (solve(board, size, regions)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  function countSolutions(board, size, regions, limit) {
    limit = limit || 2;
    var maxSteps = size <= 4 ? 5000 : size <= 6 ? 20000 : size <= 9 ? 100000 : 5000;
    var state = { count: 0, steps: 0, maxSteps: maxSteps };
    _countSolutions(board, size, regions, state, limit);
    if (state.steps > state.maxSteps && state.count === 0) return 1;
    return state.count;
  }

  function _countSolutions(board, size, regions, state, limit) {
    if (state.count >= limit || state.steps > state.maxSteps) return;
    state.steps++;
    var empty = findEmptyMRV(board, size, regions);
    if (!empty) {
      state.count++;
      return;
    }
    var row = empty[0];
    var col = empty[1];
    for (var num = 1; num <= size; num++) {
      if (state.count >= limit || state.steps > state.maxSteps) return;
      if (isValidPlacement(board, row, col, num, size, regions)) {
        board[row][col] = num;
        _countSolutions(board, size, regions, state, limit);
        board[row][col] = 0;
      }
    }
  }

  function findEmptyMRV(board, size, regions) {
    var minCandidates = size + 1;
    var bestCell = null;
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (board[r][c] === 0) {
          var candidates = 0;
          for (var n = 1; n <= size; n++) {
            if (isValidPlacement(board, r, c, n, size, regions)) candidates++;
          }
          if (candidates < minCandidates) {
            minCandidates = candidates;
            bestCell = [r, c];
            if (candidates <= 1) return bestCell;
          }
        }
      }
    }
    return bestCell;
  }

  function findEmpty(board, size) {
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (board[r][c] === 0) return [r, c];
      }
    }
    return null;
  }

  function isBoardComplete(board, size) {
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (board[r][c] === 0) return false;
      }
    }
    return true;
  }

  function isBoardValid(board, size, regions) {
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (board[r][c] !== 0) {
          var num = board[r][c];
          board[r][c] = 0;
          if (!isValidPlacement(board, r, c, num, size, regions)) {
            board[r][c] = num;
            return false;
          }
          board[r][c] = num;
        }
      }
    }
    return true;
  }

  function getConflicts(board, row, col, num, size, regions) {
    var conflicts = [];
    if (num === 0) return conflicts;
    for (var c = 0; c < size; c++) {
      if (c !== col && board[row][c] === num) conflicts.push([row, c]);
    }
    for (var r = 0; r < size; r++) {
      if (r !== row && board[r][col] === num) conflicts.push([r, col]);
    }
    if (regions) {
      var regionId = regions[row][col];
      for (var r2 = 0; r2 < size; r2++) {
        for (var c2 = 0; c2 < size; c2++) {
          if (regions[r2][c2] === regionId && !(r2 === row && c2 === col) && board[r2][c2] === num) {
            conflicts.push([r2, c2]);
          }
        }
      }
    } else {
      var boxSize = size === 9 ? 3 : size === 6 ? 3 : size === 4 ? 2 : size === 16 ? 4 : 3;
      var boxH = size === 6 ? 2 : boxSize;
      var boxW = size === 6 ? 3 : boxSize;
      var boxRow = Math.floor(row / boxH) * boxH;
      var boxCol = Math.floor(col / boxW) * boxW;
      for (var r3 = boxRow; r3 < boxRow + boxH; r3++) {
        for (var c3 = boxCol; c3 < boxCol + boxW; c3++) {
          if (!(r3 === row && c3 === col) && board[r3][c3] === num) conflicts.push([r3, c3]);
        }
      }
    }
    return conflicts;
  }

  return {
    isValidPlacement: isValidPlacement,
    solve: solve,
    countSolutions: countSolutions,
    findEmpty: findEmpty,
    isBoardComplete: isBoardComplete,
    isBoardValid: isBoardValid,
    getConflicts: getConflicts,
  };
})();
