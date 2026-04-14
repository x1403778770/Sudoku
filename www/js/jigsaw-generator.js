window.JigsawGenerator = (function () {
  var Solver = window.SudokuSolver;
  var Utils = window.SudokuUtils;
  var Generator = window.SudokuGenerator;

  function generateRegions(size, rng) {
    rng = rng || Math.random;
    var regions = [];
    for (var r = 0; r < size; r++) {
      regions[r] = [];
      for (var c = 0; c < size; c++) {
        regions[r][c] = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      }
    }
    var numSwaps = 30 + Math.floor(rng() * 30);
    for (var s = 0; s < numSwaps; s++) {
      var r = Math.floor(rng() * size);
      var c = Math.floor(rng() * size);
      var region1 = regions[r][c];
      var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      var candidates = [];
      for (var d = 0; d < dirs.length; d++) {
        var nr = r + dirs[d][0];
        var nc = c + dirs[d][1];
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] !== region1) {
          candidates.push([nr, nc]);
        }
      }
      if (candidates.length === 0) continue;
      var target = candidates[Math.floor(rng() * candidates.length)];
      var region2 = regions[target[0]][target[1]];
      regions[r][c] = region2;
      regions[target[0]][target[1]] = region1;
      if (!isRegionConnected(regions, region1, size) || !isRegionConnected(regions, region2, size)) {
        regions[r][c] = region1;
        regions[target[0]][target[1]] = region2;
      }
    }
    return regions;
  }

  function isRegionConnected(regions, regionId, size) {
    var cells = [];
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (regions[r][c] === regionId) cells.push([r, c]);
      }
    }
    if (cells.length === 0) return false;
    var visited = {};
    var queue = [cells[0]];
    visited[cells[0][0] + ',' + cells[0][1]] = true;
    var count = 1;
    var dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    while (queue.length > 0) {
      var cell = queue.shift();
      for (var d = 0; d < dirs.length; d++) {
        var nr = cell[0] + dirs[d][0];
        var nc = cell[1] + dirs[d][1];
        var key = nr + ',' + nc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[key] && regions[nr][nc] === regionId) {
          visited[key] = true;
          queue.push([nr, nc]);
          count++;
        }
      }
    }
    return count === cells.length;
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
    var size = 9;
    var regions = generateRegions(size, rng);
    var solved = Generator.generateSolvedBoard(size, regions, rng);
    var puzzle = Utils.deepCopy(solved);
    var removeCounts = { easy: 30, medium: 36, hard: 42, expert: 48 };
    var toRemove = removeCounts[difficulty] || 36;
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
      mode: 'jigsaw',
      difficulty: difficulty,
      jigsawRegions: regions,
    };
  }

  return {
    generate: generate,
  };
})();
