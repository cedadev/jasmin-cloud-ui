###
Generic utilities to help with component building
###

module.exports =
    # Suppresses the default action for an event before passing it on to the given
    # event hander
    preventDefault: (cb) -> (e) ->
        e.preventDefault()
        cb(e)

    # Combines multiple objects into one
    # The original objects are unchanged
    combine: (xs...) -> xs.reduce(((acc, x) -> acc[k] = v for k,v of x ; acc), {})

    # Splits an object into one containing the given keys and one containing all
    # the other keys
    # The original object is unchanged
    extract: (obj, keys...) ->
        left = {} ; right = {}
        for k, v of obj
            if k in keys
                left[k] = v
            else
                right[k] = v
        [left, right]
