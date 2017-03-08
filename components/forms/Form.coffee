###
Module providing utilities for making working with forms easier.
###

m = require 'mithril'
u = require '../Utils'
Modal = require '../modals/Modal'


Field =
    oninit: (vnode) ->
        # Initialise the vnode state
        this.current = vnode.attrs.initial

    view: (vnode) ->
        { name, label, helpText, onchange } = vnode.attrs
        m("div.form-group",
            if label? then m("label.control-label[for='#{name}']", label) else null
            m(".control-container",
                for child in vnode.children
                    child.attrs.name = name
                    child.attrs.current = this.current
                    child.attrs.update = (v) => this.current = v ; onchange?(this.current)
                    child
                if helpText? then m(".help-block", helpText) else null
            )
        )


# Yields each field in the vnode at whatever depth
# It traverses depth first, so fields are yielded in the order they will be rendered
fieldsOf = (vnode) ->
    if vnode.tag is Field
        yield vnode
    else if Array.isArray(vnode.children)
        yield from fieldsOf(child) for child in vnode.children


Base =
    view: (vnode) ->
        # Extract the attributes we need
        [{ disabled = false, onsubmit }, attrs] = u.extract(
            vnode.attrs,
            'disabled',
            'onsubmit'
        )
        # Create a form onsubmit that calls the specified onsubmit with the field data
        if onsubmit?
            attrs.onsubmit = u.preventDefault(=>
                data = {}
                for field from fieldsOf(vnode)
                    data[field.attrs.name] = field.state.current
                onsubmit?(data)
            )
        m("form", attrs,
            m("fieldset#{if disabled then '[disabled]' else ''}", vnode.children)
        )


Form =
    view: (vnode) ->
        # Extract the attributes we need
        [{ horizontal = true, submitText = 'Submit' }, attrs] = u.extract(
            vnode.attrs,
            'horizontal',
            'submitText',
        )
        m(Base, attrs,
            m("div#{if horizontal then '.form-horizontal' else ''}",
                vnode.children,
                m("div.form-group",
                    m(".control-container",
                        m("button.btn.btn-primary[type='submit']", submitText)
                    )
                )
            )
        )


ModalForm =
    view: (vnode) ->
        # Extract the attributes we need
        [{ title, horizontal = true, submitText = 'Submit' }, attrs] = u.extract(
            vnode.attrs,
            'title',
            'horizontal',
            'submitText',
        )
        m(Modal.Base,
            { title: title, dismissable: false },
            m(Base, attrs,
                m(".modal-body",
                    m("div#{if horizontal then '.form-horizontal' else ''}",
                        vnode.children
                    ),
                ),
                m(".modal-footer",
                    m("button.btn.btn-default[type='button']",
                        { onclick: u.preventDefault(Modal.close) },
                        "Cancel"
                    ),
                    m("button.btn.btn-primary[type='submit']", submitText)
                )
            )
        )


module.exports = { Base, ModalForm, Field }
