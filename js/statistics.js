window.Statistics = (function () {
  var Storage = window.Storage;

  function getStats() {
    return Storage.getStatistics();
  }

  function recordWin(mode, difficulty, time, errors, hintsUsed) {
    var stats = getStats();
    if (!stats[mode]) stats[mode] = {};
    if (!stats[mode][difficulty]) {
      stats[mode][difficulty] = {
        played: 0,
        won: 0,
        bestTime: Infinity,
        avgTime: 0,
        totalTime: 0,
      };
    }
    var d = stats[mode][difficulty];
    d.played++;
    d.won++;
    d.totalTime += time;
    d.avgTime = Math.round(d.totalTime / d.won);
    if (time < d.bestTime) d.bestTime = time;
    Storage.saveStatistics(stats);
    return d.bestTime === time;
  }

  function recordLoss(mode, difficulty, time) {
    var stats = getStats();
    if (!stats[mode]) stats[mode] = {};
    if (!stats[mode][difficulty]) {
      stats[mode][difficulty] = {
        played: 0,
        won: 0,
        bestTime: Infinity,
        avgTime: 0,
        totalTime: 0,
      };
    }
    stats[mode][difficulty].played++;
    stats[mode][difficulty].totalTime += time;
    Storage.saveStatistics(stats);
  }

  function getWinRate(mode, difficulty) {
    var stats = getStats();
    if (!stats[mode] || !stats[mode][difficulty]) return 0;
    var d = stats[mode][difficulty];
    return d.played > 0 ? Math.round((d.won / d.played) * 100) : 0;
  }

  function getBestTime(mode, difficulty) {
    var stats = getStats();
    if (!stats[mode] || !stats[mode][difficulty]) return null;
    var bt = stats[mode][difficulty].bestTime;
    return bt === Infinity ? null : bt;
  }

  function getTotalGames() {
    var stats = getStats();
    var total = 0;
    for (var mode in stats) {
      for (var diff in stats[mode]) {
        total += stats[mode][diff].played;
      }
    }
    return total;
  }

  function getTotalWins() {
    var stats = getStats();
    var total = 0;
    for (var mode in stats) {
      for (var diff in stats[mode]) {
        total += stats[mode][diff].won;
      }
    }
    return total;
  }

  return {
    getStats: getStats,
    recordWin: recordWin,
    recordLoss: recordLoss,
    getWinRate: getWinRate,
    getBestTime: getBestTime,
    getTotalGames: getTotalGames,
    getTotalWins: getTotalWins,
  };
})();
