make = require './modules/make'

chrome.storage.local.get ['datas'], (storageObj) ->
  if !chrome.extension.lastError?

    Vue.directive 'render-memo', (obj) ->
      switch obj.mode
        when 'markdown' then @el.innerHTML = marked obj.main
        when 'normal' then @el.innerText = obj.main

    app = new Vue
      el: '#body'
      data:
        bool:
          newMemo: false
          hasNew: false
        add:
          title: 'メモを追加'
          main: ''
        loadMemo: 10
        editIdx: -1
        searchText: ''
        setting: storageObj.datas.setting
        datas: storageObj.datas.memos
        options: storageObj.datas.options

      computed:
        reverseDatas: ->
          copyDatas = make.clone(@datas)
          copyDatas.reverse()
        setScroll: ->
          img = document.getElementsByTagName('img')
          if img
            imgObj = new Image
            imgSrc = img[img.length-1].src
            imgObj.src = imgSrc
            imgObj.onload = =>
              setTimeout =>
                window.scrollTo 0, document.getElementById("memo-#{@setting.pinIdx}").offsetTop + 19 if @setting.pinIdx > -1
              , 300


      methods:
        showNewMemo: ->
          @bool.newMemo = !@bool.newMemo
          if @bool.newMemo
            @add.title = 'キャンセル'
            setTimeout (->
              document.getElementById('v-add-main').focus()
            ), 300
          else
            @add.title = 'メモを追加'
            document.getElementById('v-add-main').blur()
            @add.main = ''

        addReset: () ->
          setTimeout =>
            document.getElementById('v-add-main').value = ''
            document.getElementById('v-add-main').blur()
            @bool.hasNew = false
          , 300

        editMemo: (idx, data) ->
          if idx isnt @editIdx
            if @editIdx > -1
              if confirm '編集中のメモがあります。破棄しますか？'
                @editIdx = idx
                setTimeout ->
                  document.getElementById("edit-#{idx}").focus()
                , 0
            else
              @editIdx = idx
              setTimeout ->
                document.getElementById("edit-#{idx}").focus()
              , 0
          else
            saveIdx = Math.abs idx - @datas.length + 1
            storageObj.datas.memos[saveIdx] = data
            chrome.storage.local.set storageObj, () ->
            @editIdx = -1

        editMemoSc: (e, idx, obj) -> @editMemo idx, obj if e.keyCode is 13 and e.ctrlKey

        changeNew: (e, main) ->
          if main isnt ''
          then @bool.hasNew = true
          else @bool.hasNew = false

        addMemo: (main) ->
          if main isnt ''
            memo =
              mode: @options.write
              main: main
              url: 'new tab'
              date: make.date()

          storageObj.datas.memos.push memo
          chrome.storage.local.set storageObj, () =>
            @bool.newMemo = false
            @setting.pinIdx++ if @setting.pinIdx > -1
            @addReset()

        addMemoSc: (e, main) ->
          @addMemo(main) if e.keyCode is 13 and e.ctrlKey and document.getElementById('v-add-main').value.length > 0

        deleteMemo: (idx) ->
          if confirm('このメモを削除しますか？')
            storageObj.datas.memos.splice Math.abs(idx - @datas.length + 1), 1
            chrome.storage.local.set storageObj, ->

        setUrl: (url) ->
          if /^http/.test(url)
          then url
          else false

        onPin: (idx) ->
          if idx is @setting.pinIdx
            storageObj.datas.setting.pinIdx = -1
          else
            storageObj.datas.setting.pinIdx = idx

          chrome.storage.local.set storageObj, () ->

    app.setScroll

    document.onkeydown = (e) ->
      tag = document.activeElement.tagName
      isForm = tag isnt 'TEXTAREA' and tag isnt 'INPUT'
      switch e.keyCode
        when 27
          app.$options.methods.addReset.call app
          app.$data.bool.newMemo = false
          document.getElementById('v-add-main').blur()
        when 74, 83
          if isForm
            window.scrollTo 0, document.body.scrollTop + 50
        when 75, 87
          if isForm
            window.scrollTo 0, document.body.scrollTop - 50
        when 78
          if isForm
            app.$data.bool.newMemo = true
            setTimeout ->
              document.getElementById('v-add-main').focus()
            , 300
