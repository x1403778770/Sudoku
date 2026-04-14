window.Storage = (function () {
  var KEYS = {
    SAVES: 'sudoku_saves',
    SETTINGS: 'sudoku_settings',
    STATISTICS: 'sudoku_statistics',
    DAILY: 'sudoku_daily',
  };

  function get(key) {
    try {
      var data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getSaves() {
    return get(KEYS.SAVES) || [];
  }

  function saveGame(gameData) {
    var saves = getSaves();
    var existingIndex = -1;
    for (var i = 0; i < saves.length; i++) {
      if (saves[i].id === gameData.id) {
        existingIndex = i;
        break;
      }
    }
    if (existingIndex >= 0) {
      saves[existingIndex] = gameData;
    } else {
      saves.unshift(gameData);
      if (saves.length > 5) saves = saves.slice(0, 5);
    }
    set(KEYS.SAVES, saves);
  }

  function deleteSave(id) {
    var saves = getSaves();
    saves = saves.filter(function (s) { return s.id !== id; });
    set(KEYS.SAVES, saves);
  }

  function getSettings() {
    return get(KEYS.SETTINGS) || {
      theme: 'auto',
      autoCheck: true,
      highlightDuplicates: true,
      highlightSameNumber: true,
      highlightRelated: true,
      showTimer: true,
      errorLimit: true,
      soundEnabled: true,
      language: 'zh',
    };
  }

  function saveSettings(settings) {
    set(KEYS.SETTINGS, settings);
  }

  function getStatistics() {
    return get(KEYS.STATISTICS) || {};
  }

  function saveStatistics(stats) {
    set(KEYS.STATISTICS, stats);
  }

  function getDailyData() {
    return get(KEYS.DAILY) || {
      streak: 0,
      lastDate: null,
      totalCompleted: 0,
      todayCompleted: false,
    };
  }

  function saveDailyData(data) {
    set(KEYS.DAILY, data);
  }

  return {
    getSaves: getSaves,
    saveGame: saveGame,
    deleteSave: deleteSave,
    getSettings: getSettings,
    saveSettings: saveSettings,
    getStatistics: getStatistics,
    saveStatistics: saveStatistics,
    getDailyData: getDailyData,
    saveDailyData: saveDailyData,
  };
})();
