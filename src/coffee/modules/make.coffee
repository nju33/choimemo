module.exports =
  date: ->
    _date = new Date()
    year = _date.getFullYear()
    month = _date.getMonth() + 1
    date = _date.getDate()
    hour = _date.getHours()
    minute = ("0" + _date.getMinutes()).slice -2

    """#{year}-#{month}-#{date} #{hour}:#{minute}"""

  clone: (obj) ->
    return obj  if !obj? or (typeof obj isnt "object")

    return new Date(obj.getTime()) if obj instanceof Date

    if obj instanceof RegExp
      flags = ""
      flags += "g"  if obj.global?
      flags += "i"  if obj.ignoreCase?
      flags += "m"  if obj.multiline?
      flags += "y"  if obj.sticky?
      return new RegExp(obj.source, flags)

    newInstance = new obj.constructor()

    for key of obj
      newInstance[key] = @clone(obj[key])

    newInstance
