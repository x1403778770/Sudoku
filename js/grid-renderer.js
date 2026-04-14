window.GridRenderer = (function () {
  var Utils = window.SudokuUtils;

  var JIGSAW_COLORS = [
    'rgba(66,133,244,0.15)',
    'rgba(234,67,53,0.15)',
    'rgba(251,188,4,0.15)',
    'rgba(52,168,83,0.15)',
    'rgba(171,71,188,0.15)',
    'rgba(255,112,67,0.15)',
    'rgba(0,172,193,0.15)',
    'rgba(124,179,66,0.15)',
    'rgba(255,167,38,0.15)',
  ];

  function getKillerCageMap(game) {
    var map = {};
    if (!game.killerCages) return map;
    for (var i = 0; i < game.killerCages.length; i++) {
      var cage = game.killerCages[i];
      var cells = cage.cells;
      var minR = cells[0][0], minC = cells[0][1];
      for (var j = 1; j < cells.length; j++) {
        if (cells[j][0] < minR || (cells[j][0] === minR && cells[j][1] < minC)) {
          minR = cells[j][0];
          minC = cells[j][1];
        }
      }
      for (var k = 0; k < cells.length; k++) {
        var key = cells[k][0] + ',' + cells[k][1];
        map[key] = { cageIndex: i, sum: cage.sum, isFirst: cells[k][0] === minR && cells[k][1] === minC, cells: cells };
      }
    }
    return map;
  }

  function renderGrid(container, game, settings) {
    if (game.mode === 'circular') {
      renderCircularGrid(container, game, settings);
      return;
    }
    var size = game.size;
    var cageMap = getKillerCageMap(game);
    var html = '<div class="sudoku-grid" data-size="' + size + '">';
    html += '<table class="grid-table" cellpadding="0" cellspacing="0">';
    for (var r = 0; r < size; r++) {
      html += '<tr>';
      for (var c = 0; c < size; c++) {
        var classes = getCellClasses(r, c, size, game, settings);
        var styles = getCellStyles(r, c, size, game, cageMap);
        var content = getCellContent(r, c, game, cageMap);
        html += '<td class="' + classes.join(' ') + '" style="' + styles + '" data-row="' + r + '" data-col="' + c + '">';
        html += content;
        html += '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    html += '</div>';
    container.innerHTML = html;
  }

  function getCellClasses(row, col, size, game, settings) {
    var classes = ['grid-cell'];
    if (game.puzzle[row][col] !== 0) {
      classes.push('given');
    } else if (game.playerBoard[row][col] !== 0) {
      classes.push('player');
      if (settings && settings.autoCheck) {
        if (game.playerBoard[row][col] !== game.solution[row][col]) {
          classes.push('error');
        }
      }
    }
    if (game.selectedCell && game.selectedCell.row === row && game.selectedCell.col === col) {
      classes.push('selected');
    }
    if (game.selectedCell) {
      var related = GameEngine.getRelatedCells(game.selectedCell.row, game.selectedCell.col);
      for (var i = 0; i < related.length; i++) {
        if (related[i][0] === row && related[i][1] === col) {
          classes.push('related');
          break;
        }
      }
      if (settings && settings.highlightSameNumber && game.playerBoard[game.selectedCell.row][game.selectedCell.col] !== 0) {
        var selNum = game.playerBoard[game.selectedCell.row][game.selectedCell.col];
        if (game.playerBoard[row][col] === selNum && !(row === game.selectedCell.row && col === game.selectedCell.col)) {
          classes.push('same-number');
        }
      }
    }
    if (settings && settings.highlightDuplicates) {
      var conflicts = GameEngine.getConflictsForCell(row, col);
      if (conflicts.length > 0 && game.playerBoard[row][col] !== 0) {
        classes.push('duplicate');
      }
    }
    if (!game.jigsawRegions) {
      var boxSize = size === 9 ? 3 : size === 6 ? 3 : size === 4 ? 2 : size === 16 ? 4 : 3;
      var boxH = size === 6 ? 2 : boxSize;
      var boxW = size === 6 ? 3 : boxSize;
      if (col % boxW === 0 && col > 0) classes.push('box-left');
      if (row % boxH === 0 && row > 0) classes.push('box-top');
    }
    return classes;
  }

  function getCellStyles(row, col, size, game, cageMap) {
    var styles = '';
    if (game.jigsawRegions) {
      var regionId = game.jigsawRegions[row][col];
      styles += 'background-color:' + JIGSAW_COLORS[regionId % JIGSAW_COLORS.length] + ';';
      if (col > 0 && game.jigsawRegions[row][col - 1] !== regionId) {
        styles += 'border-left:2px solid var(--grid-thick);';
      }
      if (row > 0 && game.jigsawRegions[row - 1][col] !== regionId) {
        styles += 'border-top:2px solid var(--grid-thick);';
      }
    }
    if (game.killerCages) {
      var key = row + ',' + col;
      var cageInfo = cageMap[key];
      if (cageInfo) {
        var cageCells = cageInfo.cells;
        var hasTop = false, hasBottom = false, hasLeft = false, hasRight = false;
        for (var i = 0; i < cageCells.length; i++) {
          if (cageCells[i][0] === row - 1 && cageCells[i][1] === col) hasTop = true;
          if (cageCells[i][0] === row + 1 && cageCells[i][1] === col) hasBottom = true;
          if (cageCells[i][0] === row && cageCells[i][1] === col - 1) hasLeft = true;
          if (cageCells[i][0] === row && cageCells[i][1] === col + 1) hasRight = true;
        }
        if (!hasTop) styles += 'border-top:2px solid var(--accent);';
        if (!hasBottom) styles += 'border-bottom:2px solid var(--accent);';
        if (!hasLeft) styles += 'border-left:2px solid var(--accent);';
        if (!hasRight) styles += 'border-right:2px solid var(--accent);';
      }
    }
    return styles;
  }

  function getCellContent(row, col, game, cageMap) {
    var html = '';
    if (game.killerCages) {
      var key = row + ',' + col;
      var cageInfo = cageMap[key];
      if (cageInfo && cageInfo.isFirst) {
        html += '<span class="killer-sum">' + cageInfo.sum + '</span>';
      }
    }
    var value = game.playerBoard[row][col];
    if (value !== 0) {
      var displayValue = game.size === 16 && value > 9 ? String.fromCharCode(55 + value) : value;
      html += '<span class="cell-value">' + displayValue + '</span>';
      return html;
    }
    var note = null;
    for (var i = 0; i < game.notes.length; i++) {
      if (game.notes[i].row === row && game.notes[i].col === col) {
        note = game.notes[i];
        break;
      }
    }
    if (note && note.values.length > 0) {
      var maxNum = game.size === 16 ? 16 : game.size === 6 ? 6 : game.size === 4 ? 4 : 9;
      html += '<div class="cell-notes">';
      for (var n = 1; n <= maxNum; n++) {
        var displayN = game.size === 16 && n > 9 ? String.fromCharCode(55 + n) : n;
        if (note.values.indexOf(n) >= 0) {
          html += '<span class="note-num">' + displayN + '</span>';
        } else {
          html += '<span class="note-num empty"></span>';
        }
      }
      html += '</div>';
      return html;
    }
    return html;
  }

  var _circularClickHandler = null;

  function renderCircularGrid(container, game, settings) {
    container.innerHTML = '';
    if (_circularClickHandler) {
      container.removeEventListener('click', _circularClickHandler);
      _circularClickHandler = null;
    }
    var canvas = document.createElement('canvas');
    canvas.className = 'circular-canvas';
    var containerSize = Math.min(container.clientWidth, container.clientHeight) - 20;
    if (containerSize < 200) containerSize = 300;
    canvas.width = containerSize;
    canvas.height = containerSize;
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var cx = containerSize / 2;
    var cy = containerSize / 2;
    var maxRadius = containerSize / 2 - 10;
    var ringWidth = maxRadius / game.size;
    var segAngle = (2 * Math.PI) / game.segments;
    for (var ring = 0; ring < game.size; ring++) {
      for (var seg = 0; seg < game.segments; seg++) {
        var startAngle = seg * segAngle - Math.PI / 2;
        var endAngle = (seg + 1) * segAngle - Math.PI / 2;
        var outerR = maxRadius - ring * ringWidth;
        var innerR = maxRadius - (ring + 1) * ringWidth;
        var isSelected = game.selectedCell && game.selectedCell.row === ring && game.selectedCell.col === seg;
        var isRelated = false;
        if (game.selectedCell) {
          if (game.selectedCell.row === ring || game.selectedCell.col === seg) {
            if (!(game.selectedCell.row === ring && game.selectedCell.col === seg)) {
              isRelated = true;
            }
          }
        }
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        ctx.closePath();
        if (isSelected) {
          ctx.fillStyle = '#BBDEFB';
        } else if (isRelated) {
          ctx.fillStyle = '#E3F2FD';
        } else {
          ctx.fillStyle = (ring + seg) % 2 === 0 ? '#FFFFFF' : '#F0F0F0';
        }
        ctx.fill();
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.stroke();
        var value = game.playerBoard[ring][seg];
        if (value !== 0) {
          var midAngle = (startAngle + endAngle) / 2;
          var midR = (outerR + innerR) / 2;
          var tx = cx + midR * Math.cos(midAngle);
          var ty = cy + midR * Math.sin(midAngle);
          ctx.fillStyle = game.puzzle[ring][seg] !== 0 ? '#1A1A2E' : '#4A6FA5';
          if (settings && settings.autoCheck && game.puzzle[ring][seg] === 0 && value !== game.solution[ring][seg]) {
            ctx.fillStyle = '#E74C3C';
          }
          ctx.font = 'bold ' + Math.max(12, ringWidth * 0.5) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(value.toString(), tx, ty);
        }
      }
    }
    _circularClickHandler = function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left - cx;
      var y = e.clientY - rect.top - cy;
      var dist = Math.sqrt(x * x + y * y);
      var angle = Math.atan2(y, x) + Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;
      var ring = Math.floor((maxRadius - dist) / ringWidth);
      var seg = Math.floor(angle / segAngle);
      if (ring >= 0 && ring < game.size && seg >= 0 && seg < game.segments) {
        GameEngine.selectCell(ring, seg);
      }
    };
    container.addEventListener('click', _circularClickHandler);
  }

  function renderNumberPad(container, game) {
    var maxNum = game.mode === 'circular' ? 10 : (game.size === 16 ? 16 : game.size === 6 ? 6 : game.size === 4 ? 4 : 9);
    var cols = maxNum <= 9 ? 9 : (maxNum <= 10 ? 10 : 8);
    var html = '<div class="number-pad" style="grid-template-columns:repeat(' + cols + ',1fr);">';
    var startNum = game.mode === 'circular' ? 1 : 1;
    for (var i = startNum; i <= maxNum; i++) {
      var display = game.size === 16 && i > 9 ? String.fromCharCode(55 + i) : i;
      var count = GameEngine.getCellsWithNumber(i).length;
      var maxCount = game.mode === 'circular' ? 5 : game.size;
      var disabled = count >= maxCount ? ' disabled' : '';
      html += '<button class="num-btn' + disabled + '" data-num="' + i + '">' + display + '</button>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  function renderToolbar(container, game) {
    var noteActive = game.noteMode ? ' active' : '';
    var html = '<div class="game-toolbar">';
    html += '<button class="tool-btn" id="btn-undo" title="撤销"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg><span>撤销</span></button>';
    html += '<button class="tool-btn" id="btn-redo" title="重做"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg><span>重做</span></button>';
    html += '<button class="tool-btn" id="btn-erase" title="擦除"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.78-.78 2.05 0 2.83l3.85 3.85c.39.39.9.59 1.41.59h7.59c.53 0 1.04-.21 1.41-.59l5.56-5.56c.78-.78.78-2.05 0-2.83L16.55 3.59C16.16 3.2 15.65 3 15.14 3zM6.84 20l-3.85-3.85 8.29-8.29L15.14 4l5.56 5.56L13.27 17h-6.43z"/></svg><span>擦除</span></button>';
    html += '<button class="tool-btn' + noteActive + '" id="btn-notes" title="笔记"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg><span>笔记</span></button>';
    html += '<button class="tool-btn" id="btn-hint" title="提示(' + (game.maxHints - game.hintsUsed) + ')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg><span>提示</span></button>';
    html += '</div>';
    container.innerHTML = html;
  }

  return {
    renderGrid: renderGrid,
    renderNumberPad: renderNumberPad,
    renderToolbar: renderToolbar,
    renderCircularGrid: renderCircularGrid,
  };
})();
