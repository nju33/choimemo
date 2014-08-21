makeDate = require('./modules/make').date

sendObj = method: "getSelection"

selectionMemo = (info, tab) ->
  chrome.tabs.sendMessage tab.id, sendObj, (res) ->
    addMemo tab, res.data, 'markdown'

imageMemo = (info, tab) ->
  chrome.tabs.sendMessage tab.id, sendObj, (res) ->
    makeMd = """
              ![](#{info.srcUrl})

              #{res.data}
            """

    addMemo tab, makeMd, 'markdown'


addMemo = (tab, memoMain, mode) ->
  memo =
    mode: mode
    main: memoMain
    url: tab.url
    date: makeDate()

  chrome.storage.local.get ['datas'], (storageObj) ->
    if chrome.extension.lastError then alert '不明なエラーが起こりました。'
    else
      storageObj.datas.memos.push memo
      storageObj.datas.setting.pinIdx++ if storageObj.datas.setting.pinIdx > -1
      chrome.storage.local.set storageObj, () ->


chrome.runtime.onInstalled.addListener () ->
  initObj =
    datas:
      setting:
        pinIdx: -1
      memos: []
      options:
        write: 'markdown'
        target: '_self'
        font: null

  menu =
    selection:
      title: 'ChoiMemo に新しくメモ'
      onclick: selectionMemo
    image:
      title: 'ChoiMemo に新しくメモ'
      onclick: imageMemo

  # chrome.storage.local.remove ['datas'], () ->

  chrome.storage.local.get ['datas'], (storageObj) ->
    if Object.keys(storageObj).length < 1
      chrome.storage.local.set initObj, () ->

  for k,v of menu
    obj =
      title: v.title
      contexts: [k]
      onclick: v.onclick
    chrome.contextMenus.create obj
