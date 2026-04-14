window.CircularGenerator = (function () {
  var Utils = window.SudokuUtils;

  var RINGS = 5;
  var SEGMENTS = 10;

  function createEmptyBoard() {
    var board = [];
    for (var r = 0; r < RINGS; r++) {
      board[r] = [];
      for (var s = 0; s < SEGMENTS; s++) {
        board[r][s] = 0;
      }
    }
    return board;
  }

  function isValidPlacement(board, ring, segment, num) {
    for (var s = 0; s < SEGMENTS; s++) {
      if (s !== segment && board[ring][s] === num) return false;
    }
    for (var r = 0; r < RINGS; r++) {
      if (r !== ring && board[r][segment] === num) return false;
    }
    return true;
  }

  function fillBoard(board, rng) {
    for (var r = 0; r < RINGS; r++) {
      for (var s = 0; s < SEGMENTS; s++) {
        if (board[r][s] === 0) {
          var nums = [];
          for (var i = 1; i <= 10; i++) nums.push(i);
          nums = shuffleWithRng(nums, rng);
          for (var k = 0; k < nums.length; k++) {
            if (isValidPlacement(board, r, s, nums[k])) {
              board[r][s] = nums[k];
              if (fillBoard(board, rng)) return true;
              board[r][s] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function shuffleWithRng(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function generate(difficulty, rng) {
    rng = rng || Math.random;
    var solved = createEmptyBoard();
    var success = fillBoard(solved, rng);
    if (!success) {
      for (var r = 0; r < RINGS; r++) {
        for (var s = 0; s < SEGMENTS; s++) {
          solved[r][s] = (r + s) % 10 + 1;
        }
      }
    }
    var puzzle = Utils.deepCopy(solved);
    var removeCounts = { easy: 15, medium: 20, hard: 25 };
    var toRemove = removeCounts[difficulty] || 20;
    var cells = [];
    for (var r2 = 0; r2 < RINGS; r2++) {
      for (var s2 = 0; s2 < SEGMENTS; s2++) {
        cells.push([r2, s2]);
      }
    }
    cells = shuffleWithRng(cells, rng);
    for (var i = 0; i < toRemove && i < cells.length; i++) {
      puzzle[cells[i][0]][cells[i][1]] = 0;
    }
    return {
      puzzle: puzzle,
      solution: solved,
      size: RINGS,
      segments: SEGMENTS,
      mode: 'circular',
      difficulty: difficulty,
    };
  }

  return {
    generate: generate,
  };
})();
