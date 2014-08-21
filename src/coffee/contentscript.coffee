chrome.runtime.onMessage.addListener (req, sender, sendRes) ->
  if req.method is 'getSelection'
  then sendRes data: getSelection().toString()
  else sendRes {}
