(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  date: function() {
    var date, hour, minute, month, year, _date;
    _date = new Date();
    year = _date.getFullYear();
    month = _date.getMonth() + 1;
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



},{}],2:[function(require,module,exports){
var make;

make = require('./modules/make');

chrome.storage.local.get(['datas'], function(storageObj) {
  var app, offLightbox, onLightbox;
  if (chrome.extension.lastError == null) {
    Vue.directive('render-memo', function(obj) {
      switch (obj.mode) {
        case 'markdown':
          return this.el.innerHTML = marked(obj.main);
        case 'normal':
          return this.el.innerText = obj.main;
      }
    });
    app = new Vue({
      el: '#body',
      data: {
        bool: {
          newMemo: false,
          hasNew: false,
          hasChecks: false
        },
        add: {
          title: 'メモを追加',
          main: ''
        },
        loadMemo: 10,
        editIdx: -1,
        searchText: '',
        setting: storageObj.datas.setting,
        datas: storageObj.datas.memos,
        checks: [],
        checksSize: 1,
        options: storageObj.datas.options
      },
      computed: {

        /**
         * メモの並びを降順にする
         */
        reverseDatas: function() {
          var copyDatas;
          copyDatas = make.clone(this.datas);
          return copyDatas.reverse();
        },

        /**
         * ページを開いた時、ピン留したメモまでスクロールする
         */
        setScroll: function() {
          var img, imgObj;
          img = document.getElementsByTagName('img');
          if (img.length > 1) {
            imgObj = new Image();
            imgObj.src = img[img.length - 2].src;
            return imgObj.onload = (function(_this) {
              return function() {
                return setTimeout(function() {
                  if (_this.setting.pinIdx > -1) {
                    return window.scrollTo(0, document.getElementById("memo-" + _this.setting.pinIdx).offsetTop + 19);
                  }
                }, 300);
              };
            })(this);
          }
        }
      },
      methods: {
        showNewMemo: function() {
          this.bool.newMemo = !this.bool.newMemo;
          if (this.bool.newMemo) {
            this.add.title = 'キャンセル';
            return setTimeout((function() {
              return document.getElementById('v-add-main').focus();
            }), 300);
          } else {
            this.add.title = 'メモを追加';
            document.getElementById('v-add-main').blur();
            return this.add.main = '';
          }
        },
        addReset: function() {
          return setTimeout((function(_this) {
            return function() {
              var taEl;
              taEl = document.getElementById('v-add-main');
              taEl.value = '';
              taEl.blur();
              return _this.bool.hasNew = false;
            };
          })(this), 300);
        },
        editMemo: function(idx, data) {
          var saveIdx;
          if (idx !== this.editIdx) {
            if (this.editIdx > -1) {
              if (confirm('編集中のメモがあります。破棄しますか？')) {
                this.editIdx = idx;
                return setTimeout(function() {
                  return document.getElementById("edit-" + idx).focus();
                }, 0);
              }
            } else {
              this.editIdx = idx;
              return setTimeout(function() {
                return document.getElementById("edit-" + idx).focus();
              }, 0);
            }
          } else {
            saveIdx = Math.abs(idx - this.datas.length + 1);
            storageObj.datas.memos[saveIdx] = data;
            chrome.storage.local.set(storageObj, function() {});
            return this.editIdx = -1;
          }
        },
        editMemoSc: function(e, idx, obj) {
          if (e.keyCode === 13 && e.ctrlKey) {
            return this.editMemo(idx, obj);
          }
        },
        changeNew: function(e, main) {
          if (main !== '') {
            return this.bool.hasNew = true;
          } else {
            return this.bool.hasNew = false;
          }
        },
        addMemo: function(main) {
          var idx, memo, _i, _len, _ref;
          memo = {};
          if (typeof main === 'string' && main !== '') {
            memo = {
              mode: this.options.write,
              main: main,
              url: 'new tab',
              date: make.date()
            };
          } else if (typeof main === 'object') {
            memo = main;
            _ref = this.checks;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              idx = _ref[_i];
              storageObj.datas.memos.splice(Math.abs(idx - this.datas.length + 1), 1);
              chrome.storage.local.set(storageObj, function() {});
            }
            this.checks.length = 0;
            this.bool.hasChecks = false;
          }
          storageObj.datas.memos.push(memo);
          return chrome.storage.local.set(storageObj, (function(_this) {
            return function() {
              _this.bool.newMemo = false;
              if (_this.setting.pinIdx > -1) {
                _this.setting.pinIdx++;
              }
              return _this.addReset();
            };
          })(this));
        },
        addMemoSc: function(e, main) {
          if (e.keyCode === 13 && e.ctrlKey && document.getElementById('v-add-main').value.length > 0) {
            return this.addMemo(main);
          }
        },
        deleteMemo: function(idx) {
          if (confirm('このメモを削除しますか？')) {
            storageObj.datas.memos.splice(Math.abs(idx - this.datas.length + 1), 1);
            return chrome.storage.local.set(storageObj, function() {});
          }
        },
        pickDomain: function(url) {
          var urlMatch;
          if (url === 'new tab') {
            return url;
          } else {
            urlMatch = url.match(/\/\/(.+?)\/(.*)/);
            if (urlMatch[2] === '') {
              return urlMatch[1];
            } else {
              return "" + urlMatch[1] + "...";
            }
          }
        },
        setUrl: function(url) {
          if (/^http/.test(url)) {
            return url;
          } else {
            return false;
          }
        },
        onPin: function(idx) {
          if (idx === this.setting.pinIdx) {
            storageObj.datas.setting.pinIdx = -1;
          } else {
            storageObj.datas.setting.pinIdx = idx;
          }
          return chrome.storage.local.set(storageObj, function() {});
        },

        /**
         * チェック中のメモがあるか
         * @return {Boolean} あればtrue
         */

        /**
         * チェック済みのメモかどうか判断
         * @param  {number}  idx メモのインデックス
         * @return {Boolean}     checkMemoにメモのインデックスが入っているか
         */
        isCheck: function(idx) {
          if (this.checks.indexOf(idx) > -1) {
            return true;
          } else {
            return false;
          }
        },

        /**
         * `Ctrl` + `Click` 時、メモをチェック用配列へ入れる
         * @param  {object} e   クリックイベント
         * @param  {number} idx 配列へ入れるメモのインデックス
         */
        checkMemo: function(e, idx) {
          var checksIdx;
          if (e.ctrlKey) {
            checksIdx = this.checks.indexOf(idx);
            if (checksIdx > -1) {
              this.checks.splice(checksIdx, 1);
              if (this.checks.length < 1) {
                this.bool.hasChecks = false;
              }
              this.$emit('change checks');
              return this.checks;
            } else {
              if (this.checks.length < 1) {
                this.bool.hasChecks = true;
              }
              this.$emit('change checks');
              return this.checks.push(idx);
            }
          }
        },

        /**
         * チェックされたメモをすべて結合する
         */
        execMarge: function() {
          var i, idx, memo, _i, _len, _ref;
          if (confirm("選択したメモをマージします。\nよろしいですか？\n\n（選択したメモは消去されます）")) {
            memo = {
              mode: null,
              main: '',
              url: 'new tab',
              date: make.date()
            };
            _ref = this.checks;
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              idx = _ref[i];
              if (i === 0) {
                memo.mode = this.reverseDatas[idx].mode;
              }
              memo.main += "" + this.reverseDatas[idx].main + "\n\n";
            }
            return this.addMemo(memo);
          }
        }
      }
    });
    app.setScroll;
    app.$on('change checks', function() {
      return setTimeout(((function(_this) {
        return function() {
          return _this.checksSize = _this.checks.length;
        };
      })(this)), 0);
    });
    document.onkeydown = function(e) {
      var isForm, tag;
      tag = document.activeElement.tagName;
      isForm = tag !== 'TEXTAREA' && tag !== 'INPUT';
      switch (e.keyCode) {
        case 27:
          app.$options.methods.addReset.call(app);
          app.$data.bool.newMemo = false;
          return document.getElementById('v-add-main').blur();
        case 74:
        case 83:
          if (isForm) {
            return window.scrollTo(0, document.body.scrollTop + 50);
          }
          break;
        case 75:
        case 87:
          if (isForm) {
            return window.scrollTo(0, document.body.scrollTop - 50);
          }
          break;
        case 78:
          if (isForm) {
            app.$data.bool.newMemo = true;
            return setTimeout(function() {
              return document.getElementById('v-add-main').focus();
            }, 300);
          }
      }
    };
    onLightbox = function(target) {
      var lightbox, lightboxImg;
      lightbox = document.getElementById('v-lightbox');
      lightbox.style.background = 'rgba(0,0,0,.7)';
      lightbox.style.zIndex = 1000;
      lightbox.style.display = 'block';
      lightboxImg = document.getElementById('v-lightbox-img');
      lightboxImg.src = target.src;
      lightboxImg.style.height = target.height;
      lightboxImg.style.width = target.width;
      lightboxImg.style.maxWidth = '85%';
      return lightboxImg.style.maxHeight = '85%';
    };
    offLightbox = function() {
      var lightbox;
      lightbox = document.getElementById('v-lightbox');
      lightbox.style.zIndex = -1;
      return lightbox.style.display = 'none';
    };
    return document.onclick = function(e) {
      var target;
      target = e.target;
      if (!e.ctrlKey) {
        if (target.tagName === 'IMG') {
          return onLightbox(target);
        } else if (target.id === 'v-lightbox' || target.parentNode.id === 'v-lightbox-close') {
          return offLightbox();
        }
      }
    };
  }
});



},{"./modules/make":1}]},{},[2]);