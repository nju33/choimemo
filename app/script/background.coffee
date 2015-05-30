runtime = chrome.runtime
menus = P.promisifyAll chrome.contextMenus
tabs = P.promisifyAll chrome.tabs

changeMarkdown = (text) ->
addText = (info, tab) ->
addImage = (info, tab) ->
save = (memo) ->

runtime.onInstalled.addListener ->
  menus.create
    title: 'Choimemo へメモる'
    contexts: ['selection']
    onclick: addText
  menus.create
    title: 'Choimemo へ画像をメモる'
    contexts: ['image']
    onclick: 'addImage'
