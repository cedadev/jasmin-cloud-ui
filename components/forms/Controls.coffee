###
Module defining form controls for use with fieldsets.
###

m = require 'mithril'
u = require '../Utils'


Input =
    view: (vnode) ->
        [{ current, update }, attrs] = u.extract(vnode.attrs, 'current', 'update')
        m("input.form-control",
            u.combine(attrs, { value: current, oninput: m.withAttr('value', update) })
        )


module.exports = { Input }
