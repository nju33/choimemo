(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
chrome.storage.local.get(['datas'], function(storageObj) {
  var app;
  if (chrome.extension.lastError) {
    return alert('不明なエラーが起こりました。');
  } else {
    return app = new Vue({
      el: '#body',
      data: {
        options: storageObj.datas.options
      },
      methods: {
        update: function(section, val) {
          switch (section) {
            case 'write':
              storageObj.datas.options.write = val;
              break;
            case 'target':
              storageObj.datas.options.target = val;
              break;
            case 'font':
              storageObj.datas.options.font = val;
          }
          return chrome.storage.local.set(storageObj, function() {});
        },
        "delete": function() {
          if (confirm('削除してもよろしいですか？')) {
            storageObj.datas.memos.length = 0;
            return chrome.storage.local.set(storageObj, function() {});
          }
        }
      }
    });
  }
});



},{}]},{},[1]);