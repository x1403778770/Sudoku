window.KillerGenerator = (function () {
  var Solver = window.SudokuSolver;
  var Utils = window.SudokuUtils;
  var Generator = window.SudokuGenerator;

  var CAGE_TEMPLATES = [
    [[0,0],[0,1],[0,2],[1,0],[1,1]],
    [[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[0,1],[0,2]],
    [[0,0],[0,1],[1,1]],
    [[0,0],[1,0],[1,1]],
    [[0,0],[1,0]],
    [[0,0],[0,1]],
    [[0,0],[1,0],[2,0]],
    [[0,0],[0,1],[0,2],[1,0]],
    [[0,0],[0,1],[1,0],[1,1],[2,0]],
    [[0,0],[0,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,1],[1,2]],
    [[0,0],[1,0],[1,1],[2,1]],
    [[0,0],[0,1]],
    [[0,0],[1,0]],
    [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],
  ];

  function generateCages(size, rng) {
    rng = rng || Math.random;
    var cages = [];
    var used = [];
    for (var r = 0; r < size; r++) {
      used[r] = [];
      for (var c = 0; c < size; c++) {
        used[r][c] = false;
      }
    }
    for (var r2 = 0; r2 < size; r2++) {
      for (var c2 = 0; c2 < size; c2++) {
        if (used[r2][c2]) continue;
        var cage = tryPlaceCage(r2, c2, size, used, rng);
        cages.push(cage);
        for (var k = 0; k < cage.length; k++) {
          used[cage[k][0]][cage[k][1]] = true;
        }
      }
    }
    return cages;
  }

  function tryPlaceCage(startRow, startCol, size, used, rng) {
    var templates = Utils.shuffleArray(CAGE_TEMPLATES);
    for (var t = 0; t < templates.length; t++) {
      var tpl = templates[t];
      var cells = [];
      var valid = true;
      for (var i = 0; i < tpl.length; i++) {
        var r = startRow + tpl[i][0];
        var c = startCol + tpl[i][1];
        if (r >= size || c >= size || used[r][c]) {
          valid = false;
          break;
        }
        cells.push([r, c]);
      }
      if (valid && cells.length > 0) return cells;
    }
    return [[startRow, startCol]];
  }

  function generate(difficulty, rng) {
    rng = rng || Math.random;
    var size = 9;
    var solved = Generator.generateSolvedBoard(size, null, rng);
    var cages = generateCages(size, rng);
    var cageData = [];
    for (var i = 0; i < cages.length; i++) {
      var sum = 0;
      for (var j = 0; j < cages[i].length; j++) {
        sum += solved[cages[i][j][0]][cages[i][j][1]];
      }
      cageData.push({
        cells: cages[i],
        sum: sum,
      });
    }
    var puzzle = Generator.createEmptyBoard(size);
    var givenCounts = { easy: 30, medium: 20, hard: 10, expert: 0 };
    var numGiven = givenCounts[difficulty] || 15;
    if (numGiven > 0) {
      var allCells = [];
      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          allCells.push([r, c]);
        }
      }
      allCells = Utils.shuffleArray(allCells);
      for (var g = 0; g < numGiven && g < allCells.length; g++) {
        var gr = allCells[g][0];
        var gc = allCells[g][1];
        puzzle[gr][gc] = solved[gr][gc];
      }
    }
    return {
      puzzle: puzzle,
      solution: solved,
      size: size,
      mode: 'killer',
      difficulty: difficulty,
      killerCages: cageData,
    };
  }

  return {
    generate: generate,
  };
})();
