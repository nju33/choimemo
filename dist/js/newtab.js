!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b){b.exports={date:function(){var a,b,c,d,e,f;return f=new Date,e=f.getFullYear(),d=f.getMonth(),a=f.getDate(),b=f.getHours(),c=("0"+f.getMinutes()).slice(-2),""+e+"-"+d+"-"+a+" "+b+":"+c},clone:function(a){var b,c,d;if(null==a||"object"!=typeof a)return a;if(a instanceof Date)return new Date(a.getTime());if(a instanceof RegExp)return b="",null!=a.global&&(b+="g"),null!=a.ignoreCase&&(b+="i"),null!=a.multiline&&(b+="m"),null!=a.sticky&&(b+="y"),new RegExp(a.source,b);d=new a.constructor;for(c in a)d[c]=this.clone(a[c]);return d}}},{}],2:[function(a){var b;b=a("./modules/make"),chrome.storage.local.get(["datas"],function(a){var c;return null==chrome.extension.lastError?(Vue.directive("render-memo",function(a){switch(a.mode){case"markdown":return this.el.innerHTML=marked(a.main);case"normal":return this.el.innerText=a.main}}),c=new Vue({el:"#body",data:{bool:{newMemo:!1,hasNew:!1},add:{title:"メモを追加",main:""},loadMemo:10,editIdx:-1,searchText:"",setting:a.datas.setting,datas:a.datas.memos,options:a.datas.options},computed:{reverseDatas:function(){var a;return a=b.clone(this.datas),a.reverse()},setScroll:function(){return this.setting.pinIdx>-1?window.scrollTo(0,document.getElementById("memo-"+this.setting.pinIdx).offsetTop+19):void 0}},methods:{showNewMemo:function(){return this.bool.newMemo=!this.bool.newMemo,this.bool.newMemo?(this.add.title="キャンセル",setTimeout(function(){return document.getElementById("v-add-main").focus()},300)):(this.add.title="メモを追加",document.getElementById("v-add-main").blur(),this.add.main="")},addReset:function(){return setTimeout(function(a){return function(){return document.getElementById("v-add-main").value="",document.getElementById("v-add-main").blur(),a.bool.hasNew=!1}}(this),300)},editMemo:function(b,c){var d;return b===this.editIdx?(d=Math.abs(b-this.datas.length+1),a.datas.memos[d]=c,chrome.storage.local.set(a,function(){}),this.editIdx=-1):this.editIdx>-1?confirm("編集中のメモがあります。破棄しますか？")?(this.editIdx=b,setTimeout(function(){return document.getElementById("edit-"+b).focus()},0)):void 0:(this.editIdx=b,setTimeout(function(){return document.getElementById("edit-"+b).focus()},0))},editMemoSc:function(a,b,c){return 13===a.keyCode&&a.ctrlKey?this.editMemo(b,c):void 0},changeNew:function(a,b){return this.bool.hasNew=""!==b?!0:!1},addMemo:function(c){var d;return""!==c&&(d={mode:this.options.write,main:c,url:"new tab",date:b.date()}),a.datas.memos.push(d),chrome.storage.local.set(a,function(a){return function(){return a.bool.newMemo=!1,a.setting.pinIdx>-1&&a.setting.pinIdx++,a.addReset()}}(this))},addMemoSc:function(a,b){return 13===a.keyCode&&a.ctrlKey&&document.getElementById("v-add-main").value.length>0?this.addMemo(b):void 0},deleteMemo:function(b){return confirm("このメモを削除しますか？")?(a.datas.memos.splice(Math.abs(b-this.datas.length+1),1),chrome.storage.local.set(a,function(){})):void 0},setUrl:function(a){return/^http/.test(a)?a:!1},onPin:function(b){return a.datas.setting.pinIdx=b===this.setting.pinIdx?-1:b,chrome.storage.local.set(a,function(){})}}}),c.setScroll,document.onkeydown=function(a){var b,d;switch(d=document.activeElement.tagName,b="TEXTAREA"!==d&&"INPUT"!==d,a.keyCode){case 27:return c.$options.methods.addReset.call(c),c.$data.bool.newMemo=!1,document.getElementById("v-add-main").blur();case 74:case 83:if(b)return window.scrollTo(0,document.body.scrollTop+50);break;case 75:case 87:if(b)return window.scrollTo(0,document.body.scrollTop-50);break;case 78:if(b)return c.$data.bool.newMemo=!0,setTimeout(function(){return document.getElementById("v-add-main").focus()},300)}}):void 0})},{"./modules/make":1}]},{},[2]);