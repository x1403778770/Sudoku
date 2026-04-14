window.SudokuUtils = (function () {
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function seededRandom(seed) {
    var s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function dateToSeed(date) {
    var d = date || new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  function range(start, end) {
    var arr = [];
    for (var i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  return {
    generateUUID: generateUUID,
    shuffleArray: shuffleArray,
    deepCopy: deepCopy,
    formatTime: formatTime,
    seededRandom: seededRandom,
    dateToSeed: dateToSeed,
    range: range,
    clamp: clamp,
  };
})();
