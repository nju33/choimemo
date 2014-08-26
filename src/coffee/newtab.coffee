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
          hasChecks: false
        add:
          title: 'メモを追加'
          main: ''
        loadMemo: 10
        editIdx: -1
        searchText: ''
        setting: storageObj.datas.setting
        datas: storageObj.datas.memos
        checks: []
        checksSize: 1
        # margeLabels: [
        #     '選択順にメモを'
        #   ]
        options: storageObj.datas.options

      computed:
        ###*
         * メモの並びを降順にする
        ###
        reverseDatas: ->
          copyDatas = make.clone(@datas)
          copyDatas.reverse()

        ###*
         * ページを開いた時、ピン留したメモまでスクロールする
        ###
        setScroll: ->
          img = document.getElementsByTagName('img')
          if img.length > 1
            imgObj = new Image()
            imgObj.src = img[img.length-2].src
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
            taEl = document.getElementById 'v-add-main'
            taEl.value = ''
            taEl.blur()
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
          memo = {}

          if typeof main is 'string' and main isnt ''
            memo =
              mode: @options.write
              main: main
              url: 'new tab'
              date: make.date()

          else if typeof main is 'object'
            memo = main
            count = @checks.length
            for i in [0...count]
              tgtIdx = @checks.shift()
              @checks = @checks.map (idx) -> if idx > tgtIdx then --idx else idx
              storageObj.datas.memos.splice Math.abs(tgtIdx - storageObj.datas.memos.length + 1), 1
            # for idx in @checks
            #   storageObj.datas.memos.splice Math.abs(idx - storageObj.datas.memos.length + 1), 1
            #   @checks
            chrome.storage.local.set storageObj, ->
            @checks.length = 0
            @bool.hasChecks = false

          storageObj.datas.memos.push memo
          chrome.storage.local.set storageObj, () =>
            @bool.newMemo = false
            @setting.pinIdx++ if @setting.pinIdx > -1
            @addReset()

        addMemoSc: (e, main) ->
          @addMemo(main) if e.keyCode is 13 and e.ctrlKey and document.getElementById('v-add-main').value.length > 0

        deleteMemo: (idx) ->
          if confirm 'このメモを削除しますか？'
            storageObj.datas.memos.splice Math.abs(idx - @datas.length + 1), 1
            chrome.storage.local.set storageObj, ->

        pickDomain: (url) ->
          if url is 'new tab'
            url
          else
            urlMatch = url.match /\/\/(.+?)\/(.*)/
            if urlMatch[2] is ''
            then urlMatch[1]
            else "#{urlMatch[1]}..."

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

        ###*
         * チェック中のメモがあるか
         * @return {Boolean} あればtrue
        ###
        # hasChecks: -> if @checks.length > 0 then true else false

        ###*
         * チェック済みのメモかどうか判断
         * @param  {number}  idx メモのインデックス
         * @return {Boolean}     checkMemoにメモのインデックスが入っているか
        ###
        isCheck: (idx) -> if @checks.indexOf(idx) > -1 then true else false

        ###*
         * `Ctrl` + `Click` 時、メモをチェック用配列へ入れる
         * @param  {object} e   クリックイベント
         * @param  {number} idx 配列へ入れるメモのインデックス
        ###
        checkMemo: (e, idx) ->
          if e.ctrlKey
            checksIdx = @checks.indexOf idx
            if checksIdx > -1
              @checks.splice checksIdx, 1
              @bool.hasChecks = false if @checks.length < 1
              @$emit 'change checks'
              @checks
            else
              @bool.hasChecks = true if @checks.length < 1
              @$emit 'change checks'
              @checks.push idx

        ###*
         * チェックされたメモをすべて結合する
        ###
        execMarge: () ->
          if confirm "選択したメモをマージします。\nよろしいですか？\n\n（選択したメモは消去されます）"
            memo =
              mode: null
              main: ''
              url: 'new tab'
              date: make.date()

            for idx, i in @checks
              memo.mode = @reverseDatas[idx].mode if i is 0
              memo.main += "#{@reverseDatas[idx].main}\n\n"

            @addMemo memo

    app.setScroll

    app.$on 'change checks', -> setTimeout (=> @checksSize = @checks.length), 0

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

    onLightbox = (target) ->
      lightbox = document.getElementById 'v-lightbox'
      lightbox.style.background = 'rgba(0,0,0,.7)'
      lightbox.style.zIndex = 1000
      lightbox.style.display = 'block'

      lightboxImg = document.getElementById 'v-lightbox-img'
      lightboxImg.src = target.src
      lightboxImg.style.height = target.height
      lightboxImg.style.width = target.width
      lightboxImg.style.maxWidth = '85%'
      lightboxImg.style.maxHeight = '85%'

    offLightbox = () ->
      lightbox = document.getElementById 'v-lightbox'
      # lightbox.style.background = 'transparent'
      lightbox.style.zIndex = -1
      lightbox.style.display = 'none'

    document.onclick = (e) ->
      target = e.target
      if not e.ctrlKey
        if target.tagName is 'IMG'
          onLightbox target
        else if target.id is 'v-lightbox' or target.parentNode.id is 'v-lightbox-close'
          offLightbox()


