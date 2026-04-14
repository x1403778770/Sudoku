window.SudokuGenerator = (function () {
  var Solver = window.SudokuSolver;
  var Utils = window.SudokuUtils;

  function createEmptyBoard(size) {
    var board = [];
    for (var r = 0; r < size; r++) {
      board[r] = [];
      for (var c = 0; c < size; c++) {
        board[r][c] = 0;
      }
    }
    return board;
  }

  function generateSolvedBoard(size, regions, rng) {
    rng = rng || Math.random;
    if (size === 16) {
      return generateSolvedBoard16x16(rng);
    }
    var board = createEmptyBoard(size);
    fillBoard(board, size, regions, rng);
    return board;
  }

  function generateSolvedBoard16x16(rng) {
    var size = 16;
    var board = [];
    for (var i = 0; i < size; i++) {
      board[i] = [];
      for (var j = 0; j < size; j++) {
        board[i][j] = (4 * (i % 4) + Math.floor(i / 4) + j) % 16 + 1;
      }
    }
    var perm = [];
    for (var p = 1; p <= 16; p++) perm.push(p);
    perm = shuffleWithRng(perm, rng);
    for (var i2 = 0; i2 < size; i2++) {
      for (var j2 = 0; j2 < size; j2++) {
        board[i2][j2] = perm[board[i2][j2] - 1];
      }
    }
    for (var band = 0; band < 4; band++) {
      var rows = [band * 4, band * 4 + 1, band * 4 + 2, band * 4 + 3];
      rows = shuffleWithRng(rows, rng);
      var temp = [];
      for (var i3 = 0; i3 < 4; i3++) temp[i3] = board[rows[i3]].slice();
      for (var i4 = 0; i4 < 4; i4++) board[band * 4 + i4] = temp[i4];
    }
    for (var stack = 0; stack < 4; stack++) {
      var cols = [stack * 4, stack * 4 + 1, stack * 4 + 2, stack * 4 + 3];
      cols = shuffleWithRng(cols, rng);
      for (var r = 0; r < size; r++) {
        var temp2 = [];
        for (var i5 = 0; i5 < 4; i5++) temp2[i5] = board[r][cols[i5]];
        for (var i6 = 0; i6 < 4; i6++) board[r][stack * 4 + i6] = temp2[i6];
      }
    }
    var bands = [0, 1, 2, 3];
    bands = shuffleWithRng(bands, rng);
    var tempBoard = [];
    for (var i7 = 0; i7 < size; i7++) tempBoard[i7] = board[i7].slice();
    for (var b = 0; b < 4; b++) {
      for (var r2 = 0; r2 < 4; r2++) {
        board[b * 4 + r2] = tempBoard[bands[b] * 4 + r2].slice();
      }
    }
    var stacks = [0, 1, 2, 3];
    stacks = shuffleWithRng(stacks, rng);
    for (var r3 = 0; r3 < size; r3++) {
      var temp3 = board[r3].slice();
      for (var s = 0; s < 4; s++) {
        for (var c = 0; c < 4; c++) {
          board[r3][s * 4 + c] = temp3[stacks[s] * 4 + c];
        }
      }
    }
    return board;
  }

  function fillBoard(board, size, regions, rng) {
    var empty = Solver.findEmpty(board, size);
    if (!empty) return true;
    var row = empty[0];
    var col = empty[1];
    var nums = [];
    for (var i = 1; i <= size; i++) nums.push(i);
    nums = shuffleWithRng(nums, rng);
    for (var k = 0; k < nums.length; k++) {
      var num = nums[k];
      if (Solver.isValidPlacement(board, row, col, num, size, regions)) {
        board[row][col] = num;
        if (fillBoard(board, size, regions, rng)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  function shuffleWithRng(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function generateClassic(difficulty, rng) {
    rng = rng || Math.random;
    var size = 9;
    var solved = generateSolvedBoard(size, null, rng);
    var puzzle = Utils.deepCopy(solved);
    var cluesToRemove = getCluesToRemove(difficulty, size);
    var cells = [];
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        cells.push([r, c]);
      }
    }
    cells = shuffleWithRng(cells, rng);
    var removed = 0;
    for (var i = 0; i < cells.length && removed < cluesToRemove; i++) {
      var row = cells[i][0];
      var col = cells[i][1];
      var backup = puzzle[row][col];
      puzzle[row][col] = 0;
      var testBoard = Utils.deepCopy(puzzle);
      if (Solver.countSolutions(testBoard, size, null, 2) === 1) {
        removed++;
      } else {
        puzzle[row][col] = backup;
      }
    }
    return {
      puzzle: puzzle,
      solution: solved,
      size: size,
      mode: 'classic',
      difficulty: difficulty,
    };
  }

  function getCluesToRemove(difficulty, size) {
    var total = size * size;
    var minClues;
    switch (difficulty) {
      case 'quick': minClues = 45; break;
      case 'easy': minClues = 36; break;
      case 'medium': minClues = 30; break;
      case 'hard': minClues = 25; break;
      case 'expert': minClues = 22; break;
      case 'master': minClues = 17; break;
      default: minClues = 30;
    }
    return total - minClues;
  }

  function generateMini6x6(difficulty, rng) {
    rng = rng || Math.random;
    var size = 6;
    var solved = generateSolvedBoard(size, null, rng);
    var puzzle = Utils.deepCopy(solved);
    var removeCounts = { easy: 10, medium: 14, hard: 18 };
    var toRemove = removeCounts[difficulty] || 14;
    var cells = [];
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        cells.push([r, c]);
      }
    }
    cells = shuffleWithRng(cells, rng);
    var removed = 0;
    for (var i = 0; i < cells.length && removed < toRemove; i++) {
      var row = cells[i][0];
      var col = cells[i][1];
      var backup = puzzle[row][col];
      puzzle[row][col] = 0;
      var testBoard = Utils.deepCopy(puzzle);
      if (Solver.countSolutions(testBoard, size, null, 2) === 1) {
        removed++;
      } else {
        puzzle[row][col] = backup;
      }
    }
    return {
      puzzle: puzzle,
      solution: solved,
      size: size,
      mode: 'mini6x6',
      difficulty: difficulty,
    };
  }

  function generateMini4x4(difficulty, rng) {
    rng = rng || Math.random;
    var size = 4;
    var solved = generateSolvedBoard(size, null, rng);
    var puzzle = Utils.deepCopy(solved);
    var removeCounts = { easy: 4, medium: 6, hard: 8 };
    var toRemove = removeCounts[difficulty] || 6;
    var cells = [];
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        cells.push([r, c]);
      }
    }
    cells = shuffleWithRng(cells, rng);
    var removed = 0;
    for (var i = 0; i < cells.length && removed < toRemove; i++) {
      var row = cells[i][0];
      var col = cells[i][1];
      var backup = puzzle[row][col];
      puzzle[row][col] = 0;
      var testBoard = Utils.deepCopy(puzzle);
      if (Solver.countSolutions(testBoard, size, null, 2) === 1) {
        removed++;
      } else {
        puzzle[row][col] = backup;
      }
    }
    return {
      puzzle: puzzle,
      solution: solved,
      size: size,
      mode: 'mini4x4',
      difficulty: difficulty,
    };
  }

  function generateGiant(difficulty, rng) {
    rng = rng || Math.random;
    var size = 16;
    var solved = generateSolvedBoard16x16(rng);
    var puzzle = Utils.deepCopy(solved);
    var removeCounts = { easy: 100, medium: 130, hard: 160 };
    var toRemove = removeCounts[difficulty] || 130;
    var cells = [];
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        cells.push([r, c]);
      }
    }
    cells = shuffleWithRng(cells, rng);
    for (var i = 0; i < toRemove && i < cells.length; i++) {
      puzzle[cells[i][0]][cells[i][1]] = 0;
    }
    return {
      puzzle: puzzle,
      solution: solved,
      size: size,
      mode: 'giant',
      difficulty: difficulty,
    };
  }

  return {
    createEmptyBoard: createEmptyBoard,
    generateSolvedBoard: generateSolvedBoard,
    generateClassic: generateClassic,
    generateMini6x6: generateMini6x6,
    generateMini4x4: generateMini4x4,
    generateGiant: generateGiant,
  };
})();
