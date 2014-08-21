chrome.storage.local.get ['datas'], (storageObj) ->
  if chrome.extension.lastError then alert '不明なエラーが起こりました。'
  else
    app = new Vue
      el: '#body'
      data: options: storageObj.datas.options
      methods:
        update: (section, val) ->
          switch section
            when 'write' then storageObj.datas.options.write = val
            when 'target' then storageObj.datas.options.target = val
            when 'font' then storageObj.datas.options.font = val
          chrome.storage.local.set storageObj, () ->

        delete: () ->
          if confirm '削除してもよろしいですか？'
            storageObj.datas.memos.length = 0
            chrome.storage.local.set storageObj, () ->


