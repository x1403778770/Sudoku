window.DailyChallenge = (function () {
  var Utils = window.SudokuUtils;
  var Generator = window.SudokuGenerator;
  var KillerGenerator = window.KillerGenerator;
  var Storage = window.Storage;

  function getToday() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function generateDailyPuzzle() {
    var seed = Utils.dateToSeed();
    var rng = Utils.seededRandom(seed);
    var type = seed % 2 === 0 ? 'classic' : 'killer';
    var difficulties = ['easy', 'medium', 'hard'];
    var diffIndex = (seed % 3);
    var difficulty = difficulties[diffIndex];
    var puzzleData;
    if (type === 'classic') {
      puzzleData = Generator.generateClassic(difficulty, rng);
    } else {
      puzzleData = KillerGenerator.generate(difficulty, rng);
    }
    puzzleData.isDaily = true;
    puzzleData.dailyDate = getToday();
    return puzzleData;
  }

  function isDailyCompleted() {
    var data = Storage.getDailyData();
    return data.lastDate === getToday() && data.todayCompleted;
  }

  function markDailyCompleted() {
    var data = Storage.getDailyData();
    var today = getToday();
    if (data.lastDate) {
      var lastParts = data.lastDate.split('-');
      var todayParts = today.split('-');
      var lastDate = new Date(parseInt(lastParts[0]), parseInt(lastParts[1]) - 1, parseInt(lastParts[2]));
      var todayDate = new Date(parseInt(todayParts[0]), parseInt(todayParts[1]) - 1, parseInt(todayParts[2]));
      var diff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        data.streak++;
      } else if (diff > 1) {
        data.streak = 1;
      }
    } else {
      data.streak = 1;
    }
    data.lastDate = today;
    data.todayCompleted = true;
    data.totalCompleted++;
    Storage.saveDailyData(data);
    return data;
  }

  function getDailyData() {
    return Storage.getDailyData();
  }

  return {
    generateDailyPuzzle: generateDailyPuzzle,
    isDailyCompleted: isDailyCompleted,
    markDailyCompleted: markDailyCompleted,
    getDailyData: getDailyData,
    getToday: getToday,
  };
})();
