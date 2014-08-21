(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var addMemo, imageMemo, makeDate, selectionMemo, sendObj;

makeDate = require('./modules/make').date;

sendObj = {
  method: "getSelection"
};

selectionMemo = function(info, tab) {
  return chrome.tabs.sendMessage(tab.id, sendObj, function(res) {
    return addMemo(tab, res.data, 'markdown');
  });
};

imageMemo = function(info, tab) {
  return chrome.tabs.sendMessage(tab.id, sendObj, function(res) {
    var makeMd;
    makeMd = "![](" + info.srcUrl + ")\n\n" + res.data;
    return addMemo(tab, makeMd, 'markdown');
  });
};

addMemo = function(tab, memoMain, mode) {
  var memo;
  memo = {
    mode: mode,
    main: memoMain,
    url: tab.url,
    date: makeDate()
  };
  return chrome.storage.local.get(['datas'], function(storageObj) {
    if (chrome.extension.lastError) {
      return alert('不明なエラーが起こりました。');
    } else {
      storageObj.datas.memos.push(memo);
      if (storageObj.datas.setting.pinIdx > -1) {
        storageObj.datas.setting.pinIdx++;
      }
      return chrome.storage.local.set(storageObj, function() {});
    }
  });
};

chrome.runtime.onInstalled.addListener(function() {
  var initObj, k, menu, obj, v, _results;
  initObj = {
    datas: {
      setting: {
        pinIdx: -1
      },
      memos: [],
      options: {
        write: 'normal',
        target: 'self',
        font: null
      }
    }
  };
  menu = {
    selection: {
      title: 'ChoiMemo に新しくメモ',
      onclick: selectionMemo
    },
    image: {
      title: 'ChoiMemo に新しくメモ',
      onclick: imageMemo
    }
  };
  chrome.storage.local.get(['datas'], function(storageObj) {
    if (Object.keys(storageObj).length < 1) {
      return chrome.storage.local.set(initObj, function() {});
    }
  });
  _results = [];
  for (k in menu) {
    v = menu[k];
    obj = {
      title: v.title,
      contexts: [k],
      onclick: v.onclick
    };
    _results.push(chrome.contextMenus.create(obj));
  }
  return _results;
});



},{"./modules/make":2}],2:[function(require,module,exports){
module.exports = {
  date: function() {
    var date, hour, minute, month, year, _date;
    _date = new Date();
    year = _date.getFullYear();
    month = _date.getMonth();
    date = _date.getDate();
    hour = _date.getHours();
    minute = ("0" + _date.getMinutes()).slice(-2);
    return "" + year + "-" + month + "-" + date + " " + hour + ":" + minute;
  },
  clone: function(obj) {
    var flags, key, newInstance;
    if ((obj == null) || (typeof obj !== "object")) {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      flags = "";
      if (obj.global != null) {
        flags += "g";
      }
      if (obj.ignoreCase != null) {
        flags += "i";
      }
      if (obj.multiline != null) {
        flags += "m";
      }
      if (obj.sticky != null) {
        flags += "y";
      }
      return new RegExp(obj.source, flags);
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = this.clone(obj[key]);
    }
    return newInstance;
  }
};



},{}]},{},[1]);