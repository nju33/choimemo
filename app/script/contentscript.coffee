chrome.runtime.onMessage.addListener (req, sender, send) ->
  switch req.emit
    when 'choimemo:selection' then console.log 'selection'
    when 'choimemo:image' then console.log 'image'
